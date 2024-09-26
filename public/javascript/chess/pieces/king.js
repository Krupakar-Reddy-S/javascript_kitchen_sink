var King = function(config, board) {
    this.type = 'king';
    this.board = board; // Store a reference to the board
    this.hasMoved = false; // Track if the king has moved (for castling)
    this.constructor(config);
};

King.prototype = new Piece({});

King.prototype.isValidMove = function(targetPosition) {
    let currentCol = this.position.charCodeAt(0) - 65;
    let currentRow = parseInt(this.position.charAt(1)) - 1;
    let targetCol = targetPosition.col.charCodeAt(0) - 65;
    let targetRow = parseInt(targetPosition.row) - 1;

    // Check if the move is within one square in any direction
    let colDiff = Math.abs(targetCol - currentCol);
    let rowDiff = Math.abs(targetRow - currentRow);
    
    if (colDiff > 1 || rowDiff > 1) {
        // Check for castling (only horizontal move by 2 squares)
        if (!this.hasMoved && currentRow === targetRow && Math.abs(targetCol - currentCol) === 2) {
            return this.canCastle(targetPosition);
        }
        console.warn("Invalid move for king: more than one square");
        return false;
    }

    // Check if there's a piece at the target position
    let pieceAtTarget = this.board.getPieceAt(targetPosition);
    if (pieceAtTarget) {
        if (pieceAtTarget.color === this.color) {
            console.warn("Invalid move for king: cannot capture own piece");
            return false;
        } else {
            return 'capture'; // Valid capture move
        }
    }

    return true; // Valid move
};

// Add castling logic here
King.prototype.canCastle = function(targetPosition) {
    const currentCol = this.position.charCodeAt(0) - 65;
    const targetCol = targetPosition.col.charCodeAt(0) - 65;
    const row = this.position.charAt(1); // Get row as a string (should be '1' for white, '8' for black)
    
    // Castling direction: Kingside (right) or Queenside (left)
    const direction = targetCol > currentCol ? 1 : -1;

    // Identify the rook position based on direction
    const rookCol = direction === 1 ? 'H' : 'A'; 
    const rook = this.board.getPieceAt({col: rookCol, row: row});

    // Ensure the rook is in place and has not moved
    if (!rook || rook.type !== 'rook' || rook.hasMoved) {
        console.warn("Invalid castling: Rook has moved or is not in place");
        return false;
    }

    // Check if the path between the king and the rook is clear
    let col = currentCol + direction;
    const endCol = targetCol;
    while (col !== endCol) {
        if (this.board.getPieceAt({col: String.fromCharCode(col + 65), row: row})) {
            console.warn("Invalid castling: Path is not clear");
            return false;
        }
        col += direction;
    }

    // Ensure the king is not in check, doesn't pass through, or end up in a square under attack
    const middleCol = currentCol + direction; // Square between king and rook
    const middlePosition = { col: String.fromCharCode(middleCol + 65), row: row };

    if (this.isInCheck(this.position) || this.isInCheck(middlePosition) || this.isInCheck(targetPosition)) {
        console.warn("Invalid castling: King is in check or passing through attacked square");
        return false;
    }

    return 'castle'; // Valid castling
};

// Move logic (including castling)
King.prototype.moveTo = function(targetPosition) {
    const result = this.isValidMove(targetPosition);
    if (result === true || result === 'capture') {
        // Normal move
        this.position = targetPosition.col + targetPosition.row;
        this.hasMoved = true;
        this.render();
        return true;
    } else if (result === 'castle') {
        // Castling move
        const currentCol = this.position.charCodeAt(0) - 65;
        const targetCol = targetPosition.col.charCodeAt(0) - 65;
        const direction = targetCol > currentCol ? 1 : -1;

        const rookCol = direction === 1 ? 'H' : 'A'; 
        const row = this.position.charAt(1); // The row for castling (either '1' or '8')
        const rook = this.board.getPieceAt({col: rookCol, row: row});

        // Move the king
        this.position = targetPosition.col + targetPosition.row;
        this.hasMoved = true;
        this.render();

        // Move the rook to its new position (F or D)
        const newRookCol = direction === 1 ? 'F' : 'D';
        rook.position = newRookCol + row;
        rook.hasMoved = true;
        rook.render();

        return true;
    }

    return false; // Invalid move
};

King.prototype.kill = function() {
    if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
    }
    this.position = null;
    alert("Checkmate! " + (this.color === 'white' ? 'Black' : 'White') + " wins!");
    this.board.isOver = true;
};

// Method to check if a move puts the king in check
King.prototype.isInCheck = function(targetPosition) {
    if (!this.board.pieces || !Array.isArray(this.board.pieces)) {
        console.error("Invalid board configuration: board.pieces is not defined or not an array");
        return false;
    }

    // Temporarily move the king to the target position
    const originalPosition = this.position;
    this.position = targetPosition.col + targetPosition.row;

    // Check if any enemy piece can attack this position
    const isCheck = this.board.pieces.some(piece => {
        if (piece.color !== this.color && piece.type !== 'king') {
            return piece.isValidMove(targetPosition) !== false;
        }
        return false;
    });

    // Move the king back to its original position
    this.position = originalPosition;

    return isCheck;
};

// Add possible moves including castling
King.prototype.getPossibleMoves = function() {
    const moves = [];
    const currentCol = this.position.charCodeAt(0) - 65;
    const currentRow = parseInt(this.position.charAt(1)) - 1;

    // Define all possible moves for a king (one square in any direction)
    const kingMoves = [
        { colStep: -1, rowStep: -1 },
        { colStep: -1, rowStep: 0 },
        { colStep: -1, rowStep: 1 },
        { colStep: 0, rowStep: -1 },
        { colStep: 0, rowStep: 1 },
        { colStep: 1, rowStep: -1 },
        { colStep: 1, rowStep: 0 },
        { colStep: 1, rowStep: 1 }
    ];

    for (let move of kingMoves) {
        const newCol = currentCol + move.colStep;
        const newRow = currentRow + move.rowStep;

        // Check if the new position is within the board
        if (newCol >= 0 && newCol <= 7 && newRow >= 0 && newRow <= 7) {
            const targetPosition = {
                col: String.fromCharCode(newCol + 65),
                row: (newRow + 1).toString()
            };

            const pieceAtTarget = this.board.getPieceAt(targetPosition);

            if (!pieceAtTarget || pieceAtTarget.color !== this.color) {
                // Empty square or enemy piece
                if (!this.isInCheck(targetPosition)) {
                    moves.push({ 
                        position: targetPosition.col + targetPosition.row, 
                        capture: pieceAtTarget ? true : false
                    });
                }
            }
        }
    }

    // Add castling moves if applicable
    if (!this.hasMoved) {
        // Kingside castling
        const kingsideTarget = { col: 'G', row: this.position.charAt(1) };
        if (this.canCastle(kingsideTarget) === 'castle') {
            moves.push({ position: 'G' + this.position.charAt(1), castle: true });
        }

        // Queenside castling
        const queensideTarget = { col: 'C', row: this.position.charAt(1) };
        if (this.canCastle(queensideTarget) === 'castle') {
            moves.push({ position: 'C' + this.position.charAt(1), castle: true });
        }
    }

    return moves;
};
