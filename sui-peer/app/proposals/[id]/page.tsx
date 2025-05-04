"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"

// Mock data for a single proposal
const proposalData = {
  id: "prop-1",
  title: "Decentralized Consensus Mechanisms in Blockchain Networks",
  abstract:
    "This paper explores various consensus mechanisms used in blockchain networks, comparing their efficiency, security, and scalability characteristics. We analyze Proof of Work, Proof of Stake, Delegated Proof of Stake, and other novel consensus algorithms, providing a comprehensive evaluation framework for blockchain architects and researchers.",
  content: `
    <h2>Introduction</h2>
    <p>Blockchain technology has revolutionized the way we think about distributed systems and trust. At the core of every blockchain network is a consensus mechanism that enables participants to agree on the state of the ledger without requiring trust in a central authority.</p>
    
    <h2>Background</h2>
    <p>The first and most well-known consensus mechanism is Proof of Work (PoW), introduced by Bitcoin. While PoW has proven to be secure and resistant to attacks, it has significant drawbacks in terms of energy consumption and scalability.</p>
    
    <h2>Methodology</h2>
    <p>In this paper, we evaluate different consensus mechanisms based on the following criteria:</p>
    <ul>
      <li>Security: Resistance to various attack vectors</li>
      <li>Decentralization: Distribution of power among participants</li>
      <li>Scalability: Transaction throughput and latency</li>
      <li>Energy efficiency: Resource consumption</li>
    </ul>
    
    <h2>Results</h2>
    <p>Our analysis shows that while PoW provides strong security guarantees, it struggles with scalability and energy efficiency. Proof of Stake (PoS) mechanisms offer improved energy efficiency and scalability but may introduce new security challenges and centralization risks.</p>
    
    <h2>Conclusion</h2>
    <p>No single consensus mechanism is superior across all evaluation criteria. The choice of consensus mechanism should be guided by the specific requirements and constraints of the blockchain application. Future research should focus on hybrid approaches that combine the strengths of different consensus mechanisms.</p>
  `,
  author: "Anonymous",
  date: "2023-12-15",
  status: "Published",
  reviews: [
    {
      id: "rev-1",
      reviewer: "Anonymous Reviewer #1",
      date: "2023-11-20",
      content:
        "This paper provides a comprehensive analysis of consensus mechanisms. The methodology is sound, and the results are well-presented. I recommend acceptance with minor revisions.",
      rating: 9,
      vote: "positive",
    },
    {
      id: "rev-2",
      reviewer: "Anonymous Reviewer #2",
      date: "2023-11-25",
      content:
        "The paper makes a valuable contribution to the field. However, I would suggest expanding the discussion on hybrid consensus mechanisms. Overall, a strong paper that deserves publication.",
      rating: 8,
      vote: "positive",
    },
    {
      id: "rev-3",
      reviewer: "Anonymous Reviewer #3",
      date: "2023-12-01",
      content:
        "While the paper covers important aspects of consensus mechanisms, I believe the security analysis could be more rigorous. The authors should address potential attack vectors in more detail.",
      rating: 7,
      vote: "positive",
    },
    {
      id: "rev-4",
      reviewer: "Anonymous Reviewer #4",
      date: "2023-12-05",
      content:
        "The paper presents a well-structured comparison of consensus mechanisms. The evaluation framework is particularly useful for future research in this area.",
      rating: 9,
      vote: "positive",
    },
  ],
  field: "Blockchain",
  citations: 12,
  score: 8.5,
  downloads: 156,
  views: 1243,
}

export default function ProposalDetailPage() {
  const params = useParams()
  const { connected } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In a real app, we would fetch the proposal data based on the ID
  const proposal = proposalData

  const handleDownload = () => {
    if (!connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to download this paper.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Download Started",
      description: "Your download is starting...",
    })

    // In a real app, this would trigger an actual download
  }

  const handleShare = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)

    toast({
      title: "Link Copied",
      description: "Paper link copied to clipboard",
    })
  }

  const handleVote = (type: "up" | "down") => {
    if (!connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to vote on this paper.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Vote Recorded",
      description: `You ${type === "up" ? "upvoted" : "downvoted"} this paper.`,
    })
  }

  const handleSubmitComment = () => {
    if (!connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to comment on this paper.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setNewComment("")

      toast({
        title: "Comment Submitted",
        description: "Your comment has been submitted successfully.",
      })
    }, 1500)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/proposals" className="text-sm text-muted-foreground hover:underline">
            ← Back to Proposals
          </Link>
          <Badge className={proposal.status === "Published" ? "bg-green-500" : "bg-yellow-500"}>
            {proposal.status}
          </Badge>
          <Badge variant="outline">{proposal.field}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{proposal.title}</h1>
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
            <span>{proposal.reviews.length} reviews</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{proposal.citations} citations</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{proposal.score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Paper
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleVote("up")}
            className="text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleVote("down")}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="paper">Full Paper</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({proposal.reviews.length})</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{proposal.abstract}</p>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{proposal.score.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-teal-500" />
                  <span className="text-2xl font-bold">{proposal.downloads}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                  <span className="text-2xl font-bold">{proposal.views}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest feedback from peer reviewers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{review.reviewer}</div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            review.vote === "positive"
                              ? "border-green-500 text-green-500"
                              : "border-red-500 text-red-500"
                          }
                        >
                          {review.vote === "positive" ? "Positive" : "Negative"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{review.rating}/10</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{review.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("reviews")}>
                View All Reviews
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="paper" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
              <CardDescription>
                Published on {proposal.date} • {proposal.field}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: proposal.content }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Peer Reviews</CardTitle>
              <CardDescription>Feedback from qualified reviewers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {proposal.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{review.reviewer}</div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            review.vote === "positive"
                              ? "border-green-500 text-green-500"
                              : "border-red-500 text-red-500"
                          }
                        >
                          {review.vote === "positive" ? "Positive" : "Negative"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{review.rating}/10</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{review.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>Join the conversation about this research</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Textarea
                  placeholder="Add your comment..."
                  className="min-h-[100px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Comment"}
                  </Button>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">2024-04-10</div>
                  </div>
                  <p className="text-muted-foreground">
                    This paper provides valuable insights into consensus mechanisms. I particularly appreciated the
                    comparison between PoW and PoS systems.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Jane Smith</div>
                    <div className="text-xs text-muted-foreground">2024-04-08</div>
                  </div>
                  <p className="text-muted-foreground">
                    I would be interested to see how these findings apply to newer consensus mechanisms like Avalanche
                    or Solana's Proof of History.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
