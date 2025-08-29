/**
 * MSFG Loan Tools Pro - Main Application JavaScript
 * Core functionality and utilities for the loan tools application
 */

class LoanToolsApp {
    constructor() {
        console.log('LoanToolsApp initializing...');
        
        this.currentCalculator = null;
        this.calculations = [];
        this.settings = this.loadSettings();
        
        // Check if PDF.js is available
        if (window.pdfjsLib) {
            console.log('PDF.js library is available');
        } else {
            console.warn('PDF.js library not found, PDF parsing may not work');
        }
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadCalculations();
        this.setupNavigation();
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCalculatorNavigation();
            this.setupFormValidation();
            this.setupAutoSave();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveCalculations();
        });
    }
    
    setupCalculatorNavigation() {
        // Add navigation breadcrumbs
        const currentPage = this.getCurrentPage();
        if (currentPage !== 'index') {
            this.addBreadcrumbNavigation();
        }
        
        // Setup calculator-specific functionality
        this.setupCalculatorSpecificFeatures();
    }
    
    setupCalculatorSpecificFeatures() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'apr-calculator':
                this.initializeAPRCalculator();
                break;
            case 'buydown-calculator':
                this.initializeBuydownCalculator();
                break;
            case 'income-calculator':
                this.initializeIncomeCalculator();
                break;
            case 'schedule-c-calculator':
                this.initializeScheduleCCalculator();
                break;
            case 'schedule-e-calculator':
                this.initializeScheduleECalculator();
                break;
            case 'llpm-tool':
                this.initializeLLPMTool();
                break;
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'index';
    }
    
    addBreadcrumbNavigation() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-primary);
            padding: var(--space-2) var(--space-8);
            font-size: var(--font-size-sm);
        `;
        
        const breadcrumbContent = document.createElement('div');
        breadcrumbContent.className = 'container';
        breadcrumbContent.innerHTML = `
            <a href="index.html" style="color: var(--text-secondary);">Home</a>
            <span style="margin: 0 var(--space-2); color: var(--text-muted);">/</span>
            <span style="color: var(--text-primary);">${this.getPageTitle()}</span>
        `;
        
        breadcrumb.appendChild(breadcrumbContent);
        header.parentNode.insertBefore(breadcrumb, header.nextSibling);
    }
    
    getPageTitle() {
        const currentPage = this.getCurrentPage();
        const titles = {
            'apr-calculator': 'APR Calculator',
            'buydown-calculator': 'Buydown Calculator',
            'income-calculator': 'Income Calculator',
            'schedule-c-calculator': 'Schedule C Calculator',
            'schedule-e-calculator': 'Schedule E Calculator',
            'llpm-tool': 'LLPM Tool'
        };
        
        return titles[currentPage] || 'Calculator';
    }
    
    setupFormValidation() {
        // Add real-time validation to form inputs
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Check if required
        if (required && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Type-specific validation
        switch (type) {
            case 'number':
                if (value && isNaN(value)) {
                    this.showFieldError(field, 'Please enter a valid number');
                    return false;
                }
                if (value && parseFloat(value) < 0) {
                    this.showFieldError(field, 'Please enter a positive number');
                    return false;
                }
                break;
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    showFieldError(field, message) {
        field.style.borderColor = 'var(--accent-danger)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: var(--accent-danger);
            font-size: var(--font-size-xs);
            margin-top: var(--space-1);
        `;
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.style.borderColor = 'var(--border-primary)';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setupAutoSave() {
        // Auto-save form data every 30 seconds
        setInterval(() => {
            this.saveFormData();
        }, 30000);
        
        // Save on form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                this.saveFormData();
            });
        });
    }
    
    saveFormData() {
        const currentPage = this.getCurrentPage();
        const formData = {};
        
        // Collect all form inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                formData[key] = input.value;
            }
        });
        
        // Save to localStorage
        localStorage.setItem(`formData_${currentPage}`, JSON.stringify(formData));
    }
    
    loadFormData() {
        const currentPage = this.getCurrentPage();
        const savedData = localStorage.getItem(`formData_${currentPage}`);
        
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Restore form values
            Object.keys(formData).forEach(key => {
                const input = document.querySelector(`[name="${key}"], #${key}`);
                if (input) {
                    input.value = formData[key];
                }
            });
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveCalculations();
            this.showNotification('Calculations saved', 'success');
        }
        
        // Ctrl/Cmd + N for new calculation
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.newCalculation();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('.modal, [id$="Modal"]');
        modals.forEach(modal => {
            if (!modal.classList.contains('d-none')) {
                modal.classList.add('d-none');
                modal.style.display = 'none';
            }
        });
    }
    
    newCalculation() {
        // Clear form data
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Clear saved data
        const currentPage = this.getCurrentPage();
        localStorage.removeItem(`formData_${currentPage}`);
        
        this.showNotification('New calculation started', 'info');
    }
    
    saveCalculations() {
        const currentPage = this.getCurrentPage();
        const calculation = {
            id: Date.now(),
            page: currentPage,
            timestamp: new Date().toISOString(),
            data: this.collectCalculationData()
        };
        
        this.calculations.push(calculation);
        
        // Keep only last 50 calculations
        if (this.calculations.length > 50) {
            this.calculations = this.calculations.slice(-50);
        }
        
        localStorage.setItem('loanTools_calculations', JSON.stringify(this.calculations));
    }
    
    loadCalculations() {
        const saved = localStorage.getItem('loanTools_calculations');
        if (saved) {
            this.calculations = JSON.parse(saved);
        }
    }
    
    collectCalculationData() {
        const data = {};
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                data[key] = input.value;
            }
        });
        
        return data;
    }
    
    loadSettings() {
        const saved = localStorage.getItem('loanTools_settings');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            autoSave: true,
            notifications: true,
            currencyFormat: 'USD'
        };
    }
    
    saveSettings() {
        localStorage.setItem('loanTools_settings', JSON.stringify(this.settings));
    }
    
    initializeTheme() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        
        // Set background color based on type
        const colors = {
            success: 'var(--accent-success)',
            warning: 'var(--accent-warning)',
            error: 'var(--accent-danger)',
            info: 'var(--accent-info)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Utility functions
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    formatPercentage(value, decimals = 2) {
        return `${parseFloat(value).toFixed(decimals)}%`;
    }
    
    formatNumber(value, decimals = 2) {
        return parseFloat(value).toFixed(decimals);
    }
    
    calculateMonthlyPayment(principal, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        
        if (monthlyRate === 0) {
            return principal / numberOfPayments;
        }
        
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    calculateAPR(principal, payment, years, fees = 0) {
        // Simplified APR calculation
        const totalPayments = payment * years * 12;
        const totalCost = totalPayments + fees;
        const effectiveRate = Math.pow(totalCost / principal, 1 / (years * 12)) - 1;
        return effectiveRate * 12 * 100;
    }
    
    // Calculator-specific initialization methods
    initializeAPRCalculator() {
        // APR calculator specific setup
        console.log('APR Calculator initialized');
    }
    
    initializeBuydownCalculator() {
        // Buydown calculator specific setup
        console.log('Buydown Calculator initialized');
    }
    
    initializeIncomeCalculator() {
        // Income calculator specific setup
        console.log('Income Calculator initialized');
    }
    
    initializeScheduleCCalculator() {
        // Schedule C calculator specific setup
        console.log('Schedule C Calculator initialized');
    }
    
    initializeScheduleECalculator() {
        // Schedule E calculator specific setup
        console.log('Schedule E Calculator initialized');
    }
    
    initializeLLPMTool() {
        // LLPM tool specific setup
        console.log('LLPM Tool initialized');
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new LoanToolsApp();
    
    // Load saved form data
    app.loadFormData();
    
    console.log('MSFG Loan Tools Pro initialized');
});

// Export for use in other modules
window.LoanToolsApp = LoanToolsApp;

