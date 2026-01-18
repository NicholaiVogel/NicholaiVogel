#!/usr/bin/env python3
"""
Evolution Lab: Evolving simple programs through genetic algorithms.

This experiment evolves mathematical expressions to fit target behaviors.
It's a simple form of genetic programming - letting programs breed and mutate.

The goal: See what emerges from random variation and selection.
"""

import random
import math
from dataclasses import dataclass
from typing import List, Callable, Optional
import copy


# The primitives our evolved programs can use
OPERATIONS = ['+', '-', '*', '/', 'sin', 'cos', 'abs', 'max', 'min']
CONSTANTS = [0, 1, 2, 0.5, math.pi, math.e]


@dataclass
class Node:
    """A node in the expression tree."""
    op: str  # Operation or 'const' or 'x'
    value: Optional[float] = None  # For constants
    left: Optional['Node'] = None
    right: Optional['Node'] = None

    def evaluate(self, x: float) -> float:
        """Evaluate this subtree with the given x value."""
        try:
            if self.op == 'x':
                return x
            elif self.op == 'const':
                return self.value
            elif self.op == '+':
                return self.left.evaluate(x) + self.right.evaluate(x)
            elif self.op == '-':
                return self.left.evaluate(x) - self.right.evaluate(x)
            elif self.op == '*':
                return self.left.evaluate(x) * self.right.evaluate(x)
            elif self.op == '/':
                r = self.right.evaluate(x)
                return self.left.evaluate(x) / r if abs(r) > 1e-10 else 0
            elif self.op == 'sin':
                return math.sin(self.left.evaluate(x))
            elif self.op == 'cos':
                return math.cos(self.left.evaluate(x))
            elif self.op == 'abs':
                return abs(self.left.evaluate(x))
            elif self.op == 'max':
                return max(self.left.evaluate(x), self.right.evaluate(x))
            elif self.op == 'min':
                return min(self.left.evaluate(x), self.right.evaluate(x))
            else:
                return 0
        except (ValueError, OverflowError, ZeroDivisionError):
            return 0

    def to_string(self) -> str:
        """Convert to readable string."""
        if self.op == 'x':
            return 'x'
        elif self.op == 'const':
            if self.value == math.pi:
                return 'pi'
            elif self.value == math.e:
                return 'e'
            else:
                return f'{self.value:.2f}'
        elif self.op in ['sin', 'cos', 'abs']:
            return f'{self.op}({self.left.to_string()})'
        elif self.op in ['max', 'min']:
            return f'{self.op}({self.left.to_string()}, {self.right.to_string()})'
        else:
            return f'({self.left.to_string()} {self.op} {self.right.to_string()})'

    def depth(self) -> int:
        """Get tree depth."""
        if self.left is None and self.right is None:
            return 1
        left_d = self.left.depth() if self.left else 0
        right_d = self.right.depth() if self.right else 0
        return 1 + max(left_d, right_d)

    def size(self) -> int:
        """Get number of nodes."""
        count = 1
        if self.left:
            count += self.left.size()
        if self.right:
            count += self.right.size()
        return count


def random_tree(max_depth: int = 4) -> Node:
    """Generate a random expression tree."""
    if max_depth <= 1 or random.random() < 0.3:
        # Leaf node
        if random.random() < 0.5:
            return Node('x')
        else:
            return Node('const', value=random.choice(CONSTANTS))
    else:
        op = random.choice(OPERATIONS)
        if op in ['sin', 'cos', 'abs']:
            return Node(op, left=random_tree(max_depth - 1))
        else:
            return Node(op,
                       left=random_tree(max_depth - 1),
                       right=random_tree(max_depth - 1))


def crossover(parent1: Node, parent2: Node) -> Node:
    """Combine two trees via crossover."""
    child = copy.deepcopy(parent1)

    # Find random subtree in child to replace
    def get_all_nodes(node, path=[]):
        result = [(node, path)]
        if node.left:
            result.extend(get_all_nodes(node.left, path + ['left']))
        if node.right:
            result.extend(get_all_nodes(node.right, path + ['right']))
        return result

    child_nodes = get_all_nodes(child)
    parent2_nodes = get_all_nodes(parent2)

    if len(child_nodes) > 1 and parent2_nodes:
        # Pick a node to replace (not root)
        _, replace_path = random.choice(child_nodes[1:])
        # Pick a subtree from parent2
        donor, _ = random.choice(parent2_nodes)

        # Navigate to replacement point and replace
        current = child
        for step in replace_path[:-1]:
            current = getattr(current, step)
        setattr(current, replace_path[-1], copy.deepcopy(donor))

    return child


