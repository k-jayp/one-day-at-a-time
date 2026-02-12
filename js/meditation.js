// ========== FULL-SCREEN MEDITATION ENGINE ==========

const MEDITATION_EXERCISES = {
    breathing: {
        name: 'Breathing Exercise',
        subtitle: '4-7-8 Technique',
        type: 'orb',
        cycles: 4,
        phases: [
            { name: 'inhale', label: 'Breathe in...', duration: 4000, orbClass: 'inhale' },
            { name: 'hold', label: 'Hold...', duration: 7000, orbClass: 'hold' },
            { name: 'exhale', label: 'Breathe out...', duration: 8000, orbClass: 'exhale' }
        ],
        completionMessage: 'I just completed a 4-7-8 breathing exercise. How should I be feeling?',
        audioFrequencies: [220, 330, 440]
    },
    grounding: {
        name: 'Grounding Exercise',
        subtitle: '5-4-3-2-1 Senses',
        type: 'senses',
        steps: [
            { sense: 'see', icon: '👁️', count: 5, prompt: 'things you can see' },
            { sense: 'touch', icon: '🤚', count: 4, prompt: 'things you can touch' },
            { sense: 'hear', icon: '👂', count: 3, prompt: 'things you can hear' },
            { sense: 'smell', icon: '👃', count: 2, prompt: 'things you can smell' },
            { sense: 'taste', icon: '👅', count: 1, prompt: 'thing you can taste' }
        ],
        completionMessage: 'I just completed a 5-4-3-2-1 grounding exercise. I feel more present now.',
        audioFrequencies: [261.63, 329.63, 392]
    },
    bodyscan: {
        name: 'Body Scan',
        subtitle: 'Head to Toe Relaxation',
        type: 'body',
        regions: [
            { id: 'head', label: 'Head & Face', instruction: 'Notice any tension in your forehead, jaw, or eyes... let it soften.' },
            { id: 'neck', label: 'Neck & Shoulders', instruction: 'Feel the weight in your shoulders... let them drop and release.' },
            { id: 'chest', label: 'Chest & Upper Back', instruction: 'Notice your breathing... feel your chest rise and fall naturally.' },
            { id: 'arms', label: 'Arms & Hands', instruction: 'Soften your arms... unclench your fists... let your fingers relax.' },
            { id: 'belly', label: 'Belly & Lower Back', instruction: 'Release any tightness in your core... let your belly be soft.' },
            { id: 'legs', label: 'Legs & Feet', instruction: 'Feel the ground beneath you... let your legs grow heavy and still.' }
        ],
        regionDuration: 9000,
        completionMessage: 'I just completed a body scan meditation. My body feels more relaxed.',
        audioFrequencies: [174.61, 261.63, 349.23]
    },
    urgesurf: {
        name: 'Urge Surfing',
        subtitle: 'Ride the Wave',
        type: 'wave',
        cycles: 3,
        cycleDuration: 15000,
        phases: [
            { label: 'Notice the urge...', sublabel: 'Where do you feel it in your body? Just observe.' },
            { label: 'Accept the wave...', sublabel: 'You don\'t have to fight it. Let it be.' },
            { label: 'Breathe through it...', sublabel: 'Each breath carries you over the crest.' },
            { label: 'It will pass...', sublabel: 'Like every wave, this urge will recede.' }
        ],
        completionMessage: 'I just practiced urge surfing. The craving feels more manageable now.',
        audioFrequencies: [196, 293.66, 392]
    }
};

// Web Audio ambient engine
let medAudioCtx = null;
let medOscillators = [];
let medGainNode = null;
let medMuted = false;

