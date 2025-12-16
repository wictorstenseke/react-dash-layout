import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  usePostQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "@/hooks/usePosts";

// Mountain bike themed posts for consistent display
const mountainBikeTitles = [
  "Essential Trail Maintenance Tips",
  "Choosing Your First Mountain Bike",
  "Downhill Riding Safety Guide",
  "Best MTB Trails in the Region",
  "Suspension Setup Basics",
  "Climbing Techniques for Beginners",
  "Night Riding Essentials Checklist",
  "Gear Shifting Like a Pro",
  "Bike Packing Adventure Prep",
  "Jumping and Dropping Fundamentals",
];

const mountainBikeBodies = [
  "Regular trail maintenance keeps paths safe and enjoyable for everyone. Check drainage, remove debris, and report major issues to local trail organizations.",
  "Your first mountain bike should match your riding style and budget. Consider hardtail vs full suspension based on terrain you plan to tackle.",
  "Always inspect your bike before descending. Check brakes, tire pressure, and suspension settings. Wear proper protective gear including helmet and pads.",
  "Explore diverse trails from flowy singletrack to technical rock gardens. Each trail offers unique challenges and scenic views worth experiencing.",
  "Proper suspension tuning maximizes comfort and control. Adjust sag, rebound, and compression to match your weight and riding preferences.",
  "Master the seated and standing positions for efficient climbing. Learn to shift early and maintain steady cadence on steep ascents.",
  "Quality lights are essential for night riding. Bring backup batteries, reflectors, and always ride with a buddy for safety.",
  "Smooth shifting comes from anticipation and proper technique. Shift before obstacles and avoid cross-chaining for longer drivetrain life.",
  "Plan your route, pack lightweight gear, and test your setup before long trips. Balance weight distribution for optimal handling.",
  "Start small and progress gradually when learning jumps. Focus on body positioning, speed control, and committing to the landing.",
];

const getMountainBikeTitle = (postId: number): string => {
  return mountainBikeTitles[(postId - 1) % mountainBikeTitles.length];
};

const getMountainBikeBody = (postId: number): string => {
  return mountainBikeBodies[(postId - 1) % mountainBikeBodies.length];
};

