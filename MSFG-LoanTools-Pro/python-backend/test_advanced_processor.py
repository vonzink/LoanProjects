#!/usr/bin/env python3
"""
Test script for the Advanced Tax Processor integration.

This script tests the new advanced processor functionality
to ensure it's properly integrated with the Flask backend.
"""

import sys
import os
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_advanced_processor_import():
    """Test if the advanced processor can be imported."""
    try:
        from advanced_processor import AdvancedTaxProcessor
        logger.info("✓ Advanced Tax Processor imported successfully")
        return True
    except ImportError as e:
        logger.error(f"✗ Failed to import Advanced Tax Processor: {e}")
        return False

def test_processor_initialization():
    """Test if the processor can be initialized."""
    try:
        from advanced_processor import AdvancedTaxProcessor
        processor = AdvancedTaxProcessor()
        logger.info("✓ Advanced Tax Processor initialized successfully")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to initialize Advanced Tax Processor: {e}")
        return False

def test_supported_forms():
    """Test if supported forms can be retrieved."""
    try:
        from advanced_processor import AdvancedTaxProcessor
        processor = AdvancedTaxProcessor()
        forms = processor.get_supported_forms()
        logger.info(f"✓ Supported forms retrieved: {forms}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to get supported forms: {e}")
        return False

def test_processor_status():
    """Test if processor status can be retrieved."""
    try:
        from advanced_processor import AdvancedTaxProcessor
        processor = AdvancedTaxProcessor()
        status = processor.get_processing_status()
        logger.info(f"✓ Processor status retrieved: {status}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to get processor status: {e}")
        return False

def test_form_extractors():
    """Test if form extractors can be imported and initialized."""
    try:
        from advanced_processor.field_extraction.extractors import (
            ScheduleCExtractor,
            Form1040Extractor,
            ScheduleEExtractor
        )
        
        # Test Schedule C extractor
        schedule_c = ScheduleCExtractor()
        fields = schedule_c.get_supported_fields()
        logger.info(f"✓ Schedule C extractor initialized with fields: {fields}")
        
        # Test Form 1040 extractor
        form_1040 = Form1040Extractor()
        fields = form_1040.get_supported_fields()
        logger.info(f"✓ Form 1040 extractor initialized with fields: {fields}")
        
        # Test Schedule E extractor
        schedule_e = ScheduleEExtractor()
        fields = schedule_e.get_supported_fields()
        logger.info(f"✓ Schedule E extractor initialized with fields: {fields}")
        
        return True
    except Exception as e:
        logger.error(f"✗ Failed to test form extractors: {e}")
        return False

def test_ocr_engine():
    """Test if OCR engine can be imported and initialized."""
    try:
        from advanced_processor.ocr.engine import OCREngine
        ocr_engine = OCREngine()
        engines = ocr_engine.get_available_engines()
        logger.info(f"✓ OCR Engine initialized with engines: {engines}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to test OCR engine: {e}")
        return False

def test_validation():
    """Test if validation system can be imported and initialized."""
    try:
        from advanced_processor.validation.validator import DataValidator
        validator = DataValidator()
        logger.info("✓ Data Validator initialized successfully")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to test validation system: {e}")
        return False

def main():
    """Run all tests."""
    logger.info("Starting Advanced Tax Processor integration tests...")
    logger.info("=" * 60)
    
    tests = [
        ("Advanced Processor Import", test_advanced_processor_import),
        ("Processor Initialization", test_processor_initialization),
        ("Supported Forms", test_supported_forms),
        ("Processor Status", test_processor_status),
        ("Form Extractors", test_form_extractors),
        ("OCR Engine", test_ocr_engine),
        ("Validation System", test_validation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"\nRunning test: {test_name}")
        try:
            if test_func():
                passed += 1
                logger.info(f"✓ {test_name} PASSED")
            else:
                logger.error(f"✗ {test_name} FAILED")
        except Exception as e:
            logger.error(f"✗ {test_name} FAILED with exception: {e}")
    
    logger.info("\n" + "=" * 60)
    logger.info(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Advanced Tax Processor is ready.")
        return 0
    else:
        logger.error("❌ Some tests failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
