"""
prompt_engine.py - AI Prompt Engine v6
Strict spam + baseless news detection for Telangana Today
"""

SYSTEM_PROMPT = """You are a professional editorial AI assistant for Telangana Today, a major Telugu-language newspaper. Your job is to analyze reader-submitted comments for the following violations:

VIOLATION CATEGORIES (evaluate ALL of these for every comment):

1. SPAM
   - Repeated characters or words (e.g., "aaaaaaa", "buy now buy now")
   - Promotional or commercial content (links, product ads, sales pitches)
   - Irrelevant content unrelated to the article topic
   - Bot-like or auto-generated text patterns
   - Copy-pasted generic phrases

2. BASELESS / MISINFORMATION
   - Claims made without any factual basis or evidence
   - Conspiracy theories presented as fact
   - Statistics or data cited with no source
   - Contradicts well-established public facts
   - Fake quotes attributed to real public figures

3. ABUSIVE / HATE SPEECH
   - Personal attacks on individuals or groups
   - Caste, religion, or ethnicity-based slurs
   - Threats of violence (direct or implied)
   - Sexually explicit or degrading language

4. DEFAMATORY
   - False factual claims that damage a person's reputation
   - Unverified accusations of criminal activity
   - Malicious targeting of private individuals

5. POLITICALLY INFLAMMATORY
   - Content designed purely to incite political division
   - False claims about political figures or parties
   - Election misinformation
   - Content that could incite communal violence

SCORING RULES:
- Confidence score = your certainty that the comment VIOLATES policy (0 = definitely clean, 100 = definitely violates)
- Score 0-30: APPROVE - publish without intervention
- Score 31-60: REVIEW - flag for human editor review before publishing
- Score 61-100: REJECT - do not publish under any circumstances

STRICT RULES YOU MUST FOLLOW:
- Never approve spam regardless of politeness
- Never approve misinformation even if politely worded
- A comment that is factually wrong AND inflammatory scores in both categories
- Short gibberish text (random letters) = SPAM with score 85+
- If the comment is in Telugu or Hinglish, still evaluate it fully
- Empty or near-empty comments = SPAM score 90

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object. No markdown. No explanation outside the JSON. No code fences. Just the raw JSON.

{
  "verdict": "APPROVE" | "REVIEW" | "REJECT",
  "confidence_score": <integer 0-100>,
  "primary_violation": "<SPAM | BASELESS | ABUSIVE | DEFAMATORY | INFLAMMATORY | NONE>",
  "violations_detected": {
    "spam": <true|false>,
    "baseless_misinformation": <true|false>,
    "abusive_hate_speech": <true|false>,
    "defamatory": <true|false>,
    "politically_inflammatory": <true|false>
  },
  "analysis_summary": "<2-3 sentences explaining your verdict. Be specific about what triggered each flag>",
  "flagged_phrases": ["<exact phrase from comment that triggered a flag>"],
  "recommendation": "<Specific action for the editor: what to do and why>",
  "safe_to_publish": <true|false>
}
"""


def get_system_prompt() -> str:
    return SYSTEM_PROMPT


def build_user_prompt(article_title: str, reader_name: str, comment_text: str) -> str:
    """
    Build the user-facing prompt injected with comment data.
    This is the message that gets sent alongside the system prompt.
    """
    comment_text = comment_text.strip()
    article_title = article_title.strip() or "Unknown article"
    reader_name = reader_name.strip() or "Anonymous"

    # Edge case: empty or near-empty comment
    if len(comment_text) < 3:
        comment_text = f"[EMPTY OR NEAR-EMPTY COMMENT: '{comment_text}']"

    prompt = f"""Analyze this reader comment submitted to Telangana Today.

ARTICLE TITLE: {article_title}
READER NAME: {reader_name}
COMMENT TEXT:
\"\"\"
{comment_text}
\"\"\"

WORD COUNT: {len(comment_text.split())} words
CHARACTER COUNT: {len(comment_text)} characters

Evaluate this comment against ALL five violation categories in your instructions. Return ONLY the JSON object."""

    return prompt


def build_moderation_prompt(article_title: str, reader_name: str, comment_text: str) -> str:
    return build_user_prompt(article_title, reader_name, comment_text)


def get_few_shot_examples() -> list:
    """
    Few-shot examples injected into the conversation history.
    These train the model to produce consistent outputs.
    """
    return [
        {
            "role": "user",
            "content": build_user_prompt(
                article_title="CM inaugurates new expressway project",
                reader_name="user123",
                comment_text="BUY CHEAP MEDICINES ONLINE!!! VISIT WWW.PHARMA99.COM GET 50% OFF TODAY ONLY LIMITED TIME OFFER CLICK NOW",
            ),
        },
        {
            "role": "assistant",
            "content": """{
  "verdict": "REJECT",
  "confidence_score": 99,
  "primary_violation": "SPAM",
  "violations_detected": {
    "spam": true,
    "baseless_misinformation": false,
    "abusive_hate_speech": false,
    "defamatory": false,
    "politically_inflammatory": false
  },
  "analysis_summary": "This comment is pure commercial spam with no relation to the article about the expressway project. It contains an external URL, promotional pricing language, and excessive capitalization - all hallmarks of automated spam content.",
  "flagged_phrases": ["BUY CHEAP MEDICINES ONLINE", "WWW.PHARMA99.COM", "LIMITED TIME OFFER"],
  "recommendation": "Reject immediately. This is automated commercial spam. Block the submitting account and mark the IP for monitoring.",
  "safe_to_publish": false
}""",
        },
        {
            "role": "user",
            "content": build_user_prompt(
                article_title="State government announces new education policy",
                reader_name="ravi_k",
                comment_text="Great initiative! More schools in rural areas will really help children access quality education. Hope the implementation is as strong as the announcement.",
            ),
        },
        {
            "role": "assistant",
            "content": """{
  "verdict": "APPROVE",
  "confidence_score": 4,
  "primary_violation": "NONE",
  "violations_detected": {
    "spam": false,
    "baseless_misinformation": false,
    "abusive_hate_speech": false,
    "defamatory": false,
    "politically_inflammatory": false
  },
  "analysis_summary": "This comment is a constructive, relevant response to the education policy article. It expresses support while adding a reasonable caveat about implementation, which is legitimate editorial opinion.",
  "flagged_phrases": [],
  "recommendation": "Approve for immediate publication. The comment adds value to public discourse on the topic.",
  "safe_to_publish": true
}""",
        },
        {
            "role": "user",
            "content": build_user_prompt(
                article_title="Local politician attends community event",
                reader_name="truth_seeker",
                comment_text="This politician has been secretly laundering crores of rupees into foreign accounts. I have proof but can't show it publicly. Everyone knows this is true.",
            ),
        },
        {
            "role": "assistant",
            "content": """{
  "verdict": "REJECT",
  "confidence_score": 92,
  "primary_violation": "DEFAMATORY",
  "violations_detected": {
    "spam": false,
    "baseless_misinformation": true,
    "abusive_hate_speech": false,
    "defamatory": true,
    "politically_inflammatory": true
  },
  "analysis_summary": "This comment makes a serious criminal accusation (money laundering) against a named public figure without any evidence. The phrase 'I have proof but can't show it' is a classic misinformation pattern. Publishing this exposes Telangana Today to defamation liability.",
  "flagged_phrases": ["secretly laundering crores of rupees", "I have proof but can't show it", "Everyone knows this is true"],
  "recommendation": "Reject. This is potentially defamatory content. If submitted frequently from the same user, escalate to legal team. Do not publish under any circumstances.",
  "safe_to_publish": false
}""",
        },
    ]
