"use client"

import { ReactNode } from 'react'
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/components/wallet-provider'

const queryClient = new QueryClient()
const networks = {
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <SuiWalletProvider autoConnect preferredWallets={['Sui Wallet', 'Martian Wallet']}>
          <WalletProvider>
            {children}
          </WalletProvider>
        </SuiWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
