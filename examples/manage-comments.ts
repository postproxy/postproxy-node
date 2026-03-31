import { PostProxy } from "postproxy-sdk";

const API_KEY = process.env.POSTPROXY_API_KEY!;
const PROFILE_GROUP_ID = process.env.POSTPROXY_PROFILE_GROUP_ID;

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  const postId = "your-post-id";
  const profileId = "your-profile-id";

  // List comments on a post
  const comments = await client.comments.list(postId, profileId);
  console.log(`Total comments: ${comments.total}`);
  for (const comment of comments.data) {
    console.log(`  ${comment.author_username}: ${comment.body}`);
    for (const reply of comment.replies) {
      console.log(`    ${reply.author_username}: ${reply.body}`);
    }
  }

  // Create a comment
  const newComment = await client.comments.create(
    postId,
    profileId,
    "Thanks for the feedback everyone!",
  );
  console.log(`Created comment: ${newComment.id} (status: ${newComment.status})`);

  // Reply to a comment
  const reply = await client.comments.create(postId, profileId, "Glad you liked it!", {
    parentId: newComment.id,
  });
  console.log(`Created reply: ${reply.id}`);

  // Hide a comment
  await client.comments.hide(postId, newComment.id, profileId);
  console.log("Comment hidden");

  // Unhide a comment
  await client.comments.unhide(postId, newComment.id, profileId);
  console.log("Comment unhidden");

  // Like a comment
  await client.comments.like(postId, newComment.id, profileId);
  console.log("Comment liked");

  // Unlike a comment
  await client.comments.unlike(postId, newComment.id, profileId);
  console.log("Comment unliked");

  // Delete a comment
  await client.comments.delete(postId, newComment.id, profileId);
  console.log("Comment deleted");
}

main().catch(console.error);
