document.addEventListener('DOMContentLoaded', function () {
    const openInNewTabCheckbox = document.getElementById('openInNewTab');
    const darkModeCheckbox = document.getElementById('darkMode');
    const inputSizeSlider = document.getElementById('inputSize');
    const inputSizeValue = document.getElementById('inputSizeValue');
    const currentShortcutSpan = document.getElementById('currentShortcut');
    const changeShortcutButton = document.getElementById('changeShortcut');
    const saveSettingsButton = document.getElementById('saveSettings');

    function applyDarkMode(isDarkMode) {
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('light-mode', !isDarkMode);
    }

    chrome.storage.sync.get({
        openInNewTab: true,
        darkMode: true,
        inputSize: 500
    }, function (items) {
        openInNewTabCheckbox.checked = items.openInNewTab;
        darkModeCheckbox.checked = items.darkMode;
        inputSizeSlider.value = items.inputSize;
        inputSizeValue.textContent = items.inputSize;

        applyDarkMode(items.darkMode);
    });

    inputSizeSlider.addEventListener('input', function () {
        inputSizeValue.textContent = this.value;
    });

    darkModeCheckbox.addEventListener('change', function () {
        applyDarkMode(this.checked);
    });

    chrome.commands.getAll(function (commands) {
        const toggleSearchCommand = commands.find(command => command.name === "toggle-search");
        if (toggleSearchCommand && toggleSearchCommand.shortcut) {
            currentShortcutSpan.textContent = toggleSearchCommand.shortcut;
        } else {
            currentShortcutSpan.textContent = "Not set";
        }
    });

    changeShortcutButton.addEventListener('click', function () {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

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
            }, 2000);
        });
    });
});