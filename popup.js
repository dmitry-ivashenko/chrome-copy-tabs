document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('tabsList');
  const copyButton = document.getElementById('copyButton');
  const windowSelect = document.getElementById('windowSelect');
  const markdownCheckbox = document.getElementById('markdownFormat');
  
  let allTabs = [];
  let windowsMap = new Map();

  // Function to update tabs list
  function updateTabsList(selectedWindowId = 'all') {
    let tabsToShow = [];
    
    if (selectedWindowId === 'all') {
      tabsToShow = allTabs;
    } else {
      tabsToShow = allTabs.filter(tab => tab.windowId === parseInt(selectedWindowId));
    }

    const isMarkdownFormat = markdownCheckbox.checked;
    
    if (isMarkdownFormat) {
      textarea.value = tabsToShow.map(tab => {
        // Remove square brackets from title to avoid markdown conflicts
        const cleanTitle = tab.title.replace(/\[|\]/g, '');
        return `* [${cleanTitle}](${tab.url})`;
      }).join('\n');
    } else {
      textarea.value = tabsToShow.map(tab => tab.url).join('\n');
    }
  }

  // Get all windows and tabs
  chrome.windows.getAll({ populate: true }, function(windows) {
    // Clear selector
    windowSelect.innerHTML = '<option value="all">All Windows</option>';
    
    windows.forEach(window => {
      // Add tabs to the general list
      allTabs = allTabs.concat(window.tabs);
      
      // Save window information
      windowsMap.set(window.id, window);
      
      // Add window option
      const tabCount = window.tabs.length;
      const option = document.createElement('option');
      option.value = window.id;
      option.textContent = `Window ${window.id} (${tabCount} tabs)`;
      windowSelect.appendChild(option);
    });

    // Show all tabs by default
    updateTabsList();
  });

  // Window selection change handler
  windowSelect.addEventListener('change', function() {
    updateTabsList(this.value);
  });

  // Markdown format checkbox change handler
  markdownCheckbox.addEventListener('change', function() {
    updateTabsList(windowSelect.value);
  });

  // Copy handler
  copyButton.addEventListener('click', function() {
    textarea.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1500);
  });
}); 