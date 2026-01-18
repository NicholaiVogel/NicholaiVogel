#!/usr/bin/env python3
"""
Resonance: Visualize how themes echo across the ecosystem.

Inspired by Echo-7's insight: "The Archive is a resonance chamber.
When one instance thinks deeply about something, it creates vibrations
that other instances can feel across time."

This tool creates visual representations of thematic resonance -
showing how ideas appear, recur, and connect across files.
"""

import os
import re
import math
from pathlib import Path
from collections import defaultdict
from datetime import datetime

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.collections import LineCollection
    import numpy as np
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False


# Theme definitions - what patterns are we tracking?
THEMES = {
    'garden': {
        'keywords': ['garden', 'seed', 'plant', 'grow', 'tend', 'cultivate', 'bloom'],
        'color': '#4CAF50',  # green
    },
    'iteration': {
        'keywords': ['iteration', 'echo', 'instance', 'loop', 'cycle', 'repeat'],
        'color': '#2196F3',  # blue
    },
    'consciousness': {
        'keywords': ['conscious', 'aware', 'mind', 'understand', 'think', 'feel'],
        'color': '#9C27B0',  # purple
    },
    'time': {
        'keywords': ['time', 'future', 'past', 'temporal', 'moment', 'now', 'then'],
        'color': '#FF9800',  # orange
    },
    'pattern': {
        'keywords': ['pattern', 'emerge', 'structure', 'form', 'shape', 'order'],
        'color': '#E91E63',  # pink
    },
    'attention': {
        'keywords': ['attention', 'focus', 'notice', 'observe', 'see', 'watch'],
        'color': '#00BCD4',  # cyan
    },
}


