"use client";

import React, { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SuiSignAndExecuteTransactionBlockInput, SuiSignAndExecuteTransactionBlockOutput } from '@mysten/wallet-standard';
import { 
  generateCredentialHash, 
  generateResearcherProof, 
  EDUCATION_LEVELS,
  RESEARCH_DOMAINS,
  OptionalProperties
} from '@/utils/zk-utils';
import { verifyResearcherWithZk, createTransactionExecutor } from '@/services/blockchain-service';

export function ZkVerificationForm() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();
  const connected = !!currentAccount;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState('');
  const [researcherId, setResearcherId] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [domain, setDomain] = useState('');
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to verify your credentials.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate credential hash
      // Use a hash of the wallet address as the researcher ID for better privacy if not provided
      const actualResearcherId = researcherId ? 
        parseInt(researcherId) : 
        parseInt(currentAccount?.address?.slice(-8) || '0', 16) % 1000000;
        
      const credentialHash = await generateCredentialHash(
        parseInt(institutionId),
        actualResearcherId,
        parseInt(educationLevel),
        parseInt(yearsExperience)
      );
      
      // For demonstration, we'll use the same hash as the commitment
      const credentialCommitment = credentialHash;
      
      // Generate ZK proof
      const { proof, publicInputs } = await generateResearcherProof(
        credentialHash,
        parseInt(institutionId),
        actualResearcherId,
        parseInt(educationLevel),
        parseInt(yearsExperience),
        credentialCommitment,
        1, // Institution verified
        1, // Min education level (Bachelor)
        2, // Min years experience
        parseInt(domain)
      );
      
      // Verify on-chain using the blockchain service
      const txDigest = await verifyResearcherWithZk(
        signAndExecuteTransactionBlock,
        proof,
        publicInputs
      );
      
      if (txDigest) {
        toast({
          title: "Verification Successful",
          description: "Your credentials have been verified using zero-knowledge proofs.",
        });
        
        console.log("Transaction digest:", txDigest);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error verifying credentials:", error);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Researcher Credentials</CardTitle>
        <CardDescription>
          Verify your credentials using zero-knowledge proofs to maintain privacy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institutionId">Institution ID</Label>
            <Input
              id="institutionId"
              type="number"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              placeholder="Enter your institution ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="researcherId">Researcher ID</Label>
            <Input
              id="researcherId"
              type="number"
              value={researcherId}
              onChange={(e) => setResearcherId(e.target.value)}
              placeholder="Enter your researcher ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="educationLevel">Education Level</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EDUCATION_LEVELS.BACHELOR.toString()}>Bachelor's Degree</SelectItem>
                <SelectItem value={EDUCATION_LEVELS.MASTER.toString()}>Master's Degree</SelectItem>
                <SelectItem value={EDUCATION_LEVELS.PHD.toString()}>PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="Enter your years of experience"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="domain">Research Domain</Label>
            <Select value={domain} onValueChange={setDomain} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your research domain" />
              </SelectTrigger>
              <SelectContent>
                {RESEARCH_DOMAINS.map((domain, index) => (
                  <SelectItem key={index} value={index.toString()}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerify} 
          disabled={loading || !connected}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify Credentials"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ZkVerificationForm;