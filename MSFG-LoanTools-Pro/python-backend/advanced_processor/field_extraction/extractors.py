"""
Form-Specific Field Extractors

This module contains specialized extractors for different tax forms,
each implementing the BaseExtractor interface with form-specific logic.
"""

import logging
from typing import Dict, List, Optional, Any
from .base import BaseExtractor

logger = logging.getLogger(__name__)

class ScheduleCExtractor(BaseExtractor):
    """
    Schedule C (Sole Proprietorship) field extractor.
    
    Extracts key fields from Schedule C tax forms including:
    - Net profit or loss
    - Other income
    - Depreciation and depletion
    - Business use of home
    - Meal and entertainment exclusions
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for Schedule C."""
        return {
            'net_profit': {
                'patterns': [
                    r'31\s+Net\s+profit\s+or\s*\(?loss\)?.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Net\s+profit\s+or\s*\(?loss\)?.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+31.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{5,}(?:,\d{3})*(?:\.\d{2})?)'  # Large numbers (likely net profit)
                ],
                'type': 'currency',
                'description': 'Net Profit or Loss (Line 31)',
                'required': True
            },
            'other_income': {
                'patterns': [
                    r'6\s+Other\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Other\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+6.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'  # Default to 0 if not found
                ],
                'type': 'currency',
                'description': 'Other Income (Line 6)',
                'required': False
            },
            'depletion': {
                'patterns': [
                    r'12\s+Depletion.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Depletion.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+12.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Depletion (Line 12)',
                'required': False
            },
            'depreciation': {
                'patterns': [
                    r'13\s+Depreciation.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Depreciation.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+13.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Depreciation (Line 13)',
                'required': False
            },
            'meals': {
                'patterns': [
                    r'24b\s+Deductible\s+meals.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Deductible\s+meals.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+24b.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Meals.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{4}(?:,\d{3})*(?:\.\d{2})?)'  # Look for numbers around 4000-5000
                ],
                'type': 'currency',
                'description': 'Deductible Meals (Line 24b)',
                'required': False
            },
            'home_office': {
                'patterns': [
                    r'30\s+Expenses\s+for\s+business\s+use\s+of\s+home.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Business\s+use\s+of\s+home.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+30.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Business Use of Home (Line 30)',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for Schedule C fields."""
        return {
            'net_profit': {
                'required': True,
                'min_value': -1000000,
                'max_value': 1000000
            },
            'other_income': {
                'required': False,
                'min_value': -100000,
                'max_value': 100000
            },
            'depletion': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            },
            'depreciation': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            },
            'meals': {
                'required': False,
                'min_value': 0,
                'max_value': 10000
            },
            'home_office': {
                'required': False,
                'min_value': 0,
                'max_value': 50000
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported Schedule C fields."""
        return [
            'net_profit',
            'other_income',
            'depletion',
            'depreciation',
            'meals',
            'home_office'
        ]
    
    def _apply_form_specific_processing(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Schedule C specific post-processing."""
        processed_data = extracted_data.copy()
        
        # Ensure net profit is always present (required field)
        if 'net_profit' not in processed_data or processed_data['net_profit'] is None:
            processed_data['net_profit'] = 0.0
        
        # Set default values for optional fields
        optional_fields = ['other_income', 'depletion', 'depreciation', 'meals', 'home_office']
        for field in optional_fields:
            if field not in processed_data or processed_data[field] is None:
                processed_data[field] = 0.0
        
        return processed_data

class Form1040Extractor(BaseExtractor):
    """
    Form 1040 (Personal Tax Return) field extractor.
    
    Extracts key fields from Form 1040 including:
    - W-2 income
    - Pensions and annuities
    - Alimony and unemployment
    - Social Security benefits
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for Form 1040."""
        return {
            'w2_income': {
                'patterns': [
                    r'Wages,\s*salaries,\s*tips.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+1.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{5,}(?:,\d{3})*(?:\.\d{2})?)'  # Large numbers (likely wages)
                ],
                'type': 'currency',
                'description': 'W-2 Income (Line 1)',
                'required': False
            },
            'pensions': {
                'patterns': [
                    r'Pensions.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Annuities.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+4.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Pensions and Annuities (Line 4)',
                'required': False
            },
            'alimony': {
                'patterns': [
                    r'Alimony.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+8.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Alimony (Line 8)',
                'required': False
            },
            'unemployment': {
                'patterns': [
                    r'Unemployment.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+7.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Unemployment Compensation (Line 7)',
                'required': False
            },
            'social_security': {
                'patterns': [
                    r'Social\s+Security.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+5.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Social Security Benefits (Line 5)',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for Form 1040 fields."""
        return {
            'w2_income': {
                'required': False,
                'min_value': 0,
                'max_value': 1000000
            },
            'pensions': {
                'required': False,
                'min_value': 0,
                'max_value': 500000
            },
            'alimony': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            },
            'unemployment': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            },
            'social_security': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported Form 1040 fields."""
        return [
            'w2_income',
            'pensions',
            'alimony',
            'unemployment',
            'social_security'
        ]

class ScheduleEExtractor(BaseExtractor):
    """
    Schedule E (Rental Income) field extractor.
    
    Extracts key fields from Schedule E including:
    - Rental income
    - Royalty income
    - Depreciation and casualty loss
    - Insurance and tax considerations
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for Schedule E."""
        return {
            'rental_income': {
                'patterns': [
                    r'Rental\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+3.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{4,}(?:,\d{3})*(?:\.\d{2})?)'  # Medium to large numbers
                ],
                'type': 'currency',
                'description': 'Rental Income (Line 3)',
                'required': False
            },
            'royalty_income': {
                'patterns': [
                    r'Royalty\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+4.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Royalty Income (Line 4)',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for Schedule E fields."""
        return {
            'rental_income': {
                'required': False,
                'min_value': 0,
                'max_value': 1000000
            },
            'royalty_income': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported Schedule E fields."""
        return [
            'rental_income',
            'royalty_income'
        ]

class ScheduleBExtractor(BaseExtractor):
    """
    Schedule B (Interest and Dividend Income) field extractor.
    
    Extracts key fields from Schedule B including:
    - Interest income
    - Dividend income
    - Foreign accounts
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for Schedule B."""
        return {
            'interest_income': {
                'patterns': [
                    r'Interest\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+1.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Interest Income (Line 1)',
                'required': False
            },
            'dividend_income': {
                'patterns': [
                    r'Dividend\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+3.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Dividend Income (Line 3)',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for Schedule B fields."""
        return {
            'interest_income': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            },
            'dividend_income': {
                'required': False,
                'min_value': 0,
                'max_value': 100000
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported Schedule B fields."""
        return [
            'interest_income',
            'dividend_income'
        ]

class Form1065Extractor(BaseExtractor):
    """
    Form 1065 (Partnership) field extractor.
    
    Extracts key fields from Form 1065 including:
    - Partnership income
    - Ownership percentages
    - Add-backs and exclusions
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for Form 1065."""
        return {
            'partnership_income': {
                'patterns': [
                    r'Partnership\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Line\s+1.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{4,}(?:,\d{3})*(?:\.\d{2})?)'
                ],
                'type': 'currency',
                'description': 'Partnership Income (Line 1)',
                'required': False
            },
            'ownership_percentage': {
                'patterns': [
                    r'Ownership.*?(\d{1,2}(?:\.\d{1,2})?)%',
                    r'(\d{1,2}(?:\.\d{1,2})?)%',
                    r'(\b100\b)'  # Default to 100% if not specified
                ],
                'type': 'float',
                'description': 'Ownership Percentage',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for Form 1065 fields."""
        return {
            'partnership_income': {
                'required': False,
                'min_value': -1000000,
                'max_value': 1000000
            },
            'ownership_percentage': {
                'required': False,
                'min_value': 0.01,
                'max_value': 100.0
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported Form 1065 fields."""
        return [
            'partnership_income',
            'ownership_percentage'
        ]

class W2Extractor(BaseExtractor):
    """
    W-2 Form field extractor.
    
    Extracts key fields from W-2 forms including:
    - Wages and tips
    - Federal income tax withheld
    - Social Security and Medicare
    """
    
    def _get_field_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Get field extraction patterns for W-2 forms."""
        return {
            'wages_tips': {
                'patterns': [
                    r'Box\s*1.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Wages.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{4,}(?:,\d{3})*(?:\.\d{2})?)'
                ],
                'type': 'currency',
                'description': 'Wages, Tips, Other Compensation (Box 1)',
                'required': True
            },
            'federal_tax_withheld': {
                'patterns': [
                    r'Box\s*2.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'Federal.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\b0\b)'
                ],
                'type': 'currency',
                'description': 'Federal Income Tax Withheld (Box 2)',
                'required': False
            }
        }
    
    def _get_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get validation rules for W-2 fields."""
        return {
            'wages_tips': {
                'required': True,
                'min_value': 0,
                'max_value': 1000000
            },
            'federal_tax_withheld': {
                'required': False,
                'min_value': 0,
                'max_value': 500000
            }
        }
    
    def get_supported_fields(self) -> List[str]:
        """Get list of supported W-2 fields."""
        return [
            'wages_tips',
            'federal_tax_withheld'
        ]
