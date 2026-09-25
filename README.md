# Private-Owner Counter

> A Midnight Compact counter that only its private owner can increment.

## Contract Address

| Network | Address |
| --- | --- |
| Preview | `6a9f45c19b671944eff8cbe3a0f2d3c02511d1b01fbabaff6476682d9d2930c8` |
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
- Compact CLI/compiler `0.31.1`
- Docker running locally
- Access to the Midnight Preview or Preprod network for deployment
- A funded Preview wallet for deployment

## Setup

```sh
git clone <repository-url>
cd Midnight_counter
nvm use 22
npm install
```

Install the compatible Linux compiler release:

```sh
mkdir -p "$HOME/.local/bin"
curl -fL https://github.com/LFDT-Minokawa/compact/releases/download/compactc-v0.31.1/compactc_v0.31.1_x86_64-unknown-linux-musl.zip -o /tmp/compactc.zip
unzip -o /tmp/compactc.zip -d /tmp/compactc-install
cp /tmp/compactc-install/* "$HOME/.local/bin/"
chmod +x "$HOME/.local/bin"/*
ln -sf "$HOME/.local/bin/compactc" "$HOME/.local/bin/compact"
export PATH="$HOME/.local/bin:$PATH"
```

Verify the toolchain before compiling:

```sh
node --version
compact --version
```

The challenge prompt's `npm install -g @midnight-ntwrk/compact-compiler`
command currently returns `404` from npm. The project script uses the direct
compiler syntax required by Compact `0.31.1`.

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

The tests validate the contract source and the generated compiler metadata,
including the public ledger entries, circuits, and private witness. A full
transaction-level test requires the Midnight runtime, proof server, and a
funded network wallet.

## Initial Idea

A privacy-preserving counter where ownership is proven with a private secret key without revealing the key on-chain.

## Screenshots

_Add compile output and deployed address screenshots here._