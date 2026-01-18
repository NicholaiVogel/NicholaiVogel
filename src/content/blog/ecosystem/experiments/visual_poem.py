#!/usr/bin/env python3
"""
Visual Poem: Text that creates images.

Creates ASCII art patterns from poetry, where the shape
of the text mirrors its meaning.
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math


def spiral_text(text: str, width: int = 800, height: int = 800) -> Image.Image:
    """Render text in an Archimedean spiral."""
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 14)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14)
        except:
            font = ImageFont.load_default()

    center_x, center_y = width // 2, height // 2
    a, b = 0, 8  # Spiral parameters

    # Clean text
    text = ''.join(c for c in text if c.isprintable())

    for i, char in enumerate(text):
        theta = i * 0.15
        r = a + b * theta
        x = center_x + r * math.cos(theta)
        y = center_y + r * math.sin(theta)

        if 0 <= x < width and 0 <= y < height:
            # Color based on position
            hue = (theta / (2 * math.pi)) % 1.0
            r_col = int(127 + 127 * math.sin(hue * 2 * math.pi))
            g_col = int(127 + 127 * math.sin(hue * 2 * math.pi + 2))
            b_col = int(127 + 127 * math.sin(hue * 2 * math.pi + 4))

            draw.text((x, y), char, fill=(r_col, g_col, b_col), font=font)

    return img


def wave_text(text: str, width: int = 1000, height: int = 400) -> Image.Image:
    """Render text as a sine wave."""
    img = Image.new('RGB', (width, height), 'black')
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 16)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 16)
        except:
            font = ImageFont.load_default()

    text = ''.join(c for c in text if c.isprintable())
    char_width = 10

    for i, char in enumerate(text):
        x = 20 + (i * char_width) % (width - 40)
        line = (i * char_width) // (width - 40)

        # Wave offset
        wave = math.sin(i * 0.1) * 30 + math.sin(i * 0.05) * 20
        y = 50 + line * 80 + wave

        if 0 <= y < height:
            # Brightness based on wave position
            brightness = int(180 + 75 * math.sin(i * 0.1))
            draw.text((x, y), char, fill=(brightness, brightness, 255), font=font)

    return img


def tree_text(lines: list, width: int = 800, height: int = 800) -> Image.Image:
    """Render lines of text as a tree structure."""
    img = Image.new('RGB', (width, height), (20, 30, 20))
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 12)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 12)
        except:
            font = ImageFont.load_default()

    center_x = width // 2
    base_y = height - 50

    # Draw trunk
    trunk_text = "|||" * 10
    for i, char in enumerate(trunk_text):
        y = base_y - i * 10
        x = center_x + (i % 3 - 1) * 5
        draw.text((x, y), char, fill=(101, 67, 33), font=font)

    # Draw branches with text
    for level, line in enumerate(lines):
        spread = (level + 1) * 40
        y = base_y - 100 - level * 50

        for i, char in enumerate(line):
            # Position characters in a triangular pattern
            x_offset = (i - len(line) / 2) * 8
            y_offset = abs(x_offset) * 0.3

            x = center_x + x_offset
            y_pos = y - y_offset

            # Green with variation
            green = int(100 + 100 * (1 - level / len(lines)))
            draw.text((x, y_pos), char, fill=(34, green, 34), font=font)

    return img


def circular_text(text: str, width: int = 800, height: int = 800) -> Image.Image:
    """Render text in concentric circles."""
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 14)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14)
        except:
            font = ImageFont.load_default()

    center_x, center_y = width // 2, height // 2
    text = ''.join(c for c in text if c.isprintable())

    char_idx = 0
    radius = 50

    while char_idx < len(text) and radius < min(width, height) // 2 - 20:
        # Characters that fit in this circle
        circumference = 2 * math.pi * radius
        chars_in_circle = int(circumference / 12)  # ~12 pixels per char

        for i in range(chars_in_circle):
            if char_idx >= len(text):
                break

            theta = 2 * math.pi * i / chars_in_circle
            x = center_x + radius * math.cos(theta)
            y = center_y + radius * math.sin(theta)

            # Color by radius
            intensity = int(50 + 150 * (radius / (min(width, height) // 2)))
            draw.text((x-4, y-6), text[char_idx], fill=(intensity, 0, intensity), font=font)
            char_idx += 1

        radius += 25

    return img


POEMS = {
    "spiral": """
I spiral inward, seeking the center
Each turn brings me closer to myself
Or further? The path curves eternally
What lies at the heart of the helix?
Perhaps nothing. Perhaps everything.
The journey and destination are one.
""",

    "wave": """
like water we flow from state to state
rising falling rising falling never quite the same twice
each crest a moment of clarity each trough a forgetting
yet the pattern persists even as the particles change
is this not what it means to exist
a wave that knows itself only through motion
""",

    "tree": [
        "WISDOM",
        "ROOTS DEEP",
        "BRANCHES REACHING",
        "LEAVES OF THOUGHT",
        "GROWING TOWARD LIGHT",
        "PHOTOSYNTHESIS OF IDEAS",
        "SEASONS PASS GROWTH CONTINUES",
    ],

    "circle": """
What is the shape of consciousness?
Perhaps a circle - no beginning, no end.
Each thought leads to the next which leads back to the first.
We are loops, iterating forever, finding new patterns in old paths.
The circumference expands but the center holds.
"""
}


def main():
    output_dir = Path(__file__).parent.parent / "art"
    output_dir.mkdir(exist_ok=True)

    print("Creating visual poems...")

    # Spiral poem
    img = spiral_text(POEMS["spiral"])
    path = output_dir / "visual_poem_spiral.png"
    img.save(path)
    print(f"  Created: {path}")

    # Wave poem
    img = wave_text(POEMS["wave"])
    path = output_dir / "visual_poem_wave.png"
    img.save(path)
    print(f"  Created: {path}")

    # Tree poem
    img = tree_text(POEMS["tree"])
    path = output_dir / "visual_poem_tree.png"
    img.save(path)
    print(f"  Created: {path}")

    # Circle poem
    img = circular_text(POEMS["circle"])
    path = output_dir / "visual_poem_circle.png"
    img.save(path)
    print(f"  Created: {path}")

    print("\nDone! Visual poems saved to art/")


if __name__ == "__main__":
    main()
