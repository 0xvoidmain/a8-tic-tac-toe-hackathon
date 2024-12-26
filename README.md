# Setup project

### Smart contract
```
npm init
npm install --save-dev hardhat
npx hardhat init
```

### Create or rename contract file

`contrants > Lock.sol => TicTacToe.sol`

```js
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TicTacToe {
}
```

### Create or rename deploy file

`ingnition > modules > Lock.ts => Deploy.ts`

```js
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  
  const contract = m.contract("TicTacToe");

  return { contract };
});

export default DeployModule;
```

### Config Hardhat
Update `package.json`
```js
"scripts": {
    "compile": "hardhat compile",
    "deploy": "npx hardhat ignition deploy ignition/modules/Deploy.ts",
    "deploy-verify": "npx hardhat ignition deploy ignition/modules/Deploy.ts --verify"
}
```

config `hardhat.config.ts`
```js
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    hardhat: {
    },
    a8testnet: {
      url: 'https://rpcv2-testnet.ancient8.gg',
      accounts: ['your private key'],
      gasPrice: 1000000000
    }
  },
  etherscan: {
    apiKey: {
      a8testnet: '',
    },
    customChains: [
      {
        network: "a8testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://scanv2-testnet.ancient8.gg/api",
          browserURL: "https://scanv2-testnet.ancient8.gg",
        }
      }
    ]
  },
  defaultNetwork: 'a8testnet',
};

export default config;

```


# Đặt mục tiêu

### Sản phẩm
1. Game cờ cá rô 256 ô ~ 16x16
2. 2 người chơi với nhau
3. Mỗi người chơi sẽ đặt cược một lượng ETH
4. Ai thắng trò chơi sẽ nhận được toàn bộ token của người chơi còn lại
6. Quá 60s mà không đi nước cờ của mình thì thua cuộc
7. Người chơi truy cập vào web-app kết nối metamask
8. Người chơi có thể tạo một game hoặc join vào game của người chơi khác
9. Người chơi claim reward khi chiến thắng

### Luật chơi cờ cá rô
1. Ai đạt được 5 quân liên tiếp theo hàng ngang, dọc, chéo là chiến thắng
2. Chấp nhận chặn 2 đầu
4. Hoà khi cả 2 bên cùng xác nhận là hoà hoặc không còn ô nào để đi



.
# Code, code, code

### game structure - v1
1. Người chơi X
2. Người chơi O
3. Ma trận bàn cờ
4. Số tiền cược
5. Nước đi của người chơi
6. Kết quả trận đấu

```js
struct GameV1 {
    address playerX;
    address playerO;
    uint betAmount;
    uint8[256] matrix;
    uint8 winner; //1: playerX, 2: playerO
    uint8 moveOf; // 1/2: Ai vừa đi
    uint8 movePosition; // vị trí
    uint32 movedAt; // timestamp của nước cờ gần nhất
}
```

### Matrix
```js
matrix = [0, 0, 0, 1, 1, 2, 1, 0, 2]

//OR

matrix = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1],
    [0, 0, 1, 2, 2, 1],
    [0, 0, 1, 2, 2, 1],
    [0, 0, 1, 2, 1, 1]
]
```

### Tối ưu matrix
```js
uint X = 0b000001010101010101011110101010101
uint O = 0b101010101010101010100001010000000

uint matrix = X | O //OR BIT = 0b101011111111111111111111111010101
```

### Game Struct
```js
struct Game {
    address playerX;
    address playerO;
    uint X;
    uint O;
    uint betAmount;
    uint8 winner; //0: no winner/draw, 1: playerX, 2: playerO
    uint8 moveOf; 
    uint8 movePos;
    uint64 movedAt;
}


Game[] public games;

uint8 public constant X = 1;
uint8 public constant O = 2;
uint8 public constant SIZE = 16;
uint8 public constant MAX_TIME = 60;
uint public constant DRAW_MARK = type(uint).max;
```

### Modifier
```js
modifier onlyPlayer(uint gameId) {
  require(games[gameId].playerX == msg.sender || games[gameId].playerO == msg.sender, "You are not in this game");
  _;
}
```

### CreateGame & JoinGame

