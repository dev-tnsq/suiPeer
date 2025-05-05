"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  useCurrentAccount, 
  useDisconnectWallet,
  useSuiClientQuery,
} from "@mysten/dapp-kit"

type WalletContextType = {
  connected: boolean
  address: string | null
  balance: string | null
  disconnect: () => void
  isConnecting: boolean
}
function formatAmount(amount: string | number | bigint): string {
  const n = typeof amount === 'bigint' ? amount : BigInt(amount);
  return (Number(n) / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 9 });
}
const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Get wallet state from Sui dApp Kit
  const account = useCurrentAccount()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  
  // Get SUI balance when connected
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    account?.address 
      ? {
          owner: account.address,
          coinType: '0x2::sui::SUI',
        }
      : { 
          owner: "0x0", // Placeholder address that won't be used
          coinType: '0x2::sui::SUI',
        },
    {
      enabled: !!account?.address,
    }
  )

  // Format balance for display
  const formattedBalance = suiBalance 
    ? formatAmount(suiBalance.totalBalance) + ' SUI' : null

  // Toast on connect
  useEffect(() => {
    if (account) {
      setIsConnecting(false)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
      })
    }
  }, [account, toast])

  const disconnect = () => {
    try {
      disconnectWallet()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (error) {
      toast({
        title: "Disconnect Failed", 
        description: "Failed to disconnect wallet.",
        variant: "destructive",
      })
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected: !!account,
        address: account ? account.address : null,
        balance: formattedBalance,
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
