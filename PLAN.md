# Sideline - Youth Sports Team Management Platform

> **"Bring everyone closer to the game"**

An open, reliable, and affordable alternative to GameChanger for youth sports teams.

---

## Why "Sideline"?

The sideline is where coaches strategize, parents cheer, and teammates rally. It's the heartbeat of youth sports - where everyone who can't be on the field still feels part of the action. **Sideline** brings that experience to everyone, everywhere.

---

## Market Opportunity

### GameChanger's Weaknesses (Our Opportunities)
- **Poor Customer Service**: 1.6/5 rating, only 4% resolution rate
- **Unreliable Streaming**: Videos drop 1/3 of the time, games stuck on "live"
- **Painful Migrations**: New app broke features, lost user data
- **Price Hikes**: Premium jumped 50% to $90/year
- **AWS Single Point of Failure**: Major outages when AWS goes down
- **Owned by DICK'S Sporting Goods**: Corporate priorities over user needs

### Our Differentiators
1. **Reliability First**: Multi-cloud architecture, offline-capable
2. **Transparent Pricing**: Simple, fair, no surprise increases
3. **Open Data**: Export everything, own your data
4. **Community-Driven**: Open roadmap, user feedback shapes features
5. **Modern Tech Stack**: Fast, responsive, works everywhere

---

## Core Features (MVP)

### Phase 1: Foundation (Core Platform)

#### 1. Team Management
- [ ] Team creation and setup
- [ ] Player roster management with profiles
- [ ] Coach/admin role management
- [ ] Parent/guardian linking to players
- [ ] Team invite system (links, QR codes)

#### 2. Scheduling & Events
- [ ] Game and practice scheduling
- [ ] RSVP system with notifications
- [ ] Calendar sync (Google, Apple, Outlook)
- [ ] Location integration with maps
- [ ] Weather alerts for outdoor events

#### 3. Communication Hub
- [ ] Team-wide announcements
- [ ] Group messaging (whole team, coaches only, parents only)
- [ ] Direct messaging
- [ ] Push notifications
- [ ] Email digests

#### 4. Basic Scorekeeping
- [ ] Live score updates
- [ ] Game timeline/play-by-play
- [ ] Final score recording
- [ ] Win/loss record tracking

### Phase 2: Stats & Media

#### 5. Statistics Engine
- [ ] Sport-specific stat templates
- [ ] Baseball/Softball: Full box scores, batting avg, ERA, pitch counts
- [ ] Basketball: Points, rebounds, assists, shooting %
- [ ] Soccer: Goals, assists, saves, shots
- [ ] Custom stat definitions
- [ ] Season aggregations and trends
- [ ] Player comparison tools

#### 6. Media & Streaming
- [ ] Photo sharing and albums
- [ ] Video upload and storage
- [ ] Live streaming (RTMP-based)
- [ ] Automatic highlight clipping (AI-powered)
- [ ] Video archive with search
- [ ] Score overlay on streams

### Phase 3: Advanced Features

#### 7. AI-Powered Features
- [ ] AutoTrack: AI camera tracking for streaming
- [ ] Play recognition and tagging
- [ ] Performance insights and recommendations
- [ ] Injury risk indicators
- [ ] Practice drill suggestions

#### 8. League & Tournament Support
- [ ] Multi-team bracket management
- [ ] League standings
- [ ] Cross-team scheduling
- [ ] Referee/umpire assignments
- [ ] Tournament mode

#### 9. Analytics Dashboard
- [ ] Team performance trends
- [ ] Individual player development tracking
- [ ] Comparison to league averages
- [ ] Exportable reports (PDF, CSV)
- [ ] Coach's game prep tools

---

## Technical Architecture

### Tech Stack

```
Frontend:
├── Web App: Next.js 14+ (React, TypeScript)
├── Mobile: React Native (iOS + Android)
├── State: Zustand + React Query
├── UI: Tailwind CSS + shadcn/ui
└── Real-time: Socket.io

Backend:
├── API: Node.js + Fastify (or Hono)
├── Database: PostgreSQL (primary) + Redis (cache)
├── Auth: Better-Auth or Lucia
├── File Storage: S3-compatible (Cloudflare R2)
├── Video: Mux or Cloudflare Stream
└── Search: Meilisearch

Infrastructure:
├── Hosting: Vercel (web) + Fly.io (API)
├── Database: Neon or Supabase
├── CDN: Cloudflare
├── Monitoring: Sentry + Axiom
└── CI/CD: GitHub Actions
```

