import { PostProxy } from "postproxy-sdk";

const API_KEY = "your-api-key";
const PROFILE_GROUP_ID = "your-profile-group-id";

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // List profile groups
  const { data: groups } = await client.profileGroups.list();
  console.log("Profile Groups:", groups);

  // Initialize a connection
  const connection = await client.profileGroups.initializeConnection(
    PROFILE_GROUP_ID,
    "instagram",
    "https://your-app.com/callback",
  );
  console.log("Connection URL:", connection.url);

  // After connecting, list a profile's placements (Pages, channels, locations)
  const { data: placements } = await client.profiles.placements("profile-id");
  console.log("Placements:", placements);

  // Move one placement to a different profile group
  await client.profiles.assignPlacementToGroup("profile-id", {
    placementId: placements[0].id,
    targetProfileGroupId: "other-group-id",
  });
}

main().catch(console.error);
