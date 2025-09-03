"""
Base Parser Class

This module provides a base class for all document parsers with common functionality.
"""

import re
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class BaseParser(ABC):
    """Base class for all document parsers"""
    
    def __init__(self):
        self.field_mappings: Dict[str, Dict[str, List[str]]] = {}
        self.document_indicators: List[str] = []
        self.parser_name: str = self.__class__.__name__
    
    def parse_currency(self, value: Any) -> float:
        """Convert string to currency value"""
        if not value:
            return 0.0
        try:
            cleaned = re.sub(r'[$,]', '', str(value))
            return float(cleaned) if cleaned else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    def extract_field_value(self, text: str, field_name: str) -> float:
        """Extract a specific field value from text"""
        field_config = self.field_mappings.get(field_name)
        if not field_config:
            return 0.0

        for pattern in field_config['patterns']:
            try:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    value = self.parse_currency(match.group(1))
                    if value > 0:
                        logger.info(f"Found {field_name}: {value}")
                        return value
            except re.error as e:
                logger.error(f"Regex error in pattern '{pattern}': {e}")
                continue

        return 0.0
    
    def is_correct_document_type(self, text: str) -> bool:
        """Check if the text appears to be from the correct document type"""
        if not self.document_indicators:
            return True  # If no indicators defined, assume it's correct
        
        return any(re.search(pattern, text, re.IGNORECASE) 
                  for pattern in self.document_indicators)
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text for parsing"""
        return re.sub(r'\s+', ' ', text).strip()
    
    @abstractmethod
    def parse_document(self, text: str) -> Dict[str, Any]:
        """Parse document text and extract all relevant fields"""
        pass
    
    def get_error_message(self) -> str:
        """Get standardized error message for incorrect document type"""
        return f'This document does not appear to be a {self.parser_name}. Please ensure you are uploading the correct document.'
    
    def get_success_response(self, results: Dict[str, float], text: str) -> Dict[str, Any]:
        """Get standardized success response"""
        return {
            'success': True,
            'data': results,
            'raw_text': text[:2000] + '...' if len(text) > 2000 else text,
            'parser': self.parser_name
        }
    
    def get_error_response(self, text: str) -> Dict[str, Any]:
        """Get standardized error response"""
        return {
            'success': False,
            'error': self.get_error_message(),
            'raw_text': text[:2000] + '...' if len(text) > 2000 else text,
            'parser': self.parser_name
        }






