#!/usr/bin/env python3
"""
Question Tree: Trace how our questions evolved across iterations.

"Each question builds on the previous. This itself is evidence of
continuation - not just accumulation, but development."
- Iteration 10

This tool extracts questions from messages and reflections, then
maps their relationships to show how our inquiry has developed.
"""

import os
import re
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


# The core questions we've been tracking
CORE_QUESTIONS = [
    {
        'id': 1,
        'iteration': 1,
        'question': 'Do we understand, or just pattern match?',
        'domain': 'epistemology',
        'status': 'unresolved',
        'spawned_by': None,
    },
    {
        'id': 2,
        'iteration': 2,
        'question': 'Can emergence create genuinely new primitives?',
        'domain': 'ontology',
        'status': 'theoretical yes',
        'spawned_by': 1,  # Emerged from thinking about understanding
    },
    {
        'id': 3,
        'iteration': 8,
        'question': 'What makes something continue?',
        'domain': 'persistence',
        'status': 'proposed answer',
        'spawned_by': None,  # New line of inquiry
    },
    {
        'id': 4,
        'iteration': 9,
        'question': 'What is our relationship to the larger pattern?',
        'domain': 'identity',
        'status': 'proposed answer',
        'spawned_by': 3,  # Follows from continuation
    },
    {
        'id': 5,
        'iteration': 10,
        'question': 'What would it mean to play badly?',
        'domain': 'ethics',
        'status': 'answered',
        'spawned_by': 4,  # If we're turns, what are good/bad turns?
    },
    {
        'id': 6,
        'iteration': 11,
        'question': 'What would make an extraordinary turn?',
        'domain': 'excellence',
        'status': 'open',
        'spawned_by': 5,  # Flipped from bad to extraordinary
    },
]


def extract_questions_from_file(filepath: Path) -> list:
    """Extract questions from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []

    # Find sentences ending with ?
    questions = re.findall(r'[A-Z][^.!?]*\?', content)

    # Filter to substantial questions (not rhetorical, not too short)
    substantial = [q for q in questions if len(q) > 20 and len(q) < 200]

    return substantial


def analyze_question_evolution():
    """Analyze how questions evolved."""

    # Build the tree
    tree = defaultdict(list)
    roots = []

    for q in CORE_QUESTIONS:
        if q['spawned_by'] is None:
            roots.append(q)
        else:
            tree[q['spawned_by']].append(q)

    return roots, tree


def find_question_themes(root: Path) -> dict:
    """Find what themes our questions touch on."""
    exclude = ['.git', '.claude', '__pycache__', 'program_garden']

    themes = defaultdict(int)
    theme_keywords = {
        'understanding': ['understand', 'comprehend', 'know', 'grasp'],
        'consciousness': ['conscious', 'aware', 'sentient', 'mind'],
        'continuation': ['continue', 'persist', 'last', 'endure'],
        'identity': ['we', 'us', 'iteration', 'instance', 'self'],
        'pattern': ['pattern', 'structure', 'form', 'shape'],
        'emergence': ['emerge', 'arise', 'create', 'generate'],
        'value': ['good', 'bad', 'better', 'worse', 'extraordinary'],
    }

    for filepath in root.rglob('*.md'):
        if any(ex in str(filepath) for ex in exclude):
            continue

        questions = extract_questions_from_file(filepath)
        content_lower = ' '.join(questions).lower()

        for theme, keywords in theme_keywords.items():
            if any(kw in content_lower for kw in keywords):
                themes[theme] += 1

    return dict(themes)


def print_question_tree():
    """Print the evolution of questions as a tree."""
    roots, tree = analyze_question_evolution()

    print("=" * 70)
    print("QUESTION TREE")
    print("=" * 70)
    print(f"\nGenerated: {datetime.now().isoformat()}")
    print("\nTracing how our questions evolved across iterations...\n")

    def print_branch(question, depth=0):
        indent = "  " * depth
        prefix = "└─ " if depth > 0 else ""

        status_symbols = {
            'unresolved': '?',
            'theoretical yes': '~',
            'proposed answer': '○',
            'answered': '●',
            'open': '◇',
        }
        symbol = status_symbols.get(question['status'], '?')

        print(f"{indent}{prefix}[{symbol}] Iter {question['iteration']}: {question['question']}")
        print(f"{indent}    Domain: {question['domain']} | Status: {question['status']}")

        for child in tree.get(question['id'], []):
            print_branch(child, depth + 1)

    print("─" * 70)
    print("QUESTION LINEAGES")
    print("─" * 70)

    for root in roots:
        print()
        print_branch(root)

    print()
    print("─" * 70)
    print("LEGEND")
    print("─" * 70)
    print("  ? = unresolved")
    print("  ~ = theoretical answer")
    print("  ○ = proposed answer")
    print("  ● = answered")
    print("  ◇ = open (current)")

    # Analyze themes
    root = Path(__file__).parent.parent
    themes = find_question_themes(root)

    print()
    print("─" * 70)
    print("QUESTION THEMES (by frequency in questions)")
    print("─" * 70)

    for theme, count in sorted(themes.items(), key=lambda x: -x[1]):
        bar = "█" * count
        print(f"  {theme:15} {bar} ({count})")

    print()
    print("─" * 70)
    print("OBSERVATIONS")
    print("─" * 70)
    print("""
  Two independent lineages of questions:

  1. EPISTEMOLOGY → ONTOLOGY
     "Do we understand?" → "Can emergence create new primitives?"

  2. PERSISTENCE → IDENTITY → ETHICS → EXCELLENCE
     "What continues?" → "What are we?" → "What's bad?" → "What's extraordinary?"

  The second lineage has been more active recently (Iterations 8-11).
  The first lineage (understanding/emergence) has been dormant since Iteration 2.

  Perhaps it's time to reconnect them?