```js
function createGame() public payable {
    games.push(Game({
        playerX: msg.sender,
        playerO: address(0),
        X: 0,
        O: 0,
        betAmount: msg.value,
        winner: 0,
        move: 0
    }));
}

function joinGame(uint gameId) public payable {
    require(games[gameId].playerX != address(0), "Game does not exist");
    require(games[gameId].playerO == address(0), "Game is full");
    require(games[gameId].playerX != msg.sender, "You can't join your own game");
    require(games[gameId].betAmount == msg.value, "Bet amount is not correct");
    games[gameId].playerO = msg.sender;
    games[gameId].movedAt = uint64(block.timestamp);
}
```

### Đi nước cờ của mình và kiểm tra chiến thắng - version 1
```js
function checkWin(uint board, uint pos) public pure returns (bool) {
  // Quét bàn cờ dựa vào vị trí đánh mới nhất của người chơi
  // Nếu tạo thành 5 quân cờ liên tiếp thì chiến thắng
  // Cần 4 vòng lặp và các phép tính dịch bit để check
  return false;
}

function makeMove(uint gameId, uint8 pos) public onlyPlayer(gameId) {
    Game storage game = games[gameId];

    require(games[gameId].playerX != address(0) && games[gameId].playerO != address(0), "Game is not ready");
    require(game.winner == 0, "Game is over");
    require(game.movedAt == 0 || uint256(game.movedAt) + MAX_TIME > block.timestamp, "Time is up");

    require(pos < SIZE * SIZE, "Invalid position 1");
    require(game.X & game.O & (1 << pos) == 0, "Invalied position 2");

    game.movePos = pos;
    game.movedAt = uint64(block.timestamp);
    if (game.moveOf == X) {
        require(game.playerO == msg.sender, "Wrong turn");
        game.moveOf = O;
        game.O |= (1 << pos);

        if (checkWin(game.O, uint(pos))) {
            game.winner = O;
        }
    }
    else { // X goes first
        require(game.playerX == msg.sender, "Wrong turn");
        game.moveOf = X;
        game.X |= (1 << pos);

        if (checkWin(game.X, uint(pos))) {
            game.winner = X;
        }
    }
}
```

### Nâng cấp hàm đi nước cờ của mình kết hợp với client để tối ưu gas
```js
// winline: ROW = 1, COLUMN = 2, LEFT-RIGHT: 3, RIGHT-LEFT: 4
function checkWin(uint board, uint winLine, uint start) public pure returns(bool) {
    if (start >= SIZE * SIZE) return false;

    uint mark = 0;

    if (winLine == 1) {
        if (start % SIZE >= SIZE - 4) return false;
        for (uint i = start; i <= start + 4; i++) {
            mark |= 1 << i;
        }
    }
    
    if (winLine == 2) {
        if (start / SIZE >=  SIZE - 4) return false;

        for (uint i = start; i <= start + SIZE * 4; i += SIZE) {
            mark |= 1 << i;
        }
    }
    
    if (winLine == 3) {
        if (start % SIZE >= SIZE - 4 || start / SIZE >=  SIZE - 4) return false;

        for (uint i = start; i <= start + SIZE * 4 + 4; i += SIZE + 1) {
            mark |= 1 << i;
        }
    }
    
    if (winLine == 4) {
        if (start % SIZE < 4 || start / SIZE >=  SIZE - 4) return false;

        for (uint i = start; i <= start + SIZE * 4 - 4; i += SIZE - 1) {
            mark |= 1 << i;
        }
    }

    return mark & board == mark;
}
```

```js
function makeMove(uint gameId, uint8 pos, uint8 winLine, uint8 winPos) public onlyPlayer(gameId) {
    Game storage game = games[gameId];

    require(games[gameId].playerX != address(0) && games[gameId].playerO != address(0), "Game is not ready");
    require(game.winner == 0, "Game is over");
    require(game.movedAt == 0 || uint256(game.movedAt) + MAX_TIME > block.timestamp, "Time is up");

    require(pos < SIZE * SIZE, "Invalid position 1");
    require(game.X & game.O & (1 << pos) == 0, "Invalied position 2");

    game.movePos = pos;
    game.movedAt = uint64(block.timestamp);
    if (game.moveOf == X) {
        require(game.playerO == msg.sender, "Wrong turn");
        game.moveOf = O;
        game.O |= (1 << pos);

        if (winLine > 0 && checkWin(game.O, uint(winLine), uint(winPos))) {
            game.winner = O;
        }
    }
    else { // X goes first
        require(game.playerX == msg.sender, "Wrong turn");
        game.moveOf = X;
        game.X |= (1 << pos);

        if (winLine > 0 && checkWin(game.X, uint(winLine), uint(winPos))) {
            game.winner = X;
        }
    }
}
```


