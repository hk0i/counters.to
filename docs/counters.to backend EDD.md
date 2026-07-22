# **Engineering Design Document (EDD)**

## **Project: Counters.to Data Pipeline & Static REST API Core (V1)**

**Status:** Approved  
**Architecture:** Jamstack Static API / Flat-File Relational Graph  
**License:** This document is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — separate from the code license(s) noted in the root `README.md`.

## **1\. Objective & Scope**

This specification defines the strict flat-file content ingestion architecture, cross-validation compiler engine, and static REST-compliant endpoint generator for the counters.to data layer. It provides zero-overhead data compilation for an offline-first PWA, optimized for a seamless transition to a live dynamic backend in V2.

## **2\. Ingestion & File Architecture**

The source of truth consists of human-readable, AI-generatable flat text files tracked completely via Git version control.

### **Directory Structure Blueprint**

```
packages/counters-data-core/
├── src/
│   ├── compile.ts                 # Main execution pipeline script
│   └── data/                      # Source of truth directory
│       ├── registry.yaml          # Master taxonomy dictionary constraints
│       └── heroes/                # Collection of flat markdown profiles
│           ├── sigma.md
│           ├── reinhardt.md
│           └── zarya.md
```

### **2.1 The Master Taxonomy Contract (registry.yaml)**

Every string literal utilized inside character profiles _must_ be registered here. Any unlisted property must fail compilation immediately.

```
roles:
  - tank
  - damage
  - support

damageTypes:
  - hitscan
  - projectile
  - beam
  - melee
  - shotgun

mechanics:
  - barrier
  - deployable
  - projectile-eating
  - crowd-control
  - cleanse
  - mobility-tool

strategy:
  archetypes:
    - dive
    - brawl
    - poke
    - backline
  tags:
    - anti-dive
    - flanker
    - shield-breaker
    - bodyguard
    - zone-control
```

### **2.2 The Source Content Contract (/data/heroes/\[heroId\].md)**

Every character profile must use standard Front Matter (gray-matter) format for type-checked values, followed by standard Markdown content blocks.

```
---
id: sigma
name: Sigma
role: tank
damageTypes:
  - projectile
mechanics:
  - barrier
  - deployable
  - projectile-eating
  - crowd-control
strategy:
  archetype: poke
  tags:
    - zone-control
weakTo:
  - beam
  - melee
strongTo:
  - projectile
---

## Core Playbook
Sigma excels at controlling off-angles and absorbing heavy kinetic fire.

## Tactical Caveats
His defensive kinetic kit relies heavily on capturing physical objects moving through the air, making energy streams lethal.
```

## **3\. Data Transformation & Validation Pipeline (compile.ts)**

When executed, the TypeScript compiler script must perform three distinct operational phases:

### **Phase 1: Structural Integrity Verification**

- Parse Front Matter configuration block using gray-matter.
- Validate role, damageTypes, mechanics, strategy.archetype, and strategy.tags string arrays explicitly against the compiled hash sets generated from registry.yaml.
- Verify cross-reference keys (weakTo, strongTo) only contain items registered in the global damageTypes or mechanics dictionaries.
- **Action on Failure:** Emit a verbose error terminal log (\[TYPO ERROR\] Unknown tag \[x\] in \[hero\].md) and execute process.exit(1) to kill any automated CI/CD builds immediately.

### **Phase 2: Relational Graph Assembly (The "Join" Phase)**

The engine must automatically compute relational advantages in memory across the entire collection to save client computing overhead:

- **Threat Mapping (threats):** For the current hero, iterate through all other heroes. If an enemy possesses a damageType or mechanic listed in the current hero's weakTo array, append that enemy into the current hero's output threats collection.
- **Advantage Mapping (advantages):** If an enemy possesses a trait listed in the current hero's strongTo array, append that enemy into the current hero's output advantages collection.

### **Phase 3: Content Transformation**

- Compile Markdown body prose chunks into highly compressed, safe HTML string payloads utilizing marked.

## **4\. Output REST API Directory & Schema Contracts**

To enable a seamless future drop-in migration to a live dynamic backend, files must be output into nested folders using index.json naming conventions to emulate REST pathways.

### **Target Distribution Location**

```
packages/counters-web/public/api/v1/
├── registry/
│   └── index.json                # Global schema layout
├── heroes/
│   ├── index.json                # Lean collection endpoint
│   ├── sigma/
│   │   └── index.json            # Deep individual resource chunk
│   └── reinhardt/
│       └── index.json
```

### **4.1 Endpoint: GET /api/v1/heroes**

**Physical File Path:** public/api/v1/heroes/index.json  
**Purpose:** High-performance, low-bandwidth layout array containing metadata for global searches, card renders, and frontend tag-cloud calculations. No large HTML text fields allowed here.

```json
{
  "data": [
    {
      "id": "sigma",
      "name": "Sigma",
      "role": "tank",
      "damageTypes": ["projectile"],
      "mechanics": [
        "barrier",
        "deployable",
        "projectile-eating",
        "crowd-control"
      ],
      "strategy": {
        "archetype": "poke",
        "tags": ["zone-control"]
      }
    }
  ]
}
```

### **4.2 Endpoint: GET /api/v1/heroes/:id**

**Physical File Path:** public/api/v1/heroes/\[id\]/index.json  
**Purpose:** Complete deep data compilation delivered instantly when a user views a specific character profile.

```json
{
  "data": {
    "id": "sigma",
    "name": "Sigma",
    "role": "tank",
    "damageTypes": ["projectile"],
    "mechanics": [
      "barrier",
      "deployable",
      "projectile-eating",
      "crowd-control"
    ],
    "strategy": {
      "archetype": "poke",
      "tags": ["zone-control"]
    },
    "weakTo": ["beam", "melee"],
    "strongTo": ["projectile"],
    "threats": [
      {
        "heroId": "zarya",
        "heroName": "Zarya",
        "matchedTraits": ["beam"]
      }
    ],
    "advantages": [
      {
        "heroId": "bastion",
        "heroName": "Bastion",
        "matchedTraits": ["projectile"]
      }
    ],
    "htmlContent": "<h2>Core Playbook</h2>\n<p>Sigma excels at controlling off-angles...</p>"
  }
}
```
