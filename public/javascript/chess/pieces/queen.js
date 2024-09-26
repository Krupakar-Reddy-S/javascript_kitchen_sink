QUEEN:

var Queen = function(config, board) {
    this.type = 'queen';
    this.board = board; 
    this.constructor(config);
};

Queen.prototype = new Piece({});

Queen.prototype.isValidMove = function(targetPosition) {
    let currentCol = this.position.charCodeAt(0) - 65; // Convert A-H to 0-7
    let currentRow = parseInt(this.position.charAt(1)) - 1; // Convert 1-8 to 0-7
    let targetCol = targetPosition.col.charCodeAt(0) - 65;
    let targetRow = parseInt(targetPosition.row) - 1;

    // Check if the move is horizontal, vertical, or diagonal
    let colDiff = Math.abs(targetCol - currentCol);
    let rowDiff = Math.abs(targetRow - currentRow);
    
    if (!(colDiff === 0 || rowDiff === 0 || colDiff === rowDiff)) {
        console.warn("Invalid move for queen: not horizontal, vertical, or diagonal");
        return false;
    }

    // Determine direction of movement
    let colStep = currentCol === targetCol ? 0 : (targetCol > currentCol ? 1 : -1);
    let rowStep = currentRow === targetRow ? 0 : (targetRow > currentRow ? 1 : -1);

    // Check for pieces blocking the path
    let col = currentCol + colStep;
    let row = currentRow + rowStep;
    while (col !== targetCol || row !== targetRow) {
        let pieceInPath = this.board.getPieceAt({
            col: String.fromCharCode(col + 65),
            row: (row + 1).toString()
        });
        if (pieceInPath) {
            console.warn("Invalid move for queen: piece blocking path");
            return false;
        }
        col += colStep;
        row += rowStep;
    }

    // Check if there's a piece at the target position
    let pieceAtTarget = this.board.getPieceAt(targetPosition);
    if (pieceAtTarget) {
        if (pieceAtTarget.color === this.color) {
            console.warn("Invalid move for queen: cannot capture own piece");
            return false;
        } else {
            return 'capture'; // Valid capture move
        }
    }

    return true; // Valid move
};

Queen.prototype.moveTo = function(targetPosition) {
    const result = this.isValidMove(targetPosition);
    if (result === true) {
        // Move the queen to the new position
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

Queen.prototype.kill = function() {
    if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
    }
    this.position = null;
};
