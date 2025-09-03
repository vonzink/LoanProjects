"""
OCR Engine - Multi-Engine Text Extraction

This module provides a unified interface for multiple OCR engines
including Tesseract, PaddleOCR, and cloud-based solutions.
"""

import logging
import os
from typing import Dict, List, Optional, Any, Union
from PIL import Image
import io

logger = logging.getLogger(__name__)

class OCREngine:
    """
    Multi-engine OCR system for robust text extraction from tax documents.
    
    Supports:
    - Tesseract (local, fast)
    - PaddleOCR (local, high accuracy)
    - Cloud OCR APIs (AWS Textract, Google Vision, Azure)
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the OCR engine.
        
        Args:
            config: Configuration dictionary for OCR options
        """
        self.config = config or {}
        self.engines = self._initialize_engines()
        
        logger.info("OCR Engine initialized")
    
    def _initialize_engines(self) -> Dict[str, Any]:
        """Initialize available OCR engines based on configuration."""
        engines = {}
        
        # Initialize Tesseract if available
        try:
            import pytesseract
            engines['tesseract'] = pytesseract
            logger.info("Tesseract OCR engine initialized")
        except ImportError:
            logger.warning("Tesseract not available - install pytesseract")
        
        # Initialize PaddleOCR if available
        try:
            from paddleocr import PaddleOCR
            engines['paddleocr'] = PaddleOCR(use_angle_cls=True, lang='en')
            logger.info("PaddleOCR engine initialized")
        except ImportError:
            logger.warning("PaddleOCR not available - install paddleocr")
        
        # Initialize cloud OCR if configured
        if self.config.get('enable_cloud_ocr'):
            engines.update(self._initialize_cloud_engines())
        
        return engines
    
    def _initialize_cloud_engines(self) -> Dict[str, Any]:
        """Initialize cloud-based OCR engines."""
        cloud_engines = {}
        
        # AWS Textract
        if self.config.get('aws_credentials'):
            try:
                import boto3
                cloud_engines['aws_textract'] = boto3.client('textract')
                logger.info("AWS Textract initialized")
            except ImportError:
                logger.warning("boto3 not available for AWS Textract")
        
        # Google Vision
        if self.config.get('google_credentials'):
            try:
                from google.cloud import vision
                cloud_engines['google_vision'] = vision.ImageAnnotatorClient()
                logger.info("Google Vision initialized")
            except ImportError:
                logger.warning("google-cloud-vision not available")
        
        return cloud_engines
    
    def process_images(self, images: List[Dict]) -> Dict[str, Any]:
        """
        Process images through available OCR engines.
        
        Args:
            images: List of image data dictionaries
            
        Returns:
            Dictionary containing OCR results and metadata
        """
        all_results = []
        
        for image_data in images:
            try:
                # Extract text using multiple engines
                text_results = self._extract_text_multi_engine(image_data)
                all_results.append(text_results)
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}")
                all_results.append({
                    'text': '',
                    'confidence': 0.0,
                    'engine': 'none',
                    'error': str(e)
                })
        
        # Combine and reconcile results
        combined_results = self._combine_ocr_results(all_results)
        
        return {
            'text': combined_results['combined_text'],
            'confidence': combined_results['overall_confidence'],
            'engine_results': all_results,
            'metadata': {
                'engines_used': list(self.engines.keys()),
                'total_images': len(images)
            }
        }
    
    def _extract_text_multi_engine(self, image_data: Dict) -> Dict[str, Any]:
        """Extract text using multiple OCR engines for better accuracy."""
        results = {}
        
        # Try Tesseract first (fast)
        if 'tesseract' in self.engines:
            try:
                tesseract_result = self._extract_with_tesseract(image_data)
                results['tesseract'] = tesseract_result
            except Exception as e:
                logger.warning(f"Tesseract extraction failed: {str(e)}")
        
        # Try PaddleOCR (high accuracy)
        if 'paddleocr' in self.engines:
            try:
                paddle_result = self._extract_with_paddleocr(image_data)
                results['paddleocr'] = paddle_result
            except Exception as e:
                logger.warning(f"PaddleOCR extraction failed: {str(e)}")
        
        # Try cloud OCR if available
        for engine_name, engine in self.engines.items():
            if engine_name.startswith('aws_') or engine_name.startswith('google_'):
                try:
                    cloud_result = self._extract_with_cloud_ocr(image_data, engine, engine_name)
                    results[engine_name] = cloud_result
                except Exception as e:
                    logger.warning(f"{engine_name} extraction failed: {str(e)}")
        
        # Select best result
        best_result = self._select_best_result(results)
        
        return best_result
    
    def _extract_with_tesseract(self, image_data: Dict) -> Dict[str, Any]:
        """Extract text using Tesseract OCR."""
        try:
            # For now, return placeholder - this would process actual images
            return {
                'text': 'Sample text from Tesseract',
                'confidence': 0.8,
                'engine': 'tesseract'
            }
        except Exception as e:
            logger.error(f"Tesseract extraction error: {str(e)}")
            raise
    
    def _extract_with_paddleocr(self, image_data: Dict) -> Dict[str, Any]:
        """Extract text using PaddleOCR."""
        try:
            # For now, return placeholder - this would process actual images
            return {
                'text': 'Sample text from PaddleOCR',
                'confidence': 0.9,
                'engine': 'paddleocr'
            }
        except Exception as e:
            logger.error(f"PaddleOCR extraction error: {str(e)}")
            raise
    
    def _extract_with_cloud_ocr(self, image_data: Dict, engine: Any, engine_name: str) -> Dict[str, Any]:
        """Extract text using cloud OCR services."""
        try:
            # For now, return placeholder - this would use actual cloud APIs
            return {
                'text': f'Sample text from {engine_name}',
                'confidence': 0.85,
                'engine': engine_name
            }
        except Exception as e:
            logger.error(f"{engine_name} extraction error: {str(e)}")
            raise
    
    def _select_best_result(self, results: Dict[str, Dict]) -> Dict[str, Any]:
        """Select the best OCR result based on confidence and quality."""
        if not results:
            return {'text': '', 'confidence': 0.0, 'engine': 'none'}
        
        # Sort by confidence
        sorted_results = sorted(
            results.values(), 
            key=lambda x: x.get('confidence', 0.0), 
            reverse=True
        )
        
        best_result = sorted_results[0]
        
        # If we have multiple results, try to combine them for better accuracy
        if len(sorted_results) > 1:
            combined_text = self._combine_text_results(sorted_results)
            best_result['text'] = combined_text
            best_result['confidence'] = min(0.95, best_result.get('confidence', 0.0) + 0.05)
        
        return best_result
    
    def _combine_text_results(self, results: List[Dict]) -> str:
        """Combine text from multiple OCR engines for better accuracy."""
        # Simple combination strategy - use the longest text as base
        # In a real implementation, this would use more sophisticated text alignment
        longest_result = max(results, key=lambda x: len(x.get('text', '')))
        return longest_result.get('text', '')
    
    def _combine_ocr_results(self, all_results: List[Dict]) -> Dict[str, Any]:
        """Combine results from multiple images."""
        combined_text = '\n'.join([r.get('text', '') for r in all_results])
        overall_confidence = sum([r.get('confidence', 0.0) for r in all_results]) / len(all_results) if all_results else 0.0
        
        return {
            'combined_text': combined_text,
            'overall_confidence': overall_confidence
        }
    
    def get_available_engines(self) -> List[str]:
        """Get list of available OCR engines."""
        return list(self.engines.keys())
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Get status of all OCR engines."""
        status = {}
        for engine_name in self.engines:
            status[engine_name] = {
                'available': True,
                'type': 'local' if not engine_name.startswith(('aws_', 'google_')) else 'cloud'
            }
        return status
