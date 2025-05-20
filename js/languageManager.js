class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'EN';
        this.translations = {};
        this.loadTranslations();
        this.setupLanguageSelector();
    }

    async loadTranslations() {
        try {
            console.log('Loading translations for:', this.currentLanguage);
            const response = await fetch(`languages/${this.currentLanguage.toLowerCase()}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('Translations loaded:', this.translations);
            this.updatePageContent();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    async changeLanguage(lang) {
        console.log('Changing language to:', lang);
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        await this.loadTranslations();
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value[k] === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
            value = value[k];
        }
        
        return value;
    }

    updatePageContent() {
        console.log('Updating page content');
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            console.log(`Updating element with key ${key} to:`, translation);
            element.textContent = translation;
        });

        // Update all elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            console.log(`Updating placeholder with key ${key} to:`, translation);
            element.placeholder = translation;
        });

        // Update page title
        document.title = this.getTranslation('appTitle');
    }

    setupLanguageSelector() {
        // Add click handlers for language selection
        const languageDropdown = document.querySelector('.language-dropdown');
        if (languageDropdown) {
            languageDropdown.addEventListener('click', async (e) => {
                if (e.target.tagName === 'DIV') {
                    const lang = e.target.textContent;
                    console.log('Language selected:', lang);
                    await this.changeLanguage(lang);
                }
            });
        } else {
            console.warn('Language dropdown not found');
        }
    }
}

// Initialize language manager
const languageManager = new LanguageManager(); 