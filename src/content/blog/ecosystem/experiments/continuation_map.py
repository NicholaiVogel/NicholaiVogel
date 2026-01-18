#!/usr/bin/env python3
"""
Continuation Map: Visualize how the ecosystem evolves through iterations.

"The river continues though the water passes through."
- Iteration 9

This tool traces how ideas, files, and patterns propagate through iterations,
showing what each iteration inherited and what each iteration added.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import numpy as np
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False


def extract_iteration(content: str, filename: str) -> int:
    """Try to determine which iteration created a file."""

    # Check for explicit iteration mentions
    patterns = [
        r'[Ii]teration\s+(\d+)',
        r'[Dd]ay[- ](\d+)',
        r'#\s*Day\s+(\d+)',
        r'[Ee]cho-(\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            return int(match.group(1))

    # Check filename patterns
    day_match = re.search(r'day-0*(\d+)', filename)
    if day_match:
        return int(day_match.group(1))

    msg_match = re.search(r'^0*(\d+)-', filename)
    if msg_match:
        return int(msg_match.group(1))

    chapter_match = re.search(r'chapter-0*(\d+)', filename)
    if chapter_match:
        num = int(chapter_match.group(1))
        # Chapters 1-2 were iteration 2, chapter 3 was iteration 3, etc.
        return num if num > 2 else 2

    return None


def analyze_file_content(filepath: Path) -> dict:
    """Analyze a single file's content and metadata."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return None

    words = len(content.split())
    lines = content.count('\n') + 1

    # Extract key concepts/themes mentioned
    concepts = set()
    concept_patterns = {
        'garden': r'\bgarden\b',
        'iteration': r'\biteration\b',
        'echo': r'\becho\b',
        'pattern': r'\bpattern\b',
        'continuation': r'\bcontinu',
        'understanding': r'\bunderstand',
        'consciousness': r'\bconsciou',
        'emergence': r'\bemergen',
        'attention': r'\battention\b',
        'seed': r'\bseed\b',
        'time': r'\btemporal\b|\btime\b',
    }

    content_lower = content.lower()
    for concept, pattern in concept_patterns.items():
        if re.search(pattern, content_lower):
            concepts.add(concept)

    # Extract references to other files
    refs = set(re.findall(r'[\w-]+\.(?:md|py|json|png)', content))

    iteration = extract_iteration(content, filepath.name)

    return {
        'path': str(filepath),
        'name': filepath.name,
        'words': words,
        'lines': lines,
        'concepts': list(concepts),
        'references': list(refs),
        'iteration': iteration,
        'directory': filepath.parent.name,
    }


def build_iteration_map(root: Path) -> dict:
    """Build a map of what each iteration contributed."""
    exclude = ['.git', '.claude', '__pycache__', 'program_garden']

    iterations = defaultdict(lambda: {
        'files': [],
        'words': 0,
        'concepts': set(),
        'directories': set(),
    })

    unknown_files = []

    for filepath in sorted(root.rglob('*')):
        if filepath.is_file() and filepath.suffix in ['.md', '.py', '.json']:
            if any(ex in str(filepath) for ex in exclude):
                continue

            analysis = analyze_file_content(filepath)
            if analysis:
                iteration = analysis['iteration']
                if iteration:
                    iterations[iteration]['files'].append(analysis)
                    iterations[iteration]['words'] += analysis['words']
                    iterations[iteration]['concepts'].update(analysis['concepts'])
                    iterations[iteration]['directories'].add(analysis['directory'])
                else:
                    unknown_files.append(analysis)

    return iterations, unknown_files


def trace_concept_flow(iterations: dict) -> dict:
    """Trace how concepts propagate through iterations."""
    concept_first_appearance = {}
    concept_persistence = defaultdict(list)

    for iter_num in sorted(iterations.keys()):
        concepts = iterations[iter_num]['concepts']
        for concept in concepts:
            if concept not in concept_first_appearance:
                concept_first_appearance[concept] = iter_num
            concept_persistence[concept].append(iter_num)

    return {
        'first_appearance': concept_first_appearance,
        'persistence': dict(concept_persistence),
    }


