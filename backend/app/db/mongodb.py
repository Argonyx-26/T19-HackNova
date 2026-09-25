"""MongoDB Atlas connection lifecycle and collection accessors.

Historical intelligence records are PRESERVED BY DEFAULT.
NO TTL indexes are created on intelligence collections.
"""

import logging
from typing import Optional, Any
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from backend.app.core.config import settings

logger = logging.getLogger("sentinel.db")

class MongoDBManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.is_connected: bool = False
        self._fallback_store: dict[str, list[dict[str, Any]]] = {
            "events": [],
            "entities": [],
            "locations": [],
            "situations": [],
            "situation_transitions": [],
            "predictions": [],
            "interventions": [],
            "recommendations": [],
        }

    def connect(self) -> bool:
        """Establish connection to MongoDB Atlas with graceful fallback for local testing."""
        if not settings.MONGODB_URI or settings.MONGODB_URI == "mongodb://localhost:27017":
            # Attempt local/default connection with short timeout
            try:
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
                self.client.admin.command('ping')
                self.db = self.client[settings.MONGODB_DATABASE]
                self.is_connected = True
                logger.info("Connected to MongoDB successfully.")
                return True
            except Exception as e:
                logger.warning("MongoDB not reachable at configured URI. Operating in resilient simulation mode: %s", str(e))
                self.is_connected = False
                return False

        try:
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                retryWrites=True
            )
            # Ping to verify TLS/authentication
            self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DATABASE]
            self.is_connected = True
            logger.info("Connected to MongoDB Atlas database '%s'", settings.MONGODB_DATABASE)
            return True
        except Exception as e:
            logger.error("Failed to connect to MongoDB Atlas: %s", str(e))
            self.is_connected = False
            return False

    def close(self):
        if self.client:
            self.client.close()
            self.is_connected = False
            logger.info("MongoDB connection closed.")

    def get_collection(self, collection_name: str):
        if self.is_connected and self.db is not None:
            return self.db[collection_name]
        return FallbackCollection(collection_name, self._fallback_store.setdefault(collection_name, []))

class FallbackCollection:
    """In-memory collection mock matching PyMongo interface when Atlas is in disconnected/offline demo mode."""
    def __init__(self, name: str, storage: list[dict[str, Any]]):
        self.name = name
        self.storage = storage

    def insert_one(self, document: dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        self.storage.append(doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    def find_one(self, filter: dict[str, Any] = None):
        if not filter:
            return self.storage[0] if self.storage else None
        for doc in self.storage:
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, filter: dict[str, Any] = None, sort: list = None, limit: int = 0):
        results = []
        for doc in self.storage:
            if not filter:
                results.append(dict(doc))
                continue
            match = True
            for k, v in filter.items():
                if isinstance(v, dict):
                    # Handle basic MongoDB operators like $gte, $in
                    val = doc.get(k)
                    if "$gte" in v and not (val >= v["$gte"]):
                        match = False
                    if "$lte" in v and not (val <= v["$lte"]):
                        match = False
                    if "$in" in v and not (val in v["$in"]):
                        match = False
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(doc))

        if sort:
            for field, direction in reversed(sort):
                results.sort(key=lambda x: x.get(field, 0), reverse=(direction == -1))

        if limit > 0:
            results = results[:limit]

        class Cursor(list):
            pass
        return Cursor(results)

    def update_one(self, filter: dict[str, Any], update: dict[str, Any]):
        doc = self.find_one(filter)
        if doc:
            for target in self.storage:
                if target.get("_id") == doc.get("_id"):
                    if "$set" in update:
                        target.update(update["$set"])
                    if "$push" in update:
                        for k, v in update["$push"].items():
                            target.setdefault(k, []).append(v)
                    break
        class UpdateResult:
            matched_count = 1 if doc else 0
            modified_count = 1 if doc else 0
        return UpdateResult()

    def count_documents(self, filter: dict[str, Any] = None):
        return len(self.find(filter))

db_manager = MongoDBManager()

def get_db_manager() -> MongoDBManager:
    return db_manager
