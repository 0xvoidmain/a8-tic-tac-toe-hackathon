// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TicTacToe {
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

    uint public constant X = 1;
    uint public constant O = 2;
    uint public constant SIZE = 16;
    uint public constant MAX_TIME = 60;
    uint public constant DRAW_MARK = type(uint).max;


    Game[] public games;
    mapping(address => mapping(uint => bool)) public claimed;
    mapping(address => mapping(uint => bool)) public playerRequestDraw;

    modifier onlyPlayer(uint gameId) {
        require(games[gameId].playerX == msg.sender || games[gameId].playerO == msg.sender, "You are not in this game");
        _;
    }

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
        games[gameId].move = block.timestamp;
    }

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

    function requestDraw(uint gameId) public onlyPlayer(gameId) {
        playerRequestDraw[msg.sender][gameId] = true;
    }

    function quitGame(uint gameId) public onlyPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.winner == 0, "Game is over");
        require(game.playerX != address(0x0) && game.playerO != address(0x0), "Game is not full");
        if (game.playerX == msg.sender) {
            game.winner = O;
        }
        else {
            game.winner = X;
        }
    }

    function cancelGame(uint gameId) public onlyPlayer(gameId) {
        Game memory game = games[gameId];
        require(game.playerX == address(0x0) || game.playerO == address(0x0), "Cannot cancel");
        delete games[gameId];
        payable(msg.sender).transfer(game.betAmount);
    }

    function claimDraw(uint gameId) public  onlyPlayer(gameId) {
        require(claimed[msg.sender][gameId] == false, "You have already claimed this game");
        claimed[msg.sender][gameId] = true;

        Game memory game = games[gameId];

        uint lastMoveAt = game.move % 10 ** 10;
        uint lastMoveIsX_O = game.move / 10 ** 20;
        
        if (lastMoveIsX_O == 0 || lastMoveAt + MAX_TIME > block.timestamp) {
            payable(msg.sender).transfer(game.betAmount);
            return;
        }

        require(game.winner == 0, "No Draw");

        if (game.X | game.O == DRAW_MARK) {
            payable(msg.sender).transfer(game.betAmount);
            return;
        }

        if (playerRequestDraw[game.playerX][gameId] && playerRequestDraw[game.playerO][gameId]) {
            payable(msg.sender).transfer(game.betAmount);
            return;
        }

        require(false, "No Draw");
    }

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

    function waitingList() public view returns(Game[] memory) {
        Game[] memory result = new Game[](10);
        uint count = 0;
        for (uint i = 0; i < games.length; i++) {
            if (count == 10) break;
            if (games[i].playerO == address(0)) {
                result[count] = games[i];
                count++;
            }
        }
        return result;
    }

    function myGame() public view returns(Game memory) {
        for (uint i = 0; i < games.length; i++) {
            if (games[i].playerX == msg.sender || games[i].playerO == msg.sender) {
                return games[i];
            }
        }
        return Game({
            playerX: address(0),
            playerO: address(0),
            X: 0,
            O: 0,
            betAmount: 0,
            winner: 0,
            move: 0
        });
    }
}
