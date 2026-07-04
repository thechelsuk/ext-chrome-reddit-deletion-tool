// background.ext.js
// Chrome extension logic for RedemptionX

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "RedemptionX-delete",
        title: "RedemptionX Delete",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "RedemptionX-delete" && tab && tab.id) {
        chrome.tabs.sendMessage(
            tab.id,
            { action: "get-highlight" },
            async (response) => {
                if (response) {
                    // Import pure functions from background.js
                    const sanitizeFilename = (str) =>
                        str
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");
                    const toMarkdown = (data) => {
                        const frontMatter = `---\ndate: ${data.date}\ntitle: "${
                            data.title || ""
                        }"\ncited: "${data.cited || ""}"\nlink: ${
                            data.link
                        }\nseo: "${data.seo || ""}"\ntags: ${
                            data.tags || ""
                        }\n---\n`;
                        const quoted = (data.text || "")
                            .split("\n")
                            .map((line) => "> " + line)
                            .join("\n");
                        return frontMatter + "\n" + quoted + "\n";
                    };
                    const filename = `${response.date}-${sanitizeFilename(
                        response.title,
                    )}.md`;
                    const markdown = toMarkdown(response);

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (filename, content) => {
                            if (window.showSaveFilePicker) {
                                (async () => {
                                    try {
                                        const opts = {
                                            suggestedName: filename,
                                            types: [
                                                {
                                                    description: "Markdown",
                                                    accept: {
                                                        "text/markdown": [
                                                            ".md",
                                                        ],
                                                    },
                                                },
                                            ],
                                        };
                                        const handle =
                                            await window.showSaveFilePicker(
                                                opts,
                                            );
                                        const writable =
                                            await handle.createWritable();
                                        await writable.write(content);
                                        await writable.close();
                                    } catch (error) {
                                        // User cancelled or error occurred
                                        console.log(
                                            "Save cancelled or failed:",
                                            error,
                                        );
                                    }
                                })();
                            } else {
                                // Fallback for browsers that don't support File System Access API
                                const blob = new Blob([content], {
                                    type: "text/markdown",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }
                        },
                        args: [filename, markdown],
                    });
                }
            },
        );
    }
});
