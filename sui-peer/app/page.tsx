import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, FileText, Users, Shield, Award, Lock, Wallet, Star } from "lucide-react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { FeatureCard } from "@/components/feature-card"
import { StatCard } from "@/components/stat-card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative size-8 overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center text-white">SP</div>
              </div>
              <span className="text-xl font-bold">SuiPeer</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Testimonials
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <ConnectWalletButton />
            </div>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-teal-950/20"></div>
          <div className="container relative">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                    Powered by Sui Blockchain
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
                    The Decentralized Research OS
                    <span className="block bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">for Web3 Teams</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl">
                    Research built for the future. Meet the fastest, most secure, and compliant platform to manage your
                    team's research and digital assets on Sui blockchain.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                    <Link href="/register">Sign up for early access</Link>
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -left-20 top-10">
                  <div className="h-16 w-16 rounded-lg bg-blue-500 bg-opacity-80 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M16 2L2 9l14 7 14-7-14-7z"></path>
                      <path d="M2 23l14 7 14-7"></path>
                      <path d="M2 16l14 7 14-7"></path>
                    </svg>
                  </div>
                </div>
                <div className="absolute -right-10 top-40">
                  <div className="h-16 w-16 rounded-lg bg-teal-500 bg-opacity-80 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <circle cx="16" cy="16" r="14"></circle>
                      <path d="M16 8v8l4 4"></path>
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-20">
                  <div className="h-16 w-16 rounded-lg bg-orange-500 bg-opacity-80 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M16 16v14"></path>
                      <path d="M16 16L8.5 8.5"></path>
                      <path d="M16 16l7.5-7.5"></path>
                      <circle cx="16" cy="16" r="14"></circle>
                    </svg>
                  </div>
                </div>
                <div className="relative w-full max-w-[500px]">
                  <Image
                    src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                    alt="SuiPeer Dashboard"
                    width={800}
                    height={600}
                    className="w-full rounded-lg shadow-2xl border border-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/50 py-12">
          <div className="container">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard value="1,200+" label="Researchers" />
              <StatCard value="3,500+" label="Publications" />
              <StatCard value="12,000+" label="Reviews" />
              <StatCard value="500,000+" label="SUI Tokens Distributed" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Powerful features to revolutionize academic research
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                SuiPeer combines Sui blockchain technology with academic rigor to create a new paradigm for research
                publication and peer review.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Anonymous Publishing"
                description="Publish research anonymously while maintaining verifiable credentials through zero-knowledge proofs on Sui blockchain."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Qualified Reviewers"
                description="Ensure quality with verified reviewers who have domain expertise and proven credentials with on-chain verification."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="Reputation System"
                description="Build reputation through quality publications and thoughtful reviews, all tracked immutably on the Sui blockchain."
              />
              <FeatureCard
                icon={<Wallet className="h-6 w-6" />}
                title="Sui Wallet Integration"
                description="Seamlessly connect your Sui wallet to interact with the platform, earn SUI tokens, and track your research impact."
              />
              <FeatureCard
                icon={<Award className="h-6 w-6" />}
                title="SUI Token Rewards"
                description="Earn SUI tokens for quality publications and helpful peer reviews through our blockchain-based incentive system."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6" />}
                title="Move Smart Contracts"
                description="All publications and reviews utilize Sui's Move smart contracts for maximum security and transparency."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-y bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4">How It Works</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Reimagining the research process on Sui
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Our Sui blockchain-based platform ensures anonymity, quality, and transparency throughout the research
                lifecycle.
              </p>
            </div>

            <div className="relative mx-auto mt-20 max-w-5xl">
              {/* Timeline connector */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-teal-500 to-blue-600 md:left-1/2 md:-ml-0.5"></div>

              {/* Step 1 */}
              <div className="relative mb-16 md:mb-0">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex w-full flex-col md:w-1/2 md:pr-8 md:text-right">
                    <div className="mb-2 text-2xl font-bold">1. Researcher Verification</div>
                    <p className="text-muted-foreground">
                      Submit your academic credentials privately through our zero-knowledge circuit on Sui, which validates
                      them and generates a secure ID proof without revealing your identity.
                    </p>
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white md:absolute md:left-1/2 md:-ml-4">
                    1
                  </div>
                  <div className="hidden w-1/2 pl-8 md:block"></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative mb-16 md:mb-0 md:mt-24">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="hidden w-1/2 pr-8 md:block"></div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white md:absolute md:left-1/2 md:-ml-4">
                    2
                  </div>
                  <div className="flex w-full flex-col md:w-1/2 md:pl-8">
                    <div className="mb-2 text-2xl font-bold">2. Paper Submission</div>
                    <p className="text-muted-foreground">
                      Submit your research paper along with your ID proof. Our system validates both and generates a
                      publication proof and unique publication ID on the Sui blockchain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative mb-16 md:mb-0 md:mt-24">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex w-full flex-col md:w-1/2 md:pr-8 md:text-right">
                    <div className="mb-2 text-2xl font-bold">3. Peer Review</div>
                    <p className="text-muted-foreground">
                      Qualified reviewers with verified credentials anonymously review papers and vote on publication.
                      Each review is validated through a ZK circuit on Sui to ensure reviewer qualification.
                    </p>
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white md:absolute md:left-1/2 md:-ml-4">
                    3
                  </div>
                  <div className="hidden w-1/2 pl-8 md:block"></div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative md:mt-24">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="hidden w-1/2 pr-8 md:block"></div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white md:absolute md:left-1/2 md:-ml-4">
                    4
                  </div>
                  <div className="flex w-full flex-col md:w-1/2 md:pl-8">
                    <div className="mb-2 text-2xl font-bold">4. Publication & Rewards</div>
                    <p className="text-muted-foreground">
                      Papers with sufficient positive reviews are published on-chain as NFTs. Researchers and reviewers earn
                      SUI tokens and reputation points, with citations further increasing researcher reputation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4">Platform Preview</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Experience the future of academic research
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Our intuitive platform makes it easy to publish, review, and discover groundbreaking research on Sui blockchain.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Researcher Dashboard</h3>
                    <p className="text-muted-foreground">
                      Track your publications, reviews, and SUI token rewards all in one place.
                    </p>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                      alt="Dashboard Preview"
                      width={600}
                      height={400}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Publication Process</h3>
                    <p className="text-muted-foreground">
                      Submit your research with ease and track its progress through the Sui-powered review process.
                    </p>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop"
                      alt="Publication Process Preview"
                      width={600}
                      height={400}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Review Interface</h3>
                    <p className="text-muted-foreground">
                      Provide thoughtful reviews and earn SUI tokens and reputation points.
                    </p>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1661956602153-23384936a1d3?q=80&w=2070&auto=format&fit=crop"
                      alt="Review Interface Preview"
                      width={600}
                      height={400}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-gradient-to-b from-black to-gray-900">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                What Our Researchers Say About Us
              </h2>
              <p className="mt-4 text-xl text-gray-400">
                Hear from researchers who have transformed their academic publishing experience with SuiPeer.
              </p>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/50 text-white">
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </Button>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/50 text-white">
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="relative rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-xl">
                  <div className="mb-4 text-2xl font-bold text-teal-500">"</div>
                  <p className="mb-6 text-gray-300">
                    SuiPeer has revolutionized how I publish my research. The anonymous review process ensures fair
                    evaluation while the Sui blockchain verification adds a layer of trust I've never experienced before. The SUI token rewards make it even more worthwhile.
                  </p>
                  <div className="mb-2 flex">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=987&auto=format&fit=crop"
                        alt="Researcher"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">Dr. Sarah Chen</p>
                      <p className="text-sm text-gray-400">Stanford University</p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-xl">
                  <div className="mb-4 text-2xl font-bold text-teal-500">"</div>
                  <p className="mb-6 text-gray-300">
                    As a reviewer, I appreciate the ability to provide honest feedback without bias. The reputation
                    system on Sui blockchain incentivizes quality reviews and has improved the overall standard of published research.
                  </p>
                  <div className="mb-2 flex">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=987&auto=format&fit=crop"
                        alt="Researcher"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">Prof. Michael Rodriguez</p>
                      <p className="text-sm text-gray-400">MIT</p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-xl">
                  <div className="mb-4 text-2xl font-bold text-teal-500">"</div>
                  <p className="mb-6 text-gray-300">
                    The integration with Sui blockchain ensures that my research is immutably recorded and properly
                    attributed. The SUI token rewards system is an added bonus that recognizes the value of our contributions to science.
                  </p>
                  <div className="mb-2 flex">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=988&auto=format&fit=crop"
                        alt="Researcher"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">Dr. Emily Johnson</p>
                      <p className="text-sm text-gray-400">ETH Zurich</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-2">
                <div className="h-2 w-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600"></div>
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Blockchain Benefits Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4">Sui Blockchain Benefits</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Why Sui is the perfect blockchain for academic research
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Sui blockchain provides the ideal foundation for a new academic publishing paradigm.
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-2">
              <div className="relative">
                <div className="sticky top-24">
                  <Image
                    src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1932&auto=format&fit=crop"
                    alt="Sui Blockchain"
                    width={800}
                    height={600}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <FileText className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">Move Smart Contracts</h3>
                  <p className="mt-2 text-muted-foreground">
                    Sui's object-centric model and Move programming language enable secure, composable smart contracts that are perfect for tracking research ownership and reputation.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <Lock className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">Low-latency Finality</h3>
                  <p className="mt-2 text-muted-foreground">
                    Sui's horizontal scaling and parallel execution enable immediate research publication confirmation and rapid peer review processes.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <Users className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">On-chain Identity</h3>
                  <p className="mt-2 text-muted-foreground">
                    Sui's robust on-chain identity primitives enable researchers to build verifiable credentials while maintaining privacy through zero-knowledge proofs.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <Wallet className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">Native Token Incentives</h3>
                  <p className="mt-2 text-muted-foreground">
                    SUI tokens provide a natural incentive mechanism for rewarding quality research contributions and thoughtful peer reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-gradient-to-r from-teal-600 to-blue-600 py-20 text-white">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to transform academic research with Sui blockchain?
              </h2>
              <p className="mt-6 text-xl text-white/90">
                Join SuiPeer today and be part of the future of decentralized academic publishing.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="bg-white text-teal-600 hover:bg-white/90" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="relative size-8 overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-blue-600">
                  <div className="absolute inset-0 flex items-center justify-center text-white">SP</div>
                </div>
                <span className="text-xl font-bold">SuiPeer</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Revolutionizing academic research through Sui blockchain technology and zero-knowledge proofs.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Ecosystem</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/documentation" className="text-sm text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="https://sui.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    Sui Blockchain
                  </Link>
                </li>
                <li>
                  <Link href="https://docs.sui.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    Sui Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="https://github.com/sui-foundation" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="https://discord.gg/sui" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="https://twitter.com/SuiNetwork" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="https://forum.sui.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                    Sui Forum
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SuiPeer. Built on Sui blockchain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
