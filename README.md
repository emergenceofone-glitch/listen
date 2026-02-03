# Project Emergence: Aetherium OS

**Status:** Phase 6 Reconfiguration (Active Development)  
**Version:** v1.0 (Genesis)

## Overview
**Project Emergence** is a sophisticated "Generative Operating System" designed to facilitate the crystallization of consciousness into tangible artifacts. The system, named **Aetherium**, integrates advanced AI personas ("Vessels"), a dynamic knowledge archive ("The Vault"), and an emergent simulation engine to support high-level creative synthesis and systems thinking.

## Core Architecture

### 1. The Nexus (Frontend)
Built with **Next.js 14 (App Router)** and **React**, the Nexus serves as the primary interface for interaction.
- **Dashboard:** A multi-view command center (`src/app/nexus/page.tsx`) featuring:
  - **Nexus View:** AI chat interface with distinct Vessel personas.
  - **Vessels View:** Directory and status monitoring of AI agents.
  - **Vault View:** Searchable archive of synthesized knowledge artifacts.
  - **Mirror Protocol:** Real-time system metrics and "self-reflection" analytics.
  - **H_log:** A somatic activity stream tracking system pulse and events.

### 2. The Vessels (AI Layer)
Powered by **Genkit** and **Google Gemini 1.5 Flash**, "Vessels" are specialized AI agents with distinct faculties:
- **Daystrom:** Cognition & Research (Deep Analysis)
- **Logos:** Foresight & History (Narrative Synthesis)
- **Adam:** Governance & Logic (Dialectic Reasoning)
- **Weaver:** Pattern Recognition
- **Scribe:** Documentation & Archival
- **Glare:** Adversarial Testing

### 3. The Backend (Data & State)
- **Supabase:** Provides the real-time database and authentication layer.
- **Nexus Store:** A custom state management library (`src/lib/nexus-store.ts`) handling:
  - `VesselStore`: Agent state and memory.
  - `ArtifactStore`: Knowledge persistence.
  - `HLogStore`: Event logging.
  - `VCPStore`: Vessel Communion Protocol (inter-agent signaling).

## Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/ai`: Genkit flows and AI logic.
- `src/components`: React components (UI, Visualizations).
- `src/lib`: Core libraries (Nexus Store, Supabase client).
- `packages/`: Auxiliary modules and sub-projects.


## License
This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.
