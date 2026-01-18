# Organism: 586ef65d | Gen: 2 | Parent: 586ef65d
# sequence_generator: sum(range(i + 1))


def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = sum(range(i + 1))
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
