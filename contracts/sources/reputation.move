module suipeer::reputation {
   
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};

    // Error codes
    const ENotAuthorized: u64 = 1;

    // Constants for reputation scoring
    const PUBLICATION_POINTS: u64 = 100;
    const REVIEW_POINTS: u64 = 20;
    const CITATION_POINTS: u64 = 10;
    const QUALITY_REVIEW_BONUS: u64 = 10;

    // Reputation registry to track all reputation scores
    public struct ReputationRegistry has key {
        id: UID,
        scores: Table<address, u64>,
        admin: address
    }

    // Admin capability
    public struct ReputationAdminCap has key, store {
        id: UID
    }

    // Achievement types
    const ACHIEVEMENT_FIRST_PUBLICATION: u8 = 1;
    const ACHIEVEMENT_FIVE_PUBLICATIONS: u8 = 2;
    const ACHIEVEMENT_TEN_REVIEWS: u8 = 3;
    const ACHIEVEMENT_HIGHLY_CITED: u8 = 4;

    // Represents a research achievement
    public struct Achievement has key, store {
        id: UID,
        researcher: address,
        achievement_type: u8,
        name: String,
        description: String,
        earned_at: u64
    }

    // Reputation events
    public struct ReputationIncreased has copy, drop {
        researcher: address,
        points: u64,
        reason: String,
        new_score: u64,
        timestamp: u64
    }

    public struct AchievementEarned has copy, drop {
        researcher: address,
        achievement_type: u8,
        name: String,
        timestamp: u64
    }

    // Publication tracking
    public struct PublicationCounter has key {
        id: UID,
        counts: Table<address, u64>
    }

    // Review tracking
    public struct ReviewCounter has key {
        id: UID,
        counts: Table<address, u64>
    }

    // Citation tracking
    public struct CitationCounter has key {
        id: UID,
        counts: Table<address, u64>
    }

    // Initialize the registry and counters
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        let registry = ReputationRegistry {
            id: object::new(ctx),
            scores: table::new(ctx),
            admin: sender
        };
        
        let publication_counter = PublicationCounter {
            id: object::new(ctx),
            counts: table::new(ctx)
        };
        
        let review_counter = ReviewCounter {
            id: object::new(ctx),
            counts: table::new(ctx)
        };
        
        let citation_counter = CitationCounter {
            id: object::new(ctx),
            counts: table::new(ctx)
        };
        
        let admin_cap = ReputationAdminCap {
            id: object::new(ctx)
        };
        
        transfer::share_object(registry);
        transfer::share_object(publication_counter);
        transfer::share_object(review_counter);
        transfer::share_object(citation_counter);
        transfer::transfer(admin_cap, sender);
    }

    // Award points for publishing a paper
    public entry fun award_publication_points(
        registry: &mut ReputationRegistry,
        publication_counter: &mut PublicationCounter,
        researcher: address,
        ctx: &mut TxContext
    ) {
        // Only admin or paper management module should call this
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Initialize score if not present
        if (!table::contains(&registry.scores, researcher)) {
            table::add(&mut registry.scores, researcher, 0);
        };
        
        // Update score
        let current_score = *table::borrow(&registry.scores, researcher);
        let new_score = current_score + PUBLICATION_POINTS;
        *table::borrow_mut(&mut registry.scores, researcher) = new_score;
        
        // Update publication count
        if (!table::contains(&publication_counter.counts, researcher)) {
            table::add(&mut publication_counter.counts, researcher, 0);
        };
        
        let current_count = *table::borrow(&publication_counter.counts, researcher);
        let new_count = current_count + 1;
        *table::borrow_mut(&mut publication_counter.counts, researcher) = new_count;
        
        // Check for achievements
        if (new_count == 1) {
            // First publication achievement
            create_achievement(
                researcher, 
                ACHIEVEMENT_FIRST_PUBLICATION,
                string::utf8(b"First Publication"),
                string::utf8(b"Published your first research paper on SuiPeer"),
                ctx
            );
        } else if (new_count == 5) {
            // Five publications achievement
            create_achievement(
                researcher, 
                ACHIEVEMENT_FIVE_PUBLICATIONS,
                string::utf8(b"Prolific Researcher"),
                string::utf8(b"Published five research papers on SuiPeer"),
                ctx
            );
        };
        
        event::emit(ReputationIncreased {
            researcher,
            points: PUBLICATION_POINTS,
            reason: string::utf8(b"publication"),
            new_score,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Award points for reviewing a paper
    public entry fun award_review_points(
        registry: &mut ReputationRegistry,
        review_counter: &mut ReviewCounter,
        researcher: address,
        quality_bonus: bool,
        ctx: &mut TxContext
    ) {
        // Only admin or review management module should call this
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Initialize score if not present
        if (!table::contains(&registry.scores, researcher)) {
            table::add(&mut registry.scores, researcher, 0);
        };
        
        // Calculate points with potential quality bonus
        let mut points = REVIEW_POINTS;
        if (quality_bonus) {
            points = points + QUALITY_REVIEW_BONUS;
        };
        
        // Update score
        let current_score = *table::borrow(&registry.scores, researcher);
        let new_score = current_score + points;
        *table::borrow_mut(&mut registry.scores, researcher) = new_score;
        
        // Update review count
        if (!table::contains(&review_counter.counts, researcher)) {
            table::add(&mut review_counter.counts, researcher, 0);
        };
        
        let current_count = *table::borrow(&review_counter.counts, researcher);
        let new_count = current_count + 1;
        *table::borrow_mut(&mut review_counter.counts, researcher) = new_count;
        
        // Check for achievements
        if (new_count == 10) {
            create_achievement(
                researcher, 
                ACHIEVEMENT_TEN_REVIEWS,
                string::utf8(b"Dedicated Reviewer"),
                string::utf8(b"Completed ten thorough peer reviews on SuiPeer"),
                ctx
            );
        };
        
        let reason = if (quality_bonus) {
            string::utf8(b"quality_review")
        } else {
            string::utf8(b"review")
        };
        
        event::emit(ReputationIncreased {
            researcher,
            points,
            reason,
            new_score,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Award points for being cited
    public entry fun award_citation_points(
        registry: &mut ReputationRegistry,
        citation_counter: &mut CitationCounter,
        researcher: address,
        ctx: &mut TxContext
    ) {
        // Only admin or citation management module should call this
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        
        // Initialize score if not present
        if (!table::contains(&registry.scores, researcher)) {
            table::add(&mut registry.scores, researcher, 0);
        };
        
        // Update score
        let current_score = *table::borrow(&registry.scores, researcher);
        let new_score = current_score + CITATION_POINTS;
        *table::borrow_mut(&mut registry.scores, researcher) = new_score;
        
        // Update citation count
        if (!table::contains(&citation_counter.counts, researcher)) {
            table::add(&mut citation_counter.counts, researcher, 0);
        };
        
        let current_count = *table::borrow(&citation_counter.counts, researcher);
        let new_count = current_count + 1;
        *table::borrow_mut(&mut citation_counter.counts, researcher) = new_count;
        
        // Check for achievements - highly cited (25+ citations)
        if (new_count == 25) {
            create_achievement(
                researcher, 
                ACHIEVEMENT_HIGHLY_CITED,
                string::utf8(b"Influential Researcher"),
                string::utf8(b"Your work has been cited 25 times, showing significant impact"),
                ctx
            );
        };
        
        event::emit(ReputationIncreased {
            researcher,
            points: CITATION_POINTS,
            reason: string::utf8(b"citation"),
            new_score,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Get a researcher's reputation score
    public fun get_reputation_score(
        registry: &ReputationRegistry,
        researcher: address
    ): u64 {
        if (table::contains(&registry.scores, researcher)) {
            *table::borrow(&registry.scores, researcher)
        } else {
            0
        }
    }
    
    // Get publication count
    public fun get_publication_count(
        counter: &PublicationCounter,
        researcher: address
    ): u64 {
        if (table::contains(&counter.counts, researcher)) {
            *table::borrow(&counter.counts, researcher)
        } else {
            0
        }
    }
    
    // Get review count
    public fun get_review_count(
        counter: &ReviewCounter,
        researcher: address
    ): u64 {
        if (table::contains(&counter.counts, researcher)) {
            *table::borrow(&counter.counts, researcher)
        } else {
            0
        }
    }
    
    // Get citation count
    public fun get_citation_count(
        counter: &CitationCounter,
        researcher: address
    ): u64 {
        if (table::contains(&counter.counts, researcher)) {
            *table::borrow(&counter.counts, researcher)
        } else {
            0
        }
    }
    
    // Create an achievement
    fun create_achievement(
        researcher: address,
        achievement_type: u8,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let achievement = Achievement {
            id: object::new(ctx),
            researcher,
            achievement_type,
            name,
            description,
            earned_at: tx_context::epoch(ctx)
        };
        
        event::emit(AchievementEarned {
            researcher,
            achievement_type,
            name,
            timestamp: tx_context::epoch(ctx)
        });
        
        transfer::transfer(achievement, researcher);
    }
    
    // Update registry admin
    public entry fun update_admin(
        registry: &mut ReputationRegistry,
        _admin_cap: &ReputationAdminCap,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        registry.admin = new_admin;
    }
}
