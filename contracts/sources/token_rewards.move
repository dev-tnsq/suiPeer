module suipeer::token_rewards {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::url;
    use sui::sui::SUI;

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EInsufficientFunds: u64 = 2;

    // OTW for one-time initialization
    public struct TOKEN_REWARDS has drop {}

    // The PEER token for the SuiPeer platform
    public struct PEER has drop {}

    // Admin capability
    public struct RewardsAdminCap has key, store {
        id: UID
    }

    // Rewards Treasury that holds funds for distribution
    public struct RewardsTreasury has key {
        id: UID,
        sui_balance: Balance<SUI>,
        peer_balance: Balance<PEER>
    }
    
    // Reward types
    const REWARD_TYPE_PUBLICATION: u8 = 1;
    const REWARD_TYPE_REVIEW: u8 = 2;
    const REWARD_TYPE_CITATION: u8 = 3;
    const REWARD_TYPE_ACHIEVEMENT: u8 = 4;

    // Events
    public struct RewardDistributed has copy, drop {
        recipient: address,
        reward_type: u8,
        sui_amount: u64,
        peer_amount: u64,
        timestamp: u64
    }

    // Token initialization
    fun init(otw: TOKEN_REWARDS, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create the PEER token with proper metadata
        let (treasury_cap, metadata) = coin::create_currency(
            otw,
            9, // 9 decimals
            b"PEER",
            b"SuiPeer Token",
            b"Governance and reward token for the SuiPeer research platform",
            option::some(url::new_unsafe_from_bytes(b"https://suipeer.io/token.png")),
            ctx
        );
        
        // Create rewards admin capability
        let admin_cap = RewardsAdminCap {
            id: object::new(ctx)
        };
        
        // Create the rewards treasury
        let treasury = RewardsTreasury {
            id: object::new(ctx),
            sui_balance: balance::zero(),
            peer_balance: balance::zero()
        };
        
        // Transfer everything to the deployer
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, sender);
        transfer::transfer(admin_cap, sender);
        transfer::share_object(treasury);
    }

    // Deposit SUI to treasury
    public entry fun deposit_sui(
        treasury: &mut RewardsTreasury,
        coin: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let _value = coin::value(&coin);
        let balance = coin::into_balance(coin);
        balance::join(&mut treasury.sui_balance, balance);
    }

    // Deposit PEER to treasury
    public entry fun deposit_peer(
        treasury: &mut RewardsTreasury,
        coin: Coin<PEER>,
        _ctx: &mut TxContext
    ) {
        let _value = coin::value(&coin);
        let balance = coin::into_balance(coin);
        balance::join(&mut treasury.peer_balance, balance);
    }

    // Reward a researcher for publication
    public entry fun reward_for_publication(
        _admin_cap: &RewardsAdminCap,
        treasury: &mut RewardsTreasury,
        recipient: address,
        sui_amount: u64,
        peer_amount: u64,
        ctx: &mut TxContext
    ) {
        // Only admin can distribute rewards
        assert!(tx_context::sender(ctx) == tx_context::sender(ctx), ENotAuthorized);
        
        // Check if we have enough funds
        assert!(balance::value(&treasury.sui_balance) >= sui_amount, EInsufficientFunds);
        assert!(balance::value(&treasury.peer_balance) >= peer_amount, EInsufficientFunds);
        
        // Create and send rewards
        if (sui_amount > 0) {
            let sui_coin = coin::from_balance(balance::split(&mut treasury.sui_balance, sui_amount), ctx);
            transfer::public_transfer(sui_coin, recipient);
        };
        
        if (peer_amount > 0) {
            let peer_coin = coin::from_balance(balance::split(&mut treasury.peer_balance, peer_amount), ctx);
            transfer::public_transfer(peer_coin, recipient);
        };
        
        // Emit event
        event::emit(RewardDistributed {
            recipient,
            reward_type: REWARD_TYPE_PUBLICATION,
            sui_amount,
            peer_amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Reward a researcher for review
    public entry fun reward_for_review(
        _admin_cap: &RewardsAdminCap,
        treasury: &mut RewardsTreasury,
        recipient: address,
        sui_amount: u64,
        peer_amount: u64,
        ctx: &mut TxContext
    ) {
        // Only admin can distribute rewards
        assert!(tx_context::sender(ctx) == tx_context::sender(ctx), ENotAuthorized);
        
        // Check if we have enough funds
        assert!(balance::value(&treasury.sui_balance) >= sui_amount, EInsufficientFunds);
        assert!(balance::value(&treasury.peer_balance) >= peer_amount, EInsufficientFunds);
        
        // Create and send rewards
        if (sui_amount > 0) {
            let sui_coin = coin::from_balance(balance::split(&mut treasury.sui_balance, sui_amount), ctx);
            transfer::public_transfer(sui_coin, recipient);
        };
        
        if (peer_amount > 0) {
            let peer_coin = coin::from_balance(balance::split(&mut treasury.peer_balance, peer_amount), ctx);
            transfer::public_transfer(peer_coin, recipient);
        };
        
        // Emit event
        event::emit(RewardDistributed {
            recipient,
            reward_type: REWARD_TYPE_REVIEW,
            sui_amount,
            peer_amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Reward a researcher for citation of their work
    public entry fun reward_for_citation(
        _admin_cap: &RewardsAdminCap,
        treasury: &mut RewardsTreasury,
        recipient: address,
        sui_amount: u64,
        peer_amount: u64,
        ctx: &mut TxContext
    ) {
        // Only admin can distribute rewards
        assert!(tx_context::sender(ctx) == tx_context::sender(ctx), ENotAuthorized);
        
        // Check if we have enough funds
        assert!(balance::value(&treasury.sui_balance) >= sui_amount, EInsufficientFunds);
        assert!(balance::value(&treasury.peer_balance) >= peer_amount, EInsufficientFunds);
        
        // Create and send rewards
        if (sui_amount > 0) {
            let sui_coin = coin::from_balance(balance::split(&mut treasury.sui_balance, sui_amount), ctx);
            transfer::public_transfer(sui_coin, recipient);
        };
        
        if (peer_amount > 0) {
            let peer_coin = coin::from_balance(balance::split(&mut treasury.peer_balance, peer_amount), ctx);
            transfer::public_transfer(peer_coin, recipient);
        };
        
        // Emit event
        event::emit(RewardDistributed {
            recipient,
            reward_type: REWARD_TYPE_CITATION,
            sui_amount,
            peer_amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Reward a researcher for achievement
    public entry fun reward_for_achievement(
        _admin_cap: &RewardsAdminCap,
        treasury: &mut RewardsTreasury,
        recipient: address,
        sui_amount: u64,
        peer_amount: u64,
        ctx: &mut TxContext
    ) {
        // Only admin can distribute rewards
        assert!(tx_context::sender(ctx) == tx_context::sender(ctx), ENotAuthorized);
        
        // Check if we have enough funds
        assert!(balance::value(&treasury.sui_balance) >= sui_amount, EInsufficientFunds);
        assert!(balance::value(&treasury.peer_balance) >= peer_amount, EInsufficientFunds);
        
        // Create and send rewards
        if (sui_amount > 0) {
            let sui_coin = coin::from_balance(balance::split(&mut treasury.sui_balance, sui_amount), ctx);
            transfer::public_transfer(sui_coin, recipient);
        };
        
        if (peer_amount > 0) {
            let peer_coin = coin::from_balance(balance::split(&mut treasury.peer_balance, peer_amount), ctx);
            transfer::public_transfer(peer_coin, recipient);
        };
        
        // Emit event
        event::emit(RewardDistributed {
            recipient,
            reward_type: REWARD_TYPE_ACHIEVEMENT,
            sui_amount,
            peer_amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Mint additional PEER tokens (admin only)
    public entry fun mint_peer(
        treasury_cap: &mut TreasuryCap<PEER>,
        _admin_cap: &RewardsAdminCap,
        treasury: &mut RewardsTreasury,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Only admin can mint tokens
        assert!(tx_context::sender(ctx) == tx_context::sender(ctx), ENotAuthorized);
        
        // Mint tokens directly to treasury
        let minted_coins = coin::mint(treasury_cap, amount, ctx);
        let minted_balance = coin::into_balance(minted_coins);
        balance::join(&mut treasury.peer_balance, minted_balance);
    }
}
