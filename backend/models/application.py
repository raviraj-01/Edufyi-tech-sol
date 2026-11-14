from mongoengine import (
    Document, EmbeddedDocument, EmbeddedDocumentListField, ReferenceField,
    StringField, URLField, IntField, DateTimeField, CASCADE,
)
from . import now, STAGES, INDUSTRIES, STATUSES
from .user import User

class StatusChange(EmbeddedDocument):
    status = StringField(required=True, choices=STATUSES)
    note = StringField(max_length=300)
    at = DateTimeField(default=now)

class Application(Document):
    user = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    startup_name = StringField(required=True, min_length=2, max_length=80)
    website_url = URLField()
    industry = StringField(required=True, choices=INDUSTRIES)
    stage = StringField(required=True, choices=STAGES)
    funding_ask = IntField(required=True, min_value=1000, max_value=5_000_000)
    pitch = StringField(required=True, min_length=30, max_length=1000)
    status = StringField(choices=STATUSES, default="submitted")
    history = EmbeddedDocumentListField(StatusChange)
    created_at = DateTimeField(default=now)
    updated_at = DateTimeField(default=now)

    meta = {
        "collection": "applications",
        "indexes": ["status", ["user", "-created_at"]],
    }

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user.id) if self.user else None,
            "startup_name": self.startup_name,
            "website_url": self.website_url,
            "industry": self.industry,
            "stage": self.stage,
            "funding_ask": self.funding_ask,
            "pitch": self.pitch,
            "status": self.status,
            "history": [
                {"status": h.status, "note": h.note, "at": h.at.isoformat() if h.at else None}
                for h in self.history
            ],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
