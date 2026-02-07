# my-plasma-project

A baseline Plasma testnet project using Hardhat.

## Setup

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your private key:
   ```
   cp .env.example .env
   ```
4. Add Plasma Testnet to your wallet:
   - **Network Name**: Plasma Testnet
   - **RPC URL**: `https://testnet-rpc.plasma.to`
   - **Chain ID**: `9746`
   - **Currency Symbol**: `XPL`
   - **Block Explorer**: `https://testnet.plasmascan.to`
5. Get testnet tokens from the gas.zip faucet.

## Commands

```bash
npx hardhat compile        # Compile contracts
npx hardhat test           # Run tests
npx hardhat run scripts/deploy.js --network plasmaTestnet  # Deploy to Plasma testnet
```
