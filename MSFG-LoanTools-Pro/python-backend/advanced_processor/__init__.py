"""
Advanced Tax Processor for MSFG Loan Tools Pro

A sophisticated multi-layer tax document processing system that provides
high-accuracy data extraction from various tax forms including:
- Form 1040 (Personal)
- Schedule C (Sole Proprietorship)
- Schedule E (Rental Income)
- Schedule B (Interest & Dividends)
- Form 1065 (Partnership)
- W-2 Forms
- And more...

Features:
- Multi-engine OCR (Tesseract, PaddleOCR)
- Intelligent field extraction
- Validation and reconciliation
- Support for PDF and image formats
- High-accuracy data extraction
"""

from .core.processor import AdvancedTaxProcessor
from .core.pipeline import ProcessingPipeline
from .field_extraction.extractors import (
    ScheduleCExtractor,
    Form1040Extractor,
    ScheduleEExtractor,
    ScheduleBExtractor,
    Form1065Extractor,
    W2Extractor
)

__version__ = "1.0.0"
__author__ = "MSFG Development Team"

__all__ = [
    'AdvancedTaxProcessor',
    'ProcessingPipeline',
    'ScheduleCExtractor',
    'Form1040Extractor',
    'ScheduleEExtractor',
    'ScheduleBExtractor',
    'Form1065Extractor',
    'W2Extractor'
]
