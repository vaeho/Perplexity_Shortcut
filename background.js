chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: "onboarding.html"
        });
    }

    chrome.contextMenus.create({
        id: "searchPerplexity",
        title: "Search Perplexity for '%s'",
        contexts: ["selection"]
    });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-search") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSearch" });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openShortcutsPage") {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    } else if (request.action === "search") {
        performSearch(request.query);
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "searchPerplexity") {
        performSearch(info.selectionText);
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