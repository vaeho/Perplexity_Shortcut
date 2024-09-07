document.addEventListener('DOMContentLoaded', function () {
    const shortcutLink = document.getElementById('shortcutLink');
    if (shortcutLink) {
        shortcutLink.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.runtime.sendMessage({ action: "openShortcutsPage" });
        });
    }
});