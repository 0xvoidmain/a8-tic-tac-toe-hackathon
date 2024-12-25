import { useAccount, useWriteContract } from 'wagmi'
import Wallet from './components/Wallet'
import { contractConfigs } from './contractConfig'
import { parseEther } from 'viem'
import Game from './components/Game'
import WaitingList from './components/WaitingList'

function App() {
  const account = useAccount()

  const { 
    writeContract 
  } = useWriteContract()

  const createGame = async () => {
    writeContract({
      ...contractConfigs,
      functionName: 'createGame',
      value: parseEther('0.001')
    })
  }

  if (account.status !== 'connected') {
    return <Wallet />
  }
  return (<div>
    <Wallet />
    <div>
      <h2>
        Game &nbsp; <button type="button" onClick={createGame}>Create A Game</button>
      </h2>
      <Game />
      <WaitingList />
    </div>
  </div>)
}

export default App
