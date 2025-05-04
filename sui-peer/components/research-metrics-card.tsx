"use client"

import { useState } from "react"
import { BarChart, FileText, MessageSquare, TrendingUp, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ResearchMetricsCard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Welcome, Researcher</div>
          <div className="text-xl font-bold">Research Metrics Dashboard</div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400">
          <BarChart className="h-4 w-4" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Publications</div>
                  <div className="text-lg font-bold">24</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                  <div className="text-lg font-bold">42</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                  <div className="text-lg font-bold">87</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Citations</div>
                  <div className="text-lg font-bold">156</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="mb-2 text-sm font-medium">Publication Impact</div>
            <div className="h-32 w-full">
              <div className="flex h-full w-full items-end justify-between gap-1 pb-4">
                <div className="h-[40%] w-8 rounded-t-sm bg-purple-200 dark:bg-purple-900/50"></div>
                <div className="h-[60%] w-8 rounded-t-sm bg-purple-300 dark:bg-purple-800/50"></div>
                <div className="h-[80%] w-8 rounded-t-sm bg-purple-400 dark:bg-purple-700/50"></div>
                <div className="h-[70%] w-8 rounded-t-sm bg-purple-500 dark:bg-purple-600/50"></div>
                <div className="h-[90%] w-8 rounded-t-sm bg-purple-600 dark:bg-purple-500/50"></div>
                <div className="h-[75%] w-8 rounded-t-sm bg-purple-700 dark:bg-purple-400/50"></div>
                <div className="h-[85%] w-8 rounded-t-sm bg-purple-800 dark:bg-purple-300/50"></div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
              <div>Jun</div>
              <div>Jul</div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="publications" className="mt-4">
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Decentralized Consensus Mechanisms</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Published
                </span>
                <span>12 citations</span>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Zero-Knowledge Proofs for Privacy</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Under Review
                </span>
                <span>2 reviews</span>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Blockchain Scalability Solutions</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Draft
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Quantum-Resistant Cryptography</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Assigned
                </span>
                <span>Due in 5 days</span>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Cross-Chain Interoperability</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Completed
                </span>
                <span>2 days ago</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
