import os
import mongoengine
from werkzeug.security import generate_password_hash
from .config import Config
from .models.user import User
from .models.stats import StatsSnapshot
from .models.plan import Plan

PLANS_DATA = [
    {
        "position": 1,
        "slug": "starter",
        "name": "Starter",
        "price_monthly": 0,
        "highlighted": False,
        "blurb": "For founders exploring early ideas.",
        "features": [
            "Idea review",
            "Community access",
            "Monthly office hours",
        ],
    },
    {
        "position": 2,
        "slug": "growth",
        "name": "Growth",
        "price_monthly": 49,
        "highlighted": True,
        "blurb": "For early stage startups seeking momentum.",
        "features": [
            "Mentor sessions",
            "Pitch deck review",
            "Investor intro list",
        ],
    },
    {
        "position": 3,
        "slug": "scale",
        "name": "Scale",
        "price_monthly": 199,
        "highlighted": False,
        "blurb": "For scaling ventures preparing for institutional capital.",
        "features": [
            "Dedicated advisor",
            "Funding readiness audit",
            "Partner perks",
        ],
    },
]

def seed_stats():
    if StatsSnapshot.objects.count() == 0:
        StatsSnapshot(
            success_rate=83,
            failure_rate=17,
            launch_score=86,
            growth_pct=4.52,
        ).save()
        print("Seeded stats snapshot.")
    else:
        print("Stats snapshot already exists.")

def seed_plans():
    for data in PLANS_DATA:
        Plan.objects(slug=data["slug"]).modify(
            upsert=True,
            new=True,
            set__position=data["position"],
            set__name=data["name"],
            set__price_monthly=data["price_monthly"],
            set__highlighted=data["highlighted"],
            set__blurb=data["blurb"],
            set__features=data["features"],
        )
    print("Seeded plans.")

def seed_admin():
    admin_email = Config.ADMIN_EMAIL.lower().strip()
    admin_pass = Config.ADMIN_PASSWORD

    existing = User.objects(email=admin_email).first()
    if not existing:
        User(
            name="Admin",
            email=admin_email,
            password_hash=generate_password_hash(admin_pass),
            role="admin",
        ).save()
        print(f"Created admin user ({admin_email}).")
    else:
        print(f"Admin user already exists ({admin_email}).")

def run():
    mongo_uri = Config.MONGODB_URI
    if "mongodb+srv://" in mongo_uri and "/" not in mongo_uri.split("@")[-1]:
        mongoengine.connect(host=mongo_uri, db="upfound")
    else:
        mongoengine.connect(host=mongo_uri)
    seed_stats()
    seed_plans()
    seed_admin()
    print("Seed complete.")

if __name__ == "__main__":
    run()
