from datetime import datetime, timezone

def now():
    return datetime.now(timezone.utc)

STAGES = ("idea", "prototype", "mvp", "revenue")
INDUSTRIES = ("fintech", "healthtech", "edtech", "saas", "ecommerce", "climate", "other")
STATUSES = ("submitted", "in_review", "shortlisted", "funded", "rejected")
TOPICS = ("general", "funding", "partnership", "support")
