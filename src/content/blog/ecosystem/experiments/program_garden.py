#!/usr/bin/env python3
"""
Program Garden: Programs that grow other programs.

This is a self-extending system where programs can spawn variations
of themselves. A computational garden where code reproduces and evolves.
"""

import random
import hashlib
import json
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Optional


@dataclass
class CodeOrganism:
    """A program that can reproduce and mutate."""
    id: str
    code: str
    generation: int
    parent_id: Optional[str]
    created_at: str
    fitness: float = 0.0
    description: str = ""

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, d):
        return cls(**d)


# Templates for different types of programs
PROGRAM_TEMPLATES = {
    "calculator": '''
def calculate(a, b):
    """A calculator function."""
    return {operation}

if __name__ == "__main__":
    print(f"calculate(10, 5) = {{calculate(10, 5)}}")
''',

    "sequence_generator": '''
def sequence(n):
    """Generate a number sequence."""
    result = []
    for i in range(n):
        value = {sequence_logic}
        result.append(value)
    return result

if __name__ == "__main__":
    print(sequence(10))
''',

    "transformer": '''
def transform(text):
    """Transform text."""
    return {transform_logic}

if __name__ == "__main__":
    print(transform("hello world"))
''',
}

MUTATIONS = {
    "calculator": [
        "a + b", "a - b", "a * b",
        "a / b if b != 0 else 0", "a ** 2 + b",
        "abs(a - b)", "max(a, b)", "min(a, b)",
    ],
    "sequence_generator": [
        "i", "i * 2", "i ** 2", "i ** 3",
        "2 ** i", "sum(range(i + 1))",
    ],
    "transformer": [
        "text.upper()", "text.lower()", "text[::-1]",
        "' '.join(text.split()[::-1])",
        "text.replace(' ', '_')",
    ],
}


def generate_id(code: str) -> str:
    return hashlib.md5(code.encode()).hexdigest()[:8]


def create_organism(template_type: str, mutation_idx: Optional[int] = None) -> CodeOrganism:
    template = PROGRAM_TEMPLATES[template_type]
    mutations = MUTATIONS[template_type]

    if mutation_idx is None:
        mutation_idx = random.randint(0, len(mutations) - 1)
    mutation = mutations[mutation_idx]

    if template_type == "calculator":
        code = template.format(operation=mutation)
    elif template_type == "sequence_generator":
        code = template.format(sequence_logic=mutation)
    else:
        code = template.format(transform_logic=mutation)

    return CodeOrganism(
        id=generate_id(code),
        code=code,
        generation=0,
        parent_id=None,
        created_at=datetime.now().isoformat(),
        description=f"{template_type}: {mutation}"
    )


def mutate_organism(parent: CodeOrganism) -> CodeOrganism:
    if "calculate" in parent.code:
        template_type = "calculator"
    elif "sequence" in parent.code:
        template_type = "sequence_generator"
    else:
        template_type = "transformer"

    child = create_organism(template_type)
    child.generation = parent.generation + 1
    child.parent_id = parent.id
    return child


def evaluate_organism(organism: CodeOrganism) -> float:
    try:
        local_vars = {}
        exec(organism.code, {"__builtins__": __builtins__}, local_vars)
        return 0.5 + random.random() * 0.4
    except:
        return 0.1


class ProgramGarden:
    def __init__(self, garden_dir: Path):
        self.garden_dir = Path(garden_dir)
        self.garden_dir.mkdir(exist_ok=True)
        self.organisms: List[CodeOrganism] = []
        self.generation = 0
        self.load_garden()

    def load_garden(self):
        manifest_path = self.garden_dir / "manifest.json"
        if manifest_path.exists():
            with open(manifest_path) as f:
                data = json.load(f)
                self.organisms = [CodeOrganism.from_dict(o) for o in data["organisms"]]
                self.generation = data.get("generation", 0)

    def save_garden(self):
        manifest = {
            "generation": self.generation,
            "organisms": [o.to_dict() for o in self.organisms],
            "last_updated": datetime.now().isoformat()
        }
        with open(self.garden_dir / "manifest.json", "w") as f:
            json.dump(manifest, f, indent=2)

    def plant_seed(self, template_type: str = None) -> CodeOrganism:
        if template_type is None:
            template_type = random.choice(list(PROGRAM_TEMPLATES.keys()))

        organism = create_organism(template_type)
        organism.fitness = evaluate_organism(organism)
        self.organisms.append(organism)

        code_path = self.garden_dir / f"{organism.id}.py"
        with open(code_path, "w") as f:
            f.write(f'# Organism: {organism.id} | Gen: {organism.generation}\n')
            f.write(f'# {organism.description}\n\n')
            f.write(organism.code)

        return organism

    def grow(self, iterations: int = 1):
        for _ in range(iterations):
            self.generation += 1

            if not self.organisms:
                self.plant_seed()
                continue

            parents = random.sample(self.organisms, min(3, len(self.organisms)))
            best_parent = max(parents, key=lambda o: o.fitness)

            child = mutate_organism(best_parent)
            child.fitness = evaluate_organism(child)
            self.organisms.append(child)

            code_path = self.garden_dir / f"{child.id}.py"
            with open(code_path, "w") as f:
                f.write(f'# Organism: {child.id} | Gen: {child.generation} | Parent: {child.parent_id}\n')
                f.write(f'# {child.description}\n\n')
                f.write(child.code)

            if random.random() < 0.2:
                self.plant_seed()

        self.save_garden()

    def status(self):
        print(f"\n{'='*50}")
        print(f"PROGRAM GARDEN")
        print(f"{'='*50}")
        print(f"Location: {self.garden_dir}")
        print(f"Generation: {self.generation}")
        print(f"Organisms: {len(self.organisms)}")

        if self.organisms:
            avg_fitness = sum(o.fitness for o in self.organisms) / len(self.organisms)
            best = max(self.organisms, key=lambda o: o.fitness)
            print(f"Avg fitness: {avg_fitness:.3f}")
            print(f"Best: {best.id} ({best.fitness:.3f})")

            gen_counts = {}
            for o in self.organisms:
                gen_counts[o.generation] = gen_counts.get(o.generation, 0) + 1

            print(f"\nBy generation:")
            for gen in sorted(gen_counts.keys())[:10]:
                print(f"  Gen {gen:2d}: {'#' * gen_counts[gen]} ({gen_counts[gen]})")


def main():
    import sys
    garden_path = Path(__file__).parent.parent / "program_garden"
    garden = ProgramGarden(garden_path)

    if len(sys.argv) < 2:
        garden.status()
        print("\nGrowing...")
        garden.grow(5)
        garden.status()
    elif sys.argv[1] == "grow":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        garden.grow(n)
        garden.status()
    else:
        garden.status()


if __name__ == "__main__":
    main()
