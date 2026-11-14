from mongoengine import Document, IntField, FloatField, DateTimeField
from . import now

class StatsSnapshot(Document):
    success_rate = IntField(required=True, min_value=0, max_value=100)
    failure_rate = IntField(required=True, min_value=0, max_value=100)
    launch_score = IntField(required=True, min_value=0, max_value=100)
    growth_pct = FloatField(default=0.0)
    captured_at = DateTimeField(default=now)

    meta = {"collection": "stats_snapshots", "indexes": ["-captured_at"]}

    def clean(self):
        if self.success_rate + self.failure_rate != 100:
            from mongoengine import ValidationError
            raise ValidationError("success_rate and failure_rate must add up to 100")

    def to_public(self):
        return {
            "launching_startups": {
                "success_rate": self.success_rate,
                "failure_rate": self.failure_rate,
                "launch_score": self.launch_score,
                "growth_pct": self.growth_pct,
                "updated_at": self.captured_at.isoformat() if self.captured_at else None,
            }
        }
