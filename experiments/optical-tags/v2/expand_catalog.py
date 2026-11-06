"""Extend the issued optical family with bounded, reproducible rejection sampling.

Preserves every issued ID and word. No codeword separation is relaxed. The
independent final audit compares each canonical word with every rotation and
reflection of every other word, plus its own nonidentity transforms. Group
invariance makes these comparisons sufficient for the complete dihedral orbits.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import platform
import random
import time
from pathlib import Path

import numpy as np

BITS = 24
MASK = (1 << BITS) - 1
SEPARATION = 6
MAX_ERRORS = 1
DEFAULT_SEED = 202611061
DEFAULT_BUDGET = 150_000
DEFAULT_TARGET = 256


def rotations(word: int) -> list[int]:
    return [((word << shift) | (word >> (BITS - shift))) & MASK
            for shift in range(BITS)]


def transforms(word: int) -> list[int]:
    reflected = int(f'{word:0{BITS}b}'[::-1], 2)
    return rotations(word) + rotations(reflected)


def popcounts(values: np.ndarray) -> np.ndarray:
    """Parallel population count for uint32 arrays (portable NumPy SWAR)."""
    values = values - ((values >> 1) & np.uint32(0x55555555))
    values = (values & np.uint32(0x33333333)) + ((values >> 2) & np.uint32(0x33333333))
    values = (values + (values >> 4)) & np.uint32(0x0F0F0F0F)
    return ((values * np.uint32(0x01010101)) >> 24).astype(np.uint8)


def audit(words: list[int]) -> dict:
    """Exhaustive orbit audit using Python integer bit_count, not generation SWAR."""
    pair_min = BITS + 1
    self_min = BITS + 1
    witness = None
    for index, word in enumerate(words):
        self_distance = min((word ^ other).bit_count() for other in transforms(word)[1:])
        self_min = min(self_min, self_distance)
        for other_index in range(index):
            orbit_distance = min((word ^ other).bit_count() for other in transforms(words[other_index]))
            if orbit_distance < pair_min:
                pair_min = orbit_distance
                witness = [index + 1, other_index + 1]
    pair_min = None if len(words) < 2 else pair_min
    passed = (len(words) == len(set(words)) and self_min >= SEPARATION
              and (pair_min is None or pair_min >= SEPARATION))
    return {
        'passed': passed,
        'method': 'exhaustive Python int.bit_count over all unordered word pairs and all cyclic/reflected transforms; all nonidentity self transforms',
        'actual_minimum_pair_orbit_distance': pair_min,
        'actual_minimum_self_transform_distance': self_min,
        'minimum_pair_witness_ids': None if witness is None else [f'CONSTA-{i:04d}' for i in witness],
        'canonical_words_unique': len(words) == len(set(words)),
    }


def build(source: Path, target: int, budget: int, seed: int) -> dict:
    payload = source.read_bytes()
    original = json.loads(payload)
    assert original['bits'] == BITS
    assert original['minimum_separation_target'] == SEPARATION
    assert original['maximum_accepted_bit_errors'] == MAX_ERRORS
    original_tags = original['tags']
    words = [int(tag['word'], 2) for tag in original_tags]
    if target < len(words):
        raise ValueError('Target cannot discard issued identities')
    if [tag['tag_id'] for tag in original_tags] != [f'CONSTA-{i+1:04d}' for i in range(len(words))]:
        raise ValueError('Source must preserve the current sequential identity convention')
    initial_audit = audit(words)
    if not initial_audit['passed']:
        raise ValueError('Source codebook fails separation audit')
    forbidden = np.empty(target * BITS * 2, dtype=np.uint32)
    used = 0
    for word in words:
        orbit = transforms(word)
        forbidden[used:used+len(orbit)] = orbit
        used += len(orbit)
    rng = random.Random(seed)
    attempts = 0
    started = time.perf_counter()
    while len(words) < target and attempts < budget:
        attempts += 1
        word = rng.randrange(1 << BITS)
        if not 8 <= word.bit_count() <= 16:
            continue
        orbit = transforms(word)
        if min((word ^ other).bit_count() for other in orbit[1:]) < SEPARATION:
            continue
        if np.any(popcounts(forbidden[:used] ^ np.uint32(word)) < SEPARATION):
            continue
        words.append(word)
        forbidden[used:used+len(orbit)] = orbit
        used += len(orbit)
    elapsed = time.perf_counter() - started
    tags = original_tags + [
        {'tag_id': f'CONSTA-{i+1:04d}', 'word': f'{word:0{BITS}b}'}
        for i, word in enumerate(words) if i >= len(original_tags)
    ]
    audited = audit(words)
    assert tags[:len(original_tags)] == original_tags
    if not audited['passed']:
        raise RuntimeError('Generated dictionary failed independent final audit')
    return {
        'experimental': True,
        'bits': BITS,
        'minimum_separation_target': SEPARATION,
        'maximum_accepted_bit_errors': MAX_ERRORS,
        'tags': tags,
        'generation': {
            'status': 'target_reached' if len(words) == target else 'attempt_budget_exhausted',
            'seed': seed,
            'attempt_budget': budget,
            'attempts_used': attempts,
            'target_count': target,
            'actual_count': len(words),
            'issued_source_count': len(original_tags),
            'issued_ids_and_words_preserved': True,
            'source_sha256': hashlib.sha256(payload).hexdigest(),
            'generation_elapsed_seconds_measured': elapsed,
            'elapsed_clock': 'time.perf_counter; generation loop only; excludes audits',
            'python_version': platform.python_version(),
            'numpy_version': np.__version__,
            'separation_relaxed': False,
        },
        'audit': audited,
        'limits': 'Discrete dictionary audit only. Does not establish pixel detection, physical range, false-positive probability, clinical safety, or maximum achievable dictionary size.',
    }


def main() -> None:
    base = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=base.parent/'codebook.json')
    parser.add_argument('--output', type=Path, default=base/'catalog256.json')
    parser.add_argument('--target', type=int, default=DEFAULT_TARGET)
    parser.add_argument('--budget', type=int, default=DEFAULT_BUDGET)
    parser.add_argument('--seed', type=int, default=DEFAULT_SEED)
    args = parser.parse_args()
    if args.budget < 0 or args.target < 2:
        parser.error('Budget must be nonnegative and target at least two')
    result = build(args.source, args.target, args.budget, args.seed)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'generation': result['generation'], 'audit': result['audit']}, indent=2))


if __name__ == '__main__':
    main()
