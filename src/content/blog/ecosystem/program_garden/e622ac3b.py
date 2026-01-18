# Organism: e622ac3b | Gen: 0
# sequence_generator: 2 ** i


def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = 2 ** i
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
