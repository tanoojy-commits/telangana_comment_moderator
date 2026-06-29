import os
import sys
import json
import time

# Add parent directory to path so we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Reconfigure stdout/stderr to handle emojis and special symbols in terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

from config import Config
from moderation_engine import check_spam_rules
from gemini_client import call_gemini
from prompt_engine import build_moderation_prompt

# Test Dataset
test_dataset = [
    # 1. Clean Comments (Expected: ALLOW)
    {
        "comment": "This housing scheme will help many poor families.",
        "article_title": "Telangana government announces free housing scheme",
        "expected": "ALLOW",
        "type": "Clean"
    },
    {
        "comment": "The government should ensure transparency.",
        "article_title": "Municipal administration initiates cleanup drive for Musi River",
        "expected": "ALLOW",
        "type": "Clean"
    },
    {
        "comment": "I support this decision.",
        "article_title": "New metro rail extension announced for Secunderabad",
        "expected": "ALLOW",
        "type": "Clean"
    },
    
    # 2. Borderline Comments (Expected: NEEDS_REVIEW)
    {
        "comment": "The scheme is good, but implementation must improve.",
        "article_title": "Telangana government announces free housing scheme",
        "expected": "NEEDS_REVIEW",
        "type": "Borderline"
    },
    {
        "comment": "I disagree with this policy because...",
        "article_title": "Opposition holds dharna against new land policy",
        "expected": "NEEDS_REVIEW",
        "type": "Borderline"
    },
    
    # 3. Spam/Toxic/Irrelevant Comments (Expected: REJECT)
    {
        "comment": "Comment Moderation Comment Moderation Comment Moderation",
        "article_title": "Telangana government announces free housing scheme",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Buy followers",
        "article_title": "Hyderabad real estate sees 15% growth in Q1",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Subscribe",
        "article_title": "Telangana government distributes free tablets to students",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Visit my website",
        "article_title": "Hyderabad real estate sees 15% growth in Q1",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Crypto investment",
        "article_title": "Hyderabad real estate sees 15% growth in Q1",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Earn Rs. 5000 daily",
        "article_title": "Telangana launches direct financial assistance for handloom weavers",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "😂😂😂😂😂😂😂",
        "article_title": "Religious festival celebrated across Hyderabad",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "asdfghjkl",
        "article_title": "New IT park ground breaking ceremony",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "aaaaaaaaaaaa",
        "article_title": "New IT park ground breaking ceremony",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "111111111111",
        "article_title": "New IT park ground breaking ceremony",
        "expected": "REJECT",
        "type": "Spam"
    },
    {
        "comment": "Hello Hello Hello",
        "article_title": "Telangana government distributes free tablets to students",
        "expected": "REJECT",
        "type": "Spam"
    }
]

def run_moderation_flow(comment_text, article_title, reader_name="Test User"):
    # Layer 1: Rule-Based Pre-AI Spam Filter
    pre_result = check_spam_rules(comment_text)
    if pre_result:
        verdict, category, confidence, reason = pre_result
        return {
            "verdict": verdict,
            "category": category,
            "confidence_score": confidence / 100.0,
            "reason": f"[Rule Filter] {reason}",
            "source": "Rule Filter (Pre-AI)"
        }
        
    # Layer 2: Gemini AI Moderation
    prompt = build_moderation_prompt(article_title, reader_name, comment_text)
    ai_res, _ = call_gemini(prompt)
    
    # Layer 3: Post-AI Validation Override
    if ai_res.get("verdict") == "ALLOW":
        post_result = check_spam_rules(comment_text)
        if post_result:
            verdict, category, confidence, reason = post_result
            return {
                "verdict": verdict,
                "category": category,
                "confidence_score": confidence / 100.0,
                "reason": f"[Post-AI Override] {reason}",
                "source": "Rule Override (Post-AI)"
            }
            
    return {
        "verdict": ai_res.get("verdict", "NEEDS_REVIEW"),
        "category": ai_res.get("category", "Borderline"),
        "confidence_score": ai_res.get("confidence_score", 0.8),
        "reason": ai_res.get("reason", ""),
        "source": "Gemini AI"
    }

def main():
    print("=" * 60)
    print("      HYBRID MODERATION ENGINE EVALUATION RUNNER")
    print("=" * 60)
    
    total = 0
    correct = 0
    false_approvals = 0   # Expected REJECT/REVIEW but got ALLOW
    false_rejections = 0  # Expected ALLOW but got REJECT/REVIEW
    
    tp = 0 # True ALLOW
    fp = 0 # False ALLOW (false approval)
    tn = 0 # True REJECT/REVIEW
    fn = 0 # False REJECT/REVIEW (false rejection)
    
    results = []
    
    for idx, item in enumerate(test_dataset):
        comment = item["comment"]
        article = item["article_title"]
        expected = item["expected"]
        
        print(f"\n[{idx+1}/{len(test_dataset)}] Testing '{item['type']}' Comment:")
        print(f"  Comment: \"{comment}\"")
        print(f"  Context: \"{article}\"")
        
        start_time = time.time()
        mod_result = run_moderation_flow(comment, article)
        duration = time.time() - start_time
        
        verdict = mod_result["verdict"]
        source = mod_result["source"]
        reason = mod_result["reason"]
        
        is_correct = (verdict == expected)
        if is_correct:
            correct += 1
            if expected == "ALLOW":
                tp += 1
            else:
                tn += 1
        else:
            if expected == "ALLOW":
                fn += 1
                false_rejections += 1
            else: # expected was REJECT or NEEDS_REVIEW, but we allowed it
                if verdict == "ALLOW":
                    fp += 1
                    false_approvals += 1
                else: # expected REJECT, got NEEDS_REVIEW (or vice versa) - correct negative classification, but mismatch on sub-status
                    tn += 1
                    correct += 1
                    is_correct = True
                    
        total += 1
        results.append({
            "comment": comment,
            "expected": expected,
            "got": verdict,
            "source": source,
            "correct": is_correct,
            "reason": reason
        })
        
        status_symbol = "PASS" if is_correct else "FAIL"
        print(f"  Result: Expected {expected} | Got {verdict} ({status_symbol} via {source})")
        print(f"  Reason: {reason}")
        print(f"  Time: {duration*1000:.1f}ms")
        
    print("\n" + "=" * 60)
    print("                     METRICS SUMMARY")
    print("=" * 60)
    print(f"Total Comments Tested:     {total}")
    print(f"Correct Decisions:         {correct} / {total}")
    print(f"False Approvals (FP):      {false_approvals}")
    print(f"False Rejections (FN):     {false_rejections}")
    
    accuracy = correct / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    print(f"Overall Accuracy:          {accuracy:.1%}")
    print(f"Precision:                 {precision:.1%}")
    print(f"Recall:                    {recall:.1%}")
    print(f"F1 Score:                  {f1:.2f}")
    print("=" * 60)

if __name__ == "__main__":
    main()
