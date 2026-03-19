import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: { roomId: v.id("rooms"), content: v.string() },
  handler: async (ctx, { roomId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non authentifié");
    if (!content.trim()) throw new Error("Message vide");

    // Vérifier que l'utilisateur est membre
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", userId))
      .first();
    if (!membership) throw new Error("Vous n'êtes pas membre de cette room");

    await ctx.db.insert("messages", {
      roomId,
      userId,
      content: content.trim(),
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", userId))
      .first();
    if (!membership) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (m) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .first();
        const user = await ctx.db.get(m.userId);
        return {
          _id: m._id,
          content: m.content,
          createdAt: m.createdAt,
          userId: m.userId,
          displayName: profile?.displayName ?? user?.name ?? "Utilisateur",
        };
      })
    );
  },
});
