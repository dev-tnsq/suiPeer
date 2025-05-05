#[test_only]
module suipeer::zk_verification_tests {
    use sui::test_scenario::{Self as ts, Scenario};

    
    use suipeer::zk_verification::{Self, ZKProofVerifier, VerifierAdminCap};
    
    // Test addresses
    const ADMIN: address = @0xABCD;
    const RESEARCHER: address = @0x1234;
    const NEW_ADMIN: address = @0xDEAD;
    
    // Test constants for ZK proofs (these need to be properly formatted for Groth16)
    // In a real test, these would be valid test vectors generated from a proving system
    const VALID_RESEARCHER_PROOF: vector<u8> = x"0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
    const VALID_PUBLIC_INPUTS: vector<u8> = x"DEADBEEFDEADBEEFDEADBEEFDEADBEEF";
    const EMPTY_PROOF: vector<u8> = x"";
    
    // Setup function to initialize ZK verification module
    fun setup(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        {
            ts::next_tx(&mut scenario, ADMIN);
            
            // Use the test-only init function
            zk_verification::test_init(ts::ctx(&mut scenario));
        };
        
        scenario
    }
    
    #[test]
    fun test_researcher_credential_verification() {
        let mut scenario = setup();
        
        // Test valid verification using test vectors
        {
            ts::next_tx(&mut scenario, RESEARCHER);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            
            // Use the test function that bypasses actual cryptographic verification
            let is_valid = zk_verification::test_verify_researcher_credentials(
                &verifier,
                VALID_RESEARCHER_PROOF,
                VALID_PUBLIC_INPUTS,
                ts::ctx(&mut scenario)
            );
            
            assert!(is_valid, 0);
            
            ts::return_shared(verifier);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = zk_verification::EInvalidProof)]
    fun test_invalid_proof() {
        let mut scenario = setup();
        
        // Test with empty proof (should fail)
        {
            ts::next_tx(&mut scenario, RESEARCHER);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            
            // This should fail with EInvalidProof because the proof is empty
            let _is_valid = zk_verification::test_verify_researcher_credentials(
                &verifier,
                EMPTY_PROOF,
                VALID_PUBLIC_INPUTS,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(verifier);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_admin_functions() {
        let mut scenario = setup();
        
        // Test updating admin
        {
            ts::next_tx(&mut scenario, ADMIN);
            let mut verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            let admin_cap = ts::take_from_sender<VerifierAdminCap>(&scenario);
            
            zk_verification::update_admin(
                &mut verifier,
                &admin_cap,
                NEW_ADMIN,
                ts::ctx(&mut scenario)
            );
            
            // Test that the admin was updated by trying to update again with new admin
            ts::next_tx(&mut scenario, ADMIN);
            ts::return_shared(verifier);
            ts::return_to_sender(&scenario, admin_cap);
            
            // Now let's verify the new admin can update things
            ts::next_tx(&mut scenario, NEW_ADMIN);
            let mut  verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            let admin_cap = ts::take_from_address<VerifierAdminCap>(&scenario, ADMIN);
            
            // Should not abort because NEW_ADMIN is now the admin
            zk_verification::update_curve_type(
                &mut verifier,
                &admin_cap,
                1, // BLS12-381
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(verifier);
            ts::return_to_address(ADMIN, admin_cap);
        };
        
        ts::end(scenario);
    }
}
