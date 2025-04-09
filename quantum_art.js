class QuantumArt {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'quantum-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.currentArt = null;
        this.artPieces = [];
        this.currentIndex = 0;
        this.animationFrame = null;
        this.time = 0;
    }

    async loadArt() {
        try {
            const response = await fetch('quantum_art.json');
            this.artPieces = await response.json();
            this.currentArt = this.artPieces[0];
            this.setupCanvas();
            this.startAnimation();
        } catch (error) {
            console.error('Error loading quantum art:', error);
        }
    }

    setupCanvas() {
        this.canvas.width = this.currentArt.width;
        this.canvas.height = this.currentArt.height;
        document.body.appendChild(this.canvas);
    }

    drawArt() {
        const pixels = this.currentArt.pixels;
        const width = this.currentArt.width;
        const height = this.currentArt.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw pixels with quantum effects
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Add some quantum uncertainty to the position
                const offsetX = Math.sin(this.time + x * 0.1) * 2;
                const offsetY = Math.cos(this.time + y * 0.1) * 2;
                
                const newX = (x + offsetX + width) % width;
                const newY = (y + offsetY + height) % height;
                
                this.ctx.fillStyle = pixels[Math.floor(newY)][Math.floor(newX)];
                this.ctx.fillRect(x, y, 1, 1);
            }
        }

        // Add quantum interference pattern
        this.ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 3; i++) {
            const phase = this.time * 0.1 + i * Math.PI / 3;
            this.ctx.fillStyle = `rgba(0, 255, 255, 0.1)`;
            this.ctx.beginPath();
            this.ctx.arc(
                width/2 + Math.sin(phase) * 50,
                height/2 + Math.cos(phase) * 50,
                100 + Math.sin(this.time) * 20,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }

    animate() {
        this.time += 0.05;
        this.drawArt();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (!this.animationFrame) {
            this.animate();
        }
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    changeArt() {
        this.currentIndex = (this.currentIndex + 1) % this.artPieces.length;
        this.currentArt = this.artPieces[this.currentIndex];
    }
}

// Initialize quantum art
const quantumArt = new QuantumArt();
quantumArt.loadArt();

// Add event listener for art change
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        quantumArt.changeArt();
    }
}); 