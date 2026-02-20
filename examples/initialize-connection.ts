import { PostProxy } from "postproxy-sdk";

const API_KEY = "your-api-key";
const PROFILE_GROUP_ID = "your-profile-group-id";

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // List profile groups
  const groups = await client.profileGroups.list();
  console.log("Profile Groups:", groups);

  // Initialize a connection
  const connection = await client.profileGroups.initializeConnection(
    PROFILE_GROUP_ID,
    "instagram",
    "https://your-app.com/callback",
  );
  console.log("Connection URL:", connection.url);
}

main().catch(console.error);
