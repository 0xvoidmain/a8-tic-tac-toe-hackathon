import { useEffect } from "react"
import { useReadContract, useWriteContract } from "wagmi"
import { contractConfigs } from "../../contractConfig"
import { formatEther, parseEther, zeroAddress } from "viem"

export default () => {
    const { data: games, refetch: refetchGames } = useReadContract({
        ...contractConfigs,
        functionName: 'allGames'
    })


    const { 
        writeContract 
    } = useWriteContract()


    useEffect(() => {
        setInterval(() => {
            refetchGames()
        }, 5000)
    })

    const joinGame = async (game: any, index: number) => {
        writeContract({
            ...contractConfigs,
            functionName: 'joinGame',
            args: [BigInt(index)],
            value: game.betAmount
        })
    }
    return (
        <div>
            <div>
                <h3>List Game</h3>
                <ul>
                {games?.map((game, index) => (
                    <li key={index}>
                        <b>{index}</b>: {game.playerX.substring(0, 5)}...{game.playerX.substring(28, 32)}: {formatEther(game.betAmount)} ETH
                        &nbsp;
                        {game.playerO == zeroAddress && <button type="button" onClick={() => joinGame(game, index)}>Join</button>}
                    </li>
                ))}
                </ul>
            </div>
        </div>
    )
}