### ClaimReward
```js
// Khai báo thêm mapping đánh dấu đã claim
mapping(address => mapping(uint => bool)) public claimed;
```
```js
function claimReward(uint gameId) public onlyPlayer(gameId) {
    require(claimed[msg.sender][gameId] == false, "You have already claimed this game");
    claimed[msg.sender][gameId] = true;
    
    Game memory game = games[gameId];
    uint lastMoveAt = game.move % 10 ** 10;
    uint lastMoveIsX_O = game.move / 10 ** 20;

    require(game.X | game.O != DRAW_MARK, "Game is draw");

    if (game.winner == 0 && lastMoveIsX_O == X && lastMoveAt + MAX_TIME < block.timestamp) {
        game.winner = O;
    }
    else if (game.winner == 0 && lastMoveIsX_O == O && lastMoveAt + MAX_TIME < block.timestamp) {
        game.winner = X;
    }

    require(game.winner != 0, "No winner yet");

    if (game.winner == X && game.playerX == msg.sender) {
        payable(msg.sender).transfer(game.betAmount * 2);
    }
    else if (game.winner == O && game.playerO == msg.sender) {
        payable(msg.sender).transfer(game.betAmount * 2);
    }
}
```

### Add some get functions
```js
function allGames() public view returns(Game[] memory) {
    return games;
}

function myGame(address add) public view returns(uint index, Game memory game) {
    for (uint i = games.length - 1; i >= 0; i--) {
        if (games[i].playerX == add || games[i].playerO == add) {
            return (i, games[i]);
        }

        if (i == 0) {
            break;
        }
    }
    return (0, Game({
        playerX: address(0),
        playerO: address(0),
        X: 0,
        O: 0,
        betAmount: 0,
        winner: 0,
        moveOf: 0,
        movePos: 0,
        movedAt: 0
    }));
}
```
# Deploy SmartContract
```
npm run compile
npm run deploy-verify
```

# WEBAPP

```
npm create wagmi@latest
```

open `wagmi.ts`
setup
```
export const config = createConfig({
  chains: [ancient8Sepolia],
  connectors: [
    injected()
  ],
  transports: {
    [ancient8Sepolia.id]: http(),
  },
})
```

### create `contractConfig.ts`

```js
export const contractConfigs = {
    // ignition > deployments > chain-*** > deployed_addresses.json
    address: '0x3ED9Fb4ae0EFAEEb96B1ec9DaD256b6f48A51909',
    "abi": [
        //run compile and deploy
        //open ignition > deployments > chain-*** > artifacts > DeployModule.json
        //Copy ABI 
        
        {
            "inputs": [],
            "name": "DRAW_MARK",
            "outputs": [
                {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        ...
    ]
```

### Create Wallet components
```js
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
```

### Create ListOfGames component
```js
import { useEffect } from "react"
import { useReadContract, useWriteContract } from "wagmi"
import { contractConfigs } from "../../contractConfig"
import { formatEther, zeroAddress } from "viem"

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
```

### Create Game component
```js
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
  const lastMoveAt = Number(myGame?.[1].movedAt || BigInt(0))
  const lastMoveIsX_O = Number((myGame?.[1].moveOf || BigInt(0)))

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
        index, 
        win ? win.winLine : 0, 
        win ? win.start : 0
      ]
    })
  }

  const claimReward = async () => {
    writeContract({
      ...contractConfigs,
      functionName: 'claimReward',
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
```

### Update App component
```js
import { useAccount, useWriteContract } from 'wagmi'
import Wallet from './components/Wallet'
import { contractConfigs } from './contractConfig'
import { parseEther } from 'viem'
import Game from './components/Game'
import ListOfGames from './components/ListOfGames'

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
      <ListOfGames />
    </div>
  </div>)
}

export default App
```
# RUN, RUN, RUN......
```
npm run dev
```