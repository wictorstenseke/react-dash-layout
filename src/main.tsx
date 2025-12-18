import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";

import "./index.css";
import { CommandPaletteProvider } from "./contexts/CommandPaletteContext";
import { AuthProvider } from "./features/auth/AuthProvider";
import { PlaybackProvider } from "./features/playback/PlaybackProvider";
import { SpotifyPlayerProvider } from "./features/spotify/SpotifyPlayerProvider";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CommandPaletteProvider>
          <SpotifyPlayerProvider>
            <PlaybackProvider>
              <RouterProvider router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
            </PlaybackProvider>
          </SpotifyPlayerProvider>
        </CommandPaletteProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
