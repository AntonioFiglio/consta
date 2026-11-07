"""Check declared envelopes, not an actual component or manufactured assembly."""
import json
from pathlib import Path


def contains_rounded(c, part):
    # Convex nominal cavity: each box vertex must be inside its rounded footprint.
    x, y, z = part['position']
    a, b, h = part['size']
    t = c['wall']
    r = c['corner_radius']
    if z < t or z + h > c['height'] - t:
        return False
    for vx in (x, x + a):
        for vy in (y, y + b):
            if not (t <= vx <= c['length'] - t and t <= vy <= c['width'] - t):
                return False
            cx = min(max(vx, r), c['length'] - r)
            cy = min(max(vy, r), c['width'] - r)
            if (vx - cx) ** 2 + (vy - cy) ** 2 > (r - t) ** 2:
                return False
    return True


def intersects(a, b):
    return all(a['position'][i] < b['position'][i] + b['size'][i] and
               b['position'][i] < a['position'][i] + a['size'][i] for i in range(3))


def check(data):
    battery, board = data['battery_reserved'], data['board_reserved']
    return {
        'battery_reserved_inside_nominal_cavity': contains_rounded(data['case'], battery),
        'board_reserved_inside_nominal_cavity': contains_rounded(data['case'], board),
        'reserved_components_do_not_intersect': not intersects(battery, board),
    }


if __name__ == '__main__':
    data = json.loads(Path(__file__).with_name('parametros.json').read_text())
    actual = check(data)
    assert all(actual.values()), actual
    collision = json.loads(json.dumps(data))
    collision['board_reserved']['position'] = [10, 10, 3.5]
    assert not check(collision)['reserved_components_do_not_intersect'], 'Collision control failed'
    protrusion = json.loads(json.dumps(data))
    protrusion['board_reserved']['position'] = [55, 10, 3.5]
    assert not check(protrusion)['board_reserved_inside_nominal_cavity'], 'Containment control failed'
    print(json.dumps({'declared_envelope_checks': actual,
                      'negative_controls_detected': ['collision', 'protrusion'],
                      'physical_fit': 'UNVERIFIED',
                      'cable_lid_and_rf': 'NOT_MODELLED'}, indent=2))
