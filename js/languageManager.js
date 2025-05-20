// Language Manager for Lightning Fast Ordering
(function() {
  const DEFAULT_LANG = 'en';
  const LANG_KEY = 'appLang';

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  function getLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function loadLangFile(lang, callback) {
    fetch(`languages/${lang}.json`)
      .then(res => res.json())
      .then(data => callback(data))
      .catch(() => {
        if (lang !== DEFAULT_LANG) {
          loadLangFile(DEFAULT_LANG, callback);
        }
      });
  }

  function translatePage(langData) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key in langData) {
        el.textContent = langData[key];
      }
    });
    // For placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key in langData) {
        el.setAttribute('placeholder', langData[key]);
      }
    });
    // For categories (array)
    if (langData.categories) {
      const catEls = document.querySelectorAll('[data-i18n-category]');
      catEls.forEach((el, idx) => {
        if (langData.categories[idx]) {
          el.textContent = langData.categories[idx];
        }
      });
    }
  }

  function updateLang(lang) {
    setLang(lang);
    loadLangFile(lang, translatePage);
  }

  // Setup language selector
  document.addEventListener('DOMContentLoaded', function() {
    const lang = getLang();
    loadLangFile(lang, translatePage);
    // Language selector
    document.querySelectorAll('.language-dropdown > div').forEach(option => {
      option.addEventListener('click', function() {
        updateLang(option.textContent.trim().toLowerCase());
        // Optionally reload page or just update text
      });
    });
  });

  // Expose for manual switching if needed
  window.updateLang = updateLang;
})(); 