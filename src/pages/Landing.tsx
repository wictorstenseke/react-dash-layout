import { Link } from "@tanstack/react-router";

import { CommandPalette } from "@/components/CommandPalette";
import Features from "@/components/features-4";
import FooterSection from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
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
                <Link to="/login" search={{ mode: "login" }}>
                  Sign in
                </Link>
              </RainbowButton>
              <Button
                size="lg"
                variant="outline"
                render={<Link to="/login" search={{ mode: "signup" }} />}
                nativeButton={false}
              >
                Create account
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <Features />

        {/* GitHub Section */}
        <section className="pt-12 pb-12 md:pt-16 md:pb-16">
          <div className="mx-auto max-w-4xl px-6">
            <ItemGroup>
              <Item variant="outline">
                <ItemHeader>
                  <ItemContent>
                    <ItemTitle>Open Source</ItemTitle>
                    <ItemDescription>
                      Trackboard is open source and available on GitHub. Check
                      out the code, contribute, or report issues.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      render={
                        <a
                          href="https://github.com/wictorstenseke/react-dash-layout"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      nativeButton={false}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}github-mark.svg`}
                        alt=""
                        className="h-4 w-4 dark:hidden"
                      />
                      <img
                        src={`${import.meta.env.BASE_URL}github-mark-white.svg`}
                        alt=""
                        className="hidden h-4 w-4 dark:block"
                      />
                      <span>View on GitHub</span>
                    </Button>
                  </ItemActions>
                </ItemHeader>
              </Item>
            </ItemGroup>
          </div>
        </section>
      </div>
      <FooterSection />
    </>
  );
}
