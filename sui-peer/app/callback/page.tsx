"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { 
  retrieveEphemeralKeypair, 
  processJwt, 
  generateMockAddress, 
  storeZkLoginData 
} from "@/utils/zklogin-utils";

export default function CallbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useWallet();
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the ID token from the URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const idToken = params.get("id_token");
        const state = params.get("state");
        
        // Verify state matches what we stored
        const storedState = sessionStorage.getItem("zkLogin:stateString");
        if (state !== storedState) {
          throw new Error("Invalid state parameter");
        }
        
        if (!idToken) {
          // For development, if no token is received but we're in dev mode
          if (window.location.hostname === "localhost") {
            // Generate a mock address
            const mockAddress = generateMockAddress();
            storeZkLoginData(mockAddress, "mock.jwt.token");
            
            setStatus("Development login successful! Redirecting...");
            
            // Call login function from wallet provider
            login(mockAddress, true);
            
            // Redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
            return;
          }
          throw new Error("No ID token received");
        }
        
        // Get stored nonce
        const nonce = sessionStorage.getItem("zkLogin:nonce");
        if (!nonce) {
          throw new Error("Missing login data");
        }
        
        // Get the ephemeral key pair from session storage
        const ephemeralKeyPair = retrieveEphemeralKeypair();
        if (!ephemeralKeyPair) {
          throw new Error("No ephemeral key pair found");
        }
        
        try {
          // Derive the Sui address from the JWT
          const userAddr = processJwt(idToken, nonce);
          
          // Store the user information
          storeZkLoginData(userAddr, idToken);
          
          // Call login function from wallet provider
          login(userAddr, true);
          
          setStatus("Login successful! Redirecting...");
          toast({
            title: "Login Successful",
            description: "You have been authenticated with zkLogin",
          });
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } catch (parseError) {
          console.error("Error processing JWT:", parseError);
          throw new Error("Failed to process authentication data");
        }
      } catch (error:any) {
        console.error("Callback error:", error);
        setStatus(`Login failed: ${error.message}`);
        toast({
          title: "Login Failed",
          description: error.message || "Authentication process failed",
          variant: "destructive",
        });
      }
    }
    
    handleCallback();
  }, [router, toast, login]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">SuiPeer Authentication</h1>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}