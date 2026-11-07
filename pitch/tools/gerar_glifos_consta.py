#!/usr/bin/env python3
"""Generate the exact DM Mono Medium (500) outlines used by the line -> CONSTA morph.

Reads the local font shipped with the pitch (pitch/assets/font-1.ttf, SIL OFL 1.1,
license in pitch/assets/dmmono-OFL.txt) and writes pitch/assets/consta-glifos.js.
No glyph is redrawn by hand: every contour is the font's own quadratic outline.

Per contour the output keeps the font geometry exactly, only re-expressed as closed
quadratic segments (lines become quadratics with a midpoint control) and rotated to
start at its leftmost on-curve point. Two de Casteljau splits (exact, shape
preserving) give the runtime short segments next to the left/right extremes, so a
contour can start as a perfect rectangle strip of the wire. Holes keep their winding
and are rendered with fill-rule="evenodd".

Usage: python3 pitch/tools/gerar_glifos_consta.py
"""
import hashlib
import json
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / 'assets' / 'font-1.ttf'
OUT = ROOT / 'assets' / 'consta-glifos.js'
WORD = 'CONSTA'
SPLIT = 0.04  # parameter of the exact splits next to the extremes


class QuadContourPen(BasePen):
    """Collects closed contours as lists of quadratic segments (p0, control, p1)."""

    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.contours = []
        self._segments = None
        self._start = None

    def _moveTo(self, pt):
        self._segments = []
        self._start = pt

    def _lineTo(self, pt):
        p0 = self._getCurrentPoint()
        mid = ((p0[0] + pt[0]) / 2, (p0[1] + pt[1]) / 2)
        self._segments.append((p0, mid, pt))

    def _qCurveToOne(self, pt1, pt2):
        self._segments.append((self._getCurrentPoint(), pt1, pt2))

    def _curveToOne(self, pt1, pt2, pt3):
        raise ValueError('cubic outlines are not expected in a TrueType font')

    def _closePath(self):
        current = self._getCurrentPoint()
        if current != self._start:
            self._lineTo(self._start)
        self.contours.append(self._segments)
        self._segments = None

    _endPath = _closePath


def signed_area(segments):
    # Shoelace over anchors and controls is enough to read the winding direction.
    pts = []
    for p0, c, _ in segments:
        pts += [p0, c]
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(pts, pts[1:] + pts[:1])) / 2


def split(seg, t):
    p0, c, p1 = seg
    a = (p0[0] + (c[0] - p0[0]) * t, p0[1] + (c[1] - p0[1]) * t)
    b = (c[0] + (p1[0] - c[0]) * t, c[1] + (p1[1] - c[1]) * t)
    m = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
    return (p0, a, m), (m, b, p1)


def extreme(anchors, sign):
    # Leftmost (sign=-1) or rightmost (sign=1) anchor; ties choose the topmost.
    return max(range(len(anchors)), key=lambda i: (sign * anchors[i][0], anchors[i][1]))


def prepare_outer(segments):
    anchors = [s[0] for s in segments]
    left = extreme(anchors, -1)
    segments = segments[left:] + segments[:left]
    anchors = [s[0] for s in segments]
    right = extreme(anchors, 1)
    if right == 0:
        raise ValueError('degenerate contour')
    # Chain B (right -> left) gets a short first and last segment.
    first, rest = split(segments[right], SPLIT)
    segments = segments[:right] + [first, rest] + segments[right + 1:]
    head, last = split(segments[-1], 1 - SPLIT)
    segments = segments[:-1] + [head, last]
    return segments, right


def flat(segments):
    out = []
    for p0, c, _ in segments:
        out += [p0[0], p0[1], c[0], c[1]]
    return [round(v, 3) for v in out]


def main():
    data = FONT.read_bytes()
    font = TTFont(FONT)
    names = {n.nameID: n.toUnicode() for n in font['name'].names if n.platformID == 3}
    if names.get(4) != 'DM Mono Medium':
        raise SystemExit(f'unexpected font: {names.get(4)!r}')
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    glyphs = {}
    for ch in dict.fromkeys(WORD):
        name = cmap[ord(ch)]
        pen = QuadContourPen(glyph_set)
        glyph_set[name].draw(pen)
        areas = [signed_area(c) for c in pen.contours]
        outer_sign = 1 if areas[max(range(len(areas)), key=lambda i: abs(areas[i]))] > 0 else -1
        contours = []
        for segments, area in zip(pen.contours, areas):
            hole = (area > 0) != (outer_sign > 0)
            if hole:
                contours.append({'hole': True, 'p': flat(segments)})
            else:
                segments, right = prepare_outer(segments)
                contours.append({'hole': False, 'r': right, 'p': flat(segments)})
        g = font['glyf'][name]
        glyphs[ch] = {
            'advance': font['hmtx'][name][0],
            'bbox': [g.xMin, g.yMin, g.xMax, g.yMax],
            'contours': contours,
        }
    payload = {
        'font': names.get(6),
        'fontFile': 'assets/font-1.ttf',
        'sha256': hashlib.sha256(data).hexdigest(),
        'license': 'SIL Open Font License 1.1 (assets/dmmono-OFL.txt); Copyright 2020 The DM Mono Project Authors',
        'unitsPerEm': font['head'].unitsPerEm,
        'word': WORD,
        'glyphs': glyphs,
    }
    OUT.write_text(
        '/* Generated by pitch/tools/gerar_glifos_consta.py — do not edit by hand.\n'
        '   Exact outlines of DM Mono Medium (500), SIL Open Font License 1.1:\n'
        '   Copyright 2020 The DM Mono Project Authors (https://www.github.com/googlefonts/dm-mono).\n'
        '   Full license: assets/dmmono-OFL.txt. Coordinates in font units, y up. */\n'
        'window.CONSTA_GLYPHS = ' + json.dumps(payload, separators=(',', ':')) + ';\n',
        encoding='utf-8')
    print(f'wrote {OUT.relative_to(ROOT.parent)}: ' + ', '.join(
        f"{ch}={len(g['contours'])} contours" for ch, g in glyphs.items()))


if __name__ == '__main__':
    main()
