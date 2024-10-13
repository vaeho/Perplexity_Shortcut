let searchInput = null;
let isInitialized = false;
let lastToggleTime = 0;

function createSearchInput() {
    if (searchInput) return;

    chrome.storage.sync.get({
        darkMode: true,
        inputSize: 500
    }, function (items) {
        const container = document.createElement('div');
        container.id = 'perplexity-search-container';

        const shadow = container.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = `
            #perplexity-search-wrapper {
                all: initial;
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2147483647;
                display: none;
                font-family: Arial, sans-serif;
            }
            #perplexity-search-input {
                all: initial;
                display: block;
                width: ${items.inputSize}px;
                padding: 12px 20px;
                font-size: 16px;
                font-family: Arial, sans-serif;
                border: 2px solid #20808D;
                border-radius: 24px;
                background-color: ${items.darkMode ? '#1e1e1f' : '#ffffff'};
                color: ${items.darkMode ? '#e0e0e0' : '#333333'};
                outline: none;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            #perplexity-search-input:focus {
                box-shadow: 0 0 0 3px rgba(32, 128, 141, 0.3);
            }
        `;

        const wrapper = document.createElement('div');
        wrapper.id = 'perplexity-search-wrapper';

        const input = document.createElement('input');
        input.id = 'perplexity-search-input';
        input.type = 'text';
        input.placeholder = 'Search Perplexity';

        wrapper.appendChild(input);
        shadow.appendChild(style);
        shadow.appendChild(wrapper);

        document.body.appendChild(container);

        searchInput = wrapper;

        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (query) {
                    chrome.runtime.sendMessage({ action: "search", query: query });
                    toggleSearch();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                toggleSearch();
            }
        });

        input.addEventListener('keyup', (e) => e.stopPropagation());
        input.addEventListener('keypress', (e) => e.stopPropagation());
        wrapper.addEventListener('click', (e) => e.stopPropagation());

        isInitialized = true;
    });
}

function toggleSearch() {
    const currentTime = Date.now();
    if (currentTime - lastToggleTime < 200) {
        return; // Ignore rapid successive calls
    }
    lastToggleTime = currentTime;

    if (!isInitialized) {
        createSearchInput();
        setTimeout(toggleSearch, 100);
        return;
    }

    if (!searchInput) return;

    if (searchInput.style.display === 'none' || searchInput.style.display === '') {
        searchInput.style.display = 'block';
        setTimeout(() => {
            const input = searchInput.querySelector('input');
            input.focus();
            input.select();
        }, 0);
    } else {
        searchInput.style.display = 'none';
        searchInput.querySelector('input').value = '';
    }
}

function initializeExtension() {
    createSearchInput();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggleSearch") {
            toggleSearch();
        }
    });

    initializeObserver();
}

function initializeObserver() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.removedNodes) {
                    if (node.contains(document.getElementById('perplexity-search-container'))) {
                        cleanup();
                        observer.disconnect();
                        return;
                    }
                }
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        const bodyObserver = new MutationObserver(() => {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
                bodyObserver.disconnect();
            }
        });
        bodyObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.darkMode || changes.inputSize)) {
        const container = document.getElementById('perplexity-search-container');
        if (container) {
            container.remove();
        }
        searchInput = null;
        isInitialized = false;
        createSearchInput();
    }
});

function cleanup() {
    const container = document.getElementById('perplexity-search-container');
    if (container) {
        container.remove();
    }
    searchInput = null;
    isInitialized = false;
}

window.addEventListener('pagehide', cleanup);

window.toggleSearch = toggleSearch;