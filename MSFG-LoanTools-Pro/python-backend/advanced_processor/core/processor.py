"""
Advanced Tax Processor - Core Processing Engine

This module provides the main processing engine for tax documents with
a multi-layer architecture for high-accuracy data extraction.
"""

import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from PIL import Image
import io

from .pipeline import ProcessingPipeline
from ..field_extraction.extractors import (
    ScheduleCExtractor,
    Form1040Extractor,
    ScheduleEExtractor,
    ScheduleBExtractor,
    Form1065Extractor,
    W2Extractor
)

logger = logging.getLogger(__name__)

class AdvancedTaxProcessor:
    """
    Advanced Tax Processor with multi-layer architecture for high-accuracy
    data extraction from tax documents.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the Advanced Tax Processor.
        
        Args:
            config: Configuration dictionary for processing options
        """
        self.config = config or self._get_default_config()
        self.pipeline = ProcessingPipeline(config)
        
        # Initialize form-specific extractors
        self.extractors = {
            'schedule_c': ScheduleCExtractor(),
            'form_1040': Form1040Extractor(),
            'schedule_e': ScheduleEExtractor(),
            'schedule_b': ScheduleBExtractor(),
            'form_1065': Form1065Extractor(),
            'w2': W2Extractor()
        }
        
        logger.info("Advanced Tax Processor initialized successfully")
    
    def _get_default_config(self) -> Dict:
        """Get default configuration for the processor."""
        return {
            'ocr_engines': ['tesseract', 'paddleocr'],
            'confidence_threshold': 0.7,
            'enable_validation': True,
            'enable_reconciliation': True,
            'output_format': 'json',
            'debug_mode': False
        }
    
    def process_document(
        self, 
        file_path: Union[str, Path], 
        form_type: str,
        target_location: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a tax document and extract structured data.
        
        Args:
            file_path: Path to the tax document (PDF or image)
            form_type: Type of tax form to process
            target_location: Target location identifier for multi-business scenarios
            
        Returns:
            Dictionary containing extracted data and processing metadata
        """
        try:
            logger.info(f"Processing document: {file_path} (Form: {form_type})")
            
            # Validate input
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Document not found: {file_path}")
            
            # Determine form type and get appropriate extractor
            extractor = self._get_extractor(form_type)
            if not extractor:
                raise ValueError(f"Unsupported form type: {form_type}")
            
            # Process through pipeline
            processed_data = self.pipeline.process(
                file_path=file_path,
                form_type=form_type,
                extractor=extractor
            )
            
            # Add metadata
            result = {
                'success': True,
                'form_type': form_type,
                'target_location': target_location,
                'extracted_data': processed_data['extracted_data'],
                'confidence_scores': processed_data['confidence_scores'],
                'processing_metadata': processed_data['metadata'],
                'raw_text': processed_data.get('raw_text', ''),
                'validation_results': processed_data.get('validation_results', {}),
                'warnings': processed_data.get('warnings', []),
                'errors': processed_data.get('errors', [])
            }
            
            logger.info(f"Document processing completed successfully for {form_type}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'form_type': form_type,
                'target_location': target_location
            }
    
    def _get_extractor(self, form_type: str):
        """Get the appropriate extractor for the given form type."""
        form_type_lower = form_type.lower().replace(' ', '_')
        
        # Map form types to extractors
        extractor_mapping = {
            'schedule_c': 'schedule_c',
            'schedulec': 'schedule_c',
            'form_1040': 'form_1040',
            'form1040': 'form_1040',
            '1040': 'form_1040',
            'schedule_e': 'schedule_e',
            'schedulee': 'schedule_e',
            'schedule_b': 'schedule_b',
            'scheduleb': 'schedule_b',
            'form_1065': 'form_1065',
            'form1065': 'form_1065',
            '1065': 'form_1065',
            'w2': 'w2',
            'w-2': 'w2'
        }
        
        extractor_key = extractor_mapping.get(form_type_lower)
        if extractor_key:
            return self.extractors.get(extractor_key)
        
        logger.warning(f"No extractor found for form type: {form_type}")
        return None
    
    def get_supported_forms(self) -> List[str]:
        """Get list of supported tax form types."""
        return [
            'Schedule C',
            'Form 1040',
            'Schedule E',
            'Schedule B',
            'Form 1065',
            'W-2'
        ]
    
    def get_processing_status(self) -> Dict[str, Any]:
        """Get current processing status and system health."""
        return {
            'status': 'operational',
            'version': '1.0.0',
            'supported_forms': self.get_supported_forms(),
            'ocr_engines': self.config.get('ocr_engines', []),
            'confidence_threshold': self.config.get('confidence_threshold', 0.7)
        }
