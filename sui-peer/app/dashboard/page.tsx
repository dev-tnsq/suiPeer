"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, BookOpen, FileText, FilePlus, MessageSquare, Star, TrendingUp, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { fetchPapers, fetchResearcherProfile, Paper, Researcher } from "@/services/blockchain-service"

export default function DashboardPage() {
  const { connected } = useWallet()
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<Researcher | null>(null)
  const [recentPublications, setRecentPublications] = useState<Paper[]>([])
  const [pendingReviews, setPendingReviews] = useState<any[]>([])

  // Fetch user data from blockchain
  useEffect(() => {
    async function fetchData() {
      if (connected && currentAccount) {
        try {
          setLoading(true)
          
          // Fetch researcher profile
          const researcher = await fetchResearcherProfile(currentAccount.address)
          setUserStats(researcher)
          
          // Fetch papers
          const papers = await fetchPapers(currentAccount.address)
          setRecentPublications(papers)
          
          // For pending reviews, we would fetch from blockchain
          // For now, using mock data
          setPendingReviews([
            {
              id: "0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef",
              title: "Quantum-Resistant Cryptographic Algorithms for Blockchain",
              author: "Anonymous",
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            {
              id: "0x7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcdef",
              title: "Cross-Chain Interoperability Protocols: A Comparative Analysis",
              author: "Anonymous",
              deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          ])
        } catch (error) {
          console.error("Error fetching blockchain data:", error)
          toast({
            title: "Error",
            description: "Failed to fetch your data from the blockchain.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [connected, currentAccount, toast])

  const handleNewPublication = () => {
    if (!connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to submit a new publication.",
        variant: "destructive",
      })
      return
    }

    // Navigate to new publication page
    window.location.href = "/proposals/new"
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
        <p className="text-lg text-muted-foreground">Loading your dashboard data...</p>
      </div>
    )
  }

  // Show message if not connected
  if (!connected) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Connect your wallet to view your research dashboard</p>
        </div>
        
        <div className="bg-muted p-8 rounded-lg text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-4">
            Please connect your wallet to access your research dashboard, manage publications, and submit reviews.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your research publications and reviews</p>
        </div>
        <Button onClick={handleNewPublication} className="bg-teal-500 hover:bg-teal-600">
          <FilePlus className="mr-2 h-4 w-4" />
          New Publication
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.reputation || 0}</div>
            <Progress value={userStats?.reputation || 0} max={100} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              On-chain reputation score from the SUI blockchain
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publications</CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.publications || 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Research papers published on-chain
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.reviews || 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Peer reviews submitted on-chain
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citations</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.citations || 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Times your papers have been cited
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Publications</CardTitle>
                <CardDescription>Your recently submitted research papers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPublications.length > 0 ? (
                    recentPublications.map((pub) => (
                      <div
                        key={pub.id}
                        className="flex flex-col justify-between rounded-lg border p-4 md:flex-row md:items-center"
                      >
                        <div className="mb-2 md:mb-0">
                          <Link href={`/proposals/${pub.id}`} className="font-medium hover:underline">
                            {pub.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                pub.status === "Published"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : pub.status === "Under Review"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {pub.status}
                            </span>
                            <span>Submitted on {pub.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{pub.reviews}</span>
                          </div>
                          {pub.score > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{pub.score}</span>
                            </div>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/proposals/${pub.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No publications yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't submitted any research papers yet. Click the "New Publication" button to get started.
                      </p>
                      <Button className="mt-4 bg-teal-500 hover:bg-teal-600" onClick={handleNewPublication}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Submit Your First Paper
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              {recentPublications.length > 0 && (
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/proposals">View All Publications</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Research papers assigned to you for review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReviews.length > 0 ? (
                    pendingReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex flex-col justify-between rounded-lg border p-4 md:flex-row md:items-center"
                      >
                        <div className="mb-2 md:mb-0">
                          <Link href={`/proposals/${review.id}`} className="font-medium hover:underline">
                            {review.title}
                          </Link>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <span>Author: {review.author}</span>
                            <span className="mx-2">•</span>
                            <span>Deadline: {review.deadline}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/proposals/${review.id}`}>Review</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No pending reviews</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't have any papers assigned for review at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              {pendingReviews.length > 0 && (
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/proposals">Browse Papers to Review</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="publications">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Publications</CardTitle>
                <CardDescription>Manage and track all your research publications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Publications list would go here */}
                  <p className="text-center text-muted-foreground">
                    Detailed publications view will be implemented here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Reviews</CardTitle>
                <CardDescription>Track your contributions as a reviewer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Reviews list would go here */}
                  <p className="text-center text-muted-foreground">Detailed reviews view will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Insights about your research impact</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-2 text-center text-muted-foreground">Analytics dashboard will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
