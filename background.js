chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "onboarding.html" });
    }
    chrome.contextMenus.create({
        id: "perplexitySearch",
        title: "Search Perplexity for '%s'",
        contexts: ["selection"]
    });
});

function toggleSearch() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSearch" })
                .catch(error => {
                    console.log("Unable to toggle search on this page.");
                });
        }
    });
}

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.commands.onCommand.addListener((command) => {
    console.log("Command received:", command);  // Add this line
    if (command === "toggle-search") {
        toggleSearch();
    } else if (command === "search-page-content") {
        console.log("Extracting page content...");  // Add this line
        extractPageContent((content) => {
            console.log("Content extracted:", content.substring(0, 50) + "...");  // Add this line
            performSearch(content);
        });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "perplexitySearch") {
        performSearch(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "search") {
        performSearch(request.query);
    } else if (request.action === "openShortcutsPage") {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    }
});

function performSearch(query) {
    chrome.storage.sync.get({ openInNewTab: true }, function (items) {
        const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
        if (items.openInNewTab) {
            chrome.tabs.create({ url: url });
        } else {
            chrome.tabs.update({ url: url });
        }
    });
}

function extractPageContent(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    // Get the page title
                    const pageTitle = document.title;

                    // Remove script and style elements
                    const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer');
                    elementsToRemove.forEach(el => el.remove());

                    // Get the main content
                    const mainContent = document.querySelector('main') || document.body;
                    
                    // Extract and process the text
                    let text = mainContent.innerText;
                    
                    // Remove extra whitespace and newlines
                    text = text.replace(/\s+/g, ' ').trim();
                    
                    // Limit the length (e.g., to 1000 characters)
                    const maxLength = 1000;
                    if (text.length > maxLength) {
                        text = text.substring(0, maxLength) + '...';
                    }
                    
                    // Combine title, content, and URL
                    return { title: pageTitle, content: text, url: window.location.href };
                }
            }, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    callback('');
                } else {
                    const { title, content, url } = result[0].result;
                    const formattedContent = `${title}\n\n${content}\n\n${url}`;
                    callback(formattedContent);
                }
            });
        } else {
            callback('');
        }
    });
}
