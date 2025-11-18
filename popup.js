document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const statusText = document.getElementById("statusText");
    const deleteCount = document.getElementById("deleteCount");

    // Check current status
    chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
        if (response && response.isDeleting) {
            startBtn.style.display = "none";
            stopBtn.style.display = "block";
            statusText.textContent = "Deletion in progress...";
            deleteCount.textContent = response.deleteCount;
        }
    });

    startBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "startDeletion" }, (response) => {
            if (response && response.success) {
                startBtn.style.display = "none";
                stopBtn.style.display = "block";

                if (response.existing) {
                    // Already on Reddit, deletion started
                    statusText.textContent = "Deletion in progress...";
                } else {
                    // New tab opened, wait for it to load
                    statusText.textContent = "Opening Reddit...";
                    setTimeout(() => {
                        chrome.tabs.sendMessage(response.tabId, {
                            action: "beginDeletion",
                        });
                        statusText.textContent = "Deletion in progress...";
                    }, 3000);
                }
            }
        });
    });

    stopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "stopDeletion" }, () => {
            startBtn.style.display = "block";
            stopBtn.style.display = "none";
            statusText.textContent = "Deletion stopped";
        });
    });

    // Listen for count updates
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "updateCount") {
            deleteCount.textContent = request.count;
        }
        if (request.action === "deletionComplete") {
            startBtn.style.display = "block";
            stopBtn.style.display = "none";
            statusText.textContent = "Deletion complete!";
            deleteCount.textContent = request.count;
        }
    });
});
