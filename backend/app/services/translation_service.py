"""
Translation and language detection service
Uses free translation APIs and language detection libraries
"""

import re
from typing import Optional, Dict
import logging

# Try to import langdetect
try:
    from langdetect import detect, DetectorFactory, LangDetectException
    DetectorFactory.seed = 0
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    print("Warning: langdetect not available. Language detection will be limited.")

# Try to import googletrans
try:
    from googletrans import Translator
    GOOGLETRANS_AVAILABLE = True
except ImportError:
    GOOGLETRANS_AVAILABLE = False
    print("Warning: googletrans not available. Translation will be disabled.")

logger = logging.getLogger(__name__)

# Supported languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'cs': 'Czech',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'he': 'Hebrew',
    'uk': 'Ukrainian',
    'ro': 'Romanian',
    'hu': 'Hungarian',
    'el': 'Greek',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
}

# Language codes for PubMed
PUBMED_LANGUAGE_CODES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'cs': 'Czech',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'he': 'Hebrew',
    'uk': 'Ukrainian',
    'ro': 'Romanian',
    'hu': 'Hungarian',
    'el': 'Greek',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
}


class TranslationService:
    """Service for language detection and translation"""
    
    def __init__(self):
        self.translator = None
        if GOOGLETRANS_AVAILABLE:
            try:
                self.translator = Translator()
            except Exception as e:
                logger.warning(f"Failed to initialize Translator: {e}")
                self.translator = None
    
    def detect_language(self, text: str) -> Optional[str]:
        """
        Detect the language of a given text
        
        Args:
            text: Text to detect language for
            
        Returns:
            Language code (e.g., 'en', 'es', 'fr') or None if detection fails
        """
        if not text or len(text.strip()) < 3:
            return 'en'  # Default to English for very short text
        
        if LANGDETECT_AVAILABLE:
            try:
                # Use langdetect library
                detected = detect(text)
                return detected if detected in SUPPORTED_LANGUAGES else 'en'
            except Exception as e:
                logger.warning(f"langdetect error: {e}, using fallback")
                return self._detect_simple(text)
        
        # Fallback to simple heuristics if langdetect not available
        return self._detect_simple(text)
    
    def _detect_simple(self, text: str) -> str:
        """Simple heuristic-based language detection"""
        # Check for common non-English characters
        if re.search(r'[àáâãäåæçèéêëìíîïñòóôõöùúûüýÿ]', text, re.IGNORECASE):
            # Could be Spanish, French, Portuguese, Italian, etc.
            if re.search(r'[ñ]', text, re.IGNORECASE):
                return 'es'  # Spanish
            elif re.search(r'[ç]', text, re.IGNORECASE):
                return 'fr'  # French
            elif re.search(r'[ãõ]', text, re.IGNORECASE):
                return 'pt'  # Portuguese
            else:
                return 'fr'  # Default to French
        elif re.search(r'[äöüß]', text, re.IGNORECASE):
            return 'de'  # German
        elif re.search(r'[а-яё]', text, re.IGNORECASE):
            return 'ru'  # Russian
        elif re.search(r'[一-龯]', text):
            return 'zh'  # Chinese
        elif re.search(r'[ひらがなカタカナ]', text):
            return 'ja'  # Japanese
        elif re.search(r'[가-힣]', text):
            return 'ko'  # Korean
        elif re.search(r'[ا-ي]', text):
            return 'ar'  # Arabic
        
        return 'en'  # Default to English
    
    def translate_text(self, text: str, target_lang: str = 'en', source_lang: Optional[str] = None) -> str:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_lang: Target language code (default: 'en')
            source_lang: Source language code (auto-detect if None)
            
        Returns:
            Translated text
        """
        if not text or not text.strip():
            return text
        
        # If translation is not available, return original text
        if not GOOGLETRANS_AVAILABLE or not self.translator:
            logger.warning("Translation service not available, returning original text")
            return text
        
        # If target is English and text is already English, return as-is
        if target_lang == 'en' and (not source_lang or source_lang == 'en'):
            detected = self.detect_language(text)
            if detected == 'en':
                return text
        
        try:
            if source_lang:
                result = self.translator.translate(text, src=source_lang, dest=target_lang)
            else:
                result = self.translator.translate(text, dest=target_lang)
            
            return result.text if result else text
        except Exception as e:
            logger.error(f"Error translating text: {e}")
            return text  # Return original text on error
    
    def translate_query(self, query: str, target_lang: str = 'en') -> str:
        """
        Translate a search query to target language
        
        Args:
            query: Search query
            target_lang: Target language code
            
        Returns:
            Translated query
        """
        if target_lang == 'en':
            return query
        
        return self.translate_text(query, target_lang=target_lang)
    
    def translate_answer(self, answer: str, target_lang: str = 'en', source_lang: Optional[str] = None) -> str:
        """
        Translate an answer/response to target language
        
        Args:
            answer: Answer text to translate
            target_lang: Target language code
            source_lang: Source language code (usually 'en' for AI-generated answers)
            
        Returns:
            Translated answer
        """
        if target_lang == 'en':
            return answer
        
        return self.translate_text(answer, target_lang=target_lang, source_lang=source_lang or 'en')
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get dictionary of supported language codes and names"""
        return SUPPORTED_LANGUAGES.copy()
    
    def is_supported(self, lang_code: str) -> bool:
        """Check if a language code is supported"""
        return lang_code in SUPPORTED_LANGUAGES


# Global instance
translation_service = TranslationService()

