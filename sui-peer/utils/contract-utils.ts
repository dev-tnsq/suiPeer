import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { 
  PACKAGE_ID, 
  PLATFORM_CONFIG_ID, 
  TREASURY_ID,
  REPUTATION_REGISTRY_ID,
  PUBLICATION_COUNTER_ID,
  REVIEW_COUNTER_ID,
  CITATION_COUNTER_ID,
  GOVERNANCE_REGISTRY_ID,
  ZK_VERIFIER_ID,
  STAKING_POOL_ID,
  NETWORK
} from "../constants/sui";
import {
  PLATFORM_MODULE,
  ZK_VERIFICATION_MODULE,
  REPUTATION_MODULE,
  GOVERNANCE_MODULE,
  TOKEN_REWARDS_MODULE,
  OBJECT_TYPES,
  EVENT_TYPES
} from "../constants/abi";

// Initialize Sui client based on the configured network
export const suiClient = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Register as a researcher
export function createRegisterResearcherTx(name: string, institution: string, domains: string[]) {
  const tx = new Transaction();
  
  // Convert string to sui string type
  const nameArg = tx.pure.string(name);
  const institutionArg = tx.pure.string(institution);
  
  // Convert domains array to vector<string>
  const domainsVector = tx.pure.vector('string', domains);
  
  tx.moveCall({
    target: PLATFORM_MODULE.REGISTER_RESEARCHER,
    arguments: [
      tx.object(PLATFORM_CONFIG_ID),
      nameArg,
      institutionArg,
      domainsVector
    ],
  });
  
  return tx;
}

// Submit a research paper
export function createSubmitPaperTx(
  title: string,
  abstract: string,
  contentHash: Uint8Array,
  domain: string
) {
  const tx = new Transaction();
  
  // Convert parameters to appropriate types
  const titleArg = tx.pure.string(title);
  const abstractArg = tx.pure.string(abstract);
  const contentHashArg = tx.pure.vector("u8", Array.from(contentHash));
  const domainArg = tx.pure.string(domain);
  
  tx.moveCall({
    target: PLATFORM_MODULE.SUBMIT_PAPER,
    arguments: [
      tx.object(PLATFORM_CONFIG_ID),
      titleArg,
      abstractArg,
      contentHashArg,
      domainArg
    ],
  });
  
  return tx;
}

// Submit a review for a paper
export function createSubmitReviewTx(
  paperId: string,
  reviewContentHash: Uint8Array,
  score: number,
  approved: boolean
) {
  const tx = new Transaction();
  
  // Convert parameters to appropriate types
  const reviewHashArg = tx.pure.vector("u8", Array.from(reviewContentHash));
  const scoreArg = tx.pure.u8(score);
  const approvedArg = tx.pure.bool(approved);
  
  tx.moveCall({
    target: PLATFORM_MODULE.SUBMIT_REVIEW,
    arguments: [
      tx.object(paperId),
      reviewHashArg,
      scoreArg,
      approvedArg
    ],
  });
  
  return tx;
}

// Submit an anonymous review with ZK proof
export function createSubmitAnonymousReviewTx(
  paperId: string,
  reviewContentHash: Uint8Array,
  score: number,
  approved: boolean,
  zkProof: Uint8Array,
  publicInputs: Uint8Array
) {
  const tx = new Transaction();
  
  // Convert parameters to appropriate types
  const reviewHashArg = tx.pure.vector("u8", Array.from(reviewContentHash));
  const scoreArg = tx.pure.u8(score);
  const approvedArg = tx.pure.bool(approved);
  const zkProofArg = tx.pure.vector("u8", Array.from(zkProof));
  const publicInputsArg = tx.pure.vector("u8", Array.from(publicInputs));
  
  tx.moveCall({
    target: PLATFORM_MODULE.SUBMIT_ANONYMOUS_REVIEW,
    arguments: [
      tx.object(paperId),
      reviewHashArg,
      scoreArg,
      approvedArg,
      zkProofArg,
      publicInputsArg,
      tx.object(ZK_VERIFIER_ID)
    ],
  });
  
  return tx;
}

// Verify researcher with ZK proof
export function createVerifyResearcherWithZkTx(
  zkProof: Uint8Array,
  publicInputs: Uint8Array
) {
  const tx = new Transaction();
  
  // Convert parameters to appropriate types
  const zkProofArg = tx.pure.vector("u8", Array.from(zkProof));
  const publicInputsArg = tx.pure.vector("u8", Array.from(publicInputs));
  
  tx.moveCall({
    target: ZK_VERIFICATION_MODULE.VERIFY_RESEARCHER_CREDENTIALS,
    arguments: [
      tx.object(ZK_VERIFIER_ID),
      zkProofArg,
      publicInputsArg
    ],
  });
  
  return tx;
}

// Stake PEER tokens for governance
export function createStakeTokensTx(
  peerCoinId: string,
  amount: bigint
) {
  const tx = new Transaction();
  
  // Split the coin if needed
  const [coin] = tx.splitCoins(tx.object(peerCoinId), [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: GOVERNANCE_MODULE.STAKE_TOKENS,
    arguments: [
      tx.object(STAKING_POOL_ID),
      coin
    ],
  });
  
  return tx;
}

// Vote on a governance proposal
export function createVoteOnProposalTx(
  proposalId: string,
  vote: boolean
) {
  const tx = new Transaction();
  
  const voteArg = tx.pure.bool(vote);
  
  tx.moveCall({
    target: GOVERNANCE_MODULE.VOTE_ON_PROPOSAL,
    arguments: [
      tx.object(GOVERNANCE_REGISTRY_ID),
      tx.object(STAKING_POOL_ID),
      tx.object(proposalId),
      voteArg
    ],
  });
  
  return tx;
}

