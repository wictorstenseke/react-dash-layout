import {
  Playlist01Icon,
  Folder01Icon,
  Move01Icon,
  SquareArrowDiagonal02Icon,
  ArrangeIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Features() {
  return (
    <section className="pt-12 pb-0">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Key Features
          </h2>
          <p>
            Organize your Spotify tracks into themed groups with our
            customizable drag-and-drop interface. Find the right song at the
            right moment.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Playlist01Icon} className="size-4" />
              <h3 className="text-sm font-medium">Spotify Integration</h3>
            </div>
            <p className="text-sm">
              Connect to Spotify and import your playlists, search for tracks,
              and play music directly from your browser. Full Web Playback SDK
              support included.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Folder01Icon} className="size-4" />
              <h3 className="text-sm font-medium">Themed Organization</h3>
            </div>
            <p className="text-sm">
              Organize your tracks into custom themed groups. Create categories
              for moods, activities, or any theme that fits your listening
              style.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Move01Icon} className="size-4" />
              <h3 className="text-sm font-medium">Drag & Drop Layout</h3>
            </div>
            <p className="text-sm">
              Arrange themed groups anywhere on a flexible grid. Drag handles
              make repositioning intuitive and smooth.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={SquareArrowDiagonal02Icon}
                className="size-4"
              />
              <h3 className="text-sm font-medium">Resizable Groups</h3>
            </div>
            <p className="text-sm">
              Resize any group from any corner or edge. Customize the layout to
              prioritize your most important themes.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={ArrangeIcon} className="size-4" />
              <h3 className="text-sm font-medium">Sortable Tracks</h3>
            </div>
            <p className="text-sm">
              Reorder tracks within each group using drag-and-drop. Arrange your
              playlists exactly how you want them.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={PlayIcon} className="size-4" />
              <h3 className="text-sm font-medium">Playback Control</h3>
            </div>
            <p className="text-sm">
              Play, pause, and control your Spotify tracks directly from
              Trackboard. Smooth fade in/out transitions for a better listening
              experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
