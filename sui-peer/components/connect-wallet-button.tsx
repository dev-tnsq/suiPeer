"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"

export function ConnectWalletButton() {
  const [connected, setConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const handleConnect = async () => {
    if (connected) {
      setConnected(false)
      setAddress(null)
      return
    }

    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 10) + "..."
      setAddress(mockAddress)
      setConnected(true)
      setIsConnecting(false)
    }, 1500)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2"
    >
      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      <span>{connected ? address : "Connect Wallet"}</span>
    </Button>
  )
}
