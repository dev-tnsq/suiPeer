"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

type WalletContextType = {
  connected: boolean
  address: string | null
  balance: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Check if wallet was previously connected
  useEffect(() => {
    const savedWalletState = localStorage.getItem("walletConnected")
    if (savedWalletState === "true") {
      // Try to reconnect
      connect()
    }
  }, [])

  // Mock function to simulate wallet connection
  const connect = async () => {
    setIsConnecting(true)

    try {
      // Simulate API call to connect wallet
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful connection
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 12) + "..."
      const mockBalance = (Math.random() * 100).toFixed(2) + " SUI"

      setAddress(mockAddress)
      setBalance(mockBalance)
      setConnected(true)

      // Save connection state
      localStorage.setItem("walletConnected", "true")

      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAddress}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance(null)
    setConnected(false)
    localStorage.removeItem("walletConnected")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        balance,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
