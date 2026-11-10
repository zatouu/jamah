from app.fusion import reciprocal_rank_fusion
from app.normalize import fold_latin, is_arabic, normalize_arabic, normalize_query


def test_normalize_arabic_removes_tashkil_and_unifies_letters():
    assert normalize_arabic("بِسْمِ اللَّهِ") == "بسم الله"
    assert normalize_arabic("إبراهيم") == "ابراهيم"
    assert normalize_arabic("الفيضة") == "الفيضه"
    assert normalize_arabic("موسى") == "موسي"
    assert normalize_arabic("الـــشيخ") == "الشيخ"


def test_fold_latin_transliterations():
    assert fold_latin("Fayḍa") == "fayda"
    assert fold_latin("Tijâniyya") == "tijaniyya"
    assert fold_latin("Maʿrifa") == "marifa"
    assert fold_latin("Qurʾān") == "quran"


def test_normalize_query_and_language():
    assert normalize_query("  Cheikh   Ibrāhīm  ") == "cheikh ibrahim"
    assert is_arabic("الذكر")
    assert not is_arabic("dhikr")


def test_rrf_rewards_documents_found_by_both_methods():
    fused = reciprocal_rank_fusion([["a", "b", "c"], ["c", "d"]])
    ids = [doc_id for doc_id, _ in fused]
    assert ids[0] == "c"
    assert set(ids) == {"a", "b", "c", "d"}
