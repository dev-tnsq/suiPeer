import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';
import { Buffer } from 'buffer';
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignAndExecuteTransactionBlockInput, SuiSignAndExecuteTransactionBlockOutput } from '@mysten/wallet-standard';
import { 
  PACKAGE_ID, 
  PLATFORM_CONFIG_ID, 
  ZK_VERIFIER_ID, 
  REPUTATION_REGISTRY_ID, 
  GOVERNANCE_REGISTRY_ID, 
  TREASURY_ID 
} from '@/constants/sui';

// Define our own utility type since OptionalProperties is not exported from @mysten/wallet-kit-core
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Contract addresses and IDs
// These are imported from the constants file which is updated by the deploy.js script
export const CONTRACT_ADDRESSES = {
  PLATFORM_ZK: PACKAGE_ID,
  ZK_VERIFIER: PACKAGE_ID,
  REPUTATION: PACKAGE_ID,
  GOVERNANCE: PACKAGE_ID,
  TOKEN_REWARDS: PACKAGE_ID,
};

export const OBJECT_IDS = {
  PLATFORM_CONFIG: PLATFORM_CONFIG_ID,
  ZK_VERIFIER_OBJECT: ZK_VERIFIER_ID,
  REPUTATION_REGISTRY: REPUTATION_REGISTRY_ID,
  GOVERNANCE_REGISTRY: GOVERNANCE_REGISTRY_ID,
  REWARDS_TREASURY: TREASURY_ID,
};

// ZK circuit paths - these point to the actual compiled circuits in the public directory
export const ZK_PATHS = {
  RESEARCHER_WASM: '/zk/researcher_credentials.wasm',
  RESEARCHER_ZKEY: '/zk/researcher_credentials.zkey',
  REVIEWER_WASM: '/zk/reviewer_qual.wasm',
  REVIEWER_ZKEY: '/zk/reviewer_qual.zkey',
  ANONYMOUS_WASM: '/zk/anonymous_review.wasm',
  ANONYMOUS_ZKEY: '/zk/anonymous_review.zkey',
};

// Education levels
export const EDUCATION_LEVELS = {
  BACHELOR: 1,
  MASTER: 2,
  PHD: 3,
};

// Research domains
export const RESEARCH_DOMAINS = [
  'Computer Science',
  'Artificial Intelligence',
  'Blockchain',
  'Cryptography',
  'Distributed Systems',
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Quantum Computing',
  'Cybersecurity',
];

// Generate a Poseidon hash for researcher credentials
export async function generateCredentialHash(
  institutionId: number,
  researcherId: number,
  educationLevel: number,
  yearsExperience: number
): Promise<bigint> {
  try {
    // Initialize poseidon hash function
    const poseidon = await buildPoseidon();
    
    // Calculate the Poseidon hash of the credential data
    const hash = poseidon([
      institutionId,
      researcherId,
      educationLevel,
      yearsExperience
    ]);
    
    return BigInt(hash.toString());
  } catch (error) {
    console.error('Error generating credential hash:', error);
    // Fallback to a deterministic hash if poseidon fails
    const fallbackHash = BigInt(
      institutionId * 10000000000 + 
      researcherId * 1000000 + 
      educationLevel * 1000 + 
      yearsExperience
    );
    return fallbackHash;
  }
}

