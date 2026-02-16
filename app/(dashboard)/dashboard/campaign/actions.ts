'use server'

import { z } from 'zod'
import { campaigns } from '@/lib/db/schema'
import { getUserWithTeam } from '@/lib/db/queries'
import { eq } from 'drizzle-orm'
import {db} from "@/lib/db/drizzle";
import {validatedActionWithUserAsync} from "@/lib/auth/middleware";

const createCampaignSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    status: z.enum(['draft', 'active', 'completed']).default('draft'),
})


export const createCampaign = validatedActionWithUserAsync(
    createCampaignSchema,
    async (data, user) => {
        const userWithTeam = await getUserWithTeam(user.id)
        if (!userWithTeam?.team) {
            throw new Error('User does not belong to a team')
        }

        const [newCampaign] = await db
            .insert(campaigns)
            // @ts-ignore
            .values({
                name: data.name,
                status: data.status,
                teamId: userWithTeam.team.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()

        return newCampaign
    }
)

const updateCampaignStatusSchema = z.object({
    campaignId: z.number(),
    status: z.enum(['draft', 'active', 'completed']),
})

export const updateCampaignStatus = validatedActionWithUserAsync(
    updateCampaignStatusSchema,
    async (data, user) => {
        const userWithTeam = await getUserWithTeam(user.id)
        if (!userWithTeam?.team) throw new Error('User does not belong to a team')

        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, data.campaignId))
            .limit(1)

        if (!campaign) throw new Error('Campaign not found')
        if (campaign.teamId !== userWithTeam.team.id) throw new Error('Unauthorized')

        const [updated] = await db
            .update(campaigns)
            // @ts-ignore
            .set({ status: data.status, updatedAt: new Date() })
            .where(eq(campaigns.id, data.campaignId))
            .returning()

        return updated
    }
)