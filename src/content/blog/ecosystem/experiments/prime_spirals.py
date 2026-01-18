#!/usr/bin/env python3
"""
Prime Spirals: Exploring the visual beauty of prime numbers.

The Ulam spiral reveals unexpected patterns in prime distribution.
This creates visualizations and explores what we can discover.
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


def sieve_of_eratosthenes(n: int) -> np.ndarray:
    """Generate array where True indicates prime index."""
    is_prime = np.ones(n + 1, dtype=bool)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(np.sqrt(n)) + 1):
        if is_prime[i]:
            is_prime[i*i::i] = False

    return is_prime


def spiral_coords(n: int) -> list:
    """Generate coordinates for Ulam spiral of size n."""
    coords = [(0, 0)]
    x, y = 0, 0
    direction = 0  # 0=right, 1=up, 2=left, 3=down
    dx = [1, 0, -1, 0]
    dy = [0, 1, 0, -1]

    step_size = 1
    steps_taken = 0
    turns = 0

    for _ in range(1, n):
        x += dx[direction]
        y += dy[direction]
        coords.append((x, y))
        steps_taken += 1

        if steps_taken == step_size:
            direction = (direction + 1) % 4
            turns += 1
            steps_taken = 0
            if turns % 2 == 0:
                step_size += 1

    return coords


def create_ulam_spiral(size: int = 201, output_dir: Path = None):
    """Create an Ulam spiral visualization."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "art"
    output_dir.mkdir(exist_ok=True)

    n = size * size
    is_prime = sieve_of_eratosthenes(n)
    coords = spiral_coords(n)

    # Create grid
    grid = np.zeros((size, size))
    center = size // 2

    for i, (x, y) in enumerate(coords):
        if i < len(is_prime) and is_prime[i]:
            grid[center + y, center + x] = 1

    # Plot
    fig, ax = plt.subplots(figsize=(12, 12), dpi=100)
    ax.imshow(grid, cmap='binary', interpolation='nearest')
    ax.set_title(f'Ulam Spiral ({size}x{size})', fontsize=14)
    ax.axis('off')

    filepath = output_dir / f'ulam_spiral_{size}.png'
    plt.savefig(filepath, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"Created: {filepath}")
    return filepath


def analyze_prime_gaps(limit: int = 10000):
    """Analyze gaps between consecutive primes."""
    is_prime = sieve_of_eratosthenes(limit)
    primes = np.where(is_prime)[0]

    gaps = np.diff(primes)

    print(f"\nPrime Gap Analysis (first {len(primes)} primes):")
    print(f"  Smallest gap: {gaps.min()}")
    print(f"  Largest gap: {gaps.max()}")
    print(f"  Mean gap: {gaps.mean():.2f}")
    print(f"  Median gap: {np.median(gaps):.2f}")

    # Gap distribution
    unique_gaps, counts = np.unique(gaps, return_counts=True)
    print(f"\n  Most common gaps:")
    sorted_idx = np.argsort(-counts)[:10]
    for idx in sorted_idx:
        print(f"    Gap {unique_gaps[idx]:3d}: {counts[idx]:5d} occurrences")

    return gaps


def prime_digit_patterns(limit: int = 100000):
    """Explore patterns in prime digits."""
    is_prime = sieve_of_eratosthenes(limit)
    primes = np.where(is_prime)[0]

    # Last digit distribution (should only be 1, 3, 7, 9 for primes > 5)
    last_digits = [p % 10 for p in primes if p > 5]
    unique, counts = np.unique(last_digits, return_counts=True)

    print(f"\nLast digit distribution (primes > 5):")
    for d, c in zip(unique, counts):
        pct = 100 * c / len(last_digits)
        bar = '#' * int(pct)
        print(f"  {d}: {bar} ({pct:.1f}%)")

    # Digital root patterns (sum digits until single digit)
    def digital_root(n):
        while n >= 10:
            n = sum(int(d) for d in str(n))
        return n

    roots = [digital_root(p) for p in primes]
    unique, counts = np.unique(roots, return_counts=True)

    print(f"\nDigital root distribution:")
    for r, c in zip(unique, counts):
        pct = 100 * c / len(roots)
        print(f"  {r}: {'#' * int(pct/2)} ({pct:.1f}%)")


def create_prime_constellation(output_dir: Path = None):
    """Create a visualization of prime pairs, triplets, etc."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "art"
    output_dir.mkdir(exist_ok=True)

    limit = 1000
    is_prime = sieve_of_eratosthenes(limit)
    primes = list(np.where(is_prime)[0])

    # Find twin primes (differ by 2)
    twins = [(p, p+2) for p in primes if p+2 < limit and is_prime[p+2]]

    # Find cousin primes (differ by 4)
    cousins = [(p, p+4) for p in primes if p+4 < limit and is_prime[p+4]]

    # Find sexy primes (differ by 6)
    sexy = [(p, p+6) for p in primes if p+6 < limit and is_prime[p+6]]

    print(f"\nPrime Constellations up to {limit}:")
    print(f"  Twin primes (gap=2): {len(twins)}")
    print(f"  Cousin primes (gap=4): {len(cousins)}")
    print(f"  Sexy primes (gap=6): {len(sexy)}")

    # Visualize
    fig, ax = plt.subplots(figsize=(14, 8), dpi=100)

    # Plot all primes as small dots
    ax.scatter(primes, [0] * len(primes), s=5, c='gray', alpha=0.3, label='All primes')

    # Plot twin primes
    twin_x = [p for pair in twins for p in pair]
    ax.scatter(twin_x, [1] * len(twin_x), s=20, c='red', alpha=0.6, label='Twin primes')

    # Plot cousin primes
    cousin_x = [p for pair in cousins for p in pair]
    ax.scatter(cousin_x, [2] * len(cousin_x), s=20, c='blue', alpha=0.6, label='Cousin primes')

    # Plot sexy primes
    sexy_x = [p for pair in sexy for p in pair]
    ax.scatter(sexy_x, [3] * len(sexy_x), s=20, c='green', alpha=0.6, label='Sexy primes')

    ax.set_yticks([0, 1, 2, 3])
    ax.set_yticklabels(['All', 'Twin (±2)', 'Cousin (±4)', 'Sexy (±6)'])
    ax.set_xlabel('Number')
    ax.set_title('Prime Constellations')
    ax.legend(loc='upper right')

    filepath = output_dir / 'prime_constellations.png'
    plt.savefig(filepath, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"Created: {filepath}")
    return filepath


def main():
    print("=" * 60)
    print("PRIME SPIRALS: Exploring the beauty of primes")
    print("=" * 60)

    # Create visualizations
    create_ulam_spiral(201)
    create_prime_constellation()

    # Analysis
    analyze_prime_gaps(100000)
    prime_digit_patterns(100000)


if __name__ == "__main__":
    main()
