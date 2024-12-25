import { formatEther } from "viem"
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi"

export default () => {
    const account = useAccount()
    const { connectors, connect, status, error } = useConnect()
    const { disconnect } = useDisconnect()

    var { data } = useBalance({ address: account.address })

    if (account.status === 'connected') {
        return (
        <div>
            <h2>Account</h2>
            <div>
                status: {account.status}({account.chainId}) | {account.address}
                &nbsp;&nbsp;
                <button type="button" onClick={() => disconnect()}>
                    Disconnect
                </button>
            </div>
            <div>Balance: {formatEther(data?.value || BigInt(0))}</div>
        </div>)
    }

    return (
        <div>
            <h2>Connect Wallet ({status})</h2>
            {connectors.map((connector) => (
                <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
                >
                {connector.name}
                </button>
            ))}
            <div>{error?.message}</div>
        </div>
    )
}