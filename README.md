# Spotify Music Organizer

A customizable dashboard application for organizing your Spotify songs and playlists into themed groups. Connect to Spotify's web services to fetch your music library and organize tracks by themes, making it easy to find the right song at the right moment.

## 🎵 About

This application allows you to:

- Connect to Spotify's Web API to fetch your songs and playlists
- Organize tracks into customizable themed groups
- Use drag-and-drop interfaces to arrange your music visually
- Quickly access the right song when you need it

## 🛠️ Technologies Used

- **React 19** - UI library with TypeScript
- **Vite (Rolldown)** - Fast build tool with Rust-based bundler
- **Firebase** - Authentication, Firestore database, and Cloud Functions
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Data fetching and caching for API calls
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **react-grid-layout** - Drag-and-drop grid layout system
- **@dnd-kit** - Sortable drag-and-drop for items within groups
- **Vitest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

## 📦 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppShell.tsx            # Main layout wrapper
│   ├── SpotifyConnectButton.tsx    # Spotify OAuth connection
│   ├── ImportPlaylistDialog.tsx    # Import Spotify playlists
│   ├── SearchTrackDialog.tsx       # Search and add tracks
│   ├── PlayerStatus.tsx            # Spotify player status
│   ├── GroupCard.tsx               # Group display component
│   ├── SortableTracks.tsx          # Sortable track items
│   └── ui/                         # shadcn/ui components
├── features/
│   ├── auth/                       # Firebase Authentication
│   ├── groups/                     # Groups and tracks management
│   └── spotify/                    # Spotify integration hooks & services
├── pages/
│   ├── Landing.tsx                 # Home page
│   ├── Login.tsx                   # Authentication page
│   ├── App.tsx                     # Main dashboard
│   └── Example.tsx                 # Grid layout example
├── routes/                         # TanStack Router routes
│   ├── __root.tsx                  # Root layout
│   ├── index.tsx                   # / route
│   ├── login.tsx                   # /login route
│   └── app.tsx                     # /app route
├── hooks/
│   ├── useGroups.ts                # Groups data hooks
│   └── useTracks.ts                # Tracks data hooks
├── lib/
│   ├── firebase.ts                 # Firebase configuration
│   ├── queryClient.ts              # TanStack Query configuration
│   └── utils.ts                    # Utility functions
├── types/
│   └── spotify-web-playback.d.ts   # Spotify SDK types
├── router.tsx                      # Router configuration
├── main.tsx                        # App entry point
└── index.css                       # Global styles

functions/                          # Firebase Cloud Functions
├── src/
│   ├── spotify/                    # Spotify OAuth & API proxy endpoints
│   └── utils/                      # Shared utilities
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Spotify Developer Account (for API access)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd react-dash-layout
```

2. Install dependencies:

```bash
npm install
cd functions && npm install && cd ..
```

3. Set up environment variables:
   - Create `functions/.env` file:
     ```bash
     SPOTIFY_CLIENT_ID=your_spotify_client_id_here
     FUNCTIONS_EMULATOR=true
     FRONTEND_URL=http://localhost:5173
     ```
   - Create `.env.local` in project root (see `.env.local.example` for template)

4. Build Firebase Functions:

```bash
cd functions
npm run build
cd ..
```

### Local Development with Firebase Emulators

This application requires Firebase emulators to run locally for authentication, Firestore, and Cloud Functions.

1. **Start Firebase Emulators** (in a separate terminal):

```bash
firebase emulators:start
```

This will automatically start all configured emulators:

- Auth emulator at `http://127.0.0.1:9099`
- Functions emulator at `http://127.0.0.1:5001`
- Firestore emulator at `http://127.0.0.1:8080`
- Emulator UI at `http://localhost:4000`

**Keep this terminal open** - emulators must stay running while developing.

2. **Start Development Server** (in another terminal):

```bash
npm run dev
```

3. **Create a Test Account**:

Since you're using the Auth emulator, create an account:

- Go to `http://localhost:5173/login` and sign up, or
- Use the Emulator UI at `http://localhost:4000` → Authentication tab → Add user

**Note:** Emulator data is temporary and resets when you stop the emulators.

### Production Build

```bash
npm run build
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Check code quality
- `npm run type-check` - TypeScript type checking

See `package.json` for all available scripts.

## 🎨 Key Features

### Drag-and-Drop Layout

- **Grid Layout**: Organize themed groups on a flexible 48-column grid
- **Resizable Groups**: Adjust group sizes by dragging edges or corners
- **Sortable Items**: Reorder songs within each themed group
- **Persistent State**: Layout and arrangements saved to localStorage

### Spotify Integration

- Connect to Spotify Web API to fetch your music library
- Organize songs and playlists into custom themed groups
- Quick access to the right song at the right moment

## 🔧 Development Notes

### Adding UI Components

Add shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

### Adding Routes

TanStack Router uses file-based routing. Create files in `src/routes/` and routes are auto-generated.

### Data Fetching

TanStack Query is configured for API calls with automatic caching. Create query hooks in `src/hooks/` for Spotify API integration.

## 📚 Documentation

- [Spotify Integration Summary](./docs/spotify-integration-summary.md) - Comprehensive overview of Spotify integration
- [React Grid Layout](./docs/readme-react-grid-layout.md) - Grid layout documentation

## 📚 Resources

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [@dnd-kit](https://dndkit.com)

## 📄 License

MIT
