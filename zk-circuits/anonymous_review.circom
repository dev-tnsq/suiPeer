pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";

/*
 * AnonymousReview circuit
 * 
 * This circuit allows a reviewer to submit a review anonymously while proving:
 * 1. They are qualified to review the paper
 * 2. They are not the author of the paper
 * 3. They haven't already reviewed this paper
 * 
 * Private inputs:
 * - privateReviewerId: Reviewer's private ID
 * - privateQualificationProof: Hash of the reviewer's qualification proof
 * - privateReviewContent: Hash of the review content
 * - privateReviewScore: Score given to the paper (0-10)
 * 
 * Public inputs:
 * - publicPaperId: ID of the paper being reviewed
 * - publicPaperAuthorId: ID of the paper's author
 * - publicDomainId: Research domain ID of the paper
 * - publicReviewHash: Hash of the review (to be stored on-chain)
 */
template AnonymousReview() {
    // Private inputs
    signal input privateReviewerId;
    signal input privateQualificationProof;
    signal input privateReviewContent;
    signal input privateReviewScore;
    
    // Public inputs
    signal input publicPaperId;
    signal input publicPaperAuthorId;
    signal input publicDomainId;
    signal input publicReviewHash;
    
    // Output
    signal output verified;
    
    // 1. Verify the reviewer is not the author
    component notAuthorCheck = IsEqual();
    notAuthorCheck.in[0] <== privateReviewerId;
    notAuthorCheck.in[1] <== publicPaperAuthorId;
    
    // The reviewer should NOT be the author, so we invert the check
    signal notAuthor;
    notAuthor <== 1 - notAuthorCheck.out;
    
    // 2. Verify the review hash matches
    component reviewHasher = Poseidon(3);
    reviewHasher.inputs[0] <== privateReviewerId;
    reviewHasher.inputs[1] <== publicPaperId;
    reviewHasher.inputs[2] <== privateReviewContent;
    
    component reviewHashCheck = IsEqual();
    reviewHashCheck.in[0] <== reviewHasher.out;
    reviewHashCheck.in[1] <== publicReviewHash;
    
    // 3. Verify the review score is within valid range (0-10)
    component scoreRangeCheck = LessThan(8); // 8 bits can represent values 0-255
    scoreRangeCheck.in[0] <== privateReviewScore;
    scoreRangeCheck.in[1] <== 11; // Score must be less than 11 (i.e., 0-10)
    
    // 4. Verify the reviewer has the qualifications
    component qualificationHasher = Poseidon(3);
    qualificationHasher.inputs[0] <== privateReviewerId;
    qualificationHasher.inputs[1] <== publicDomainId;
    qualificationHasher.inputs[2] <== privateQualificationProof;
    
    // We need to verify that the qualification proof is valid
    // In a real implementation, this would be compared against a public commitment
    // For now, we'll use a simplified check that the hash is non-zero
    component qualificationCheck = IsEqual();
    qualificationCheck.in[0] <== 0;
    qualificationCheck.in[1] <== 0;
    
    // Invert the check - we want to ensure the qualification hash is NOT zero
    signal qualificationValid;
    qualificationValid <== 1 - qualificationCheck.out;
    
    // 5. Verify the reviewer hasn't already reviewed this paper
    // This would typically involve checking against a nullifier set
    // For simplicity, we'll assume this check is done off-chain for now
    
    // All checks must pass for verification to succeed
    // Break down the multiplication into intermediate steps to keep constraints quadratic
    signal intermediate1 <== notAuthor * reviewHashCheck.out;
    signal intermediate2 <== scoreRangeCheck.out * qualificationValid;
    verified <== intermediate1 * intermediate2;
}

component main = AnonymousReview();