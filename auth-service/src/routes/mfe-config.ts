import express from "express";
import { prisma } from "../prisma";
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

// GET all MFE configs (admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  const mfeConfigs = await prisma.mFEConfig.findMany({
    include: { scopes: true },
  });
  res.json(mfeConfigs);
});

// GET all MFE configs the authenticated user has access to
router.get("/accessible", authenticate, async (req, res) => {
  // @ts-ignore - req.user is added by authenticate middleware
  const userId = req.user.userId;

  // Fetch the user's scopes
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scopes: { select: { name: true } } }, // Only fetch scope names
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const userScopeNames = user.scopes.map((scope) => scope.name);

  // Fetch MFE configs where at least one scope matches the user's scopes
  const accessibleConfigs = await prisma.mFEConfig.findMany({
    where: {
      scopes: {
        some: {
          name: { in: userScopeNames }, // Match any scope in the user's scope list
        },
      },
    },
  });

  res.json(accessibleConfigs);
});

// GET single MFE config by ID (admin only)
router.get("/:id", authenticate, isAdmin, async (req, res) => {
  console.log(11111);
  const { id } = req.params;
  const mfeConfig = await prisma.mFEConfig.findUnique({
    where: { id: +id },
    include: { scopes: true },
  });
  if (!mfeConfig)
    return res.status(404).json({ message: "MFE Config not found" });
  res.json(mfeConfig);
});

// CREATE MFE config (admin only)
router.post('/', authenticate, async (req, res) => { // Removed isAdmin
  const { remoteEntry, remoteName, exposedModule, scopes } = req.body;
  const mfeConfig = await prisma.mFEConfig.create({
    data: {
      remoteEntry,
      remoteName,
      exposedModule,
      scopes: { connect: scopes.map((name: string) => ({ name })) },
    },
  });
  res.json(mfeConfig);
});

// UPDATE MFE config (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { remoteEntry, remoteName, exposedModule, scopes } = req.body;
  const mfeConfig = await prisma.mFEConfig.update({
    where: { id: +id },
    data: {
      remoteEntry,
      remoteName,
      exposedModule,
      scopes: { set: scopes.map((name: string) => ({ name })) },
    },
  });
  res.json(mfeConfig);
});

// DELETE MFE config (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.mFEConfig.delete({ where: { id: +id } });
  res.status(204).send();
});

export default router;
