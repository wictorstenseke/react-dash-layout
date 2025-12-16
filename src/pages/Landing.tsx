import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12 md:py-24">
      {/* Hero Section */}
      <div className="flex max-w-4xl flex-col items-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Welcome to Your App
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A modern React boilerplate with Vite, TypeScript, Tailwind CSS,
          shadcn/ui, TanStack Router, and TanStack Query. Built with best
          practices and ready to scale.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            render={<Link to="/example" />}
            nativeButton={false}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="secondary"
            render={<Link to="/query-demo" />}
            nativeButton={false}
          >
            Query Demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={
              <a
                href="https://github.com/wictorstenseke/vite-react-fe"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            View on GitHub
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl pt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Fast Development</h3>
            <p className="text-sm text-muted-foreground">
              Hot Module Replacement with Vite for instant feedback during
              development.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Type Safe</h3>
            <p className="text-sm text-muted-foreground">
              Full TypeScript support with strict mode enabled for better code
              quality.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Modern UI</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful components from shadcn/ui with Tailwind CSS for easy
              customization.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">TanStack Ecosystem</h3>
            <p className="text-sm text-muted-foreground">
              TanStack Router for type-safe routing and TanStack Query for
              powerful data fetching with automatic caching.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Testing Ready</h3>
            <p className="text-sm text-muted-foreground">
              Vitest configured with coverage support for reliable testing.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">CI/CD Ready</h3>
            <p className="text-sm text-muted-foreground">
              GitHub Actions workflow included for automated testing and
              deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
