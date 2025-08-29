"""
PDF Text Extraction Utility

This module handles PDF text extraction using pdfplumber.
"""

import logging
import pdfplumber
from typing import Dict, Any
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file: FileStorage) -> Dict[str, Any]:
    """
    Extract text from a PDF file using pdfplumber
    
    Args:
        file: FileStorage object containing the PDF file
        
    Returns:
        Dict containing success status and extracted text
    """
    try:
        logger.info(f"Starting PDF text extraction for file: {file.filename}")
        
        # Read PDF content
        pdf_content = file.read()
        file.seek(0)  # Reset file pointer for potential future reads
        
        # Extract text from PDF
        text_content = ""
        with pdfplumber.open(pdf_content) as pdf:
            logger.info(f"PDF opened successfully. Total pages: {len(pdf.pages)}")
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_content += f"\n--- Page {page_num} ---\n{page_text}\n"
                        logger.info(f"Extracted {len(page_text)} characters from page {page_num}")
                    else:
                        logger.warning(f"No text found on page {page_num} - this may be an image-based PDF")
                except Exception as e:
                    logger.error(f"Error extracting text from page {page_num}: {str(e)}")
                    continue
        
        if not text_content.strip():
            logger.warning("No text content extracted from PDF")
            return {
                'success': False,
                'error': 'Could not extract text from PDF. The document may be encrypted, scanned as image, or corrupted. Try taking a screenshot or photo of the document instead.'
            }
        
        logger.info(f"Successfully extracted {len(text_content)} characters from PDF")
        return {
            'success': True,
            'text': text_content.strip(),
            'pages_processed': len(pdf.pages) if 'pdf' in locals() else 0
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF file: {str(e)}")
        return {
            'success': False,
            'error': f'Error processing PDF file: {str(e)}'
        }