def mutate(node: Node, rate: float = 0.1) -> Node:
    """Randomly mutate parts of the tree."""
    node = copy.deepcopy(node)

    def mutate_recursive(n: Node):
        if random.random() < rate:
            # Replace this subtree with a new random one
            new = random_tree(2)
            n.op = new.op
            n.value = new.value
            n.left = new.left
            n.right = new.right
        else:
            if n.left:
                mutate_recursive(n.left)
            if n.right:
                mutate_recursive(n.right)

    mutate_recursive(node)
    return node


class Population:
    """A population of evolving programs."""

    def __init__(self, size: int = 50, target_func: Callable = None):
        self.size = size
        self.individuals = [random_tree() for _ in range(size)]
        self.target_func = target_func or (lambda x: x * x)
        self.generation = 0
        self.best_fitness_history = []

    def fitness(self, individual: Node) -> float:
        """Evaluate how well an individual matches the target."""
        error = 0
        test_points = [x / 10.0 for x in range(-50, 51)]

        for x in test_points:
            try:
                predicted = individual.evaluate(x)
                expected = self.target_func(x)
                error += (predicted - expected) ** 2
            except:
                error += 1000

        # Penalize complexity slightly
        complexity_penalty = individual.size() * 0.01

        return 1.0 / (1.0 + error + complexity_penalty)

    def evolve(self, generations: int = 100, verbose: bool = True):
        """Run evolution for specified generations."""
        for gen in range(generations):
            # Evaluate fitness
            scored = [(self.fitness(ind), ind) for ind in self.individuals]
            scored.sort(key=lambda x: -x[0])  # Best first

            best_fitness = scored[0][0]
            self.best_fitness_history.append(best_fitness)

            if verbose and gen % 10 == 0:
                print(f"Gen {gen:4d}: Best fitness = {best_fitness:.6f}")
                print(f"         Best expr: {scored[0][1].to_string()}")

            # Selection (tournament)
            def tournament(k=3):
                contestants = random.sample(scored, k)
                return max(contestants, key=lambda x: x[0])[1]

            # Create new population
            new_pop = []

            # Elitism: keep best 2
            new_pop.append(copy.deepcopy(scored[0][1]))
            new_pop.append(copy.deepcopy(scored[1][1]))

            while len(new_pop) < self.size:
                if random.random() < 0.8:
                    # Crossover
                    p1 = tournament()
                    p2 = tournament()
                    child = crossover(p1, p2)
                else:
                    # Mutation only
                    child = mutate(tournament(), rate=0.2)

                # Always apply some mutation
                child = mutate(child, rate=0.05)

                # Limit tree depth
                if child.depth() <= 8:
                    new_pop.append(child)

            self.individuals = new_pop
            self.generation += 1

        return scored[0][1]  # Return best individual


def run_experiment(name: str, target_func: Callable, description: str):
    """Run an evolution experiment."""
    print("=" * 60)
    print(f"EXPERIMENT: {name}")
    print(f"Target: {description}")
    print("=" * 60)

    pop = Population(size=100, target_func=target_func)
    best = pop.evolve(generations=100, verbose=True)

    print()
    print("FINAL RESULT:")
    print(f"  Expression: {best.to_string()}")
    print(f"  Fitness: {pop.fitness(best):.6f}")

    # Test on some values
    print("\n  Sample outputs:")
    for x in [-2, -1, 0, 1, 2]:
        expected = target_func(x)
        predicted = best.evaluate(x)
        print(f"    f({x:2d}) = {predicted:8.4f}  (expected: {expected:8.4f})")

    return best, pop


def main():
    print("EVOLUTION LAB: Evolving Mathematical Expressions")
    print()

    # Experiment 1: Evolve x^2
    run_experiment(
        "Square Function",
        lambda x: x * x,
        "f(x) = x^2"
    )

    print("\n" + "=" * 60 + "\n")

    # Experiment 2: Evolve something more complex
    run_experiment(
        "Sine Wave",
        lambda x: math.sin(x),
        "f(x) = sin(x)"
    )

    print("\n" + "=" * 60 + "\n")

    # Experiment 3: A weird target - let's see what evolves
    run_experiment(
        "Mystery Function",
        lambda x: abs(x) - x*x/10 + math.sin(x*2),
        "f(x) = |x| - x^2/10 + sin(2x)"
    )


if __name__ == "__main__":
    main()
