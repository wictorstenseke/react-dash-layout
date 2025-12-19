import { Link } from "@tanstack/react-router";

import { CommandPalette } from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";

export function Landing() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <CommandPalette open={open} onOpenChange={setOpen} landingMode />
      <div className="flex flex-col items-center justify-center space-y-12 pb-12 md:pb-24">
        {/* Hero Section */}
        <div className="relative flex w-full min-h-[60vh] items-center justify-center bg-background">
          <DotPattern className="mask-[linear-gradient(to_bottom_right,white,transparent,white)]" />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center space-y-6 px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Trackboard
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Organize your Spotify tracks into themed groups with our
              customizable drag-and-drop interface. Find the right song at the
              right moment with seamless Spotify integration.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <RainbowButton size="lg" asChild>
                <Link to="/app">Get Started</Link>
              </RainbowButton>
              <Button
                size="lg"
                variant="outline"
                render={
                  <a
                    href="https://github.com/wictorstenseke/react-dash-layout"
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
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl">
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
                Organize your tracks into custom themed groups. Create
                categories for moods, activities, or any theme that fits your
                listening style.
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
                Resize any group from any corner or edge. Customize the layout
                to prioritize your most important themes.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-2 font-semibold">Sortable Tracks</h3>
              <p className="text-sm text-muted-foreground">
                Reorder tracks within each group using drag-and-drop. Arrange
                your playlists exactly how you want them.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-2 font-semibold">Playback Control</h3>
              <p className="text-sm text-muted-foreground">
                Play, pause, and control your Spotify tracks directly from
                Trackboard. Smooth fade in/out transitions for a better
                listening experience.
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
                  Click and drag the handle icon in the top-right of any group
                  to reposition it on the grid.
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
                  Hover over any group edge or corner to see resize handles,
                  then drag to adjust the size.
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
                  Drag any track within a group to reorder them. Changes are
                  saved automatically so you can find what you need quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
