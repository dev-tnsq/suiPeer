# SuiPeer ZK Circuits

This directory contains the zero-knowledge circuits used in the SuiPeer platform for privacy-preserving verification of researcher credentials and anonymous reviews.

## Current Status

The ZK circuits are currently in development. We've encountered some issues with the Circom compilation process that need to be resolved.

## Circuit Descriptions

### 1. Researcher Credentials (researcher_credentials.circom)

This circuit verifies that a researcher has valid credentials without revealing them. It uses a Poseidon hash to verify the credential hash matches the expected value.

**Private inputs:**
- privateCredentialHash: Hash of researcher's credentials
- privateInstitutionId: ID of the institution
- privateResearcherId: Researcher's private ID
- privateEducationLevel: Education level (1: Bachelor, 2: Master, 3: PhD)
- privateYearsExperience: Years of experience

**Public inputs:**
- publicCredentialCommitment: Public commitment to the credentials (Poseidon hash)
- publicInstitutionVerified: 0 or 1 indicating if institution is verified
- publicMinEducationLevel: Minimum education level required (1-3)
- publicMinExperience: Minimum years of experience required
- publicDomainId: Research domain ID

### 2. Reviewer Qualification (reviewer_qualification.circom)

This circuit verifies that a reviewer is qualified to review papers in a specific domain without revealing their identity or specific qualifications.

**Private inputs:**
- privateResearcherId: Researcher's private ID
- privateDomainExpertise: Level of expertise in the domain (1-10)
- privatePublicationCount: Number of publications in the domain
- privateCitationCount: Number of citations in the domain
- privateReviewHistory: Hash of previous review history

**Public inputs:**
- publicDomainId: Research domain ID
- publicMinExpertiseLevel: Minimum expertise level required (1-10)
- publicMinPublications: Minimum number of publications required
- publicReviewerCommitment: Public commitment to the reviewer's qualifications (Poseidon hash)

### 3. Anonymous Review (anonymous_review.circom)

This circuit allows a reviewer to submit a review anonymously while proving they are qualified to review the paper and haven't already reviewed it.

**Private inputs:**
- privateReviewerId: Reviewer's private ID
- privateQualificationProof: Hash of the reviewer's qualification proof
- privateReviewContent: Hash of the review content
- privateReviewScore: Score given to the paper (0-10)

**Public inputs:**
- publicPaperId: ID of the paper being reviewed
- publicPaperAuthorId: ID of the paper's author
- publicDomainId: Research domain ID of the paper
- publicReviewHash: Hash of the review (to be stored on-chain)

## Known Issues

There are currently issues with the Circom compilation process. The error message suggests there might be problems with line endings or invisible characters in the circuit files.

Error message:
```
Parse error on line 1:
pragma circom 2.0.0;include "node
---------------^
```

## Temporary Solution

For development purposes, we've created a mock implementation of the ZK proof generation and verification in `sui-peer/utils/mock-zk-utils.ts`. This allows the frontend to function while we resolve the issues with the Circom compilation.

## Compilation and Deployment

We've created a comprehensive script to compile and deploy the ZK circuits:

```bash
# Run the compile-and-deploy.js script
node compile-and-deploy.js
```

This script will:
1. Compile the ZK circuits using Circom
2. Generate the proving and verification keys
3. Copy the artifacts to the frontend's public directory

## Troubleshooting

If you encounter issues with the compilation process, we've created a script to help diagnose and fix the Circom compilation issues:

```bash
# Run the fix-circuits.js script
node fix-circuits.js
```

This script will:
1. Create a minimal test circuit to verify the Circom installation
2. Extract the important parts from each circuit file
3. Create new files with proper formatting
4. Try to compile the fixed circuits

If any of the fixed circuits compile successfully, you can use them to replace the original files.

## Fallback to Mock Implementation

If you're unable to compile the ZK circuits, you can use the mock implementation:

1. Make sure `mock-zk-utils.ts` exists in the `sui-peer/utils` directory
2. Update the imports in the frontend components to use `mock-zk-utils.ts` instead of `zk-utils.ts`

## Next Steps

1. Resolve the Circom compilation issues
   - Use the fix-circuits.js script to diagnose and fix the issues
   - Check for invisible characters or line ending issues
   - Try creating the files from scratch with a different editor
   - Verify the Circom installation

2. Complete the circuit implementations
   - Ensure all constraints are quadratic (at most degree 2)
   - Add proper validation for all inputs

3. Generate proving and verification keys
   - Use a trusted setup ceremony for production
   - Generate test keys for development

4. Integrate with the smart contracts
   - Implement the verification logic in Move
   - Connect the frontend to the on-chain verification

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Poseidon Hash](https://www.poseidon-hash.info/)
- [ZK Proof Systems Overview](https://zkp.science/)