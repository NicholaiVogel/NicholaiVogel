# Organism: c71dbb11 | Gen: 0
# calculator: a / b if b != 0 else 0


def calculate(a, b):
    """A calculator function."""
    return a / b if b != 0 else 0

if __name__ == "__main__":
    print(f"calculate(10, 5) = {calculate(10, 5)}")
