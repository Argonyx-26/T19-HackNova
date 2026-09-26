"""Physical Behavior Detection Service for SENTINEL-X.

Evaluates events to detect physical security behaviors and creates
PhysicalBehaviorEvent records. Seeded with representative behavior
events for demo/development scenarios.
"""

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from backend.app.models.physical_behavior import (
    PhysicalBehaviorEvent, PhysicalBehaviorType, ZoneClassification,
    BehaviorSeverity, get_behavior_severity
)
from backend.app.models.event import NormalizedEvent
from backend.app.db.mongodb import db_manager

logger = logging.getLogger('sentinel.physical_behavior')

# Five-camera layout with zone assignments
CAMERA_ZONES: Dict[str, Dict[str, str]] = {
    'CAM-01': {'zone_id': 'zone-lobby-01', 'zone_name': 'Main Lobby', 'classification': 'PUBLIC'},
    'CAM-02': {'zone_id': 'zone-server-corridor-02', 'zone_name': 'Server Corridor', 'classification': 'RESTRICTED'},
    'CAM-03': {'zone_id': 'zone-gate-03', 'zone_name': 'Security Gate', 'classification': 'CONTROLLED'},
    'CAM-04': {'zone_id': 'zone-perimeter-04', 'zone_name': 'Perimeter East', 'classification': 'CONTROLLED'},
    'CAM-05': {'zone_id': 'zone-parking-05', 'zone_name': 'Restricted Parking', 'classification': 'CONTROLLED'},
}

DEMO_BEHAVIORS: List[Dict[str, Any]] = [
    {
        'event_id': 'pbev-loiter-p42-001',
        'behavior_type': 'LOITERING',
        'camera_id': 'CAM-04',
        'track_ids': ['PERSON-P42'],
        'zone_id': 'zone-perimeter-04',
        'zone_classification': 'CONTROLLED',
        'severity': 'MEDIUM',
        'behavior_confidence': 0.91,
        'dwell_time_seconds': 127.0,
        'movement_trajectory': 'Enter → Slow walk → Stop → Extended stationary',
        'physical_note': 'Subject P42 detected loitering in perimeter zone for 127 seconds. No visible purpose.',
        'situation_id': None,
    },
    {
        'event_id': 'pbev-rze-p42-002',
        'behavior_type': 'RESTRICTED_ZONE_ENTRY',
        'camera_id': 'CAM-02',
        'track_ids': ['PERSON-P42'],
        'zone_id': 'zone-server-corridor-02',
        'zone_classification': 'RESTRICTED',
        'severity': 'CRITICAL',
        'behavior_confidence': 0.96,
        'movement_trajectory': 'Loiter → Door approach → Zone entry',
        'physical_note': 'Subject P42 entered restricted server corridor without valid access credential.',
        'access_event_id': 'acc-reject-341',
        'situation_id': None,
    },
    {
        'event_id': 'pbev-tailgate-p77-003',
        'behavior_type': 'TAILGATING',
        'camera_id': 'CAM-03',
        'track_ids': ['PERSON-P77', 'PERSON-P42'],
        'zone_id': 'zone-gate-03',
        'zone_classification': 'CONTROLLED',
        'severity': 'HIGH',
        'behavior_confidence': 0.88,
        'entity_count': 2,
        'physical_note': 'Subject P77 followed P42 through security gate without individual authentication.',
        'situation_id': None,
    },
    {
        'event_id': 'pbev-acm-p42-004',
        'behavior_type': 'ACCESS_CAMERA_MISMATCH',
        'camera_id': 'CAM-02',
        'track_ids': ['PERSON-P42'],
        'zone_id': 'zone-server-corridor-02',
        'zone_classification': 'RESTRICTED',
        'severity': 'HIGH',
        'behavior_confidence': 0.93,
        'access_event_id': 'acc-reject-341',
        'physical_note': 'Badge denied at SERVER-DOOR-01 but subject physically present in zone — camera/access mismatch.',
        'situation_id': None,
    },
    {
        'event_id': 'pbev-forced-cam5-005',
        'behavior_type': 'FORCED_ENTRY',
        'camera_id': 'CAM-05',
        'track_ids': ['PERSON-SUSPECT-X'],
        'zone_id': 'zone-server-room-vault',
        'zone_classification': 'CRITICAL',
        'severity': 'CRITICAL',
        'behavior_confidence': 0.95,
        'physical_note': 'Forced door breach detected at server room vault entry.',
        'situation_id': None,
    },
]


