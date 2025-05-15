pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";

/*
 * ReviewerQualification circuit
 * 
 * This circuit verifies that a reviewer is qualified to review papers in a specific domain
 * without revealing their identity or specific qualifications.
 * 
 * Private inputs:
 * - privateResearcherId: Researcher's private ID
 * - privateDomainExpertise: Level of expertise in the domain (1-10)
 * - privatePublicationCount: Number of publications in the domain
 * - privateCitationCount: Number of citations in the domain
 * - privateReviewHistory: Hash of previous review history
 * 
 * Public inputs:
 * - publicDomainId: Research domain ID
 * - publicMinExpertiseLevel: Minimum expertise level required (1-10)
 * - publicMinPublications: Minimum number of publications required
 * - publicReviewerCommitment: Public commitment to the reviewer's qualifications (Poseidon hash)
 */
template ReviewerQualification() {
    // Private inputs
    signal input privateResearcherId;
    signal input privateDomainExpertise;
    signal input privatePublicationCount;
    signal input privateCitationCount;
    signal input privateReviewHistory;
    
    // Public inputs
    signal input publicDomainId;
    signal input publicMinExpertiseLevel;
    signal input publicMinPublications;
    signal input publicReviewerCommitment;
    
    // Output
    signal output verified;
    
    // 1. Verify the reviewer's qualifications match the commitment
    component hasher = Poseidon(5);
    hasher.inputs[0] <== privateResearcherId;
    hasher.inputs[1] <== privateDomainExpertise;
    hasher.inputs[2] <== privatePublicationCount;
    hasher.inputs[3] <== privateCitationCount;
    hasher.inputs[4] <== privateReviewHistory;
    
    // Check if the computed hash matches the public commitment
    component hashCheck = IsEqual();
    hashCheck.in[0] <== hasher.out;
    hashCheck.in[1] <== publicReviewerCommitment;
    
    // 2. Verify expertise level meets minimum requirements
    component expertiseCheck = GreaterEqThan(4); // 4 bits can represent values 0-15
    expertiseCheck.in[0] <== privateDomainExpertise;
    expertiseCheck.in[1] <== publicMinExpertiseLevel;
    
    // 3. Verify publication count meets minimum requirements
    component publicationCheck = GreaterEqThan(8); // 8 bits can represent values 0-255
    publicationCheck.in[0] <== privatePublicationCount;
    publicationCheck.in[1] <== publicMinPublications;
    
    // 4. Verify the researcher has expertise in the specific domain
    // For a real implementation, we would check this against a Merkle tree of domain expertise
    // For simplicity, we'll check that the citation count is sufficient for domain expertise
    component citationCheck = GreaterEqThan(8); // 8 bits can represent values 0-255
    citationCheck.in[0] <== privateCitationCount;
    citationCheck.in[1] <== 5; // Minimum 5 citations in the domain
    
    // 5. Verify the reviewer hasn't reviewed too many papers recently (prevent review farming)
    // This is a simplified check - in a real implementation, we would use a more sophisticated approach
    // Instead of using modulo (which creates non-quadratic constraints), we'll use the last few bits
    component reviewHistoryBits = Num2Bits(64);
    reviewHistoryBits.in <== privateReviewHistory;
    
    // Use the first 5 bits to represent the number of recent reviews (0-31)
    signal recentReviewCount;
    recentReviewCount <== reviewHistoryBits.out[0] + 
                          reviewHistoryBits.out[1] * 2 + 
                          reviewHistoryBits.out[2] * 4 + 
                          reviewHistoryBits.out[3] * 8 +
                          reviewHistoryBits.out[4] * 16;
    
    component reviewHistoryCheck = LessThan(8);
    reviewHistoryCheck.in[0] <== recentReviewCount;
    reviewHistoryCheck.in[1] <== 20; // Maximum 20 reviews in recent history
    
    // 6. Verify the reviewer has expertise in the specific domain ID
    component domainExpertiseHasher = Poseidon(2);
    domainExpertiseHasher.inputs[0] <== privateResearcherId;
    domainExpertiseHasher.inputs[1] <== publicDomainId;
    
    // Convert the hash to a number between 0-10 to represent domain-specific expertise
    component domainExpertiseBits = Num2Bits(64);
    domainExpertiseBits.in <== domainExpertiseHasher.out;
    
    // Use the first 4 bits (values 0-15) and ensure it's at least 6 (on a scale of 0-15)
    // This simulates domain-specific expertise derived from the researcher ID and domain
    signal domainSpecificExpertise;
    domainSpecificExpertise <== domainExpertiseBits.out[0] + 
                               domainExpertiseBits.out[1] * 2 + 
                               domainExpertiseBits.out[2] * 4 + 
                               domainExpertiseBits.out[3] * 8;
    
    component domainExpertiseCheck = GreaterEqThan(4);
    domainExpertiseCheck.in[0] <== domainSpecificExpertise;
    domainExpertiseCheck.in[1] <== 6; // Minimum domain-specific expertise of 6 (out of 15)
    
    // All checks must pass for verification to succeed
    // Break down the multiplication into intermediate steps to keep constraints quadratic
    signal intermediate1 <== hashCheck.out * expertiseCheck.out;
    signal intermediate2 <== publicationCheck.out * citationCheck.out;
    signal intermediate3 <== reviewHistoryCheck.out * domainExpertiseCheck.out;
    signal intermediate4 <== intermediate1 * intermediate2;
    verified <== intermediate4 * intermediate3;
}

component main = ReviewerQualification();