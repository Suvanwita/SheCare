# SheCare - Women's Health, Wellness & Self-Care Platform

Welcome to **SheCare**, an intelligent, premium full-stack platform designed to empower women's health, wellness, and self-care journeys.

## Project Structure

This repository is structured as a multi-component monorepo:

```text
shecare/
├── frontend/    # Next.js 14+ TypeScript Web Application (Fully Configured)
├── backend/     # Python or Node.js Backend API Service (Placeholder - Coming Soon)
└── ml-model/    # ML/AI Models for Health Recommendations (Placeholder - Coming Soon)
```

## Getting Started

### Frontend Web App

The frontend is fully set up using Next.js 14 (App Router), TypeScript, Tailwind CSS, and next-themes for dark/light capability.

To run the frontend:
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (already installed during setup):
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Envisioned
- **Cycle & Period Tracker**: Keep log of phases, ovulation days, and wellness routines.
- **Interactive Wellness Analytics**: Beautiful charts analyzing water intake, sleep patterns, stress, and physical activities.
- **Symptom Tracker**: Structured Daily Symptom Logger validated using Zod schemas.
- **AI Symptom Consultation Assistant**: Personalized smart insights based on symptom logs and historical patterns.
