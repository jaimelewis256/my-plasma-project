# LearnPlasma

An educational DApp that teaches blockchain payments hands-on using the Plasma Testnet. Users connect MetaMask, register a display name, and can send/receive/request USDT — all on a safe testnet with no real money.

## Live Site

The frontend is hosted via GitHub Pages from the `docs/` folder.

## Tech Stack

**Frontend:** HTML, CSS, JavaScript, ethers.js (v5.7.2), hosted on GitHub Pages

**Backend:** Node.js, Express, OpenAI API, deployed on Render/Vercel

**Smart Contracts:** Solidity (0.8.24), Hardhat, deployed on Plasma Testnet (Chain ID 9746)

**Wallet:** MetaMask | **Token:** USDT (ERC-20) on Plasma Testnet

## Project Structure

```
docs/index.html                      # Frontend (single-page app)
contracts/PlasmaPayments.sol         # Smart contract (Solidity)
scripts/deploy-payments-testnet.js   # Deploy contract to Plasma Testnet
scripts/setup-practicebot.js         # Set up PracticeBot for testing
server/                              # Chatbot backend (Render)
api/                                 # Chatbot backend (Vercel)
```

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
4. Add Plasma Testnet to MetaMask:
   - **Network Name**: Plasma Testnet
   - **RPC URL**: `https://testnet-rpc.plasma.to`
   - **Chain ID**: `9746`
   - **Currency Symbol**: `XPL`
   - **Block Explorer**: `https://testnet.plasmascan.to`
5. Get testnet tokens from the gas.zip faucet.

## Commands

```bash
npx hardhat compile                                                        # Compile contracts
npx hardhat run scripts/deploy-payments-testnet.js --network plasmaTestnet # Deploy to Plasma Testnet
npx hardhat run scripts/setup-practicebot.js --network plasmaTestnet       # Set up PracticeBot
```
