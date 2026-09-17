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

def resolve_agency(raw_name: str, district: str = "Nalanda", state: str = "Bihar") -> Tuple[str, str, str]:
    """
    Given an agency string, returns canonical (agency_id, canonical_name, agency_type)
    tailored to the constituency district and state.
    """
    normalized = normalize_text(raw_name)
    
    for key, info in AGENCY_CANONICAL_MAP.items():
        if normalized == normalize_text(info["name"]):
            return info["id"], info["name"], info["type"]
        for alias in info["aliases"]:
            if alias in normalized or normalized in alias:
                return info["id"], info["name"], info["type"]
                
    # Dynamic constituency-specific agency resolution
    d_clean = district.replace('_', ' ').strip().title() if district else "District"
    raw_title = raw_name.strip()
    if not raw_title:
        raw_title = f"Public Works Division, {d_clean}"
        
    low = normalized
    if "municipal" in low or "corporation" in low or "nigam" in low or "bbmp" in low or "mcd" in low or "kmc" in low:
        agency_type = "Municipal Corporation / Urban Local Body"
    elif "zilla" in low or "panchayat" in low or "board" in low:
        agency_type = "Panchayati Raj Institution"
    elif "housing" in low or "buidco" in low or "dda" in low or "vda" in low:
        agency_type = "State Housing & Urban Enterprise"
    elif "health" in low or "medical" in low or "bmsicl" in low or "phed" in low or "water" in low:
        agency_type = "Public Health & Utilities Department"
    elif "renewable" in low or "energy" in low or "breda" in low:
        agency_type = "State Renewable Energy Authority"
    else:
        agency_type = "State Engineering Department"

    clean_words = [w for w in re.findall(r'[a-zA-Z0-9]+', raw_title) if len(w) > 1]
    abbr = "".join([w[0].upper() for w in clean_words[:4]]) if clean_words else "AGY"
    dist_slug = re.sub(r'[^a-zA-Z0-9]+', '', d_clean)[:3].upper()
    agency_id = f"AGY-{abbr}-{dist_slug}"

    return agency_id, raw_title, agency_type
