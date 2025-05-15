// Package and object IDs from the deployed contracts
export const PACKAGE_ID = "0xc7346dc875165e99edfea5b413942ded8e936c6c38bd43a4c5618bc8a9dff8ea";
export const PLATFORM_CONFIG_ID = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
export const TREASURY_ID = "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef";
export const REPUTATION_REGISTRY_ID = "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef";
export const PUBLICATION_COUNTER_ID = "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef"; // Update with actual ID
export const REVIEW_COUNTER_ID = "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef"; // Update with actual ID
export const CITATION_COUNTER_ID = "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef"; // Update with actual ID
export const GOVERNANCE_REGISTRY_ID = "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef";
export const ZK_VERIFIER_ID = "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef";
export const STAKING_POOL_ID = "0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef";

// Network configuration
export const NETWORK = "testnet"; // Change to "mainnet" for production

// zkLogin configuration
export const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/callback";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Default gas budget for transactions
export const DEFAULT_GAS_BUDGET = 10000000;