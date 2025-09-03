"""
Data Validator - Tax Data Validation and Reconciliation

This module provides comprehensive validation and reconciliation
for extracted tax data to ensure accuracy and consistency.
"""

import logging
from typing import Dict, List, Optional, Any, Union
from ..field_extraction.base import BaseExtractor

logger = logging.getLogger(__name__)

class DataValidator:
    """
    Comprehensive data validator for tax form data.
    
    Provides:
    - Field-level validation
    - Cross-field consistency checks
    - Business rule validation
    - Data reconciliation
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the data validator.
        
        Args:
            config: Configuration dictionary for validation options
        """
        self.config = config or {}
        self.validation_rules = self._get_validation_rules()
        
        logger.info("Data Validator initialized")
    
    def _get_validation_rules(self) -> Dict[str, Any]:
        """Get global validation rules and business logic."""
        return {
            'enable_cross_field_validation': True,
            'enable_business_rules': True,
            'enable_reconciliation': True,
            'confidence_threshold': 0.7,
            'max_warnings': 10
        }
    
    def validate(self, extracted_data: Dict[str, Any], extractor: BaseExtractor) -> Dict[str, Any]:
        """
        Validate extracted data using comprehensive validation rules.
        
        Args:
            extracted_data: Dictionary of extracted field values
            extractor: Form-specific extractor instance
            
        Returns:
            Validation results dictionary
        """
        try:
            validation_results = {
                'valid': True,
                'errors': [],
                'warnings': [],
                'field_validations': {},
                'cross_field_validations': {},
                'business_rule_validations': {},
                'reconciliation_results': {},
                'overall_score': 0.0
            }
            
            # Step 1: Field-level validation
            logger.info("Performing field-level validation")
            field_validations = extractor.validate_extracted_data(extracted_data)
            validation_results['field_validations'] = field_validations
            
            if not field_validations['valid']:
                validation_results['valid'] = False
                validation_results['errors'].extend(field_validations['errors'])
            
            validation_results['warnings'].extend(field_validations['warnings'])
            
            # Step 2: Cross-field validation
            if self.validation_rules.get('enable_cross_field_validation'):
                logger.info("Performing cross-field validation")
                cross_field_results = self._validate_cross_fields(extracted_data, extractor)
                validation_results['cross_field_validations'] = cross_field_results
                
                if not cross_field_results['valid']:
                    validation_results['valid'] = False
                    validation_results['errors'].extend(cross_field_results['errors'])
                
                validation_results['warnings'].extend(cross_field_results['warnings'])
            
            # Step 3: Business rule validation
            if self.validation_rules.get('enable_business_rules'):
                logger.info("Performing business rule validation")
                business_rule_results = self._validate_business_rules(extracted_data, extractor)
                validation_results['business_rule_validations'] = business_rule_results
                
                if not business_rule_results['valid']:
                    validation_results['valid'] = False
                    validation_results['errors'].extend(business_rule_results['errors'])
                
                validation_results['warnings'].extend(business_rule_results['warnings'])
            
            # Step 4: Data reconciliation
            if self.validation_rules.get('enable_reconciliation'):
                logger.info("Performing data reconciliation")
                reconciliation_results = self._reconcile_data(extracted_data, extractor)
                validation_results['reconciliation_results'] = reconciliation_results
            
            # Step 5: Calculate overall validation score
            validation_results['overall_score'] = self._calculate_validation_score(validation_results)
            
            logger.info(f"Validation completed. Overall score: {validation_results['overall_score']:.2f}")
            return validation_results
            
        except Exception as e:
            logger.error(f"Validation failed: {str(e)}")
            return {
                'valid': False,
                'errors': [f"Validation system error: {str(e)}"],
                'warnings': [],
                'field_validations': {},
                'cross_field_validations': {},
                'business_rule_validations': {},
                'reconciliation_results': {},
                'overall_score': 0.0
            }
    
    def _validate_cross_fields(self, extracted_data: Dict[str, Any], extractor: BaseExtractor) -> Dict[str, Any]:
        """Validate relationships between different fields."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        try:
            # Get form type for specific cross-field validations
            form_type = extractor.__class__.__name__.lower()
            
            if 'schedulec' in form_type:
                results.update(self._validate_schedule_c_cross_fields(extracted_data))
            elif 'form1040' in form_type:
                results.update(self._validate_form_1040_cross_fields(extracted_data))
            elif 'schedulee' in form_type:
                results.update(self._validate_schedule_e_cross_fields(extracted_data))
            elif 'form1065' in form_type:
                results.update(self._validate_form_1065_cross_fields(extracted_data))
            
        except Exception as e:
            logger.warning(f"Cross-field validation failed: {str(e)}")
            results['warnings'].append(f"Cross-field validation error: {str(e)}")
        
        return results
    
    def _validate_schedule_c_cross_fields(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Schedule C specific cross-field relationships."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Check if net profit is reasonable given other fields
        net_profit = extracted_data.get('net_profit', 0)
        other_income = extracted_data.get('other_income', 0)
        depreciation = extracted_data.get('depreciation', 0)
        depletion = extracted_data.get('depletion', 0)
        
        # Net profit should typically be positive for business income
        if net_profit < -100000:
            results['warnings'].append("Net profit is very negative - verify business status")
        
        # Other income should be reasonable relative to net profit
        if other_income > 0 and abs(other_income) > abs(net_profit) * 2:
            results['warnings'].append("Other income seems high relative to net profit")
        
        # Depreciation and depletion should be reasonable
        if depreciation > 0 and depreciation > abs(net_profit) * 0.5:
            results['warnings'].append("Depreciation seems high relative to net profit")
        
        if depletion > 0 and depletion > abs(net_profit) * 0.3:
            results['warnings'].append("Depletion seems high relative to net profit")
        
        return results
    
    def _validate_form_1040_cross_fields(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Form 1040 specific cross-field relationships."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        w2_income = extracted_data.get('w2_income', 0)
        pensions = extracted_data.get('pensions', 0)
        alimony = extracted_data.get('alimony', 0)
        
        # W-2 income should typically be the largest component
        total_income = w2_income + pensions + alimony
        if total_income > 0 and w2_income < total_income * 0.3:
            results['warnings'].append("W-2 income seems low relative to total income")
        
        return results
    
    def _validate_schedule_e_cross_fields(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Schedule E specific cross-field relationships."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        rental_income = extracted_data.get('rental_income', 0)
        royalty_income = extracted_data.get('royalty_income', 0)
        
        # Rental income should typically be larger than royalty income
        if rental_income > 0 and royalty_income > rental_income * 2:
            results['warnings'].append("Royalty income seems high relative to rental income")
        
        return results
    
    def _validate_form_1065_cross_fields(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Form 1065 specific cross-field relationships."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        partnership_income = extracted_data.get('partnership_income', 0)
        ownership_percentage = extracted_data.get('ownership_percentage', 100)
        
        # Ownership percentage should be reasonable
        if ownership_percentage < 1 or ownership_percentage > 100:
            results['errors'].append("Ownership percentage must be between 1% and 100%")
            results['valid'] = False
        
        # Partnership income should be reasonable for ownership percentage
        if partnership_income > 0 and ownership_percentage < 50:
            if partnership_income > 1000000:
                results['warnings'].append("High partnership income with minority ownership")
        
        return results
    
    def _validate_business_rules(self, extracted_data: Dict[str, Any], extractor: BaseExtractor) -> Dict[str, Any]:
        """Validate business rules and common sense checks."""
        results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        try:
            # Check for unrealistic values
            for field_name, value in extracted_data.items():
                if value is not None:
                    # Check for extremely large numbers
                    if isinstance(value, (int, float)) and abs(value) > 10000000:
                        results['warnings'].append(f"Field {field_name} has extremely large value: {value}")
                    
                    # Check for negative values where they shouldn't be
                    if isinstance(value, (int, float)) and value < 0:
                        if field_name in ['wages_tips', 'rental_income', 'interest_income']:
                            results['warnings'].append(f"Field {field_name} has negative value: {value}")
            
            # Check for missing required fields
            required_fields = self._get_required_fields_for_form(extractor)
            for field in required_fields:
                if field not in extracted_data or extracted_data[field] is None:
                    results['errors'].append(f"Required field {field} is missing")
                    results['valid'] = False
            
        except Exception as e:
            logger.warning(f"Business rule validation failed: {str(e)}")
            results['warnings'].append(f"Business rule validation error: {str(e)}")
        
        return results
    
    def _get_required_fields_for_form(self, extractor: BaseExtractor) -> List[str]:
        """Get list of required fields for a specific form type."""
        form_type = extractor.__class__.__name__.lower()
        
        if 'schedulec' in form_type:
            return ['net_profit']
        elif 'w2' in form_type:
            return ['wages_tips']
        else:
            return []  # Most forms don't have strictly required fields
    
    def _reconcile_data(self, extracted_data: Dict[str, Any], extractor: BaseExtractor) -> Dict[str, Any]:
        """Reconcile extracted data for consistency."""
        results = {
            'reconciled': True,
            'adjustments': [],
            'confidence_improvements': []
        }
        
        try:
            # Apply form-specific reconciliation logic
            form_type = extractor.__class__.__name__.lower()
            
            if 'schedulec' in form_type:
                results.update(self._reconcile_schedule_c_data(extracted_data))
            elif 'form1040' in form_type:
                results.update(self._reconcile_form_1040_data(extracted_data))
            
        except Exception as e:
            logger.warning(f"Data reconciliation failed: {str(e)}")
            results['reconciled'] = False
            results['adjustments'].append(f"Reconciliation error: {str(e)}")
        
        return results
    
    def _reconcile_schedule_c_data(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reconcile Schedule C data for consistency."""
        adjustments = []
        confidence_improvements = []
        
        # Ensure net profit is present and reasonable
        net_profit = extracted_data.get('net_profit')
        if net_profit is None:
            # Try to estimate from other fields
            other_income = extracted_data.get('other_income', 0)
            depreciation = extracted_data.get('depreciation', 0)
            depletion = extracted_data.get('depletion', 0)
            
            estimated_net_profit = other_income - depreciation - depletion
            if estimated_net_profit != 0:
                adjustments.append(f"Estimated net profit: {estimated_net_profit}")
                confidence_improvements.append("Net profit estimated from other fields")
        
        return {
            'adjustments': adjustments,
            'confidence_improvements': confidence_improvements
        }
    
    def _reconcile_form_1040_data(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reconcile Form 1040 data for consistency."""
        adjustments = []
        confidence_improvements = []
        
        # Check for reasonable income relationships
        w2_income = extracted_data.get('w2_income', 0)
        pensions = extracted_data.get('pensions', 0)
        
        if w2_income > 0 and pensions > 0:
            if pensions > w2_income * 0.8:
                adjustments.append("Pension income seems high relative to W-2 income")
                confidence_improvements.append("Income relationship validated")
        
        return {
            'adjustments': adjustments,
            'confidence_improvements': confidence_improvements
        }
    
    def _calculate_validation_score(self, validation_results: Dict[str, Any]) -> float:
        """Calculate overall validation score (0.0 to 1.0)."""
        try:
            score = 1.0
            
            # Deduct for errors
            error_count = len(validation_results.get('errors', []))
            score -= min(0.5, error_count * 0.1)  # Max 0.5 deduction for errors
            
            # Deduct for warnings
            warning_count = len(validation_results.get('warnings', []))
            score -= min(0.3, warning_count * 0.02)  # Max 0.3 deduction for warnings
            
            # Bonus for successful reconciliation
            if validation_results.get('reconciliation_results', {}).get('reconciled', False):
                score += 0.1
            
            # Ensure score is between 0.0 and 1.0
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            logger.warning(f"Score calculation failed: {str(e)}")
            return 0.0
    
    def get_validation_summary(self, validation_results: Dict[str, Any]) -> Dict[str, Any]:
        """Get a summary of validation results."""
        return {
            'overall_valid': validation_results.get('valid', False),
            'overall_score': validation_results.get('overall_score', 0.0),
            'error_count': len(validation_results.get('errors', [])),
            'warning_count': len(validation_results.get('warnings', [])),
            'field_validation_count': len(validation_results.get('field_validations', {}).get('field_validations', {})),
            'cross_field_validation_count': len(validation_results.get('cross_field_validations', {}).get('field_validations', {})),
            'business_rule_validation_count': len(validation_results.get('business_rule_validations', {}).get('field_validations', {})),
            'reconciliation_successful': validation_results.get('reconciliation_results', {}).get('reconciled', False)
        }
