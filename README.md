# Schedule C Parser API

A Python Flask API for parsing Schedule C tax forms from PDFs and images using OCR.

## Features

- **PDF Parsing**: Extract text from PDF files using pdfplumber
- **Image OCR**: Extract text from images using Tesseract OCR
- **Smart Field Detection**: Automatically identify Schedule C fields
- **Target Location Support**: Specify where to put data (Business 1/2, Current/Prior year)
- **Error Handling**: Clear error messages for encrypted or corrupted files
- **CORS Support**: Works with web frontends

## Installation

### Prerequisites

1. **Python 3.8+**
2. **Tesseract OCR** (for image processing)

#### Install Tesseract:

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from https://github.com/UB-Mannheim/tesseract/wiki

### Setup

1. **Clone and navigate to the project:**
```bash
cd python-backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the server:**
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns API status.

### Parse Schedule C
```
POST /parse-schedule-c
```

**Parameters:**
- `file`: PDF or image file (multipart/form-data)
- `target_location`: Where to put the data (optional, default: business1_current)

**Target Location Options:**
- `business1_current` - Business 1, Current Year
- `business1_prior` - Business 1, Prior Year  
- `business2_current` - Business 2, Current Year
- `business2_prior` - Business 2, Prior Year

**Response:**
```json
{
  "success": true,
  "data": {
    "net_profit": 69297,
    "other_income": 0,
    "depletion": 0,
    "depreciation": 0,
    "meals": 4250,
    "home_office": 0
  },
  "target_location": "business1_current",
  "filename": "schedule_c.pdf",
  "raw_text": "First 1000 characters of extracted text..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Could not extract text from PDF. The document may be encrypted, scanned as image, or corrupted."
}
```

## Supported File Types

- **PDF**: .pdf
- **Images**: .jpg, .jpeg, .png, .gif, .bmp

## Field Mapping

The API extracts the following Schedule C fields:

| Field | Line | Description |
|-------|------|-------------|
| net_profit | 31 | Net Profit or Loss |
| other_income | 6 | Other Income |
| depletion | 12 | Depletion |
| depreciation | 13 | Depreciation |
| meals | 24b | Deductible Meals |
| home_office | 30 | Business Use of Home |

## Error Handling

The API provides clear error messages for common issues:

- **Encrypted PDFs**: "Could not extract text from PDF. The document may be encrypted..."
- **Scanned Images**: "Could not extract text from image. Please ensure the image is clear..."
- **Wrong Document Type**: "This document does not appear to be a Schedule C form..."
- **Corrupted Files**: "Error processing PDF: [specific error]"

## Usage Examples

### Using curl:
```bash
curl -X POST -F "file=@schedule_c.pdf" -F "target_location=business1_current" http://localhost:5000/parse-schedule-c
```

### Using Python requests:
```python
import requests

files = {'file': open('schedule_c.pdf', 'rb')}
data = {'target_location': 'business1_current'}
response = requests.post('http://localhost:5000/parse-schedule-c', files=files, data=data)
result = response.json()
print(result)
```

## Development

### Running in Development Mode:
```bash
python app.py
```

### Running in Production:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

1. **Tesseract not found**: Update the path in app.py
2. **PDF parsing fails**: Check if PDF is encrypted or corrupted
3. **OCR quality poor**: Ensure images are clear and high resolution
4. **CORS issues**: CORS is enabled by default, but check browser console for errors

## License

This project is for internal use at MSFG.
