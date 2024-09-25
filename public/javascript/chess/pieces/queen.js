var Queen = function(config) {
    this.type = 'queen';
    this.constructor(config);
};

Queen.prototype = new Piece({});

Queen.prototype.isValidPosition = function(targetPosition) {
    
    let currentCol = this.position.charAt(0);
    let currentRow = parseInt(this.position.charAt(1));
    let targetCol = targetPosition.col;
    let targetRow = parseInt(targetPosition.row);

    let colDiff = targetCol.charCodeAt(0) - currentCol.charCodeAt(0);
    let rowDiff = targetRow - currentRow;

    // Check if the move is either horizontal, vertical, or diagonal
    if (colDiff === 0 || rowDiff === 0 || Math.abs(colDiff) === Math.abs(rowDiff)) {
        // Check for pieces in the path
        let colStep = Math.sign(colDiff);
        let rowStep = Math.sign(rowDiff);
        let col = currentCol.charCodeAt(0) + colStep;
        let row = currentRow + rowStep;

        while (col !== targetCol.charCodeAt(0) || row !== targetRow) {
            let square = document.querySelector(`li[data-col="${String.fromCharCode(col)}"] li[data-row="${row}"]`);
            if (square && square.querySelector('.piece')) {
                console.warn("Path is blocked");
                return false;
            }
            col += colStep;
            row += rowStep;
        }
        return true;
    }

    console.warn("Invalid move for queen");
    return false;
};

Queen.prototype.moveTo = function(targetPosition) {
    if (this.isValidPosition(targetPosition)) {
        this.position = targetPosition.col + targetPosition.row;
        this.render();
        return true;
    } else {
        return false;
    }
};

Queen.prototype.render = function() {
    // Remove the piece from its current position
    let queenPieces = document.querySelectorAll(`.piece.${this.color}.${this.type}`);
    queenPieces.forEach(piece => piece.remove());

    // Add the piece to its new position
    let newSquare = document.querySelector(`li[data-col="${this.position[0]}"] li[data-row="${this.position[1]}"]`);
    if (newSquare) {
        newSquare.innerHTML = `<div class="piece ${this.color} ${this.type}"></div>`;
    }
};
