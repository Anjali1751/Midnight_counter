import { useState } from "react";
import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { callCounterCircuit, type CounterCircuit } from "../midnight/counterProviders";

type WalletState = {
  api: ConnectedAPI;
  address: string;
  networkId: string;
};

type MidnightState = {
  wallet: WalletState | null;
  connecting: boolean;
  error: string | null;
};

const expectedNetwork = import.meta.env.VITE_MIDNIGHT_NETWORK_ID || "preprod";
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS?.trim() ?? "";

function describeWalletError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/reject|denied|cancel/i.test(message)) {
    return "Connection was declined in Lace.";
  }
  return message || "Could not connect to Lace. Please try again.";
}

export function useMidnight() {
  const [state, setState] = useState<MidnightState>({
    wallet: null,
    connecting: false,
    error: null,
  });

  async function connect() {
    setState((current) => ({ ...current, connecting: true, error: null }));
    try {
      const wallets = Object.values(window.midnight ?? {}) as InitialAPI[];
      const lace = wallets.find((wallet) => /lace/i.test(wallet.name));
      if (!lace) {
        throw new Error("Lace was not detected. Install or enable the Lace wallet extension.");
      }

      const api = await lace.connect(expectedNetwork);
      const configuration = await api.getConfiguration();
      if (configuration.networkId.toLowerCase() !== expectedNetwork.toLowerCase()) {
        throw new Error(
          `Network mismatch: Lace is connected to ${configuration.networkId}, but this app requires ${expectedNetwork}.`,
        );
      }

      const { unshieldedAddress } = await api.getUnshieldedAddress();
      setState({
        wallet: { api, address: unshieldedAddress, networkId: configuration.networkId },
        connecting: false,
        error: null,
      });
    } catch (error) {
      setState({ wallet: null, connecting: false, error: describeWalletError(error) });
    }
  }

  function disconnect() {
    setState({ wallet: null, connecting: false, error: null });
  }

  async function runCircuit(circuitId: CounterCircuit, privateStatePassword: string) {
    if (!state.wallet) {
      throw new Error("Connect Lace before calling a circuit.");
    }
    if (!contractAddress) {
      throw new Error("No Preprod contract address is configured.");
    }
    return callCounterCircuit(
      state.wallet.api,
      state.wallet.address,
      contractAddress,
      expectedNetwork,
      privateStatePassword,
      circuitId,
    );
  }

  return { ...state, connect, disconnect, runCircuit };
}