### Key Architecture Decisions

1. **Offline-First Mobile**: Local SQLite with sync
2. **Multi-Region**: Deploy close to users for low latency
3. **Event-Sourced Stats**: Never lose data, full audit trail
4. **Edge Computing**: Score updates via edge functions
5. **Progressive Web App**: Web app installable on any device

### Data Model (Core Entities)

```
Organizations (leagues, clubs)
├── Teams
│   ├── Seasons
│   │   ├── Games
│   │   │   ├── Stats
│   │   │   ├── Media
│   │   │   └── Timeline Events
│   │   └── Practices
│   ├── Roster (Players)
│   └── Staff (Coaches, Managers)
├── Members (Users)
│   ├── Roles (per team)
│   └── Subscriptions
└── Invitations
```

---

## Sports Supported (Prioritized)

### Tier 1 (Launch)
1. **Baseball** - Largest scorekeeping market
2. **Softball** - Same engine as baseball
3. **Basketball** - High demand, AutoTrack opportunity
4. **Soccer** - Largest youth sport globally

### Tier 2 (Post-Launch)
5. Football
6. Volleyball
7. Lacrosse
8. Hockey (Ice & Field)

### Tier 3 (Community Requested)
9. Swimming & Diving
10. Track & Field
11. Wrestling
12. Tennis
13. Golf
14. Water Polo
15. Rugby

---

## Business Model

### Free Tier (Always Free for Coaches)
- Unlimited teams
- Basic scorekeeping
- Team messaging
- Scheduling with RSVPs
- Photo sharing (limited storage)
- Basic stats

### Pro Tier ($4.99/month or $39/year)
- Live streaming
- Full video archive
- Advanced statistics
- AI highlights
- Priority support
- 50GB media storage

### Team Tier ($9.99/month or $79/year)
- Everything in Pro
- Multiple admin accounts
- Custom team branding
- API access
- Analytics exports
- 200GB media storage

### League Tier (Custom Pricing)
- Multi-team management
- Tournament brackets
- League-wide stats
- White-label options
- Dedicated support
- Unlimited storage

---

## Project Structure

```
sideline/
├── apps/
│   ├── web/                 # Next.js web application
│   ├── mobile/              # React Native app
│   └── api/                 # Backend API server
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── db/                  # Database schema & migrations
│   ├── stats-engine/        # Sport-specific stats logic
│   ├── shared/              # Shared types & utilities
│   └── config/              # Shared configs (eslint, tsconfig)
├── docs/                    # Documentation
├── scripts/                 # Build & deploy scripts
└── docker/                  # Local development containers
```

---

## Development Phases

### Phase 1: Foundation
- Project setup (monorepo, CI/CD)
- Authentication system
- Team & roster management
- Basic scheduling
- Team messaging

### Phase 2: Core Experience
- Scorekeeping engine
- Live score updates
- Basic statistics
- Mobile app (iOS + Android)
- Push notifications

### Phase 3: Media & Streaming
- Photo albums
- Video upload
- Live streaming infrastructure
- Video archive
- Score overlay

### Phase 4: Intelligence
- AI highlight detection
- AutoTrack camera system
- Performance analytics
- Player development insights

### Phase 5: Scale
- League management
- Tournament brackets
- API for third-party integrations
- White-label solutions

---

## Success Metrics

### User Acquisition
- Teams registered
- Monthly active users
- Games scored per week
- Streams watched

### Engagement
- Messages sent per team
- RSVP response rate
- Media uploads
- Return user rate

### Revenue
- Conversion rate (free to paid)
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)
- Churn rate

### Quality
- App store ratings (target: 4.5+)
- Customer support resolution time
- Uptime (target: 99.9%)
- Stream reliability (target: 99%+)

---

## Competitive Advantages

| Feature | GameChanger | Sideline |
|---------|-------------|----------|
| Pricing | $90/year (increasing) | $39/year (price-locked) |
| Customer Service | 1.6/5 rating | Community-first support |
| Data Export | Limited | Full export, open formats |
| Reliability | AWS-dependent | Multi-cloud, offline-capable |
| Open Roadmap | Closed | Public, community-driven |
| Free Tier | Limited | Generous, coaches always free |

---

## Next Steps

1. **Set up monorepo** with Turborepo
2. **Initialize Next.js** web app with authentication
3. **Create database schema** for core entities
4. **Build team management** features
5. **Implement scheduling** with calendar sync
6. **Add messaging** system
7. **Launch beta** for feedback

---

*Let's bring everyone closer to the game.*
