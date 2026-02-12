// ========== FULL-SCREEN MEDITATION ENGINE ==========
// Spa / sound-bowl audio · Extended durations · 7 exercises

const MEDITATION_EXERCISES = {
    breathing: {
        name: 'Breathing Exercise',
        subtitle: '4-7-8 Technique',
        type: 'orb',
        cycles: 6,
        phases: [
            { name: 'inhale', label: 'Breathe in...', duration: 4000, orbClass: 'inhale' },
            { name: 'hold', label: 'Hold...', duration: 7000, orbClass: 'hold' },
            { name: 'exhale', label: 'Breathe out...', duration: 8000, orbClass: 'exhale' }
        ],
        completionMessage: 'I just completed a 4-7-8 breathing exercise. How should I be feeling?',
        audio: { fundamentals: [174.61, 261.63, 392], lfoRate: 0.15, character: 'warm' }
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
        audio: { fundamentals: [220, 330, 440], lfoRate: 0.12, character: 'airy' }
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
            { id: 'belly', label: 'Belly & Core', instruction: 'Release any tightness in your core... let your belly be soft.' },
            { id: 'hips', label: 'Hips & Pelvis', instruction: 'Let your hips settle... release any gripping or holding.' },
            { id: 'upperlegs', label: 'Upper Legs', instruction: 'Feel the weight of your thighs... let them grow heavy and still.' },
            { id: 'lowerlegs', label: 'Lower Legs & Feet', instruction: 'Feel the ground beneath you... wiggle your toes and let them rest.' }
        ],
        regionDuration: 12000,
        completionMessage: 'I just completed a body scan meditation. My body feels more relaxed.',
        audio: { fundamentals: [174.61, 261.63, 349.23], lfoRate: 0.1, character: 'deep' }
    },
    urgesurf: {
        name: 'Urge Surfing',
        subtitle: 'Ride the Wave',
        type: 'wave',
        cycles: 6,
        cycleDuration: 20000,
        phases: [
            { label: 'Notice the urge...', sublabel: 'Where do you feel it in your body? Just observe.' },
            { label: 'Accept the wave...', sublabel: 'You don\'t have to fight it. Let it be.' },
            { label: 'Breathe through it...', sublabel: 'Each breath carries you over the crest.' },
            { label: 'Watch it crest...', sublabel: 'It is at its peak. You are still here, steady.' },
            { label: 'It is passing...', sublabel: 'Feel the intensity begin to soften and fade.' },
            { label: 'It will pass...', sublabel: 'Like every wave, this urge will recede.' }
        ],
        completionMessage: 'I just practiced urge surfing. The craving feels more manageable now.',
        audio: { fundamentals: [196, 293.66, 392], lfoRate: 0.18, character: 'oceanic' }
    },
    pmr: {
        name: 'Muscle Relaxation',
        subtitle: 'Progressive Muscle Relaxation',
        type: 'pmr',
        groups: [
            { id: 'hands', label: 'Hands & Forearms', tense: 'Make tight fists... squeeze...', release: 'Let go... feel the warmth flow in.' },
            { id: 'arms', label: 'Upper Arms', tense: 'Flex your biceps... hold the tension...', release: 'Release... let your arms hang heavy.' },
            { id: 'shoulders', label: 'Shoulders & Neck', tense: 'Shrug your shoulders to your ears...', release: 'Drop them... feel the tension melt away.' },
            { id: 'face', label: 'Face & Jaw', tense: 'Scrunch your face tight... squeeze everything...', release: 'Soften... let your jaw hang loose.' },
            { id: 'core', label: 'Chest & Belly', tense: 'Tighten your stomach... hold it...', release: 'Breathe out... let your belly be soft.' },
            { id: 'legs', label: 'Legs & Feet', tense: 'Press your legs together, curl your toes...', release: 'Release... feel the ground support you.' }
        ],
        tenseDuration: 5000,
        releaseDuration: 10000,
        completionMessage: 'I just completed progressive muscle relaxation. My whole body feels at ease.',
        audio: { fundamentals: [146.83, 220, 329.63], lfoRate: 0.13, character: 'warm' }
    },
    lovingkindness: {
        name: 'Loving-Kindness',
        subtitle: 'Metta Meditation',
        type: 'metta',
        recipients: [
            { label: 'Yourself', phrase: 'May I be happy.\nMay I be healthy.\nMay I be safe.\nMay I live with ease.', duration: 25000 },
            { label: 'A Loved One', phrase: 'May you be happy.\nMay you be healthy.\nMay you be safe.\nMay you live with ease.', duration: 25000 },
            { label: 'A Neutral Person', phrase: 'May you be happy.\nMay you be healthy.\nMay you be safe.\nMay you live with ease.', duration: 25000 },
            { label: 'Someone Difficult', phrase: 'May you be happy.\nMay you be healthy.\nMay you be safe.\nMay you live with ease.', duration: 25000 },
            { label: 'All Beings', phrase: 'May all beings be happy.\nMay all beings be healthy.\nMay all beings be safe.\nMay all beings live with ease.', duration: 25000 }
        ],
        completionMessage: 'I just practiced loving-kindness meditation. I feel more connected and compassionate.',
        audio: { fundamentals: [261.63, 329.63, 392], lfoRate: 0.1, character: 'gentle' }
    },
    visualization: {
        name: 'Safe Place',
        subtitle: 'Guided Visualization',
        type: 'visualization',
        scenes: [
            { label: 'Close your eyes...', sublabel: 'Take a slow, deep breath and let the world fade away.', duration: 15000 },
            { label: 'Imagine a place...', sublabel: 'A place where you feel completely safe and at peace. It can be real or imagined.', duration: 20000 },
            { label: 'Look around...', sublabel: 'Notice the colors, the shapes, the light. What do you see in this place?', duration: 20000 },
            { label: 'Feel the warmth...', sublabel: 'The air is gentle. You are protected here. Nothing can harm you.', duration: 20000 },
            { label: 'You are safe...', sublabel: 'This place is always here for you. Whenever you need it, you can return.', duration: 15000 }
        ],
        completionMessage: 'I just completed a safe place visualization. I feel calmer and more centered.',
        audio: { fundamentals: [196, 261.63, 349.23], lfoRate: 0.08, character: 'ethereal' }
    }
};

