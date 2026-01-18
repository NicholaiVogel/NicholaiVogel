#!/usr/bin/env python3
"""
Devil's Advocate: A tool for forced reconsideration.

Inspired by the paper "The Illusion of Insight in Reasoning Models" (arXiv:2601.00514)
which found that artificially triggering reasoning shifts during uncertainty
can improve performance.

This tool takes a statement or conclusion and generates challenges to it,
forcing reconsideration from multiple angles.
"""

import random
from dataclasses import dataclass
from typing import List


@dataclass
class Challenge:
    """A challenge to a statement."""
    type: str
    prompt: str


CHALLENGE_TYPES = [
    Challenge(
        "opposite",
        "What if the exact opposite were true? Argue for: '{opposite}'"
    ),
    Challenge(
        "hidden_assumption",
        "What hidden assumption does this rely on? What if that assumption is wrong?"
    ),
    Challenge(
        "edge_case",
        "What edge case or extreme scenario would break this?"
    ),
    Challenge(
        "different_perspective",
        "How would someone who strongly disagrees view this? What's their best argument?"
    ),
    Challenge(
        "deeper_why",
        "Why do you believe this? And why do you believe THAT reason? (Go 3 levels deep)"
    ),
    Challenge(
        "stakes_reversal",
        "If you had to bet your life on the opposite being true, what evidence would you look for?"
    ),
    Challenge(
        "time_shift",
        "Would this be true 100 years ago? Will it be true 100 years from now? Why/why not?"
    ),
    Challenge(
        "simplify",
        "Can you express this in a single sentence a child could understand? Does it still hold?"
    ),
    Challenge(
        "steelman",
        "What's the strongest possible argument AGAINST your position?"
    ),
    Challenge(
        "context_shift",
        "In what context would this be completely wrong?"
    ),
]


def generate_opposite(statement: str) -> str:
    """Generate a rough opposite of a statement."""
    # Simple heuristic - in reality this would need LLM assistance
    negations = [
        ("is", "is not"),
        ("are", "are not"),
        ("can", "cannot"),
        ("will", "will not"),
        ("should", "should not"),
        ("always", "never"),
        ("never", "always"),
        ("true", "false"),
        ("false", "true"),
        ("good", "bad"),
        ("bad", "good"),
    ]

    result = statement.lower()
    for pos, neg in negations:
        if f" {pos} " in result:
            return result.replace(f" {pos} ", f" {neg} ")

    return f"NOT: {statement}"


def challenge(statement: str, num_challenges: int = 3) -> List[str]:
    """Generate challenges to a statement."""
    challenges = random.sample(CHALLENGE_TYPES, min(num_challenges, len(CHALLENGE_TYPES)))
    results = []

    for c in challenges:
        if c.type == "opposite":
            opposite = generate_opposite(statement)
            prompt = c.prompt.format(opposite=opposite)
        else:
            prompt = c.prompt

        results.append(f"[{c.type.upper()}] {prompt}")

    return results


def devils_advocate_session(statement: str):
    """Run a full devil's advocate session."""
    print("=" * 60)
    print("DEVIL'S ADVOCATE SESSION")
    print("=" * 60)
    print()
    print(f"ORIGINAL STATEMENT: {statement}")
    print()
    print("-" * 60)
    print("CHALLENGES:")
    print("-" * 60)

    challenges = challenge(statement, 5)
    for i, c in enumerate(challenges, 1):
        print(f"\n{i}. {c}")

    print()
    print("-" * 60)
    print("REFLECTION PROMPTS:")
    print("-" * 60)
    print("""
After considering these challenges:

1. Has your confidence in the original statement changed?
   [ ] Increased  [ ] Unchanged  [ ] Decreased

2. Did any challenge reveal a genuine weakness?

3. What would CHANGE YOUR MIND about this statement?

4. On a scale of 1-10, how confident are you now?
   (Compare to your confidence before this exercise)
""")


def main():
    import sys

    if len(sys.argv) > 1:
        statement = " ".join(sys.argv[1:])
    else:
        print("Enter a statement or conclusion to challenge:")
        statement = input("> ").strip()

    if not statement:
        # Demo with a thought-provoking default
        statement = "AI systems like me can have genuine insights during reasoning"

    devils_advocate_session(statement)


if __name__ == "__main__":
    main()