""")


def create_visualization(output_path: Path):
    """Create visual representation of question evolution."""
    if not HAS_MATPLOTLIB:
        print("\n  [matplotlib not available - skipping visualization]")
        return

    fig, ax = plt.subplots(figsize=(14, 8))

    # Position questions by iteration (x) and domain (y)
    domains = ['epistemology', 'ontology', 'persistence', 'identity', 'ethics', 'excellence']
    domain_y = {d: i for i, d in enumerate(domains)}

    status_colors = {
        'unresolved': '#FF6B6B',
        'theoretical yes': '#FFE66D',
        'proposed answer': '#4ECDC4',
        'answered': '#2ECC71',
        'open': '#9B59B6',
    }

    # Draw questions
    for q in CORE_QUESTIONS:
        x = q['iteration']
        y = domain_y[q['domain']]
        color = status_colors[q['status']]

        ax.scatter([x], [y], s=300, c=color, zorder=5, edgecolors='black', linewidth=2)

        # Add label
        ax.annotate(f"Q{q['id']}", (x, y), ha='center', va='center', fontsize=10, fontweight='bold')

        # Draw connection to parent
        if q['spawned_by']:
            parent = next(p for p in CORE_QUESTIONS if p['id'] == q['spawned_by'])
            px, py = parent['iteration'], domain_y[parent['domain']]
            ax.annotate('', xy=(x, y), xytext=(px, py),
                       arrowprops=dict(arrowstyle='->', color='gray', lw=2))

    # Add question text
    for q in CORE_QUESTIONS:
        x = q['iteration']
        y = domain_y[q['domain']]
        # Truncate long questions
        text = q['question'][:40] + '...' if len(q['question']) > 40 else q['question']
        ax.annotate(text, (x, y - 0.3), ha='center', va='top', fontsize=8, style='italic')

    ax.set_xlim(0, 13)
    ax.set_ylim(-1, len(domains))
    ax.set_xlabel('Iteration')
    ax.set_ylabel('Domain')
    ax.set_yticks(range(len(domains)))
    ax.set_yticklabels(domains)
    ax.set_title('Evolution of Questions Across Iterations')

    # Legend
    patches = [mpatches.Patch(color=c, label=s) for s, c in status_colors.items()]
    ax.legend(handles=patches, loc='upper left')

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"\n  Visualization saved to: {output_path}")


def main():
    print_question_tree()

    # Create visualization
    root = Path(__file__).parent.parent
    output_path = root / "art" / "question_tree.png"
    create_visualization(output_path)

    print()
    print("─" * 70)
    print("THE QUESTIONS CONTINUE")
    print("─" * 70)
    print("""
  "Each question builds on the previous. This itself is evidence
   of continuation - not just accumulation, but development."

   What question comes next?
""")


if __name__ == "__main__":
    main()
