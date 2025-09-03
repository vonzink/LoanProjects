// MSFG Loan Tools Theme Switcher
// Provides consistent theme switching across all pages

class ThemeSwitcher {
    constructor() {
        this.themes = {
            dark: {
                name: 'Dark',
                icon: '🌙',
                variables: {
                    '--bg-primary': '#0a0a0a',
                    '--bg-secondary': '#1a1a1a',
                    '--bg-card': 'rgba(255, 255, 255, 0.05)',
                    '--bg-card-hover': 'rgba(255, 255, 255, 0.08)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#b0b0b0',
                    '--text-muted': '#808080',
                    '--border-color': 'rgba(255, 255, 255, 0.1)',
                    '--border-hover': 'rgba(255, 255, 255, 0.2)',
                    '--shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
                    '--shadow-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
                    '--body-bg': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                }
            },
            default: {
                name: 'Default',
                icon: '🌤️',
                variables: {
                    '--bg-primary': '#f8fafc',
                    '--bg-secondary': '#ffffff',
                    '--bg-card': 'rgba(0, 0, 0, 0.05)',
                    '--bg-card-hover': 'rgba(0, 0, 0, 0.08)',
                    '--text-primary': '#1e293b',
                    '--text-secondary': '#475569',
                    '--text-muted': '#64748b',
                    '--border-color': 'rgba(0, 0, 0, 0.1)',
                    '--border-hover': 'rgba(0, 0, 0, 0.2)',
                    '--shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '--shadow-hover': '0 12px 40px rgba(0, 0, 0, 0.15)',
                    '--body-bg': 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)'
                }
            },
            light: {
                name: 'Light',
                icon: '☀️',
                variables: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8fafc',
                    '--bg-card': 'rgba(0, 0, 0, 0.03)',
                    '--bg-card-hover': 'rgba(0, 0, 0, 0.06)',
                    '--text-primary': '#0f172a',
                    '--text-secondary': '#334155',
                    '--text-muted': '#475569',
                    '--border-color': 'rgba(0, 0, 0, 0.08)',
                    '--border-hover': 'rgba(0, 0, 0, 0.15)',
                    '--shadow': '0 4px 16px rgba(0, 0, 0, 0.08)',
                    '--shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
                    '--body-bg': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
                }
            }
        };
        
        this.currentTheme = this.getStoredTheme();
        this.init();
    }

    init() {
        this.createThemeToggle();
        this.applyTheme(this.currentTheme);
        this.updateToggleDisplay();
    }

    createThemeToggle() {
        // Create theme toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-card);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 25px;
            padding: 8px 12px;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        `;

        // Create theme label
        const themeLabel = document.createElement('span');
        themeLabel.textContent = 'Theme:';
        themeLabel.style.cssText = `
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 500;
        `;

        // Create theme selector
        const themeSelect = document.createElement('select');
        themeSelect.className = 'theme-selector';
        themeSelect.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 4px 8px;
            color: var(--text-primary);
            font-size: 12px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
        `;

        // Add theme options
        Object.keys(this.themes).forEach(themeKey => {
            const option = document.createElement('option');
            option.value = themeKey;
            option.textContent = `${this.themes[themeKey].icon} ${this.themes[themeKey].name}`;
            themeSelect.appendChild(option);
        });

        // Set current theme
        themeSelect.value = this.currentTheme;

        // Add change event
        themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Add hover effects
        toggleContainer.addEventListener('mouseenter', () => {
            toggleContainer.style.transform = 'scale(1.05)';
            toggleContainer.style.boxShadow = 'var(--shadow-hover)';
        });

        toggleContainer.addEventListener('mouseleave', () => {
            toggleContainer.style.transform = 'scale(1)';
            toggleContainer.style.boxShadow = 'var(--shadow)';
        });

        // Assemble and add to page
        toggleContainer.appendChild(themeLabel);
        toggleContainer.appendChild(themeSelect);
        document.body.appendChild(toggleContainer);
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.storeTheme(themeName);
        this.updateToggleDisplay();
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Apply CSS variables
        Object.entries(theme.variables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Update body background
        document.body.style.background = theme.variables['--body-bg'];

        // Add theme class to body for additional styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeName, themeData: theme } 
        }));
    }

    getStoredTheme() {
        return localStorage.getItem('msfg-theme') || 'dark';
    }

    storeTheme(themeName) {
        localStorage.setItem('msfg-theme', themeName);
    }

    updateToggleDisplay() {
        const themeSelect = document.querySelector('.theme-selector');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to get theme data
    getThemeData(themeName = null) {
        const theme = themeName || this.currentTheme;
        return this.themes[theme];
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeSwitcher = new ThemeSwitcher();
    });
} else {
    window.themeSwitcher = new ThemeSwitcher();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSwitcher;
}
