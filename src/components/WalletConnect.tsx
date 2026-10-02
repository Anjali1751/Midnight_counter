type WalletConnectProps = {
  address: string | null;
  networkId: string | null;
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function WalletConnect({
  address,
  networkId,
  connecting,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  return (
    <div className="wallet-area">
      {address ? (
        <div className="wallet-connected" aria-live="polite">
          <span className="connection-dot" aria-hidden="true" />
          <span className="wallet-address" title={address}>
            {address}
          </span>
          <span className="network-label">{networkId}</span>
          <button className="text-button" onClick={onDisconnect} type="button">
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="connect-button"
          disabled={connecting}
          onClick={onConnect}
          type="button"
        >
          <span className="button-orbit" aria-hidden="true" />
          {connecting ? "Connecting…" : "Connect Lace"}
        </button>
      )}
      {error && <p className="wallet-error" role="alert">{error}</p>}
    </div>
  );
}