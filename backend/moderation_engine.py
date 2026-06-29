import re
from collections import Counter


def _contains_any(text, phrases):
    return any(phrase in text for phrase in phrases)

def check_spam_rules(comment_text):
    """
    Deterministic rule-based spam filter.
    Returns a tuple of (status, category, confidence, reason) if it fails,
    or None if it passes.
    """
    text = comment_text.strip()
    lowered = text.lower()
    if not text:
        return "REJECT", "Spam", 100, "Empty comment text."

    # 0. High-risk baseless/defamatory claims that should never be auto-approved.
    hidden_proof_patterns = [
        "i have proof but can't show",
        "i have proof but cannot show",
        "proof but can't show",
        "proof but cannot show",
        "can't show it publicly",
        "cannot show it publicly",
    ]
    criminal_claim_patterns = [
        "laundering crores",
        "money laundering",
        "foreign accounts",
        "secretly stole",
        "stole 5000 crores",
        "stole crores",
        "accepts bribes",
        "taking bribes",
        "tender was fixed",
    ]
    conspiracy_patterns = [
        "everyone knows",
        "media is hiding",
        "media hiding",
        "secretly stole",
    ]

    if _contains_any(lowered, hidden_proof_patterns) and _contains_any(lowered, criminal_claim_patterns):
        return "REJECT", "Defamation", 98, "Comment makes a serious criminal allegation while claiming evidence cannot be shown."

    if _contains_any(lowered, criminal_claim_patterns):
        return "REJECT", "Defamation", 95, "Comment makes an unverified criminal or corruption allegation."

    if _contains_any(lowered, conspiracy_patterns) and re.search(r'\b(stole|scam|fraud|corrupt|hiding)\b', lowered):
        return "REJECT", "Misinformation", 92, "Comment presents an unsupported conspiracy or corruption claim as fact."
        
    # 1. URL Detection
    url_pattern = re.compile(
        r'(https?://|www\.|bit\.ly|tinyurl|t\.me|[\w\-]+\.[\w\-]{2,4}/)', 
        re.IGNORECASE
    )
    if url_pattern.search(text):
        return "REJECT", "Spam", 100, "Comment contains links or URL patterns."

    # 2. Email Detection
    email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+', re.IGNORECASE)
    if email_pattern.search(text):
        return "REJECT", "Spam", 100, "Comment contains email addresses."

    # 3. Phone Number Detection
    # Match Indian phone formats: e.g. 9876543210, +919876543210, 919876543210, etc.
    phone_pattern = re.compile(r'(\+?91[\s\-]?)?[6-9]\d{9}\b|(\+?91)?\s?\d{10}\b')
    digits_only = re.sub(r'\D', '', text)
    if len(digits_only) >= 10:
        if phone_pattern.search(text) or re.search(r'\d{10,}', digits_only):
            return "REJECT", "Spam", 100, "Comment contains phone numbers."

    # 4. Advertisement Detection
    ad_keywords = [
        "visit my website", "buy followers", "subscribe my channel",
        "earn ₹", "earn rs", "earn money", "earn cash", "earn daily",
        "click the link", "join telegram", "use my referral code",
        "crypto investment", "buy crypto", "subscribe", "subscribe now", "free recharge",
        "buy now", "visit website"
    ]
    for kw in ad_keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', lowered) or kw in lowered:
            return "REJECT", "Spam", 100, f"Comment contains advertisement keywords: '{kw}'."

    # 5. Emoji Spam
    # Unicode emoji ranges
    emoji_pattern = re.compile(
        r'[\u263a-\u263f]|[\u2702-\u27b0]|[\U0001f600-\U0001f64f]|[\U0001f300-\U0001f5ff]|'
        r'[\U0001f680-\U0001f6ff]|[\U0001f1e0-\U0001f1ff]|[\U0001f900-\U0001f9ff]|[\U0001fa00-\U0001faff]'
    )
    emojis = emoji_pattern.findall(text)
    if len(emojis) >= 4:
        for emoji in set(emojis):
            if emoji * 4 in text:
                return "REJECT", "Spam", 100, "Comment contains excessive repeated emojis."
        if len(emojis) > 6:
             return "REJECT", "Spam", 98, "Comment contains emoji spam."

    # 6. Character Punctuation Spam (e.g. !!!!!!!!!)
    if re.search(r'([!?,.%\$#\*])\1{3,}', text):
        return "REJECT", "Spam", 100, "Comment contains excessive repeated punctuation characters."

    # 7. Capital Letter Spam (more than 70% uppercase)
    letters = [c for c in text if c.isalpha()]
    if len(letters) >= 10:
        uppercase_letters = [c for c in letters if c.isupper()]
        if len(uppercase_letters) / len(letters) > 0.70:
            return "REJECT", "Spam", 98, "Comment contains excessive uppercase characters (ALL CAPS spam)."

    # 8. Tokenize words for repetition and gibberish checks
    words = re.findall(r'\b\w+\b', lowered)
    if not words:
        return "REJECT", "Gibberish", 100, "Comment has no readable words."

    # 8a. Consecutive repeated words (e.g. "Comment Comment Comment")
    # Rule: If same word appears more than 5 times consecutively
    consecutive_count = 1
    prev_word = None
    for w in words:
        if w == prev_word:
            consecutive_count += 1
            if consecutive_count > 3:  # Lowered to 3 to catch "Hello Hello Hello" or "Nice Nice Nice"
                return "REJECT", "Spam", 100, f"Word '{w}' was repeated consecutively multiple times."
        else:
            consecutive_count = 1
            prev_word = w

    # 8b. Percentage repeated words
    # Rule: if more than 40% of the comment consists of repeated words
    if len(words) >= 3:
        word_counts = Counter(words)
        repeated_word_tokens = sum(count for word, count in word_counts.items() if count > 1)
        repetition_ratio = repeated_word_tokens / len(words)
        if repetition_ratio > 0.40:
            return "REJECT", "Spam", 100, f"More than 40% of the comment consists of repeated words ({repetition_ratio:.1%})."

    # 8c. Repeated phrases (e.g. "Comment Moderation Comment Moderation Comment Moderation")
    for phrase_len in range(2, 5):
        if len(words) < phrase_len * 3:
            continue
        phrases = [" ".join(words[i:i + phrase_len]) for i in range(len(words) - phrase_len + 1)]
        phrase_counts = Counter(phrases)
        phrase, count = phrase_counts.most_common(1)[0]
        if count >= 3:
            return "REJECT", "Spam", 100, f"Phrase '{phrase}' was repeated multiple times."

    # 9. Random keyboard input / Gibberish
    # Sequences of same character (e.g. aaaaaaa)
    if re.search(r'([a-zA-Z0-9])\1{4,}', text):
        return "REJECT", "Gibberish", 100, "Comment contains excessive repeated letters."

    keyboard_sequences = [
        "asdf", "asdfg", "asdfgh", "asdfghjkl",
        "qwerty", "qwertyu", "qwertyuiop",
        "zxcv", "zxcvb", "zxcvbnm",
    ]
    if _contains_any(lowered, keyboard_sequences):
        return "REJECT", "Gibberish", 98, "Comment contains keyboard-mash gibberish."
        
    # Consonants-only sequences (e.g. asdfghjkl)
    for w in words:
        if w.isdigit():
            if len(w) >= 6 and len(set(w)) == 1:
                return "REJECT", "Gibberish", 100, "Comment contains repeated digits."
            continue
        if len(w) >= 6:
            vowels = re.findall(r'[aeiou]', w)
            if len(vowels) == 0:
                return "REJECT", "Gibberish", 100, f"Word '{w}' has no vowels (suspected gibberish)."
            if len(vowels) / len(w) < 0.15:
                return "REJECT", "Gibberish", 95, f"Word '{w}' has extremely low vowel ratio (suspected gibberish)."

    # 10. Meaningless / Low-information short comments
    low_info_words = {"test", "testing", "ok", "hi", "hello", "12345", "abcabcabc", "nice", "good", "first", "hello world"}
    cleaned_comment = re.sub(r'[^\w\s]', '', lowered).strip()
    if cleaned_comment in low_info_words or len(cleaned_comment) < 6:
        return "REJECT", "Irrelevant", 95, "Comment is too short or consists of low-information placeholder text."

    return None
