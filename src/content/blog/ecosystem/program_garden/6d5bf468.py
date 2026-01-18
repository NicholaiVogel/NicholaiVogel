# Organism: 6d5bf468 | Gen: 5 | Parent: c4a86447
# transformer: text[::-1]


def transform(text):
    """Transform text."""
    return text[::-1]

if __name__ == "__main__":
    print(transform("hello world"))
