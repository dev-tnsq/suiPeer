module suipeer::governance {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::String;
    use suipeer::token_rewards::PEER;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};

    // Error codes
    const EProposalNotActive: u64 = 2;
    const EAlreadyVoted: u64 = 3;
    const EInsufficientVotes: u64 = 4;
    const EProposalNotEnded: u64 = 5;
    const EProposalAlreadyEnded: u64 = 6;
    const EInvalidProposalType: u64 = 7;
    const EInsufficientStake: u64 = 8;

    // Proposal types
    const PROPOSAL_TYPE_PARAMETER_CHANGE: u8 = 1;
    const PROPOSAL_TYPE_FEATURE_REQUEST: u8 = 2;
    const PROPOSAL_TYPE_FUNDING: u8 = 3;
    const PROPOSAL_TYPE_OTHER: u8 = 4;

    // Proposal status
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PASSED: u8 = 2;
    const STATUS_REJECTED: u8 = 3;

    // Voting options
    const VOTE_YES: bool = true;
    // Governance parameters
    const MIN_PROPOSAL_DURATION_SECONDS: u64 = 86400; // 1 day
    const MIN_VOTE_THRESHOLD: u64 = 100_000_000_000; // 100 PEER tokens (with 9 decimals)
    const MIN_STAKE_AMOUNT: u64 = 10_000_000_000; // 10 PEER tokens (with 9 decimals)

    // Governance administrator capability
    public struct GovernanceAdminCap has key, store {
        id: UID
    }

    // Governance registry
    public struct GovernanceRegistry has key {
        id: UID,
        proposal_count: u64,
        proposals: Table<ID, Proposal>,
        votes: Table<address, Table<ID, bool>>,
        vote_power: Table<ID, u64>,
        admin: address
    }

    // Proposal object
    public struct Proposal has key, store {
        id: UID,
        proposer: address,
        proposal_type: u8,
        title: String,
        description: String,
        status: u8,
        start_timestamp: u64,
        end_timestamp: u64,
        yes_votes: u64,
        no_votes: u64,
        total_vote_power: u64,
        executed: bool,
        execution_data: vector<u8>
    }

    // Staking pool for governance participation
    public struct StakingPool has key {
        id: UID,
        stakes: Table<address, Balance<PEER>>,
        total_staked: u64
    }

    // Events
    public struct ProposalCreated has copy, drop {
        proposal_id: ID,
        proposer: address,
        title: String,
        proposal_type: u8,
        end_timestamp: u64
    }

    public struct VoteCast has copy, drop {
        proposal_id: ID,
        voter: address,
        vote: bool,
        vote_power: u64
    }

    public struct ProposalCompleted has copy, drop {
        proposal_id: ID,
        passed: bool,
        yes_votes: u64,
        no_votes: u64
    }

    public struct TokensStaked has copy, drop {
        staker: address,
        amount: u64,
        timestamp: u64
    }

    public struct TokensUnstaked has copy, drop {
        staker: address,
        amount: u64,
        timestamp: u64
    }

    // Initialize the governance module
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create admin capability
        let admin_cap = GovernanceAdminCap {
            id: object::new(ctx)
        };
        
        // Create governance registry
        let registry = GovernanceRegistry {
            id: object::new(ctx),
            proposal_count: 0,
            proposals: table::new(ctx),
            votes: table::new(ctx),
            vote_power: table::new(ctx),
            admin: sender
        };
        
        // Create staking pool
        let staking_pool = StakingPool {
            id: object::new(ctx),
            stakes: table::new(ctx),
            total_staked: 0
        };
        
        transfer::transfer(admin_cap, sender);
        transfer::share_object(registry);
        transfer::share_object(staking_pool);
    }

    // Create a new proposal
    public entry fun create_proposal(
        registry: &mut GovernanceRegistry,
        staking_pool: &StakingPool,
        proposal_type: u8,
        title: String,
        description: String,
        duration_seconds: u64,
        execution_data: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate proposal type
        assert!(
            proposal_type == PROPOSAL_TYPE_PARAMETER_CHANGE ||
            proposal_type == PROPOSAL_TYPE_FEATURE_REQUEST ||
            proposal_type == PROPOSAL_TYPE_FUNDING ||
            proposal_type == PROPOSAL_TYPE_OTHER,
            EInvalidProposalType
        );
        
        // Check that proposer has sufficient stake
        assert!(
            table::contains(&staking_pool.stakes, sender) && 
            balance::value(table::borrow(&staking_pool.stakes, sender)) >= MIN_STAKE_AMOUNT,
            EInsufficientStake
        );
        
        // Ensure minimum duration
        let actual_duration = if (duration_seconds < MIN_PROPOSAL_DURATION_SECONDS) {
            MIN_PROPOSAL_DURATION_SECONDS
        } else {
            duration_seconds
        };
        
        // Create proposal
        let current_timestamp = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let end_timestamp = current_timestamp + actual_duration;
        
        let proposal = Proposal {
            id: object::new(ctx),
            proposer: sender,
            proposal_type,
            title,
            description,
            status: STATUS_ACTIVE,
            start_timestamp: current_timestamp,
            end_timestamp,
            yes_votes: 0,
            no_votes: 0,
            total_vote_power: 0,
            executed: false,
            execution_data
        };
        
        // Store proposal
        let proposal_id = object::id(&proposal);
        table::add(&mut registry.proposals, proposal_id, proposal);
        
        // Initialize vote power tracking
        table::add(&mut registry.vote_power, proposal_id, 0);
        
        // Increment proposal count
        registry.proposal_count = registry.proposal_count + 1;
        
        // Emit event
        event::emit(ProposalCreated {
            proposal_id,
            proposer: sender,
            title,
            proposal_type,
            end_timestamp
        });
    }

    // Vote on a proposal
    public entry fun vote_on_proposal(
        registry: &mut GovernanceRegistry,
        staking_pool: &StakingPool,
        proposal_id: ID,
        vote: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Ensure proposal exists and is active
        assert!(table::contains(&registry.proposals, proposal_id), EProposalNotActive);
        let proposal = table::borrow_mut(&mut registry.proposals, proposal_id);
        assert!(proposal.status == STATUS_ACTIVE, EProposalNotActive);
        
        // Check proposal hasn't ended
        let current_timestamp = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        assert!(current_timestamp <= proposal.end_timestamp, EProposalAlreadyEnded);
        
        // Check voter has stake
        assert!(table::contains(&staking_pool.stakes, sender), EInsufficientStake);
        let stake_balance = table::borrow(&staking_pool.stakes, sender);
        let vote_power = balance::value(stake_balance);
        assert!(vote_power > 0, EInsufficientStake);
        
        // Check voter hasn't already voted
        if (!table::contains(&registry.votes, sender)) {
            table::add(&mut registry.votes, sender, table::new(ctx));
        };
        
        let voter_votes = table::borrow_mut(&mut registry.votes, sender);
        assert!(!table::contains(voter_votes, proposal_id), EAlreadyVoted);
        
        // Record vote
        table::add(voter_votes, proposal_id, vote);
        
        // Update vote counts
        if (vote == VOTE_YES) {
            proposal.yes_votes = proposal.yes_votes + vote_power;
        } else {
            proposal.no_votes = proposal.no_votes + vote_power;
        };
        
        proposal.total_vote_power = proposal.total_vote_power + vote_power;
        
        // Update vote power tracking
        let current_power = *table::borrow(&registry.vote_power, proposal_id);
        *table::borrow_mut(&mut registry.vote_power, proposal_id) = current_power + vote_power;
        
        // Emit event
        event::emit(VoteCast {
            proposal_id,
            voter: sender,
            vote,
            vote_power
        });
    }

    // Finalize a proposal after voting period ends
    public entry fun finalize_proposal(
        registry: &mut GovernanceRegistry,
        proposal_id: ID,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        // Ensure proposal exists
        assert!(table::contains(&registry.proposals, proposal_id), EProposalNotActive);
        let proposal = table::borrow_mut(&mut registry.proposals, proposal_id);
        
        // Ensure proposal is still active
        assert!(proposal.status == STATUS_ACTIVE, EProposalNotActive);
        
        // Ensure voting period has ended
        let current_timestamp = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        assert!(current_timestamp > proposal.end_timestamp, EProposalNotEnded);
        
        // Ensure sufficient vote power
        assert!(proposal.total_vote_power >= MIN_VOTE_THRESHOLD, EInsufficientVotes);
        
        // Determine if proposal passed (simple majority)
        let passed = proposal.yes_votes > proposal.no_votes;
        
        // Update status
        proposal.status = if (passed) { STATUS_PASSED } else { STATUS_REJECTED };
        
        // Emit event
        event::emit(ProposalCompleted {
            proposal_id,
            passed,
            yes_votes: proposal.yes_votes,
            no_votes: proposal.no_votes
        });
    }

    // Stake PEER tokens for governance participation
    public entry fun stake_tokens(
        staking_pool: &mut StakingPool,
        tokens: Coin<PEER>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let amount = coin::value(&tokens);
        assert!(amount > 0, EInvalidProposalType);
        
        let token_balance = coin::into_balance(tokens);
        
        // Initialize stake if needed
        if (!table::contains(&staking_pool.stakes, sender)) {
            table::add(&mut staking_pool.stakes, sender, balance::zero());
        };
        
        // Add stake
        let stake = table::borrow_mut(&mut staking_pool.stakes, sender);
        balance::join(stake, token_balance);
        
        // Update total staked
        staking_pool.total_staked = staking_pool.total_staked + amount;
        
        // Emit event
        event::emit(TokensStaked {
            staker: sender,
            amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Unstake PEER tokens
    public entry fun unstake_tokens(
        staking_pool: &mut StakingPool,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Ensure staker has sufficient stake
        assert!(table::contains(&staking_pool.stakes, sender), EInsufficientStake);
        let stake = table::borrow_mut(&mut staking_pool.stakes, sender);
        assert!(balance::value(stake) >= amount, EInsufficientStake);
        
        // Remove stake
        let unstaked_balance = balance::split(stake, amount);
        let unstaked_coins = coin::from_balance(unstaked_balance, ctx);
        
        // Update total staked
        staking_pool.total_staked = staking_pool.total_staked - amount;
        
        // Send tokens back to user
        transfer::public_transfer(unstaked_coins, sender);
        
        // Emit event
        event::emit(TokensUnstaked {
            staker: sender,
            amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Get a user's stake amount
    public fun get_stake_amount(
        staking_pool: &StakingPool,
        staker: address
    ): u64 {
        if (table::contains(&staking_pool.stakes, staker)) {
            balance::value(table::borrow(&staking_pool.stakes, staker))
        } else {
            0
        }
    }

    // Check if a user has voted on a proposal
    public fun has_voted(
        registry: &GovernanceRegistry,
        staker: address,
        proposal_id: ID
    ): bool {
        if (!table::contains(&registry.votes, staker)) {
            false
        } else {
            let voter_votes = table::borrow(&registry.votes, staker);
            table::contains(voter_votes, proposal_id)
        }
    }

    // Get total votes on a proposal
    public fun get_proposal_votes(
        registry: &GovernanceRegistry,
        proposal_id: ID
    ): (u64, u64, u64) {
        assert!(table::contains(&registry.proposals, proposal_id), EProposalNotActive);
        let proposal = table::borrow(&registry.proposals, proposal_id);
        (proposal.yes_votes, proposal.no_votes, proposal.total_vote_power)
    }
}
