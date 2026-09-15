"""
Entity Resolution Module for MPLAD-GUARD AI
Maps noisy/abbreviated implementing agency names into canonical Agency entities.
"""
import re
from typing import Dict, Tuple

AGENCY_CANONICAL_MAP = {
    "RWD_NAL": {
        "id": "AGY-RWD-NAL",
        "name": "Rural Works Department (RWD) - Works Division, Nalanda",
        "type": "State Engineering Department",
        "district": "Nalanda",
        "aliases": [
            "rwd nalanda", "rural works dept nalanda", "r.w.d. nalanda",
            "executive engineer rwd nalanda", "rural works division bihar sharif",
            "rwd division 1 nalanda", "rwd-works div nalanda"
        ]
    },
    "BUIDCO_NAL": {
        "id": "AGY-BUIDCO-NAL",
        "name": "Bihar Urban Infrastructure Development Corp (BUIDCO)",
        "type": "State Urban Public Enterprise",
        "district": "Nalanda",
        "aliases": [
            "buidco", "buidco nalanda", "bihar urban infra dev corp",
            "buidco bihar sharif", "b.u.i.d.c.o"
        ]
    },
    "ZP_NAL": {
        "id": "AGY-ZP-NAL",
        "name": "Zilla Parishad (District Board), Nalanda",
        "type": "Panchayati Raj Institution",
        "district": "Nalanda",
        "aliases": [
            "zilla parishad nalanda", "zila parishad", "district board nalanda",
            "zp bihar sharif", "zila parishad bihar sharif"
        ]
    },
    "PHED_NAL": {
        "id": "AGY-PHED-NAL",
        "name": "Public Health Engineering Department (PHED), Nalanda",
        "type": "Public Utilities Department",
        "district": "Nalanda",
        "aliases": [
            "phed nalanda", "public health engineering division",
            "p.h.e.d. bihar sharif", "phed division nalanda"
        ]
    },
    "BMSICL_NAL": {
        "id": "AGY-BMSICL-NAL",
        "name": "Bihar Medical Services & Infrastructure Corp Ltd (BMSICL)",
        "type": "Health Infrastructure Enterprise",
        "district": "Nalanda",
        "aliases": [
            "bmsicl", "bihar medical services corp", "bmsicl patna/nalanda",
            "b.m.s.i.c.l"
        ]
    },
    "BRPNNL_NAL": {
        "id": "AGY-BRPNNL-NAL",
        "name": "Bihar Rajya Pul Nirman Nigam Ltd (BRPNNL)",
        "type": "Bridges & Highways Corp",
        "district": "Nalanda",
        "aliases": [
            "brpnnl", "pul nirman nigam nalanda", "bihar rajya pul nirman",
            "brpnnl works div bihar sharif"
        ]
    },
    "BREDA_NAL": {
        "id": "AGY-BREDA-NAL",
        "name": "Bihar Renewable Energy Development Agency (BREDA)",
        "type": "Renewable Energy Authority",
        "district": "Nalanda",
        "aliases": [
            "breda", "bihar renewable energy dev agency", "breda patna/nalanda"
        ]
    },
    "LOCAL_SAMITI": {
        "id": "AGY-NNS-NAL",
        "name": "Nalanda Nirman Samiti (Registered Local Society)",
        "type": "Local Society / Executing Body",
        "district": "Nalanda",
        "aliases": [
            "nalanda nirman samiti", "nns nalanda", "samiti bihar sharif",
            "m/s nalanda nirman", "nns society"
        ]
    }
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def resolve_agency(raw_name: str) -> Tuple[str, str, str]:
    """
    Given a noisy agency string, returns canonical (agency_id, canonical_name, agency_type).
    """
    normalized = normalize_text(raw_name)
    
    for key, info in AGENCY_CANONICAL_MAP.items():
        if normalized == normalize_text(info["name"]):
            return info["id"], info["name"], info["type"]
        for alias in info["aliases"]:
            if alias in normalized or normalized in alias:
                return info["id"], info["name"], info["type"]
                
    # Fallback to general RWD Nalanda if unresolved
    info = AGENCY_CANONICAL_MAP["RWD_NAL"]
    return info["id"], info["name"], info["type"]
