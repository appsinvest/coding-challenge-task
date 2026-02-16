'use client';

import { Button } from '@/components/ui/button';

import { useState} from 'react';
import {useSWRConfig} from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle } from 'lucide-react';

import { useCampaigns } from '@/hooks/useCampaigns'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { InferSelectModel } from 'drizzle-orm'
import { campaigns } from '@/lib/db/schema'
import {createCampaign, updateCampaignStatus} from "@/app/(dashboard)/dashboard/campaign/actions";

type Campaign = InferSelectModel<typeof campaigns>

type CampaignStatus = Campaign['status']

const statusOptions: CampaignStatus[] = ['draft', 'active', 'completed']

type ActionState = {
  error?: string;
  success?: string;
};

function CampaignsSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Campaigns</CardTitle>
      </CardHeader>
    </Card>
  );
}

function CampaignSection() {
    const { campaigns, isLoading, error } = useCampaigns()
    const { mutate } = useSWRConfig()
    const { toast } = useToast()

    const [newCampaignName, setNewCampaignName] = useState('')
    const [newCampaignStatus, setNewCampaignStatus] = useState<CampaignStatus>('draft')
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCampaignName.trim()) return

        setIsCreating(true)
        try {
            const result = await createCampaign({
                name: newCampaignName,
                status: newCampaignStatus,
            })

            if (!result.success) {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to create campaign',
                    variant: 'destructive',
                })
            } else {
                toast({ title: 'Campaign created successfully' })
                setNewCampaignName('')
                setNewCampaignStatus('draft')
                mutate('/api/team/campaigns')
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleStatusChange = async (campaignId: number, newStatus: CampaignStatus) => {
        try {
            const result = await updateCampaignStatus({
                campaignId,
                status: newStatus,
            })

            if (!result.success) {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update status',
                    variant: 'destructive',
                })
            } else {
                toast({ title: 'Status updated' })
                mutate('/api/team/campaigns')
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
            })
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>Loading your campaigns...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-24 flex items-center justify-center">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>Error loading campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">Failed to load campaigns. Please try again.</p>
                </CardContent>
            </Card>
        )
    }

    const hasCampaigns = campaigns && campaigns.length > 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Manage your team's marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateCampaign} className="mb-6 flex flex-wrap gap-2">
                    <Input
                        placeholder="Campaign name"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        disabled={isCreating}
                        required
                        className="max-w-md h-9"
                    />
                    <Select
                        value={newCampaignStatus}
                        onValueChange={(value) => setNewCampaignStatus(value as CampaignStatus)}
                        disabled={isCreating}
                    >
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white h-9"
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Campaign
                            </>
                        )}
                    </Button>


                </form>

                {hasCampaigns ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign: Campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={campaign.status}
                                            onValueChange={(value) => handleStatusChange(campaign.id, value as CampaignStatus)}
                                        >
                                            <SelectTrigger className="w-[130px] h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 border rounded-md bg-muted/10">
                        <p className="text-muted-foreground">No campaigns yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create your first campaign using the form above.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function CampaignsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Campaigns</h1>
        <Suspense fallback={<CampaignsSkeleton />}>
            <CampaignSection />
        </Suspense>
    </section>
  );
}
