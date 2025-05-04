// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module suipeer::platform {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
   
    use sui::event;
    use sui::package;
    use sui::display;
    use std::string::{Self, String};

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EInsufficientReviews: u64 = 6;
    const ENotVerified: u64 = 7;
    const EInvalidStatus: u64 = 8;
    const EInvalidAmount: u64 = 9;
    const EPlatformPaused: u64 = 10;
    const EInvalidThreshold: u64 = 11;
    const EInvalidReviewerCount: u64 = 12;
    const ENotQualified: u64 = 14;

    // Publication status
    const STATUS_SUBMITTED: u8 = 0;
    const STATUS_UNDER_REVIEW: u8 = 1;
    const STATUS_PUBLISHED: u8 = 2;
    const STATUS_REJECTED: u8 = 3;

    // Default platform settings
    const DEFAULT_MIN_REVIEWERS: u64 = 3;
    const DEFAULT_APPROVAL_THRESHOLD: u64 = 51; // Percentage needed for approval (51%)

    // OTW to authenticate the contract
    public struct PLATFORM has drop {}

    // Platform configuration
    public struct PlatformConfig has key {
        id: UID,
        min_reviewers: u64,
        approval_threshold: u64, // Percentage (0-100) of positive reviews needed for approval
        paused: bool,
        admin: address
    }

    // ====== Platform Admin ======
    public struct AdminCap has key, store {
        id: UID
    }

    // ====== Researcher Credentials ======
    public struct Researcher has key, store {
        id: UID,
        address: address,
        name: String,
        institution: String,
        verified: bool,
        reputation_score: u64,
        qualified_domains: vector<String> // Research domains the researcher is qualified to review
    }
    
    // ====== Reviewer Qualification ======
    public struct ReviewerQualification has key, store {
        id: UID,
        researcher: address,
        domain: String,        // Research domain (e.g., "Cryptography", "AI", "Blockchain")
        verified: bool,        // Whether the qualification has been verified
        verification_method: u8 // How it was verified (0: admin, 1: ZK proof, 2: reputation-based)
    }

    // ====== Paper Publication ======
    public struct ResearchPaper has key, store {
        id: UID,
        title: String,
        abstract: String,
        content_hash: vector<u8>, // IPFS hash of the paper content
        author: address,
        domain: String,           // Research domain of the paper
        status: u8,
        submission_timestamp: u64,
        publication_timestamp: Option<u64>,
        reviewer_count: u64,
        positive_reviews: u64,
        citation_count: u64
    }

    // ====== Research Paper NFT ======
    public struct ResearchPaperNFT has key, store {
        id: UID,
        paper_id: ID,
        title: String,
        author: address,
        publication_timestamp: u64,
        citation_count: u64
    }

    // ====== Peer Review ======
    public struct PeerReview has key, store {
        id: UID,
        paper_id: ID,
        reviewer: address,
        review_content_hash: vector<u8>, // IPFS hash of the review content
        score: u8, // 0-10 score
        approved: bool,
        timestamp: u64
    }

    // ====== Platform Treasury ======
    public struct Treasury has key {
        id: UID,
        balance: Balance<SUI>
    }

    // ====== Events ======
    public struct ResearcherRegistered has copy, drop {
        researcher_address: address,
        name: String,
        institution: String
    }

    public struct ResearcherVerified has copy, drop {
        researcher_address: address
    }

    public struct PaperSubmitted has copy, drop {
        paper_id: ID,
        title: String,
        author: address,
        domain: String
    }

    public struct ReviewSubmitted has copy, drop {
        paper_id: ID,
        reviewer: address,
        approved: bool
    }

    public struct PaperPublished has copy, drop {
        paper_id: ID,
        title: String,
        author: address
    }

    public struct RewardDistributed has copy, drop {
        recipient: address,
        amount: u64,
        reason: String
    }

    public struct ConfigUpdated has copy, drop {
        min_reviewers: u64,
        approval_threshold: u64,
        updated_by: address,
        timestamp: u64
    }

    public struct PlatformStatusChanged has copy, drop {
        paused: bool,
        changed_by: address,
        timestamp: u64
    }

    public struct AdminChanged has copy, drop {
        previous_admin: address,
        new_admin: address,
        timestamp: u64
    }

    // ====== Initialization ======
    fun init(otw: PLATFORM, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        
        // Create platform configuration
        let platform_config = PlatformConfig {
            id: object::new(ctx),
            min_reviewers: DEFAULT_MIN_REVIEWERS,
            approval_threshold: DEFAULT_APPROVAL_THRESHOLD,
            paused: false,
            admin: sender
        };
        
        // Create the platform treasury
        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero()
        };
        
        // Share objects
        transfer::transfer(admin_cap, sender);
        transfer::share_object(platform_config);
        transfer::share_object(treasury);

        // Set up the display for research paper NFTs
        let publisher = package::claim(otw, ctx);
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image"),
            string::utf8(b"author"),
            string::utf8(b"publication_timestamp"),
            string::utf8(b"citation_count"),
            string::utf8(b"project_url"),
        ];
        
        let values = vector[
            string::utf8(b"{title}"),
            string::utf8(b"A peer-reviewed research paper on SuiPeer platform"),
            string::utf8(b"https://suipeer.io/images/paper/{paper_id}.png"),
            string::utf8(b"{author}"),
            string::utf8(b"{publication_timestamp}"),
            string::utf8(b"{citation_count}"),
            string::utf8(b"https://suipeer.io/paper/{paper_id}"),
        ];
        
        let mut display = display::new_with_fields<ResearchPaperNFT>(&publisher, keys, values, ctx);
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, sender);
        transfer::public_transfer(display, sender);
    }

    // ====== Researcher Management ======

    // Register as a researcher (self-registration)
    public entry fun register_researcher(
        name: String,
        institution: String,
        ctx: &mut TxContext
    ) {
        let researcher = Researcher {
            id: object::new(ctx),
            address: tx_context::sender(ctx),
            name,
            institution,
            verified: false,
            reputation_score: 0,
            qualified_domains: vector::empty<String>()
        };

        event::emit(ResearcherRegistered {
            researcher_address: tx_context::sender(ctx),
            name,
            institution
        });

        transfer::share_object(researcher);
    }

    // Verify a researcher (admin only)
    public entry fun verify_researcher(
        _admin_cap: &AdminCap,
        researcher: &mut Researcher
    ) {
        researcher.verified = true;

        event::emit(ResearcherVerified {
            researcher_address: researcher.address
        });
    }
    
    // Verify a researcher using ZK proof of credentials
    public entry fun verify_researcher_with_zk(
        researcher: &mut Researcher,
        zk_proof: vector<u8>,
        public_inputs: vector<u8>,
        verifier: &suipeer::zk_verification::ZKProofVerifier,
        ctx: &mut TxContext
    ) {
        // Ensure the researcher is the one calling this function
        assert!(researcher.address == tx_context::sender(ctx), ENotAuthorized);
        
        // Verify the ZK proof of researcher credentials
        // The proof should verify academic credentials, institutional affiliation, etc.
        // without revealing the actual credential details
        let is_valid = suipeer::zk_verification::verify_researcher_credentials(
            verifier,
            zk_proof,
            public_inputs,
            ctx
        );
        
        assert!(is_valid, ENotVerified);
        
        // Mark researcher as verified
        researcher.verified = true;

        event::emit(ResearcherVerified {
            researcher_address: researcher.address
        });
    }
    
    // Add a reviewer qualification using ZK proof
    public entry fun add_reviewer_qualification(
        researcher: &mut Researcher,
        domain: String,
        zk_proof: vector<u8>,
        public_inputs: vector<u8>,
        verifier: &suipeer::zk_verification::ZKProofVerifier,
        ctx: &mut TxContext
    ) {
        // Ensure the researcher is verified and is the one calling this function
        assert!(researcher.verified, ENotVerified);
        assert!(researcher.address == tx_context::sender(ctx), ENotAuthorized);
        
        // Verify the ZK proof of reviewer qualifications for the specific domain
        // The proof should verify academic expertise, publications in the domain, etc.
        // without revealing the actual credential details
        let is_valid = suipeer::zk_verification::verify_reviewer_qualification(
            verifier,
            zk_proof,
            public_inputs,
            ctx
        );
        
        assert!(is_valid, ENotQualified);
        
        // Create a new reviewer qualification object
        let qualification = ReviewerQualification {
            id: object::new(ctx),
            researcher: researcher.address,
            domain,
            verified: true,
            verification_method: 1 // ZK proof verification
        };
        
        // Add the domain to the researcher's qualified domains if not already present
        if (!vector::contains(&researcher.qualified_domains, &domain)) {
            vector::push_back(&mut researcher.qualified_domains, domain);
        };
        
        // Transfer the qualification object to the researcher
        transfer::transfer(qualification, researcher.address);
    }
    
    // Admin verification of reviewer qualification (for domains without ZK proof support)
    public entry fun admin_verify_reviewer_qualification(
        _admin_cap: &AdminCap,
        researcher: &mut Researcher,
        domain: String,
        ctx: &mut TxContext
    ) {
        // Create a new reviewer qualification object
        let qualification = ReviewerQualification {
            id: object::new(ctx),
            researcher: researcher.address,
            domain,
            verified: true,
            verification_method: 0 // Admin verification
        };
        
        // Add the domain to the researcher's qualified domains if not already present
        if (!vector::contains(&researcher.qualified_domains, &domain)) {
            vector::push_back(&mut researcher.qualified_domains, domain);
        };
        
        // Transfer the qualification object to the researcher
        transfer::transfer(qualification, researcher.address);
    }

    // ====== Paper Submission ======

    // Submit a research paper
    public entry fun submit_paper(
        researcher: &Researcher,
        config: &PlatformConfig,
        title: String,
        abstract: String,
        content_hash: vector<u8>,
        domain: String,
        ctx: &mut TxContext
    ) {
        // Check if platform is not paused
        assert!(!config.paused, EPlatformPaused);
        
        // Ensure researcher is verified
        assert!(researcher.verified, ENotVerified);
        assert!(researcher.address == tx_context::sender(ctx), ENotAuthorized);

        let paper = ResearchPaper {
            id: object::new(ctx),
            title,
            abstract,
            content_hash,
            author: tx_context::sender(ctx),
            domain,
            status: STATUS_SUBMITTED,
            submission_timestamp: tx_context::epoch(ctx),
            publication_timestamp: option::none(),
            reviewer_count: 0,
            positive_reviews: 0,
            citation_count: 0
        };

        let paper_id = object::id(&paper);

        event::emit(PaperSubmitted {
            paper_id,
            title,
            author: tx_context::sender(ctx),
            domain
        });

        transfer::share_object(paper);
    }

    // ====== Peer Review ======

    // Submit a peer review
    public entry fun submit_review(
        researcher: &Researcher,
        paper: &mut ResearchPaper,
        review_content_hash: vector<u8>,
        score: u8,
        approved: bool,
        ctx: &mut TxContext
    ) {
        // Ensure researcher is verified
        assert!(researcher.verified, ENotVerified);
        assert!(researcher.address == tx_context::sender(ctx), ENotAuthorized);
        
        // Ensure reviewer is qualified for the paper's domain
        assert!(vector::contains(&researcher.qualified_domains, &paper.domain), ENotQualified);
        
        // Ensure paper is under review status
        if (paper.status == STATUS_SUBMITTED) {
            paper.status = STATUS_UNDER_REVIEW;
        };
        
        assert!(paper.status == STATUS_UNDER_REVIEW, EInvalidStatus);
        
        // Ensure reviewer is not the author
        assert!(paper.author != researcher.address, ENotAuthorized);
        
        // Create review
        let review = PeerReview {
            id: object::new(ctx),
            paper_id: object::id(paper),
            reviewer: tx_context::sender(ctx),
            review_content_hash,
            score, 
            approved,
            timestamp: tx_context::epoch(ctx)
        };

        // Update paper metrics
        paper.reviewer_count = paper.reviewer_count + 1;
        if (approved) {
            paper.positive_reviews = paper.positive_reviews + 1;
        };

        event::emit(ReviewSubmitted {
            paper_id: object::id(paper),
            reviewer: tx_context::sender(ctx),
            approved
        });

        transfer::share_object(review);
    }
    
    // Submit an anonymous peer review with ZK proof
    public entry fun submit_anonymous_review(
        paper: &mut ResearchPaper,
        review_content_hash: vector<u8>,
        score: u8,
        approved: bool,
        zk_proof: vector<u8>,
        public_inputs: vector<u8>,
        verifier: &suipeer::zk_verification::ZKProofVerifier,
        ctx: &mut TxContext
    ) {
        // Verify the ZK proof to ensure the reviewer is qualified without revealing identity
        // The proof should verify:
        // 1. The reviewer is a verified researcher
        // 2. The reviewer hasn't already reviewed this paper
        // 3. The reviewer isn't the author of the paper
        let is_valid = suipeer::zk_verification::verify_anonymous_review(
            verifier,
            zk_proof,
            public_inputs,
            ctx
        );
        
        assert!(is_valid, ENotVerified);
        
        // Ensure paper is under review status
        if (paper.status == STATUS_SUBMITTED) {
            paper.status = STATUS_UNDER_REVIEW;
        };
        
        assert!(paper.status == STATUS_UNDER_REVIEW, EInvalidStatus);
        
        // Create review with anonymous reviewer (use zero address)
        let review = PeerReview {
            id: object::new(ctx),
            paper_id: object::id(paper),
            reviewer: @0x0, // Anonymous reviewer
            review_content_hash,
            score, 
            approved,
            timestamp: tx_context::epoch(ctx)
        };

        // Update paper metrics
        paper.reviewer_count = paper.reviewer_count + 1;
        if (approved) {
            paper.positive_reviews = paper.positive_reviews + 1;
        };

        event::emit(ReviewSubmitted {
            paper_id: object::id(paper),
            reviewer: @0x0, // Anonymous reviewer
            approved
        });

        transfer::share_object(review);
    }

    // ====== Publication Management ======

    // Finalize publication after reviews
    public entry fun finalize_publication(
        paper: &mut ResearchPaper,
        config: &PlatformConfig,
        ctx: &mut TxContext
    ) {
        // Check if platform is not paused
        assert!(!config.paused, EPlatformPaused);
        
        // Ensure there are enough reviews based on platform configuration
        assert!(paper.reviewer_count >= config.min_reviewers, EInsufficientReviews);
        
        // Calculate if paper should be accepted using the approval threshold from config
        let threshold = config.approval_threshold;
        let percentage_approved = if (paper.reviewer_count == 0) {
            0
        } else {
            (paper.positive_reviews * 100) / paper.reviewer_count
        };
        
        let should_publish = percentage_approved >= threshold;

        if (should_publish) {
            paper.status = STATUS_PUBLISHED;
            paper.publication_timestamp = option::some(tx_context::epoch(ctx));
            
            // Create NFT for the published paper
            let paper_nft = ResearchPaperNFT {
                id: object::new(ctx),
                paper_id: object::id(paper),
                title: paper.title,
                author: paper.author,
                publication_timestamp: *option::borrow(&paper.publication_timestamp),
                citation_count: 0
            };

            event::emit(PaperPublished {
                paper_id: object::id(paper),
                title: paper.title,
                author: paper.author
            });

            transfer::transfer(paper_nft, paper.author);
        } else {
            paper.status = STATUS_REJECTED;
        };
    }

    // ====== Citation and Reputation ======

    // Cite a paper, increasing its citation count
    public entry fun cite_paper(
        researcher: &Researcher,
        paper: &mut ResearchPaper,
        nft: &mut ResearchPaperNFT,
        ctx: &mut TxContext
    ) {
        // Ensure researcher is verified
        assert!(researcher.verified, ENotVerified);
        assert!(researcher.address == tx_context::sender(ctx), ENotAuthorized);
        
        // Ensure paper is published
        assert!(paper.status == STATUS_PUBLISHED, EInvalidStatus);
        
        // Ensure NFT and paper are linked
        assert!(nft.paper_id == object::id(paper), ENotAuthorized);
        
        // Increase citation count
        paper.citation_count = paper.citation_count + 1;
        nft.citation_count = nft.citation_count + 1;
    }

    // ====== Rewards Management ======

    // Deposit SUI into the platform treasury
    public entry fun deposit_to_treasury(
        treasury: &mut Treasury,
        coin: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let _value = coin::value(&coin);
        let balance = coin::into_balance(coin);
        balance::join(&mut treasury.balance, balance);
        
        // No event emitted for deposits to avoid tx spam
    }

    // Distribute rewards for paper publication
    public entry fun reward_author(
        _admin_cap: &AdminCap,
        treasury: &mut Treasury,
        author: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Ensure there are enough funds
        assert!(balance::value(&treasury.balance) >= amount, EInvalidAmount);
        
        let reward = coin::from_balance(balance::split(&mut treasury.balance, amount), ctx);
        transfer::public_transfer(reward, author);
        
        event::emit(RewardDistributed {
            recipient: author,
            amount,
            reason: string::utf8(b"publication_reward")
        });
    }

    // Distribute rewards for reviewer
    public entry fun reward_reviewer(
        _admin_cap: &AdminCap,
        treasury: &mut Treasury,
        reviewer: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Ensure there are enough funds
        assert!(balance::value(&treasury.balance) >= amount, EInvalidAmount);
        
        let reward = coin::from_balance(balance::split(&mut treasury.balance, amount), ctx);
        transfer::public_transfer(reward, reviewer);
        
        event::emit(RewardDistributed {
            recipient: reviewer,
            amount,
            reason: string::utf8(b"review_reward")
        });
    }

    // ====== Admin Functions ======

    // Update the minimum number of reviewers needed
    public entry fun set_min_reviewers(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        new_min: u64,
        ctx: &mut TxContext
    ) {
        // Ensure caller is admin
        assert!(config.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Validate input
        assert!(new_min > 0, EInvalidReviewerCount);
        
        // Update configuration
        config.min_reviewers = new_min;
        
        // Emit event
        event::emit(ConfigUpdated {
            min_reviewers: new_min,
            approval_threshold: config.approval_threshold,
            updated_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx)
        });
    }
    
    // Update the approval threshold (percentage of positive reviews needed)
    public entry fun set_approval_threshold(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        new_threshold: u64,
        ctx: &mut TxContext
    ) {
        // Ensure caller is admin
        assert!(config.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Validate input (threshold is a percentage)
        assert!(new_threshold > 0 && new_threshold <= 100, EInvalidThreshold);
        
        // Update configuration
        config.approval_threshold = new_threshold;
        
        // Emit event
        event::emit(ConfigUpdated {
            min_reviewers: config.min_reviewers,
            approval_threshold: new_threshold,
            updated_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx)
        });
    }
    
    // Pause the platform (emergency)
    public entry fun pause_platform(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        ctx: &mut TxContext
    ) {
        // Ensure caller is admin
        assert!(config.admin == tx_context::sender(ctx), ENotAuthorized);
        
        config.paused = true;
        
        // Emit event
        event::emit(PlatformStatusChanged {
            paused: true,
            changed_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx)
        });
    }
    
    // Resume platform operations
    public entry fun resume_platform(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        ctx: &mut TxContext
    ) {
        // Ensure caller is admin
        assert!(config.admin == tx_context::sender(ctx), ENotAuthorized);
        
        config.paused = false;
        
        // Emit event
        event::emit(PlatformStatusChanged {
            paused: false,
            changed_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx)
        });
    }
    
    // Transfer admin rights
    public entry fun transfer_admin(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        // Ensure caller is current admin
        let current_admin = tx_context::sender(ctx);
        assert!(config.admin == current_admin, ENotAuthorized);
        
        // Update admin address
        config.admin = new_admin;
        
        // Emit event
        event::emit(AdminChanged {
            previous_admin: current_admin,
            new_admin,
            timestamp: tx_context::epoch(ctx)
        });
    }
    
    // Emergency withdraw funds from treasury (for migration or emergency)
    public entry fun emergency_withdraw(
        _admin_cap: &AdminCap,
        config: &PlatformConfig,
        treasury: &mut Treasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Ensure caller is admin
        assert!(config.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Ensure sufficient funds
        assert!(balance::value(&treasury.balance) >= amount, EInvalidAmount);
        
        // Create and send coins
        let withdraw_coin = coin::from_balance(balance::split(&mut treasury.balance, amount), ctx);
        transfer::public_transfer(withdraw_coin, recipient);
        
        // Emit event
        event::emit(RewardDistributed {
            recipient,
            amount,
            reason: string::utf8(b"emergency_withdrawal")
        });
    }
}
