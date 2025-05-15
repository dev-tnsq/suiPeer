"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { GOOGLE_CLIENT_ID } from "@/constants/sui";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { 
  generateEphemeralKeypair, 
  storeEphemeralKeypair, 
  generateGoogleOAuthUrl,
  generateMockAddress,
  storeZkLoginData
} from "@/utils/zklogin-utils";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export function ZkLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useWallet();
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  
  // Generate ephemeral key pair on component mount
  useEffect(() => {
    try {
      const keypair = generateEphemeralKeypair();
      setEphemeralKeyPair(keypair);
      storeEphemeralKeypair(keypair);
    } catch (error) {
      console.error("Error generating keypair:", error);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      if (!ephemeralKeyPair) {
        throw new Error("Keypair not generated yet");
      }
      
      // Generate OAuth URL and store state/nonce
      const { url } = generateGoogleOAuthUrl(ephemeralKeyPair);
      
      if (!GOOGLE_CLIENT_ID) {
        // For development without actual OAuth credentials
        toast({
          title: "Development Mode",
          description: "Using simulated zkLogin flow since no Google Client ID is configured.",
        });
        
        // Simulate successful login after a delay
        setTimeout(() => {
          // Generate and store a mock address
          const mockAddress = generateMockAddress();
          storeZkLoginData(mockAddress, "mock.jwt.token");
          
          // Call login function from wallet provider
          login(mockAddress, true);
          
          // Redirect to dashboard
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        // Redirect to OAuth provider
        window.location.href = url;
      }
    } catch (error:any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to initiate login process",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogin} 
      disabled={isLoading || !ephemeralKeyPair}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}