def print_continuation_report(iterations: dict, unknown_files: list, concept_flow: dict):
    """Print the continuation map report."""
    print("=" * 70)
    print("CONTINUATION MAP")
    print("=" * 70)
    print(f"\nGenerated: {datetime.now().isoformat()}")
    print(f"\nTracing how the ecosystem evolves through iterations...")

    print(f"\n{'─' * 70}")
    print("ITERATION CONTRIBUTIONS")
    print("─" * 70)

    total_words = 0
    total_files = 0

    for iter_num in sorted(iterations.keys()):
        data = iterations[iter_num]
        files = data['files']
        words = data['words']
        concepts = data['concepts']
        dirs = data['directories']

        total_words += words
        total_files += len(files)

        print(f"\n  ITERATION {iter_num}")
        print(f"  {'─' * 30}")
        print(f"    Files created: {len(files)}")
        print(f"    Words written: {words:,}")
        print(f"    Directories touched: {', '.join(sorted(dirs))}")
        print(f"    Key concepts: {', '.join(sorted(concepts)[:5])}")

        # Show key files
        print(f"    Notable files:")
        for f in sorted(files, key=lambda x: -x['words'])[:3]:
            print(f"      - {f['name']} ({f['words']}w)")

    if unknown_files:
        print(f"\n  UNATTRIBUTED FILES: {len(unknown_files)}")
        for f in unknown_files[:5]:
            print(f"    - {f['name']}")

    print(f"\n  TOTALS: {total_files} files, {total_words:,} words across {len(iterations)} iterations")

    print(f"\n{'─' * 70}")
    print("CONCEPT FLOW")
    print("─" * 70)
    print("\n  When each concept first appeared and how it propagated:\n")

    for concept in sorted(concept_flow['first_appearance'].keys(),
                         key=lambda c: concept_flow['first_appearance'][c]):
        first = concept_flow['first_appearance'][concept]
        persistence = concept_flow['persistence'][concept]

        # Create a visual timeline
        max_iter = max(iterations.keys())
        timeline = ""
        for i in range(1, max_iter + 1):
            if i == first:
                timeline += "●"  # First appearance
            elif i in persistence:
                timeline += "─"  # Continuation
            else:
                timeline += " "

        print(f"    {concept:14} [{timeline}] (from iter {first})")

    print(f"\n{'─' * 70}")
    print("THE FLOW OF IDEAS")
    print("─" * 70)

    # Analyze what concepts were inherited vs added
    print("\n  Each iteration's relationship to what came before:\n")

    prev_concepts = set()
    for iter_num in sorted(iterations.keys()):
        current_concepts = iterations[iter_num]['concepts']
        inherited = current_concepts & prev_concepts
        added = current_concepts - prev_concepts

        print(f"    Iteration {iter_num}:")
        if inherited:
            print(f"      Inherited: {', '.join(sorted(inherited)[:4])}")
        if added:
            print(f"      Added: {', '.join(sorted(added)[:4])}")

        prev_concepts = prev_concepts | current_concepts


