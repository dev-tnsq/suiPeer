"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, MessageSquare, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for a single researcher
const researcherData = {
  id: "res-1",
  name: "Dr. Alice Johnson",
  institution: "Stanford University",
  field: "Blockchain",
  reputation: 92,
  publications: 15,
  reviews: 42,
  citations: 128,
  profileImage: "AJ",
  bio: "Dr. Alice Johnson is a leading researcher in blockchain technology and distributed systems. Her work focuses on consensus mechanisms, scalability solutions, and privacy-preserving protocols for blockchain networks.",
  education: [
    {
      degree: "Ph.D. in Computer Science",
      institution: "MIT",
      year: "2015",
    },
    {
      degree: "M.S. in Computer Science",
      institution: "Stanford University",
      year: "2011",
    },
    {
      degree: "B.S. in Computer Science",
      institution: "UC Berkeley",
      year: "2009",
    },
  ],
  recentPublications: [
    {
      id: "pub-1",
      title: "Decentralized Consensus Mechanisms in Blockchain Networks",
      date: "2023-12-15",
      status: "Published",
      citations: 12,
    },
    {
      id: "pub-2",
      title: "Privacy-Preserving Smart Contracts: A Comprehensive Survey",
      date: "2023-08-22",
      status: "Published",
      citations: 8,
    },
    {
      id: "pub-3",
      title: "Scalability Solutions for Next-Generation Blockchain Platforms",
      date: "2024-02-10",
      status: "Under Review",
      citations: 0,
    },
  ],
}

export default function ResearcherProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  // In a real app, we would fetch the researcher data based on the ID
  const researcher = researcherData

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/researchers" className="text-sm text-muted-foreground hover:underline">
          ← Back to Researchers
        </Link>
        <div className="mt-6 flex flex-col items-start gap-6 md:flex-row">
          <Avatar className="h-24 w-24 border">
            <AvatarFallback className="text-2xl bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {researcher.profileImage}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{researcher.name}</h1>
            <p className="text-lg text-muted-foreground">{researcher.institution}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{researcher.field}</Badge>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                <span className="font-medium">{researcher.reputation}</span>
                <span className="text-sm text-muted-foreground">Reputation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publications</CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{researcher.publications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{researcher.reviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citations</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{researcher.citations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{researcher.reputation}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{researcher.bio}</p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {researcher.education.map((edu, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <Badge variant="outline">{edu.year}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Publications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {researcher.recentPublications.map((pub) => (
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
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {pub.status}
                        </span>
                        <span>Published on {pub.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{pub.citations} citations</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/proposals/${pub.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="publications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Publications</CardTitle>
              <CardDescription>Complete list of research papers by {researcher.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Publications list would go here */}
                <p className="text-center text-muted-foreground">Detailed publications view will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Papers reviewed by {researcher.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Reviews list would go here */}
                <p className="text-center text-muted-foreground">Detailed reviews view will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