function initMeditationAudio(frequencies) {
    try {
        medAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        medGainNode = medAudioCtx.createGain();
        medGainNode.gain.setValueAtTime(0, medAudioCtx.currentTime);
        medGainNode.connect(medAudioCtx.destination);

        frequencies.forEach((freq, i) => {
            const osc = medAudioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, medAudioCtx.currentTime);
            const oscGain = medAudioCtx.createGain();
            oscGain.gain.setValueAtTime(0.06 - (i * 0.015), medAudioCtx.currentTime);
            osc.connect(oscGain);
            oscGain.connect(medGainNode);
            osc.start();
            medOscillators.push(osc);
        });

        medGainNode.gain.linearRampToValueAtTime(
            medMuted ? 0 : 1,
            medAudioCtx.currentTime + 2
        );
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

function stopMeditationAudio() {
    if (!medAudioCtx) return;
    try {
        medGainNode.gain.linearRampToValueAtTime(0, medAudioCtx.currentTime + 1.5);
        setTimeout(() => {
            medOscillators.forEach(osc => { try { osc.stop(); } catch(e){} });
            medOscillators = [];
            try { medAudioCtx.close(); } catch(e){}
            medAudioCtx = null;
        }, 1600);
    } catch(e) {
        medAudioCtx = null;
        medOscillators = [];
    }
}

function toggleMeditationMute() {
    medMuted = !medMuted;
    if (medGainNode && medAudioCtx) {
        medGainNode.gain.linearRampToValueAtTime(
            medMuted ? 0 : 1,
            medAudioCtx.currentTime + 0.3
        );
    }
    const muteBtn = document.querySelector('.med-mute-btn');
    if (muteBtn) muteBtn.textContent = medMuted ? '🔇' : '🔊';
}
window.toggleMeditationMute = toggleMeditationMute;

// Master open/close
let medTimer = null;
let medCleanup = null;
let medTimers = [];

function openMeditationOverlay(type) {
    const config = MEDITATION_EXERCISES[type];
    if (!config) return;

    const overlay = document.getElementById('meditationOverlay');
    medMuted = false;

    overlay.innerHTML = `
        <button class="med-close-btn" onclick="closeMeditationOverlay()" aria-label="Close exercise">✕</button>
        <button class="med-mute-btn" onclick="toggleMeditationMute()" aria-label="Toggle sound">🔊</button>
        <div class="med-phase-label">${config.name}</div>
        <div class="med-content" id="medContent"></div>
        <div class="med-instruction med-fade-in" id="medInstruction"></div>
        <div class="med-sub-instruction" id="medSubInstruction">${config.subtitle}</div>
        <div class="med-counter" id="medCounter"></div>
        <div class="med-progress"><div class="med-progress-fill" id="medProgressFill"></div></div>
    `;

    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('active'));
    });

    document.body.style.overflow = 'hidden';
    initMeditationAudio(config.audioFrequencies);

    // Escape key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') closeMeditationOverlay();
    };
    document.addEventListener('keydown', escHandler);
    const prevCleanup = medCleanup;
    medCleanup = () => {
        document.removeEventListener('keydown', escHandler);
        if (prevCleanup) prevCleanup();
    };

    switch (config.type) {
        case 'orb': renderBreathingExercise(config); break;
        case 'senses': renderGroundingExercise(config); break;
        case 'body': renderBodyScanExercise(config); break;
        case 'wave': renderUrgeSurfExercise(config); break;
    }
}
window.openMeditationOverlay = openMeditationOverlay;

function closeMeditationOverlay() {
    const overlay = document.getElementById('meditationOverlay');
    overlay.classList.remove('active');

    if (medCleanup) { medCleanup(); medCleanup = null; }
    medTimers.forEach(t => clearTimeout(t));
    medTimers = [];
    if (medTimer) { clearTimeout(medTimer); medTimer = null; }

    stopMeditationAudio();
    document.body.style.overflow = '';

    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, 800);
}
window.closeMeditationOverlay = closeMeditationOverlay;

function completeMeditationExercise(completionMessage) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');

    if (content) content.innerHTML = '<div class="med-complete-icon">🐾</div>';
    if (instruction) instruction.textContent = 'Well done';
    if (subInstruction) subInstruction.textContent = 'Take a moment before returning.';
    if (counter) counter.textContent = '';

    // Fill progress bar
    const fill = document.getElementById('medProgressFill');
    if (fill) fill.style.width = '100%';

    medTimer = setTimeout(() => {
        closeMeditationOverlay();
        if (completionMessage) {
            setTimeout(() => {
                document.getElementById('chatInput').value = completionMessage;
                sendChatMessage();
            }, 1000);
        }
    }, 3500);
}

// ---- BREATHING RENDERER ----
function renderBreathingExercise(config) {
    const content = document.getElementById('medContent');
    content.innerHTML = '<div class="breathing-ring"></div><div class="breathing-orb" id="breathingOrb"></div>';

    const orb = document.getElementById('breathingOrb');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    const phaseDurations = config.phases.reduce((sum, p) => sum + p.duration, 0);
    const totalDuration = config.cycles * phaseDurations;
    let elapsed = 0;
    let currentCycle = 0;
    let running = true;

    async function runCycle() {
        if (!running || currentCycle >= config.cycles) {
            if (running) completeMeditationExercise(config.completionMessage);
            return;
        }

        counter.textContent = `Cycle ${currentCycle + 1} of ${config.cycles}`;

        for (const phase of config.phases) {
            if (!running) return;

            orb.className = 'breathing-orb ' + phase.orbClass;
            instruction.textContent = phase.label;

            const seconds = phase.duration / 1000;
            for (let s = seconds; s > 0; s--) {
                if (!running) return;
                subInstruction.textContent = s.toString();
                await new Promise(resolve => {
                    const t = setTimeout(resolve, 1000);
                    medTimers.push(t);
                });
                elapsed += 1000;
                progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
            }
        }

        currentCycle++;
        runCycle();
    }

    const origCleanup = medCleanup;
    medCleanup = () => { running = false; if (origCleanup) origCleanup(); };
    runCycle();
}

