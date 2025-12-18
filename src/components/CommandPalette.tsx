import { useEffect, useState } from "react";

import {
  Add01Icon,
  ArrowReloadHorizontalIcon,
  Logout01Icon,
  Upload03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useNavigate } from "@tanstack/react-router";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/features/auth/AuthProvider";
import { signOutUser } from "@/features/auth/authService";

type CommandPaletteProps = {
  onCreateGroup?: () => void;
  onResetLayout?: () => void;
  onCompact?: () => void;
};

export const CommandPalette = ({
  onCreateGroup,
  onResetLayout,
  onCompact,
}: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Open command palette with cmd+k or ctrl+k
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    const result = await signOutUser();
    if (result.success) {
      navigate({ to: "/login" });
    }
  };

  const handleCreateGroup = () => {
    setOpen(false);
    onCreateGroup?.();
  };

  const handleResetLayout = () => {
    setOpen(false);
    onResetLayout?.();
  };

  const handleCompact = () => {
    setOpen(false);
    onCompact?.();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleCreateGroup}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Create Group</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Layout">
            <CommandItem onSelect={handleCompact}>
              <HugeiconsIcon
                icon={Upload03Icon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Compact Layout</span>
            </CommandItem>
            <CommandItem onSelect={handleResetLayout}>
              <HugeiconsIcon
                icon={ArrowReloadHorizontalIcon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Reset Layout</span>
            </CommandItem>
          </CommandGroup>
          {user && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <CommandItem onSelect={handleSignOut}>
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    strokeWidth={2}
                    className="mr-2"
                  />
                  <span>Sign Out</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
