const gridContainer = document.getElementById('sudoku-grid');
const generateBtn = document.getElementById('generate-btn');
const solveBtn = document.getElementById('solve-btn');
const statusMessage = document.getElementById('status-message');
const N = 9;
let grid = Array(N).fill(null).map(() => Array(N).fill(0));
let isSolving = false;

// --- Grid Generation and Rendering ---

function createGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.className = 'sudoku-cell';
            cell.id = `cell-${i}-${j}`;
            
            // Add classes for thicker borders
            if ((i + 1) % 3 === 0 && (i + 1) !== N) cell.classList.add(`cell-row-${i+1}`);
            if ((j + 1) % 3 === 0 && (j + 1) !== N) cell.classList.add(`cell-col-${j+1}`);
            if ((i + 1) === 1) cell.classList.add(`cell-row-1`);
            if ((j + 1) === 1) cell.classList.add(`cell-col-1`);
            if ((i + 1) === N) cell.classList.add(`cell-row-9`);
            if ((j + 1) === N) cell.classList.add(`cell-col-9`);


            // Input validation
            cell.addEventListener('input', () => {
                if (cell.value.length > 1) {
                    cell.value = cell.value[0];
                }
                if (cell.value !== '' && (cell.value < 1 || cell.value > 9)) {
                    cell.value = '';
                }
            });

            gridContainer.appendChild(cell);
        }
    }
}

function updateGridUI(board) {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.classList.remove('solved', 'initial');
            cell.readOnly = false;
            if (board[i][j] !== 0) {
                cell.value = board[i][j];
                cell.classList.add('initial');
                cell.readOnly = true;
            } else {
                cell.value = '';
            }
        }
    }
}

function readGridFromUI() {
    const newGrid = Array(N).fill(null).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            newGrid[i][j] = cell.value ? parseInt(cell.value) : 0;
        }
    }
    return newGrid;
}

// --- Puzzle Generation ---

generateBtn.addEventListener('click', generateNewPuzzle);

function generateNewPuzzle() {
    if (isSolving) return;
    grid = Array(N).fill(null).map(() => Array(N).fill(0));
    solve(grid);
    pokeHoles(grid, 45); // Difficulty: 45 holes
    updateGridUI(grid);
    statusMessage.textContent = "New puzzle generated!";
    setTimeout(() => statusMessage.textContent = '', 2000);
}

function pokeHoles(board, holes) {
    let removed = 0;
    while (removed < holes) {
        const row = Math.floor(Math.random() * N);
        const col = Math.floor(Math.random() * N);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
}

// --- Sudoku Solver Logic (Backtracking) ---

solveBtn.addEventListener('click', handleSolve);

async function handleSolve() {
    if (isSolving) return;
    isSolving = true;

    solveBtn.disabled = true;
    generateBtn.disabled = true;
    solveBtn.textContent = 'Solving...';
    statusMessage.textContent = 'The algorithm is at work!';

    const currentGrid = readGridFromUI();
    
    if (await solveWithAnimation(currentGrid)) {
        statusMessage.textContent = "Puzzle Solved Successfully!";
    } else {
        statusMessage.textContent = "No solution exists for this puzzle.";
    }
    
    isSolving = false;
    
    solveBtn.disabled = false;
    generateBtn.disabled = false;
    solveBtn.textContent = 'Solve Puzzle';
}

function solve(board) {
    const emptySpot = findEmpty(board);
    if (!emptySpot) return true;

    const [row, col] = emptySpot;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let num of nums) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) {
                return true;
            }
            board[row][col] = 0;
        }
    }
    return false;
}

async function solveWithAnimation(board) {
    const emptySpot = findEmpty(board);
    if (!emptySpot) return true;

    const [row, col] = emptySpot;
    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            const cell = document.getElementById(`cell-${row}-${col}`);
            
            if (!cell.classList.contains('initial')) {
               cell.value = num;
               cell.classList.add('solved');
               await new Promise(resolve => setTimeout(resolve, 10));
            }

            if (await solveWithAnimation(board)) {
                return true;
            }

            board[row][col] = 0;
            if (!cell.classList.contains('initial')) {
                cell.value = '';
                cell.classList.remove('solved');
            }
        }
    }
    return false;
}

function findEmpty(board) {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return null;
}

function isSafe(board, row, col, num) {
    for (let x = 0; x < N; x++) {
        if (board[row][x] === num) return false;
    }
    for (let x = 0; x < N; x++) {
        if (board[x][col] === num) return false;
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Initial Setup ---
window.onload = () => {
    createGrid();
    generateNewPuzzle();
};