// Generate a ZK proof for researcher credentials
export async function generateResearcherProof(
  privateCredentialHash: bigint,
  privateInstitutionId: number,
  privateResearcherId: number,
  privateEducationLevel: number,
  privateYearsExperience: number,
  publicCredentialCommitment: bigint,
  publicInstitutionVerified: number,
  publicMinEducationLevel: number,
  publicMinExperience: number,
  publicDomainId: number
) {
  // Prepare the inputs for the circuit
  const input = {
    // Private inputs
    privateCredentialHash: privateCredentialHash.toString(),
    privateInstitutionId: privateInstitutionId.toString(),
    privateResearcherId: privateResearcherId.toString(),
    privateEducationLevel: privateEducationLevel.toString(),
    privateYearsExperience: privateYearsExperience.toString(),
    
    // Public inputs
    publicCredentialCommitment: publicCredentialCommitment.toString(),
    publicInstitutionVerified: publicInstitutionVerified.toString(),
    publicMinEducationLevel: publicMinEducationLevel.toString(),
    publicMinExperience: publicMinExperience.toString(),
    publicDomainId: publicDomainId.toString(),
  };

  try {
    console.log('Generating researcher proof with inputs:', JSON.stringify(input, null, 2));
    
    // Fetch the WASM file for the circuit
    const wasmResponse = await fetch(ZK_PATHS.RESEARCHER_WASM);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch WASM file: ${wasmResponse.statusText}`);
    }
    const wasmBuffer = await wasmResponse.arrayBuffer();
    
    // Fetch the zKey file for the circuit
    const zkeyResponse = await fetch(ZK_PATHS.RESEARCHER_ZKEY);
    if (!zkeyResponse.ok) {
      throw new Error(`Failed to fetch zKey file: ${zkeyResponse.statusText}`);
    }
    const zkeyBuffer = await zkeyResponse.arrayBuffer();
    
    // Generate the proof using snarkjs
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    );
    
    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);
    
    // Convert the proof to the format expected by the Sui smart contract
    const proofForContract = convertProofForContract(proof);
    const publicInputsForContract = convertPublicInputsForContract(publicSignals);

    return {
      proof: proofForContract,
      publicInputs: publicInputsForContract,
    };
  } catch (error:any) {
    console.error('Error generating ZK proof:', error);
    throw new Error(`Failed to generate researcher proof: ${error.message}`);
  }
}

// Generate a ZK proof for anonymous review
export async function generateAnonymousReviewProof(
  privateReviewerId: number,
  privatePaperId: number,
  privateReviewScore: number,
  privateApproved: boolean,
  publicPaperId: number,
  publicDomainId: number
) {
  // Prepare the inputs for the circuit
  const input = {
    // Private inputs
    privateReviewerId: privateReviewerId.toString(),
    privatePaperId: privatePaperId.toString(),
    privateReviewScore: privateReviewScore.toString(),
    privateApproved: privateApproved ? '1' : '0',
    
    // Public inputs
    publicPaperId: publicPaperId.toString(),
    publicDomainId: publicDomainId.toString(),
  };

  try {
    console.log('Generating anonymous review proof with inputs:', JSON.stringify(input, null, 2));
    
    // Fetch the WASM file for the circuit
    const wasmResponse = await fetch(ZK_PATHS.ANONYMOUS_WASM);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch WASM file: ${wasmResponse.statusText}`);
    }
    const wasmBuffer = await wasmResponse.arrayBuffer();
    
    // Fetch the zKey file for the circuit
    const zkeyResponse = await fetch(ZK_PATHS.ANONYMOUS_ZKEY);
    if (!zkeyResponse.ok) {
      throw new Error(`Failed to fetch zKey file: ${zkeyResponse.statusText}`);
    }
    const zkeyBuffer = await zkeyResponse.arrayBuffer();
    
    // Generate the proof using snarkjs
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    );
    
    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);
    
    // Convert the proof to the format expected by the Sui smart contract
    const proofForContract = convertProofForContract(proof);
    const publicInputsForContract = convertPublicInputsForContract(publicSignals);

    return {
      proof: proofForContract,
      publicInputs: publicInputsForContract,
    };
  } catch (error:any) {
    console.error('Error generating anonymous review proof:', error);
    
    // For development/testing, provide a fallback proof if the real proof generation fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using fallback proof for development');
      
      const fallbackProof = {
        pi_a: ["12345678901234567890", "12345678901234567890", "1"],
        pi_b: [["12345678901234567890", "12345678901234567890"], ["12345678901234567890", "12345678901234567890"], ["1", "0"]],
        pi_c: ["12345678901234567890", "12345678901234567890", "1"],
        protocol: "groth16"
      };
      
      const fallbackPublicSignals = [
        publicPaperId.toString(),
        publicDomainId.toString()
      ];
      
      const proofForContract = convertProofForContract(fallbackProof);
      const publicInputsForContract = convertPublicInputsForContract(fallbackPublicSignals);
      
      return {
        proof: proofForContract,
        publicInputs: publicInputsForContract,
      };
    }
    
    throw new Error(`Failed to generate anonymous review proof: ${error.message}`);
  }
}

