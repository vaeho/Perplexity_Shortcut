document.addEventListener('DOMContentLoaded', function () {
    const shortcutLink = document.getElementById('shortcutLink');
    if (shortcutLink) {
        shortcutLink.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
        });
    }
});