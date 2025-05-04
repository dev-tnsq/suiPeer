"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, FileText, MessageSquare, Search, TrendingUp, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for researchers
const researchers = [
  {
    id: "res-1",
    name: "Dr. Alice Johnson",
    institution: "Stanford University",
    field: "Blockchain",
    reputation: 92,
    publications: 15,
    reviews: 42,
    citations: 128,
    profileImage: "AJ",
  },
  {
    id: "res-2",
    name: "Prof. Robert Chen",
    institution: "MIT",
    field: "Cryptography",
    reputation: 88,
    publications: 23,
    reviews: 67,
    citations: 215,
    profileImage: "RC",
  },
  {
    id: "res-3",
    name: "Dr. Sarah Williams",
    institution: "UC Berkeley",
    field: "Computer Science",
    reputation: 85,
    publications: 18,
    reviews: 51,
    citations: 176,
    profileImage: "SW",
  },
  {
    id: "res-4",
    name: "Prof. Michael Brown",
    institution: "ETH Zurich",
    field: "Blockchain",
    reputation: 90,
    publications: 27,
    reviews: 73,
    citations: 243,
    profileImage: "MB",
  },
  {
    id: "res-5",
    name: "Dr. Emily Davis",
    institution: "University of Oxford",
    field: "Economics",
    reputation: 82,
    publications: 12,
    reviews: 38,
    citations: 95,
    profileImage: "ED",
  },
  {
    id: "res-6",
    name: "Prof. David Wilson",
    institution: "Carnegie Mellon University",
    field: "Computer Science",
    reputation: 87,
    publications: 20,
    reviews: 59,
    citations: 187,
    profileImage: "DW",
  },
]

export default function ResearchersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldFilter, setFieldFilter] = useState("all")

  // Filter researchers based on search query and filters
  const filteredResearchers = researchers.filter((researcher) => {
    const matchesSearch =
      researcher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      researcher.institution.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesField = fieldFilter === "all" || researcher.field.toLowerCase() === fieldFilter.toLowerCase()

    return matchesSearch && matchesField
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Researchers</h1>
        <p className="text-muted-foreground">Discover and connect with researchers in the SuiPeer community</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Find researchers by name, institution, or field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or institution..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="cryptography">Cryptography</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="economics">Economics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResearchers.map((researcher) => (
          <ResearcherCard key={researcher.id} researcher={researcher} />
        ))}
      </div>

      {filteredResearchers.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No researchers found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

function ResearcherCard({ researcher }: { researcher: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {researcher.profileImage}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link href={`/researchers/${researcher.id}`} className="text-xl font-semibold hover:underline">
              {researcher.name}
            </Link>
            <p className="text-sm text-muted-foreground">{researcher.institution}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{researcher.field}</Badge>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                <span>{researcher.reputation}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md bg-muted p-2">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{researcher.publications}</span>
                </div>
                <p className="text-xs text-muted-foreground">Publications</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <div className="flex items-center justify-center gap-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{researcher.reviews}</span>
                </div>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{researcher.citations}</span>
                </div>
                <p className="text-xs text-muted-foreground">Citations</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
