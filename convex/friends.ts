import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendRequest = mutation({
  args: { toId: v.id("users") },
  handler: async (ctx, { toId }) => {
    const fromId = await getAuthUserId(ctx);
    if (!fromId) throw new Error("Non authentifié");
    if (fromId === toId) throw new Error("Vous ne pouvez pas vous ajouter vous-même");

    // Vérifier si une demande existe déjà
    const existing = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_and_to", (q) => q.eq("fromId", fromId).eq("toId", toId))
      .first();
    if (existing) throw new Error("Demande déjà envoyée");

    const reverse = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_and_to", (q) => q.eq("fromId", toId).eq("toId", fromId))
      .first();
    if (reverse && reverse.status === "accepted") throw new Error("Déjà amis");

    await ctx.db.insert("friendRequests", {
      fromId,
      toId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const respondRequest = mutation({
  args: { requestId: v.id("friendRequests"), accept: v.boolean() },
  handler: async (ctx, { requestId, accept }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non authentifié");
    const request = await ctx.db.get(requestId);
    if (!request || request.toId !== userId) throw new Error("Demande introuvable");
    await ctx.db.patch(requestId, { status: accept ? "accepted" : "rejected" });
  },
});

export const getMyFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sent = await ctx.db
      .query("friendRequests")
      .withIndex("by_from", (q) => q.eq("fromId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const received = await ctx.db
      .query("friendRequests")
      .withIndex("by_to", (q) => q.eq("toId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friendIds = [
      ...sent.map((r) => r.toId),
      ...received.map((r) => r.fromId),
    ];

    const friends = await Promise.all(
      friendIds.map(async (id) => {
        const user = await ctx.db.get(id);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", id))
          .first();
        return {
          _id: id,
          email: user?.email ?? "",
          displayName: profile?.displayName ?? user?.name ?? "Utilisateur",
        };
      })
    );
    return friends;
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to", (q) => q.eq("toId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return Promise.all(
      requests.map(async (r) => {
        const user = await ctx.db.get(r.fromId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", r.fromId))
          .first();
        return {
          requestId: r._id,
          fromId: r.fromId,
          displayName: profile?.displayName ?? user?.name ?? "Utilisateur",
          email: user?.email ?? "",
        };
      })
    );
  },
});
