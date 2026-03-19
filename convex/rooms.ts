import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createRoom = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non authentifié");
    const roomId = await ctx.db.insert("rooms", {
      name,
      ownerId: userId,
      createdAt: Date.now(),
    });
    // Le créateur est automatiquement membre
    await ctx.db.insert("roomMembers", {
      roomId,
      userId,
      joinedAt: Date.now(),
    });
    return roomId;
  },
});

export const getMyRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const rooms = await Promise.all(
      memberships.map(async (m) => {
        const room = await ctx.db.get(m.roomId);
        return room;
      })
    );
    return rooms.filter(Boolean);
  },
});

export const getRoomMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    return Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .first();
        return {
          _id: m.userId,
          displayName: profile?.displayName ?? user?.name ?? "Utilisateur",
          isOwner: false,
        };
      })
    );
  },
});

export const inviteFriendToRoom = mutation({
  args: { roomId: v.id("rooms"), friendId: v.id("users") },
  handler: async (ctx, { roomId, friendId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non authentifié");

    // Vérifier que l'inviteur est membre
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", userId))
      .first();
    if (!membership) throw new Error("Vous n'êtes pas membre de cette room");

    // Vérifier que l'ami n'est pas déjà membre
    const alreadyMember = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", friendId))
      .first();
    if (alreadyMember) throw new Error("Cet ami est déjà dans la room");

    await ctx.db.insert("roomMembers", {
      roomId,
      userId: friendId,
      joinedAt: Date.now(),
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non authentifié");
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", userId))
      .first();
    if (membership) await ctx.db.delete(membership._id);
  },
});