// ---- GROUNDING RENDERER ----
function renderGroundingExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    let stepIndex = 0;
    let itemCount = 0;
    let running = true;
    const totalItems = config.steps.reduce((sum, s) => sum + s.count, 0);
    let completedItems = 0;

    function renderStep() {
        if (!running) return;
        if (stepIndex >= config.steps.length) {
            completeMeditationExercise(config.completionMessage);
            return;
        }

        const step = config.steps[stepIndex];
        itemCount = 0;

        let dotsHtml = '';
        for (let i = 0; i < step.count; i++) {
            dotsHtml += `<span class="grounding-dot" id="gDot${i}"></span>`;
        }

        // Build progress segments
        let segHtml = '';
        config.steps.forEach((s, i) => {
            const cls = i < stepIndex ? 'done' : i === stepIndex ? 'active' : '';
            segHtml += `<div class="grounding-segment ${cls}"></div>`;
        });

        content.innerHTML = `
            <div class="grounding-step med-fade-in">
                <div class="grounding-icon">${step.icon}</div>
                <div class="grounding-items">${dotsHtml}</div>
                <div class="grounding-tap-hint">Tap anywhere to count</div>
                <div class="grounding-progress">${segHtml}</div>
            </div>
        `;

        instruction.textContent = `Name ${step.count} ${step.prompt}`;
        subInstruction.textContent = '';
        counter.textContent = `${itemCount} of ${step.count}`;

        const overlay = document.getElementById('meditationOverlay');
        const tapHandler = (e) => {
            if (e.target.closest('.med-close-btn') || e.target.closest('.med-mute-btn')) return;

            if (itemCount < step.count) {
                const dot = document.getElementById('gDot' + itemCount);
                if (dot) dot.classList.add('filled');
                itemCount++;
                completedItems++;
                counter.textContent = `${itemCount} of ${step.count}`;
                progressFill.style.width = ((completedItems / totalItems) * 100) + '%';

                if (itemCount >= step.count) {
                    overlay.removeEventListener('click', tapHandler);
                    const t = setTimeout(() => {
                        stepIndex++;
                        renderStep();
                    }, 800);
                    medTimers.push(t);
                }
            }
        };

        overlay.addEventListener('click', tapHandler);
        const origCleanup = medCleanup;
        medCleanup = () => {
            running = false;
            overlay.removeEventListener('click', tapHandler);
            if (origCleanup) origCleanup();
        };
    }

    renderStep();
}

