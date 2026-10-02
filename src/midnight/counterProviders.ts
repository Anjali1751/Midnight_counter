import { dappConnectorProofProvider } from "@midnight-ntwrk/midnight-js-dapp-connector-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js/contracts";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import {
  CostModel,
  Transaction,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { setNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import {
  ZKConfigProvider,
  createProverKey,
  createVerifierKey,
  createZKIR,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js/types";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js/utils";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import * as Counter from "../../managed/contract/index.js";
import claimProverUrl from "../../managed/keys/claim.prover?url";
import claimVerifierUrl from "../../managed/keys/claim.verifier?url";
import claimZkirUrl from "../../managed/zkir/claim.bzkir?url";
import incrementProverUrl from "../../managed/keys/increment.prover?url";
import incrementVerifierUrl from "../../managed/keys/increment.verifier?url";
import incrementZkirUrl from "../../managed/zkir/increment.bzkir?url";

export type CounterCircuit = "claim" | "increment";

type CounterPrivateState = {
  secretKey: Uint8Array;
};

const circuitArtifacts = {
  claim: {
    prover: claimProverUrl,
    verifier: claimVerifierUrl,
    zkir: claimZkirUrl,
  },
  increment: {
    prover: incrementProverUrl,
    verifier: incrementVerifierUrl,
    zkir: incrementZkirUrl,
  },
} satisfies Record<CounterCircuit, Record<"prover" | "verifier" | "zkir", string>>;

async function loadArtifact(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load proving artifact (${response.status}).`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

class CounterZkConfigProvider extends ZKConfigProvider<CounterCircuit> {
  async getProverKey(circuitId: CounterCircuit) {
    return createProverKey(await loadArtifact(circuitArtifacts[circuitId].prover));
  }

  async getVerifierKey(circuitId: CounterCircuit) {
    return createVerifierKey(await loadArtifact(circuitArtifacts[circuitId].verifier));
  }

  async getZKIR(circuitId: CounterCircuit) {
    return createZKIR(await loadArtifact(circuitArtifacts[circuitId].zkir));
  }
}

const compiledCounter = CompiledContract.make<
  Counter.Contract<CounterPrivateState>,
  CounterPrivateState
>("private-owner-counter", Counter.Contract)
  .pipe(
    CompiledContract.withWitnesses({
      localSecretKey: ({ privateState }) => [privateState, privateState.secretKey],
    }),
  )
  .pipe(CompiledContract.withCompiledFileAssets("/managed"));

const zkConfigProvider = new CounterZkConfigProvider();
const privateStateId = "private-owner-counter-owner-v1";

function newPrivateState(): CounterPrivateState {
  return { secretKey: crypto.getRandomValues(new Uint8Array(32)) };
}

export async function callCounterCircuit(
  api: ConnectedAPI,
  walletAddress: string,
  contractAddress: string,
  expectedNetwork: string,
  privateStatePassword: string,
  circuitId: CounterCircuit,
): Promise<string> {
  const configuration = await api.getConfiguration();
  if (configuration.networkId.toLowerCase() !== expectedNetwork.toLowerCase()) {
    throw new Error(
      `Network mismatch: Lace is on ${configuration.networkId}; this app requires ${expectedNetwork}.`,
    );
  }

  setNetworkId(configuration.networkId);
  const publicDataProvider = indexerPublicDataProvider(
    configuration.indexerUri,
    configuration.indexerWsUri,
  );
  const deployedState = await publicDataProvider.queryContractState(contractAddress);
  if (!deployedState) {
    throw new Error("The configured contract was not found on Preprod.");
  }

  const privateStateProvider = levelPrivateStateProvider<string, CounterPrivateState>({
    accountId: walletAddress,
    privateStoragePasswordProvider: () => privateStatePassword,
  });
  privateStateProvider.setContractAddress(contractAddress);
  if (!(await privateStateProvider.get(privateStateId))) {
    await privateStateProvider.set(privateStateId, newPrivateState());
  }

  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } =
    await api.getShieldedAddresses();
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
    async balanceTx(tx: Parameters<Parameters<typeof findDeployedContract>[0]["walletProvider"]["balanceTx"]>[0]) {
      const { tx: balancedTransaction } = await api.balanceUnsealedTransaction(
        toHex(tx.serialize()),
      );
      return Transaction.deserialize("signature", "proof", "binding", fromHex(balancedTransaction));
    },
  };
  const midnightProvider = {
    async submitTx(tx: Parameters<Parameters<typeof findDeployedContract>[0]["midnightProvider"]["submitTx"]>[0]) {
      const [transactionId] = tx.identifiers();
      if (!transactionId) {
        throw new Error("The transaction did not include an identifier.");
      }
      await api.submitTransaction(toHex(tx.serialize()));
      return transactionId;
    },
  };
  const proofProvider = await dappConnectorProofProvider(
    api,
    zkConfigProvider,
    CostModel.initialCostModel(),
  );

  const deployed = await findDeployedContract(
    {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    {
      compiledContract: compiledCounter,
      contractAddress,
      privateStateId,
    },
  );

  const result = await deployed.callTx[circuitId]();
  return result.public.txId;
}