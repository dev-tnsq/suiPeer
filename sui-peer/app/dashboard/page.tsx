"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, BookOpen, FileText, FilePlus, MessageSquare, Star, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { connected } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const userStats = {
    reputation: 78,
    publications: 5,
    reviews: 12,
    citations: 34,
  }

  const recentPublications = [
    {
      id: "pub-1",
      title: "Decentralized Consensus Mechanisms in Blockchain Networks",
      status: "Published",
      date: "2023-12-15",
      reviews: 4,
      score: 8.5,
    },
    {
      id: "pub-2",
      title: "Zero-Knowledge Proofs for Privacy-Preserving Authentication",
      status: "Under Review",
      date: "2024-02-20",
      reviews: 2,
      score: 7.0,
    },
    {
      id: "pub-3",
      title: "Scalability Solutions for Next-Generation Blockchain Platforms",
      status: "Draft",
      date: "2024-04-01",
      reviews: 0,
      score: 0,
    },
  ]

  const pendingReviews = [
    {
      id: "rev-1",
      title: "Quantum-Resistant Cryptographic Algorithms for Blockchain",
      author: "Anonymous",
      deadline: "2024-05-15",
    },
    {
      id: "rev-2",
      title: "Cross-Chain Interoperability Protocols: A Comparative Analysis",
      author: "Anonymous",
      deadline: "2024-05-20",
    },
  ]

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
            <div className="text-2xl font-bold">{userStats.reputation}</div>
            <Progress value={userStats.reputation} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publications</CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.publications}</div>
            <p className="mt-2 text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.reviews}</div>
            <p className="mt-2 text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citations</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.citations}</div>
            <p className="mt-2 text-xs text-muted-foreground">+8 from last month</p>
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
                  {recentPublications.map((pub) => (
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
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/proposals">View All Publications</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Research papers assigned to you for review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex flex-col justify-between rounded-lg border p-4 md:flex-row md:items-center"
                    >
                      <div className="mb-2 md:mb-0">
                        <Link href={`/reviews/${review.id}`} className="font-medium hover:underline">
                          {review.title}
                        </Link>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span>Author: {review.author}</span>
                          <span className="mx-2">•</span>
                          <span>Deadline: {review.deadline}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/reviews/${review.id}`}>Review</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/reviews">View All Reviews</Link>
                </Button>
              </CardFooter>
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
