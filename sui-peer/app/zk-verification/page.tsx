import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ZkVerificationForm from '@/components/ZkVerificationForm';
import AnonymousReviewForm from '@/components/AnonymousReviewForm';

export default function ZkVerificationPage() {
  // Sample paper data for demonstration
  const samplePaper = {
    id: '0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef',
    title: 'Zero-Knowledge Proofs in Decentralized Research Platforms',
    domain: 2, // Index 2 corresponds to 'Blockchain' in RESEARCH_DOMAINS
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Zero-Knowledge Verification</h1>
      
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Protect your privacy while verifying your credentials and submitting reviews using zero-knowledge proofs.
      </p>
      
      <Tabs defaultValue="verify" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verify">Verify Credentials</TabsTrigger>
          <TabsTrigger value="review">Anonymous Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verify" className="mt-6">
          <ZkVerificationForm />
        </TabsContent>
        
        <TabsContent value="review" className="mt-6">
          <AnonymousReviewForm 
            paperId={samplePaper.id}
            paperTitle={samplePaper.title}
            paperDomain={samplePaper.domain}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-16 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How Zero-Knowledge Proofs Work</h2>
        
        <div className="space-y-4">
          <p>
            Zero-knowledge proofs allow you to prove you have certain information without revealing the information itself.
            For example, you can prove you have a PhD without revealing your personal details.
          </p>
          
          <h3 className="text-lg font-medium mt-4">For Researcher Verification:</h3>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>Enter your credentials (institution, education level, etc.)</li>
            <li>Our system generates a zero-knowledge proof of your qualifications</li>
            <li>The blockchain verifies your proof without storing your personal data</li>
            <li>You gain verified researcher status without compromising privacy</li>
          </ol>
          
          <h3 className="text-lg font-medium mt-4">For Anonymous Reviews:</h3>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>Write your review and score the paper</li>
            <li>Our system generates a zero-knowledge proof that you're qualified to review</li>
            <li>The blockchain verifies your qualifications without revealing your identity</li>
            <li>Your review is published anonymously while maintaining credibility</li>
          </ol>
        </div>
      </div>
    </div>
  );
}