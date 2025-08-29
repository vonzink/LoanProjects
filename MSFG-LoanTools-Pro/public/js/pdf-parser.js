/**
 * MSFG Loan Tools Pro - PDF Parser Utility
 * Handles drag-and-drop PDF functionality and data extraction
 */

class PDFParser {
    constructor() {
        this.supportedFormTypes = {
            '1040': 'Individual Tax Return',
            '1065': 'Partnership Tax Return',
            '1120': 'Corporate Tax Return',
            '1120S': 'S-Corporation Tax Return',
            'Schedule C': 'Business Income',
            'Schedule E': 'Rental Income',
            'Schedule B': 'Interest and Dividends',
            'Schedule D': 'Capital Gains',
            'K1': 'Partner/Shareholder Income',
            'Loan Estimate': 'Loan Estimate Form',
            'Closing Disclosure': 'Closing Disclosure Form',
            'Paystub': 'Payroll Stub',
            'W2': 'Wage and Tax Statement',
            '1099': 'Miscellaneous Income'
        };
        
        this.extractedData = {};
        this.currentFile = null;
        this.pdfjsLoaded = false;
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeEventListeners());
        } else {
            this.initializeEventListeners();
        }
    }
    
    async loadPDFJS() {
        if (this.pdfjsLoaded) return;
        
        return new Promise((resolve, reject) => {
            // Check if PDF.js is already loaded
            if (window.pdfjsLib || window['pdfjs-dist/build/pdf']) {
                this.pdfjsLoaded = true;
                resolve();
                return;
            }
            
            // Load PDF.js from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                this.pdfjsLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load PDF.js library'));
            };
            document.head.appendChild(script);
        });
    }
    
    // Method to handle file input selection
    async handleFileSelection(files) {
        const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showNotification('Please select PDF files only', 'warning');
            return;
        }
        
        // Process each PDF file
        for (const file of pdfFiles) {
            console.log('Processing selected PDF file:', file.name);
            await this.processPDFFile(file);
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            default:
                notification.style.background = '#3b82f6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    displayExtractedData(data, fileName) {
        console.log('Displaying extracted data for:', fileName, data);
        
        // Show the preview section
        const preview = document.getElementById('pdfPreview');
        const extractedDataDiv = document.getElementById('extractedData');
        const useDataBtn = document.getElementById('useDataBtn');
        
        if (preview && extractedDataDiv) {
            preview.classList.remove('d-none');
            
            // Format the extracted data for display
            let displayText = `File: ${fileName}\n`;
            displayText += `Form Type: ${data.formType}\n`;
            displayText += `Processed: ${new Date(data.processedAt).toLocaleString()}\n\n`;
            
            if (data.data) {
                displayText += 'Extracted Data:\n';
                Object.entries(data.data).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        displayText += `${key}: ${value}\n`;
                    }
                });
            }
            
            extractedDataDiv.textContent = displayText;
            
            // Show the "Use This Data" button
            if (useDataBtn) {
                useDataBtn.classList.remove('d-none');
            }
        }
    }
    
    populateCalculatorForms(data) {
        console.log('Populating calculator forms with data:', data);
        
        const formType = data.formType;
        const extractedFields = data.data?.extractedFields || {};
        
        // Determine which calculator to populate based on form type
        let targetCalculator = null;
        
        switch (formType) {
            case '1040':
                // Could populate income calculator
                targetCalculator = 'income-calculator';
                break;
            case 'Schedule C':
                targetCalculator = 'schedule-c-calculator';
                break;
            case 'Schedule E':
                targetCalculator = 'schedule-e-calculator';
                break;
            case 'W2':
                targetCalculator = 'income-calculator';
                break;
            case 'Loan Estimate':
                targetCalculator = 'apr-calculator';
                break;
            case 'Closing Disclosure':
                targetCalculator = 'apr-calculator';
                break;
            default:
                console.log('Unknown form type, cannot determine target calculator');
                return false;
        }
        
        // Store the data for use when navigating to the calculator
        sessionStorage.setItem('extractedPDFData', JSON.stringify({
            formType: formType,
            data: extractedFields,
            timestamp: new Date().toISOString()
        }));
        
        // Show success message and offer to navigate
        this.showNotification(`Data extracted successfully! Ready to populate ${targetCalculator.replace('-', ' ')}.`, 'success');
        
        // Ask user if they want to navigate to the appropriate calculator
        if (confirm(`Would you like to navigate to the ${targetCalculator.replace('-', ' ')} to use this data?`)) {
            window.location.href = `calculators/${targetCalculator}.html`;
        }
        
        return true;
    }
    
    initializeEventListeners() {
        console.log('Initializing PDF parser event listeners...');
        
        // Global drag and drop handlers
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        
        // Initialize drop zones with a delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeDropZones();
        }, 100);
        
        // Also initialize when DOM changes (for dynamic content)
        const observer = new MutationObserver(() => {
            this.initializeDropZones();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    initializeDropZones() {
        // Drop zone specific handlers
        const dropZones = document.querySelectorAll('.pdf-drop-zone, #dropZone');
        console.log('Found drop zones:', dropZones.length);
        
        dropZones.forEach(zone => {
            // Remove existing listeners to prevent duplicates
            zone.removeEventListener('dragover', this.handleDragOver.bind(this));
            zone.removeEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.removeEventListener('drop', this.handleDrop.bind(this));
            
            // Add new listeners
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
            
            console.log('Added event listeners to drop zone:', zone.id || zone.className);
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        
        // Add visual feedback
        const dropZone = e.target.closest('.pdf-drop-zone, #dropZone');
        if (dropZone) {
            dropZone.style.borderColor = 'var(--primary-500)';
            dropZone.style.background = 'rgba(59, 130, 246, 0.1)';
        }
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove visual feedback
        const dropZone = e.target.closest('.pdf-drop-zone, #dropZone');
        if (dropZone) {
            dropZone.style.borderColor = 'var(--border-primary)';
            dropZone.style.background = 'transparent';
        }
    }
    
    async handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('PDF drop event triggered');
        
        const files = Array.from(e.dataTransfer.files);
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showNotification('Please drop PDF files only', 'warning');
            return;
        }
        
        // Remove visual feedback
        const dropZone = e.target.closest('.pdf-drop-zone, #dropZone');
        if (dropZone) {
            dropZone.style.borderColor = 'var(--border-primary)';
            dropZone.style.background = 'transparent';
        }
        
        // Process each PDF file
        for (const file of pdfFiles) {
            console.log('Processing PDF file:', file.name);
            await this.processPDFFile(file);
        }
    }
    
    async processPDFFile(file) {
        try {
            console.log('Starting PDF processing for:', file.name);
            this.showNotification(`Processing ${file.name}...`, 'info');
            
            // Check if we're in Electron environment
            if (window.require) {
                await this.processPDFInElectron(file);
            } else {
                await this.processPDFInBrowser(file);
            }
            
        } catch (error) {
            console.error('Error processing PDF:', error);
            this.showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
        }
    }
    
    async processPDFInElectron(file) {
        const { ipcRenderer } = window.require('electron');
        
        // Send file to main process for processing
        const result = await ipcRenderer.invoke('process-pdf', file.path);
        
        if (result.success) {
            this.extractedData[file.name] = result.data;
            this.displayExtractedData(result.data, file.name);
            this.showNotification(`Successfully processed ${file.name}`, 'success');
        } else {
            throw new Error(result.error);
        }
    }
    
    async processPDFInBrowser(file) {
        try {
            console.log('Processing PDF in browser for:', file.name);
            
            // Wait for PDF.js to be available
            let pdfjsLib = window.pdfjsLib;
            console.log('Initial pdfjsLib check:', !!pdfjsLib);
            
            // If not immediately available, wait a bit and try again
            if (!pdfjsLib) {
                console.log('PDF.js not immediately available, waiting...');
                await new Promise(resolve => setTimeout(resolve, 100));
                pdfjsLib = window.pdfjsLib;
                console.log('After wait, pdfjsLib:', !!pdfjsLib);
            }
            
            if (!pdfjsLib) {
                console.log('Loading PDF.js from CDN...');
                // Try to load from CDN if not available
                await this.loadPDFJS();
                pdfjsLib = window.pdfjsLib;
                console.log('After loading, pdfjsLib:', !!pdfjsLib);
            }
            
            if (!pdfjsLib || !pdfjsLib.GlobalWorkerOptions) {
                console.error('PDF.js library not available:', { pdfjsLib: !!pdfjsLib, hasGlobalWorkerOptions: !!(pdfjsLib && pdfjsLib.GlobalWorkerOptions) });
                throw new Error('PDF.js library not available. Please check your internet connection.');
            }
            
            console.log('PDF.js library loaded successfully, setting worker source...');
            // Set worker source
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
            let fullText = '';
            
            // Extract text from all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            // Analyze the content to determine form type and extract relevant data
            const formType = this.detectFormType(fullText);
            const extractedData = this.extractDataByFormType(fullText, formType);
            
            this.extractedData[file.name] = {
                formType: formType,
                data: extractedData,
                rawText: fullText,
                fileName: file.name,
                processedAt: new Date().toISOString()
            };
            
            this.displayExtractedData(this.extractedData[file.name], file.name);
            this.showNotification(`Successfully processed ${file.name} (${formType})`, 'success');
        } catch (error) {
            console.error('Error processing PDF in browser:', error);
            this.showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
            throw error;
        }
    }
    
    detectFormType(text) {
        const upperText = text.toUpperCase();
        
        // Check for specific form identifiers
        if (upperText.includes('FORM 1040') || upperText.includes('INDIVIDUAL INCOME TAX RETURN')) {
            return '1040';
        } else if (upperText.includes('FORM 1065') || upperText.includes('PARTNERSHIP RETURN')) {
            return '1065';
        } else if (upperText.includes('FORM 1120') || upperText.includes('CORPORATE INCOME TAX RETURN')) {
            return '1120';
        } else if (upperText.includes('FORM 1120S') || upperText.includes('S CORPORATION')) {
            return '1120S';
        } else if (upperText.includes('SCHEDULE C') || upperText.includes('PROFIT OR LOSS FROM BUSINESS')) {
            return 'Schedule C';
        } else if (upperText.includes('SCHEDULE E') || upperText.includes('SUPPLEMENTAL INCOME AND LOSS')) {
            return 'Schedule E';
        } else if (upperText.includes('SCHEDULE B') || upperText.includes('INTEREST AND ORDINARY DIVIDENDS')) {
            return 'Schedule B';
        } else if (upperText.includes('SCHEDULE D') || upperText.includes('CAPITAL GAINS AND LOSSES')) {
            return 'Schedule D';
        } else if (upperText.includes('K-1') || upperText.includes('SCHEDULE K-1')) {
            return 'K1';
        } else if (upperText.includes('LOAN ESTIMATE')) {
            return 'Loan Estimate';
        } else if (upperText.includes('CLOSING DISCLOSURE')) {
            return 'Closing Disclosure';
        } else if (upperText.includes('W-2') || upperText.includes('WAGE AND TAX STATEMENT')) {
            return 'W2';
        } else if (upperText.includes('1099')) {
            return '1099';
        } else if (upperText.includes('PAYSTUB') || upperText.includes('PAYROLL') || upperText.includes('PAY CHECK')) {
            return 'Paystub';
        }
        
        return 'Unknown';
    }
    
    extractDataByFormType(text, formType) {
        const data = {
            formType: formType,
            extractedFields: {},
            confidence: 0.8
        };
        
        switch (formType) {
            case '1040':
                data.extractedFields = this.extract1040Data(text);
                break;
            case 'Schedule C':
                data.extractedFields = this.extractScheduleCData(text);
                break;
            case 'Schedule E':
                data.extractedFields = this.extractScheduleEData(text);
                break;
            case 'W2':
                data.extractedFields = this.extractW2Data(text);
                break;
            case 'Loan Estimate':
                data.extractedFields = this.extractLoanEstimateData(text);
                break;
            case 'Closing Disclosure':
                data.extractedFields = this.extractClosingDisclosureData(text);
                break;
            default:
                data.extractedFields = this.extractGenericData(text);
        }
        
        return data;
    }
    
    extract1040Data(text) {
        const data = {};
        
        // Extract common 1040 fields using regex patterns
        const patterns = {
            wages: /(?:Wages, salaries, tips, etc\.|Line 1)\s*\$?\s*([\d,]+\.?\d*)/i,
            businessIncome: /(?:Business income or loss|Line 3)\s*\$?\s*([\d,]+\.?\d*)/i,
            totalIncome: /(?:Total income|Line 9)\s*\$?\s*([\d,]+\.?\d*)/i,
            adjustedGrossIncome: /(?:Adjusted gross income|Line 11)\s*\$?\s*([\d,]+\.?\d*)/i,
            taxableIncome: /(?:Taxable income|Line 15)\s*\$?\s*([\d,]+\.?\d*)/i,
            totalTax: /(?:Total tax|Line 24)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[field] = this.parseCurrency(match[1]);
            }
        }
        
        return data;
    }
    
    extractScheduleCData(text) {
        const data = {};
        
        const patterns = {
            grossReceipts: /(?:Gross receipts or sales|Line 1)\s*\$?\s*([\d,]+\.?\d*)/i,
            returns: /(?:Returns and allowances|Line 2)\s*\$?\s*([\d,]+\.?\d*)/i,
            otherIncome: /(?:Other income|Line 6)\s*\$?\s*([\d,]+\.?\d*)/i,
            grossIncome: /(?:Gross income|Line 7)\s*\$?\s*([\d,]+\.?\d*)/i,
            totalExpenses: /(?:Total expenses|Line 28)\s*\$?\s*([\d,]+\.?\d*)/i,
            netProfit: /(?:Net profit or loss|Line 31)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[field] = this.parseCurrency(match[1]);
            }
        }
        
        return data;
    }
    
    extractScheduleEData(text) {
        const data = {};
        
        const patterns = {
            rentalIncome: /(?:Rents received|Line 3)\s*\$?\s*([\d,]+\.?\d*)/i,
            rentalExpenses: /(?:Total rental expenses|Line 20)\s*\$?\s*([\d,]+\.?\d*)/i,
            netRentalIncome: /(?:Net rental income or loss|Line 21)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[field] = this.parseCurrency(match[1]);
            }
        }
        
        return data;
    }
    
    extractW2Data(text) {
        const data = {};
        
        const patterns = {
            wages: /(?:Wages, tips, other comp\.|Box 1)\s*\$?\s*([\d,]+\.?\d*)/i,
            federalTax: /(?:Federal income tax withheld|Box 2)\s*\$?\s*([\d,]+\.?\d*)/i,
            socialSecurity: /(?:Social security wages|Box 3)\s*\$?\s*([\d,]+\.?\d*)/i,
            medicare: /(?:Medicare wages and tips|Box 5)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[field] = this.parseCurrency(match[1]);
            }
        }
        
        return data;
    }
    
    extractLoanEstimateData(text) {
        const data = {};
        
        const patterns = {
            loanAmount: /(?:Loan amount|Principal and Interest)\s*\$?\s*([\d,]+\.?\d*)/i,
            interestRate: /(?:Interest rate|Rate)\s*([\d.]+)%/i,
            monthlyPayment: /(?:Estimated total monthly payment|Monthly Payment)\s*\$?\s*([\d,]+\.?\d*)/i,
            totalClosingCosts: /(?:Total closing costs|Closing Costs)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                if (field === 'interestRate') {
                    data[field] = parseFloat(match[1]);
                } else {
                    data[field] = this.parseCurrency(match[1]);
                }
            }
        }
        
        return data;
    }
    
    extractClosingDisclosureData(text) {
        const data = {};
        
        const patterns = {
            loanAmount: /(?:Loan amount|Principal and Interest)\s*\$?\s*([\d,]+\.?\d*)/i,
            interestRate: /(?:Interest rate|Rate)\s*([\d.]+)%/i,
            monthlyPayment: /(?:Estimated total monthly payment|Monthly Payment)\s*\$?\s*([\d,]+\.?\d*)/i,
            totalClosingCosts: /(?:Total closing costs|Closing Costs)\s*\$?\s*([\d,]+\.?\d*)/i,
            cashToClose: /(?:Cash to close|Cash to Borrower)\s*\$?\s*([\d,]+\.?\d*)/i
        };
        
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                if (field === 'interestRate') {
                    data[field] = parseFloat(match[1]);
                } else {
                    data[field] = this.parseCurrency(match[1]);
                }
            }
        }
        
        return data;
    }
    
    extractGenericData(text) {
        const data = {};
        
        // Look for common financial patterns
        const currencyPattern = /\$?\s*([\d,]+\.?\d*)/g;
        const matches = text.match(currencyPattern);
        
        if (matches) {
            data.currencyValues = matches.map(match => this.parseCurrency(match));
        }
        
        // Look for percentages
        const percentPattern = /([\d.]+)%/g;
        const percentMatches = text.match(percentPattern);
        
        if (percentMatches) {
            data.percentages = percentMatches.map(match => parseFloat(match));
        }
        
        return data;
    }
    
    parseCurrency(value) {
        if (typeof value === 'string') {
            return parseFloat(value.replace(/[$,]/g, ''));
        }
        return parseFloat(value) || 0;
    }
    
    displayExtractedData(data, fileName) {
        const previewElement = document.getElementById('pdfPreview');
        const dataElement = document.getElementById('extractedData');
        const useDataBtn = document.getElementById('useDataBtn');
        
        if (previewElement && dataElement) {
            previewElement.classList.remove('d-none');
            
            let html = `<div class="mb-4"><strong>File:</strong> ${fileName}</div>`;
            html += `<div class="mb-4"><strong>Form Type:</strong> ${data.formType}</div>`;
            
            if (data.extractedFields && Object.keys(data.extractedFields).length > 0) {
                html += '<div class="mb-4"><strong>Extracted Data:</strong></div>';
                html += '<div class="grid grid-cols-2 gap-2">';
                
                for (const [field, value] of Object.entries(data.extractedFields)) {
                    const formattedValue = typeof value === 'number' ? 
                        (value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`) : 
                        value;
                    html += `<div><strong>${this.formatFieldName(field)}:</strong></div>`;
                    html += `<div>${formattedValue}</div>`;
                }
                
                html += '</div>';
            }
            
            dataElement.innerHTML = html;
            
            if (useDataBtn) {
                useDataBtn.classList.remove('d-none');
            }
        }
    }
    
    formatFieldName(field) {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([A-Z])/g, ' $1')
            .trim();
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
    
    // Method to populate calculator forms with extracted data
    populateCalculatorForm(calculatorType, data) {
        const formData = data.extractedFields;
        
        switch (calculatorType) {
            case 'apr':
                this.populateAPRCalculator(formData);
                break;
            case 'buydown':
                this.populateBuydownCalculator(formData);
                break;
            case 'income':
                this.populateIncomeCalculator(formData);
                break;
            case 'schedule-c':
                this.populateScheduleCCalculator(formData);
                break;
            case 'schedule-e':
                this.populateScheduleECalculator(formData);
                break;
            default:
                console.log('Unknown calculator type:', calculatorType);
        }
    }
    
    populateAPRCalculator(data) {
        // Implementation for APR calculator population
        if (data.loanAmount) {
            const input = document.querySelector('input[name="loanAmount"], #loanAmount');
            if (input) input.value = data.loanAmount;
        }
        
        if (data.interestRate) {
            const input = document.querySelector('input[name="interestRate"], #interestRate');
            if (input) input.value = data.interestRate;
        }
        
        if (data.monthlyPayment) {
            const input = document.querySelector('input[name="monthlyPayment"], #monthlyPayment');
            if (input) input.value = data.monthlyPayment;
        }
    }
    
    populateBuydownCalculator(data) {
        // Implementation for buydown calculator population
        if (data.loanAmount) {
            const input = document.querySelector('input[name="loanAmount"], #loanAmount');
            if (input) input.value = data.loanAmount;
        }
        
        if (data.interestRate) {
            const input = document.querySelector('input[name="interestRate"], #interestRate');
            if (input) input.value = data.interestRate;
        }
    }
    
    populateIncomeCalculator(data) {
        // Implementation for income calculator population
        if (data.wages) {
            const input = document.querySelector('input[name="wages"], #wages');
            if (input) input.value = data.wages;
        }
        
        if (data.businessIncome) {
            const input = document.querySelector('input[name="businessIncome"], #businessIncome');
            if (input) input.value = data.businessIncome;
        }
        
        if (data.totalIncome) {
            const input = document.querySelector('input[name="totalIncome"], #totalIncome');
            if (input) input.value = data.totalIncome;
        }
    }
    
    populateScheduleCCalculator(data) {
        // Implementation for Schedule C calculator population
        if (data.grossReceipts) {
            const input = document.querySelector('input[name="grossReceipts"], #grossReceipts');
            if (input) input.value = data.grossReceipts;
        }
        
        if (data.netProfit) {
            const input = document.querySelector('input[name="netProfit"], #netProfit');
            if (input) input.value = data.netProfit;
        }
    }
    
    populateScheduleECalculator(data) {
        // Implementation for Schedule E calculator population
        if (data.rentalIncome) {
            const input = document.querySelector('input[name="rentalIncome"], #rentalIncome');
            if (input) input.value = data.rentalIncome;
        }
        
        if (data.netRentalIncome) {
            const input = document.querySelector('input[name="netRentalIncome"], #netRentalIncome');
            if (input) input.value = data.netRentalIncome;
        }
    }
}

// Initialize PDF parser when DOM is loaded
let pdfParser;
document.addEventListener('DOMContentLoaded', function() {
    pdfParser = new PDFParser();
});

// Export for use in other modules
window.PDFParser = PDFParser;
