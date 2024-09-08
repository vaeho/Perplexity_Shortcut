chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: "onboarding.html"
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-search") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        if (typeof toggleSearch === 'function') {
                            toggleSearch();
                        } else {
                            chrome.runtime.sendMessage({ action: "reloadContentScript" });
                        }
                    }
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openShortcutsPage") {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    } else if (request.action === "search") {
        performSearch(request.query);
    } else if (request.action === "reloadContentScript") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSearch" });
                });
            }
        });
    }
});

function performSearch(query) {
    chrome.storage.sync.get({ openInNewTab: true }, function (items) {
        const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
        if (items.openInNewTab) {
            chrome.tabs.create({ url: url });
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, { url: url });
                }
            });
        }
    });
}