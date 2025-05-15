# SuiPeer: Decentralized Research Platform

SuiPeer is a decentralized research platform built on the Sui blockchain that enables secure, transparent, and privacy-preserving peer review and publication of research papers.

## Features

- **Zero-Knowledge Proofs**: Verify researcher credentials and submit anonymous reviews while preserving privacy
- **Decentralized Peer Review**: Transparent and tamper-proof peer review process
- **Reputation System**: Track researcher contributions and build reputation on-chain
- **Governance**: Community-driven decision making for platform parameters
- **Token Rewards**: Incentivize quality research and reviews with token rewards
- **zkLogin Integration**: Authenticate with Google using zkLogin for a seamless experience

## Project Structure

- `/contracts`: Sui Move smart contracts
- `/zk-circuits`: Zero-knowledge circuits using Circom
- `/sui-peer`: Next.js frontend application

## Prerequisites

- Node.js (v16+)
- Sui CLI
- Circom (v2.0.0+)
- snarkjs

## Setup and Deployment

### 1. Install Dependencies

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui

# Install Circom
npm install -g circom

# Install project dependencies
cd zk-circuits
npm install

cd ../sui-peer
npm install
```

### 2. Compile and Deploy ZK Circuits

```bash
cd zk-circuits

# Install dependencies
npm install

# Compile all circuits and deploy artifacts (automated script)
node compile-circuits.js

# Alternatively, you can compile circuits manually:
# circom researcher_credentials.circom --r1cs --wasm --sym -o build
# npx snarkjs groth16 setup build/researcher_credentials.r1cs build/powersOfTau28_hez_final_10.ptau build/researcher_credentials.zkey
# npx snarkjs zkey export verificationkey build/researcher_credentials.zkey build/verification_key.json
# node deploy-artifacts.js
```

### 3. Build and Deploy Smart Contracts

```bash
cd contracts

# Make sure you're connected to the Sui network
sui client switch --env testnet

# Deploy the contracts
node deploy.js
```

### 4. Run the Frontend

```bash
cd sui-peer
npm run dev
```

The application will be available at http://localhost:3000.

## Using Zero-Knowledge Features

### Researcher Verification

1. Navigate to the ZK Verification page
2. Fill in your credentials (institution, education level, etc.)
3. Click "Verify Credentials"
4. Approve the transaction in your wallet

### Anonymous Reviews

1. Navigate to the ZK Verification page and select the "Anonymous Review" tab
2. Select a paper to review
3. Write your review and score the paper
4. Click "Submit Anonymous Review"
5. Approve the transaction in your wallet

## Smart Contract Addresses

After deployment, the contract addresses will be automatically updated in:
- `sui-peer/constants/sui.ts`
- `sui-peer/utils/zk-utils.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.