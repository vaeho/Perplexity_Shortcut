let searchInput = null;

function createSearchInput() {
    searchInput = document.createElement('div');
    searchInput.innerHTML = `
    <div id="perplexity-search" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: none;">
      <input type="text" placeholder="Search Perplexity" style="
        width: 500px;
        padding: 12px 20px;
        font-size: 16px;
        border: 2px solid #20808D;
        border-radius: 24px;
        background-color: #1e1e1f;
        color: #e0e0e0;
        outline: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      ">
    </div>
  `;
    document.body.appendChild(searchInput);

    const input = searchInput.querySelector('input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
                chrome.runtime.sendMessage({ action: "search", query: query });
                toggleSearch();
            }
        } else if (e.key === 'Escape') {
            toggleSearch();
        }
    });

    input.addEventListener('focus', () => {
        input.style.boxShadow = '0 0 0 3px rgba(32, 128, 141, 0.3)';
    });

    input.addEventListener('blur', () => {
        input.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });
}

function toggleSearch() {
    if (!searchInput) {
        createSearchInput();
    }

    const perplexitySearch = document.getElementById('perplexity-search');
    if (perplexitySearch.style.display === 'none') {
        perplexitySearch.style.display = 'block';
        perplexitySearch.querySelector('input').focus();
    } else {
        perplexitySearch.style.display = 'none';
        perplexitySearch.querySelector('input').value = '';
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSearch") {
        toggleSearch();
    }
});