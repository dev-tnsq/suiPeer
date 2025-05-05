module suipeer::zk_verification {
    use sui::event;
    use sui::groth16::{bn254, bls12381, prepare_verifying_key, proof_points_from_bytes, public_proof_inputs_from_bytes, verify_groth16_proof};
    
    // Error codes
    const EInvalidProof: u64 = 1;
    const EUnauthorizedVerifier: u64 = 2;
    const EInvalidPublicInputs: u64 = 3;
    const EInvalidProofFormat: u64 = 4;
    
    // A structure to represent a ZK proof verification system
    public struct ZKProofVerifier has key {
        id: UID,
        admin: address,
        // Verification keys for different proof types
        researcher_vk: vector<u8>,
        reviewer_vk: vector<u8>,
        anonymous_vk: vector<u8>,
        // Curve type to use (0 for BN254, 1 for BLS12-381)
        curve_type: u8
    }
    
    // Capability for managing verifier
    public struct VerifierAdminCap has key, store {
        id: UID
    }

    // Credential proof verified event
    public struct CredentialProofVerified has copy, drop {
        prover: address,
        credential_type: u8,
        timestamp: u64
    }

    // Reviewer anonymity proof verified event
    public struct ReviewerProofVerified has copy, drop {
        prover: address,
        paper_id: vector<u8>,
        timestamp: u64
    }
    
    // ProofType enum
    const PROOF_TYPE_RESEARCHER_CREDENTIAL: u8 = 1;
    const PROOF_TYPE_ANONYMOUS_REVIEW: u8 = 3;

    // Curve types
    const CURVE_BN254: u8 = 0;
    const CURVE_BLS12381: u8 = 1;

    // Initialize the verifier with default verification keys
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // In a real implementation, these would be actual verification keys
        // generated from a trusted setup ceremony for the specific circuits
        let researcher_vk = x"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        let reviewer_vk = x"abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        let anonymous_vk = x"7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456";
        
        let verifier = ZKProofVerifier {
            id: object::new(ctx),
            admin: sender,
            researcher_vk,
            reviewer_vk,
            anonymous_vk,
            curve_type: CURVE_BN254 // Default to BN254 curve
        };
        
        let admin_cap = VerifierAdminCap {
            id: object::new(ctx)
        };
        
        transfer::share_object(verifier);
        transfer::transfer(admin_cap, sender);
    }

    // Verify researcher credentials using ZK proof
    public fun verify_researcher_credentials(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // Verify the ZK proof using the researcher verification key
        let is_valid = verify_proof(
            verifier.curve_type,
            &verifier.researcher_vk,
            &public_inputs,
            &proof
        );
        
        if (is_valid) {
            event::emit(CredentialProofVerified {
                prover: tx_context::sender(ctx),
                credential_type: PROOF_TYPE_RESEARCHER_CREDENTIAL,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }

    // Verify reviewer qualifications using ZK proof
    public fun verify_reviewer_qualification(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // Verify the ZK proof using the reviewer verification key
        let is_valid = verify_proof(
            verifier.curve_type,
            &verifier.reviewer_vk,
            &public_inputs,
            &proof
        );
        
        if (is_valid) {
            event::emit(ReviewerProofVerified {
                prover: tx_context::sender(ctx),
                paper_id: public_inputs,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }
    
    // Verify anonymous review using ZK proof
    public fun verify_anonymous_review(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // In a real ZK implementation, this would verify:
        // 1. The reviewer has proper qualifications
        // 2. The reviewer hasn't already reviewed this paper
        // 3. The reviewer isn't the author
        // All without revealing the reviewer's identity
        
        // Verify the ZK proof using the anonymous review verification key
        let is_valid = verify_proof(
            verifier.curve_type,
            &verifier.anonymous_vk,
            &public_inputs,
            &proof
        );
        
        if (is_valid) {
            event::emit(CredentialProofVerified {
                prover: tx_context::sender(ctx),
                credential_type: PROOF_TYPE_ANONYMOUS_REVIEW,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }
    
    // Helper function to verify a proof using Sui's native Groth16 verification
    fun verify_proof(
        curve_type: u8,
        verification_key: &vector<u8>,
        public_inputs: &vector<u8>,
        proof: &vector<u8>
    ): bool {
        // Prepare the verification key
        let pvk = if (curve_type == CURVE_BN254) {
            prepare_verifying_key(&bn254(), verification_key)
        } else {
            prepare_verifying_key(&bls12381(), verification_key)
        };
        
        // Convert proof and public inputs to the format expected by the verifier
        let proof_points = proof_points_from_bytes(*proof);
        let inputs = public_proof_inputs_from_bytes(*public_inputs);
        
        // Verify the proof
        if (curve_type == CURVE_BN254) {
            verify_groth16_proof(&bn254(), &pvk, &inputs, &proof_points)
        } else {
            verify_groth16_proof(&bls12381(), &pvk, &inputs, &proof_points)
        }
    }
    
    // Update the verifier's verification keys (admin only)
    public entry fun update_verification_keys(
        verifier: &mut ZKProofVerifier,
        _admin_cap: &VerifierAdminCap,
        researcher_vk: vector<u8>,
        reviewer_vk: vector<u8>,
        anonymous_vk: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(verifier.admin == tx_context::sender(ctx), EUnauthorizedVerifier);
        
        // Update verification keys
        verifier.researcher_vk = researcher_vk;
        verifier.reviewer_vk = reviewer_vk;
        verifier.anonymous_vk = anonymous_vk;
    }
    
    // Update the curve type (admin only)
    public entry fun update_curve_type(
        verifier: &mut ZKProofVerifier,
        _admin_cap: &VerifierAdminCap,
        new_curve_type: u8,
        ctx: &mut TxContext
    ) {
        assert!(verifier.admin == tx_context::sender(ctx), EUnauthorizedVerifier);
        assert!(new_curve_type == CURVE_BN254 || new_curve_type == CURVE_BLS12381, EInvalidProofFormat);
        
        verifier.curve_type = new_curve_type;
    }
    
    // Update the verifier admin (admin only)
    public entry fun update_admin(
        verifier: &mut ZKProofVerifier,
        _admin_cap: &VerifierAdminCap,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert!(verifier.admin == tx_context::sender(ctx), EUnauthorizedVerifier);
        verifier.admin = new_admin;
    }
    
    // === Test-only functions ===
    
    #[test_only]
    /// Initialize the verifier for testing
    public fun test_init(ctx: &mut TxContext) {
        init(ctx)
    }
    
    #[test_only]
    /// Test version of verify_researcher_credentials that bypasses actual cryptographic verification
    public fun test_verify_researcher_credentials(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // For testing, we just check if the proof has sufficient length
        // In a real implementation, this would use cryptographic verification
        let is_valid = vector::length(&proof) >= 32;
        
        if (is_valid) {
            event::emit(CredentialProofVerified {
                prover: tx_context::sender(ctx),
                credential_type: PROOF_TYPE_RESEARCHER_CREDENTIAL,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }
    
    #[test_only]
    /// Test version of verify_reviewer_qualification that bypasses actual cryptographic verification
    public fun test_verify_reviewer_qualification(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // For testing, we just check if the proof has sufficient length
        let is_valid = vector::length(&proof) >= 32;
        
        if (is_valid) {
            event::emit(ReviewerProofVerified {
                prover: tx_context::sender(ctx),
                paper_id: public_inputs,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }
    
    #[test_only]
    /// Test version of verify_anonymous_review that bypasses actual cryptographic verification
    public fun test_verify_anonymous_review(
        verifier: &ZKProofVerifier,
        proof: vector<u8>,
        public_inputs: vector<u8>,
        ctx: &mut TxContext
    ): bool {
        // Validate inputs
        assert!(!vector::is_empty(&proof), EInvalidProof);
        assert!(!vector::is_empty(&public_inputs), EInvalidPublicInputs);
        
        // For testing, we just check if the proof has sufficient length
        let is_valid = vector::length(&proof) >= 32;
        
        if (is_valid) {
            event::emit(CredentialProofVerified {
                prover: tx_context::sender(ctx),
                credential_type: PROOF_TYPE_ANONYMOUS_REVIEW,
                timestamp: tx_context::epoch(ctx)
            });
        };
        
        is_valid
    }
}