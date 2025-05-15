"use client";

import { Button } from "@/components/ui/button"
import { Loader2, Wallet, LogIn } from "lucide-react"
import { ConnectButton, ConnectModal } from '@mysten/dapp-kit'
import { useWallet } from "@/components/wallet-provider"
import { useState } from "react"
import { ZkLoginButton } from "@/components/ZkLoginButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ConnectWalletButton() {
  const { connected, address, isConnecting, disconnect, isZkLogin } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)
  const [showZkLogin, setShowZkLogin] = useState(false)

  const handleConnect = () => {
    if (connected) {
      disconnect()
      return
    }
    setModalOpen(true)
  }

  if (connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="flex items-center gap-2"
      >
        {isZkLogin ? <LogIn className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
        <span>{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
      </Button>
    )
  }

  if (showZkLogin) {
    return (
      <div className="flex items-center gap-2">
        <ZkLoginButton />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowZkLogin(false)}
        >
          Use Wallet
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Hidden ConnectButton to wire up dApp Kit */}
      <div className="hidden">
        <ConnectButton />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            <span>Connect</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setModalOpen(true)}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Connect Wallet</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowZkLogin(true)}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Use zkLogin</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal for wallet selection with proper trigger */}
      <ConnectModal 
        trigger={<div style={{ display: 'none' }}></div>} // Hidden element as trigger instead of fragment
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  )
}
