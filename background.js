console.log("Reddit Comment Deleter background.js loaded");

let isDeleting = false;
let deleteCount = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startDeletion") {
        isDeleting = true;
        deleteCount = 0;

        // Check if there's already a Reddit tab open
        chrome.tabs.query({ url: "*://*.reddit.com/*" }, (tabs) => {
            if (tabs.length > 0) {
                // Use existing tab
                const redditTab = tabs[0];
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
                                        chrome.runtime.lastError.message
                                    );
                                    // Try reloading the tab and starting again
                                    chrome.tabs.reload(redditTab.id, () => {
                                        setTimeout(() => {
                                            chrome.tabs.sendMessage(
                                                redditTab.id,
                                                {
                                                    action: "beginDeletion",
                                                }
                                            );
                                        }, 2000);
                                    });
                                }
                            }
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
                    { url: "https://old.reddit.com/user/me/comments/" },
                    (tab) => {
                        sendResponse({
                            success: true,
                            tabId: tab.id,
                            existing: false,
                        });
                    }
                );
            }
        });
        return true;
    }

    if (request.action === "stopDeletion") {
        isDeleting = false;
        sendResponse({ success: true, stopped: true });
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
