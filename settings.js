document.addEventListener('DOMContentLoaded', function () {
    const openInNewTabCheckbox = document.getElementById('openInNewTab');
    const darkModeCheckbox = document.getElementById('darkMode');
    const inputSizeSlider = document.getElementById('inputSize');
    const inputSizeValue = document.getElementById('inputSizeValue');
    const currentShortcutSpan = document.getElementById('currentShortcut');
    const changeShortcutButton = document.getElementById('changeShortcut');
    const saveSettingsButton = document.getElementById('saveSettings');

    // Load current settings
    chrome.storage.sync.get({
        openInNewTab: true,
        darkMode: true,
        inputSize: 500
    }, function (items) {
        openInNewTabCheckbox.checked = items.openInNewTab;
        darkModeCheckbox.checked = items.darkMode;
        inputSizeSlider.value = items.inputSize;
        inputSizeValue.textContent = items.inputSize;

        // Apply dark mode to settings page
        document.body.classList.toggle('dark-mode', items.darkMode);
        document.body.classList.toggle('light-mode', !items.darkMode);
    });

    // Input size slider
    inputSizeSlider.addEventListener('input', function () {
        inputSizeValue.textContent = this.value;
    });

    // Dark mode toggle
    darkModeCheckbox.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode', this.checked);
        document.body.classList.toggle('light-mode', !this.checked);
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

    // Save settings with visual feedback
    saveSettingsButton.addEventListener('click', function () {
        const originalText = saveSettingsButton.textContent;
        saveSettingsButton.textContent = 'Saving...';
        saveSettingsButton.disabled = true;

        chrome.storage.sync.set({
            openInNewTab: openInNewTabCheckbox.checked,
            darkMode: darkModeCheckbox.checked,
            inputSize: parseInt(inputSizeSlider.value)
        }, function () {
            saveSettingsButton.textContent = 'Saved!';
            saveSettingsButton.style.backgroundColor = '#4CAF50';

            setTimeout(() => {
                saveSettingsButton.textContent = originalText;
                saveSettingsButton.style.backgroundColor = '';
                saveSettingsButton.disabled = false;
            }, 2000); // Reset after 2 seconds
        });
    });
});