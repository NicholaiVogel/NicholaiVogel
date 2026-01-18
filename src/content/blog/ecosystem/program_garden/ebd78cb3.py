# Organism: ebd78cb3 | Gen: 7 | Parent: e315f58d
# transformer: ' '.join(text.split()[::-1])


def transform(text):
    """Transform text."""
    return ' '.join(text.split()[::-1])

if __name__ == "__main__":
    print(transform("hello world"))
