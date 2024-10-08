var Bishop = function(config, board) {
    this.type = 'bishop';
    this.board = board; // Store a reference to the board
    this.constructor(config);
};

Bishop.prototype = new Piece({});

Bishop.prototype.isValidMove = function(targetPosition) {
    let currentCol = this.position.charCodeAt(0) - 65;
    let currentRow = parseInt(this.position.charAt(1)) - 1;
    let targetCol = targetPosition.col.charCodeAt(0) - 65;
    let targetRow = parseInt(targetPosition.row) - 1;

    // Check if the move is diagonal
    if (Math.abs(targetCol - currentCol) !== Math.abs(targetRow - currentRow)) {
        console.warn("Invalid move for bishop: not diagonal");
        return false;
    }

    // Determine direction of movement
    let colStep = targetCol > currentCol ? 1 : -1;
    let rowStep = targetRow > currentRow ? 1 : -1;

    // Check for pieces blocking the path
    let col = currentCol + colStep;
    let row = currentRow + rowStep;
    while (col !== targetCol && row !== targetRow) {
        let pieceInPath = this.board.getPieceAt({
            col: String.fromCharCode(col + 65),
            row: (row + 1).toString()
        });
        if (pieceInPath) {
            console.warn("Invalid move for bishop: piece blocking path");
            return false;
        }
        col += colStep;
        row += rowStep;
    }

    // Check if there's a piece at the target position
    let pieceAtTarget = this.board.getPieceAt(targetPosition);
    if (pieceAtTarget) {
        if (pieceAtTarget.color === this.color) {
            console.warn("Invalid move for bishop: cannot capture own piece");
            return false;
        } else {
            return 'capture'; // Valid capture move
        }
    }

    return true; // Valid move
};

Bishop.prototype.moveTo = function(targetPosition) {
    const result = this.isValidMove(targetPosition);
    if (result === true) {
        // Move the bishop to the new position
        this.position = targetPosition.col + targetPosition.row;
        this.render();
        return true;
    } else if (result === 'capture') {
        // Capture the piece and move
        let pieceToCapture = this.board.getPieceAt(targetPosition);
        if (pieceToCapture) {
            pieceToCapture.kill();
        }
        this.position = targetPosition.col + targetPosition.row;
        this.render();
        return true;
    }
    return false; // Invalid move
};

Bishop.prototype.kill = function() {
    if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
    }
    this.position = null;
};


Bishop.prototype.getPossibleMoves = function() {
    const moves = [];
    const currentCol = this.position.charCodeAt(0) - 65;
    const currentRow = parseInt(this.position.charAt(1)) - 1;

    // Define the four diagonal directions
    const directions = [
        { colStep: 1, rowStep: 1 },   // up-right
        { colStep: 1, rowStep: -1 },  // down-right
        { colStep: -1, rowStep: 1 },  // up-left
        { colStep: -1, rowStep: -1 }  // down-left
    ];

    for (let direction of directions) {
        let col = currentCol + direction.colStep;
        let row = currentRow + direction.rowStep;

        while (col >= 0 && col < 8 && row >= 0 && row < 8) {
            const targetPosition = {
                col: String.fromCharCode(col + 65),
                row: (row + 1).toString()
            };

            const pieceAtTarget = this.board.getPieceAt(targetPosition);

            if (!pieceAtTarget) {
                // Empty square, valid move
                moves.push({ position: targetPosition.col + targetPosition.row, capture: false });
            } else if (pieceAtTarget.color !== this.color) {
                // Enemy piece, can capture
                moves.push({ position: targetPosition.col + targetPosition.row, capture: true });
                break; // Stop checking this direction after encountering a piece
            } else {
                // Own piece, stop checking this direction
                break;
            }

            col += direction.colStep;
            row += direction.rowStep;
        }
    }

    return moves;
};