import { pgTable, text, timestamp, doublePrecision, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const planTypeEnum = pgEnum('plan_type', ['75_HARD', 'CUSTOM', 'OTHER']);
export const instanceStatusEnum = pgEnum('instance_status', ['ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED']);

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    avatarUrl: text('avatar_url'),
    currentPlanId: text('current_plan_id'), // We'll add FK later or keep it loose to avoid circular dependency
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const physicalStats = pgTable('physical_stats', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    weight: doublePrecision('weight').notNull(),
    height: doublePrecision('height').notNull(),
    bodyFatPercentage: doublePrecision('body_fat_percentage'),
    date: text('date').notNull(), // Storing as string YYYY-MM-DD
});

export const plans = pgTable('plans', {
    id: text('id').primaryKey(), // Explicit ID like 'default-75-hard' or UUID
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: planTypeEnum('type').notNull(),
    durationDays: integer('duration_days').notNull(),
    tasks: text('tasks').notNull(), // Store JSON string array of PlanTaskDefinition
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customPlanCharacteristics = pgTable('custom_plan_characteristics', {
    planId: text('plan_id').primaryKey().references(() => plans.id, { onDelete: 'cascade' }),
    creatorUserId: text('creator_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    isPublic: boolean('is_public').default(false).notNull(),
});

export const userPlanInstances = pgTable('user_plan_instances', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
    startDate: text('start_date').notNull(), // YYYY-MM-DD
    endDate: text('end_date'), // YYYY-MM-DD
    status: instanceStatusEnum('status').default('ACTIVE').notNull(),
    currentDay: integer('current_day').default(1).notNull(),
});

// Relations for easier querying later
export const usersRelations = relations(users, ({ many, one }) => ({
    physicalStats: many(physicalStats),
    instances: many(userPlanInstances),
    customPlans: many(customPlanCharacteristics),
}));

export const physicalStatsRelations = relations(physicalStats, ({ one }) => ({
    user: one(users, {
        fields: [physicalStats.userId],
        references: [users.id],
    }),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
    customCharacteristics: one(customPlanCharacteristics, {
        fields: [plans.id],
        references: [customPlanCharacteristics.planId],
    }),
    instances: many(userPlanInstances),
}));

export const userPlanInstancesRelations = relations(userPlanInstances, ({ one }) => ({
    user: one(users, {
        fields: [userPlanInstances.userId],
        references: [users.id],
    }),
    plan: one(plans, {
        fields: [userPlanInstances.planId],
        references: [plans.id],
    }),
}));
