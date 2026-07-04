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
                    statusText.textContent = "Preparing Reddit page...";
                } else {
                    statusText.textContent = "Opening Reddit...";
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
        if (request.action === "statusUpdate") {
            statusText.textContent = request.status;
        }
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
