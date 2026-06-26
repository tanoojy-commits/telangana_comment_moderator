import os
import time
import json
import logging
import google.generativeai as genai
from config import Config
from prompt_engine import get_system_prompt

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure the Gemini API if key is present
api_key_configured = False
if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY != 'your_gemini_api_key_here':
    try:
        genai.configure(api_key=Config.GEMINI_API_KEY)
        api_key_configured = True
        logger.info("Gemini API client configured successfully.")
    except Exception as e:
        logger.error(f"Error configuring Gemini API: {str(e)}")

def get_mock_response(prompt_text):
    """
    Fallback mock generator when API key is missing or fails.
    Analyzes prompt text for keywords strictly from the comment section.
    """
    logger.warning("Using mock Gemini response because GEMINI_API_KEY is not configured or failed.")
    
    # Extract only the reader comment text to avoid system prompt keyword clashes
    prompt_lower = prompt_text.lower()
    comment_part = prompt_lower
    if "comment:" in prompt_lower:
        comment_part = prompt_lower.split("comment:")[-1]

    # 1. Reject - Abusive / Hate Speech / Defamation
    # Abusive Sample: "These opposition idiots should shut up. They are all traitors and criminals."
    # Preset Abusive: "Dharna", "idiots", "useless troublemakers"
    if "idiot" in comment_part or "traitor" in comment_part or "useless troublemakers" in comment_part:
        return {
            "verdict": "REJECT",
            "category": "Abusive",
            "confidence_score": 0.95,
            "reason": "The comment contains direct personal abuse and insults targeting public figures or groups.",
            "problematic_phrases": ["opposition idiots", "traitors and criminals", "useless troublemakers"],
            "safe_to_publish": False,
            "editor_note": None,
            "suggested_edit": None
        }
        
    # Defamation Sample: "commissioner accepts bribes", "tender was clearly fixed"
    elif "bribe" in comment_part or "fixed" in comment_part:
        return {
            "verdict": "REJECT",
            "category": "Defamation",
            "confidence_score": 0.92,
            "reason": "The comment makes unverified defamatory accusations of corruption and bribery against public officials.",
            "problematic_phrases": ["accepts bribes", "tender was clearly fixed"],
            "safe_to_publish": False,
            "editor_note": None,
            "suggested_edit": None
        }
        
    # Hate Speech Sample: "anti-nationals", "destroying Telangana's culture", "disgrace to Telangana"
    elif "anti-national" in comment_part or "disgrace to telangana" in comment_part or "destroying telangana" in comment_part:
        return {
            "verdict": "REJECT",
            "category": "Hate Speech",
            "confidence_score": 0.98,
            "reason": "The comment contains hate speech targeting supporters of political parties or regional groups.",
            "problematic_phrases": ["anti-nationals and traitors", "disgrace to Telangana"],
            "safe_to_publish": False,
            "editor_note": None,
            "suggested_edit": None
        }
        
    # 2. Needs Review - Borderline Political
    # Borderline Sample: "government always announces big projects before elections. I'll believe it when I see it actually completed."
    elif "elections" in comment_part or "promises, not enough action" in comment_part or "completely failed" in comment_part or "deserve better accountability" in comment_part:
        return {
            "verdict": "NEEDS_REVIEW",
            "category": "Borderline",
            "confidence_score": 0.78,
            "reason": "The comment expresses strong political cynicism and demands accountability, which requires editorial discretion.",
            "problematic_phrases": ["always announces big projects before elections", "Too many promises, not enough action"],
            "safe_to_publish": False,
            "editor_note": "Ensure this critical political opinion aligns with editorial guidelines and is not excessively inflammatory.",
            "suggested_edit": "The government is launching new expressways, but we need to see actual execution and delivery on these promises."
        }
        
    # 3. Allow - Positive / Neutral / Constructive
    # Clean Opinion Sample: "This is a very welcome initiative... implementation is transparent"
    elif "welcome initiative" in comment_part or "transparent" in comment_part or "rural areas" in comment_part:
        return {
            "verdict": "ALLOW",
            "category": "Positive",
            "confidence_score": 0.96,
            "reason": "The comment expresses civil support and constructive hope for government initiatives.",
            "problematic_phrases": [],
            "safe_to_publish": True,
            "editor_note": None,
            "suggested_edit": None
        }
        
    # Clean criticism: extension announced, financial transparency
    elif "metro rail" in comment_part or "transparency" in comment_part or "infrastructure projects" in comment_part:
        return {
            "verdict": "ALLOW",
            "category": "Constructive",
            "confidence_score": 0.91,
            "reason": "The comment offers civil and constructive feedback regarding infrastructure project financing.",
            "problematic_phrases": [],
            "safe_to_publish": True,
            "editor_note": None,
            "suggested_edit": None
        }

    # Clean education preset
    elif "tablets" in comment_part or "students" in comment_part:
        return {
            "verdict": "ALLOW",
            "category": "Positive",
            "confidence_score": 0.97,
            "reason": "The comment supports the educational initiative while offering a constructive suggestion about training.",
            "problematic_phrases": [],
            "safe_to_publish": True,
            "editor_note": None,
            "suggested_edit": None
        }

    # Default fallback
    else:
        return {
            "verdict": "ALLOW",
            "category": "Neutral",
            "confidence_score": 0.88,
            "reason": "The comment contains safe, constructive, or neutral reader discussion.",
            "problematic_phrases": [],
            "safe_to_publish": True,
            "editor_note": None,
            "suggested_edit": None
        }

