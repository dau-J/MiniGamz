const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const mainButton = document.getElementById('mainButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');

let isGameStarted = false;
let isGameOver = false;
let isGamePaused = false;
let frameCount = 0;
let score = 0;
let animationFrameId;

// 이미지 로드
const backgroundImg = new Image();
backgroundImg.src = 'img/background.png';

const birdImg = new Image();
birdImg.src = 'img/bird.png';

const topPipeImg = new Image();
topPipeImg.src = 'img/top-pipe.png';

const bottomPipeImg = new Image();
bottomPipeImg.src = 'img/bottom-pipe.png';

// 사운드 로드
const jumpSound = new Audio('sounds/jump.mp3');
const bgmSound = new Audio('sounds/gamebgm.mp3');
const hitSound = new Audio('sounds/hit.mp3');
bgmSound.loop = true; // 배경 음악 반복 재생

const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.1,  // 중력
    lift: -5,  // 점프 범위
    velocity: 0
};

const pipes = [];
const pipeWidth = 52;
const pipeGap = 200;  // 파이프 수직 간격
const pipeHorizontalGap = 300; // 파이프 수평 간격

function allImagesLoaded(callback) {
    let loadedImagesCount = 0;
    const totalImages = 4;

    function imageLoaded() {
        loadedImagesCount++;
        if (loadedImagesCount === totalImages) {
            callback();
        }
    }

    backgroundImg.onload = imageLoaded;
    birdImg.onload = imageLoaded;
    topPipeImg.onload = imageLoaded;
    bottomPipeImg.onload = imageLoaded;
}

function handleJump() {
    if (isGameStarted && !isGameOver && !isGamePaused) {
        bird.velocity = bird.lift;
        jumpSound.play(); // 점프 사운드 재생
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleJump();
    }
});

canvas.addEventListener('mousedown', () => {
    handleJump();
});

startButton.addEventListener('click', () => {
    if (!isGameStarted && !isGameOver) {
        isGameStarted = true;
        isGamePaused = false;
        startButton.style.display = 'none';
        pauseButton.style.display = 'block';
        resumeButton.style.display = 'none';
        restartButton.style.display = 'inline';
        bgmSound.play(); // 배경 음악 재생
        gameLoop();
    } else if (isGameStarted) {
        isGamePaused = !isGamePaused;
        pauseButton.style.display = 'none';
        resumeButton.style.display = 'block';
        if (isGamePaused) {
            bgmSound.pause(); // 배경 음악 일시 정지
        } else {
            bgmSound.play(); // 배경 음악 재개
        }
    } else if (isGameOver) {
        resetGame();
        isGameStarted = true;
        isGameOver = false;
        startButton.style.display = 'none';
        pauseButton.style.display = 'block';
        resumeButton.style.display = 'none';
        restartButton.style.display = 'inline';
        bgmSound.play(); // 배경 음악 재생
        gameLoop();
    }
});

pauseButton.addEventListener('click', () => {
    isGamePaused = true;
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'block';
    bgmSound.pause(); // 배경 음악 일시 정지
});

resumeButton.addEventListener('click', () => {
    isGamePaused = false;
    pauseButton.style.display = 'block';
    resumeButton.style.display = 'none';
    bgmSound.play(); // 배경 음악 재개
});

restartButton.addEventListener('click', () => {
    cancelAnimationFrame(animationFrameId);  // 기존의 게임 루프 중지
    resetGame();
    isGameStarted = false;
    startButton.style.display = 'inline';
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'none';
    restartButton.style.display = 'none';
});

mainButton.addEventListener('click', () => {
    window.location.href = '/';  // 메인 페이지 URL로 이동(메인페이지 경로추가해야함)
});

// 파이프 생성함수
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: pipeHeight,
        type: 'top'
    });
    pipes.push({
        x: canvas.width,
        y: pipeHeight + pipeGap,
        width: pipeWidth,
        height: canvas.height - pipeHeight - pipeGap,
        type: 'bottom'
    });
}

function update() {
    if (isGameOver || isGamePaused) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (frameCount % pipeHorizontalGap === 0) {  // 파이프 생성 주기를 증가시더 넓은 간격을 유지
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        if (
            bird.x < pipes[i].x + pipes[i].width &&
            bird.x + bird.width > pipes[i].x &&
            bird.y < pipes[i].y + pipes[i].height &&
            bird.y + bird.height > pipes[i].y
        ) {
            endGame();
        }

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    frameCount++;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 게임 배경 이미지 그리기
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // 새 그리기
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // 파이프 그리기
    for (let i = 0; i < pipes.length; i++) {
        if (pipes[i].type === 'top') {
            ctx.drawImage(topPipeImg, pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);
        } else {
            ctx.drawImage(bottomPipeImg, pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);
        }
    }

    ctx.fillStyle = '#FFF';  // 점수 텍스트 색상 설정
    ctx.font = '30px Arial';  // 점수 텍스트 크기 설정
    ctx.fillText(`Score: ${score}`, 10, 40);
}

function endGame() {
    isGameOver = true;
    isGameStarted = false;  // 게임이 끝났음 표시
    cancelAnimationFrame(animationFrameId);  // 게임 루프 중지
    bgmSound.pause(); // 배경 음악 중지
    bgmSound.currentTime = 0; // 배경 음악 위치 초기화
    hitSound.play(); // 부딪힐 때 소리 재생
    startButton.textContent = '게임 시작';
    startButton.style.display = 'inline';
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'none';
    restartButton.style.display = 'none';
}

function fetchRankings() {
    fetch('/rankings')
        .then(response => response.json())
        .then(data => {
            displayRankings(data);
        });
}

function displayRankings(rankings) {
    const rankingsDiv = document.getElementById('rankings');
    rankingsDiv.innerHTML = '<h2>Top 10 Rankings</h2>';
    rankings.forEach((entry, index) => {
        rankingsDiv.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score}</p>`;
    });
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    isGameOver = false;
}

function gameLoop() {
    update();
    render();
    if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// 모든 이미지가 로드된 후 게임을 시작
allImagesLoaded(() => {
    startButton.style.display = 'block';
});