import { useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/AuthProvider";
import { signOutUser } from "@/features/auth/authService";

type ProfileMenuProps = {
  className?: string;
};

// Simple MD5 implementation for Gravatar hashing
// Adapted for local use to avoid extra dependencies
function md5(input: string): string {
  const utf8 = new TextEncoder().encode(input);

  const toWordArray = (bytes: Uint8Array): number[] => {
    const words: number[] = [];
    for (let i = 0; i < bytes.length; i += 4) {
      words[i >> 2] =
        (bytes[i] ?? 0) |
        ((bytes[i + 1] ?? 0) << 8) |
        ((bytes[i + 2] ?? 0) << 16) |
        ((bytes[i + 3] ?? 0) << 24);
    }
    return words;
  };

  const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));

  const add = (x: number, y: number) => {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >>> 16) + (y >>> 16) + (lsw >>> 16);
    return (msw << 16) | (lsw & 0xffff);
  };

  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);

  const FF = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => add(rotateLeft(add(add(a, F(b, c, d)), add(x, ac)), s), b);
  const GG = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => add(rotateLeft(add(add(a, G(b, c, d)), add(x, ac)), s), b);
  const HH = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => add(rotateLeft(add(add(a, H(b, c, d)), add(x, ac)), s), b);
  const II = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => add(rotateLeft(add(add(a, I(b, c, d)), add(x, ac)), s), b);

  const bytes = new Uint8Array(Math.ceil((utf8.length + 9) / 64) * 64).fill(0);
  bytes.set(utf8);
  bytes[utf8.length] = 0x80;

  const bitLen = utf8.length * 8;
  for (let i = 0; i < 8; i++) {
    bytes[bytes.length - 8 + i] = (bitLen >>> (i * 8)) & 0xff;
  }

  const x = toWordArray(bytes);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < x.length; i += 16) {
    const [olda, oldb, oldc, oldd] = [a, b, c, d];

    a = FF(a, b, c, d, x[i], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[i + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[i + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[i + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[i + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[i + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[i + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[i + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[i + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[i + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[i + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[i + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[i + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[i + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[i + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[i + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, x[i + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[i + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[i + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[i], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[i + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[i + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[i + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[i + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[i + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[i + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[i + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[i + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[i + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[i + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[i + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[i + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[i + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[i + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[i + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[i + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[i + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[i + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[i], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[i + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[i + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[i + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[i + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[i + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[i + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, x[i], 6, 0xf4292244);
    d = II(d, a, b, c, x[i + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[i + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[i + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[i + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[i + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[i + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[i + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[i + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[i + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[i + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[i + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[i + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[i + 9], 21, 0xeb86d391);

    a = add(a, olda);
    b = add(b, oldb);
    c = add(c, oldc);
    d = add(d, oldd);
  }

  const toHex = (n: number) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += ("0" + ((n >>> (i * 8)) & 0xff).toString(16)).slice(-2);
    }
    return s;
  };

  return (toHex(a) + toHex(b) + toHex(c) + toHex(d)).toLowerCase();
}

function getInitials(from?: string | null): string {
  if (!from) return "?";

  const base = from.includes("@") ? from.split("@")[0] : from;
  const clean = base.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const [word] = parts;
    if (word.length === 1) return word.toUpperCase();
    return (word[0] + word[word.length - 1]).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const email = user?.email ?? undefined;
  const displayName = user?.displayName ?? undefined;

  const avatarSrc = useMemo(() => {
    if (user?.photoURL) return user.photoURL;
    if (!email) return null;

    const normalized = email.trim().toLowerCase();
    const hash = md5(normalized);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  }, [email, user]);

  const initials = useMemo(
    () => getInitials(displayName ?? email ?? undefined),
    [displayName, email]
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    const result = await signOutUser();
    setSigningOut(false);

    if (result.success) {
      navigate({ to: "/login" });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full border border-border/70 bg-muted/40 p-0"
        aria-label="Open profile menu"
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName ?? email ?? "Profile"}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className={className}>
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            {displayName && (
              <span className="truncate text-xs font-medium text-foreground">
                {displayName}
              </span>
            )}
            {email && (
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <div className="flex w-full items-center justify-between">
            <span className="text-xs">Appearance</span>
            <ThemeToggle />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          variant="destructive"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
