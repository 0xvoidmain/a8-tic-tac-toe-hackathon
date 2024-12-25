export default function checkWin(boardX: string[], boardO: string[], indexOfMove: number, v: 1 | 2, SIZE: number) {
    var XY = function (_x: number, _y: number) {
      return _y * SIZE + _x;
    }
    var board = [];
    for (var i = 0; i < SIZE * SIZE; i++) {
        board.push(boardX[i] == '1' ? 1 : boardO[i] == '1' ? 2 : 0);
    }
    board[indexOfMove] = v;
    const B = [];
    for (var i = 0; i < SIZE; i++) {
      let row = board.slice(i * SIZE, i * SIZE + SIZE)
      B.push(row);
      console.log(row)
    }

    var x = indexOfMove % SIZE;
    var y = Math.floor(indexOfMove / SIZE);


    var count = 1;
    var line = { winLine: 1, start: indexOfMove, end: indexOfMove };
    //Check by Row
    for (var i = 1; i <= 4 && x - i >= 0; i++)
      if (B[y][x - i] == v) { count++; line.start = XY(x - i, y); }
    for (var i = 1; i <= 4 && x + i < SIZE; i++)
      if (B[y][x + i] == v) { count++; line.end = XY(x + i, y); }

    if (count >= 5) return line;

    count = 1;
    line = { winLine: 2, start: indexOfMove, end: indexOfMove };
    //Check by Collum
    for (var i = 1; i <= 4 && y - i >= 0; i++)
      if (B[y - i][x] == v) { count++; line.start = XY(x, y - i); }
    for (var i = 1; i <= 4 && y + i < SIZE; i++)
      if (B[y + i][x] == v) { count++; line.end = XY(x, y + i); }

    if (count >= 5) return line;

    count = 1;
    line = { winLine: 3, start: indexOfMove, end: indexOfMove };
    //Check by Diagonal Left to Right
    for (var i = 1; i <= 4 && x - i >= 0 && y - i >= 0; i++)
      if (B[y - i][x - i] == v) { count++; line.start = XY(x - i, y - i); }
    for (var i = 1; i <= 4 && x + i < SIZE && y + i < SIZE; i++)
      if (B[y + i][x + i] == v) { count++; line.end = XY(x + i, y + i) }

    if (count >= 5) return line;

    count = 1;
    line = { winLine: 4, start: indexOfMove, end: indexOfMove };
    //Check by Diagonal Right to Left
    for (var i = 1; i <= 4 && x + i < SIZE && y - i >= 0; i++)
      if (B[y - i][x + i] == v) { count++; line.start = XY(x + i, y - i); }
    for (var i = 1; i <= 4 && x - i >= 0 && y + i < SIZE; i++)
      if (B[y + i][x - i] == v) { count++; line.end = XY(x - i, y + i); }

    if (count >= 5) return line;

    return null;
}