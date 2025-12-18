import { createContext, useContext, useState, type ReactNode } from "react";

type CommandPaletteContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandPaletteContext = createContext<
  CommandPaletteContextType | undefined
>(undefined);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider"
    );
  }
  return context;
};

type CommandPaletteProviderProps = {
  children: ReactNode;
};

export const CommandPaletteProvider = ({
  children,
}: CommandPaletteProviderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
};