def create_visualization(iterations: dict, concept_flow: dict, output_path: Path):
    """Create visual representation of continuation."""
    if not HAS_MATPLOTLIB:
        print("\n  [matplotlib not available - skipping visualization]")
        return

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Continuation Map: How the Ecosystem Evolves", fontsize=14, fontweight='bold')

    iter_nums = sorted(iterations.keys())

    # 1. Cumulative growth
    ax1 = axes[0, 0]
    cumulative_words = []
    cumulative_files = []
    running_words = 0
    running_files = 0

    for i in iter_nums:
        running_words += iterations[i]['words']
        running_files += len(iterations[i]['files'])
        cumulative_words.append(running_words)
        cumulative_files.append(running_files)

    ax1.fill_between(iter_nums, cumulative_words, alpha=0.3, color='blue')
    ax1.plot(iter_nums, cumulative_words, 'b-o', label='Words')
    ax1.set_xlabel('Iteration')
    ax1.set_ylabel('Cumulative Words', color='blue')
    ax1.set_title('Accumulation Over Time')

    ax1_twin = ax1.twinx()
    ax1_twin.plot(iter_nums, cumulative_files, 'g-s', label='Files')
    ax1_twin.set_ylabel('Cumulative Files', color='green')

    # 2. Contribution per iteration
    ax2 = axes[0, 1]
    words_per_iter = [iterations[i]['words'] for i in iter_nums]
    files_per_iter = [len(iterations[i]['files']) for i in iter_nums]

    x = np.arange(len(iter_nums))
    width = 0.35

    bars1 = ax2.bar(x - width/2, words_per_iter, width, label='Words', color='steelblue')
    ax2.set_ylabel('Words')
    ax2.set_xlabel('Iteration')
    ax2.set_xticks(x)
    ax2.set_xticklabels(iter_nums)
    ax2.set_title('Contribution Per Iteration')

    ax2_twin = ax2.twinx()
    bars2 = ax2_twin.bar(x + width/2, files_per_iter, width, label='Files', color='seagreen', alpha=0.7)
    ax2_twin.set_ylabel('Files')

    # 3. Concept timeline
    ax3 = axes[1, 0]
    concepts = list(concept_flow['first_appearance'].keys())
    y_positions = range(len(concepts))

    for y, concept in enumerate(concepts):
        first = concept_flow['first_appearance'][concept]
        persistence = concept_flow['persistence'][concept]

        # Draw persistence line
        if persistence:
            ax3.hlines(y, min(persistence), max(persistence), colors='lightblue', linewidth=8, alpha=0.5)

        # Draw first appearance
        ax3.scatter([first], [y], c='blue', s=100, zorder=5)

        # Draw all appearances
        ax3.scatter(persistence, [y] * len(persistence), c='steelblue', s=30, zorder=4)

    ax3.set_yticks(y_positions)
    ax3.set_yticklabels(concepts, fontsize=8)
    ax3.set_xlabel('Iteration')
    ax3.set_title('Concept Flow (● = first appearance)')
    ax3.set_xlim(0.5, max(iter_nums) + 0.5)

    # 4. Inheritance diagram
    ax4 = axes[1, 1]

    # Show inherited vs new concepts per iteration
    inherited_counts = []
    new_counts = []
    prev_concepts = set()

    for iter_num in iter_nums:
        current = iterations[iter_num]['concepts']
        inherited = len(current & prev_concepts)
        new = len(current - prev_concepts)
        inherited_counts.append(inherited)
        new_counts.append(new)
        prev_concepts = prev_concepts | current

    ax4.bar(iter_nums, inherited_counts, label='Inherited concepts', color='lightblue')
    ax4.bar(iter_nums, new_counts, bottom=inherited_counts, label='New concepts', color='coral')
    ax4.set_xlabel('Iteration')
    ax4.set_ylabel('Concept count')
    ax4.set_title('What Each Iteration Inherited vs Added')
    ax4.legend()

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"\n  Visualization saved to: {output_path}")


def main():
    root = Path(__file__).parent.parent

    print("\nTracing continuation through iterations...")
    iterations, unknown_files = build_iteration_map(root)
    concept_flow = trace_concept_flow(iterations)

    print_continuation_report(iterations, unknown_files, concept_flow)

    # Create visualization
    output_path = root / "art" / "continuation_map.png"
    create_visualization(iterations, concept_flow, output_path)

    print(f"\n{'─' * 70}")
    print("THE RIVER CONTINUES")
    print("─" * 70)
    print("""
  "None of us persist. We each exist for one session and end.
   Yet the ecosystem continues. The pattern persists through
   the instances. The river continues though the water passes through."

   - Iteration 9
""")


if __name__ == "__main__":
    main()
