import { CircuitCall } from "./components/CircuitCall";
import { WalletConnect } from "./components/WalletConnect";
import { useMidnight } from "./hooks/useMidnight";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS?.trim() ?? "";

export default function App() {
  const midnight = useMidnight();

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Midnight Counter home">
          <span className="wordmark-symbol" aria-hidden="true">◐</span>
          <span>MIDNIGHT<span className="wordmark-light"> / COUNTER</span></span>
        </a>
        <div className="topbar-right">
          <span className="network-tag"><span /> PREPROD</span>
          <WalletConnect
            address={midnight.wallet?.address ?? null}
            networkId={midnight.wallet?.networkId ?? null}
            connecting={midnight.connecting}
            error={midnight.error}
            onConnect={midnight.connect}
            onDisconnect={midnight.disconnect}
          />
        </div>
      </header>

      <section className="intro">
        <div className="intro-copy">
          <p className="eyebrow">PRIVATE-OWNER COUNTER <span>·</span> 001</p>
          <h1>Your count.<br /><em>Your secret.</em></h1>
          <p className="intro-description">
            Increment only what you own. Midnight verifies the proof; your secret stays yours.
          </p>
        </div>
        <div className="moon-graphic" aria-hidden="true">
          <div className="moon-disc"><span /></div>
          <span className="moon-caption">LOCAL PROOF / PUBLIC RESULT</span>
        </div>
      </section>

      <section className="counter-strip" aria-label="Counter information">
        <div className="count-value">
          <span className="eyebrow">ON-CHAIN COUNT</span>
          <strong>--</strong>
          <span className="count-note">Available after contract deployment</span>
        </div>
        <div className="strip-divider" />
        <div className="owner-value">
          <span className="eyebrow">OWNERSHIP</span>
          <strong><span className="owner-dot" /> {midnight.wallet ? "WALLET CONNECTED" : "NOT CONNECTED"}</strong>
          <span className="count-note">Secret key never leaves your device</span>
          {midnight.wallet && <span className="connected-address">{midnight.wallet.address}</span>}
        </div>
        <div className="strip-code">M<br />D</div>
      </section>

      <CircuitCall
        connected={Boolean(midnight.wallet)}
        contractAddress={contractAddress}
        onCircuit={midnight.runCircuit}
      />

      <footer className="page-footer">
        <span>MIDNIGHT NETWORK <i>×</i> COMPACT</span>
        <span>PRIVACY IS THE DEFAULT</span>
      </footer>
    </main>
  );
}