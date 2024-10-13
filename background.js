chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: "onboarding.html"
        });
    }
    chrome.contextMenus.create({
        id: "perplexitySearch",
        title: "Search Perplexity for '%s'",
        contexts: ["selection"]
    });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-search") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSearch" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("Unable to toggle search on this page.");
                        // chrome.tabs.create({ url: "https://www.perplexity.ai" });
                    }
                });
            }
        });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "perplexitySearch") {
        performSearch(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openShortcutsPage") {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    } else if (request.action === "search") {
        performSearch(request.query);
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