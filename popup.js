document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('tabsList');
  const copyButton = document.getElementById('copyButton');

  // Получаем все открытые вкладки
  chrome.tabs.query({}, function(tabs) {
    const tabUrls = tabs.map(tab => tab.url).join('\n');
    textarea.value = tabUrls;
  });

  // Обработчик копирования
  copyButton.addEventListener('click', function() {
    textarea.select();
    document.execCommand('copy');
    
    // Визуальная обратная связь
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Скопировано!';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1500);
  });
}); 