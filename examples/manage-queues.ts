import { PostProxy } from "postproxy-sdk";

const API_KEY = "POSTPROXY_API_KEY";
const PROFILE_GROUP_ID = "your-profile-group-id";

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // Create a queue with weekday morning timeslots
  const queue = await client.queues.create("Morning Posts", PROFILE_GROUP_ID, {
    description: "Weekday morning content",
    timezone: "America/New_York",
    jitter: 10,
    timeslots: [
      { day: 1, time: "09:00" },
      { day: 2, time: "09:00" },
      { day: 3, time: "09:00" },
      { day: 4, time: "09:00" },
      { day: 5, time: "09:00" },
    ],
  });
  console.log("Created queue:", queue.id, queue.name);
  console.log("Timeslots:", queue.timeslots.length);

  // List all queues
  const { data: queues } = await client.queues.list();
  console.log("All queues:", queues.map((q) => q.name));

  // Get next available slot
  const nextSlot = await client.queues.nextSlot(queue.id);
  console.log("Next slot:", nextSlot.next_slot);

  // Add a post to the queue
  const { data: profiles } = await client.profiles.list();
  const post = await client.posts.create(
    "This post will be scheduled by the queue",
    [profiles[0].id],
    {
      queueId: queue.id,
      queuePriority: "high",
    },
  );
  console.log("Queued post:", post.id, "scheduled at:", post.scheduled_at);

  // Update the queue — add a timeslot and change jitter
  const updated = await client.queues.update(queue.id, {
    jitter: 15,
    timeslots: [{ day: 6, time: "10:00" }],
  });
  console.log("Updated queue timeslots:", updated.timeslots.length);

  // Pause the queue
  const paused = await client.queues.update(queue.id, { enabled: false });
  console.log("Queue paused:", !paused.enabled);

  // Delete the queue
  const deleted = await client.queues.delete(queue.id);
  console.log("Deleted:", deleted.deleted);
}

main().catch(console.error);