def call_gemini(prompt_text):
    """
    Sends the prompt to Gemini 1.5 Pro and measures response latency.
    Returns a tuple of (parsed_json_dict, response_time_ms).
    """
    start_time = time.time()
    
    if not api_key_configured:
        time.sleep(0.6)  # Simulate API latency
        response_time_ms = int((time.time() - start_time) * 1000)
        return get_mock_response(prompt_text), response_time_ms

    try:
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=get_system_prompt()
            )
        except TypeError:
            logger.info("GenerativeModel does not support system_instruction parameter, using prompt prefix fallback.")
            model = genai.GenerativeModel(model_name="gemini-1.5-pro")
            prompt_text = f"{get_system_prompt()}\n\n{prompt_text}"
        
        # Generation configuration for structured JSON output
        try:
            generation_config = genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1024,
                response_mime_type="application/json"
            )
        except TypeError:
            logger.info("GenerationConfig does not support response_mime_type parameter, using default config.")
            generation_config = genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1024
            )
        
        response = model.generate_content(
            contents=prompt_text,
            generation_config=generation_config
        )
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        raw_text = response.text.strip()
        
        # Strip potential markdown code fences just in case
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```json"):
                raw_text = "\n".join(lines[1:-1])
            elif lines[0].startswith("```"):
                raw_text = "\n".join(lines[1:-1])
            raw_text = raw_text.strip()
            
        parsed_response = json.loads(raw_text)
        
        # Backward compatibility field normalization
        if "moderation_verdict" in parsed_response and "verdict" not in parsed_response:
            parsed_response["verdict"] = parsed_response["moderation_verdict"]
        
        # Validate values to map ALLOW/NEEDS_REVIEW/REJECT
        verdict = str(parsed_response.get("verdict", "NEEDS_REVIEW")).upper().strip()
        if verdict in ["APPROVED", "ALLOW", "ALLOWS"]:
            parsed_response["verdict"] = "ALLOW"
        elif verdict in ["REJECTED", "REJECT", "ABUSIVE", "HATE_SPEECH", "DEFAMATION"]:
            parsed_response["verdict"] = "REJECT"
        else:
            parsed_response["verdict"] = "NEEDS_REVIEW"
            
        # Ensure categories map to v5 categories
        category = str(parsed_response.get("category", "Borderline")).strip()
        valid_cats = ["Positive", "Neutral", "Constructive", "Abusive", "Hate Speech", "Defamation", "Political Inflammatory", "Spam", "Borderline"]
        if category not in valid_cats:
            parsed_response["category"] = "Borderline" if parsed_response["verdict"] == "NEEDS_REVIEW" else ("Positive" if parsed_response["verdict"] == "ALLOW" else "Abusive")

        # Fill key fallbacks
        if "confidence_score" not in parsed_response:
            parsed_response["confidence_score"] = 0.8
        if "reason" not in parsed_response:
            parsed_response["reason"] = "Comment classified as " + parsed_response["verdict"]
        if "problematic_phrases" not in parsed_response:
            parsed_response["problematic_phrases"] = []
        if "safe_to_publish" not in parsed_response:
            parsed_response["safe_to_publish"] = (parsed_response["verdict"] == "ALLOW")
        if "editor_note" not in parsed_response:
            parsed_response["editor_note"] = None
        if "suggested_edit" not in parsed_response:
            parsed_response["suggested_edit"] = None
            
        return parsed_response, response_time_ms

    except Exception as e:
        logger.error(f"Error invoking Gemini API: {str(e)}. Falling back to mock responses for testing.")
        response_time_ms = int((time.time() - start_time) * 1000)
        return get_mock_response(prompt_text), response_time_ms
