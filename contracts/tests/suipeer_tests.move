#[test_only]
module suipeer::suipeer_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};

    use suipeer::platform::{Self, Researcher, PlatformConfig, AdminCap, ResearchPaper, Treasury};
    use suipeer::token_rewards::{Self, RewardsAdminCap, RewardsTreasury, PEER};
    use suipeer::zk_verification::{Self, ZKProofVerifier, VerifierAdminCap};
    use suipeer::reputation::{Self, ReputationRegistry, PublicationCounter};
    use suipeer::governance::{Self, GovernanceRegistry, StakingPool};

    // Test addresses
    const ADMIN: address = @0xABCD;
    const RESEARCHER1: address = @0x1234;
    const RESEARCHER2: address = @0x5678;
    const RESEARCHER3: address = @0x9ABC;

    // Test constants for ZK proofs (these are not real proofs, just for testing)
    const VALID_RESEARCHER_PROOF: vector<u8> = x"0123456789ABCDEF0123456789ABCDEF";
    const VALID_REVIEWER_PROOF: vector<u8> = x"FEDCBA9876543210FEDCBA9876543210";
    const VALID_PUBLIC_INPUTS: vector<u8> = x"DEADBEEFDEADBEEF";

    // Setup function to initialize all modules
    fun setup(): Scenario {
        let scenario = ts::begin(ADMIN);
        
        // Initialize platform module
        {
            ts::next_tx(&mut scenario, ADMIN);
            platform::init(ts::ctx(&mut scenario));
        };
        
        // Initialize token rewards module
        {
            ts::next_tx(&mut scenario, ADMIN);
            token_rewards::init(ts::ctx(&mut scenario));
        };
        
        // Initialize zk verification module
        {
            ts::next_tx(&mut scenario, ADMIN);
            zk_verification::init(ts::ctx(&mut scenario));
        };
        
        // Initialize reputation module
        {
            ts::next_tx(&mut scenario, ADMIN);
            reputation::init(ts::ctx(&mut scenario));
        };
        
        // Initialize governance module
        {
            ts::next_tx(&mut scenario, ADMIN);
            governance::init(ts::ctx(&mut scenario));
        };
        
        // Initialize a clock for governance timing
        {
            ts::next_tx(&mut scenario, ADMIN);
            clock::create_for_testing(ts::ctx(&mut scenario));
        };
        
        scenario
    }
    
    // Test researcher registration and verification
    #[test]
    fun test_researcher_registration() {
        let scenario = setup();
        
        // Register a researcher
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            platform::register_researcher(
                std::string::utf8(b"Alice"),
                std::string::utf8(b"University of Blockchain"),
                ts::ctx(&mut scenario)
            );
        };
        
        // Admin verifies the researcher
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let researcher = ts::take_shared<Researcher>(&scenario);
            
            platform::verify_researcher(&admin_cap, &mut researcher);
            
            // Check that the researcher is now verified
            assert!(researcher.verified, 0);
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(researcher);
        };
        
        // Another researcher registers and gets verified with ZK proof
        {
            ts::next_tx(&mut scenario, RESEARCHER2);
            platform::register_researcher(
                std::string::utf8(b"Bob"),
                std::string::utf8(b"Institute of Cryptography"),
                ts::ctx(&mut scenario)
            );
            
            ts::next_tx(&mut scenario, RESEARCHER2);
            let researcher = ts::take_shared_by_id<Researcher>(&scenario, ts::ids_for_sender<Researcher>(&scenario)[0]);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            
            // This would fail in production as we need a real proof, but our test implementation allows this
            platform::verify_researcher_with_zk(
                &mut researcher,
                VALID_RESEARCHER_PROOF,
                VALID_PUBLIC_INPUTS,
                &verifier,
                ts::ctx(&mut scenario)
            );
            
            // Check that the researcher is now verified
            assert!(researcher.verified, 0);
            
            ts::return_shared(researcher);
            ts::return_shared(verifier);
        };
        
        ts::end(scenario);
    }
    
    // Test paper submission and review flow
    #[test]
    fun test_paper_submission_and_review() {
        let scenario = setup();
        
        // Register and verify researchers
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            platform::register_researcher(
                std::string::utf8(b"Alice"),
                std::string::utf8(b"University of Blockchain"),
                ts::ctx(&mut scenario)
            );
            
            ts::next_tx(&mut scenario, RESEARCHER2);
            platform::register_researcher(
                std::string::utf8(b"Bob"),
                std::string::utf8(b"Institute of Cryptography"),
                ts::ctx(&mut scenario)
            );
            
            ts::next_tx(&mut scenario, RESEARCHER3);
            platform::register_researcher(
                std::string::utf8(b"Charlie"),
                std::string::utf8(b"Decentralized Science Academy"),
                ts::ctx(&mut scenario)
            );
            
            // Admin verifies all researchers
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            let researcher1 = ts::take_shared<Researcher>(&scenario);
            platform::verify_researcher(&admin_cap, &mut researcher1);
            ts::return_shared(researcher1);
            
            let researcher2 = ts::take_shared<Researcher>(&scenario);
            platform::verify_researcher(&admin_cap, &mut researcher2);
            ts::return_shared(researcher2);
            
            let researcher3 = ts::take_shared<Researcher>(&scenario);
            platform::verify_researcher(&admin_cap, &mut researcher3);
            ts::return_shared(researcher3);
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        // Add reviewer qualifications to researchers 2 and 3
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            let researcher2 = ts::take_shared<Researcher>(&scenario);
            platform::admin_verify_reviewer_qualification(
                &admin_cap,
                &mut researcher2,
                std::string::utf8(b"Blockchain"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(researcher2);
            
            let researcher3 = ts::take_shared<Researcher>(&scenario);
            platform::admin_verify_reviewer_qualification(
                &admin_cap,
                &mut researcher3,
                std::string::utf8(b"Blockchain"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(researcher3);
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        // Submit a paper
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let researcher = ts::take_shared<Researcher>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            platform::submit_paper(
                &researcher,
                &config,
                std::string::utf8(b"Zero-Knowledge Proofs in Academic Publishing"),
                std::string::utf8(b"This paper explores the use of ZKPs in preserving reviewer anonymity."),
                x"ABCDEF1234567890",
                std::string::utf8(b"Blockchain"),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(researcher);
            ts::return_shared(config);
        };
        
        // Submit reviews
        {
            ts::next_tx(&mut scenario, RESEARCHER2);
            let researcher = ts::take_shared_by_id<Researcher>(&scenario, ts::most_recent_id_for_address<Researcher>(RESEARCHER2));
            let paper = ts::take_shared<ResearchPaper>(&scenario);
            
            platform::submit_review(
                &researcher,
                &mut paper,
                x"FEDBCA0987654321",
                8, // score out of 10
                true, // approved
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(researcher);
            ts::return_shared(paper);
        };
        
        {
            ts::next_tx(&mut scenario, RESEARCHER3);
            let researcher = ts::take_shared_by_id<Researcher>(&scenario, ts::most_recent_id_for_address<Researcher>(RESEARCHER3));
            let paper = ts::take_shared<ResearchPaper>(&scenario);
            
            platform::submit_review(
                &researcher,
                &mut paper,
                x"1234ABCD5678EFGH",
                7, // score out of 10
                true, // approved
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(researcher);
            ts::return_shared(paper);
        };
        
        // Anonymous review
        {
            ts::next_tx(&mut scenario, ADMIN); // In reality this would be from any verified reviewer
            let paper = ts::take_shared<ResearchPaper>(&scenario);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            
            platform::submit_anonymous_review(
                &mut paper,
                x"ANONYMOUS_REVIEW_HASH",
                9, // score out of 10
                true, // approved
                VALID_REVIEWER_PROOF,
                VALID_PUBLIC_INPUTS,
                &verifier,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(paper);
            ts::return_shared(verifier);
        };
        
        // Finalize publication
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let paper = ts::take_shared<ResearchPaper>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            platform::finalize_publication(
                &mut paper,
                &config,
                ts::ctx(&mut scenario)
            );
            
            // Check that paper is now published
            assert!(paper.status == 2, 0); // 2 = STATUS_PUBLISHED
            
            ts::return_shared(paper);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }
    
    // Test token rewards
    #[test]
    fun test_token_rewards() {
        let scenario = setup();
        
        // Mint PEER tokens and deposit to treasury
        {
            ts::next_tx(&mut scenario, ADMIN);
            let treasury_cap = ts::take_from_sender<coin::TreasuryCap<PEER>>(&scenario);
            let admin_cap = ts::take_from_sender<RewardsAdminCap>(&scenario);
            let treasury = ts::take_shared<RewardsTreasury>(&scenario);
            
            // Mint 1000 PEER tokens to the treasury
            token_rewards::mint_peer(
                &mut treasury_cap,
                &admin_cap,
                &mut treasury,
                1000000000000, // 1000 tokens with 9 decimals
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, treasury_cap);
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };
        
        // Reward a researcher for publication
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<RewardsAdminCap>(&scenario);
            let treasury = ts::take_shared<RewardsTreasury>(&scenario);
            
            token_rewards::reward_for_publication(
                &admin_cap,
                &mut treasury,
                RESEARCHER1,
                0, // 0 SUI
                100000000000, // 100 PEER tokens
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    // Test reputation system
    #[test]
    fun test_reputation() {
        let scenario = setup();
        
        // Award publication points
        {
            ts::next_tx(&mut scenario, ADMIN);
            let registry = ts::take_shared<ReputationRegistry>(&scenario);
            let counter = ts::take_shared<PublicationCounter>(&scenario);
            
            reputation::award_publication_points(
                &mut registry,
                &mut counter,
                RESEARCHER1,
                ts::ctx(&mut scenario)
            );
            
            // Check reputation score
            let score = reputation::get_reputation_score(&registry, RESEARCHER1);
            assert_eq(score, 100); // PUBLICATION_POINTS
            
            ts::return_shared(registry);
            ts::return_shared(counter);
        };
        
        ts::end(scenario);
    }
    
    // Test governance
    #[test]
    fun test_governance() {
        let scenario = setup();
        
        // First mint some PEER tokens for staking
        {
            ts::next_tx(&mut scenario, ADMIN);
            let treasury_cap = ts::take_from_sender<coin::TreasuryCap<PEER>>(&scenario);
            let coins = coin::mint_for_testing<PEER>(200000000000, ts::ctx(&mut scenario)); // 200 PEER
            
            ts::next_tx(&mut scenario, ADMIN);
            ts::transfer(&scenario, coins, RESEARCHER1);
            ts::return_to_sender(&scenario, treasury_cap);
        };
        
        // Stake tokens
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let staking_pool = ts::take_shared<StakingPool>(&scenario);
            let coins = ts::take_from_sender<Coin<PEER>>(&scenario);
            
            governance::stake_tokens(
                &mut staking_pool,
                coins,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(staking_pool);
        };
        
        // Create a proposal
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let registry = ts::take_shared<GovernanceRegistry>(&scenario);
            let staking_pool = ts::take_shared<StakingPool>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            governance::create_proposal(
                &mut registry,
                &staking_pool,
                1, // PROPOSAL_TYPE_PARAMETER_CHANGE
                std::string::utf8(b"Reduce minimum reviewers"),
                std::string::utf8(b"Proposal to reduce minimum reviewers from 3 to 2"),
                86400, // 1 day duration
                x"00", // execution data
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
            ts::return_shared(staking_pool);
            ts::return_shared(clock);
        };
        
        // Vote on the proposal
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let registry = ts::take_shared<GovernanceRegistry>(&scenario);
            let staking_pool = ts::take_shared<StakingPool>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            governance::vote_on_proposal(
                &mut registry,
                &staking_pool,
                ts::most_recent_id_for_address<sui::object::UID>(RESEARCHER1), // proposal ID (hacky but works for test)
                true, // YES vote
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
            ts::return_shared(staking_pool);
            ts::return_shared(clock);
        };
        
        // Fast forward time and finalize proposal
        {
            ts::next_tx(&mut scenario, ADMIN);
            let clock = ts::take_shared<Clock>(&scenario);
            // Advance clock by 2 days
            clock::increment_for_testing(&mut clock, 172800 * 1000); // 2 days in milliseconds
            ts::return_shared(clock);
            
            ts::next_tx(&mut scenario, ADMIN);
            let registry = ts::take_shared<GovernanceRegistry>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            governance::finalize_proposal(
                &mut registry,
                ts::most_recent_id_for_address<sui::object::UID>(RESEARCHER1), // proposal ID
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
            ts::return_shared(clock);
        };
        
        ts::end(scenario);
    }
    
    // Test ZK verification
    #[test]
    fun test_zk_verification() {
        let scenario = setup();
        
        // Test researcher credential verification
        {
            ts::next_tx(&mut scenario, RESEARCHER1);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            
            // This would fail in real deployment but works for test
            let is_valid = zk_verification::verify_researcher_credentials(
                &verifier,
                VALID_RESEARCHER_PROOF,
                VALID_PUBLIC_INPUTS,
                ts::ctx(&mut scenario)
            );
            
            assert!(is_valid, 0);
            
            ts::return_shared(verifier);
        };
        
        // Update verification keys
        {
            ts::next_tx(&mut scenario, ADMIN);
            let verifier = ts::take_shared<ZKProofVerifier>(&scenario);
            let admin_cap = ts::take_from_sender<VerifierAdminCap>(&scenario);
            
            zk_verification::update_verification_keys(
                &mut verifier,
                &admin_cap,
                x"NEW_RESEARCHER_VK",
                x"NEW_REVIEWER_VK",
                x"NEW_ANONYMOUS_VK",
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(verifier);
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        ts::end(scenario);
    }
    
    // Test platform configuration
    #[test]
    fun test_platform_config() {
        let scenario = setup();
        
        // Update min reviewers
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            platform::set_min_reviewers(
                &admin_cap,
                &mut config,
                5, // New minimum reviewers
                ts::ctx(&mut scenario)
            );
            
            // Check config was updated
            assert!(config.min_reviewers == 5, 0);
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };
        
        // Update approval threshold
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            platform::set_approval_threshold(
                &admin_cap,
                &mut config,
                60, // 60% approval required
                ts::ctx(&mut scenario)
            );
            
            // Check config was updated
            assert!(config.approval_threshold == 60, 0);
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };
        
        // Emergency pause/resume
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            platform::pause_platform(
                &admin_cap,
                &mut config,
                ts::ctx(&mut scenario)
            );
            
            // Check platform is paused
            assert!(config.paused, 0);
            
            platform::resume_platform(
                &admin_cap,
                &mut config,
                ts::ctx(&mut scenario)
            );
            
            // Check platform is resumed
            assert!(!config.paused, 0);
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }
    
    // Test emergency withdrawal from treasury
    #[test]
    fun test_emergency_withdrawal() {
        let scenario = setup();
        
        // First deposit some SUI to treasury
        {
            ts::next_tx(&mut scenario, ADMIN);
            let treasury = ts::take_shared<Treasury>(&scenario);
            let coin = coin::mint_for_testing<SUI>(1000000000, ts::ctx(&mut scenario)); // 1 SUI
            
            platform::deposit_to_treasury(
                &mut treasury,
                coin,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(treasury);
        };
        
        // Emergency withdrawal
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let treasury = ts::take_shared<Treasury>(&scenario);
            
            platform::emergency_withdraw(
                &admin_cap,
                &config,
                &mut treasury,
                500000000, // 0.5 SUI
                ADMIN,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
}
