"""MongoDB Atlas connection lifecycle and collection accessors.

Historical intelligence records are PRESERVED BY DEFAULT.
NO TTL indexes are created on intelligence collections.
"""

import logging
from typing import Optional, Any, Dict, List
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from backend.app.core.config import settings

logger = logging.getLogger("sentinel.db")

class FallbackCollection:
    """In-memory collection mock matching PyMongo interface when Atlas is in disconnected/offline demo mode."""
    def __init__(self, name: str, storage: List[Dict[str, Any]]):
        self.name = name
        self.storage = storage

    def _matches(self, doc: Dict[str, Any], filter_dict: Optional[Dict[str, Any]]) -> bool:
        if not filter_dict:
            return True
        for k, v in filter_dict.items():
            val = doc.get(k)
            if isinstance(v, dict):
                if "$in" in v and val not in v["$in"]:
                    return False
                if "$gte" in v and (val is None or val < v["$gte"]):
                    return False
                if "$lte" in v and (val is None or val > v["$lte"]):
                    return False
            elif val != v:
                return False
        return True

    def insert_one(self, document: Dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        self.storage.append(doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    def find_one(self, filter: Dict[str, Any] = None):
        for doc in self.storage:
            if self._matches(doc, filter):
                return dict(doc)
        return None

    def find(self, filter: Dict[str, Any] = None, sort: list = None, limit: int = 0):
        results = [dict(doc) for doc in self.storage if self._matches(doc, filter)]

        if sort:
            for field, direction in reversed(sort):
                results.sort(key=lambda x: x.get(field, ""), reverse=(direction == -1))

        if limit > 0:
            results = results[:limit]

        class Cursor(list):
            pass
        return Cursor(results)

    def update_one(self, filter: Dict[str, Any], update: Dict[str, Any]):
        for target in self.storage:
            if self._matches(target, filter):
                if "$set" in update:
                    target.update(update["$set"])
                if "$push" in update:
                    for k, v in update["$push"].items():
                        target.setdefault(k, []).append(v)
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()
        class UpdateResultZero:
            matched_count = 0
            modified_count = 0
        return UpdateResultZero()

    def count_documents(self, filter: Dict[str, Any] = None):
        return len(self.find(filter))

class MongoDBManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.is_connected: bool = False
        self._fallback_store: Dict[str, List[Dict[str, Any]]] = {
            "events": [],
            "entities": [],
            "locations": [],
            "situations": [],
            "situation_transitions": [],
            "predictions": [],
            "interventions": [],
            "recommendations": [],
        }

    def reset(self):
        """Clears memory buffers for isolated test runs."""
        for k in self._fallback_store:
            self._fallback_store[k].clear()

    def connect(self) -> bool:
        """Establish connection to MongoDB Atlas with graceful fallback for local testing."""
        if not settings.MONGODB_URI or settings.MONGODB_URI == "mongodb://localhost:27017":
            try:
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
                self.client.admin.command('ping')
                self.db = self.client[settings.MONGODB_DATABASE]
                self.is_connected = True
                logger.info("Connected to MongoDB successfully.")
                return True
            except Exception as e:
                logger.warning("MongoDB not reachable at configured URI. Operating in resilient simulation mode.")
                self.is_connected = False
                return False

        try:
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                retryWrites=True
            )
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

db_manager = MongoDBManager()

def get_db_manager() -> MongoDBManager:
    return db_manager
