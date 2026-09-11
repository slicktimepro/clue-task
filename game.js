let currentGuess = { worker: '', tool: '', action: '', status: '' };
let SECRET_SOLUTION = { worker: '', tool: '', action: '', status: '' };

const optionsPool = {
    worker: ["Sweeper", "Mopper", "Cleaner", "Firefighter"],
    tool: ["Broom", "Mop", "Wand", "Fire Station"],
    action: ["Clean the floor", "Clean the window", "Cast a spell", "Fight fire"],
    status: ["It works!", "It is fixed!", "Good solution.", "Bad solution."]
};

// --- Tone.js Audio Engine Setup ---
let synth, cymbal;
let audioInitialized = false;

async function initAudio() {
    if (!audioInitialized) {
        await Tone.start();
        synth = new Tone.Synth().toDestination();
        cymbal = new Tone.MembraneSynth().toDestination();
        audioInitialized = true;
    }
}

function playWinSound() {
    if(!audioInitialized) return;
    const now = Tone.now();
    synth.triggerAttackRelease("C4", "8n", now);
    synth.triggerAttackRelease("E4", "8n", now + 0.2);
    synth.triggerAttackRelease("G4", "8n", now + 0.4);
    synth.triggerAttackRelease("C5", "2n", now + 0.6);
}

function playIncorrectSound() {
    if(!audioInitialized) return;
    cymbal.triggerAttackRelease("G2", "8n");
}

window.onload = function() {
    randomizeSecretSolution();
};

function randomizeSecretSolution() {
    SECRET_SOLUTION.worker = optionsPool.worker[Math.floor(Math.random() * 4)];
    SECRET_SOLUTION.tool = optionsPool.tool[Math.floor(Math.random() * 4)];
    SECRET_SOLUTION.action = optionsPool.action[Math.floor(Math.random() * 4)];
    SECRET_SOLUTION.status = optionsPool.status[Math.floor(Math.random() * 4)];
    console.log("🔒 New Random Solution Locked In:", SECRET_SOLUTION);
}

function resetGameBoard() {
    currentGuess = { worker: '', tool: '', action: '', status: '' };
    
    const cards = document.getElementsByClassName('card');
    for (let card of cards) {
        card.classList.remove('selected-blue', 'selected-orange');
    }
    
    updateDisplay();
    document.getElementById('feedback-box').style.display = "none";
    randomizeSecretSolution();
}

function selectCard(category, value, element) {
    initAudio(); // Initialize audio context on first click
    const parent = element.parentElement;
    const buttons = parent.getElementsByClassName('card');
    for (let btn of buttons) {
        btn.classList.remove('selected-blue', 'selected-orange');
    }

    currentGuess[category] = value;
    if (category === 'status') {
        element.classList.add('selected-orange');
    } else {
        element.classList.add('selected-blue');
    }

    updateDisplay();
}

function updateDisplay() {
    const w = currentGuess.worker ? currentGuess.worker.toLowerCase() : '_____';
    const t = currentGuess.tool ? currentGuess.tool.toLowerCase() : '_____';
    const a = currentGuess.action ? currentGuess.action.toLowerCase() : '_____';
    const s = currentGuess.status || '_____';
    
    document.getElementById('sentence-display').innerHTML = `A <u>${w}</u> uses a <u>${t}</u> to <u>${a}</u>. <u>${s}</u>`;
}

// Rewritten with Tone.js
document.getElementById('go-btn-start').addEventListener('click', async () => {
    await initAudio();
    const now = Tone.now();
    
    // Rhythmic countdown ticks
    synth.triggerAttackRelease("C5", "16n", now);
    synth.triggerAttackRelease("C5", "16n", now + 1.0);
    synth.triggerAttackRelease("C5", "16n", now + 2.0);
    synth.triggerAttackRelease("G5", "4n", now + 3.0); // Final chime

    setTimeout(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("Time to stop. Time to stop. Time to stop.");
            utterance.lang = 'en-US';
            utterance.rate = 1.0; 
            window.speechSynthesis.speak(utterance);
        }
    }, 3000);
});

function testSystem() {
    initAudio();
    const box = document.getElementById('feedback-box');
    
    if (!currentGuess.worker || !currentGuess.tool || !currentGuess.action || !currentGuess.status) {
        box.style.display = "block";
        box.style.backgroundColor = "#FFF3CD";
        box.style.color = "#856404";
        box.style.border = "2px solid #FFEEBA";
        box.innerHTML = "⚠️ Please choose ONE card from every column!";
        return;
    }

    let score = 0;
    if (currentGuess.worker === SECRET_SOLUTION.worker) score++;
    if (currentGuess.tool === SECRET_SOLUTION.tool) score++;
    if (currentGuess.action === SECRET_SOLUTION.action) score++;
    if (currentGuess.status === SECRET_SOLUTION.status) score++;

    const compiledSentence = `A ${currentGuess.worker.toLowerCase()} uses a ${currentGuess.tool.toLowerCase()} to ${currentGuess.action.toLowerCase()}. ${currentGuess.status}`;
    
    box.style.display = "block";
    if (score === 4) {
        box.style.backgroundColor = "#D4EDDA";
        box.style.color = "#155724";
        box.style.border = "2px solid #C3E6CB";
        box.innerHTML = `🎉 WINNER! "It works! It is fixed!" You found the secret Solution!`;
        addLogEntry(compiledSentence, score, true);
        playWinSound();
    } else {
        box.style.backgroundColor = "#F8D7DA";
        box.style.color = "#721C24";
        box.style.border = "2px solid #F5C6CB";
        box.innerHTML = `❌ Not right! You have ${score} cards right. Try another solution!`;
        addLogEntry(compiledSentence, score, false);
        playIncorrectSound();
    }
}

function addLogEntry(text, correct, isWin) {
    const list = document.getElementById('log-list');
    const item = document.createElement('div');
    item.className = 'log-item';
    item.style.borderLeft = isWin ? '6px solid #28A745' : '6px solid #DC3545';
    
    item.innerHTML = `
        <span>🗣️ ${text}</span>
        <span class="badge">${correct} / 4 Cards Right</span>
    `;
    list.insertBefore(item, list.firstChild);
}