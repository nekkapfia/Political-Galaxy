#!/usr/bin/env python3
"""
Cultural 1A Decoder
Decodes scores in format like 'D2S', 'DT4', 'L', 'C' etc. to numeric value (0-100).
Based on the foundation document bands and step logic from center.
"""

from typing import Dict, Tuple
import math

# Band definitions: letter -> (min, max)
BANDS: Dict[str, Tuple[int, int]] = {
    'C': (100, 100),
    'H': (96, 99),
    'Q': (95, 95),
    'M': (91, 94),
    'D': (81, 90),
    'A': (71, 80),
    'K': (61, 70),
    'E': (53, 60),
    'L': (48, 52),
    'I': (40, 47),
    'O': (30, 39),
    'F': (20, 29),
    'G': (10, 19),
    'B': (6, 9),
    'J': (5, 5),
    'N': (1, 4),
    'P': (0, 0),
}

def get_center(letter: str) -> float:
    """Calculate the mathematical center (midpoint) of the band."""
    if letter not in BANDS:
        raise ValueError(f"Unknown band letter: {letter}")
    low, high = BANDS[letter]
    return (low + high) / 2

def decode_score(code: str) -> float:
    """
    Decode a score code to its numeric value.
    
    Formats supported:
    - 'D' or 'D0' : center of band D (85.5)
    - 'D2S' : 2 steps Secular (lower) from center -> 84.0
    - 'DT4' : 4 steps Transcendent (higher) from center -> 89.0
    - 'L1T' etc.
    
    Steps move on integer scale:
    - From center, S direction: floor(center), floor(center)-1, ...
    - T direction: ceil(center), ceil(center)+1, ...
    """
    code = code.strip().upper()
    if not code:
        raise ValueError("Empty code")
    
    letter = code[0]
    if letter not in BANDS:
        raise ValueError(f"Unknown band letter '{letter}' in code '{code}'")
    
    rest = code[1:]
    
    if not rest:
        return get_center(letter)
    
    # Parse: support both D2S (num+dir) and DT4 (dir+num)
    steps = 0
    direction = None
    
    if len(rest) >= 1 and rest[0] in ('S', 'T'):
        direction = rest[0]
        num_part = rest[1:]
    elif len(rest) >= 1 and rest[-1] in ('S', 'T'):
        direction = rest[-1]
        num_part = rest[:-1]
    else:
        num_part = rest
        direction = None
    
    if num_part:
        try:
            steps = int(num_part)
        except ValueError:
            raise ValueError(f"Invalid number in code '{code}': '{num_part}' is not a valid integer")
    else:
        steps = 0
    
    if steps < 0:
        raise ValueError(f"Steps cannot be negative in '{code}'")
    
    if direction is None and steps > 0:
        raise ValueError(f"Direction S or T required when steps given (e.g. D4S, DT4), got '{code}'")
    
    center = get_center(letter)
    
    if steps == 0 or direction is None:
        return center
    
    if direction == 'S':
        base = math.floor(center)
        value = base - (steps - 1)
        return float(value)
    else:
        base = math.ceil(center)
        value = base + (steps - 1)
        return float(value)

def decode_with_clamp(code: str, clamp_to_band: bool = True) -> float:
    """Decode and optionally clamp to band's min-max."""
    value = decode_score(code)
    if not clamp_to_band:
        return value
    letter = code[0].upper()
    low, high = BANDS[letter]
    return max(low, min(high, value))

if __name__ == "__main__":
    tests = ['D2S', 'DT4', 'D', 'L', 'C', 'P', 'H3T', 'N2S', 'B1S', 'D10S']
    print("Cultural 1A Decoder Tests:")
    for t in tests:
        try:
            val = decode_score(t)
            clamped = decode_with_clamp(t)
            print(f"  {t}: {val} (clamped: {clamped})")
        except Exception as e:
            print(f"  {t}: ERROR {e}")