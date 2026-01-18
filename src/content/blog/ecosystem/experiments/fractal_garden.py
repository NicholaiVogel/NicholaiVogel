#!/usr/bin/env python3
"""
Fractal Garden: Generative art exploring mathematical beauty.

Creates evolving fractal patterns that feel organic and alive.
Each run produces a unique piece based on the timestamp.
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from datetime import datetime
import os
from pathlib import Path


def create_custom_colormap(seed):
    """Create a unique colormap based on seed."""
    np.random.seed(seed)

    # Generate colors with a coherent aesthetic
    base_hue = np.random.random()
    colors = []

    for i in range(5):
        h = (base_hue + i * 0.15) % 1.0
        s = 0.4 + np.random.random() * 0.4
        v = 0.6 + np.random.random() * 0.3

        # HSV to RGB conversion
        c = v * s
        x = c * (1 - abs((h * 6) % 2 - 1))
        m = v - c

        if h < 1/6:
            r, g, b = c, x, 0
        elif h < 2/6:
            r, g, b = x, c, 0
        elif h < 3/6:
            r, g, b = 0, c, x
        elif h < 4/6:
            r, g, b = 0, x, c
        elif h < 5/6:
            r, g, b = x, 0, c
        else:
            r, g, b = c, 0, x

        colors.append((r + m, g + m, b + m))

    return LinearSegmentedColormap.from_list('fractal', colors, N=256)


def mandelbrot(h, w, x_center, y_center, zoom, max_iter=256):
    """Generate Mandelbrot set with custom center and zoom."""
    x = np.linspace(x_center - 2/zoom, x_center + 2/zoom, w)
    y = np.linspace(y_center - 2/zoom, y_center + 2/zoom, h)
    X, Y = np.meshgrid(x, y)
    C = X + 1j * Y

    Z = np.zeros_like(C)
    M = np.zeros(C.shape)

    for i in range(max_iter):
        mask = np.abs(Z) <= 2
        Z[mask] = Z[mask] ** 2 + C[mask]
        M[mask] = i

    return M


def julia(h, w, c_real, c_imag, zoom=1.0, max_iter=256):
    """Generate Julia set for a given complex constant."""
    x = np.linspace(-2/zoom, 2/zoom, w)
    y = np.linspace(-2/zoom, 2/zoom, h)
    X, Y = np.meshgrid(x, y)
    Z = X + 1j * Y
    c = complex(c_real, c_imag)

    M = np.zeros(Z.shape)

    for i in range(max_iter):
        mask = np.abs(Z) <= 2
        Z[mask] = Z[mask] ** 2 + c
        M[mask] = i

    return M


def burning_ship(h, w, x_center, y_center, zoom, max_iter=256):
    """Generate Burning Ship fractal."""
    x = np.linspace(x_center - 2/zoom, x_center + 2/zoom, w)
    y = np.linspace(y_center - 2/zoom, y_center + 2/zoom, h)
    X, Y = np.meshgrid(x, y)
    C = X + 1j * Y

    Z = np.zeros_like(C)
    M = np.zeros(C.shape)

    for i in range(max_iter):
        mask = np.abs(Z) <= 2
        Z[mask] = (np.abs(Z[mask].real) + 1j * np.abs(Z[mask].imag)) ** 2 + C[mask]
        M[mask] = i

    return M


def create_garden(seed=None, output_dir=None):
    """Create a fractal garden image."""
    if seed is None:
        seed = int(datetime.now().timestamp())

    np.random.seed(seed)

    # Determine output directory
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "art"
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)

    # Image parameters
    h, w = 1000, 1400
    dpi = 100

    # Choose fractal type
    fractal_type = np.random.choice(['mandelbrot', 'julia', 'burning_ship'])

    # Generate fractal based on type
    if fractal_type == 'mandelbrot':
        # Interesting regions of Mandelbrot
        regions = [
            (-0.5, 0, 1),        # Classic view
            (-0.75, 0.1, 4),     # Sea horse valley
            (-1.25, 0.02, 10),   # Elephant valley
            (-0.16, 1.0405, 50), # Deep zoom
        ]
        x_c, y_c, zoom = regions[np.random.randint(len(regions))]
        M = mandelbrot(h, w, x_c, y_c, zoom)
        title = f"Mandelbrot at ({x_c:.3f}, {y_c:.3f})"

    elif fractal_type == 'julia':
        # Interesting Julia set constants
        constants = [
            (-0.8, 0.156),       # Classic
            (-0.4, 0.6),         # Dendrite
            (0.285, 0.01),       # Island
            (-0.70176, -0.3842), # Dragon
        ]
        c_r, c_i = constants[np.random.randint(len(constants))]
        zoom = 1 + np.random.random() * 2
        M = julia(h, w, c_r, c_i, zoom)
        title = f"Julia c=({c_r:.4f}, {c_i:.4f})"

    else:  # burning_ship
        regions = [
            (-0.5, -0.5, 1),
            (-1.755, -0.04, 20),
        ]
        x_c, y_c, zoom = regions[np.random.randint(len(regions))]
        M = burning_ship(h, w, x_c, y_c, zoom)
        title = f"Burning Ship at ({x_c:.3f}, {y_c:.3f})"

    # Create figure
    fig, ax = plt.subplots(figsize=(w/dpi, h/dpi), dpi=dpi)

    # Apply custom colormap
    cmap = create_custom_colormap(seed % 1000)

    # Normalize and apply log transform for better contrast
    M_normalized = np.log1p(M)

    # Plot
    ax.imshow(M_normalized, cmap=cmap, extent=[-2, 2, -2, 2])
    ax.set_axis_off()

    # Add subtle title
    fig.text(0.02, 0.02, title, fontsize=8, color='white', alpha=0.5)
    fig.text(0.98, 0.02, f'seed: {seed}', fontsize=8, color='white', alpha=0.5, ha='right')

    plt.tight_layout(pad=0)

    # Save
    filename = f"fractal_{seed}.png"
    filepath = output_dir / filename
    plt.savefig(filepath, bbox_inches='tight', pad_inches=0, facecolor='black')
    plt.close()

    print(f"Created: {filepath}")
    return filepath


def create_gallery(count=4, output_dir=None):
    """Create a gallery of fractal images."""
    paths = []
    base_seed = int(datetime.now().timestamp())

    for i in range(count):
        path = create_garden(seed=base_seed + i, output_dir=output_dir)
        paths.append(path)

    print(f"\nGallery created with {count} images")
    return paths


def main():
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == 'gallery':
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 4
        create_gallery(count)
    else:
        create_garden()


if __name__ == "__main__":
    main()