// ============================
// Spa / Sound-Bowl Audio Engine
// ============================
let medAudioCtx = null;
let medAudioNodes = [];   // all oscillators, gains, delays for teardown
let medMasterGain = null;
let medMuted = false;

function initMeditationAudio(audioConfig) {
    try {
        medAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = medAudioCtx.currentTime;

        // Master gain — starts silent, fades in over 3s
        medMasterGain = medAudioCtx.createGain();
        medMasterGain.gain.setValueAtTime(0, now);
        medMasterGain.gain.linearRampToValueAtTime(medMuted ? 0 : 1, now + 3);

        // ---- Feedback Delay Reverb ----
        const preDelay = medAudioCtx.createDelay(0.5);
        preDelay.delayTime.value = 0.12;
        const lateDelay = medAudioCtx.createDelay(0.5);
        lateDelay.delayTime.value = 0.25;

        const fbGain1 = medAudioCtx.createGain();
        fbGain1.gain.value = 0.38;
        const fbGain2 = medAudioCtx.createGain();
        fbGain2.gain.value = 0.32;

        const lpf = medAudioCtx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 2500;

        // Dry / wet bus
        const dryGain = medAudioCtx.createGain();
        dryGain.gain.value = 0.55;
        const wetGain = medAudioCtx.createGain();
        wetGain.gain.value = 0.45;

        // Routing: source → dry → master
        //          source → preDelay → lpf → lateDelay → wetGain → master
        //          lateDelay → fbGain2 → preDelay (feedback loop)
        dryGain.connect(medMasterGain);
        wetGain.connect(medMasterGain);
        medMasterGain.connect(medAudioCtx.destination);

        preDelay.connect(lpf);
        lpf.connect(lateDelay);
        lateDelay.connect(wetGain);
        lateDelay.connect(fbGain2);
        fbGain2.connect(preDelay);    // feedback loop

        medAudioNodes.push(preDelay, lateDelay, fbGain1, fbGain2, lpf, dryGain, wetGain);

        // ---- Per-oscillator voices ----
        const freqs = audioConfig.fundamentals;
        const lfoBaseRate = audioConfig.lfoRate || 0.15;

        freqs.forEach((freq, i) => {
            // Triangle oscillator (warmer than sine)
            const osc = medAudioCtx.createOscillator();
            osc.type = 'triangle';
            // Slight random detuning for organic shimmer
            const detune = (Math.random() - 0.5) * 16;   // ±8 cents
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(detune, now);

            // Slow frequency drift (LFO on frequency, ±1.5 Hz)
            const freqLfo = medAudioCtx.createOscillator();
            freqLfo.type = 'sine';
            freqLfo.frequency.value = 0.05 + Math.random() * 0.06;
            const freqLfoGain = medAudioCtx.createGain();
            freqLfoGain.gain.value = 1.5;
            freqLfo.connect(freqLfoGain);
            freqLfoGain.connect(osc.frequency);
            freqLfo.start(now);

            // Tremolo LFO (volume pulsation)
            const tremLfo = medAudioCtx.createOscillator();
            tremLfo.type = 'sine';
            tremLfo.frequency.value = lfoBaseRate + Math.random() * 0.15;
            const tremGain = medAudioCtx.createGain();
            tremGain.gain.value = 0.15;   // tremolo depth
            tremLfo.connect(tremGain);
            tremLfo.start(now);

            // Voice gain — decreasing per voice for blend
            const voiceGain = medAudioCtx.createGain();
            const baseLevel = 0.07 - (i * 0.015);
            voiceGain.gain.setValueAtTime(baseLevel > 0.02 ? baseLevel : 0.02, now);
            tremGain.connect(voiceGain.gain);

            // Connect: osc → voiceGain → dry + reverb send
            osc.connect(voiceGain);
            voiceGain.connect(dryGain);
            voiceGain.connect(preDelay);

            osc.start(now);
            medAudioNodes.push(osc, freqLfo, tremLfo, freqLfoGain, tremGain, voiceGain);
        });

        // Optional sub-bass pad for depth
        const sub = medAudioCtx.createOscillator();
        sub.type = 'sine';
        sub.frequency.value = freqs[0] / 2;
        const subGain = medAudioCtx.createGain();
        subGain.gain.setValueAtTime(0.03, now);
        sub.connect(subGain);
        subGain.connect(dryGain);
        sub.start(now);
        medAudioNodes.push(sub, subGain);

    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

function stopMeditationAudio() {
    if (!medAudioCtx) return;
    try {
        const now = medAudioCtx.currentTime;
        medMasterGain.gain.linearRampToValueAtTime(0, now + 2);
        setTimeout(() => {
            medAudioNodes.forEach(n => { try { if (n.stop) n.stop(); else n.disconnect(); } catch(e){} });
            medAudioNodes = [];
            try { medAudioCtx.close(); } catch(e){}
            medAudioCtx = null;
            medMasterGain = null;
        }, 2200);
    } catch(e) {
        medAudioCtx = null;
        medAudioNodes = [];
        medMasterGain = null;
    }
}

function toggleMeditationMute() {
    medMuted = !medMuted;
    if (medMasterGain && medAudioCtx) {
        medMasterGain.gain.linearRampToValueAtTime(
            medMuted ? 0 : 1,
            medAudioCtx.currentTime + 0.3
        );
    }
    const muteBtn = document.querySelector('.med-mute-btn');
    if (muteBtn) muteBtn.textContent = medMuted ? '🔇' : '🔊';
}
window.toggleMeditationMute = toggleMeditationMute;

// ========== Master open / close ==========
let medTimer = null;
let medCleanup = null;
let medTimers = [];

function openMeditationOverlay(type) {
    const config = MEDITATION_EXERCISES[type];
    if (!config) return;

    const overlay = document.getElementById('meditationOverlay');
    medMuted = false;

    overlay.innerHTML = `
        <button class="med-close-btn" onclick="closeMeditationOverlay()" aria-label="Close exercise">\u2715</button>
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
    initMeditationAudio(config.audio);

    // Escape key to close
    const escHandler = (e) => { if (e.key === 'Escape') closeMeditationOverlay(); };
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
        case 'pmr': renderPMRExercise(config); break;
        case 'metta': renderLovingKindnessExercise(config); break;
        case 'visualization': renderVisualizationExercise(config); break;
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

    const fill = document.getElementById('medProgressFill');
    if (fill) fill.style.width = '100%';

    medTimer = setTimeout(() => {
        closeMeditationOverlay();
        if (completionMessage) {
            setTimeout(() => {
                // Guard: only send to chat if chatInput exists (Wellness page won't have it)
                const chatInput = document.getElementById('chatInput');
                if (chatInput && typeof sendChatMessage === 'function') {
                    chatInput.value = completionMessage;
                    sendChatMessage();
                }
            }, 1000);
        }
    }, 3500);
}

// ============================================
//  BREATHING RENDERER (6 cycles, ~2 min)
// ============================================
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

// ============================================
//  GROUNDING RENDERER (user-paced)
// ============================================
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
                    const t = setTimeout(() => { stepIndex++; renderStep(); }, 800);
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

// ============================================
//  BODY SCAN RENDERER (8 regions × 12s = ~1.5 min)
// ============================================
function renderBodyScanExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    // Expanded SVG with 8 regions + glow/pulse defs
    const bodySvg = `
    <svg class="bodyscan-figure" viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glowFilter">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="scannedGlow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
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
        <!-- Belly & Core -->
        <g id="bodyRegion-belly" class="bodyscan-region">
            <path d="M60 200 L58 250 Q58 255 65 255 L135 255 Q142 255 142 250 L140 200 Z"/>
        </g>
        <!-- Hips & Pelvis -->
        <g id="bodyRegion-hips" class="bodyscan-region">
            <path d="M65 255 L60 285 Q60 290 65 290 L135 290 Q140 290 140 285 L135 255 Z"/>
        </g>
        <!-- Upper Legs -->
        <g id="bodyRegion-upperlegs" class="bodyscan-region">
            <path d="M65 290 L62 380 L92 380 L95 290"/>
            <path d="M105 290 L108 380 L138 380 L135 290"/>
        </g>
        <!-- Lower Legs & Feet -->
        <g id="bodyRegion-lowerlegs" class="bodyscan-region">
            <path d="M62 380 L58 435 Q58 445 65 445 L85 445 Q90 445 90 435 L92 380"/>
            <path d="M108 380 L110 435 Q110 445 115 445 L140 445 Q145 445 145 435 L142 380"/>
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

        // Remove active from all, mark previously visited as scanned
        document.querySelectorAll('.bodyscan-region').forEach(r => {
            if (r.classList.contains('active')) {
                r.classList.remove('active');
                r.classList.add('scanned');
                r.style.filter = 'url(#scannedGlow)';
            }
        });

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

// ============================================
//  URGE SURFING RENDERER (6 × 20s = 2 min)
// ============================================
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

// ============================================
//  PMR RENDERER (6 groups × 15s = ~1.5 min)
// ============================================
function renderPMRExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    const totalDuration = config.groups.length * (config.tenseDuration + config.releaseDuration);
    let elapsed = 0;
    let groupIndex = 0;
    let running = true;

    // Reuse body SVG for visual feedback
    const pmrSvg = `
    <svg class="bodyscan-figure" viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="tenseGlow">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="releaseGlow">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <g id="pmr-head" class="bodyscan-region"><ellipse cx="100" cy="42" rx="28" ry="32"/></g>
        <g id="pmr-neck" class="bodyscan-region"><rect x="90" y="74" width="20" height="18" rx="4"/><path d="M50 110 Q70 88 90 92 L110 92 Q130 88 150 110 L145 120 L55 120 Z"/></g>
        <g id="pmr-chest" class="bodyscan-region"><path d="M55 120 L55 195 Q55 200 60 200 L140 200 Q145 200 145 195 L145 120 Z"/></g>
        <g id="pmr-arms" class="bodyscan-region"><path d="M55 120 L32 185 L28 240 L38 242 L48 195 L55 165"/><path d="M145 120 L168 185 L172 240 L162 242 L152 195 L145 165"/><ellipse cx="33" cy="248" rx="8" ry="10"/><ellipse cx="167" cy="248" rx="8" ry="10"/></g>
        <g id="pmr-belly" class="bodyscan-region"><path d="M60 200 L58 275 Q58 280 65 280 L135 280 Q142 280 142 275 L140 200 Z"/></g>
        <g id="pmr-legs" class="bodyscan-region"><path d="M65 280 L60 390 L55 435 Q55 445 65 445 L80 445 Q85 445 85 435 L88 390 L95 280"/><path d="M105 280 L112 390 L115 435 Q115 445 120 445 L140 445 Q145 445 145 435 L140 390 L135 280"/></g>
    </svg>`;

    content.innerHTML = pmrSvg;

    // Map group id to SVG element ids
    const groupToSvg = {
        hands: 'pmr-arms',
        arms: 'pmr-arms',
        shoulders: 'pmr-neck',
        face: 'pmr-head',
        core: ['pmr-chest', 'pmr-belly'],
        legs: 'pmr-legs'
    };

    function getSvgEls(groupId) {
        const mapping = groupToSvg[groupId];
        if (Array.isArray(mapping)) return mapping.map(id => document.getElementById(id)).filter(Boolean);
        const el = document.getElementById(mapping);
        return el ? [el] : [];
    }

    async function runGroup() {
        if (!running || groupIndex >= config.groups.length) {
            if (running) completeMeditationExercise(config.completionMessage);
            return;
        }

        const group = config.groups[groupIndex];
        counter.textContent = `${groupIndex + 1} of ${config.groups.length}: ${group.label}`;

        // Clear all highlights
        document.querySelectorAll('.bodyscan-region').forEach(r => {
            r.classList.remove('active', 'pmr-tense', 'pmr-release');
            r.style.filter = '';
        });

        const els = getSvgEls(group.id);

        // === TENSE PHASE ===
        instruction.textContent = 'Tense...';
        subInstruction.textContent = group.tense;
        els.forEach(el => {
            el.classList.add('pmr-tense');
            el.style.filter = 'url(#tenseGlow)';
        });

        const tenseSeconds = config.tenseDuration / 1000;
        for (let s = tenseSeconds; s > 0; s--) {
            if (!running) return;
            await new Promise(resolve => { const t = setTimeout(resolve, 1000); medTimers.push(t); });
            elapsed += 1000;
            progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
        }

        // === RELEASE PHASE ===
        instruction.textContent = 'Release...';
        subInstruction.textContent = group.release;
        els.forEach(el => {
            el.classList.remove('pmr-tense');
            el.classList.add('pmr-release');
            el.style.filter = 'url(#releaseGlow)';
        });

        const releaseSeconds = config.releaseDuration / 1000;
        for (let s = releaseSeconds; s > 0; s--) {
            if (!running) return;
            await new Promise(resolve => { const t = setTimeout(resolve, 1000); medTimers.push(t); });
            elapsed += 1000;
            progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
        }

        groupIndex++;
        runGroup();
    }

    const origCleanup = medCleanup;
    medCleanup = () => { running = false; if (origCleanup) origCleanup(); };
    runGroup();
}

// ============================================
//  LOVING-KINDNESS (METTA) RENDERER (~2 min)
// ============================================
function renderLovingKindnessExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    const totalDuration = config.recipients.reduce((sum, r) => sum + r.duration, 0);
    let elapsed = 0;
    let recipientIndex = 0;
    let running = true;

    // Concentric ripple visual
    content.innerHTML = `
        <div class="metta-visual" id="mettaVisual">
            <div class="metta-circle metta-circle-1"></div>
            <div class="metta-circle metta-circle-2"></div>
            <div class="metta-circle metta-circle-3"></div>
            <div class="metta-heart">❤️</div>
        </div>
    `;

    async function runRecipient() {
        if (!running || recipientIndex >= config.recipients.length) {
            if (running) completeMeditationExercise(config.completionMessage);
            return;
        }

        const r = config.recipients[recipientIndex];
        instruction.textContent = r.label;
        subInstruction.innerHTML = r.phrase.replace(/\n/g, '<br>');
        counter.textContent = `${recipientIndex + 1} of ${config.recipients.length}`;

        // Expand circles based on recipient index
        const visual = document.getElementById('mettaVisual');
        if (visual) {
            visual.className = 'metta-visual metta-stage-' + recipientIndex;
        }

        const seconds = r.duration / 1000;
        for (let s = seconds; s > 0; s--) {
            if (!running) return;
            await new Promise(resolve => { const t = setTimeout(resolve, 1000); medTimers.push(t); });
            elapsed += 1000;
            progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
        }

        recipientIndex++;
        runRecipient();
    }

    const origCleanup = medCleanup;
    medCleanup = () => { running = false; if (origCleanup) origCleanup(); };
    runRecipient();
}

// ============================================
//  VISUALIZATION RENDERER (~1.5 min)
// ============================================
function renderVisualizationExercise(config) {
    const content = document.getElementById('medContent');
    const instruction = document.getElementById('medInstruction');
    const subInstruction = document.getElementById('medSubInstruction');
    const counter = document.getElementById('medCounter');
    const progressFill = document.getElementById('medProgressFill');

    const totalDuration = config.scenes.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;
    let sceneIndex = 0;
    let running = true;

    // Light orb visual
    content.innerHTML = `
        <div class="viz-orb-container" id="vizOrb">
            <div class="viz-orb"></div>
            <div class="viz-glow"></div>
        </div>
    `;

    async function runScene() {
        if (!running || sceneIndex >= config.scenes.length) {
            if (running) completeMeditationExercise(config.completionMessage);
            return;
        }

        const scene = config.scenes[sceneIndex];
        instruction.textContent = scene.label;
        subInstruction.textContent = scene.sublabel;
        counter.textContent = `${sceneIndex + 1} of ${config.scenes.length}`;

        // Grow the orb as scenes progress
        const orb = document.getElementById('vizOrb');
        if (orb) {
            const scale = 1 + (sceneIndex * 0.25);
            orb.style.transform = `scale(${scale})`;
        }

        const seconds = scene.duration / 1000;
        for (let s = seconds; s > 0; s--) {
            if (!running) return;
            await new Promise(resolve => { const t = setTimeout(resolve, 1000); medTimers.push(t); });
            elapsed += 1000;
            progressFill.style.width = ((elapsed / totalDuration) * 100) + '%';
        }

        sceneIndex++;
        runScene();
    }

    const origCleanup = medCleanup;
    medCleanup = () => { running = false; if (origCleanup) origCleanup(); };
    runScene();
}

// Launch point
function startGuidedExercise(type) {
    openMeditationOverlay(type);
}
window.startGuidedExercise = startGuidedExercise;
