# SheCare Frontend Web Application

A beautiful, premium, and feature-rich frontend web application for the **SheCare** platform. Designed with state-of-the-art aesthetics, responsiveness, smooth micro-animations, and full accessibility.

## Tech Stack

- **Core Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **Validation Schemas**: [Zod](https://zod.dev/)
- **Dark Mode Support**: [next-themes](https://github.com/pacocoursey/next-themes)

## Folder Structure

Our frontend codebase uses the `src/` directory with custom folder segmentation to ensure modularity and scalability:

```text
frontend/
├── src/
│   ├── app/                # Next.js pages, routing, layouts, and global styles
│   ├── components/         # Reusable react components
│   │   ├── common/         # Generic common elements (e.g. notifications, stats)
│   │   ├── layout/         # Shell structures (Sidebar, Header, Main Wrapper)
│   │   ├── dashboard/      # Domain-specific components for the dashboard
│   │   └── ui/             # Core atomic design primitives (Buttons, Cards, Inputs)
│   ├── constants/          # Static configurations, menu items, routes
│   ├── hooks/              # Custom react hooks (e.g. storage, state)
│   ├── lib/                # Utility configurations (e.g. className mergers)
│   ├── types/              # TypeScript declarations and interfaces
│   └── data/               # Static/mock data definitions
├── public/                 # Static assets (images, SVGs, manifest)
├── .env.example            # Environment configuration template
└── README.md               # Frontend developer guide
```

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and npm installed.

### Installation

1. Navigate to this directory:
   ```bash
   cd frontend
   ```
2. Install the pre-configured dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

## Key Features Implemented

1. **Brand Aesthetic**: Harmonious design utilizing a cohesive, dark/light theme, micro-animations, glassmorphism, and a modern layout.
2. **Menstrual Phase Visualizer**: Visual indicator of cycle status, days remaining, and logging functionality.
3. **Interactive Charts**: Interactive vitals tracking (sleep score, stress levels, hydration tracker) built using Recharts.
4. **Validated Symptom Logger**: A comprehensive React Hook Form + Zod daily symptom tracker that provides instant field validation and simulated storage.
5. **Dynamic Theme Switching**: Smooth light-to-dark transition using next-themes without visual flashes.