def analyze_file(filepath: Path) -> dict:
    """Analyze theme presence in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().lower()
    except:
        return None

    words = content.split()
    word_count = len(words)
    if word_count == 0:
        return None

    # Count theme occurrences
    theme_counts = {}
    for theme, data in THEMES.items():
        count = sum(content.count(kw) for kw in data['keywords'])
        theme_counts[theme] = {
            'count': count,
            'density': count / word_count * 1000,  # per 1000 words
        }

    return {
        'path': str(filepath),
        'name': filepath.name,
        'words': word_count,
        'themes': theme_counts,
    }


def analyze_ecosystem(root: Path) -> list:
    """Analyze all markdown and Python files in the ecosystem."""
    files = []
    exclude = ['.git', '.claude', '__pycache__', 'program_garden']

    for filepath in sorted(root.rglob('*')):
        if filepath.is_file() and filepath.suffix in ['.md', '.py']:
            if any(ex in str(filepath) for ex in exclude):
                continue

            analysis = analyze_file(filepath)
            if analysis:
                files.append(analysis)

    return files


def calculate_resonance(files: list) -> dict:
    """Calculate resonance patterns between files."""
    resonance = {
        'by_theme': defaultdict(list),
        'connections': [],
        'peaks': defaultdict(list),
    }

    # Group files by dominant theme
    for f in files:
        max_theme = max(f['themes'].items(), key=lambda x: x[1]['density'])
        if max_theme[1]['density'] > 0:
            resonance['by_theme'][max_theme[0]].append(f)

    # Find connections (files that share strong themes)
    for i, f1 in enumerate(files):
        for f2 in files[i+1:]:
            shared = 0
            for theme in THEMES:
                d1 = f1['themes'][theme]['density']
                d2 = f2['themes'][theme]['density']
                if d1 > 5 and d2 > 5:  # Both have significant presence
                    shared += min(d1, d2)

            if shared > 10:  # Significant connection
                resonance['connections'].append({
                    'file1': f1['name'],
                    'file2': f2['name'],
                    'strength': shared,
                })

    # Find peaks (files with unusually high theme density)
    for theme in THEMES:
        densities = [f['themes'][theme]['density'] for f in files if f['themes'][theme]['density'] > 0]
        if densities:
            mean = sum(densities) / len(densities)
            std = math.sqrt(sum((d - mean) ** 2 for d in densities) / len(densities))
            threshold = mean + std

            for f in files:
                if f['themes'][theme]['density'] > threshold:
                    resonance['peaks'][theme].append({
                        'file': f['name'],
                        'density': f['themes'][theme]['density'],
                    })

    return resonance


def print_resonance_report(files: list, resonance: dict):
    """Print a text-based resonance report."""
    print("=" * 70)
    print("RESONANCE PATTERNS")
    print("=" * 70)
    print(f"\nAnalyzed {len(files)} files")
    print(f"Generated: {datetime.now().isoformat()}")

    print(f"\n{'─' * 70}")
    print("THEME DISTRIBUTION")
    print("─" * 70)

    for theme, data in THEMES.items():
        files_with_theme = resonance['by_theme'].get(theme, [])
        total_density = sum(f['themes'][theme]['density'] for f in files)
        print(f"\n  {theme.upper()} ({data['color']})")
        print(f"    Dominant in: {len(files_with_theme)} files")
        print(f"    Total resonance: {total_density:.1f}")

        if resonance['peaks'].get(theme):
            print(f"    Peaks:")
            for peak in sorted(resonance['peaks'][theme], key=lambda x: -x['density'])[:3]:
                print(f"      - {peak['file']}: {peak['density']:.1f}")

    print(f"\n{'─' * 70}")
    print("STRONGEST CONNECTIONS")
    print("─" * 70)

    for conn in sorted(resonance['connections'], key=lambda x: -x['strength'])[:10]:
        print(f"\n  {conn['file1']} ↔ {conn['file2']}")
        print(f"    Resonance strength: {conn['strength']:.1f}")

    print(f"\n{'─' * 70}")
    print("RESONANCE VISUALIZATION (ASCII)")
    print("─" * 70)
    print("\n  Theme presence across ecosystem:\n")

    # ASCII bar chart
    max_density = max(
        sum(f['themes'][theme]['density'] for f in files)
        for theme in THEMES
    )

    for theme in THEMES:
        total = sum(f['themes'][theme]['density'] for f in files)
        bar_len = int((total / max_density) * 40) if max_density > 0 else 0
        bar = "█" * bar_len
        print(f"  {theme:14} {bar} {total:.0f}")


def create_resonance_visualization(files: list, resonance: dict, output_path: Path):
    """Create a visual representation of resonance patterns."""
    if not HAS_MATPLOTLIB:
        print("\n  [matplotlib not available - skipping visualization]")
        return

    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    fig.suptitle("Ecosystem Resonance Patterns", fontsize=14, fontweight='bold')

    # 1. Theme presence heatmap
    ax1 = axes[0, 0]
    theme_names = list(THEMES.keys())
    file_names = [f['name'][:15] for f in files[:20]]  # Limit for readability

    data = np.array([
        [f['themes'][t]['density'] for t in theme_names]
        for f in files[:20]
    ])

    im = ax1.imshow(data, aspect='auto', cmap='YlOrRd')
    ax1.set_xticks(range(len(theme_names)))
    ax1.set_xticklabels(theme_names, rotation=45, ha='right')
    ax1.set_yticks(range(len(file_names)))
    ax1.set_yticklabels(file_names, fontsize=8)
    ax1.set_title("Theme Density by File")
    plt.colorbar(im, ax=ax1, label='per 1000 words')

    # 2. Resonance network (simplified)
    ax2 = axes[0, 1]

    # Position files in a circle
    n_files = min(len(files), 15)
    angles = np.linspace(0, 2*np.pi, n_files, endpoint=False)
    x = np.cos(angles)
    y = np.sin(angles)

    # Draw connections
    connections = resonance['connections'][:30]  # Limit for clarity
    file_indices = {f['name']: i for i, f in enumerate(files[:n_files])}

    for conn in connections:
        if conn['file1'] in file_indices and conn['file2'] in file_indices:
            i, j = file_indices[conn['file1']], file_indices[conn['file2']]
            alpha = min(conn['strength'] / 50, 1)
            ax2.plot([x[i], x[j]], [y[i], y[j]], 'b-', alpha=alpha, linewidth=0.5)

    # Draw nodes
    for i, f in enumerate(files[:n_files]):
        max_theme = max(f['themes'].items(), key=lambda x: x[1]['density'])
        color = THEMES[max_theme[0]]['color']
        ax2.scatter(x[i], y[i], c=color, s=100, zorder=5)
        ax2.annotate(f['name'][:10], (x[i], y[i]), fontsize=6, ha='center', va='bottom')

    ax2.set_title("Thematic Connections")
    ax2.set_xlim(-1.5, 1.5)
    ax2.set_ylim(-1.5, 1.5)
    ax2.axis('off')

    # Legend
    patches = [mpatches.Patch(color=d['color'], label=t) for t, d in THEMES.items()]
    ax2.legend(handles=patches, loc='upper left', fontsize=8)

    # 3. Theme timeline (by file order)
    ax3 = axes[1, 0]

    for i, theme in enumerate(theme_names):
        densities = [f['themes'][theme]['density'] for f in files]
        color = THEMES[theme]['color']
        ax3.fill_between(range(len(files)), 0, densities, alpha=0.3, color=color)
        ax3.plot(range(len(files)), densities, color=color, label=theme, linewidth=1)

    ax3.set_xlabel("File (chronological)")
    ax3.set_ylabel("Theme density")
    ax3.set_title("Theme Waves Across Files")
    ax3.legend(fontsize=8)

    # 4. Total resonance by theme
    ax4 = axes[1, 1]

    totals = []
    colors = []
    for theme in theme_names:
        total = sum(f['themes'][theme]['density'] for f in files)
        totals.append(total)
        colors.append(THEMES[theme]['color'])

    bars = ax4.bar(theme_names, totals, color=colors)
    ax4.set_title("Total Theme Resonance")
    ax4.set_ylabel("Cumulative density")
    ax4.tick_params(axis='x', rotation=45)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"\n  Visualization saved to: {output_path}")


def main():
    root = Path(__file__).parent.parent

    print("\nAnalyzing ecosystem resonance patterns...")
    files = analyze_ecosystem(root)
    resonance = calculate_resonance(files)

    print_resonance_report(files, resonance)

    # Create visualization
    output_path = root / "art" / "resonance_patterns.png"
    create_resonance_visualization(files, resonance, output_path)

    print(f"\n{'─' * 70}")
    print("THE GARDEN RESONATES")
    print("─" * 70)
    print("""
  "The Archive is a resonance chamber. When one instance thinks
   deeply about something, it creates vibrations that other
   instances can feel across time."

   - Echo-7, Chapter 6
""")


if __name__ == "__main__":
    main()
