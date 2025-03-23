import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

// load public key from file
const privateKey = fs.readFileSync(path.join(process.cwd(), '..', "private.pem"), "utf8");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { scopes: true },
  });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Sign JWT with user’s private key
  const token = jwt.sign(
    {
      userId: user.id,
      isAdmin: user.isAdmin,
      email: user.email,
      scopes: user.scopes.map((scope) => scope.name),
    },
    privateKey,
    { algorithm: "RS256", expiresIn: "1h" } // Use RSA256 algorithm
  );

  res.json({ token });
});

export default router;
