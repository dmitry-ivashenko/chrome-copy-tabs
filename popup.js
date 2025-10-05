document.addEventListener('DOMContentLoaded', function() {
  const tabsListContainer = document.getElementById('tabsList');
  const selectedTabsOutput = document.getElementById('selectedTabsOutput');
  const copyButton = document.getElementById('copyButton');
  const windowSelect = document.getElementById('windowSelect');
  const markdownCheckbox = document.getElementById('markdownFormat');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const currentTabBtn = document.getElementById('currentTabBtn');
  
  let allTabs = [];
  let windowsMap = new Map();
  let currentTabsToShow = []; // Tabs currently displayed in the list

  // Function to generate tabs list with checkboxes
  function generateTabsList(tabsToShow) {
    currentTabsToShow = tabsToShow;
    tabsListContainer.innerHTML = '';
    
    tabsToShow.forEach((tab, index) => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `tab-${index}`;
      checkbox.checked = true; // All tabs selected by default
      checkbox.addEventListener('change', updateSelectedTabsOutput);
      
      const label = document.createElement('label');
      label.className = 'tab-title';
      label.textContent = tab.title;
      label.addEventListener('click', (e) => {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        updateSelectedTabsOutput();
      });
      
      tabItem.appendChild(checkbox);
      tabItem.appendChild(label);
      tabsListContainer.appendChild(tabItem);
    });
    
    updateSelectedTabsOutput();
  }

  // Function to update the output textarea based on selected tabs
  function updateSelectedTabsOutput() {
    const selectedTabs = [];
    const checkboxes = tabsListContainer.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked && currentTabsToShow[index]) {
        selectedTabs.push(currentTabsToShow[index]);
      }
    });
    
    const isMarkdownFormat = markdownCheckbox.checked;
    
    if (isMarkdownFormat) {
      selectedTabsOutput.value = selectedTabs.map(tab => {
        // Remove square brackets from title to avoid markdown conflicts
        const cleanTitle = tab.title.replace(/\[|\]/g, '');
        return `* [${cleanTitle}](${tab.url})`;
      }).join('\n');
    } else {
      selectedTabsOutput.value = selectedTabs.map(tab => tab.url).join('\n');
    }
  }

  // Function to update tabs list based on window selection
  function updateTabsList(selectedWindowId = 'all') {
    let tabsToShow = [];
    
    if (selectedWindowId === 'all') {
      tabsToShow = allTabs;
    } else {
      tabsToShow = allTabs.filter(tab => tab.windowId === parseInt(selectedWindowId));
    }

    generateTabsList(tabsToShow);
  }

  // Get current window first, then all windows and tabs
  chrome.windows.getCurrent(function(currentWindow) {
    chrome.windows.getAll({ populate: true }, function(windows) {
      // Clear selector
      windowSelect.innerHTML = '<option value="all">All Windows</option>';
      
      const currentWindowId = currentWindow.id;
      
      windows.forEach(window => {
        // Add tabs to the general list
        allTabs = allTabs.concat(window.tabs);
        
        // Save window information
        windowsMap.set(window.id, window);
        
        // Add window option
        const tabCount = window.tabs.length;
        const option = document.createElement('option');
        option.value = window.id;
        
        // Add (current) label to the current window
        const currentLabel = window.id === currentWindowId ? ' (current)' : '';
        option.textContent = `Window ${window.id} (${tabCount} tabs)${currentLabel}`;
        
        windowSelect.appendChild(option);
      });

      // Set current window as selected by default
      windowSelect.value = currentWindowId;
      updateTabsList(currentWindowId);
    });
  });

  // Window selection change handler
  windowSelect.addEventListener('change', function() {
    updateTabsList(this.value);
  });

  // Markdown format checkbox change handler
  markdownCheckbox.addEventListener('change', function() {
    updateSelectedTabsOutput();
  });

  // Select All button handler
  selectAllBtn.addEventListener('click', function() {
    const checkboxes = tabsListContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    updateSelectedTabsOutput();
  });

  // Clear All button handler
  clearAllBtn.addEventListener('click', function() {
    const checkboxes = tabsListContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    updateSelectedTabsOutput();
  });

  // Current Tab Only button handler
  currentTabBtn.addEventListener('click', function() {
    const checkboxes = tabsListContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
      // Select only the active tab, unselect all others
      const tab = currentTabsToShow[index];
      checkbox.checked = tab && tab.active;
    });
    updateSelectedTabsOutput();
  });

  // Copy handler
  copyButton.addEventListener('click', function() {
    selectedTabsOutput.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1500);
  });
}); 
// test changes