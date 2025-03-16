document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('tabsList');
  const copyButton = document.getElementById('copyButton');
  const windowSelect = document.getElementById('windowSelect');
  
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

    textarea.value = tabsToShow.map(tab => tab.url).join('\n');
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