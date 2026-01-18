# Organism: 4c3f529c | Gen: 1 | Parent: f2ab06e0
# sequence_generator: i ** 3


def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = i ** 3
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
