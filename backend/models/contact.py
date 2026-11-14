from mongoengine import Document, StringField, EmailField, BooleanField, DateTimeField
from . import now, TOPICS

class ContactMessage(Document):
    name = StringField(required=True, min_length=2, max_length=60)
    email = EmailField(required=True)
    topic = StringField(choices=TOPICS, default="general")
    message = StringField(required=True, min_length=10, max_length=1000)
    handled = BooleanField(default=False)
    created_at = DateTimeField(default=now)

    meta = {"collection": "contact_messages", "indexes": ["-created_at"]}

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "topic": self.topic,
            "message": self.message,
            "handled": self.handled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