export const QueryDemo = () => {
  const [page] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletedPostIds, setDeletedPostIds] = useState<Set<number>>(new Set());
  const [updatedPosts, setUpdatedPosts] = useState<
    Map<number, { title: string; body: string }>
  >(new Map());

  // Query for posts list
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePostsQuery({ page, limit: 10 });

  // Query for selected post
  const {
    data: selectedPost,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = usePostQuery(selectedPostId || 0);

  // Mutations
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const handleCreatePost = () => {
    createPostMutation.mutate(
      {
        title: "New Trail Discovery Guide",
        body: "Discovering new mountain bike trails requires research and preparation. Check trail conditions, difficulty ratings, and always respect local regulations and private property.",
        userId: 1,
      },
      {
        onSuccess: (data) => {
          setIsCreating(false);
          setSelectedPostId(data.id);
        },
      }
    );
  };

  const handleUpdatePost = (id: number) => {
    setShowUpdateAlert(false);
    setShowDeleteAlert(false);
    const updatedData = {
      title: "Updated: Advanced Cornering Techniques",
      body: "Master cornering by looking ahead, weighting the outside pedal, and using body positioning to maximize traction and control through turns.",
    };
    updatePostMutation.mutate(
      {
        id,
        data: updatedData,
      },
      {
        onSuccess: () => {
          setShowUpdateAlert(true);
          // Track updated post data locally
          setUpdatedPosts((prev) => new Map(prev).set(id, updatedData));
        },
      }
    );
  };

  const handleDeletePost = (id: number) => {
    setShowUpdateAlert(false);
    setShowDeleteAlert(false);
    deletePostMutation.mutate(id, {
      onSuccess: () => {
        setShowDeleteAlert(true);
        // Track deleted post ID
        setDeletedPostIds((prev) => new Set(prev).add(id));
        if (selectedPostId === id) {
          setSelectedPostId(null);
        }
      },
    });
  };

  const handleSelectPost = (id: number) => {
    setShowUpdateAlert(false);
    setShowDeleteAlert(false);
    setSelectedPostId(id);
  };

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (showUpdateAlert) {
      const timer = setTimeout(() => {
        setShowUpdateAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUpdateAlert]);

  useEffect(() => {
    if (showDeleteAlert) {
      const timer = setTimeout(() => {
        setShowDeleteAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteAlert]);

  return (
    <div className="flex flex-col space-y-8 py-8">
      {/* Page Header */}
      <div className="space-y-1 bg-muted/70 p-8 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          TanStack Query Demo
        </h1>
        <p className="text-muted-foreground">
          Explore powerful data fetching, caching, and state management patterns
          with TanStack Query v5.
        </p>
        <p className="text-sm">
          This interactive demo demonstrates core features through a posts
          management interface where you can view, create, update, and delete
          posts. Experience automatic caching, optimistic updates, background
          refetching, and intelligent cache synchronization in action.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posts List */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Posts List</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => refetch()}
                  size="sm"
                  variant="outline"
                  disabled={isFetching}
                >
                  {isFetching ? "Refetching..." : "Refetch"}
                </Button>
                <Button
                  onClick={() => setIsCreating(true)}
                  size="sm"
                  disabled={createPostMutation.isPending}
                >
                  Create Post
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a post to view or edit.
            </p>
          </div>

          {isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              Loading posts...
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Error: {error?.message || "Failed to load posts"}
              </p>
            </div>
          )}

          {posts && (
            <ScrollArea className="h-96 rounded-md border">
              <div className="space-y-2 p-4">
                {posts
                  .slice(0, 10)
                  .filter((post) => !deletedPostIds.has(post.id))
                  .map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelectPost(post.id)}
                      className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent ${
                        selectedPostId === post.id
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                    >
                      <h3 className="font-medium text-sm line-clamp-1">
                        {updatedPosts.has(post.id)
                          ? updatedPosts.get(post.id)!.title
                          : getMountainBikeTitle(post.id)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {updatedPosts.has(post.id)
                          ? updatedPosts.get(post.id)!.body
                          : getMountainBikeBody(post.id)}
                      </p>
                    </button>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Post Detail / Actions */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-4 space-y-2">
            <h2 className="text-xl font-semibold">Post Actions</h2>
            <p className="text-sm text-muted-foreground">
              When a post is selected, you can update it with optimistic UI
              updates (UI changes immediately), delete it from the cache, or
              clear the selection to start over.
            </p>
          </div>

          {isCreating && (
            <div className="space-y-4">
              <div className="rounded-md border border-primary bg-primary/10 p-4">
                <h3 className="font-medium mb-2">Create New Post</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a new post and automatically update the cache
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? "Creating..." : "Confirm"}
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    disabled={createPostMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isCreating && !selectedPostId && (
            <div className="py-8 text-center text-muted-foreground">
              Select a post from the list to view details and actions
            </div>
          )}

          {!isCreating && selectedPostId && (
            <div className="space-y-4">
              {isLoadingPost && (
                <div className="py-8 text-center text-muted-foreground">
                  Loading post details...
                </div>
              )}

              {isPostError && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">
                    Error loading post details
                  </p>
                </div>
              )}

              {selectedPost && (
                <>
                  <div className="rounded-md border bg-muted/50 p-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Post ID: {selectedPost.id}
                    </div>
                    <h3 className="font-semibold">
                      {updatedPosts.has(selectedPost.id)
                        ? updatedPosts.get(selectedPost.id)!.title
                        : getMountainBikeTitle(selectedPost.id)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {updatedPosts.has(selectedPost.id)
                        ? updatedPosts.get(selectedPost.id)!.body
                        : getMountainBikeBody(selectedPost.id)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Available Actions:
                    </h3>

                    <Button
                      onClick={() => handleUpdatePost(selectedPost.id)}
                      className="w-full"
                      disabled={updatePostMutation.isPending}
                    >
                      {updatePostMutation.isPending
                        ? "Updating..."
                        : "Update Post"}
                    </Button>

                    <Button
                      onClick={() => handleDeletePost(selectedPost.id)}
                      variant="destructive"
                      className="w-full"
                      disabled={deletePostMutation.isPending}
                    >
                      {deletePostMutation.isPending
                        ? "Deleting..."
                        : "Delete Post"}
                    </Button>

                    <Button
                      onClick={() => {
                        setShowUpdateAlert(false);
                        setShowDeleteAlert(false);
                        setSelectedPostId(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Selection
                    </Button>
                  </div>

                  {showUpdateAlert && (
                    <div className="rounded-md border border-green-500 bg-green-500/10 p-3">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Post updated successfully with optimistic UI!
                      </p>
                    </div>
                  )}

                  {showDeleteAlert && (
                    <div className="rounded-md border border-green-500 bg-green-500/10 p-3">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Post deleted successfully!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Auto Caching</h3>
          <p className="text-xs text-muted-foreground">
            Data is cached automatically and shared across components
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Optimistic Updates</h3>
          <p className="text-xs text-muted-foreground">
            UI updates immediately before server confirms
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Auto Refetch</h3>
          <p className="text-xs text-muted-foreground">
            Refetch on window focus and network reconnect
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Devtools</h3>
          <p className="text-xs text-muted-foreground">
            Press floating icon to inspect cache state
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <Button variant="outline" render={<Link to="/" />} nativeButton={false}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};
