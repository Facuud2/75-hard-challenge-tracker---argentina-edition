import { Router } from 'express';
import { db } from '../db';
import { users, physicalStats } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

// POST /api/auth/check-email
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        return res.status(200).json({ exists: existingUser.length > 0 });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ error: 'Internal server error during email check' });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, avatarUrl, weight, height, bodyFatPercentage } = req.body;

        // Basic validation
        if (!name || !email || !password || !weight || !height) {
            return res.status(400).json({ error: 'Missing required fields: name, email, password, weight, height' });
        }

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Proceed with sequential inserts since neon-http does not support transactions
        // 1. Insert User
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = existingUser[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user has physical stats (onboarding completed)
        const userStats = await db.select().from(physicalStats).where(eq(physicalStats.userId, user.id)).limit(1);
        const onboardingCompleted = userStats.length > 0;

        // Return user data without password
        const { password: _, ...userData } = user;

        return res.status(200).json({
            user: {
                ...userData,
                onboardingCompleted
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

export default router;
