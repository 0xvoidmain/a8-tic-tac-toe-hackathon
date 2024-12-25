import { useReadContract } from 'wagmi'
import Wallet from './components/Wallet'
import { contractConfigs } from './contractConfig'

function App() {
  const { data: contractGameSize } = useReadContract({
    ...contractConfigs,
    functionName: 'SIZE',
  })

  const size = Number(contractGameSize)
  return (<>
    <Wallet />
    <div>
      <h2>Game</h2>
      <div>Size: {size}</div>
    </div>
  </>)
}

export default App
