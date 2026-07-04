console.log("Reddit Content Deleter background.js loaded");

let isDeleting = false;
let deleteCount = 0;
let activeRedditTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startDeletion") {
        isDeleting = true;
        deleteCount = 0;

        // Check if there's already a Reddit tab open
        chrome.tabs.query({ url: "*://*.reddit.com/*" }, (tabs) => {
            if (tabs.length > 0) {
                // Use existing tab
                const redditTab = tabs[0];
                activeRedditTabId = redditTab.id;
                chrome.tabs.update(redditTab.id, { active: true }, () => {
                    // Wait a moment, then inject and run the script
                    setTimeout(() => {
                        chrome.tabs.sendMessage(
                            redditTab.id,
                            { action: "beginDeletion" },
                            (response) => {
                                if (chrome.runtime.lastError) {
                                    console.log(
                                        "Error:",
                                        chrome.runtime.lastError.message,
                                    );
                                    // Try reloading the tab and starting again
                                    chrome.tabs.reload(redditTab.id, () => {
                                        setTimeout(() => {
                                            chrome.tabs.sendMessage(
                                                redditTab.id,
                                                {
                                                    action: "beginDeletion",
                                                },
                                            );
                                        }, 2000);
                                    });
                                }
                            },
                        );
                    }, 500);
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
