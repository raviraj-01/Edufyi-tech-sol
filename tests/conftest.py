import pytest
import mongoengine
import mongomock
from backend.app import create_app

@pytest.fixture
def app():
    mongoengine.disconnect()
    mongoengine.connect("test_upfound", host="localhost", mongo_client_class=mongomock.MongoClient, uuidRepresentation="standard")
    app = create_app(test_config={"TESTING": True})
    yield app
    mongoengine.disconnect()

@pytest.fixture
def client(app):
    return app.test_client()
