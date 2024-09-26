var Knight = function (config, board) {
  this.type = "knight";
  this.board = board; 
  this.constructor(config);
};

Knight.prototype = new Piece({});

Knight.prototype.isValidMove = function (targetPosition) {
  let currentCol = this.position.charCodeAt(0) - 65;
  let currentRow = parseInt(this.position.charAt(1)) - 1;
  let targetCol = targetPosition.col.charCodeAt(0) - 65;
  let targetRow = parseInt(targetPosition.row) - 1;

  let colDiff = Math.abs(targetCol - currentCol);
  let rowDiff = Math.abs(targetRow - currentRow);

  if (!((colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2))) {
    console.warn("Invalid move for knight: not an L-shape");
    return false;
  }

  let pieceAtTarget = this.board.getPieceAt(targetPosition);
  if (pieceAtTarget) {
    if (pieceAtTarget.color === this.color) {
      console.warn("Invalid move for knight: cannot capture own piece");
      return false;
    } else {
      return "capture";
    }
  }

  return true;
};

Knight.prototype.moveTo = function (targetPosition) {
  const result = this.isValidMove(targetPosition);
  if (result === true) {
    this.position = targetPosition.col + targetPosition.row;
    this.render();
    return true;
  } else if (result === "capture") {
    let pieceToCapture = this.board.getPieceAt(targetPosition);
    if (pieceToCapture) {
      pieceToCapture.kill();
    }
    this.position = targetPosition.col + targetPosition.row;
    this.render();
    return true;
  }
  return false;
};

Knight.prototype.kill = function () {
  if (this.$el && this.$el.parentNode) {
    this.$el.parentNode.removeChild(this.$el);
  }
  this.position = null;
};

Knight.prototype.getPossibleMoves = function () {
  const moves = [];
  const currentCol = this.position.charCodeAt(0) - 65;
  const currentRow = parseInt(this.position.charAt(1)) - 1;

  const knightMoves = [
    { colStep: 2, rowStep: 1 },
    { colStep: 2, rowStep: -1 },
    { colStep: -2, rowStep: 1 },
    { colStep: -2, rowStep: -1 },
    { colStep: 1, rowStep: 2 },
    { colStep: 1, rowStep: -2 },
    { colStep: -1, rowStep: 2 },
    { colStep: -1, rowStep: -2 },
  ];

  for (let move of knightMoves) {
    const newCol = currentCol + move.colStep;
    const newRow = currentRow + move.rowStep;

    
    if (newCol >= 0 && newCol <= 7 && newRow >= 0 && newRow <= 7) {
      const targetPosition = {
        col: String.fromCharCode(newCol + 65),
        row: (newRow + 1).toString(),
      };

      const pieceAtTarget = this.board.getPieceAt(targetPosition);

      if (!pieceAtTarget) {
        
        moves.push({
          position: targetPosition.col + targetPosition.row,
          capture: false,
        });
      } else if (pieceAtTarget.color !== this.color) {
        
        moves.push({
          position: targetPosition.col + targetPosition.row,
          capture: true,
        });
      }
      
    }
  }

  return moves;
};
