import re
from .errors import ValidationError
from ..models import STAGES, INDUSTRIES, STATUSES, TOPICS

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def check_name(val):
    if not isinstance(val, str):
        raise ValidationError("Name must be text", field="name")
    val = val.strip()
    if len(val) < 2 or len(val) > 60:
        raise ValidationError("Name must be between 2 and 60 characters", field="name")
    return val

def check_email(val):
    if not isinstance(val, str):
        raise ValidationError("Email must be text", field="email")
    val = val.strip().lower()
    if not EMAIL_RE.match(val):
        raise ValidationError("Email is not valid", field="email")
    return val

def check_password(val):
    if not isinstance(val, str):
        raise ValidationError("Password must be text", field="password")
    if len(val) < 8 or len(val) > 72:
        raise ValidationError("Password must be between 8 and 72 characters", field="password")
    return val

def check_startup_name(val):
    if not isinstance(val, str):
        raise ValidationError("Startup name must be text", field="startup_name")
    val = val.strip()
    if len(val) < 2 or len(val) > 80:
        raise ValidationError("Startup name must be between 2 and 80 characters", field="startup_name")
    return val

def check_website_url(val):
    if not val:
        return None
    if not isinstance(val, str):
        raise ValidationError("Website URL must be text", field="website_url")
    val = val.strip()
    if not (val.startswith("http://") or val.startswith("https://")):
        raise ValidationError("Website URL must start with http:// or https://", field="website_url")
    return val

def check_industry(val):
    if val not in INDUSTRIES:
        raise ValidationError(f"Industry must be one of {', '.join(INDUSTRIES)}", field="industry")
    return val

def check_stage(val):
    if val not in STAGES:
        raise ValidationError(f"Stage must be one of {', '.join(STAGES)}", field="stage")
    return val

def check_funding_ask(val):
    try:
        val = int(val)
    except (TypeError, ValueError):
        raise ValidationError("Funding ask must be an integer", field="funding_ask")
    if val < 1000 or val > 5_000_000:
        raise ValidationError("Funding ask must be between $1,000 and $5,000,000", field="funding_ask")
    return val

def check_pitch(val):
    if not isinstance(val, str):
        raise ValidationError("Pitch must be text", field="pitch")
    val = val.strip()
    if len(val) < 30 or len(val) > 1000:
        raise ValidationError("Pitch must be between 30 and 1000 characters", field="pitch")
    return val

def check_topic(val):
    if val not in TOPICS:
        raise ValidationError(f"Topic must be one of {', '.join(TOPICS)}", field="topic")
    return val

def check_message(val):
    if not isinstance(val, str):
        raise ValidationError("Message must be text", field="message")
    val = val.strip()
    if len(val) < 10 or len(val) > 1000:
        raise ValidationError("Message must be between 10 and 1000 characters", field="message")
    return val

def check_status(val):
    if val not in STATUSES:
        raise ValidationError(f"Status must be one of {', '.join(STATUSES)}", field="status")
    return val
