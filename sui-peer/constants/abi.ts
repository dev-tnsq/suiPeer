// Import the package ID from sui.ts
import { PACKAGE_ID } from './sui';

// Module names and function targets
export const PLATFORM_MODULE = {
  REGISTER_RESEARCHER: `${PACKAGE_ID}::platform::register_researcher`,
  SUBMIT_PAPER: `${PACKAGE_ID}::platform::submit_paper`,
  SUBMIT_REVIEW: `${PACKAGE_ID}::platform::submit_review`,
  SUBMIT_ANONYMOUS_REVIEW: `${PACKAGE_ID}::platform::submit_anonymous_review`,
  CITE_PAPER: `${PACKAGE_ID}::platform::cite_paper`,
  VERIFY_REVIEWER_QUALIFICATION: `${PACKAGE_ID}::platform::verify_reviewer_qualification`,
  ADMIN_VERIFY_REVIEWER_QUALIFICATION: `${PACKAGE_ID}::platform::admin_verify_reviewer_qualification`,
};

export const ZK_VERIFICATION_MODULE = {
  VERIFY_RESEARCHER_CREDENTIALS: `${PACKAGE_ID}::zk_verification::verify_researcher_credentials`,
  VERIFY_REVIEWER_QUALIFICATION: `${PACKAGE_ID}::zk_verification::verify_reviewer_qualification`,
  VERIFY_ANONYMOUS_REVIEW: `${PACKAGE_ID}::zk_verification::verify_anonymous_review`,
};

export const REPUTATION_MODULE = {
  GET_REPUTATION: `${PACKAGE_ID}::reputation::get_reputation_score`,
  GET_PUBLICATION_COUNT: `${PACKAGE_ID}::reputation::get_publication_count`,
  GET_REVIEW_COUNT: `${PACKAGE_ID}::reputation::get_review_count`,
  GET_CITATION_COUNT: `${PACKAGE_ID}::reputation::get_citation_count`,
};

export const GOVERNANCE_MODULE = {
  STAKE_TOKENS: `${PACKAGE_ID}::governance::stake_tokens`,
  VOTE_ON_PROPOSAL: `${PACKAGE_ID}::governance::vote_on_proposal`,
};

export const TOKEN_REWARDS_MODULE = {
  CLAIM_REWARDS: `${PACKAGE_ID}::token_rewards::claim_rewards`,
  DISTRIBUTE_REWARDS: `${PACKAGE_ID}::token_rewards::distribute_rewards`,
};

// Object types for dynamic field access and type checking
export const OBJECT_TYPES = {
  RESEARCHER: `${PACKAGE_ID}::platform::Researcher`,
  RESEARCH_PAPER: `${PACKAGE_ID}::platform::ResearchPaper`,
  PEER_REVIEW: `${PACKAGE_ID}::platform::PeerReview`,
  RESEARCH_PAPER_NFT: `${PACKAGE_ID}::platform::ResearchPaperNFT`,
  REVIEWER_QUALIFICATION: `${PACKAGE_ID}::platform::ReviewerQualification`,
  STAKING_POSITION: `${PACKAGE_ID}::governance::StakingPosition`,
  PROPOSAL: `${PACKAGE_ID}::governance::Proposal`,
  ZK_PROOF_VERIFIER: `${PACKAGE_ID}::zk_verification::ZKProofVerifier`,
};

// Event types for parsing on-chain events
export const EVENT_TYPES = {
  RESEARCHER_REGISTERED: `${PACKAGE_ID}::platform::ResearcherRegistered`,
  RESEARCHER_VERIFIED: `${PACKAGE_ID}::platform::ResearcherVerified`,
  PAPER_SUBMITTED: `${PACKAGE_ID}::platform::PaperSubmitted`,
  REVIEW_SUBMITTED: `${PACKAGE_ID}::platform::ReviewSubmitted`,
  PAPER_PUBLISHED: `${PACKAGE_ID}::platform::PaperPublished`,
  REWARD_DISTRIBUTED: `${PACKAGE_ID}::platform::RewardDistributed`,
  CONFIG_UPDATED: `${PACKAGE_ID}::platform::ConfigUpdated`,
  CREDENTIAL_PROOF_VERIFIED: `${PACKAGE_ID}::zk_verification::CredentialProofVerified`,
  REVIEWER_PROOF_VERIFIED: `${PACKAGE_ID}::zk_verification::ReviewerProofVerified`,
  REPUTATION_INCREASED: `${PACKAGE_ID}::reputation::ReputationIncreased`,
  ACHIEVEMENT_EARNED: `${PACKAGE_ID}::reputation::AchievementEarned`,
  TOKENS_STAKED: `${PACKAGE_ID}::governance::TokensStaked`,
  VOTE_CAST: `${PACKAGE_ID}::governance::VoteCast`,
  REWARD_DISTRIBUTED_TOKEN: `${PACKAGE_ID}::token_rewards::RewardDistributed`,
};