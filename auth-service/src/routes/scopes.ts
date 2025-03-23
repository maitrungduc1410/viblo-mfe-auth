import express from 'express';
import { prisma } from '../prisma';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// GET all scopes (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  const scopes = await prisma.scope.findMany();
  res.json(scopes);
});

// CREATE scope (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  const scope = await prisma.scope.create({
    data: { name, description },
  });
  res.json(scope);
});

// UPDATE scope (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const scope = await prisma.scope.update({
    where: { id: +id },
    data: { name, description },
  });
  res.json(scope);
});

// DELETE scope (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.scope.delete({ where: { id: +id } });
  res.status(204).send();
});

export default router;