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

        // Set pixel size for retro look
        const pixelSize = 4;
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
                speed: Math.random() * 0.02 + 0.01
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
        let patternIndex = 0;
        const patterns = [
            // Spiral pattern
            (x, y, t) => {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const angle = Math.atan2(y - centerY, x - centerX);
                const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                return {
                    x: centerX + Math.cos(angle + t) * radius,
                    y: centerY + Math.sin(angle + t) * radius
                };
            },
            // Wave pattern
            (x, y, t) => ({
                x: x + Math.sin(y * 0.01 + t) * 20,
                y: y + Math.cos(x * 0.01 + t) * 20
            }),
            // Checkerboard pattern
            (x, y, t) => {
                const size = 100;
                const phase = Math.sin(t) * Math.PI;
                return {
                    x: x + Math.sin((x / size + y / size) * Math.PI + phase) * 30,
                    y: y + Math.cos((x / size - y / size) * Math.PI + phase) * 30
                };
            },
            // Concentric circles
            (x, y, t) => {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const angle = Math.atan2(dy, dx);
                const distance = Math.sqrt(dx * dx + dy * dy);
                return {
                    x: centerX + Math.cos(angle + t) * distance,
                    y: centerY + Math.sin(angle + t) * distance
                };
            }
        ];

        const animate = () => {
            // Clear with slight fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw pixels
            grid.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    // Update target position based on current pattern
                    const target = patterns[patternIndex](pixel.x, pixel.y, time);
                    pixel.targetX = target.x;
                    pixel.targetY = target.y;

                    // Move pixel towards target
                    pixel.x += (pixel.targetX - pixel.x) * pixel.speed;
                    pixel.y += (pixel.targetY - pixel.y) * pixel.speed;

                    // Draw pixel
                    ctx.fillStyle = pixel.color;
                    ctx.fillRect(
                        Math.floor(pixel.x / pixelSize) * pixelSize,
                        Math.floor(pixel.y / pixelSize) * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                });
            });

            time += 0.01;

            // Change pattern every 10 seconds
            if (Math.floor(time / 10) > patternIndex) {
                patternIndex = (patternIndex + 1) % patterns.length;
            }

            requestAnimationFrame(animate);
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