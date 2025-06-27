const appContainer = document.getElementById("app-container");
const flappyBall = document.getElementById("flappy-ball");
const controls = document.getElementById("controls");
let controlsOn = true;

// Constants of the game (Game Rules)
const gravity_force = 0.7; // measured in px
const jump_height = 20; // measured in %
const jump_speed = 0.6; // measured in seconds per unit

let pillar_gap = 30; // measured in % of appcontainer height
const pillar_min_height = 100 - pillar_gap - (100-pillar_gap-10) // determines pillar min height from gap
const pillar_max_height = 100 - pillar_gap - pillar_min_height // determines pillar max height from gap and min height
const pillar_width = 10; // measured in % of appcontainer width
const pillar_delay = 3; // measured in seconds between Pillars
let pillar_speed = 30; // measured in % of appcontainer width per second
let pillar_distance = 25 // measured in % of appcontainer width

// Gamestates
let collision = false;
let game_active = false;
let stopped = false;
let gravity_stopped = false;
let first_start = false;
let firstPillarSpawn = true;
let score = 0;

function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            pillar_gap = 50;
            pillar_distance = 35;
            pillar_speed = 20;

            document.getElementById('easy-difficulty').style.backgroundColor = 'green';
            document.getElementById('medium-difficulty').style.backgroundColor = 'white';
            document.getElementById('hard-difficulty').style.backgroundColor = 'white';
            break;
        case 'medium':
            pillar_gap = 40;
            pillar_distance = 30;
            pillar_speed = 25;

            document.getElementById('easy-difficulty').style.backgroundColor = 'white';
            document.getElementById('medium-difficulty').style.backgroundColor = 'green';
            document.getElementById('hard-difficulty').style.backgroundColor = 'white';
            break;
        case 'hard':
            pillar_gap = 30;
            pillar_distance = 25;
            pillar_speed = 30;

            document.getElementById('easy-difficulty').style.backgroundColor = 'white';
            document.getElementById('medium-difficulty').style.backgroundColor = 'white';
            document.getElementById('hard-difficulty').style.backgroundColor = 'green';
            break;
        default:
            return('Invalid difficulty');
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time*1000));
}

function gameOver() {
    game_active = false;
    stopped = true;

    const game_over = document.getElementById("game-over");
    game_over.style.display = "inline";
}

function toggleControls() {
    if(controlsOn) {
        controls.style.left = '-100%';
        controls.style.transition = '1s';
        controlsOn = false;
    } else {
        controls.style.left = '1%';
        controlsOn = true;
    }
}

function clearScore() {
    const scoreEl = document.getElementById("score");
    score = 0;
    scoreEl.innerHTML = score;
}

async function updateScore() {
    while (!stopped) {
        const appContainerBounds = appContainer.getBoundingClientRect();
        const pillars = Array.from(document.getElementsByClassName("pillar-top"));

        pillars.map((pillar, _) => {
            const pilBounds = pillar.getBoundingClientRect();
            if (!pillar.classList.contains('counted') &&
                (pilBounds.right-pilBounds.width/2) < (appContainerBounds.right-appContainerBounds.width/2)) {
                score++;
                document.getElementById('score').innerHTML = score;
                pillar.classList.add('counted');
            }
        });
        await delay(0.01)
    }
}

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
        const appContainerBounds = appContainer.getBoundingClientRect();
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
        const appContainerBounds = appContainer.getBoundingClientRect();
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
        const appContainerBounds = appContainer.getBoundingClientRect();
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
    const appContainerBounds = appContainer.getBoundingClientRect();
    const topPillar = appContainer.appendChild(document.createElement("div"));
    topPillar.className = "pillar pillar-top";
    const bottomPillar = appContainer.appendChild(document.createElement("div"));
    bottomPillar.className = "pillar pillar-bottom";

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
        const appContainerBounds = appContainer.getBoundingClientRect();
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

function changeDifficulty(event) {
    event.target.id == 'easy-difficulty' && setDifficulty('easy');
    event.target.id == 'medium-difficulty' && setDifficulty('medium');
    event.target.id == 'hard-difficulty' && setDifficulty('hard');
}

setDifficulty('easy');

addEventListener("keydown", event => {
    if (event.code == "Space") {
        !game_active && startGame();
        jump();
    } else if (stopped && event.code == "Enter") {
        reload();
    } else if (event.code == "KeyC") {
        toggleControls();
    }
});

addEventListener('click', e => {
    e.target.id == 'restart-btn' && reload();
    e.target.id == 'X-btn' && toggleControls();

    changeDifficulty(e);
})

addEventListener("touchstart", () => {
    !game_active && startGame();
    jump();
})

addEventListener('touchend', e => {
    e.preventDefault();
    e.target.id == 'restart-btn' && reload();
    e.target.id == 'X-btn' && toggleControls();
    changeDifficulty(e);
})