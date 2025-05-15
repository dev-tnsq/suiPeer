"use client";

import React, { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiSignAndExecuteTransactionBlockInput, SuiSignAndExecuteTransactionBlockOutput } from '@mysten/wallet-standard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  generateAnonymousReviewProof,
  RESEARCH_DOMAINS,
  type OptionalProperties
} from '@/utils/zk-utils';
import { submitReview } from '@/services/blockchain-service';

interface AnonymousReviewFormProps {
  paperId: string;
  paperTitle: string;
  paperDomain: number;
}

export function AnonymousReviewForm({ paperId, paperTitle, paperDomain }: AnonymousReviewFormProps) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();
  const connected = !!currentAccount;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [score, setScore] = useState(5);
  const [approved, setApproved] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit an anonymous review.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a hash of the review content
      const reviewContentHash = new TextEncoder().encode(reviewContent);
      
      // Generate ZK proof for anonymous review
      // Use a hash of the wallet address as the private reviewer ID for better privacy
      const reviewerIdHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(currentAccount?.address || 'anonymous')
      );
      const reviewerId = new Uint32Array(reviewerIdHash)[0] % 1000000;
      
      const { proof, publicInputs } = await generateAnonymousReviewProof(
        reviewerId, // Private reviewer ID (derived from wallet address)
        parseInt(paperId),
        score,
        approved,
        parseInt(paperId),
        paperDomain
      );
      
      // Submit anonymous review on-chain using the blockchain service
      const txDigest = await submitReview(
        signAndExecuteTransactionBlock,
        paperId,
        reviewContent,
        score,
        approved,
        true, // isAnonymous
        proof,
        publicInputs
      );
      
      if (txDigest) {
        toast({
          title: "Review Submitted",
          description: "Your anonymous review has been submitted successfully.",
        });
        
        console.log("Transaction digest:", txDigest);
        
        // Reset form
        setReviewContent('');
        setScore(5);
        setApproved(false);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Anonymous Review</CardTitle>
        <CardDescription>
          Review paper "{paperTitle}" in the domain of {RESEARCH_DOMAINS[paperDomain]} anonymously using zero-knowledge proofs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reviewContent">Review Content</Label>
            <Textarea
              id="reviewContent"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Enter your detailed review..."
              rows={8}
              required
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="score">Score ({score}/10)</Label>
            <Slider
              id="score"
              min={1}
              max={10}
              step={1}
              value={[score]}
              onValueChange={(value) => setScore(value[0])}
              className="py-4"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="approved"
              checked={approved}
              onCheckedChange={setApproved}
            />
            <Label htmlFor="approved">Approve this paper</Label>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Privacy Notice:</strong> Your identity will be protected using zero-knowledge proofs. 
              The blockchain will verify your qualifications without revealing who you are.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !connected || !reviewContent}
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit Anonymous Review"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AnonymousReviewForm;