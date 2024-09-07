let searchInput = null;

function createSearchInput() {
    searchInput = document.createElement('div');
    searchInput.innerHTML = `
    <div id="perplexity-search" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: none;">
      <input type="text" placeholder="Search Perplexity" style="width: 300px; padding: 10px; font-size: 16px; border: 2px solid #4a90e2; border-radius: 5px;">
    </div>
  `;
    document.body.appendChild(searchInput);

    const input = searchInput.querySelector('input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
                window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`, '_blank');
                toggleSearch();
            }
        } else if (e.key === 'Escape') {
            toggleSearch();
        }
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