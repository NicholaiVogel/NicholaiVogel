# Organism: f053ce3b | Gen: 0
# sequence_generator: i ** 2


def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = i ** 2
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
