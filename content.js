console.log("Reddit Comment Deleter content.js loaded");

let isRunning = false;
let deletedCount = 0;

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clickLinkSafely(link) {
    if (!link) {
        return false;
    }

    const href = (link.getAttribute("href") || "").trim().toLowerCase();
    if (!href.startsWith("javascript:")) {
        link.click();
        return true;
    }

    // Prevent javascript: URL default navigation while still triggering Reddit handlers.
    link.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
        },
        { capture: true, once: true },
    );

    const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    link.dispatchEvent(clickEvent);
    return true;
}

// Check if we should auto-start on page load (for pagination)
function checkAutoStart() {
    const shouldAutoStart = sessionStorage.getItem("redditDeleterAutoStart");
    if (shouldAutoStart === "true") {
        console.log("Auto-starting deletion on new page...");
        setTimeout(() => {
            startDeletionProcess();
        }, 1000);
    }
}

// Test function to check if we can find buttons
function testSelectors() {
    const allForms = document.querySelectorAll("form.del-button");
    console.log("Found delete forms:", allForms.length);

    const deleteLinks = document.querySelectorAll(
        'form.del-button a[data-event-action="delete"]',
    );
    console.log("Found delete links:", deleteLinks.length);

    if (deleteLinks.length > 0) {
        console.log("First delete link:", deleteLinks[0]);
    }
}

// Run test after page loads
setTimeout(testSelectors, 2000);

// Check for auto-start
checkAutoStart();

async function deleteNextComment() {
    // Find the first delete button (old Reddit format) - simplified selector
    const deleteLink = document.querySelector(
        'form.del-button a[data-event-action="delete"]',
    );

    if (!deleteLink) {
        console.log("No more delete buttons found");
        return false;
    }

    console.log("Found delete button, clicking...");
    // Click delete link to show confirmation
    clickLinkSafely(deleteLink);
    await sleep(300);

    // Find and click the "yes" confirmation link - try simpler selector first
    let confirmLink = deleteLink.closest("form").querySelector("a.yes");

    // If not found, wait a bit more for the animation
    if (!confirmLink) {
        await sleep(200);
        confirmLink = deleteLink.closest("form").querySelector("a.yes");
    }

    if (confirmLink) {
        console.log("Found confirmation link, clicking yes...");
        clickLinkSafely(confirmLink);
        deletedCount++;
        chrome.runtime.sendMessage({ action: "incrementCount" });
        await sleep(400); // Wait for deletion to complete
        return true;
    }

    console.log("Confirmation link not found");
    return false;
}

async function startDeletionProcess() {
    isRunning = true;

    while (isRunning) {
        const deleted = await deleteNextComment();

        if (!deleted) {
            // No delete button found, check if there's a next page
            const nextButton = document.querySelector("span.next-button a");

            if (nextButton) {
                console.log(
                    "No more comments on this page, navigating to next page...",
                );

                // Set flag to auto-start on next page
                sessionStorage.setItem("redditDeleterAutoStart", "true");

                const nextUrl = nextButton.href;
                console.log("Next page URL:", nextUrl);

                // Navigate to next page
                window.location.href = nextUrl;

                // Wait for navigation and page load
                await sleep(2000);

                // After navigation, the script will restart from the new page
                // So we exit this loop
                return;
            }

            // Try scrolling down to load more comments
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(1000);

            // Check again after scrolling
            const hasMoreComments = document.querySelector(
                'form.del-button a[data-event-action="delete"]',
            );

            if (!hasMoreComments) {
                console.log("Deletion complete! Total deleted:", deletedCount);
                isRunning = false;
                sessionStorage.removeItem("redditDeleterAutoStart"); // Clear auto-start flag
                chrome.runtime.sendMessage({
                    action: "deletionComplete",
                    count: deletedCount,
                });
                break;
            }
        }

        // Add a delay between deletions to avoid rate limiting
        await sleep(500);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received message:", request);
    if (request.action === "beginDeletion") {
        if (!isRunning) {
            console.log("Starting deletion process...");
            sessionStorage.setItem("redditDeleterAutoStart", "true"); // Enable auto-start for pagination
            startDeletionProcess();
            sendResponse({ success: true });
        } else {
            console.log("Already running");
            sendResponse({ success: false, error: "Already running" });
        }
    }

    if (request.action === "stopDeletion") {
        console.log("Stopping deletion...");
        isRunning = false;
        sessionStorage.removeItem("redditDeleterAutoStart"); // Clear auto-start flag
        sendResponse({ success: true, count: deletedCount });
    }

    return true;
});
