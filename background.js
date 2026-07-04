console.log("Reddit Content Deleter background.js loaded");

let isDeleting = false;
let deleteCount = 0;
let activeRedditTabId = null;

const START_RETRY_DELAY_MS = 800;
const MAX_START_RETRIES = 8;

function publishStatus(status) {
    chrome.runtime.sendMessage({ action: "statusUpdate", status });
}

function beginDeletionWithRetry(tabId, retriesLeft = MAX_START_RETRIES) {
    chrome.tabs.sendMessage(tabId, { action: "beginDeletion" }, (response) => {
        if (chrome.runtime.lastError) {
            if (retriesLeft > 0) {
                setTimeout(() => {
                    beginDeletionWithRetry(tabId, retriesLeft - 1);
                }, START_RETRY_DELAY_MS);
                return;
            }

            console.log(
                "Start message error:",
                chrome.runtime.lastError.message,
            );
            isDeleting = false;
            publishStatus("Could not start. Refresh Reddit and try again.");
            return;
        }

        if (response && response.success === false) {
            if (response.error === "Already running") {
                publishStatus("Deletion in progress...");
            }
            return;
        }

        publishStatus("Deletion in progress...");
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startDeletion") {
        isDeleting = true;
        deleteCount = 0;
        publishStatus("Preparing Reddit page...");

        // Check if there's already a Reddit tab open
        chrome.tabs.query({ url: "*://*.reddit.com/*" }, (tabs) => {
            if (tabs.length > 0) {
                // Use existing tab
                const redditTab = tabs[0];
                activeRedditTabId = redditTab.id;
                chrome.tabs.update(redditTab.id, { active: true }, () => {
                    beginDeletionWithRetry(redditTab.id);
                    sendResponse({
                        success: true,
                        tabId: redditTab.id,
                        existing: true,
                    });
                });
            } else {
                // Create new tab
                chrome.tabs.create(
                    { url: "https://old.reddit.com/user/me/overview/" },
                    (tab) => {
                        activeRedditTabId = tab.id;
                        publishStatus("Opening Reddit...");
                        beginDeletionWithRetry(tab.id);
                        sendResponse({
                            success: true,
                            tabId: tab.id,
                            existing: false,
                        });
                    },
                );
            }
        });
        return true;
    }

    if (request.action === "stopDeletion") {
        isDeleting = false;
        publishStatus("Deletion stopped");
        const stopResponse = { success: true, stopped: true };

        if (activeRedditTabId) {
            chrome.tabs.sendMessage(
                activeRedditTabId,
                { action: "stopDeletion" },
                () => {
                    if (chrome.runtime.lastError) {
                        console.log(
                            "Stop message error:",
                            chrome.runtime.lastError.message,
                        );
                    }
                    sendResponse(stopResponse);
                },
            );
            return true;
        }

        // Fallback: try to find an open Reddit tab if no active tab was tracked.
        chrome.tabs.query({ url: "*://*.reddit.com/*" }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "stopDeletion" },
                    () => {
                        if (chrome.runtime.lastError) {
                            console.log(
                                "Stop message error:",
                                chrome.runtime.lastError.message,
                            );
                        }
                        sendResponse(stopResponse);
                    },
                );
            } else {
                sendResponse(stopResponse);
            }
        });

        return true;
    }

    if (request.action === "getStatus") {
        sendResponse({ isDeleting, deleteCount });
    }

    if (request.action === "incrementCount") {
        deleteCount++;
        chrome.runtime.sendMessage({
            action: "updateCount",
            count: deleteCount,
        });
    }

    return true;
});
