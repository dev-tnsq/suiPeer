"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Calendar, FileText, FilePlus, MessageSquare, Search, Star, User, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { fetchPapers, Paper } from "@/services/blockchain-service"
import { RESEARCH_DOMAINS } from "@/utils/zk-utils"

export default function ProposalsPage() {
  const { connected } = useWallet()
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fieldFilter, setFieldFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Paper[]>([])

  // Fetch papers from blockchain
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch all papers
        const papers = await fetchPapers()
        setProposals(papers)
      } catch (error) {
        console.error("Error fetching papers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch papers from the blockchain.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  // Filter proposals based on search query and filters
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.abstract.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || proposal.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesField = fieldFilter === "all" || proposal.field.toLowerCase() === fieldFilter.toLowerCase()

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "published" && proposal.status === "Published") ||
      (activeTab === "under-review" && proposal.status === "Under Review")

    return matchesSearch && matchesStatus && matchesField && matchesTab
  })

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
        <p className="text-lg text-muted-foreground">Loading research papers...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Proposals</h1>
          <p className="text-muted-foreground">Browse and discover research papers from the community</p>
        </div>
        <Button asChild className="bg-teal-500 hover:bg-teal-600">
          <Link href="/proposals/new">
            <FilePlus className="mr-2 h-4 w-4" />
            Submit New Proposal
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Find research proposals by title, status, or field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or keywords..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="under review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {RESEARCH_DOMAINS.map((domain, index) => (
                  <SelectItem key={index} value={domain.toLowerCase()}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="under-review">Under Review</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No proposals found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="published" className="mt-6">
          <div className="space-y-4">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No published proposals found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="under-review" className="mt-6">
          <div className="space-y-4">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No proposals under review found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProposalCard({ proposal }: { proposal: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge className={proposal.status === "Published" ? "bg-green-500" : "bg-yellow-500"}>
                {proposal.status}
              </Badge>
              <Badge variant="outline">{proposal.field}</Badge>
            </div>
            <Link href={`/proposals/${proposal.id}`} className="text-xl font-semibold hover:underline">
              {proposal.title}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{proposal.abstract}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{proposal.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{proposal.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{proposal.reviews} reviews</span>
              </div>
              {proposal.status === "Published" && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{proposal.citations} citations</span>
                </div>
              )}
              {proposal.score > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{proposal.score.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/proposals/${proposal.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
