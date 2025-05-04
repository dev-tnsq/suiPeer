"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { Loader2, Upload } from "lucide-react"

export default function NewProposalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { connected } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    field: "",
    keywords: "",
    file: null as File | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to submit a proposal.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!formData.title || !formData.abstract || !formData.field || !formData.file) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload your paper.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Proposal Submitted",
        description: "Your research proposal has been submitted successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your proposal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Submit New Research</h1>
        <p className="mb-8 text-muted-foreground">Share your research with the SuiPeer community</p>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Research Details</CardTitle>
              <CardDescription>Provide information about your research paper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter the title of your research paper"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  name="abstract"
                  placeholder="Provide a brief summary of your research"
                  className="min-h-[150px]"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="field">Research Field *</Label>
                  <Select value={formData.field} onValueChange={(value) => handleSelectChange("field", value)}>
                    <SelectTrigger id="field">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="cryptography">Cryptography</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    placeholder="e.g., blockchain, consensus, cryptography"
                    value={formData.keywords}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Paper *</Label>
                <div className="flex items-center gap-4">
                  <Input id="file" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  <div
                    className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 ${
                      formData.file ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : ""
                    }`}
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    {formData.file ? (
                      <>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">{formData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF (max. 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Proposal"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
