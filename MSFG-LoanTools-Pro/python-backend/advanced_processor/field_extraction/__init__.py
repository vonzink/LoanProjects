"""
Field extraction components for the Advanced Tax Processor.
"""

from .base import BaseExtractor
from .extractors import (
    ScheduleCExtractor,
    Form1040Extractor,
    ScheduleEExtractor,
    ScheduleBExtractor,
    Form1065Extractor,
    W2Extractor
)

__all__ = [
    'BaseExtractor',
    'ScheduleCExtractor',
    'Form1040Extractor',
    'ScheduleEExtractor',
    'ScheduleBExtractor',
    'Form1065Extractor',
    'W2Extractor'
]
