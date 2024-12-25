import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { contractConfigs } from "../../contractConfig"
import { zeroAddress } from "viem"
import { useEffect, useState } from "react"
import checkWin from "../../utils/checkWin"

export default () => {
  const account = useAccount()
  const [currentTime, setCurrentTime] = useState(0)

  const { data: SIZE } = useReadContract({
    ...contractConfigs,
    functionName: 'SIZE',
  })

  const { data: MAX_TIME } = useReadContract({
    ...contractConfigs,
    functionName: 'MAX_TIME',
  })

  const size = Number(SIZE)
  const maxTime = Number(MAX_TIME)

  const { data: myGame, refetch } = useReadContract({
    ...contractConfigs,
    functionName: 'myGame',
    args: [account.address || zeroAddress]
  })
  
  const gameId = myGame?.[0]
  const game = myGame?.[1]
  const lastMoveAt = Number((myGame?.[1].move || BigInt(0)) % BigInt(10 ** 10))
  const lastMoveIsX_O = Number((myGame?.[1].move || BigInt(0)) / BigInt(10 ** 20))

  const { 
    writeContract 
  } = useWriteContract()


  useEffect(() => {
      setInterval(() => {
        refetch()
      }, 5000)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(Math.round(new Date().getTime() / 1000))
    }, 1000)
    return () => clearInterval(id)
  })


  const move = async (index: number) => {
    var win = checkWin(
      game?.X.toString(2).split('').reverse() || [], 
      game?.O.toString(2).split('').reverse() || [], 
      index, 
      game?.playerX == account.address ? 1 : 2, 
      size)
    console.log(win)
    
    writeContract({
      ...contractConfigs,
      functionName: 'makeMove',
      args: [
        BigInt(gameId || 0), 
        BigInt(index), 
        win ? BigInt(win.winLine) : BigInt(0), 
        win ? BigInt(win.start) : BigInt(0)
      ]
    })
  }

  const claimReward = async () => {
    writeContract({
      ...contractConfigs,
      functionName: 'claimWinner',
      args: [BigInt(gameId || 0)]
    })
  }

  const renderValue = (index: number) => {
    if (game?.X.toString(2).split('').reverse()[index] == '1') {
      return <span>❌</span>
    }
    if (game?.O.toString(2).split('').reverse()[index] == '1') {
      return <span>🟢</span>
    }
    return <span style={{opacity: 0.2, fontSize: 12}}>{index}</span>
  }

  const countDown = lastMoveAt + maxTime - currentTime

  if (game?.playerO == account.address || game?.playerX == account.address) {
    return <div>
      <div style={{textAlign: 'center'}}>
        <h3>Game: #{gameId?.toString() || 0}</h3>
        <span>
          <b>Player ❌</b>: {game?.playerX.substring(0, 5)}...{game?.playerX.substring(28, 32)}
          <b style={{color: 'red'}}>&nbsp;&nbsp;{(lastMoveIsX_O == 0 || lastMoveIsX_O == 2) && Number(game?.winner) == 0 && `[${countDown > 0 ? countDown : 0}]`}</b>
          <b style={{color: 'red'}}>&nbsp;&nbsp;{Number(game?.winner) == 1 && `[WINNER!]`}</b>
        </span>
        <span>&nbsp;&nbsp;&nbsp;<b>- VS -</b>&nbsp;&nbsp;&nbsp;</span>
        <span>
          <b>Player 🟢</b>: {game?.playerO.substring(0, 5)}...{game?.playerO.substring(28, 32)}
          <b style={{color: 'red'}}>&nbsp;&nbsp;{lastMoveIsX_O == 1 && Number(game?.winner) == 0  && `[${ countDown > 0 ? countDown : 0}]`}</b>
          <b style={{color: 'red'}}>&nbsp;&nbsp;{Number(game?.winner) == 2 && `[WINNER!]`}</b>
        </span>
      </div>
      <div style={{textAlign: 'center'}}>
        {((Number(game?.winner) == 1 && game?.playerX == account.address) 
        || (Number(game?.winner) == 2 && game?.playerO == account.address)) &&
          <button onClick={() => claimReward()}>claim reward #{gameId?.toString()}</button>
        }
      </div>
      <br/>
      {Array.from({ length: size }, (_, index) => index).map((row) => (
        <div key={row} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {Array.from({ length: size }, (_, index) => index).map((col) => (
            <button key={col} 
              style={{ 
                width: 35, height: 35,
                border: '1px solid #5f5f5f', 
                backgroundColor: 'black',
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                cursor: 'pointer' 
              }}
              onClick={() => move(row * size + col)}
            >
              {renderValue(row * size + col)}
            </button>
          ))}
        </div>
      ))}
    </div>
  }

  return <></>
}