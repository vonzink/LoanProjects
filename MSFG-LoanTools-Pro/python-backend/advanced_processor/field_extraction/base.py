"""
Base Extractor - Foundation for Form-Specific Field Extraction

This module provides the base class for all tax form extractors,
defining the common interface and shared functionality.
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Union
import re

logger = logging.getLogger(__name__)

class BaseExtractor(ABC):
    """
    Abstract base class for tax form field extractors.
    
    All form-specific extractors must implement the methods defined here
    to ensure consistent behavior across different tax forms.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the base extractor.
        
        Args:
            config: Configuration dictionary for extraction options
        """
        self.config = config or {}
        self.field_patterns = self._get_field_patterns()
        self.validation_rules = self._get_validation_rules()
        
        logger.info(f"{self.__class__.__name__} initialized")
    
    @abstractmethod
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """
        Get field extraction patterns for this form type.
        
        Returns:
            Dictionary mapping field names to extraction patterns and metadata
        """
        pass
    
    @abstractmethod
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """
        Get validation rules for extracted fields.
        
        Returns:
            Dictionary mapping field names to validation rules
        """
        pass
    
    @abstractmethod
    def get_supported_fields(self) -> List[str]:
        """
        Get list of fields that can be extracted from this form type.
        
        Returns:
            List of supported field names
        """
        pass
    
    def extract_fields(self, ocr_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract all supported fields from OCR results.
        
        Args:
            ocr_results: Dictionary containing OCR text and metadata
            
        Returns:
            Dictionary mapping field names to extracted values
        """
        try:
            extracted_data = {}
            text = ocr_results.get('text', '')
            
            if not text:
                logger.warning("No text content available for extraction")
                return {}
            
            # Extract each supported field
            for field_name in self.get_supported_fields():
                try:
                    field_value = self._extract_single_field(field_name, text)
                    if field_value is not None:
                        extracted_data[field_name] = field_value
                except Exception as e:
                    logger.warning(f"Failed to extract field {field_name}: {str(e)}")
                    extracted_data[field_name] = None
            
            # Apply post-processing
            extracted_data = self._post_process_extracted_data(extracted_data)
            
            logger.info(f"Extracted {len(extracted_data)} fields successfully")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Field extraction failed: {str(e)}")
            return {}
    
    def _extract_single_field(self, field_name: str, text: str) -> Optional[Any]:
        """
        Extract a single field using its defined patterns.
        
        Args:
            field_name: Name of the field to extract
            text: OCR text to search in
            
        Returns:
            Extracted field value or None if not found
        """
        if field_name not in self.field_patterns:
            logger.warning(f"No patterns defined for field: {field_name}")
            return None
        
        field_config = self.field_patterns[field_name]
        patterns = field_config.get('patterns', [])
        
        # Try each pattern until one matches
        for pattern in patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    value = match.group(1) if match.groups() else match.group(0)
                    processed_value = self._process_field_value(field_name, value, field_config)
                    logger.debug(f"Field {field_name} extracted with pattern: {pattern}")
                    return processed_value
            except Exception as e:
                logger.debug(f"Pattern {pattern} failed for field {field_name}: {str(e)}")
                continue
        
        # No patterns matched
        logger.debug(f"No patterns matched for field: {field_name}")
        return None
    
    def _process_field_value(self, field_name: str, value: str, field_config: Dict[str, Any]) -> Any:
        """
        Process extracted field value based on field configuration.
        
        Args:
            field_name: Name of the field
            value: Raw extracted value
            field_config: Field configuration dictionary
            
        Returns:
            Processed field value
        """
        try:
            # Get field type and apply appropriate processing
            field_type = field_config.get('type', 'string')
            
            if field_type == 'currency':
                return self._parse_currency(value)
            elif field_type == 'integer':
                return self._parse_integer(value)
            elif field_type == 'float':
                return self._parse_float(value)
            elif field_type == 'date':
                return self._parse_date(value)
            elif field_type == 'boolean':
                return self._parse_boolean(value)
            else:
                # Default to string, clean up whitespace
                return value.strip() if value else None
                
        except Exception as e:
            logger.warning(f"Value processing failed for field {field_name}: {str(e)}")
            return value
    
    def _parse_currency(self, value: str) -> Optional[float]:
        """Parse currency value from string."""
        if not value:
            return None
        
        try:
            # Remove currency symbols, commas, and whitespace
            cleaned = re.sub(r'[$,€£¥\s]', '', str(value))
            return float(cleaned) if cleaned else None
        except (ValueError, TypeError):
            return None
    
    def _parse_integer(self, value: str) -> Optional[int]:
        """Parse integer value from string."""
        if not value:
            return None
        
        try:
            # Remove non-digit characters
            cleaned = re.sub(r'[^\d-]', '', str(value))
            return int(cleaned) if cleaned else None
        except (ValueError, TypeError):
            return None
    
    def _parse_float(self, value: str) -> Optional[float]:
        """Parse float value from string."""
        if not value:
            return None
        
        try:
            # Remove non-numeric characters except decimal point
            cleaned = re.sub(r'[^\d.-]', '', str(value))
            return float(cleaned) if cleaned else None
        except (ValueError, TypeError):
            return None
    
    def _parse_date(self, value: str) -> Optional[str]:
        """Parse date value from string."""
        if not value:
            return None
        
        # For now, return as-is. In a real implementation, this would
        # parse various date formats and standardize them
        return value.strip()
    
    def _parse_boolean(self, value: str) -> Optional[bool]:
        """Parse boolean value from string."""
        if not value:
            return None
        
        value_lower = str(value).lower().strip()
        if value_lower in ['true', 'yes', '1', 'checked', 'x']:
            return True
        elif value_lower in ['false', 'no', '0', 'unchecked', '']:
            return False
        
        return None
    
    def _post_process_extracted_data(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply post-processing to extracted data.
        
        Args:
            extracted_data: Dictionary of extracted field values
            
        Returns:
            Post-processed data dictionary
        """
        try:
            # Apply form-specific post-processing
            processed_data = self._apply_form_specific_processing(extracted_data)
            
            # Apply global post-processing
            processed_data = self._apply_global_processing(processed_data)
            
            return processed_data
            
        except Exception as e:
            logger.warning(f"Post-processing failed: {str(e)}")
            return extracted_data
    
    def _apply_form_specific_processing(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply form-specific post-processing logic.
        
        Args:
            extracted_data: Dictionary of extracted field values
            
        Returns:
            Processed data dictionary
        """
        # Override in subclasses for form-specific logic
        return extracted_data
    
    def _apply_global_processing(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply global post-processing logic.
        
        Args:
            extracted_data: Dictionary of extracted field values
            
        Returns:
            Processed data dictionary
        """
        # Remove None values and empty strings
        processed_data = {}
        for field_name, value in extracted_data.items():
            if value is not None and value != '':
                processed_data[field_name] = value
        
        return processed_data
    
    def validate_extracted_data(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate extracted data against defined rules.
        
        Args:
            extracted_data: Dictionary of extracted field values
            
        Returns:
            Validation results dictionary
        """
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'field_validations': {}
        }
        
        for field_name, value in extracted_data.items():
            if field_name in self.validation_rules:
                field_validation = self._validate_field(field_name, value)
                validation_results['field_validations'][field_name] = field_validation
                
                if not field_validation['valid']:
                    validation_results['valid'] = False
                    validation_results['errors'].extend(field_validation['errors'])
                
                if field_validation['warnings']:
                    validation_results['warnings'].extend(field_validation['warnings'])
        
        return validation_results
    
    def _validate_field(self, field_name: str, value: Any) -> Dict[str, Any]:
        """
        Validate a single field against its rules.
        
        Args:
            field_name: Name of the field to validate
            value: Field value to validate
            
        Returns:
            Validation result dictionary
        """
        rules = self.validation_rules.get(field_name, {})
        validation_result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Check required field
        if rules.get('required', False) and (value is None or value == ''):
            validation_result['valid'] = False
            validation_result['errors'].append(f"Field {field_name} is required")
        
        # Check value range
        if value is not None and 'min_value' in rules:
            try:
                if float(value) < rules['min_value']:
                    validation_result['warnings'].append(f"Field {field_name} value {value} is below minimum {rules['min_value']}")
            except (ValueError, TypeError):
                pass
        
        if value is not None and 'max_value' in rules:
            try:
                if float(value) > rules['max_value']:
                    validation_result['warnings'].append(f"Field {field_name} value {value} is above maximum {rules['max_value']}")
            except (ValueError, TypeError):
                pass
        
        # Check format
        if value is not None and 'format' in rules:
            format_pattern = rules['format']
            if not re.match(format_pattern, str(value)):
                validation_result['warnings'].append(f"Field {field_name} value {value} doesn't match expected format")
        
        return validation_result
