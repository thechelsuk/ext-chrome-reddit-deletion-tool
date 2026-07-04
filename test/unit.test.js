// test/unit.test.js
describe("popup UI behavior", () => {
    function buildPopupDom() {
        document.body.innerHTML = `
            <button id="startBtn" style="display: block">Start</button>
            <button id="stopBtn" style="display: none">Stop</button>
            <div id="statusText">Ready</div>
            <span id="deleteCount">0</span>
        `;
    }

    function setupChromeMock({
        statusResponse = { isDeleting: false, deleteCount: 0 },
        startResponse = { success: true, existing: true, tabId: 101 },
        stopResponse = { success: true },
    } = {}) {
        const onMessageListeners = [];

        global.chrome = {
            runtime: {
                sendMessage: jest.fn((message, callback) => {
                    if (!callback) {
                        return;
                    }

                    if (message.action === "getStatus") {
                        callback(statusResponse);
                        return;
                    }

                    if (message.action === "startDeletion") {
                        callback(startResponse);
                        return;
                    }

                    if (message.action === "stopDeletion") {
                        callback(stopResponse);
                    }
                }),
                onMessage: {
                    addListener: jest.fn((listener) => {
                        onMessageListeners.push(listener);
                    }),
                },
            },
            tabs: {
                sendMessage: jest.fn(),
            },
        };

        return { onMessageListeners };
    }

    function loadPopupScript() {
        jest.resetModules();
        require("../popup.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));
    }

    beforeEach(() => {
        jest.useFakeTimers();
        buildPopupDom();
    });

    afterEach(() => {
        jest.useRealTimers();
        delete global.chrome;
    });

    test("requests status on load and restores deleting state", () => {
        setupChromeMock({
            statusResponse: { isDeleting: true, deleteCount: 7 },
        });

        loadPopupScript();

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const statusText = document.getElementById("statusText");
        const deleteCount = document.getElementById("deleteCount");

        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            { action: "getStatus" },
            expect.any(Function),
        );
        expect(startBtn.style.display).toBe("none");
        expect(stopBtn.style.display).toBe("block");
        expect(statusText.textContent).toBe("Deletion in progress...");
        expect(deleteCount.textContent).toBe("7");
    });

    test("starts deletion immediately when an existing reddit tab is used", () => {
        setupChromeMock({
            startResponse: { success: true, existing: true, tabId: 55 },
        });

        loadPopupScript();

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const statusText = document.getElementById("statusText");

        startBtn.click();

        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            { action: "startDeletion" },
            expect.any(Function),
        );
        expect(startBtn.style.display).toBe("none");
        expect(stopBtn.style.display).toBe("block");
        expect(statusText.textContent).toBe("Preparing Reddit page...");
        expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    test("starts deletion after opening a new tab and waiting", () => {
        setupChromeMock({
            startResponse: { success: true, existing: false, tabId: 42 },
        });

        loadPopupScript();

        const startBtn = document.getElementById("startBtn");
        const statusText = document.getElementById("statusText");

        startBtn.click();
        expect(statusText.textContent).toBe("Opening Reddit...");
        expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    test("stop button sends stop action and updates UI", () => {
        setupChromeMock();
        loadPopupScript();

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const statusText = document.getElementById("statusText");

        stopBtn.click();

        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            { action: "stopDeletion" },
            expect.any(Function),
        );
        expect(startBtn.style.display).toBe("block");
        expect(stopBtn.style.display).toBe("none");
        expect(statusText.textContent).toBe("Deletion stopped");
    });

    test("handles runtime count updates and completion messages", () => {
        const { onMessageListeners } = setupChromeMock();
        loadPopupScript();

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const statusText = document.getElementById("statusText");
        const deleteCount = document.getElementById("deleteCount");

        const listener = onMessageListeners[0];
        listener({ action: "updateCount", count: 12 });

        expect(deleteCount.textContent).toBe("12");

        listener({ action: "deletionComplete", count: 13 });

        expect(startBtn.style.display).toBe("block");
        expect(stopBtn.style.display).toBe("none");
        expect(statusText.textContent).toBe("Deletion complete!");
        expect(deleteCount.textContent).toBe("13");
    });

    test("applies statusUpdate messages from background", () => {
        const { onMessageListeners } = setupChromeMock();
        loadPopupScript();

        const statusText = document.getElementById("statusText");
        const listener = onMessageListeners[0];

        listener({
            action: "statusUpdate",
            status: "Preparing Reddit page...",
        });

        expect(statusText.textContent).toBe("Preparing Reddit page...");
    });
});

describe("background message routing", () => {
    let onMessageListener;

    function loadBackgroundWithChromeMock() {
        global.chrome = {
            runtime: {
                lastError: null,
                onMessage: {
                    addListener: jest.fn((listener) => {
                        onMessageListener = listener;
                    }),
                },
                sendMessage: jest.fn(),
            },
            tabs: {
                query: jest.fn(),
                update: jest.fn(),
                create: jest.fn(),
                sendMessage: jest.fn(),
                reload: jest.fn(),
            },
        };

        jest.resetModules();
        require("../background.js");
    }

    afterEach(() => {
        jest.useRealTimers();
        delete global.chrome;
        onMessageListener = null;
    });

    test("stopDeletion forwards to tracked active reddit tab", () => {
        loadBackgroundWithChromeMock();

        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([{ id: 321 }]);
        });
        chrome.tabs.update.mockImplementation(
            (tabId, updateProps, callback) => {
                callback();
            },
        );
        chrome.tabs.sendMessage.mockImplementation(
            (tabId, message, callback) => {
                if (message.action === "beginDeletion") {
                    callback({ success: true });
                    return;
                }
                callback({ success: true });
            },
        );

        const startResponse = jest.fn();
        onMessageListener({ action: "startDeletion" }, {}, startResponse);

        const stopResponse = jest.fn();
        onMessageListener({ action: "stopDeletion" }, {}, stopResponse);

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            321,
            { action: "stopDeletion" },
            expect.any(Function),
        );
        expect(stopResponse).toHaveBeenCalledWith({
            success: true,
            stopped: true,
        });
    });

    test("stopDeletion falls back to querying reddit tabs when no tracked tab exists", () => {
        loadBackgroundWithChromeMock();

        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([{ id: 999 }]);
        });
        chrome.tabs.sendMessage.mockImplementation(
            (tabId, message, callback) => {
                callback({ success: true });
            },
        );

        const stopResponse = jest.fn();
        onMessageListener({ action: "stopDeletion" }, {}, stopResponse);

        expect(chrome.tabs.query).toHaveBeenCalledWith(
            { url: "*://*.reddit.com/*" },
            expect.any(Function),
        );
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            999,
            { action: "stopDeletion" },
            expect.any(Function),
        );
        expect(stopResponse).toHaveBeenCalledWith({
            success: true,
            stopped: true,
        });
    });

    test("startDeletion opens overview page when no reddit tab exists", () => {
        loadBackgroundWithChromeMock();

        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([]);
        });
        chrome.tabs.create.mockImplementation((createProps, callback) => {
            callback({ id: 808 });
        });

        const startResponse = jest.fn();
        onMessageListener({ action: "startDeletion" }, {}, startResponse);

        expect(chrome.tabs.create).toHaveBeenCalledWith(
            { url: "https://old.reddit.com/user/me/overview/" },
            expect.any(Function),
        );
        expect(startResponse).toHaveBeenCalledWith({
            success: true,
            tabId: 808,
            existing: false,
        });
    });

    test("startDeletion retries beginDeletion until receiver is ready", () => {
        jest.useFakeTimers();
        loadBackgroundWithChromeMock();

        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([{ id: 321 }]);
        });
        chrome.tabs.update.mockImplementation(
            (tabId, updateProps, callback) => {
                callback();
            },
        );

        let attempts = 0;
        chrome.tabs.sendMessage.mockImplementation(
            (tabId, message, callback) => {
                if (message.action !== "beginDeletion") {
                    callback({ success: true });
                    return;
                }

                attempts++;
                if (attempts === 1) {
                    chrome.runtime.lastError = {
                        message:
                            "Could not establish connection. Receiving end does not exist.",
                    };
                    callback();
                    chrome.runtime.lastError = null;
                    return;
                }

                callback({ success: true });
            },
        );

        const startResponse = jest.fn();
        onMessageListener({ action: "startDeletion" }, {}, startResponse);

        expect(attempts).toBe(1);
        jest.advanceTimersByTime(800);
        expect(attempts).toBe(2);
        expect(startResponse).toHaveBeenCalledWith({
            success: true,
            tabId: 321,
            existing: true,
        });
    });
});