// Helper function to convert a proof to the format expected by the Sui smart contract
function convertProofForContract(proof: any): Uint8Array {
  try {
    // Format the proof as required by the Sui Move contract
    // The exact format depends on how the verifier contract expects the proof
    const proofArray = [
      proof.pi_a[0], proof.pi_a[1],
      proof.pi_b[0][0], proof.pi_b[0][1],
      proof.pi_b[1][0], proof.pi_b[1][1],
      proof.pi_c[0], proof.pi_c[1]
    ];
    
    // Convert to JSON string and then to buffer
    const proofStr = JSON.stringify(proofArray);
    return Buffer.from(proofStr);
  } catch (error:any) {
    console.error('Error converting proof for contract:', error);
    throw new Error(`Failed to convert proof for contract: ${error.message}`);
  }
}

// Helper function to convert public inputs to the format expected by the Sui smart contract
function convertPublicInputsForContract(publicSignals: string[]): Uint8Array {
  try {
    // Convert the public signals to JSON format
    const publicSignalsStr = JSON.stringify(publicSignals);
    return Buffer.from(publicSignalsStr);
  } catch (error:any) {
    console.error('Error converting public inputs for contract:', error);
    throw new Error(`Failed to convert public inputs for contract: ${error.message}`);
  }
}

// Verify a researcher's credentials on-chain
export async function verifyResearcherCredentials(
  researcherId: string,
  proof: Uint8Array,
  publicInputs: Uint8Array,
  signAndExecuteTransactionBlock: (transactionInput: OptionalProperties<SuiSignAndExecuteTransactionBlockInput, "chain" | "account">) => Promise<SuiSignAndExecuteTransactionBlockOutput>
) {
  try {
    console.log('Verifying researcher credentials on-chain for researcher:', researcherId);
    
    // Create a new transaction block
    const tx = new Transaction();
    
    // Add the move call to verify researcher credentials
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::verify_researcher_with_zk`,
      arguments: [
        tx.pure.string(researcherId),
        tx.pure.vector('u8', Array.from(proof)),
        tx.pure.vector('u8', Array.from(publicInputs)),
        tx.object(OBJECT_IDS.ZK_VERIFIER_OBJECT),
      ],
    });
    
    // Set gas budget
    tx.setGasBudget(10000000);
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('Verification transaction result:', result);
    
    return result;
  } catch (error:any) {
    console.error('Error verifying researcher credentials:', error);
    throw new Error(`Failed to verify researcher credentials: ${error.message}`);
  }
}

// Submit an anonymous review on-chain
export async function submitAnonymousReview(
  paperId: string,
  reviewContentHash: Uint8Array,
  score: number,
  approved: boolean,
  proof: Uint8Array,
  publicInputs: Uint8Array,
  signAndExecuteTransactionBlock: (transactionInput: OptionalProperties<SuiSignAndExecuteTransactionBlockInput, "chain" | "account">) => Promise<SuiSignAndExecuteTransactionBlockOutput>
) {
  try {
    console.log('Submitting anonymous review for paper:', paperId);
    
    // Create a new transaction block
    const tx = new Transaction();
    
    // Add the move call to submit an anonymous review
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::submit_anonymous_review`,
      arguments: [
        tx.pure.string(paperId),
        tx.pure.vector('u8', Array.from(reviewContentHash)),
        tx.pure.u64(score),
        tx.pure.bool(approved),
        tx.pure.vector('u8', Array.from(proof)),
        tx.pure.vector('u8', Array.from(publicInputs)),
        tx.object(OBJECT_IDS.ZK_VERIFIER_OBJECT),
      ],
    });
    
    // Set gas budget
    tx.setGasBudget(10000000);
    
    // Execute the transaction
    const result = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('Review submission transaction result:', result);
    
    return result;
  } catch (error:any) {
    console.error('Error submitting anonymous review:', error);
    throw new Error(`Failed to submit anonymous review: ${error.message}`);
  }
}

