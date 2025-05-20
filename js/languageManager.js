class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'EN';
        this.translations = {};
        this.loadTranslations();
    }

    async loadTranslations() {
        try {
            const response = await fetch(`languages/${this.currentLanguage.toLowerCase()}.json`);
            this.translations = await response.json();
            this.updatePageContent();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    async changeLanguage(lang) {
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
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.getTranslation(key);
        });

        // Update all elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.getTranslation(key);
        });

        // Update page title
        document.title = this.getTranslation('appTitle');
    }
}

// Initialize language manager
const languageManager = new LanguageManager();

// Add click handlers for language selection
document.querySelectorAll('.language-dropdown div').forEach(element => {
    element.addEventListener('click', async () => {
        const lang = element.textContent;
        await languageManager.changeLanguage(lang);
    });
}); 