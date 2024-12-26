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

### Người thắng cuộc claim reward
```js
function claimWinner(uint gameId) public onlyPlayer(gameId) {
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

# Nâng cấp hàm đi nước cờ của mình kết hợp với client để tối ưu gas
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

create `contractConfig.ts`