// Get a researcher's verification status
export async function getResearcherVerificationStatus(
  researcherId: string,
  provider: any
) {
  try {
    console.log('Getting verification status for researcher:', researcherId);
    
    // Create a transaction block for the query
    const tx = new Transaction();
    
    // Add the move call to get the researcher's verification status
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::get_researcher_verification_status`,
      arguments: [tx.pure.string(researcherId)],
    });
    
    // Execute the transaction in dev inspect mode (read-only)
    const result = await provider.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
    
    // Parse the result
    const returnValue = result.results[0].returnValues[0][0];
    return returnValue === '1' || returnValue === 'true';
  } catch (error:any) {
    console.error('Error getting researcher verification status:', error);
    
    // For development, return a default value
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using default verification status for development');
      return true;
    }
    
    throw new Error(`Failed to get researcher verification status: ${error.message}`);
  }
}

// Get a researcher's domains
export async function getResearcherDomains(
  researcherId: string,
  provider: any
) {
  try {
    console.log('Getting domains for researcher:', researcherId);
    
    // Create a transaction block for the query
    const tx = new Transaction();
    
    // Add the move call to get the researcher's domains
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::get_researcher_domains`,
      arguments: [tx.pure.string(researcherId)],
    });
    
    // Execute the transaction in dev inspect mode (read-only)
    const result = await provider.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
    
    // Parse the domains from the result
    const domains = result.results[0].returnValues[0];
    return domains;
  } catch (error:any) {
    console.error('Error getting researcher domains:', error);
    
    // For development, return default domains
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using default domains for development');
      return [0, 2, 3]; // Example domain IDs
    }
    
    throw new Error(`Failed to get researcher domains: ${error.message}`);
  }
}

// Get a paper's status
export async function getPaperStatus(
  paperId: string,
  provider: any
) {
  try {
    console.log('Getting status for paper:', paperId);
    
    // Create a transaction block for the query
    const tx = new Transaction();
    
    // Add the move call to get the paper's status
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::get_paper_status`,
      arguments: [tx.pure.string(paperId)],
    });
    
    // Execute the transaction in dev inspect mode (read-only)
    const result = await provider.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
    
    // Parse the status from the result
    const status = parseInt(result.results[0].returnValues[0][0]);
    return status;
  } catch (error:any) {
    console.error('Error getting paper status:', error);
    
    // For development, return a default status
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using default paper status for development');
      return 1; // Approved status
    }
    
    throw new Error(`Failed to get paper status: ${error.message}`);
  }
}

// Get a paper's citations
export async function getPaperCitations(
  paperId: string,
  provider: any
) {
  try {
    console.log('Getting citations for paper:', paperId);
    
    // Create a transaction block for the query
    const tx = new Transaction();
    
    // Add the move call to get the paper's citations
    tx.moveCall({
      target: `${CONTRACT_ADDRESSES.PLATFORM_ZK}::platform_zk::get_paper_citations`,
      arguments: [tx.pure.string(paperId)],
    });
    
    // Execute the transaction in dev inspect mode (read-only)
    const result = await provider.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
    
    // Parse the citations from the result
    const citations = parseInt(result.results[0].returnValues[0][0]);
    return citations;
  } catch (error:any) {
    console.error('Error getting paper citations:', error);
    
    // For development, return a default citation count
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using default citation count for development');
      return Math.floor(Math.random() * 100); // Random citation count for demo
    }
    
    throw new Error(`Failed to get paper citations: ${error.message}`);
  }
}