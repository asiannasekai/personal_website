class VirtualBeeb {
    constructor() {
        this.modals = {
            games: document.getElementById('games-modal'),
            display: document.getElementById('display-modal'),
            keys: document.getElementById('keys-modal'),
            about: document.getElementById('about-modal')
        };

        this.statusItems = {
            cassettemotor: document.querySelector('.status-item:nth-child(1) .value'),
            capslock: document.querySelector('.status-item:nth-child(2) .value'),
            shiftlock: document.querySelector('.status-item:nth-child(3) .value'),
            drive0: document.querySelector('.status-item:nth-child(4) .value'),
            drive1: document.querySelector('.status-item:nth-child(5) .value'),
            virtualMHz: document.querySelector('.status-item:nth-child(6) .value')
        };

        this.emulator = null;
        this.currentGame = null;
        this.keyboardLayout = this.createKeyboardLayout();
        this.philosophicalQuestions = [
            "who are you?",
            "who am i?",
            "do you know who you are?",
            "do you even know who you are"
        ];

        // Create trippy terminal experience
        this.createTrippyTerminal();
    }

    createKeyboardLayout() {
        return [
            ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'COPY'],
            ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', 'RETURN'],
            ['CTRL', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '@', '#', '\\'],
            ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
            ['SPACE']
        ];
    }

    initializeEmulator() {
        const emulatorScreen = document.getElementById('emulator-screen');
        this.emulator = new jsbeeb({
            canvas: emulatorScreen,
            defaultModel: 0, // BBC Model B
            roms: {
                os: 'roms/bbc/os12.rom',
                basic: 'roms/bbc/basic2.rom'
            }
        });

        // Set up keyboard mapping
        this.emulator.keyboard.setKeyMap({
            'F0': 0x7F, // BREAK
            'F1': 0x80, // COPY
            'F2': 0x81, // DELETE
            'F3': 0x82, // LEFT
            'F4': 0x83, // RIGHT
            'F5': 0x84, // DOWN
            'F6': 0x85, // UP
            'F7': 0x86, // ESCAPE
            'F8': 0x87, // TAB
            'F9': 0x88  // RETURN
        });
    }

    setupEventListeners() {
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showModal(section);
            });
        });

        // Game items
        document.querySelectorAll('.game-item').forEach(item => {
            item.addEventListener('click', () => {
                const game = item.dataset.game;
                this.loadGame(game);
            });
        });

        // Local file loading
        document.querySelector('.load-local').addEventListener('click', () => {
            document.getElementById('game-file').click();
        });

        document.getElementById('game-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadLocalGame(file);
            }
        });

        // Display options
        document.querySelectorAll('.display-options input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateDisplayOption(checkbox.id, checkbox.checked);
            });
        });

        // Function keys
        document.querySelectorAll('.function-keys .key').forEach(key => {
            key.addEventListener('click', () => {
                this.handleFunctionKey(key.dataset.key);
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    initializeScreen() {
        const screenContent = document.querySelector('.screen-content');
        screenContent.innerHTML = `
            <div class="loading-message">Loading VirtualBeeb...</div>
            <div class="welcome-message" style="display: none;">
                <p>BBC Micro Computer</p>
                <p>BASIC</p>
                <p>>_</p>
            </div>
        `;

        // Simulate loading
        setTimeout(() => {
            document.querySelector('.loading-message').style.display = 'none';
            document.querySelector('.welcome-message').style.display = 'block';
            this.emulator.start();
        }, 2000);
    }

    showModal(section) {
        const modal = this.modals[section];
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async loadGame(gameName) {
        const screenContent = document.querySelector('.screen-content');
        screenContent.innerHTML = `
            <div class="loading-message">Loading ${gameName}...</div>
        `;

        try {
            const response = await fetch(`games/${gameName}.ssd`);
            const arrayBuffer = await response.arrayBuffer();
            this.emulator.loadDisc(0, new Uint8Array(arrayBuffer));
            this.emulator.reset();
            this.currentGame = gameName;
            this.updateStatus('drive0', 'on');
        } catch (error) {
            console.error('Error loading game:', error);
            screenContent.innerHTML += '\nError loading game. Please try again.';
        }

        this.hideModal('games-modal');
    }

    async loadLocalGame(file) {
        const screenContent = document.querySelector('.screen-content');
        screenContent.innerHTML = `
            <div class="loading-message">Loading ${file.name}...</div>
        `;

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.emulator.loadDisc(0, new Uint8Array(arrayBuffer));
            this.emulator.reset();
            this.currentGame = file.name;
            this.updateStatus('drive0', 'on');
        } catch (error) {
            console.error('Error loading local game:', error);
            screenContent.innerHTML += '\nError loading game. Please try again.';
        }

        this.hideModal('games-modal');
    }

    updateDisplayOption(option, enabled) {
        const body = document.body;
        switch(option) {
            case 'dark-mode':
                body.classList.toggle('dark-mode', enabled);
                break;
            case 'green-screen':
                document.querySelector('.screen').classList.toggle('green-screen', enabled);
                break;
            case 'fullscreen':
                if (enabled) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
            case 'shadows':
                this.emulator.setShadows(enabled);
                break;
            case 'monitor-focus':
                this.emulator.setMonitorFocus(enabled);
                break;
            case 'unpredictable':
                this.emulator.setUnpredictable(enabled);
                break;
        }
    }

    handleFunctionKey(key) {
        this.emulator.keyboard.pressKey(key);
    }

    handleKeyPress(event) {
        const key = event.key.toUpperCase();
        if (this.emulator.keyboard.isMapped(key)) {
            this.emulator.keyboard.pressKey(key);
        }
    }

    updateStatus(item, value) {
        if (this.statusItems[item]) {
            this.statusItems[item].textContent = value;
        }
    }

    createTrippyTerminal() {
        const terminalContainer = document.createElement('div');
        terminalContainer.className = 'trippy-terminal';
        document.body.appendChild(terminalContainer);

        // Create screen content
        const screenContent = document.createElement('div');
        screenContent.className = 'screen-content';
        terminalContainer.appendChild(screenContent);

        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '_';
        screenContent.appendChild(cursor);

        // Create green mask
        const greenMask = document.createElement('div');
        greenMask.className = 'green-mask';
        terminalContainer.appendChild(greenMask);

        // Create quantum art container
        const quantumContainer = document.createElement('div');
        quantumContainer.className = 'quantum-container';
        terminalContainer.appendChild(quantumContainer);

        // Create audio elements
        const typingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
        const dropSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        typingSound.volume = 0.3;
        dropSound.volume = 0.5;

        // Type out questions
        let currentQuestionIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let baseTypingDelay = 50;
        let baseDeleteDelay = 25;
        let questionDelay = 3000;
        let speedMultiplier = 1;

        const typeQuestion = () => {
            const currentQuestion = this.philosophicalQuestions[currentQuestionIndex];
            const currentText = currentQuestion.substring(0, currentCharIndex);

            if (currentQuestionIndex === 0) {
                speedMultiplier = 1 + (Math.floor(currentQuestionIndex / this.philosophicalQuestions.length) * 0.2);
            }

            const currentTypingDelay = baseTypingDelay / speedMultiplier;
            const currentDeleteDelay = baseDeleteDelay / speedMultiplier;

            if (!isDeleting && currentCharIndex <= currentQuestion.length) {
                screenContent.innerHTML = currentText + '<span class="cursor">_</span>';
                // Play typing sound
                typingSound.currentTime = 0;
                typingSound.play();
                currentCharIndex++;
                setTimeout(typeQuestion, currentTypingDelay);
            } else if (isDeleting && currentCharIndex >= 0) {
                screenContent.innerHTML = currentText + '<span class="cursor">_</span>';
                currentCharIndex--;
                setTimeout(typeQuestion, currentDeleteDelay);
            } else if (!isDeleting) {
                isDeleting = true;
                setTimeout(typeQuestion, questionDelay);
            } else {
                isDeleting = false;
                currentQuestionIndex = (currentQuestionIndex + 1) % this.philosophicalQuestions.length;
                
                // Start quantum art after third question
                if (currentQuestionIndex === 3) {
                    setTimeout(() => {
                        screenContent.style.opacity = '0';
                        greenMask.style.opacity = '0';
                        quantumContainer.classList.add('visible');
                        // Play drop sound when transitioning to quantum art
                        dropSound.play();
                        this.createQuantumArt(quantumContainer);
                    }, 1000);
                }
                
                setTimeout(typeQuestion, currentTypingDelay);
            }
        };

        // Start typing animation
        typeQuestion();

        // Add scanlines effect
        const scanlines = document.createElement('div');
        scanlines.className = 'scanlines';
        terminalContainer.appendChild(scanlines);
    }

    createQuantumArt(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'quantum-canvas';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Set pixel size for retro look - smaller for more detail
        const pixelSize = 2;
        const gridWidth = Math.ceil(canvas.width / pixelSize);
        const gridHeight = Math.ceil(canvas.height / pixelSize);

        // Create grid of pixels
        const grid = Array(gridHeight).fill().map(() => 
            Array(gridWidth).fill().map(() => ({
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                speed: Math.random() * 0.05 + 0.02, // Increased speed for faster movement
                size: Math.random() * 2 + 1
            }))
        );

        // Initialize positions
        grid.forEach((row, y) => {
            row.forEach((pixel, x) => {
                pixel.x = x * pixelSize;
                pixel.y = y * pixelSize;
                pixel.targetX = x * pixelSize;
                pixel.targetY = y * pixelSize;
            });
        });

        let time = 0;
        let phase = 0;
        let lorenzPoints = [];
        let transitionProgress = 0;
        let currentFace = 0;
        const faces = [
            {
                name: 'Queen Elizabeth',
                points: [
                    // Crown
                    {x: 0.5, y: 0.2, size: 3, color: 'gold'},
                    {x: 0.5, y: 0.25, size: 3, color: 'gold'},
                    {x: 0.5, y: 0.3, size: 3, color: 'gold'},
                    {x: 0.45, y: 0.25, size: 2, color: 'gold'},
                    {x: 0.55, y: 0.25, size: 2, color: 'gold'},
                    // Face outline
                    {x: 0.5, y: 0.4, size: 4, color: 'white'},
                    {x: 0.5, y: 0.5, size: 4, color: 'white'},
                    {x: 0.5, y: 0.6, size: 4, color: 'white'},
                    {x: 0.4, y: 0.5, size: 3, color: 'white'},
                    {x: 0.6, y: 0.5, size: 3, color: 'white'},
                    // Eyes
                    {x: 0.45, y: 0.45, size: 2, color: 'blue'},
                    {x: 0.55, y: 0.45, size: 2, color: 'blue'},
                    // Nose
                    {x: 0.5, y: 0.5, size: 2, color: 'pink'},
                    // Mouth
                    {x: 0.5, y: 0.55, size: 2, color: 'red'},
                    // Hair
                    {x: 0.5, y: 0.35, size: 4, color: 'gray'},
                    {x: 0.4, y: 0.35, size: 3, color: 'gray'},
                    {x: 0.6, y: 0.35, size: 3, color: 'gray'}
                ]
            },
            {
                name: 'Mona Lisa',
                points: [
                    // Hair
                    {x: 0.5, y: 0.3, size: 4, color: 'brown'},
                    {x: 0.4, y: 0.3, size: 3, color: 'brown'},
                    {x: 0.6, y: 0.3, size: 3, color: 'brown'},
                    {x: 0.5, y: 0.25, size: 3, color: 'brown'},
                    // Face
                    {x: 0.5, y: 0.4, size: 4, color: 'white'},
                    {x: 0.5, y: 0.5, size: 4, color: 'white'},
                    {x: 0.4, y: 0.45, size: 3, color: 'white'},
                    {x: 0.6, y: 0.45, size: 3, color: 'white'},
                    // Eyes
                    {x: 0.45, y: 0.45, size: 2, color: 'brown'},
                    {x: 0.55, y: 0.45, size: 2, color: 'brown'},
                    // Smile
                    {x: 0.5, y: 0.55, size: 2, color: 'red'},
                    {x: 0.45, y: 0.53, size: 1, color: 'red'},
                    {x: 0.55, y: 0.53, size: 1, color: 'red'}
                ]
            }
        ];

        const lorenzParams = {
            sigma: 10,
            rho: 28,
            beta: 8/3
        };

        // Dictionary text
        const dictionaryText = [
            "operative",
            "adjective",
            "1. functioning or having effect",
            "2. of or relating to operations",
            "3. ready for use",
            "",
            "unknown",
            "adjective",
            "1. not known or familiar",
            "2. not identified",
            "3. not understood",
            "",
            "is your operative unknown?"
        ];

        const animate = () => {
            // Clear with slight fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (phase === 0) {
                // Initial converging patterns with faster rotation
                grid.forEach((row, y) => {
                    row.forEach((pixel, x) => {
                        const centerX = canvas.width / 2;
                        const centerY = canvas.height / 2;
                        const angle = Math.atan2(pixel.y - centerY, pixel.x - centerX);
                        const radius = Math.sqrt(Math.pow(pixel.x - centerX, 2) + Math.pow(pixel.y - centerY, 2));
                        
                        // Increased speed for faster movement
                        const descentSpeed = 0.95; // Faster descent
                        const rotationSpeed = 2.5; // Faster rotation
                        pixel.targetX = centerX + Math.cos(angle + time * rotationSpeed) * radius * descentSpeed;
                        pixel.targetY = centerY + Math.sin(angle + time * rotationSpeed) * radius * descentSpeed;
                        
                        pixel.x += (pixel.targetX - pixel.x) * pixel.speed * 2; // Doubled movement speed
                        pixel.y += (pixel.targetY - pixel.y) * pixel.speed * 2;
                        
                        ctx.fillStyle = pixel.color;
                        ctx.fillRect(
                            Math.floor(pixel.x / pixelSize) * pixelSize,
                            Math.floor(pixel.y / pixelSize) * pixelSize,
                            pixelSize,
                            pixelSize
                        );
                    });
                });

                if (time > 2) { // Reduced from 3 to 2 seconds
                    phase = 1;
                    time = 0;
                    transitionProgress = 0;
                }
            } else if (phase === 1) {
                // Transition to face with firework effect
                transitionProgress += 0.1; // Doubled transition speed
                
                // Draw fading pixels with faster movement
                if (transitionProgress < 1) {
                    grid.forEach((row, y) => {
                        row.forEach((pixel, x) => {
                            const centerX = canvas.width / 2;
                            const centerY = canvas.height / 2;
                            const angle = Math.atan2(pixel.y - centerY, pixel.x - centerX);
                            const radius = Math.sqrt(Math.pow(pixel.x - centerX, 2) + Math.pow(pixel.y - centerY, 2));
                            
                            // Faster explosion effect
                            const explosionSpeed = 0.2;
                            pixel.x += (Math.random() - 0.5) * explosionSpeed * radius;
                            pixel.y += (Math.random() - 0.5) * explosionSpeed * radius;
                            
                            ctx.fillStyle = `rgba(${this.hexToRgb(pixel.color)}, ${1 - transitionProgress})`;
                            ctx.fillRect(
                                Math.floor(pixel.x / pixelSize) * pixelSize,
                                Math.floor(pixel.y / pixelSize) * pixelSize,
                                pixelSize,
                                pixelSize
                            );
                        });
                    });
                }
                
                // Draw face with faster firework effect
                const face = faces[currentFace];
                face.points.forEach(point => {
                    const x = point.x * canvas.width;
                    const y = point.y * canvas.height;
                    const size = point.size * pixelSize;
                    
                    const fireworkProgress = Math.min(1, transitionProgress * 3); // Faster firework effect
                    const offsetX = (Math.random() - 0.5) * 100 * (1 - fireworkProgress);
                    const offsetY = (Math.random() - 0.5) * 100 * (1 - fireworkProgress);
                    
                    ctx.fillStyle = `rgba(${this.hexToRgb(point.color)}, ${Math.min(1, transitionProgress)})`;
                    ctx.fillRect(
                        x - size/2 + offsetX,
                        y - size/2 + offsetY,
                        size,
                        size
                    );
                });

                if (time > 2) { // Reduced from 3 to 2 seconds
                    if (currentFace < faces.length - 1) {
                        currentFace++;
                        time = 0;
                        transitionProgress = 0;
                    } else {
                        phase = 2;
                        time = 0;
                        transitionProgress = 0;
                        lorenzPoints = [];
                    }
                }
            } else if (phase === 2) {
                // Transition from face to Lorenz with faster melting effect
                transitionProgress += 0.06; // Doubled transition speed
                
                // Draw melting face with faster effect
                const face = faces[currentFace];
                face.points.forEach(point => {
                    const x = point.x * canvas.width;
                    const y = point.y * canvas.height;
                    const size = point.size * pixelSize;
                    
                    const meltProgress = Math.min(1, transitionProgress * 3); // Faster melting
                    const meltOffset = Math.sin(time * 4) * 20 * meltProgress; // Faster oscillation
                    const meltSize = size * (1 - meltProgress * 0.5);
                    
                    ctx.fillStyle = `rgba(${this.hexToRgb(point.color)}, ${1 - transitionProgress})`;
                    ctx.fillRect(
                        x - meltSize/2,
                        y - meltSize/2 + meltOffset,
                        meltSize,
                        meltSize * 2
                    );
                });
                
                // Generate and draw Lorenz points faster
                const dt = 0.02; // Doubled time step
                let x = 1, y = 1, z = 1;
                
                for (let i = 0; i < 200; i++) { // More points for faster appearance
                    const dx = lorenzParams.sigma * (y - x);
                    const dy = x * (lorenzParams.rho - z) - y;
                    const dz = x * y - lorenzParams.beta * z;
                    
                    x += dx * dt;
                    y += dy * dt;
                    z += dz * dt;
                    
                    lorenzPoints.push({
                        x: x * 10 + canvas.width/2,
                        y: y * 10 + canvas.height/2,
                        z: z
                    });
                }

                // Draw Lorenz points with faster fade-in
                lorenzPoints.forEach((point, i) => {
                    const size = Math.min(4, Math.max(1, point.z / 10));
                    ctx.fillStyle = `hsla(${(i + time * 20) % 360}, 100%, 50%, ${Math.min(1, transitionProgress)})`; // Faster color change
                    ctx.fillRect(point.x, point.y, size, size);
                });

                if (time > 4) { // Reduced from 7 to 4 seconds
                    phase = 3;
                    time = 0;
                    transitionProgress = 0;
                }
            } else if (phase === 3) {
                // Transition from Lorenz to dictionary text
                transitionProgress += 0.1; // Doubled transition speed
                
                // Draw fading Lorenz points faster
                if (transitionProgress < 1) {
                    lorenzPoints.forEach((point, i) => {
                        const size = Math.min(4, Math.max(1, point.z / 10));
                        ctx.fillStyle = `hsla(${(i + time * 20) % 360}, 100%, 50%, ${1 - transitionProgress})`;
                        ctx.fillRect(point.x, point.y, size, size);
                    });
                }
                
                // Draw dictionary text with faster fade-in
                ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(1, transitionProgress)})`;
                ctx.font = '20px monospace';
                const lineHeight = 25;
                dictionaryText.forEach((line, i) => {
                    const y = 50 + i * lineHeight;
                    ctx.fillText(line, 50, y);
                });

                if (time > 3) { // Reduced from 5 to 3 seconds
                    phase = 4;
                    time = 0;
                    transitionProgress = 0;
                }
            } else if (phase === 4) {
                // Final question with faster glitch effect
                const glitchText = "is your operative unknown?";
                const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = "30px monospace";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                
                for (let i = 0; i < glitchText.length; i++) {
                    if (Math.random() < 0.2) { // Increased glitch frequency
                        const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                        ctx.fillText(glitchChar, canvas.width/2 - 150 + i * 20, canvas.height/2);
                    } else {
                        ctx.fillText(glitchText[i], canvas.width/2 - 150 + i * 20, canvas.height/2);
                    }
                }

                if (time > 3) { // Reduced from 5 to 3 seconds
                    phase = 5;
                    time = 0;
                    transitionProgress = 0;
                    typingSound.play();
                }
            } else if (phase === 5) {
                // Philosophical dialogue phase with faster typing
                transitionProgress += 0.04; // Doubled transition speed
                
                // Fade out previous content faster
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.1, transitionProgress)})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw dialogue with faster typing effect
                const dialogue = [
                    "wait, does that make sense?",
                    "do you mean...",
                    "who is the operative, that is unknown?",
                    "or...",
                    "is the reason you are operating, unknown?"
                ];
                
                ctx.font = "24px monospace";
                ctx.fillStyle = "white";
                ctx.textAlign = "left";
                
                const lineHeight = 40;
                const startY = canvas.height/2 - (dialogue.length * lineHeight)/2;
                
                dialogue.forEach((line, index) => {
                    const charsToShow = Math.floor(line.length * Math.min(1, (time - index) * 1)); // Doubled typing speed
                    const visibleText = line.substring(0, charsToShow);
                    
                    const offsetX = Math.sin(time * 4 + index) * 5; // Faster movement
                    
                    ctx.fillText(
                        visibleText,
                        canvas.width/4 + offsetX,
                        startY + index * lineHeight
                    );
                    
                    if (charsToShow > 0 && charsToShow < line.length) {
                        if (!typingSound.playing) {
                            typingSound.play();
                        }
                    }
                });
                
                if (time > dialogue.length) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.beginPath();
                    ctx.moveTo(canvas.width/4, startY + 2 * lineHeight);
                    ctx.lineTo(canvas.width/4, startY + 4 * lineHeight);
                    ctx.stroke();
                    
                    for (let i = 0; i < 3; i++) {
                        const x = canvas.width/2 + Math.sin(time * 2 + i) * 50; // Faster movement
                        const y = canvas.height/2 + Math.cos(time * 2 + i) * 50;
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 2 + i) * 0.2})`;
                        ctx.fillText("?", x, y);
                    }
                }

                if (time > dialogue.length + 3) { // Reduced from 5 to 3 seconds
                    phase = 0;
                    time = 0;
                    transitionProgress = 0;
                    grid = this.createPixelGrid();
                }
            }

            time += 0.05; // Doubled overall animation speed
            requestAnimationFrame(animate);
        };

        // Helper function to convert hex to rgb
        this.hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
                '0, 0, 0';
        };

        animate();
    }

    addTerminalEffects(container) {
        // Add scanlines
        const scanlines = document.createElement('div');
        scanlines.className = 'scanlines';
        container.appendChild(scanlines);

        // Add glitch effect
        const glitch = document.createElement('div');
        glitch.className = 'glitch';
        container.appendChild(glitch);

        // Add particles
        this.createBackgroundParticles(container);

        // Add rainbow effect
        const rainbow = document.createElement('div');
        rainbow.className = 'rainbow-effect';
        container.appendChild(rainbow);
    }

    createBackgroundParticles(container) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'trippy-particle';
            particle.style.setProperty('--x', `${Math.random() * 100}%`);
            particle.style.setProperty('--y', `${Math.random() * 100}%`);
            particle.style.setProperty('--size', `${Math.random() * 3 + 1}px`);
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            container.appendChild(particle);
        }
    }
}

// Initialize the virtual machine
const virtualBeeb = new VirtualBeeb(); 