import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      isAdmin: true,
      scopes: true,
    },
  });
  res.json(users);
});

router.get("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: +id },
    include: { scopes: true }, // Include scopes
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Create new user (admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  const { email, password, isAdmin = false, scopes } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isAdmin,
      scopes: { connect: scopes?.map((name: string) => ({ name })) || [] },
    },
  });
  res.json({ id: user.id, email: user.email });
});

// Update user (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { password, isAdmin, scopes } = req.body;
  const data: any = {};
  if (password) data.password = bcrypt.hashSync(password, 10);
  if (typeof isAdmin === "boolean") data.isAdmin = isAdmin;
  if (scopes) data.scopes = { set: scopes.map((name: string) => ({ name })) };

  const user = await prisma.user.update({ where: { id: +id }, data });
  res.json({ id: user.id, email: user.email });
});

// Delete user (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: +id } });
  res.json({ message: "User deleted" });
});

export default router;
