export const contractConfigs = {
    address: '0xe7A554Ed9cF0b2fB2fA30E1D6D7b6361bF8Ffe41',
    "abi": [
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
    {
      "inputs": [],
      "name": "MAX_TIME",
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
    {
      "inputs": [],
      "name": "O",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SIZE",
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
    {
      "inputs": [],
      "name": "X",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "allGames",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerX",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "playerO",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "X",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "O",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "betAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "winner",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "moveOf",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "movePos",
              "type": "uint8"
            },
            {
              "internalType": "uint64",
              "name": "movedAt",
              "type": "uint64"
            }
          ],
          "internalType": "struct TicTacToe.Game[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "board",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winLine",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "start",
          "type": "uint256"
        }
      ],
      "name": "checkWin",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "createGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "games",
      "outputs": [
        {
          "internalType": "address",
          "name": "playerX",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "playerO",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "X",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "O",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "betAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "winner",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "moveOf",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "movePos",
          "type": "uint8"
        },
        {
          "internalType": "uint64",
          "name": "movedAt",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "name": "joinGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "pos",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "winLine",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "winPos",
          "type": "uint8"
        }
      ],
      "name": "makeMove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "add",
          "type": "address"
        }
      ],
      "name": "myGame",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerX",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "playerO",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "X",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "O",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "betAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "winner",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "moveOf",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "movePos",
              "type": "uint8"
            },
            {
              "internalType": "uint64",
              "name": "movedAt",
              "type": "uint64"
            }
          ],
          "internalType": "struct TicTacToe.Game",
          "name": "game",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  } as const