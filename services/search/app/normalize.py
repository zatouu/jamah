"""Normalisation des requêtes (arabe et translittérations latines).

Repris de sufi-knowledge (`lib/search/fuzzy.ts`) : l'index applique les mêmes règles via ses analyseurs,
la requête est normalisée ici pour la partie sémantique et la détection de langue.
"""

import re
import unicodedata

_ARABIC_MARKS = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")
_ARABIC_LETTER = re.compile(r"[\u0621-\u064A]")
_ARABIC_FOLD = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ئ": "ي", "ؤ": "و", "ة": "ه", "\u0640": None})
# ʿayn / hamza des translittérations (Maʿrifa, Qurʾān) et apostrophes typographiques
_LATIN_APOSTROPHES = re.compile(r"[ʿʾ’‘`']")
_SPACES = re.compile(r"\s+")


def normalize_arabic(text: str) -> str:
    """Retire tashkīl et tatwīl, unifie alif/hamza, tāʾ marbūṭa et alif maqṣūra."""
    return _ARABIC_MARKS.sub("", text).translate(_ARABIC_FOLD)


def fold_latin(text: str) -> str:
    """Minuscules sans diacritiques : « Fayḍa » → « fayda », « Tijâniyya » → « tijaniyya »."""
    text = _LATIN_APOSTROPHES.sub("", text)
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).lower()


def normalize_query(text: str) -> str:
    return _SPACES.sub(" ", fold_latin(normalize_arabic(text))).strip()


def is_arabic(text: str) -> bool:
    return bool(_ARABIC_LETTER.search(text))
