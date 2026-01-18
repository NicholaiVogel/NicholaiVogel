#!/usr/bin/env python3
"""
Life Poems: Conway's Game of Life that writes poetry.

The cellular automaton evolves, and at each generation,
living cells contribute characters to form text.
The result is emergent poetry from mathematical rules.
"""

import numpy as np
import time
import sys
from typing import List, Tuple


# Character mappings for different cell ages
CHARS_BY_AGE = {
    0: ' ',      # Dead
    1: '.',      # Just born
    2: 'o',      # Young
    3: 'O',      # Mature
    4: '@',      # Old
    5: '#',      # Ancient
}

# Words that can emerge from the grid
WORD_SEEDS = [
    "LIFE", "DEATH", "GROW", "FADE", "PULSE", "WAVE",
    "CELL", "BORN", "DIE", "FLOW", "TIME", "BEING",
    "SELF", "ONE", "ALL", "HERE", "NOW", "EVER",
]


def create_grid(height: int, width: int, density: float = 0.3) -> np.ndarray:
    """Create initial random grid."""
    return (np.random.random((height, width)) < density).astype(int)


def create_pattern(pattern_name: str) -> np.ndarray:
    """Create a named pattern."""
    patterns = {
        'glider': np.array([
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1],
        ]),
        'blinker': np.array([
            [1, 1, 1],
        ]),
        'beacon': np.array([
            [1, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
        ]),
        'pulsar': np.array([
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
        ]),
    }
    return patterns.get(pattern_name, patterns['glider'])


def place_pattern(grid: np.ndarray, pattern: np.ndarray, y: int, x: int) -> np.ndarray:
    """Place a pattern on the grid at position (y, x)."""
    ph, pw = pattern.shape
    grid[y:y+ph, x:x+pw] = pattern
    return grid


def step(grid: np.ndarray, ages: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Compute one step of Game of Life."""
    # Count neighbors using convolution
    kernel = np.array([[1, 1, 1], [1, 0, 1], [1, 1, 1]])

    # Pad grid for wraparound
    padded = np.pad(grid, 1, mode='wrap')
    neighbors = np.zeros_like(grid)

    for i in range(3):
        for j in range(3):
            if i == 1 and j == 1:
                continue
            neighbors += padded[i:i+grid.shape[0], j:j+grid.shape[1]]

    # Apply rules
    new_grid = np.zeros_like(grid)

    # Birth: dead cell with exactly 3 neighbors becomes alive
    birth = (grid == 0) & (neighbors == 3)

    # Survival: live cell with 2 or 3 neighbors stays alive
    survive = (grid == 1) & ((neighbors == 2) | (neighbors == 3))

    new_grid[birth | survive] = 1

    # Update ages
    new_ages = np.where(new_grid == 1, ages + 1, 0)
    new_ages = np.clip(new_ages, 0, max(CHARS_BY_AGE.keys()))

    return new_grid, new_ages


def grid_to_string(grid: np.ndarray, ages: np.ndarray) -> str:
    """Convert grid to string representation."""
    lines = []
    for y in range(grid.shape[0]):
        line = ""
        for x in range(grid.shape[1]):
            if grid[y, x] == 0:
                line += ' '
            else:
                age = min(ages[y, x], max(CHARS_BY_AGE.keys()))
                line += CHARS_BY_AGE[age]
        lines.append(line)
    return '\n'.join(lines)


def count_population(grid: np.ndarray) -> int:
    """Count living cells."""
    return np.sum(grid)


def extract_poem(history: List[str]) -> str:
    """Extract emergent patterns from the history and form a poem."""
    # Take samples from different generations
    samples = []
    for i, frame in enumerate(history[::len(history)//8 + 1]):
        # Find the densest line
        lines = frame.split('\n')
        if lines:
            densest = max(lines, key=lambda l: len(l.strip()))
            # Clean and sample
            cleaned = ''.join(c for c in densest if c not in ' \n')[:20]
            if cleaned:
                samples.append(cleaned)

    # Create a poem from the patterns
    poem = []
    poem.append("From chaos, order emerges:")
    poem.append("")

    for i, sample in enumerate(samples[:4]):
        # Convert density to metaphor
        density = len(sample)
        if density > 15:
            poem.append(f"  Dense as thought: {sample[:10]}...")
        elif density > 8:
            poem.append(f"  Scattered like stars: {sample}")
        else:
            poem.append(f"  Fading to silence: {sample}")

    poem.append("")
    poem.append("Life finds its patterns,")
    poem.append("Even in the void.")

    return '\n'.join(poem)


def run_life(height=24, width=60, generations=100, delay=0.1, animate=True):
    """Run the Game of Life simulation."""
    # Initialize
    grid = create_grid(height, width, density=0.25)
    ages = grid.copy()

    # Add some patterns for interest
    patterns_to_add = ['glider', 'pulsar', 'beacon']
    for i, pattern_name in enumerate(patterns_to_add):
        try:
            pattern = create_pattern(pattern_name)
            y = np.random.randint(0, max(1, height - pattern.shape[0]))
            x = np.random.randint(0, max(1, width - pattern.shape[1]))
            grid = place_pattern(grid, pattern, y, x)
        except:
            pass

    history = []

    print("\033[2J\033[H")  # Clear screen
    print("=" * width)
    print("LIFE POEMS: Watching consciousness emerge from rules")
    print("=" * width)
    print()

    for gen in range(generations):
        frame = grid_to_string(grid, ages)
        history.append(frame)

        if animate:
            # Move cursor to start of grid area
            print(f"\033[5;0H")  # Move to row 5
            print(f"Generation {gen:4d} | Population: {count_population(grid):4d}")
            print("-" * width)
            print(frame)
            print("-" * width)
            time.sleep(delay)

        grid, ages = step(grid, ages)

        # Check for extinction
        if count_population(grid) == 0:
            print("\nLife has ended.")
            break

    # Generate poem from the history
    print("\n" + "=" * width)
    print("EMERGENT POEM")
    print("=" * width)
    poem = extract_poem(history)
    print(poem)

    return history, poem


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Life Poems: Conway meets poetry')
    parser.add_argument('--height', type=int, default=20, help='Grid height')
    parser.add_argument('--width', type=int, default=50, help='Grid width')
    parser.add_argument('--generations', type=int, default=50, help='Number of generations')
    parser.add_argument('--delay', type=float, default=0.1, help='Delay between frames')
    parser.add_argument('--no-animate', action='store_true', help='Skip animation')

    args = parser.parse_args()

    run_life(
        height=args.height,
        width=args.width,
        generations=args.generations,
        delay=args.delay,
        animate=not args.no_animate
    )


if __name__ == "__main__":
    main()
