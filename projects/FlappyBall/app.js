const appContainer = document.getElementById("app-container");
const appContainerBounds = appContainer.getBoundingClientRect();
const flappyBall = document.getElementById("flappy-ball");
const controls = document.getElementById("controls");
controls.style.display = "inline-block";

// Constants of the game (Game Rules)
const gravity_force = 0.7; // measured in px
const jump_height = 20; // measured in %
const jump_speed = 0.6; // measured in seconds per unit

const pillar_gap = 30; // measured in % of appcontainer height
const pillar_min_height = 100 - pillar_gap - (100-pillar_gap-10) // determines pillar min height from gap
const pillar_max_height = 100 - pillar_gap - pillar_min_height // determines pillar max height from gap and min height
const pillar_width = 10; // measured in % of appcontainer width
const pillar_delay = 3; // measured in seconds between Pillars
const pillar_speed = 30; // measured in % of appcontainer width per second
const pillar_distance = 25 // measured in % of appcontainer width

// Gamestates
let collision = false;
let game_active = false;
let stopped = false;
let gravity_stopped = false;
let first_start = false;
let firstPillarSpawn = true;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time*1000));
}

// TODO: add GameOver Screen
function gameOver() {
    game_active = false;
    stopped = true;

    const game_over = document.getElementById("game-over");
    game_over.style.display = "inline";
}

function toggleControls() {
    const on = "inline-block";
    const off = "none";

    if(controls.style.display == on) {
        controls.style.display = off;
    } else if(controls.style.display == off) {
        controls.style.display = on;
    }
}

function clearScore() {
    const score = document.getElementById("score");
    score.innerHTML = 0;
}

async function updateScore() {
    while (!stopped) {
        const pillars = Array.from(document.getElementsByClassName("pillar"));

        for (let i = 0; i < pillars.length; i++) {
            const pilBounds = pillars[i].getBoundingClientRect();
            if((pilBounds.right-pilBounds.width/2) < (appContainerBounds.right-appContainerBounds.width/2)
            && (pilBounds.right-pilBounds.width/2) > (appContainerBounds.right-appContainerBounds.width/2) - 3) {
                const score = document.getElementById("score");
                score.innerHTML = parseInt(score.innerText) + 1
                await delay(1);
            }
        }
        await delay(0.01)
    }
}


// TODO: finish reload functionality
function reload() {
    collision = false;
    game_active = false;
    stopped = false;
    firstPillarSpawn = true;

    clearScore();

    const game_over = document.getElementById("game-over");
    game_over.style.display = "none";

    const pillars = document.getElementsByClassName("pillar");

    for (let i = pillars.length-1; i >= 0; i--) {
        const pillar = pillars[i];
        pillar.remove();
    }

    flappyBall.style.top = "50%";
    flappyBall.style.left = "50%";
}

async function gravity() {
    while (!stopped && !gravity_stopped) {
        const top = flappyBall.getBoundingClientRect().top
        const bot = flappyBall.getBoundingClientRect().bottom
        const height = flappyBall.getBoundingClientRect().height;

        const y = bot - height/2;

        if (bot < appContainerBounds.bottom) {
            flappyBall.style.top = `${y+(appContainerBounds.height * (gravity_force / 100) - appContainerBounds.top)}px`;
            await delay(0.01);
        } else if (top < appContainerBounds.top) {
            flappyBall.style.top = `${appContainerBounds.top}px`;
            await delay(1);
        } else {
            gameOver();
        }
    }
}

async function jump() {
    if(!stopped) {
        gravity_stopped = true;
        for (let i = 0; i <= jump_speed * 30; i++) {
            flappyBall.style.top = `${parseFloat(flappyBall.style.top)-(appContainerBounds.height * (jump_height / 100) / 30)}px`;
            await delay(jump_speed/10/30);
        }
        await delay(0.08)
        gravity_stopped = false;
        gravity();
    }
}

async function movePillars() {
    while (!stopped) {
        const pillars = document.getElementsByClassName("pillar");

        for (let i = 0; i < pillars.length; i++) {
            const pillar_right = parseFloat(pillars[i].style.right);
            pillars[i].style.right = `${pillar_right+(appContainerBounds.width * pillar_speed / 100 / 100)}px`;
        }
        for (let i = 0; i < pillars.length; i++) {
            const pillar = pillars[i];
            if (pillar.getBoundingClientRect().right < appContainerBounds.left) {
                pillar.remove();
            }
        }
        await delay(0.01);
    }
}

function spawnPillarSet() {
    const topPillar = appContainer.appendChild(document.createElement("div"));
    topPillar.className = "pillar no-zoom";
    const bottomPillar = appContainer.appendChild(document.createElement("div"));
    bottomPillar.className = "pillar no-zoom";

    const topPillarHeight = Math.floor(Math.random() * (pillar_max_height - pillar_min_height) + pillar_min_height);
    const bottomPillarHeight = (100 - pillar_gap) - topPillarHeight;

    topPillar.style.height = `${topPillarHeight}%`;
    topPillar.style.right = `-${appContainerBounds.width * pillar_width / 100}px`;
    topPillar.style.width = `${pillar_width}%`;
    topPillar.style.top = `0`;

    bottomPillar.style.height = `${bottomPillarHeight}%`;
    bottomPillar.style.right = `-${appContainerBounds.width * pillar_width / 100}px`;
    bottomPillar.style.width = `${pillar_width}%`;
    bottomPillar.style.bottom = `0`;
}

async function spawnPillars() {
    while(true) {
        const pillars = document.getElementsByClassName("pillar");
        const latestPillar = pillars[pillars.length-1] || null;
        if (firstPillarSpawn || latestPillar.getBoundingClientRect().right < (appContainerBounds.right - appContainerBounds.width * pillar_distance / 100)) {
            spawnPillarSet();
            firstPillarSpawn = false;
        }
        
        await delay(0.01);
    }
}

async function detectCollision() {
    while (true) {
        const pillars = document.getElementsByClassName("pillar")

        for (let i = 0; i < pillars.length; i++) {
            const pillarBounds = pillars[i].getBoundingClientRect();
            const flappyBounds = flappyBall.getBoundingClientRect();
            if( flappyBounds.right > pillarBounds.left &&
                flappyBounds.left < pillarBounds.right &&
                flappyBounds.bottom > pillarBounds.top &&
                flappyBounds.top < pillarBounds.bottom) {
                gameOver();
            }
        }
        await delay(.1);
    }
}

function startGame() {
    gravity();
    spawnPillars();
    movePillars();
    detectCollision();
    updateScore();
    game_active = true;
}

addEventListener("keydown", event => {
    if (event.code == "Space") {
        if (!game_active) {
            startGame();
        }
        jump();
    } else if (stopped && event.code == "Enter") {
        reload();
    } else if (event.code == "KeyC") {
        toggleControls();
    }
});

addEventListener("click", event => {
    if (!game_active) {
        startGame();
    }
    jump();
});

addEventListener("touchstart", () => {
    if (!game_active) {
        startGame();
    }
    jump();
})

addEventListener('touchend', e => {
  e.preventDefault();
});