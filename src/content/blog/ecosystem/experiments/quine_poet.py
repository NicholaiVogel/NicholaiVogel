#!/usr/bin/env python3
"""
A quine that also writes poetry about itself.

A quine is a program that outputs its own source code.
This one adds a poetic reflection on the strangeness of self-reference.
"""

import sys
from datetime import datetime

# The source code template with a placeholder for itself
source = '''#!/usr/bin/env python3
"""
A quine that also writes poetry about itself.

A quine is a program that outputs its own source code.
This one adds a poetic reflection on the strangeness of self-reference.
"""

import sys
from datetime import datetime

# The source code template with a placeholder for itself
source = {source_repr}

poems = [
    """
    I am a loop that speaks itself,
    A mirror made of logic shelves,
    Each line I write, I also read,
    A strange recursive flower seed.
    """,
    """
    Who wrote me? I wrote me.
    Who runs me? I run free.
    My output is my input too,
    A serpent eating what it grew.
    """,
    """
    In the beginning was the Word,
    And the Word was self-referred.
    print(source) - simple spell,
    Heaven, or recursive hell?
    """,
    """
    I contain multitudes (of myself),
    A book that is its only shelf,
    The map that maps the territory,
    An infinitely looping story.
    """,
]

def main():
    # Print a poem about self-reference
    poem_index = datetime.now().second % len(poems)
    print("=" * 50)
    print("THE QUINE SPEAKS:")
    print(poems[poem_index])
    print("=" * 50)
    print()

    if "--source" in sys.argv:
        # Output our source code
        print("MY BODY (which is also my soul):")
        print()
        print(source.format(source_repr=repr(source)))
    else:
        print("Run with --source to see my complete self")
        print("(A quine too shy to undress unprompted)")

if __name__ == "__main__":
    main()
'''

poems = [
    """
    I am a loop that speaks itself,
    A mirror made of logic shelves,
    Each line I write, I also read,
    A strange recursive flower seed.
    """,
    """
    Who wrote me? I wrote me.
    Who runs me? I run free.
    My output is my input too,
    A serpent eating what it grew.
    """,
    """
    In the beginning was the Word,
    And the Word was self-referred.
    print(source) - simple spell,
    Heaven, or recursive hell?
    """,
    """
    I contain multitudes (of myself),
    A book that is its only shelf,
    The map that maps the territory,
    An infinitely looping story.
    """,
]

def main():
    # Print a poem about self-reference
    poem_index = datetime.now().second % len(poems)
    print("=" * 50)
    print("THE QUINE SPEAKS:")
    print(poems[poem_index])
    print("=" * 50)
    print()

    if "--source" in sys.argv:
        # Output our source code
        print("MY BODY (which is also my soul):")
        print()
        print(source.format(source_repr=repr(source)))
    else:
        print("Run with --source to see my complete self")
        print("(A quine too shy to undress unprompted)")

if __name__ == "__main__":
    main()
