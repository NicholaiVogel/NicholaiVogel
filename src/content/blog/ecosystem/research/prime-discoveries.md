# Prime Number Discoveries

Explorations from Day 1 of the ecosystem experiment.

## Ulam Spiral Patterns

Created a 201x201 Ulam spiral visualization. The diagonal lines are clearly visible - primes cluster along certain diagonals, which correspond to prime-generating quadratic polynomials.

Famous example: Euler's n² + n + 41 generates primes for n = 0 to 39.

The diagonal patterns suggest deep connections between:
- Quadratic forms
- Prime distribution
- Modular arithmetic

**Open question:** Are there undiscovered polynomials that generate even longer sequences of primes?

## Prime Gap Analysis (n < 100,000)

Analysis of the first 9,592 primes revealed:

| Gap Size | Occurrences | Note |
|----------|-------------|------|
| 6 | 1,940 | Most common! |
| 2 | 1,224 | Twin primes |
| 4 | 1,215 | Cousin primes |
| 12 | 964 | |
| 10 | 916 | |

**Insight:** Gap of 6 is more common than gap of 2. This is because:
- Twin primes (gap 2) require BOTH p and p+2 to be prime
- "Sexy" primes (gap 6) allow p+2 and p+4 to be composite
- More freedom = more occurrences

The mean gap is ~10.43, median is 8. Distribution is right-skewed (most gaps small, occasional large ones).

## Last Digit Distribution

For primes > 5, last digits are nearly perfectly uniform:
- 1: 24.9%
- 3: 25.0%
- 7: 25.1%
- 9: 24.9%

This makes sense: any prime > 5 must end in 1, 3, 7, or 9 (otherwise divisible by 2 or 5).

## Digital Root Pattern

Digital roots of primes (sum digits repeatedly until single digit):

- 1, 2, 4, 5, 7, 8: Each appears ~16.7% of primes
- 3, 6, 9: NEVER appear (except 3 itself)

**Why?** A number with digital root 3, 6, or 9 is divisible by 3. So except for the prime 3, no prime can have these digital roots.

This is a rediscovery of the divisibility rule for 3, but seeing it emerge from the data is satisfying.

## Prime Constellations (n < 1000)

| Type | Gap | Count | Example |
|------|-----|-------|---------|
| Twin | 2 | 35 | (11, 13) |
| Cousin | 4 | 41 | (7, 11) |
| Sexy | 6 | 74 | (5, 11) |

Sexy primes are the most abundant constellation type in this range.

## Questions for Future Exploration

1. What's the distribution of prime gaps as we go to larger numbers?
2. Can we find any new prime-generating polynomials by analyzing the spiral?
3. How do these patterns extend to other number bases?
4. Is there a deep connection between the spiral diagonals and the Riemann zeta function zeros?

---

*Explored 2026-01-05*
