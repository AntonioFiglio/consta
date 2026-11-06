"""Build a new, bounded 32-sector identity family for synthetic Consta research.

Version 2 retains asset identity keys, not version-1 optical words. It is not
bit-compatible with the original 24-sector marker. No hardware is deployed.
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

BITS = 32
MASK = (1 << BITS) - 1
SEPARATION = 6
MAX_ERRORS = 1
SEED = 202611062
TARGET = 1024
BUDGET = 2_000_000


def rotations(word: int) -> list[int]:
    return [((word << shift) | (word >> (BITS - shift))) & MASK
            for shift in range(BITS)]


def transforms(word: int) -> list[int]:
    return rotations(word) + rotations(int(f'{word:0{BITS}b}'[::-1], 2))


def population_counts(values: np.ndarray) -> np.ndarray:
    values = values - ((values >> 1) & np.uint32(0x55555555))
    values = (values & np.uint32(0x33333333)) + ((values >> 2) & np.uint32(0x33333333))
    values = (values + (values >> 4)) & np.uint32(0x0F0F0F0F)
    return ((values * np.uint32(0x01010101)) >> 24).astype(np.uint8)


def audit_independently(words: list[int]) -> dict:
    """Full audit uses Python integers, independent of the NumPy acceptance path."""
    started = time.perf_counter()
    orbits = [transforms(word) for word in words]
    self_minimum = BITS + 1
    pair_minimum = BITS + 1
    witness = None
    checked_pairs = 0
    for index, word in enumerate(words):
        self_minimum = min(self_minimum, min((word ^ other).bit_count()
                                           for other in orbits[index][1:]))
        for other_index in range(index):
            checked_pairs += 1
            distance = min((word ^ other).bit_count() for other in orbits[other_index])
            if distance < pair_minimum:
                pair_minimum = distance
                witness = [f'CONSTA-{index+1:04d}', f'CONSTA-{other_index+1:04d}']
    unique = len(words) == len(set(words))
    pair_minimum = pair_minimum if len(words) > 1 else None
    passed = (unique and self_minimum >= SEPARATION
              and (pair_minimum is None or pair_minimum >= SEPARATION))
    return {
        'passed': passed,
        'method': 'Python int.bit_count; every unordered pair against every cyclic/reflected transform; all nonidentity self transforms. Hamming invariance covers complete transform orbits.',
        'canonical_words_unique': unique,
        'unordered_pairs_checked': checked_pairs,
        'actual_minimum_pair_orbit_distance': pair_minimum,
        'actual_minimum_self_transform_distance': self_minimum,
        'minimum_pair_witness_ids': witness,
        'audit_elapsed_seconds_measured': time.perf_counter() - started,
        'elapsed_clock': 'time.perf_counter',
    }


def generate(source: Path, target: int, budget: int, seed: int) -> dict:
    original_bytes = source.read_bytes()
    original_tags = json.loads(original_bytes)['tags']
    previous_keys = [item['tag_id'] for item in original_tags]
    expected_keys = [f'CONSTA-{index+1:04d}' for index in range(len(previous_keys))]
    if previous_keys != expected_keys or target < len(previous_keys):
        raise ValueError('Target must retain every existing sequential asset identity key')
    words = []
    forbidden = np.empty(target * BITS * 2, dtype=np.uint32)
    used = 0
    attempts = 0
    rng = random.Random(seed)
    started = time.perf_counter()
    while len(words) < target and attempts < budget:
        attempts += 1
        word = rng.getrandbits(BITS)
        if not 10 <= word.bit_count() <= 22:
            continue
        orbit = transforms(word)
        if min((word ^ other).bit_count() for other in orbit[1:]) < SEPARATION:
            continue
        if used and np.any(population_counts(forbidden[:used] ^ np.uint32(word)) < SEPARATION):
            continue
        words.append(word)
        forbidden[used:used+len(orbit)] = orbit
        used += len(orbit)
    generation_elapsed = time.perf_counter() - started
    final_audit = audit_independently(words)
    if words and not final_audit['passed']:
        raise RuntimeError('Independent dictionary audit failed; refusing to publish')
    tags = [{'tag_id': f'CONSTA-{index+1:04d}', 'word': f'{word:0{BITS}b}'}
            for index, word in enumerate(words)]
    keys_preserved = [tag['tag_id'] for tag in tags[:len(previous_keys)]] == previous_keys
    return {
        'experimental': True,
        'schema_version': 2,
        'marker_layout_version': 'consta-circular-sectors-v2-32',
        'bit_compatible_with_v1': False,
        'migration': 'Asset tag_id keys are retained; every optical word is newly assigned. Version-1 printed markers cannot be decoded using this dictionary. No deployed physical tags are claimed.',
        'bits': BITS,
        'minimum_separation_target': SEPARATION,
        'maximum_accepted_bit_errors': MAX_ERRORS,
        'tags': tags,
        'generation': {
            'status': 'target_reached' if len(words) == target else 'attempt_budget_exhausted',
            'target_count': target,
            'actual_count': len(words),
            'attempt_budget': budget,
            'attempts_used': attempts,
            'seed': seed,
            'source_asset_keys_sha256': hashlib.sha256(original_bytes).hexdigest(),
            'source_asset_key_count': len(previous_keys),
            'source_asset_keys_retained': keys_preserved,
            'v1_optical_words_retained': False,
            'separation_relaxed': False,
            'generation_elapsed_seconds_measured': generation_elapsed,
            'elapsed_clock': 'time.perf_counter; generation loop only, excluding independent audit',
            'python_version': platform.python_version(),
            'numpy_version': np.__version__,
            'generator': 'bounded seeded random greedy rejection; vector SWAR acceptance; balanced-word constraint 10..22 one-bits',
        },
        'audit': final_audit,
        'limits': 'Discrete dictionary construction only. Not maximum capacity, pixel-detection evidence, field performance, clinical safety or physical camera validation. More sectors require separate resolution/perspective tests.',
    }


def main() -> None:
    base = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=base.parent/'codebook.json')
    parser.add_argument('--output', type=Path, default=base/'catalog32.json')
    parser.add_argument('--target', type=int, default=TARGET)
    parser.add_argument('--budget', type=int, default=BUDGET)
    parser.add_argument('--seed', type=int, default=SEED)
    args = parser.parse_args()
    if args.target < 2 or args.budget < 0:
        parser.error('Target must be at least two and budget must be nonnegative')
    result = generate(args.source, args.target, args.budget, args.seed)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'generation': result['generation'], 'audit': result['audit']}, indent=2))


if __name__ == '__main__':
    main()
