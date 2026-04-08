# Rollout: Group Cycling Coordination App

## Project Overview

**Rollout** is a mobile-first web application designed for organizing group cycling rides. The platform enables ride leaders to post routes and share links, allowing cyclists to join using only their name — no authentication required.

The project demonstrates a thoughtful approach to reducing friction in group coordination.

## Core Features

- **Frictionless guest participation** via shareable links requiring only a name
- **Leader management dashboard** for ride oversight and participant rosters
- **Integrated tipping functionality** through Stripe Payment Links
- **Persistent data storage** via Supabase backend
- **Google OAuth & email/password authentication** for ride leaders

## Technical Architecture

- **Frontend**: React with Vite bundler and TypeScript
- **Backend**: Supabase (PostgreSQL, authentication, Row-Level Security)
- **UI Elements**: Lucide Icons, JetBrains Mono + DM Sans typography
- **Payments**: Stripe integration
- **Hosting**: Vercel

## Design Philosophy

Three key decisions shaped the implementation:

1. **Vite selection** prioritizes development velocity over Next.js complexity
2. **Hybrid authentication model** — leaders authenticate while guests remain anonymous, eliminating signup barriers
3. **Stripe Payment Links** provide payment functionality without SDK overhead

## Getting Started

```bash
npm install
cp .env.example .env
# Add your Supabase URL and anon key to .env
npm run dev
```

## Current Scope

The application has documented limitations: all rides display publicly on the dashboard, and participant roster updates require manual page refresh due to unrealized Supabase Realtime functionality.
