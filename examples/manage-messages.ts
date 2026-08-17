import { PostProxy } from "postproxy-sdk";

const API_KEY = process.env.POSTPROXY_API_KEY!;
const PROFILE_GROUP_ID = process.env.POSTPROXY_PROFILE_GROUP_ID;

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // A DM-capable profile (facebook/instagram/telegram/bluesky)
  const profileId = "your-profile-id";

  // List existing chats for a profile
  const chats = await client.chats.list(profileId, { perPage: 20 });
  console.log(`Total chats: ${chats.total}`);
  for (const chat of chats.data) {
    console.log(
      `  ${chat.participant_username ?? chat.participant_external_id}: ${chat.last_message_at}`,
    );
  }

  // Find or create a chat with a participant
  const chat = await client.chats.create(profileId, "igsid_8675309", {
    participantUsername: "jane_doe",
  });
  console.log(`Chat: ${chat.id} (platform: ${chat.platform})`);

  // List messages in the chat
  const messages = await client.messages.list(chat.id, { direction: "inbound" });
  for (const msg of messages.data) {
    console.log(`  [${msg.direction}] ${msg.body}`);
    for (const att of msg.attachments) {
      console.log(`    attachment: ${att.type} -> ${att.url}`);
    }
  }

  // Send a text message (within the 24h window)
  const sent = await client.messages.send(chat.id, {
    body: "Yes, we ship worldwide!",
  });
  console.log(`Sent message: ${sent.id} (status: ${sent.status})`);

  // Send outside the 24h window with a tag (Facebook/Instagram)
  await client.messages.send(chat.id, {
    body: "Following up on your order.",
    tag: "HUMAN_AGENT",
  });

  // Send an image by hosted URL
  await client.messages.send(chat.id, {
    media: ["https://cdn.example.com/photo.png"],
  });

  // Send an image from a local file (multipart)
  // await client.messages.send(chat.id, { mediaFiles: ["./photo.png"] });

  // Quick replies — tappable chips above the composer, gone once tapped.
  // Facebook & Instagram only; up to 13.
  await client.messages.send(chat.id, {
    body: "What can I help with?",
    quickReplies: [
      { title: "Track order", payload: "TRACK" },
      { title: "Talk to support", payload: "HELP" },
    ],
  });

  // Buttons — attached to the message and stay in the thread. Up to 3, and
  // `body` is capped at 80 characters when buttons are present (Meta's limit).
  // `card` adds subtitle / image / tap-through to the same card.
  await client.messages.send(chat.id, {
    body: "Your order shipped",
    buttons: [
      { type: "web_url", title: "Track", url: "https://shop.example.com/o/123" },
      { type: "postback", title: "Cancel", payload: "CANCEL:123" },
    ],
    card: {
      subtitle: "Arriving Friday",
      image_url: "https://cdn.example.com/shoe.png",
    },
  });

  // A tap comes back as an inbound message carrying `tapped_action`.
  const inbound = await client.messages.list(chat.id, { direction: "inbound" });
  for (const msg of inbound.data) {
    if (msg.tapped_action) {
      console.log(
        `  tapped ${msg.tapped_action.kind}: ${msg.tapped_action.payload}`,
      );
    }
  }

  // React / unreact (Facebook & Instagram)
  await client.messages.react(sent.id, { reaction: "love", emoji: "❤️" });
  await client.messages.unreact(sent.id);

  // Edit an outbound message (Telegram only)
  // await client.messages.edit(sent.id, { body: "Updated answer." });

  // Archive / unarchive a chat (Bluesky only)
  // await client.chats.archive(chat.id);
  // await client.chats.unarchive(chat.id);

  // Private reply to a comment (Instagram/Facebook) — returns a Message
  const reply = await client.comments.privateReply(
    "your-post-id",
    "comment-id",
    profileId,
    "Thanks — DM-ing you the details.",
  );
  console.log(`Private reply queued: ${reply.id} (chat: ${reply.chat_id})`);

  // Ice breakers (Instagram only): FAQ prompts shown when a user opens a chat
  await client.profiles.setIceBreakers(profileId, [
    { question: "What services do you offer?", payload: "services" },
    { question: "What are your hours?", payload: "hours" },
  ]);
  const { ice_breakers } = await client.profiles.iceBreakers(profileId);
  console.log(`Ice breakers: ${ice_breakers.map((ib) => ib.question).join(", ")}`);
  // await client.profiles.deleteIceBreakers(profileId);
}

main().catch(console.error);
