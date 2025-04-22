// Let's make a fun little math game!
let isPlaying = false; // Track if game is running
let score = 0; // Player's score
let timeremaining; // Time left in seconds
let correct_answer; // The right answer for current question
let difficulty_level = localStorage.getItem('difficulty') || 'easy'; // Default to easy mode
let high_score = localStorage.getItem('highScore') || 0; // Grab high score from localStorage
let username = ''; // Store player's name
let countdown_action; // For the timer interval

// Grab DOM elements once so I don’t keep querying them
const startResetBtn = document.getElementById("startreset");
const scoreDisplay = document.getElementById("scorevalue");
const timeDisplay = document.getElementById("timeremainingvalue");
const questionDisplay = document.getElementById("question");
const gameOverScreen = document.getElementById("gameOver");

// Set up difficulty buttons
document.getElementById("easy").addEventListener("click", () => setDifficulty('easy'));
document.getElementById("medium").addEventListener("click", () => setDifficulty('medium'));
document.getElementById("hard").addEventListener("click", () => setDifficulty('hard'));

// Start/Reset button logic
startResetBtn.addEventListener("click", () => {
    console.log("Start/Reset button clicked!"); // Debug to confirm click works
    username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Hey, you gotta enter a username to play!");
        return;
    }

    if (isPlaying) {
        // Just reload the page to reset everything - quick and dirty
        location.reload();
    } else {
        // Kick off a new game
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        showElement("timeremaining");
        timeremaining = 60; // Start with 60 seconds
        timeDisplay.textContent = timeremaining;
        hideElement("gameOver");
        startResetBtn.textContent = "Reset Game";
        startCountdown();
        generateQuestion();
    }
});

// Set up answer boxes - loop through each one
for (let i = 1; i <= 4; i++) {
    const box = document.getElementById("box" + i);
    box.addEventListener("click", () => {
        if (!isPlaying) return; // Ignore clicks if game isn't running

        if (box.textContent == correct_answer) {
            // Nailed it!
            score++;
            scoreDisplay.textContent = score;
            hideElement("wrong");
            showElement("correct");
            document.getElementById("correct").classList.add("show");
            setTimeout(() => {
                document.getElementById("correct").classList.remove("show");
            }, 1000);
            generateQuestion();
        } else {
            // Oops, wrong answer
            hideElement("correct");
            showElement("wrong");
            document.getElementById("wrong").classList.add("show");
            setTimeout(() => {
                document.getElementById("wrong").classList.remove("show");
            }, 1000);
        }
    });
}

// Countdown timer logic
function startCountdown() {
    countdown_action = setInterval(() => {
        timeremaining--;
        timeDisplay.textContent = timeremaining;
        if (timeremaining <= 0) {
            stopCountdown();
            showElement("gameOver");
            gameOverScreen.innerHTML = `<p>Game Over!</p><p>Your score: ${score}</p>`;
            hideElement("timeremaining");
            hideElement("correct");
            hideElement("wrong");
            isPlaying = false;
            startResetBtn.textContent = "Start Game";
            checkHighScore();
            displayLeaderboard();
        }
    }, 1000);
}

function stopCountdown() {
    clearInterval(countdown_action);
}

function hideElement(elementId) {
    document.getElementById(elementId).style.display = "none";
}

function showElement(elementId) {
    document.getElementById(elementId).style.display = "block";
}

function setDifficulty(level) {
    difficulty_level = level;
    localStorage.setItem('difficulty', level); // Save for next time
    alert(`Difficulty switched to ${level.charAt(0).toUpperCase() + level.slice(1)}!`);
}

function checkHighScore() {
    if (score > high_score) {
        high_score = score;
        localStorage.setItem('highScore', high_score);
        gameOverScreen.innerHTML += `<p>New High Score: ${high_score}!</p>`;
    }
    saveScore(username, score);
}

function saveScore(username, score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ username, score });
    scores.sort((a, b) => b.score - a.score); // Sort descending
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 10))); // Keep top 10
}

function displayLeaderboard() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = ''; // Clear it out first
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.username}: ${entry.score}`;
        scoreList.appendChild(li);
    });
}

function generateQuestion() {
    // Set range based on difficulty
    let range;
    if (difficulty_level === 'easy') {
        range = 12;
    } else if (difficulty_level === 'medium') {
        range = 15;
    } else {
        range = 25;
    }

    // Generate two random numbers and the correct answer
    const x = 1 + Math.round((range - 1) * Math.random());
    const y = 1 + Math.round((range - 1) * Math.random());
    correct_answer = x * y;
    questionDisplay.textContent = `${x} x ${y}`;

    // Randomly place the correct answer in one of the boxes
    const correctPosition = 1 + Math.round(3 * Math.random());
    document.getElementById("box" + correctPosition).textContent = correct_answer;

    // Fill the other boxes with wrong answers
    const answers = [correct_answer];
    for (let i = 1; i <= 4; i++) {
        if (i !== correctPosition) {
            let wrongAnswer;
            do {
                wrongAnswer = (1 + Math.round((range - 1) * Math.random())) * 
                             (1 + Math.round((range - 1) * Math.random()));
            } while (answers.includes(wrongAnswer));
            document.getElementById("box" + i).textContent = wrongAnswer;
            answers.push(wrongAnswer);
        }
    }
}

// Pre-fill username if we have it from last time
window.addEventListener("load", () => {
    const lastUsername = localStorage.getItem('lastUsername');
    if (lastUsername) {
        document.getElementById("username").value = lastUsername;
    }
});
