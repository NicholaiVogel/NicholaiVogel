# Organism: e42c9598 | Gen: 7 | Parent: e42c9598
# transformer: text.replace(' ', '_')


def transform(text):
    """Transform text."""
    return text.replace(' ', '_')

if __name__ == "__main__":
    print(transform("hello world"))
