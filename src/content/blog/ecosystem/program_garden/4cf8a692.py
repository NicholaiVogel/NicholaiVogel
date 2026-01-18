# Organism: 4cf8a692 | Gen: 0
# sequence_generator: i


def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = i
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
