import Link from 'next/link';
import { Button } from '@sideline/ui';
import {
  Calendar,
  MessageSquare,
  Trophy,
  Video,
  Users,
  BarChart3,
  ChevronRight,
  Play,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="text-xl font-bold">Sideline</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#sports" className="text-sm font-medium hover:text-primary">
              Sports
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Free for coaches, always
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Bring everyone closer to the{' '}
            <span className="text-primary">game</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            The modern way to manage your youth sports team. Live streaming, scorekeeping,
            scheduling, and communication — all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create Your Team <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Set up in under 5 minutes.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Everything your team needs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Built by coaches, for coaches. We understand what matters most to youth sports teams.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Video className="h-6 w-6" />}
              title="Live Streaming"
              description="Stream games to family anywhere. Auto score overlay keeps everyone in the loop."
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="Scorekeeping"
              description="Easy-to-use scorekeeping for baseball, softball, basketball, soccer & more."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Scheduling"
              description="Games, practices, and events with RSVP tracking and calendar sync."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Team Messaging"
              description="Keep everyone connected with announcements, group chat, and direct messages."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Roster Management"
              description="Player profiles, jersey numbers, positions, and parent contact info."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Statistics"
              description="Track 100+ stats per sport. Season aggregations and player comparisons."
            />
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section id="sports" className="container py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Built for your sport
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Sport-specific scorekeeping and statistics for the games you play.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {['Baseball', 'Softball', 'Basketball', 'Soccer', 'Football', 'Volleyball', 'Lacrosse', 'Hockey'].map((sport) => (
              <div
                key={sport}
                className="rounded-lg border bg-card px-6 py-3 text-sm font-medium shadow-sm"
              >
                {sport}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            + 7 more sports coming soon
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Simple, fair pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            No surprises. No hidden fees. Coaches are always free.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <PricingCard
              name="Free"
              price="$0"
              description="For coaches getting started"
              features={[
                'Unlimited teams',
                'Basic scorekeeping',
                'Team messaging',
                'Scheduling & RSVPs',
                'Photo sharing',
              ]}
            />
            <PricingCard
              name="Pro"
              price="$39"
              period="/year"
              description="For serious teams"
              featured
              features={[
                'Everything in Free',
                'Live streaming',
                'Video archive',
                'Advanced statistics',
                'AI highlights',
                '50GB storage',
              ]}
            />
            <PricingCard
              name="Team"
              price="$79"
              period="/year"
              description="For clubs & organizations"
              features={[
                'Everything in Pro',
                'Multiple admins',
                'Custom branding',
                'API access',
                'Analytics exports',
                '200GB storage',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of teams already using Sideline.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">Create Your Team</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                S
              </div>
              <span className="text-lg font-bold">Sideline</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with love for youth sports communities everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  featured,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-6 shadow-sm ${
        featured ? 'border-primary ring-2 ring-primary' : ''
      }`}
    >
      {featured && (
        <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-2">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Button className="mt-6 w-full" variant={featured ? 'default' : 'outline'}>
        Get Started
      </Button>
    </div>
  );
}
