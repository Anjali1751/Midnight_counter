import { useState } from "react";
import type { CounterCircuit } from "../midnight/counterProviders";

type CircuitCallProps = {
  connected: boolean;
  contractAddress: string;
  onCircuit: (circuitId: CounterCircuit, privateStatePassword: string) => Promise<string>;
};

export function CircuitCall({ connected, contractAddress, onCircuit }: CircuitCallProps) {
  const [privateStatePassword, setPrivateStatePassword] = useState("");
  const [runningCircuit, setRunningCircuit] = useState<CounterCircuit | null>(null);
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const passwordIsValid =
    privateStatePassword.length >= 16 &&
    [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) =>
      pattern.test(privateStatePassword),
    ).length >= 3;
  const ready = connected && Boolean(contractAddress) && passwordIsValid && !runningCircuit;

  async function run(circuitId: CounterCircuit) {
    setRunningCircuit(circuitId);
    setTransactionId("");
    setStatus(`Generating the ${circuitId} proof with Lace…`);
    try {
      const submittedId = await onCircuit(circuitId, privateStatePassword);
      setTransactionId(submittedId);
      setStatus("Transaction submitted to Preprod.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The transaction failed.");
    } finally {
      setPrivateStatePassword("");
      setRunningCircuit(null);
    }
  }

  const disabledMessage = !connected
    ? "Connect Lace before calling a circuit."
    : !contractAddress
      ? "No Preprod contract address is configured."
      : !passwordIsValid
        ? "Enter a strong password to unlock encrypted private state."
        : "";

  return (
    <section className="circuit-panel" aria-labelledby="circuit-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">OWNER CIRCUIT</p>
          <h2 id="circuit-title">Increment the counter</h2>
        </div>
        <span className="circuit-index">01 / INCREMENT</span>
      </div>
      <p className="circuit-copy">
        Claim once, then increment. The owner key is generated and kept in encrypted browser storage.
      </p>
      <label className="private-state-label" htmlFor="private-state-password">
        Private-state storage password
      </label>
      <input
        autoComplete="current-password"
        className="private-state-password"
        id="private-state-password"
        onChange={(event) => setPrivateStatePassword(event.target.value)}
        placeholder="16+ characters, at least 3 character types"
        type="password"
        value={privateStatePassword}
      />
      <div className="circuit-actions">
        <button
          className="increment-button secondary-action"
          disabled={!ready}
          onClick={() => void run("claim")}
          type="button"
        >
          Claim ownership
        </button>
        <button
          className="increment-button"
          disabled={!ready}
          onClick={() => void run("increment")}
          type="button"
        >
          <span aria-hidden="true">+</span> Prove and increment
        </button>
      </div>
      <p className="circuit-status" role="status">
        {status || disabledMessage || "Proof generation is handled by the connected Lace wallet."}
      </p>
      <div className="privacy-label">
        <span className="privacy-mark" aria-hidden="true">◌</span>
        <span>Proved without revealing your input</span>
      </div>
      <p className="transaction-result">
        <span>LAST TRANSACTION</span>
        <span>{transactionId || "No transaction submitted"}</span>
      </p>
    </section>
  );
}