import { NextResponse } from 'next/server'
import { getCampaignsByUserTeam } from '@/lib/db/queries'

export async function GET() {
    try {
        const campaigns = await getCampaignsByUserTeam()
        return NextResponse.json({ campaigns })
    } catch (error) {
        console.error('API error:', error)
        if (error instanceof Error && error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}