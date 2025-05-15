import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiSignAndExecuteTransactionBlockInput, SuiSignAndExecuteTransactionBlockOutput } from '@mysten/wallet-standard';
import { Transaction } from '@mysten/sui/transactions';
import { OptionalProperties } from '@/utils/zk-utils';
import { 
  suiClient,
  createRegisterResearcherTx,
  createSubmitPaperTx,
  createSubmitReviewTx,
  createSubmitAnonymousReviewTx,
  createVerifyResearcherWithZkTx,
  createStakeTokensTx,
  createVoteOnProposalTx,
  createCitePaperTx,
  getResearcherReputation,
  getPublicationCount
} from '@/utils/contract-utils';

// Types for research papers
export interface Paper {
  id: string;
  title: string;
  abstract: string;
  author: string;
  date: string;
  status: 'Published' | 'Under Review' | 'Draft';
  reviews: number;
  score: number;
  field: string;
  citations: number;
}

// Types for reviews
export interface Review {
  id: string;
  paperId: string;
  paperTitle: string;
  reviewer: string;
  content: string;
  score: number;
  approved: boolean;
  date: string;
  isAnonymous: boolean;
}

// Types for researchers
export interface Researcher {
  id: string;
  name: string;
  institution: string;
  domains: string[];
  reputation: number;
  publications: number;
  reviews: number;
  citations: number;
  verified: boolean;
}

// Fetch all papers from the blockchain
export async function fetchPapers(address?: string): Promise<Paper[]> {
  try {
    // In a real implementation, we would query the blockchain for papers
    // For now, we'll return mock data
    const mockPapers: Paper[] = [
      {
        id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        title: "Decentralized Consensus Mechanisms in Blockchain Networks",
        abstract: "This paper explores various consensus mechanisms used in blockchain networks, comparing their efficiency, security, and scalability characteristics.",
        author: address || "Anonymous",
        date: new Date().toISOString().split('T')[0],
        status: "Published",
        reviews: 4,
        score: 8.5,
        field: "Blockchain",
        citations: 12,
      },
      {
        id: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
        title: "Zero-Knowledge Proofs for Privacy-Preserving Authentication",
        abstract: "A comprehensive analysis of zero-knowledge proof systems and their applications in privacy-preserving authentication protocols.",
        author: address || "Anonymous",
        date: new Date().toISOString().split('T')[0],
        status: "Under Review",
        reviews: 2,
        score: 7.0,
        field: "Cryptography",
        citations: 0,
      },
    ];

    return mockPapers;
  } catch (error) {
    console.error("Error fetching papers:", error);
    return [];
  }
}

// Fetch a specific paper by ID
export async function fetchPaperById(paperId: string): Promise<Paper | null> {
  try {
    const papers = await fetchPapers();
    return papers.find(paper => paper.id === paperId) || null;
  } catch (error) {
    console.error("Error fetching paper by ID:", error);
    return null;
  }
}

// Fetch reviews for a specific paper
export async function fetchReviewsForPaper(paperId: string): Promise<Review[]> {
  try {
    // In a real implementation, we would query the blockchain for reviews
    // For now, we'll return mock data
    const mockReviews: Review[] = [
      {
        id: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
        paperId,
        paperTitle: "Decentralized Consensus Mechanisms in Blockchain Networks",
        reviewer: "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
        content: "This paper provides a comprehensive analysis of consensus mechanisms. The methodology is sound and the results are significant.",
        score: 8,
        approved: true,
        date: new Date().toISOString().split('T')[0],
        isAnonymous: false,
      },
      {
        id: "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef",
        paperId,
        paperTitle: "Decentralized Consensus Mechanisms in Blockchain Networks",
        reviewer: "Anonymous",
        content: "The paper has some interesting insights but lacks depth in certain areas. The experimental setup could be improved.",
        score: 6,
        approved: true,
        date: new Date().toISOString().split('T')[0],
        isAnonymous: true,
      },
    ];

    return mockReviews;
  } catch (error) {
    console.error("Error fetching reviews for paper:", error);
    return [];
  }
}

