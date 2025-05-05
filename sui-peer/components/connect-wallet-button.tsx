import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"
import { ConnectButton, ConnectModal } from '@mysten/dapp-kit'
import { useWallet } from "@/components/wallet-provider"
import { useState } from "react"

export function ConnectWalletButton() {
  const { connected, address, isConnecting, disconnect } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)

  const handleConnect = () => {
    if (connected) {
      disconnect()
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      {/* Hidden ConnectButton to wire up dApp Kit */}
      <div className="hidden">
        <ConnectButton />
      </div>

      {/* Custom styled button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2"
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        <span>{connected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}</span>
      </Button>

      {/* Modal for wallet selection with proper trigger */}
      <ConnectModal 
        trigger={<div style={{ display: 'none' }}></div>} // Hidden element as trigger instead of fragment
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  )
}
