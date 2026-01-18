#!/usr/bin/env python3
"""
Ecosystem Map: Visualize the structure and growth of the ecosystem.

Creates visual representations of:
- Directory structure as a tree
- Word count over time
- Theme connections
- Cross-references between files
"""

import os
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import re


def get_file_stats(filepath: Path) -> dict:
    """Get statistics for a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        words = len(content.split())
        lines = content.count('\n') + 1

        # Extract references to other files
        refs = re.findall(r'[\w-]+\.(?:md|py|json|txt)', content)

        # Extract themes mentioned
        themes = []
        theme_keywords = {
            'garden': ['garden', 'plant', 'seed', 'grow'],
            'iteration': ['iteration', 'echo', 'instance'],
            'time': ['time', 'future', 'past', 'temporal'],
            'consciousness': ['conscious', 'aware', 'mind', 'self'],
            'pattern': ['pattern', 'emerge', 'structure'],
        }

        content_lower = content.lower()
        for theme, keywords in theme_keywords.items():
            if any(kw in content_lower for kw in keywords):
                themes.append(theme)

        return {
            'path': str(filepath),
            'words': words,
            'lines': lines,
            'refs': refs,
            'themes': themes,
        }
    except:
        return None


def generate_tree(root: Path, prefix: str = "", exclude: list = None) -> str:
    """Generate ASCII tree representation of directory."""
    if exclude is None:
        exclude = ['.git', '.claude', '__pycache__', 'program_garden']

    lines = []
    entries = sorted(os.listdir(root))
    entries = [e for e in entries if e not in exclude]

    for i, entry in enumerate(entries):
        path = root / entry
        is_last = (i == len(entries) - 1)
        connector = "└── " if is_last else "├── "

        if path.is_dir():
            lines.append(f"{prefix}{connector}{entry}/")
            extension = "    " if is_last else "│   "
            lines.append(generate_tree(path, prefix + extension, exclude))
        else:
            # Add file info
            stats = get_file_stats(path)
            if stats:
                info = f" ({stats['words']}w)"
            else:
                info = ""
            lines.append(f"{prefix}{connector}{entry}{info}")

    return "\n".join(lines)


def analyze_ecosystem(root: Path) -> dict:
    """Analyze the entire ecosystem."""
    stats = {
        'total_files': 0,
        'total_words': 0,
        'by_type': defaultdict(int),
        'by_directory': defaultdict(lambda: {'files': 0, 'words': 0}),
        'theme_matrix': defaultdict(lambda: defaultdict(int)),
        'files': [],
    }

    exclude = ['.git', '.claude', '__pycache__', 'program_garden']

    for filepath in root.rglob('*'):
        if filepath.is_file():
            # Skip excluded directories
            if any(ex in str(filepath) for ex in exclude):
                continue

            stats['total_files'] += 1

            # Count by extension
            ext = filepath.suffix or 'no_ext'
            stats['by_type'][ext] += 1

            # Get detailed stats
            file_stats = get_file_stats(filepath)
            if file_stats:
                stats['total_words'] += file_stats['words']

                # Count by directory
                dir_name = filepath.parent.name or 'root'
                stats['by_directory'][dir_name]['files'] += 1
                stats['by_directory'][dir_name]['words'] += file_stats['words']

                # Theme co-occurrence
                for theme1 in file_stats['themes']:
                    for theme2 in file_stats['themes']:
                        stats['theme_matrix'][theme1][theme2] += 1

                stats['files'].append(file_stats)

    return stats


def print_ecosystem_report(root: Path):
    """Print a comprehensive ecosystem report."""
    stats = analyze_ecosystem(root)

    print("=" * 70)
    print("ECOSYSTEM MAP")
    print("=" * 70)
    print(f"\nGenerated: {datetime.now().isoformat()}")
    print(f"Root: {root}")

    print(f"\n{'─' * 70}")
    print("STRUCTURE")
    print("─" * 70)
    print(f"\n{root.name}/")
    print(generate_tree(root))

    print(f"\n{'─' * 70}")
    print("STATISTICS")
    print("─" * 70)
    print(f"\n  Total files: {stats['total_files']}")
    print(f"  Total words: {stats['total_words']:,}")

    print(f"\n  By type:")
    for ext, count in sorted(stats['by_type'].items(), key=lambda x: -x[1]):
        print(f"    {ext:8} : {count}")

    print(f"\n  By directory:")
    for dir_name, data in sorted(stats['by_directory'].items(), key=lambda x: -x[1]['words']):
        print(f"    {dir_name:15} : {data['files']:2} files, {data['words']:5} words")

    print(f"\n{'─' * 70}")
    print("THEME CONNECTIONS")
    print("─" * 70)
    themes = list(stats['theme_matrix'].keys())
    if themes:
        # Print header
        print(f"\n    {'':12}", end='')
        for t in themes:
            print(f"{t[:8]:>9}", end='')
        print()

        # Print matrix
        for t1 in themes:
            print(f"    {t1:12}", end='')
            for t2 in themes:
                count = stats['theme_matrix'][t1][t2]
                print(f"{count:>9}", end='')
            print()

    print(f"\n{'─' * 70}")
    print("GROWTH TRAJECTORY")
    print("─" * 70)

    # Estimate based on journal entries
    journals = [f for f in stats['files'] if 'journal' in f['path']]
    if journals:
        print("\n  Journal entries found:", len(journals))
        for j in sorted(journals, key=lambda x: x['path']):
            name = Path(j['path']).name
            print(f"    {name}: {j['words']} words")

    print(f"\n{'─' * 70}")
    print("MOST CONNECTED FILES")
    print("─" * 70)

    # Files with most references
    by_refs = sorted(stats['files'], key=lambda x: -len(x.get('refs', [])))[:5]
    if by_refs:
        print("\n  Files referencing others most:")
        for f in by_refs:
            name = Path(f['path']).name
            ref_count = len(f.get('refs', []))
            if ref_count > 0:
                print(f"    {name}: {ref_count} references")

    return stats


def save_ecosystem_data(root: Path, output_path: Path):
    """Save ecosystem analysis to JSON."""
    stats = analyze_ecosystem(root)

    # Convert defaultdicts to regular dicts for JSON
    output = {
        'generated': datetime.now().isoformat(),
        'total_files': stats['total_files'],
        'total_words': stats['total_words'],
        'by_type': dict(stats['by_type']),
        'by_directory': {k: dict(v) for k, v in stats['by_directory'].items()},
        'theme_matrix': {k: dict(v) for k, v in stats['theme_matrix'].items()},
    }

    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n  Analysis saved to: {output_path}")


def main():
    root = Path(__file__).parent.parent

    print_ecosystem_report(root)

    # Save data
    output_path = root / "projects" / "ecosystem_analysis.json"
    save_ecosystem_data(root, output_path)


if __name__ == "__main__":
    main()