class PhysicalBehaviorService:
    def __init__(self):
        self._seed_demo_behaviors()

    def _get_collection(self):
        return db_manager.get_collection('physical_behaviors')

    def _seed_demo_behaviors(self):
        col = self._get_collection()
        for ev in DEMO_BEHAVIORS:
            existing = col.find_one({'event_id': ev['event_id']})
            if not existing:
                ev_copy = ev.copy()
                ev_copy['timestamp'] = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
                col.insert_one(ev_copy)
        logger.info('Physical behavior seed complete')

    def get_all_behaviors(self, limit: int = 50) -> List[PhysicalBehaviorEvent]:
        col = self._get_collection()
        docs = col.find({}).sort('timestamp', -1).limit(limit)
        if len(docs) == 0:
            self._seed_demo_behaviors()
            docs = col.find({}).sort('timestamp', -1).limit(limit)

        results = []
        for d in docs:
            d.pop('_id', None)
            try:
                results.append(PhysicalBehaviorEvent(**d))
            except Exception as e:
                logger.warning(f'Skip behavior doc: {e}')
        return results

    def get_behaviors(self, limit: int = 50) -> List[PhysicalBehaviorEvent]:
        return self.get_all_behaviors(limit=limit)

    def get_behaviors_for_situation(self, situation_id: str) -> List[PhysicalBehaviorEvent]:
        col = self._get_collection()
        docs = col.find({'situation_id': situation_id})
        results = []
        for d in docs:
            d.pop('_id', None)
            try:
                results.append(PhysicalBehaviorEvent(**d))
            except Exception as e:
                logger.warning(f'Skip behavior doc: {e}')
        return results

    def evaluate_event_for_behavior(
        self, event: NormalizedEvent, situation_id: Optional[str] = None
    ) -> Optional[PhysicalBehaviorEvent]:
        if event.source_type.value not in ('CCTV', 'ACCESS'):
            return None

        payload = event.payload or {}
        raw_cam = str(payload.get('camera_id') or event.location_id or 'CAM-01')
        camera_id = raw_cam.replace('cctv-', '') if raw_cam.startswith('cctv-') else raw_cam

        zone_info = CAMERA_ZONES.get(camera_id, {})
        zone_id = zone_info.get('zone_id', event.location_id or 'zone-general')
        zone_classification = zone_info.get('classification', 'CONTROLLED')
        dwell = None
        entity_count = None
        access_event_id = None

        evt = event.event_type.upper()

        # Rule-based behavior classification
        behavior_type: Optional[str] = None
        if 'LOITER' in evt or payload.get('dwell_seconds', 0) > 90 or payload.get('dwell_time', 0) > 30:
            behavior_type = 'LOITERING'
            dwell = float(payload.get('dwell_seconds') or payload.get('dwell_time') or 90)
        elif 'TAILGAT' in evt:
            behavior_type = 'TAILGATING'
            entity_count = int(payload.get('entity_count', 2))
        elif 'FORCED' in evt or 'BREAK' in evt:
            behavior_type = 'FORCED_ENTRY'
        elif 'RESTRICTED' in evt or 'ZONE_BREACH' in evt:
            behavior_type = 'RESTRICTED_ZONE_ENTRY'
            zone_classification = 'RESTRICTED'
        elif 'WEAPON' in evt or 'GUN' in evt or 'KNIFE' in evt:
            behavior_type = 'WEAPON_LIKE_OBJECT'
        elif 'CROWD' in evt:
            behavior_type = 'CROWD_FORMATION'
            entity_count = int(payload.get('entity_count', 4))
        elif 'ABANDON' in evt:
            behavior_type = 'OBJECT_ABANDONMENT'
        elif 'MISMATCH' in evt or ('ACCESS' in evt and 'CAMERA' in evt):
            behavior_type = 'ACCESS_CAMERA_MISMATCH'
            access_event_id = payload.get('access_event_id')
        elif 'IMPOSSIBLE' in evt or 'TRAVEL' in evt:
            behavior_type = 'IMPOSSIBLE_MOVEMENT'
        elif 'UNUSUAL' in evt or 'ERRATIC' in evt:
            behavior_type = 'UNUSUAL_MOVEMENT'

        if not behavior_type:
            return None

        severity_str = get_behavior_severity(behavior_type, zone_classification)

        phys_ev = PhysicalBehaviorEvent(
            event_id=f'pbev-{uuid.uuid4().hex[:8]}',
            behavior_type=PhysicalBehaviorType(behavior_type),
            camera_id=camera_id,
            track_ids=[event.entity_id] if event.entity_id else [],
            zone_id=zone_id,
            zone_classification=ZoneClassification(zone_classification),
            severity=BehaviorSeverity(severity_str),
            behavior_confidence=event.confidence,
            dwell_time_seconds=dwell,
            entity_count=entity_count,
            access_event_id=access_event_id,
            physical_note=f'Behavior {behavior_type} detected at {zone_id}',
            situation_id=situation_id or event.situation_id,
        )

        col = self._get_collection()
        col.insert_one(phys_ev.to_doc())
        logger.info(f'Physical behavior recorded: {behavior_type} @ {zone_id} (conf={event.confidence})')
        return phys_ev


physical_behavior_service = PhysicalBehaviorService()
