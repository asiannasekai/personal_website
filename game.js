class Game {
    constructor() {
        this.container = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Set up camera position
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0x00ff9d, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Create materials
        this.platformMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.8
        });

        // Initialize loaders
        this.loader = new THREE.GLTFLoader();
        this.mixer = null;
        this.animations = {};
        this.modelsLoaded = 0;
        this.totalModels = 2; // Player and enemy

        // Create environment
        this.createEnvironment();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Initialize game state
        this.keys = {};
        this.setupEventListeners();

        // Load models
        this.loadModels();
    }

    loadModels() {
        // Load player model
        this.loader.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedSimple/glTF/RiggedSimple.gltf',
            (gltf) => {
                this.player = gltf.scene;
                this.player.scale.set(0.5, 0.5, 0.5);
                this.player.position.set(0, 1, 0);
                this.scene.add(this.player);

                // Set up animations
                this.mixer = new THREE.AnimationMixer(this.player);
                this.animations = {
                    idle: this.mixer.clipAction(gltf.animations[0]),
                    walk: this.mixer.clipAction(gltf.animations[1])
                };
                this.animations.idle.play();

                this.modelsLoaded++;
                this.updateLoadingProgress();
            }
        );

        // Load enemy model
        this.loader.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedSimple/glTF/RiggedSimple.gltf',
            (gltf) => {
                this.enemy = gltf.scene;
                this.enemy.scale.set(0.5, 0.5, 0.5);
                this.enemy.position.set(5, 1, -5);
                this.enemy.rotation.y = Math.PI;
                this.scene.add(this.enemy);

                // Set up enemy animations
                const enemyMixer = new THREE.AnimationMixer(this.enemy);
                const enemyAnimations = {
                    idle: enemyMixer.clipAction(gltf.animations[0]),
                    walk: enemyMixer.clipAction(gltf.animations[1])
                };
                enemyAnimations.idle.play();

                this.modelsLoaded++;
                this.updateLoadingProgress();
            }
        );
    }

    updateLoadingProgress() {
        const progress = (this.modelsLoaded / this.totalModels) * 100;
        document.querySelector('.loading-progress').style.width = `${progress}%`;
        
        if (this.modelsLoaded === this.totalModels) {
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 500);
        }
    }

    createEnvironment() {
        // Create platforms
        this.platforms = [];
        const platformPositions = [
            { x: 0, y: 0, z: 0, width: 10, height: 0.5, depth: 10 },
            { x: -5, y: 3, z: -5, width: 6, height: 0.5, depth: 6 },
            { x: 5, y: 3, z: -5, width: 6, height: 0.5, depth: 6 },
            { x: -5, y: 6, z: -5, width: 6, height: 0.5, depth: 6 },
            { x: 5, y: 6, z: -5, width: 6, height: 0.5, depth: 6 }
        ];

        platformPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            const platform = new THREE.Mesh(geometry, this.platformMaterial);
            platform.position.set(pos.x, pos.y, pos.z);
            this.scene.add(platform);
            this.platforms.push(platform);
        });

        // Create ladders
        this.ladders = [];
        const ladderPositions = [
            { x: 0, y: 1.5, z: 0, height: 3 },
            { x: -5, y: 4.5, z: -5, height: 3 },
            { x: 5, y: 4.5, z: -5, height: 3 }
        ];

        ladderPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(0.5, pos.height, 0.5);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff9d,
                emissive: 0x00ff9d,
                emissiveIntensity: 1
            });
            const ladder = new THREE.Mesh(geometry, material);
            ladder.position.set(pos.x, pos.y, pos.z);
            this.scene.add(ladder);
            this.ladders.push(ladder);
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        if (this.mixer) {
            this.mixer.update(0.016); // Update animations
        }

        // Update player position based on keyboard input
        const speed = 0.1;
        let isMoving = false;

        if (this.keys['ArrowLeft']) {
            this.player.position.x -= speed;
            this.player.rotation.y = Math.PI / 2;
            isMoving = true;
        }
        if (this.keys['ArrowRight']) {
            this.player.position.x += speed;
            this.player.rotation.y = -Math.PI / 2;
            isMoving = true;
        }
        if (this.keys['ArrowUp']) {
            this.player.position.z -= speed;
            this.player.rotation.y = Math.PI;
            isMoving = true;
        }
        if (this.keys['ArrowDown']) {
            this.player.position.z += speed;
            this.player.rotation.y = 0;
            isMoving = true;
        }

        // Update animations
        if (this.animations) {
            if (isMoving) {
                this.animations.walk.play();
                this.animations.idle.stop();
            } else {
                this.animations.walk.stop();
                this.animations.idle.play();
            }
        }

        // Update controls
        this.controls.update();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    startGame() {
        this.animate();
    }
}

// Initialize the game
const game = new Game(); 