# MSFG Loan Tools Pro

A comprehensive loan processing toolkit with automated document parsing and income calculation capabilities.

## 🚀 Features

- **Document Parsing**: Automated extraction of financial data from tax forms
- **Income Calculators**: Specialized calculators for different business types
- **PDF/Image Support**: Process both PDF documents and image files
- **Real-time Processing**: Instant field population from uploaded documents
- **Multi-form Support**: Form 1040, 1065, 1120, Schedule C, Schedule E, W-2, and more

## 📁 Project Structure

```
MSFG-LoanTools-Pro/
├── 📁 frontend/                 # Frontend application
│   ├── 📁 public/              # Static files
│   │   ├── 📁 calculators/     # Calculator pages
│   │   ├── 📁 income-calculators/ # Income calculator pages
│   │   ├── 📁 assets/          # Images, icons, etc.
│   │   ├── 📁 css/             # Stylesheets
│   │   ├── 📁 js/              # JavaScript files
│   │   └── index.html          # Main hub page
│   ├── package.json            # Frontend dependencies
│   └── README.md               # Frontend documentation
├── 📁 backend/                 # Python backend API
│   ├── 📁 parsers/             # Document parsers
│   │   ├── base_parser.py      # Base parser class
│   │   ├── form_1040_parser.py # Form 1040 parser
│   │   ├── form_1065_parser.py # Form 1065 parser
│   │   ├── form_1120_parser.py # Form 1120 parser
│   │   ├── schedule_c_parser.py # Schedule C parser
│   │   ├── schedule_e_parser.py # Schedule E parser
│   │   └── w2_parser.py        # W-2 parser
│   ├── 📁 utils/               # Utility functions
│   │   ├── pdf_extractor.py    # PDF text extraction
│   │   ├── image_extractor.py  # Image OCR processing
│   │   └── text_processor.py   # Text processing utilities
│   ├── 📁 api/                 # API routes and middleware
│   │   ├── routes.py           # API endpoint definitions
│   │   └── middleware.py       # Request/response middleware
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Backend documentation
├── 📁 docs/                    # Project documentation
│   ├── API.md                  # API documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── DEVELOPMENT.md          # Development guide
├── 📁 scripts/                 # Utility scripts
│   ├── deploy.sh               # Deployment script
│   ├── setup.sh                # Setup script
│   └── test.sh                 # Testing script
├── package.json                # Project configuration
└── README.md                   # This file
```

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- Tesseract OCR (for image processing)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MSFG-LoanTools-Pro
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run serve
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)

## 🔧 Development

### Adding New Parsers

1. Create a new parser class in `backend/parsers/`
2. Inherit from `BaseParser`
3. Define field mappings and document indicators
4. Add API route in `backend/api/routes.py`
5. Update frontend calculator with PDF parsing

### Adding New Calculators

1. Create HTML calculator in `frontend/public/income-calculators/`
2. Add PDF parsing JavaScript class
3. Update main hub page with navigation
4. Test with real documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software for MSFG Loan Tools.

## 🆘 Support

For support and questions, please contact the development team.


