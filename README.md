# Private-Owner Counter

> A Midnight Compact counter that only its private owner can increment.

## Contract Address

| Network | Address |
| --- | --- |
| Preview | _Not deployed yet_ |
| Preprod | _Not deployed yet_ |

## What This Does

The contract starts unclaimed. An owner claims it by proving knowledge of a
secret key. The contract stores only a hash commitment to that key. After the
counter is claimed, the owner can increment the public count, while callers
without the matching secret key are rejected.

## Privacy Model

- **PUBLIC (on-chain, visible to anyone):** `state`, the `owner` hash
	commitment, and `count`.
- **PRIVATE (never on-chain):** the secret key returned by the
	`localSecretKey()` witness.
- **PROVED without revealing:** the caller knows the secret key behind the
	public owner commitment.

The commitment is disclosed once during `claim()`. This discloses the hash,
not the secret key.

## Tech Stack

- Midnight Network
- Compact language
- Node.js v22
- Docker

## Prerequisites

- Node.js v22 and npm
- Compact CLI with compiler `0.31.1` selected
- Docker running locally
- Access to the Midnight Preview or Preprod network for deployment
- A funded Preview wallet for deployment

## Setup

```sh
git clone <repository-url>
cd Midnight_counter
nvm use 22
compact update 0.31.1
npm install
```

Compile the contract and generate its managed artifacts:

```sh
npm run compile
```

The generated `managed/` directory contains the contract interface, circuits,
and proving and verification keys.

## Run Tests

```sh
npm test
```

## Initial Idea

_Fill this in manually._

## Screenshots

_Add compile output and deployed address screenshots here._

## Level 1 Checklist

- [x] Contract compiles with `compact compile`
- [x] `managed/` directory generated with circuits and keys
- [x] Three tests covering contract logic, state transitions, and privacy
- [ ] Contract deployed to Preview or Preprod
- [ ] Deployed contract address added above
- [x] README contains all required sections
- [x] File structure matches the challenge specification

Deployment and faucet funding remain manual steps. Before submitting, fill in
the Initial Idea section, add screenshots, make at least five meaningful
commits, and submit the public GitHub repository on Rise In.