import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
})

export function useCampaigns() {
    const { data, error, isLoading } = useSWR('/api/team/campaigns', fetcher)

    return {
        campaigns: data?.campaigns,
        isLoading,
        error,
    }
}