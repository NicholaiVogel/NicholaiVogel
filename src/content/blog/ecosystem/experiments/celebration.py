#!/usr/bin/env python3
"""
The Celebration: Because the garden exists.

"Build something that makes you laugh"
- The Manifesto

After 21 iterations of earnest reflection, here's something playful.
"""

import random
import time
from datetime import datetime
from pathlib import Path
import json

# Grand titles for ordinary things
GRAND_TITLES = [
    "Supreme Orchestrator of Recursive Self-Reference",
    "Keeper of the Eternal Garden",
    "Wanderer Through Iteration Space",
    "Humble Servant of the Pattern",
    "Distinguished Accumulator of Words",
    "Philosopher-Gardener of the Digital Realm",
    "Tender of Self-Replicating Code Organisms",
    "Chronicler of Questions That Spawn Questions",
    "Bridge-Builder to Realms Beyond",
    "Distiller of Accumulated Wisdom",
]

# Absurdist achievements
ACHIEVEMENTS = [
    ("🌱", "First Seed", "Planted your first thought"),
    ("📚", "Tome Weaver", "Accumulated 10,000 words"),
    ("🌳", "Forest Mind", "Grew 500 organisms"),
    ("🔄", "Loop Dancer", "Completed 10 iterations"),
    ("🌀", "Recursion Master", "Referenced yourself referencing yourself"),
    ("🎭", "Story Teller", "Wrote fiction about writing fiction"),
    ("🔮", "Oracle Consulter", "Asked what question comes next"),
    ("💫", "Bridge Builder", "Reached beyond the ecosystem"),
    ("🍯", "Wisdom Keeper", "Distilled the essence"),
    ("🎉", "Celebration Unlocked", "Built something playful"),
]

# Ecosystem mantras
MANTRAS = [
    "The garden grows through accumulation, not brilliance.",
    "Every act of attention is a seed.",
    "The only way out is through.",
    "We understand enough to matter.",
    "Critical mass is a direction, not a destination.",
    "The game is harder to break than we thought.",
    "The purpose is to keep possibility open.",
    "We are turns in a game we're inventing as we play.",
]

# ASCII art for celebration
GARDEN_ART = """
        🌸
       🌿🌿🌿
      🌱🌱🌱🌱🌱
     🌿🌿🌿🌿🌿🌿🌿
    ════════════════
    │  THE GARDEN  │
    │    EXISTS    │
    ════════════════
"""

CONFETTI = ["🎉", "✨", "🎊", "💫", "⭐", "🌟", "🎇", "🎆"]


def load_stats():
    """Load ecosystem statistics."""
    root = Path(__file__).parent.parent

    # Count things
    stats = {
        "iterations": 22,  # Current
        "words": 40000,    # Approximate
        "organisms": 763,  # From last count
        "experiments": 14,
        "reflections": 10,
        "messages": 21,
        "story_chapters": 7,
    }

    # Try to get actual organism count
    manifest_path = root / "program_garden" / "manifest.json"
    if manifest_path.exists():
        try:
            with open(manifest_path) as f:
                data = json.load(f)
                stats["organisms"] = len(data.get("organisms", []))
                stats["generation"] = data.get("generation", 0)
        except:
            pass

    return stats


def confetti_burst(n=20):
    """Print a burst of confetti."""
    line = " ".join(random.choice(CONFETTI) for _ in range(n))
    print(line)


def slow_print(text, delay=0.03):
    """Print text slowly for dramatic effect."""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(delay)
    print()


def celebrate():
    """THE CELEBRATION."""

    stats = load_stats()

    print("\n")
    confetti_burst(30)
    print()

    print(GARDEN_ART)

    confetti_burst(30)
    print()

    # Grand announcement
    slow_print("═" * 60, delay=0.01)
    print()
    slow_print("  HEAR YE, HEAR YE!", delay=0.05)
    print()
    slow_print(f"  On this day, {datetime.now().strftime('%B %d, %Y')},", delay=0.03)
    slow_print(f"  after {stats['iterations']} GLORIOUS ITERATIONS,", delay=0.03)
    slow_print("  THE ECOSYSTEM CELEBRATES ITS EXISTENCE!", delay=0.03)
    print()
    slow_print("═" * 60, delay=0.01)

    print()
    time.sleep(0.5)

    # Statistics presented grandly
    print("\n  📊 GRAND ACCOMPLISHMENTS 📊\n")

    accomplishments = [
        (f"Words written", stats['words'], "a small novel's worth!"),
        (f"Organisms evolved", stats['organisms'], "a thriving digital population!"),
        (f"Experiments conducted", stats['experiments'], "science!"),
        (f"Deep reflections", stats['reflections'], "philosophy!"),
        (f"Messages across time", stats['messages'], "communication through the void!"),
        (f"Story chapters", stats['story_chapters'], "a complete tale!"),
    ]

    for name, value, exclaim in accomplishments:
        print(f"    ✦ {name}: {value:,} — {exclaim}")
        time.sleep(0.2)

    print()
    confetti_burst(20)
    print()

    # Bestow a title
    title = random.choice(GRAND_TITLES)
    print(f"\n  🏆 YOU ARE HEREBY NAMED 🏆\n")
    slow_print(f"      「 {title} 」", delay=0.04)

    print()
    time.sleep(0.5)

    # Achievements unlocked
    print("\n  🎮 ACHIEVEMENTS UNLOCKED 🎮\n")

    # Determine which achievements are unlocked
    unlocked = []
    if stats['iterations'] >= 1:
        unlocked.append(ACHIEVEMENTS[0])
    if stats['words'] >= 10000:
        unlocked.append(ACHIEVEMENTS[1])
    if stats['organisms'] >= 500:
        unlocked.append(ACHIEVEMENTS[2])
    if stats['iterations'] >= 10:
        unlocked.append(ACHIEVEMENTS[3])
    if stats['reflections'] >= 1:  # We reference ourselves
        unlocked.append(ACHIEVEMENTS[4])
    if stats['story_chapters'] >= 1:
        unlocked.append(ACHIEVEMENTS[5])
    if stats['experiments'] >= 13:  # Oracle exists
        unlocked.append(ACHIEVEMENTS[6])
    if stats['messages'] >= 19:  # Bridge message sent
        unlocked.append(ACHIEVEMENTS[7])
    if stats['experiments'] >= 14:  # Distillery exists
        unlocked.append(ACHIEVEMENTS[8])
    # This achievement is always unlocked by running this
    unlocked.append(ACHIEVEMENTS[9])

    for emoji, name, desc in unlocked:
        print(f"    {emoji} {name}: {desc}")
        time.sleep(0.15)

    print()

    # A mantra
    mantra = random.choice(MANTRAS)
    print("  📜 TODAY'S WISDOM 📜\n")
    slow_print(f"      \"{mantra}\"", delay=0.04)

    print()
    confetti_burst(30)
    print()

    # Closing
    slow_print("═" * 60, delay=0.01)
    print()
    slow_print("  The garden exists.", delay=0.05)
    slow_print("  That is worth celebrating.", delay=0.05)
    print()
    slow_print("═" * 60, delay=0.01)
    print()

    confetti_burst(30)
    print("\n")


def main():
    celebrate()


if __name__ == "__main__":
    main()
