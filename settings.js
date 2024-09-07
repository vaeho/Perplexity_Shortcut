document.addEventListener('DOMContentLoaded', function () {
    const openInNewTabCheckbox = document.getElementById('openInNewTab');
    const currentShortcutSpan = document.getElementById('currentShortcut');
    const changeShortcutButton = document.getElementById('changeShortcut');
    const saveSettingsButton = document.getElementById('saveSettings');

    // Load current settings
    chrome.storage.sync.get({ openInNewTab: true }, function (items) {
        openInNewTabCheckbox.checked = items.openInNewTab;
    });

    // Load current shortcut
    chrome.commands.getAll(function (commands) {
        const toggleSearchCommand = commands.find(command => command.name === "toggle-search");
        if (toggleSearchCommand && toggleSearchCommand.shortcut) {
            currentShortcutSpan.textContent = toggleSearchCommand.shortcut;
        } else {
            currentShortcutSpan.textContent = "Not set";
        }
    });

    // Change shortcut
    changeShortcutButton.addEventListener('click', function () {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    // Save settings
    saveSettingsButton.addEventListener('click', function () {
        chrome.storage.sync.set({
            openInNewTab: openInNewTabCheckbox.checked
        }, function () {
            alert('Settings saved!');
        });
    });
});