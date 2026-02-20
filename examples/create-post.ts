import { PostProxy, type PlatformParams } from "postproxy-sdk";

const API_KEY = "POSTPROXY_API_KEY";
const PROFILE_GROUP_ID = "your-profile-group-id";

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // List profiles
  const { data: profiles } = await client.profiles.list();
  console.log("Profiles:", profiles);

  const profileId = profiles[0].id;

  // Create a simple post
  const post = await client.posts.create("Hello from PostProxy SDK!", [
    profileId,
  ], { draft: true });
  console.log("Created post:", post);

  // Create a post with media URLs
  const postWithMedia = await client.posts.create(
    "Check out this image!",
    [profileId],
    {
      media: ["https://example.com/image.jpg"],
      draft: true,
    },
  );
  console.log("Post with media:", postWithMedia);

  // Create a post with file uploads
  const postWithFiles = await client.posts.create(
    "Uploading files!",
    [profileId],
    {
      mediaFiles: ["./photo.jpg"],
    },
  );
  console.log("Post with files:", postWithFiles);

  // Create a post with platform-specific params
  const platforms: PlatformParams = {
    instagram: {
      format: "reel",
      collaborators: ["friend_username"],
    },
    tiktok: {
      privacy_status: "PUBLIC_TO_EVERYONE",
      made_with_ai: true,
    },
  };

  const postWithParams = await client.posts.create(
    "Cross-platform post!",
    [profileId],
    { platforms },
  );
  console.log("Post with platform params:", postWithParams);

  // Create a scheduled post
  const scheduledPost = await client.posts.create(
    "Scheduled post",
    [profileId],
    {
      scheduledAt: "2025-12-25T09:00:00Z",
    },
  );
  console.log("Scheduled post:", scheduledPost);

  // Create a draft and publish it
  const draft = await client.posts.create("Draft post", [profileId], {
    draft: true,
  });
  console.log("Draft:", draft);

  const published = await client.posts.publishDraft(draft.id);
  console.log("Published:", published);

  // List posts with filters
  const postList = await client.posts.list({
    page: 0,
    perPage: 10,
    status: "pending",
  });
  console.log("Posts:", postList);

  // Delete a post
  const deleted = await client.posts.delete(post.id);
  console.log("Deleted:", deleted);
}

main().catch(console.error);