// Cite a paper
export function createCitePaperTx(
  paperId: string,
  paperNftId: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: PLATFORM_MODULE.CITE_PAPER,
    arguments: [
      tx.object(paperId),
      tx.object(paperNftId)
    ],
  });
  
  return tx;
}

// Get researcher reputation (read-only function)
export async function getResearcherReputation(address: string) {
  try {
    // Check if the reputation registry exists
    try {
      await suiClient.getObject({
        id: REPUTATION_REGISTRY_ID,
        options: { showContent: true }
      });
    } catch (error) {
      console.log("Reputation registry not found, returning default value");
      return BigInt(0);
    }

    // Based on the contract, get_reputation_score takes a registry and researcher address
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: buildInspectTxBlock(
        REPUTATION_MODULE.GET_REPUTATION,
        [REPUTATION_REGISTRY_ID, address]
      ),
      sender: address,
    });
    
    // Parse the result
    if (result.results && result.results[0] && result.results[0].returnValues) {
      // Convert array to string before passing to BigInt
      const returnValue = result.results[0].returnValues[0][0];
      return typeof returnValue === 'number' 
        ? BigInt(returnValue) 
        : Array.isArray(returnValue) 
          ? BigInt(returnValue.join('')) 
          : BigInt(0);
    }
    return BigInt(0);
  } catch (error) {
    console.error("Error getting reputation:", error);
    return BigInt(0);
  }
}

// Get publication count for a researcher
export async function getPublicationCount(address: string) {
  try {
    try {
      // Try to get the publication counter object
      await suiClient.getObject({
        id: PUBLICATION_COUNTER_ID,
        options: { showContent: true }
      });
    } catch (error) {
      console.log("Publication counter not found, returning default value");
      return 0;
    }

    // Based on the contract, get_publication_count takes a counter and researcher address
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: buildInspectTxBlock(
        REPUTATION_MODULE.GET_PUBLICATION_COUNT,
        [PUBLICATION_COUNTER_ID, address]
      ),
      sender: address,
    });
    
    // Parse the result
    if (result.results && result.results[0] && result.results[0].returnValues) {
      // Convert array to string before passing to Number
      const returnValue = result.results[0].returnValues[0][0];
      return typeof returnValue === 'number' 
        ? returnValue 
        : Array.isArray(returnValue) 
          ? Number(returnValue.join('')) 
          : 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting publication count:", error);
    return 0;
  }
}

// Get review count for a researcher
export async function getReviewCount(address: string) {
  try {
    try {
      // Try to get the review counter object
      await suiClient.getObject({
        id: REVIEW_COUNTER_ID,
        options: { showContent: true }
      });
    } catch (error) {
      console.log("Review counter not found, returning default value");
      return 0;
    }

    // Based on the contract, get_review_count takes a counter and researcher address
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: buildInspectTxBlock(
        REPUTATION_MODULE.GET_REVIEW_COUNT,
        [REVIEW_COUNTER_ID, address]
      ),
      sender: address,
    });
    
    // Parse the result
    if (result.results && result.results[0] && result.results[0].returnValues) {
      // Convert array to string before passing to Number
      const returnValue = result.results[0].returnValues[0][0];
      return typeof returnValue === 'number' 
        ? returnValue 
        : Array.isArray(returnValue) 
          ? Number(returnValue.join('')) 
          : 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting review count:", error);
    return 0;
  }
}

// Get citation count for a researcher
export async function getCitationCount(address: string) {
  try {
    try {
      // Try to get the citation counter object
      await suiClient.getObject({
        id: CITATION_COUNTER_ID,
        options: { showContent: true }
      });
    } catch (error) {
      console.log("Citation counter not found, returning default value");
      return 0;
    }

    // Based on the contract, get_citation_count takes a counter and researcher address
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: buildInspectTxBlock(
        REPUTATION_MODULE.GET_CITATION_COUNT,
        [CITATION_COUNTER_ID, address]
      ),
      sender: address,
    });
    
    // Parse the result
    if (result.results && result.results[0] && result.results[0].returnValues) {
      // Convert array to string before passing to Number
      const returnValue = result.results[0].returnValues[0][0];
      return typeof returnValue === 'number' 
        ? returnValue 
        : Array.isArray(returnValue) 
          ? Number(returnValue.join('')) 
          : 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting citation count:", error);
    return 0;
  }
}

// Helper function to build transaction blocks for read-only calls
function buildInspectTxBlock(target: string, args: (string | number | bigint)[]): Transaction {
  const tx = new Transaction();
  const callArgs = args.map(arg => {
    if (typeof arg === 'string' && arg.startsWith('0x')) {
      // If it's an object ID (starts with 0x), use it as an object reference
      return tx.object(arg);
    } else if (typeof arg === 'string') {
      // If it's a regular string that doesn't start with 0x, it's likely an address
      // Check if it's a valid address format (starts with 0x)
      if (arg.startsWith('0x')) {
        return tx.pure.address(arg);
      } else {
        // If it's not a valid address format, convert it to a string
        return tx.pure.string(arg);
      }
    } else {
      // If it's a number or bigint, convert it to u64
      return tx.pure.u64(BigInt(arg));
    }
  });
  
  tx.moveCall({
    target,
    arguments: callArgs,
  });
  
  return tx;
}