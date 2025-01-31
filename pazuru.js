const container = document.getElementById('puzzle-container');
const shuffleBtn = document.getElementById('shuffle-btn');
const solveBtn = document.getElementById('solve-btn');
const resetBtn = document.getElementById('reset-btn');
const timeDisplay = document.getElementById('time');
const moveCountDisplay = document.getElementById('moves');
const levelSelect = document.getElementById('level');
const themeToggle = document.getElementById('theme-toggle');
const rankingContainer = document.getElementById('ranking-container');  // ランキング表示用のコンテナ

let size = 5, tiles = [], moveCount = 0, timerInterval, startTime, draggedTile = null;

function initTiles() {
    size = parseInt(levelSelect.value);
    tiles = Array.from({ length: size * size }, (_, i) => i + 1);
    tiles[size * size - 1] = 0;
    moveCount = 0;
    updateDisplays();
    renderTiles();
    resetTimer();
}

function renderTiles() {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 100px)`;
    tiles.forEach((tile, index) => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.draggable = tile !== 0;
        div.dataset.index = index;
        if (tile) div.style.backgroundImage = `url('北海道.png')`;
        div.style.backgroundPosition = `${-((tile - 1) % size) * 100}px ${-Math.floor((tile - 1) / size) * 100}px`;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', (e) => handleDrop(e, index));
        div.addEventListener('click', () => swapTiles(index));
        container.appendChild(div);
    });
}

function handleDragStart(e) { draggedTile = e.target; }
function handleDragEnd() { draggedTile = null; }
function handleDragOver(e) { e.preventDefault(); }

function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (draggedTile) swapTiles(draggedTile.dataset.index, targetIndex);
}

function swapTiles(index1, index2) {
    index1 = parseInt(index1);
    index2 = parseInt(index2);
    if (isAdjacent(index1, index2)) {
        [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
        moveCount++;
        updateDisplays();
        renderTiles();
        checkWin();
    }
}

function isAdjacent(index1, index2) {
    const [row1, col1] = [Math.floor(index1 / size), index1 % size];
    const [row2, col2] = [Math.floor(index2 / size), index2 % size];
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function checkWin() {
    if (tiles.join('') === [...Array(size * size - 1)].map((_, i) => i + 1).concat(0).join('')) {
        clearInterval(timerInterval);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        alert(`おめでとう！所要時間: ${timeTaken}秒, 動き: ${moveCount}回`);
        saveScore(timeTaken, moveCount);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timeDisplay.textContent = '0';
    timerInterval = setInterval(() => timeDisplay.textContent = Math.floor((Date.now() - startTime) / 1000), 1000);
}

function updateDisplays() { moveCountDisplay.textContent = moveCount; }

function shuffleTiles() {
    tiles.sort(() => Math.random() - 0.5);
    renderTiles();
    resetTimer();
}

function solvePuzzle() { alert("解決手順未実装"); }

function resetPuzzle() { initTiles(); }

function saveScore(time, moves) {
    let scores = JSON.parse(localStorage.getItem('puzzleScores')) || [];
    scores.push({ time, moves });
    scores.sort((a, b) => a.time - b.time || a.moves - b.moves);  // タイムと動きでソート
    if (scores.length > 10) scores.pop();  // 上位10件だけ保存
    localStorage.setItem('puzzleScores', JSON.stringify(scores));
    displayRanking();
}

function displayRanking() {
    const scores = JSON.parse(localStorage.getItem('puzzleScores')) || [];
    rankingContainer.innerHTML = '<h2>ランキング</h2>';
    scores.forEach((score, index) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.textContent = `順位 ${index + 1}: ${score.time}秒, ${score.moves}回`;
        rankingContainer.appendChild(scoreDiv);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const pieces = document.querySelectorAll(".puzzle-piece");
    let selectedPiece = null;
    let startX, startY;

    pieces.forEach(piece => {
        piece.addEventListener("touchstart", onTouchStart, false);
        piece.addEventListener("touchmove", onTouchMove, false);
        piece.addEventListener("touchend", onTouchEnd, false);
    });

    function onTouchStart(event) {
        selectedPiece = event.target;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }

    function onTouchMove(event) {
        if (!selectedPiece) return;

        let dx = event.touches[0].clientX - startX;
        let dy = event.touches[0].clientY - startY;

        selectedPiece.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function onTouchEnd() {
        selectedPiece = null;
    }
});




initTiles();
displayRanking();  // ページロード時にランキングを表示
