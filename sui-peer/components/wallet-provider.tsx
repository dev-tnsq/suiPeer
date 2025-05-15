"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  useCurrentAccount, 
  useDisconnectWallet,
  useSuiClientQuery,
} from "@mysten/dapp-kit"
import { NETWORK } from "@/constants/sui"

type WalletContextType = {
  connected: boolean
  address: string | null
  balance: string | null
  disconnect: () => void
  isConnecting: boolean
  isZkLogin: boolean
  connectWithZkLogin: () => void
  login: (address: string, isZk: boolean) => void
}

function formatAmount(amount: string | number | bigint): string {
  const n = typeof amount === 'bigint' ? amount : BigInt(amount);
  return (Number(n) / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 9 });
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isZkLogin, setIsZkLogin] = useState(false)
  const [zkAddress, setZkAddress] = useState<string | null>(null)
  
  // Get wallet state from Sui dApp Kit
  const account = useCurrentAccount()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  
  // Check for zkLogin on mount
  useEffect(() => {
    const storedAddress = sessionStorage.getItem("zkLogin:address")
    if (storedAddress) {
      setZkAddress(storedAddress)
      setIsZkLogin(true)
      
      // Show toast for returning user
      toast({
        title: "Welcome Back",
        description: `Connected with zkLogin: ${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}`,
      })
    }
  }, [toast])
  
  // Get SUI balance when connected (either via wallet or zkLogin)
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    (account?.address || zkAddress)
      ? {
          owner: account?.address || zkAddress || "",
          coinType: '0x2::sui::SUI',
        }
      : { 
          owner: "0x0", // Placeholder address that won't be used
          coinType: '0x2::sui::SUI',
        },
    {
      enabled: !!(account?.address || zkAddress),
    }
  )

  // Format balance for display
  const formattedBalance = suiBalance 
    ? formatAmount(suiBalance.totalBalance) + ' SUI' : null

  // Toast on connect with regular wallet
  useEffect(() => {
    if (account && !isZkLogin) {
      setIsConnecting(false)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
      })
    }
  }, [account, isZkLogin, toast])

  const connectWithZkLogin = () => {
    window.location.href = "/login";
  }

  const login = (address: string, isZk: boolean) => {
    setZkAddress(address);
    setIsZkLogin(isZk);
    setIsConnecting(false);
    
    toast({
      title: "Connected",
      description: `Connected with zkLogin: ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  const disconnect = () => {
    try {
      if (isZkLogin) {
        // Clear zkLogin data using our utility function
        import("@/utils/zklogin-utils").then(({ clearZkLoginData }) => {
          clearZkLoginData();
        });
        
        setZkAddress(null);
        setIsZkLogin(false);
      } else {
        // Disconnect regular wallet
        disconnectWallet();
      }
      
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed", 
        description: "Failed to disconnect wallet.",
        variant: "destructive",
      });
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected: !!(account || zkAddress),
        address: account ? account.address : zkAddress,
        balance: formattedBalance,
        disconnect,
        isConnecting,
        isZkLogin,
        connectWithZkLogin,
        login
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
