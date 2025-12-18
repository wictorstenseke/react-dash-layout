import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 md:py-24">
      {/* Hero Section */}
      <div className="flex max-w-4xl flex-col items-center space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Trackboard
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Organize your Spotify tracks into themed groups with our customizable
          drag-and-drop interface. Find the right song at the right moment with
          seamless Spotify integration.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" render={<Link to="/app" />} nativeButton={false}>
            Get Started
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
      <div className="w-full max-w-6xl pt-8">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Key Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Spotify Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect to Spotify and import your playlists, search for tracks,
              and play music directly from your browser. Full Web Playback SDK
              support included.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Themed Organization</h3>
            <p className="text-sm text-muted-foreground">
              Organize your tracks into custom themed groups. Create categories
              for moods, activities, or any theme that fits your listening
              style.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Drag & Drop Layout</h3>
            <p className="text-sm text-muted-foreground">
              Arrange themed groups anywhere on a flexible grid. Drag handles
              make repositioning intuitive and smooth.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Resizable Groups</h3>
            <p className="text-sm text-muted-foreground">
              Resize any group from any corner or edge. Customize the layout to
              prioritize your most important themes.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Sortable Tracks</h3>
            <p className="text-sm text-muted-foreground">
              Reorder tracks within each group using drag-and-drop. Arrange your
              playlists exactly how you want them.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 font-semibold">Playback Control</h3>
            <p className="text-sm text-muted-foreground">
              Play, pause, and control your Spotify tracks directly from
              Trackboard. Smooth fade in/out transitions for a better listening
              experience.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-4xl pt-8">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          How It Works
        </h2>
        <div className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              1
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Drag Groups</h3>
              <p className="text-sm text-muted-foreground">
                Click and drag the handle icon in the top-right of any group to
                reposition it on the grid.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              2
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Resize Groups</h3>
              <p className="text-sm text-muted-foreground">
                Hover over any group edge or corner to see resize handles, then
                drag to adjust the size.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              3
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Sort Tracks</h3>
              <p className="text-sm text-muted-foreground">
                Drag any track within a group to reorder them. Changes are saved
                automatically so you can find what you need quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