// ---- BODY SCAN RENDERER ----
function renderBodyScanExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    // Inline SVG human silhouette
    const bodySvg = `
    <svg class="bodyscan-figure" viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glowFilter">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <!-- Head -->
        <g id="bodyRegion-head" class="bodyscan-region">
            <ellipse cx="100" cy="42" rx="28" ry="32"/>
        </g>
        <!-- Neck & Shoulders -->
        <g id="bodyRegion-neck" class="bodyscan-region">
            <rect x="90" y="74" width="20" height="18" rx="4"/>
            <path d="M50 110 Q70 88 90 92 L110 92 Q130 88 150 110 L145 120 L55 120 Z"/>
        </g>
        <!-- Chest & Upper Back -->
        <g id="bodyRegion-chest" class="bodyscan-region">
            <path d="M55 120 L55 195 Q55 200 60 200 L140 200 Q145 200 145 195 L145 120 Z"/>
        </g>
        <!-- Arms & Hands -->
        <g id="bodyRegion-arms" class="bodyscan-region">
            <path d="M55 120 L32 185 L28 240 L38 242 L48 195 L55 165" />
            <path d="M145 120 L168 185 L172 240 L162 242 L152 195 L145 165"/>
            <ellipse cx="33" cy="248" rx="8" ry="10"/>
            <ellipse cx="167" cy="248" rx="8" ry="10"/>
        </g>
        <!-- Belly & Lower Back -->
        <g id="bodyRegion-belly" class="bodyscan-region">
            <path d="M60 200 L58 275 Q58 280 65 280 L135 280 Q142 280 142 275 L140 200 Z"/>
        </g>
        <!-- Legs & Feet -->
        <g id="bodyRegion-legs" class="bodyscan-region">
            <path d="M65 280 L60 390 L55 435 Q55 445 65 445 L80 445 Q85 445 85 435 L88 390 L95 280"/>
            <path d="M105 280 L112 390 L115 435 Q115 445 120 445 L140 445 Q145 445 145 435 L140 390 L135 280"/>
        </g>
    </svg>`;

    content.innerHTML = bodySvg;

    let regionIndex = 0;
    let running = true;
    const totalDuration = config.regions.length * config.regionDuration;
    let elapsed = 0;
    let tickInterval = null;

    function highlightRegion() {
        if (!running || regionIndex >= config.regions.length) {
            if (running) completeMeditationExercise(config.completionMessage);
            return;
        }

        const region = config.regions[regionIndex];

        document.querySelectorAll('.bodyscan-region').forEach(r => r.classList.remove('active'));
        const el = document.getElementById('bodyRegion-' + region.id);
        if (el) {
            el.classList.add('active');
            el.style.filter = 'url(#glowFilter)';
        }

        instruction.textContent = region.label;
        subInstruction.textContent = region.instruction;
        counter.textContent = `Region ${regionIndex + 1} of ${config.regions.length}`;

        let s = 0;
        const seconds = config.regionDuration / 1000;
        tickInterval = setInterval(() => {
            if (!running) { clearInterval(tickInterval); return; }
            s++;
            elapsed += 1000;
            progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
            if (s >= seconds) {
                clearInterval(tickInterval);
                // Remove glow from previous
                if (el) el.style.filter = '';
                regionIndex++;
                highlightRegion();
            }
        }, 1000);
    }

    const origCleanup = medCleanup;
    medCleanup = () => {
        running = false;
        if (tickInterval) clearInterval(tickInterval);
        if (origCleanup) origCleanup();
    };

    highlightRegion();
}

// ---- URGE SURFING RENDERER ----
function renderUrgeSurfExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    const canvas = document.createElement('canvas');
    canvas.className = 'wave-canvas';
    const canvasWidth = Math.min(window.innerWidth - 40, 700);
    canvas.width = canvasWidth;
    canvas.height = 220;
    content.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let running = true;
    let animFrame = null;
    const totalDuration = config.cycles * config.cycleDuration;
    const startTime = Date.now();

    function drawWave(progress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Wave height follows sine: rises, crests, falls
        const waveHeight = Math.sin(progress * Math.PI) * 130 + 20;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x++) {
            const nx = x / canvas.width;
            const y = canvas.height - waveHeight * Math.sin(nx * Math.PI)
                      - Math.sin(nx * 8 + progress * 6) * 6
                      - Math.sin(nx * 3 + progress * 4) * 4;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, canvas.height - waveHeight - 20, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(74, 124, 89, 0.6)');
        gradient.addColorStop(0.5, 'rgba(45, 90, 61, 0.4)');
        gradient.addColorStop(1, 'rgba(30, 77, 46, 0.15)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle white foam line at top of wave
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x++) {
            const nx = x / canvas.width;
            const y = canvas.height - waveHeight * Math.sin(nx * Math.PI)
                      - Math.sin(nx * 8 + progress * 6) * 6
                      - Math.sin(nx * 3 + progress * 4) * 4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function animate() {
        if (!running) return;

        const elapsed = Date.now() - startTime;
        const cycleProgress = (elapsed % config.cycleDuration) / config.cycleDuration;
        const currentCycle = Math.floor(elapsed / config.cycleDuration);

        if (currentCycle >= config.cycles) {
            completeMeditationExercise(config.completionMessage);
            return;
        }

        const phaseIndex = Math.min(
            Math.floor(cycleProgress * config.phases.length),
            config.phases.length - 1
        );
        instruction.textContent = config.phases[phaseIndex].label;
        subInstruction.textContent = config.phases[phaseIndex].sublabel;
        counter.textContent = `Wave ${currentCycle + 1} of ${config.cycles}`;
        progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';

        drawWave(cycleProgress);
        animFrame = requestAnimationFrame(animate);
    }

    const origCleanup = medCleanup;
    medCleanup = () => {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        if (origCleanup) origCleanup();
    };

    animate();
}

// Launch point — replaces old chat-based exercise
function startGuidedExercise(type) {
    openMeditationOverlay(type);
}
window.startGuidedExercise = startGuidedExercise;
