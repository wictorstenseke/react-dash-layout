import { Link } from "@tanstack/react-router";

export default function FooterSection() {
  return (
    <footer className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            to="/"
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            Trackboard
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trackboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
