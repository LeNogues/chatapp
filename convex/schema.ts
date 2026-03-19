import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Rooms créées par les utilisateurs
  rooms: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }),

  // Membres d'une room
  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Messages dans une room
  messages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),

  // Demandes d'amis et amitiés
  friendRequests: defineTable({
    fromId: v.id("users"),
    toId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    createdAt: v.number(),
  })
    .index("by_from", ["fromId"])
    .index("by_to", ["toId"])
    .index("by_from_and_to", ["fromId", "toId"]),

  // Profils utilisateurs étendus
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    status: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
