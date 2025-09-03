"""
MSFG Loan Tools - Document Parsers Module

This module contains specialized parsers for different tax forms and documents.
Each parser is designed to extract specific fields from PDF and image documents.
"""

from .form_1040_parser import Form1040Parser
from .form_1065_parser import Form1065Parser
from .form_1120_parser import Form1120Parser
from .schedule_c_parser import ScheduleCParser
from .schedule_e_parser import ScheduleEParser
from .w2_parser import W2Parser

__all__ = [
    'Form1040Parser',
    'Form1065Parser', 
    'Form1120Parser',
    'ScheduleCParser',
    'ScheduleEParser',
    'W2Parser'
]

__version__ = '1.0.0'






