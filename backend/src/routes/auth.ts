import { Router } from 'express';
import { db } from '../db';
import { users, physicalStats } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, avatarUrl, weight, height, bodyFatPercentage } = req.body;

        // Basic validation
        if (!name || !email || !weight || !height) {
            return res.status(400).json({ error: 'Missing required fields: name, email, weight, height' });
        }

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Proceed with sequential inserts since neon-http does not support transactions
        // 1. Insert User
        const [newUser] = await db.insert(users).values({
            name,
            email,
            avatarUrl,
        }).returning();

        // 2. Insert Physical Stats
        const [newStats] = await db.insert(physicalStats).values({
            userId: newUser.id,
            weight: parseFloat(weight),
            height: parseFloat(height),
            bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        }).returning();

        res.status(201).json({ user: newUser, stats: newStats });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

export default router;
