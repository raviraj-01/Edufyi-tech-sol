from mongoengine import Document, StringField, IntField, ListField, BooleanField

class Plan(Document):
    slug = StringField(required=True, unique=True)
    name = StringField(required=True, max_length=40)
    price_monthly = IntField(required=True, min_value=0)
    blurb = StringField(max_length=140)
    features = ListField(StringField(max_length=80))
    highlighted = BooleanField(default=False)
    position = IntField(default=0)

    meta = {"collection": "plans", "indexes": ["position"]}

    def to_public(self):
        return {
            "id": str(self.id),
            "slug": self.slug,
            "name": self.name,
            "price_monthly": self.price_monthly,
            "blurb": self.blurb,
            "features": list(self.features),
            "highlighted": self.highlighted,
            "position": self.position,
        }
