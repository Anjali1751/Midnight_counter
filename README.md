# Private-Owner Counter

> A privacy-preserving Midnight Compact counter where ownership is proven with a private secret key without revealing the key on-chain.

## Contract Address

| Network | Address |
| --- | --- |
| Preview | `6a9f45c19b671944eff8cbe3a0f2d3c02511d1b01fbabaff6476682d9d2930c8` |
| Preprod | _Not deployed yet_ |

## What This Does

This contract starts in an unclaimed state. A user can claim ownership by proving they know a secret key without exposing that secret on-chain. Once claimed, the owner may increment the public counter while callers without the matching secret key are rejected.

The contract stores a public hash commitment for ownership and a public count value, while the secret itself remains private and is never revealed to the ledger.

## Privacy Model

- **PUBLIC (on-chain, visible to anyone):** the contract `state`, the public `owner` hash commitment, and the public `count` value.
- **PRIVATE (never on-chain):** the secret key returned by the `localSecretKey()` witness.
- **PROVED without revealing:** the caller demonstrates knowledge of the secret behind the public owner commitment.

The hash commitment is disclosed during `claim()`, but the underlying secret remains hidden.

## Tech Stack

- Midnight Network
- Compact language
- Node.js v22
- Docker

## Prerequisites

- Node.js v22 and npm
- Compact CLI/compiler `0.31.1`
- Docker running locally
- Access to the Midnight Preview or Preprod network
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
command currently returns `404` from npm. This project uses the direct compiler
installation and script flow required by Compact `0.31.1`.

Compile the contract and generate the managed artifacts:

```sh
npm run compile
```

The generated `managed/` directory contains the contract interface, circuits,
and proving and verification keys.

## Run Tests

```sh
npm test
```

The test suite validates the contract logic, generated compiler metadata, public ledger transitions, and the private witness model. A full transaction-level test requires the Midnight runtime, proof server, and a funded wallet.

## Initial Idea

A privacy-preserving counter where ownership is proven with a private secret key without revealing the key on-chain.

## Screenshots

### Compile output

![Compile output](docs/screenshots/compile.png)

### Deployment screenshot

![Deployment screenshot](docs/screenshots/deploy.png)

> Save the compile screenshot as `compile.png` and the deployment screenshot as `deploy.png` in the `docs/screenshots` folder before pushing.