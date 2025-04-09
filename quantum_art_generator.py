import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import json
import random
from scipy import signal

def generate_quantum_wavefunction(size=512):
    # Generate a complex wavefunction
    x = np.linspace(-10, 10, size)
    y = np.linspace(-10, 10, size)
    X, Y = np.meshgrid(x, y)
    
    # Random quantum parameters
    k = random.uniform(0.5, 2.0)  # wave number
    w = random.uniform(0.5, 2.0)  # angular frequency
    phase = random.uniform(0, 2*np.pi)
    
    # Create wavefunction
    psi = np.exp(1j * (k*X + w*Y + phase))
    
    # Add some quantum uncertainty
    uncertainty = np.random.normal(0, 0.1, (size, size))
    psi *= np.exp(1j * uncertainty)
    
    return psi

def create_quantum_art():
    # Generate wavefunction
    psi = generate_quantum_wavefunction()
    
    # Calculate probability density
    density = np.abs(psi)**2
    
    # Create custom colormap
    colors = ['#000000', '#00ff00', '#00ffff', '#ff00ff', '#ffff00']
    cmap = LinearSegmentedColormap.from_list('quantum', colors)
    
    # Apply some quantum effects
    density = signal.convolve2d(density, np.ones((3,3))/9, mode='same')
    density = np.log1p(density)  # Enhance contrast
    
    # Normalize
    density = (density - density.min()) / (density.max() - density.min())
    
    # Convert to RGB
    rgb = cmap(density)
    
    # Convert to hex colors
    height, width = density.shape
    pixels = []
    for y in range(height):
        row = []
        for x in range(width):
            r, g, b, _ = rgb[y, x]
            hex_color = f'#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}'
            row.append(hex_color)
        pixels.append(row)
    
    return {
        'pixels': pixels,
        'width': width,
        'height': height
    }

if __name__ == '__main__':
    # Generate multiple art pieces
    art_pieces = []
    for _ in range(5):  # Generate 5 different pieces
        art = create_quantum_art()
        art_pieces.append(art)
    
    # Save to JSON
    with open('quantum_art.json', 'w') as f:
        json.dump(art_pieces, f) 