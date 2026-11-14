from mongoengine import Document, StringField, EmailField, DateTimeField
from . import now

class User(Document):
    name = StringField(required=True, min_length=2, max_length=60)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    role = StringField(choices=("founder", "admin"), default="founder")
    created_at = DateTimeField(default=now)
    last_login_at = DateTimeField()

    meta = {"collection": "users"}

    def to_public(self):
        return {"id": str(self.id), "name": self.name, "email": self.email, "role": self.role}
