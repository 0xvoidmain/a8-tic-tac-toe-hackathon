npm init

npm install --save-dev hardhat

npx hardhat init

Clean repo

`ingnition > modules > Lock.ts => TicTacToe.ts`

```
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TicTacToeModule = buildModule("TicTacToeModule", (m) => {
  
  const contract = m.contract("TicTacToe");

  return { contract };
});

export default TicTacToeModule;
```


`contrants > Lock.sol => TicTacToe.sol`

```
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TicTacToe {
}
```

# Đặt mục tiêu
1. Game cờ cá rô 15x15
2. 2 người chơi với nhau
3. Mỗi người chơi sẽ đặt cược một lượng ETH
4. Ai thắng trò chơi sẽ nhận được toàn bộ token của người chơi còn lại
5. Có chức năng xin thua/hoà
6. Chức năng xác nhận chiến thắng khi đối thủ không đi nước cờ sau 60s

## Luật chơi cờ cá rô
1. Ai đạt được 5 quân liên tiếp theo hàng ngang, dọc, chéo là chiến thắng
2. Chấp nhận chặn 2 đầu
4. Hoà khi cả 2 bên cùng xác nhận là hoà hoặc không còn ô nào để đi

# Cấu trúc một game
1. Người chơi X
2. Người chơi O
3. Ma trận bàn cờ
4. Số tiền cược
5. Nước đi của người chơi
6. Kết quả trận đấu

## Ma trận bàn cờ
Bình thường chúng ta có thể sử dụng mảng 1 chiều hoặc 2 chiều để lưu trũ bàn cờ theo cấu trúc nhưu sau
`[0, 0, 0, 1, 1, 2, 1, 0, 2]`

Hoặc 
```
[
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1],
    [0, 0, 1, 2, 2, 1],
    [0, 0, 1, 2, 2, 1],
    [0, 0, 1, 2, 1, 1],
]
```

Tuy nhiên cách lưu trữ này có một nhược điểm là tốn bộ nhớ, do đó làm tăng phí gas của người chơi khi khởi tạo.

# Giải pháp
Ta sẽ lưu trữ dưới dạng bit
Dùng 1 số uint256 để lưu cho các nước đi của quân X và O
X = 10000101010101010101
O = 10101010101010101010


# Game Struct
```
struct Game {
    address playerX;
    address playerO;
    uint X;
    uint O;
    uint betAmount;
    uint winner; //0: no winner/draw, 1: playerX, 2: playerO
    uint move;  // store move of X/O and timestamp of last move. 
                // X = 1 * 10 ^ 20 + p * 10^10 + timestamp, 
                // O = 2 * 10 ^ 20 + p * 10^10 + timestamp
}
```

# Lưu trữ các game
Tạo một array lưu trữ tất cả các game
Game[] public games;

# Constant

```
uint public constant X = 1;
uint public constant O = 2;
uint public constant SIZE = 16;
uint public constant MAX_TIME = 60;
uint public constant DRAW_MARK = type(uint).max;
```

# Modifier

Kiểm tra chỉ người chơi đã join vào game mới có thể thực hiện các hoạt động liên quan
```
modifier onlyPlayer(uint gameId) {
  require(games[gameId].playerX == msg.sender || games[gameId].playerO == msg.sender, "You are not in this game");
  _;
}
```

# Người chơi tạo một game mới và tham gia vào game

```
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
```

```
function joinGame(uint gameId) public payable {
    require(games[gameId].playerX != address(0), "Game does not exist");
    require(games[gameId].playerO == address(0), "Game is full");
    require(games[gameId].playerX != msg.sender, "You can't join your own game");
    require(games[gameId].betAmount == msg.value, "Bet amount is not correct");
    games[gameId].playerO = msg.sender;
    games[gameId].move = block.timestamp;
}
```

# Đi nước cờ của mình và kiểm tra chiến thắng - version 1
function checkWin(uint board, uint pos) public pure returns (bool) {
  // Quét bàn cờ dựa vào vị trí đánh mới nhất của người chơi
  // Nếu tạo thành 5 quân cờ liên tiếp thì chiến thắng
  // Cần 4 vòng lặp và các phép tính dịch bit để check
  return false;
}

function makeMove(uint gameId, uint pos) public onlyPlayer(gameId) {
    Game storage game = games[gameId];
    uint lastMoveAt = game.move % 10 ** 10;
    uint lastMoveIsX_O = game.move / 10 ** 20;

    require(pos < SIZE * SIZE, "Invalid position 1");
    require(game.X & game.O & (1 << pos) == 0, "Invalied position 2");

    require(game.winner == 0, "Game is over");
    require(lastMoveAt == 0 || lastMoveAt + MAX_TIME > block.timestamp, "Time is up");

    if (lastMoveIsX_O == X) {
        require(game.playerO == msg.sender, "Wrong turn");
        game.move = 2 * 10 ** 20 + pos* 10 ** 10 + block.timestamp;
        game.O |= (1 << pos);

        if (winLine > 0 && checkWin(game.O, pos)) {
            game.winner = O;
        }
    }
    else { // X goes first
        require(game.playerX == msg.sender, "Wrong turn");
        game.move = 1 * 10 ** 20 + pos* 10 ** 10 + block.timestamp;
        game.X |= (1 << pos);

        if (winLine > 0 && checkWin(game.X, pos)) {
            game.winner = X;
        }
    }
}

# Người thắng cuộc claim reward
```
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
```
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

```
function makeMove(uint gameId, uint pos, uint winLine, uint winPos) public onlyPlayer(gameId) {
    Game storage game = games[gameId];
    uint lastMoveAt = game.move % 10 ** 10;
    uint lastMoveIsX_O = game.move / 10 ** 20;

    require(pos < SIZE * SIZE, "Invalid position 1");
    require(game.X & game.O & (1 << pos) == 0, "Invalied position 2");

    require(game.winner == 0, "Game is over");
    require(lastMoveAt == 0 || lastMoveAt + MAX_TIME > block.timestamp, "Time is up");

    if (lastMoveIsX_O == X) {
        require(game.playerO == msg.sender, "Wrong turn");
        game.move = 2 * 10 ** 20 + pos* 10 ** 10 + block.timestamp;
        game.O |= (1 << pos);

        if (winLine > 0 && checkWin(game.O, winLine, winPos)) {
            game.winner = O;
        }
    }
    else { // X goes first
        require(game.playerX == msg.sender, "Wrong turn");
        game.move = 1 * 10 ** 20 + pos* 10 ** 10 + block.timestamp;
        game.X |= (1 << pos);

        if (winLine > 0 && checkWin(game.X, winLine, winPos)) {
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
