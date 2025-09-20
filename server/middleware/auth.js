/*import { clerkClient } from "@clerk/express";

//middleware to check userId and hasPremiumPlan


export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();   // ✅ FIXED (req.auth is a function now)
    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};*/

import { clerkClient } from "@clerk/express";

// Middleware to check userId and plan
export const auth = async (req, res, next) => {
  try {
    const { userId } = await req.auth(); // ✅ call req.auth() properly
    const user = await clerkClient.users.getUser(userId);

    // ✅ Read plan from Clerk metadata (default = "free")
    const plan = user.privateMetadata.plan || "free";

    // ✅ Read free_usage (default = 0)
    let free_usage = user.privateMetadata.free_usage || 0;

    // If first time user, initialize free_usage = 0
    if (user.privateMetadata.free_usage === undefined) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: 0,
        },
      });
      free_usage = 0;
    }

    req.userId = userId;
    req.plan = plan;
    req.free_usage = free_usage;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};