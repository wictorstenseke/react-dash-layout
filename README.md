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
│   │   └── AppShell.tsx      # Main layout wrapper
│   ├── SortableSquares.tsx   # Sortable items component
│   └── ui/                    # shadcn/ui components
├── pages/
│   ├── Landing.tsx            # Home page
│   └── Example.tsx            # Dashboard example page
├── routes/                    # TanStack Router routes
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # / route
│   └── example.tsx            # /example route
├── hooks/
│   └── usePosts.ts            # Query hooks
├── lib/
│   ├── api.ts                 # API client with fetch wrapper
│   ├── queryClient.ts         # TanStack Query configuration
│   └── utils.ts               # Utility functions
├── types/
│   └── api.ts                 # API type definitions
├── router.tsx                 # Router configuration
├── main.tsx                   # App entry point
└── index.css                  # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
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
```

3. Set up Spotify API credentials:
   - Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add your client ID and redirect URI to environment variables

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## 📝 Available Scripts

### Development

- `npm run dev` - Start dev server with hot reload

### Building

- `npm run build` - Full production build (runs type-check, lint, test, then builds)
- `npm run preview` - Preview production build locally

### Type Checking & Linting

- `npm run generate:routes` - Generate TanStack Router route tree (auto-run by type-check)
- `npm run type-check` - Run TypeScript type checking (generates routes first)
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted correctly

### Testing

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Quality Checks

- `npm run ci` - Run all quality checks (type-check, lint, test) - used in CI pipeline
- `npm run check` - Alias for `ci`
- `npm run check:full` - Run all checks including build (most comprehensive)

## 📝 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload

### Building

- `npm run build` - Production build (runs type-check, lint, test, then builds)
- `npm run preview` - Preview production build locally

### Code Quality

- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted correctly

### Testing

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Quality Checks

- `npm run ci` - Run all quality checks (type-check, lint, test)
- `npm run check:full` - Run all checks including build

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

## 📚 Resources

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [@dnd-kit](https://dndkit.com)

## 📄 License

MIT