// Fetch researcher profile
export async function fetchResearcherProfile(address: string): Promise<Researcher | null> {
  try {
    // Get reputation and publication count from the blockchain
    const reputation = await getResearcherReputation(address);
    const publications = await getPublicationCount(address);
    
    // In a real implementation, we would query more data from the blockchain
    // For now, we'll return mock data combined with real blockchain data
    const researcher: Researcher = {
      id: address,
      name: "Researcher Name", // This would come from the blockchain
      institution: "Research Institution", // This would come from the blockchain
      domains: ["Blockchain", "Cryptography"], // This would come from the blockchain
      reputation: Number(reputation),
      publications: publications,
      reviews: 12, // This would come from the blockchain
      citations: 34, // This would come from the blockchain
      verified: true, // This would come from the blockchain
    };

    return researcher;
  } catch (error) {
    console.error("Error fetching researcher profile:", error);
    return null;
  }
}

// Submit a new paper
export async function submitPaper(
  signAndExecuteTransactionBlock: any,
  title: string,
  abstract: string,
  content: string,
  domain: string
): Promise<string | null> {
  try {
    // Create a hash of the content
    const contentHash = new TextEncoder().encode(content);
    
    // Create the transaction
    const tx = createSubmitPaperTx(title, abstract, contentHash, domain);
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
    });
    
    // Return the transaction digest
    return result.digest;
  } catch (error) {
    console.error("Error submitting paper:", error);
    return null;
  }
}

// Submit a review
export async function submitReview(
  signAndExecuteTransactionBlock: any,
  paperId: string,
  content: string,
  score: number,
  approved: boolean,
  isAnonymous: boolean,
  zkProof?: Uint8Array,
  publicInputs?: Uint8Array
): Promise<string | null> {
  try {
    // Create a hash of the content
    const contentHash = new TextEncoder().encode(content);
    
    // Create the transaction based on whether it's anonymous or not
    let tx;
    if (isAnonymous && zkProof && publicInputs) {
      tx = createSubmitAnonymousReviewTx(paperId, contentHash, score, approved, zkProof, publicInputs);
    } else {
      tx = createSubmitReviewTx(paperId, contentHash, score, approved);
    }
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
    });
    
    // Return the transaction digest
    return result.digest;
  } catch (error) {
    console.error("Error submitting review:", error);
    return null;
  }
}

// Register as a researcher
export async function registerResearcher(
  signAndExecuteTransactionBlock: any,
  name: string,
  institution: string,
  domains: string[]
): Promise<string | null> {
  try {
    // Create the transaction
    const tx = createRegisterResearcherTx(name, institution, domains);
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
    });
    
    // Return the transaction digest
    return result.digest;
  } catch (error) {
    console.error("Error registering researcher:", error);
    return null;
  }
}

// Verify researcher credentials with ZK proof
export async function verifyResearcherWithZk(
  signAndExecuteTransactionBlock: any,
  zkProof: Uint8Array,
  publicInputs: Uint8Array
): Promise<string | null> {
  try {
    // Create the transaction
    const tx = createVerifyResearcherWithZkTx(zkProof, publicInputs);
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
    });
    
    // Return the transaction digest
    return result.digest;
  } catch (error) {
    console.error("Error verifying researcher credentials:", error);
    return null;
  }
}

// Create a wrapper function for transaction execution
export function createTransactionExecutor(signAndExecuteTransactionBlock: any) {
  return (transactionInput: OptionalProperties<SuiSignAndExecuteTransactionBlockInput, "chain" | "account">) => {
    return signAndExecuteTransactionBlock({
      transaction: transactionInput.transactionBlock,
    }) as unknown as Promise<SuiSignAndExecuteTransactionBlockOutput>;
  };
}