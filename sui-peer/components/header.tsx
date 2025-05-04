"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/proposals", label: "Proposals" },
    { href: "/researchers", label: "Researchers" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center md:mr-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative size-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
              <div className="absolute inset-0 flex items-center justify-center text-white">SP</div>
            </div>
            <span className="text-xl font-bold text-teal-500">SuiPeer</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              {routes.map((route) => (
                <NavigationMenuItem key={route.href}>
                  <Link href={route.href} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} active={pathname === route.href}>
                      {route.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-teal-500 to-emerald-600 p-6 no-underline outline-none focus:shadow-md"
                          href="/documentation"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium text-white">Documentation</div>
                          <p className="text-sm leading-tight text-white/90">
                            Learn how to use SuiPeer and contribute to the decentralized research ecosystem.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/guides/researchers"
                        >
                          <div className="text-sm font-medium leading-none">Researcher Guide</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            How to publish and monetize your research using SuiPeer.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/guides/reviewers"
                        >
                          <div className="text-sm font-medium leading-none">Reviewer Guide</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Participate in peer reviews and earn SUI tokens for your expertise.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/blockchain-integration"
                        >
                          <div className="text-sm font-medium leading-none">Sui Blockchain Integration</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Understanding how SuiPeer utilizes the Sui blockchain for research verification.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/dashboard" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/proposals"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/proposals" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Proposals
                </Link>
                <Link
                  href="/researchers"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/researchers" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Researchers
                </Link>
                <Link
                  href="/documentation"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/documentation" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Documentation
                </Link>
                <Link
                  href="/guides/researchers"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/guides/researchers" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Researcher Guide
                </Link>
                <Link
                  href="/guides/reviewers"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/guides/reviewers" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Reviewer Guide
                </Link>
                <Link
                  href="/blockchain-integration"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-teal-500",
                    pathname === "/blockchain-integration" ? "text-teal-500" : "text-foreground",
                  )}
                >
                  Blockchain Integration
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-4">
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ConnectWalletButton />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
