/* CONSTA — controle do pitch contínuo.
   Estado declarativo: render(beat) é idempotente. Avançar, voltar e saltar chegam
   ao mesmo estado; as transições CSS retomam a partir do valor atual se interrompidas.
   A demo avança suas etapas automaticamente; a caneta pode antecipar cada passagem. */
(function () {
  'use strict';

  var SCENES = ['cover', 'news', 'cost', 'gap', 'solution', 'benefits', 'team', 'cta', 'business'];
  var SCENE_LABEL = {
    cover: 'Capa', news: 'Notícias', cost: 'Consequência', gap: 'Lacuna',
    solution: 'Consta', benefits: 'Frentes', team: 'Equipe', cta: 'CTA', business: 'Negócio'
  };

  // layer: camada visual. dot: âncora do ponto, que persiste em todos os beats como guia.
  // line: o fio só existe quando liga duas coisas de fato relacionadas; null = sem fio.
  // Geometria sempre medida no layout atual, nunca por coordenada fixa:
  //   {link:id}       da borda direita de uma caixa até o ponto, na altura do ponto
  //   {linkRight:id}  do ponto até a borda esquerda de uma caixa à direita, na altura do ponto
  var BEATS = [
    { scene: 'cover', layer: 'cover', dot: 'a-cover', line: null, tone: 'org', theme: 'light' },
    { scene: 'news',     layer: 'news',     dot: 'a-news',  line: null, tone: 'ver' },
    { scene: 'news',     layer: 'news',     dot: 'a-news',  line: null, tone: 'ver' },
    { scene: 'cost',     layer: 'cost',     dot: 'a-cost',  line: null, tone: 'ver' },
    { scene: 'cost',     layer: 'cost',     dot: 'a-chain', line: null, tone: 'ver' },
    { scene: 'gap',      layer: 'gap',      dot: 'a-gap',   line: null, tone: 'ver' },
    { scene: 'gap',      layer: 'gap',      dot: 'a-gap2',  line: null, tone: 'ver' },
    { scene: 'solution', layer: 'brand',    dot: 'a-brand', line: null, tone: 'org', morph: 't-brand' },
    // documento → IA
    { scene: 'solution', layer: 'crm',      dot: 'a-read',  line: null, tone: 'org' },
    // documento → tabela
    { scene: 'solution', layer: 'crm',      dot: 'a-table', line: null, tone: 'org' },
    { scene: 'solution', layer: 'crm',      dot: 'a-inv',   line: null, tone: 'org' },
    { scene: 'solution', layer: 'smart-agenda', dot: 'a-smart-agenda', line: null, tone: 'org' },
    { scene: 'solution', layer: 'camera', dot: 'a-photo', line: null, tone: 'org' },
    // tag instalada → vista isolada do conceito
    { scene: 'solution', layer: 'tag',      dot: 'a-tag',   line: { linkRight: 'tg-figure' }, tone: 'org' },
    { scene: 'solution', layer: 'map',      dot: 'a-map',   line: null, tone: 'org', map: 'A', hideDot: true },
    { scene: 'solution', layer: 'map',      dot: 'a-map',   line: null, tone: 'org', map: 'C', hideDot: true },
    { scene: 'solution', layer: 'benefits', dot: 'a-ben',   line: null, tone: 'org' },
    { scene: 'solution', layer: 'benefits', dot: 'a-ben2',  line: null, tone: 'org' },
    { scene: 'benefits', layer: 'care-impact', dot: 'a-care', line: null, tone: 'org', theme: 'dark' },
    { scene: 'benefits', layer: 'impact', dot: 'a-impact', line: null, tone: 'org' },
    { scene: 'team',     layer: 'team',     dot: 'a-team',  line: null, tone: 'org' },
    { scene: 'cta', layer: 'cta', dot: 'a-cta', line: null, tone: 'org', theme: 'light' },
    { scene: 'business', layer: 'business', dot: 'a-business', line: null, tone: 'org', theme: 'light' }
  ];
  var TOTAL = BEATS.length;
  // Beat 2 remains a legacy deep-link alias; news is one presentation slide.
  var PRESENTATION_ORDER = [0, 1, 4, 5, 16, 8, 9, 10, 11, 13, 14, 15, 19, 20, 21, 22];
  var PRESENTATION_TOTAL = PRESENTATION_ORDER.length;
  function canonicalBeat(b) { return b === 2 ? 1 : b === 3 ? 4 : b === 6 ? 5 : b === 7 || b === 17 ? 16 : b === 12 ? 13 : b === 18 ? 19 : b; }
  function adjacentBeat(direction) {
    var position = PRESENTATION_ORDER.indexOf(current);
    return PRESENTATION_ORDER[Math.max(0, Math.min(PRESENTATION_TOTAL - 1, position + direction))];
  }
  var LAYER_ORDER = ['cover', 'news', 'cost', 'gap', 'brand', 'crm', 'smart-agenda', 'camera', 'tag', 'map', 'benefits', 'care-impact', 'impact', 'team', 'cta', 'business'];
  var LIGHT_FROM = 7;
  var MAP_FIRST = 14;
  var FLOW_FIRST = 16, FLOW_LAST = 17;
  var SECTOR_NAME = { A: 'Setor A · Internação', C: 'Setor C · UTI adulto' };

  // Percurso simulado no mapa (coordenadas da planta, centro do setor A → centro do setor C).
  var ROUTE = [[285, 240], [285, 340], [728, 340], [728, 520], [885, 520]];
  var ROUTE_MS = 1440;

  var doc = document;
  var body = doc.body;
  var stage = doc.getElementById('stage');
  var dot = doc.getElementById('hero-dot');
  var line = doc.getElementById('hero-line');
  var marker = doc.getElementById('marker');
  var trail = doc.getElementById('trail');
  var sectorValue = doc.getElementById('sector-value');
  var readState = doc.getElementById('read-state');
  var live = doc.getElementById('live');
  var btnPrev = doc.getElementById('btn-prev');
  var btnNext = doc.getElementById('btn-next');
  var btnFs = doc.getElementById('btn-fs');
  var ctlScene = doc.getElementById('ctl-scene');
  var ctlCount = doc.getElementById('ctl-count');
  var appendix = doc.getElementById('appendix');
  var layers = {};
  Array.prototype.forEach.call(doc.querySelectorAll('[data-layer]'), function (el) { layers[el.dataset.layer] = el; });
  var reveals = Array.prototype.slice.call(doc.querySelectorAll('[data-on]'));
  var zones = {};
  Array.prototype.forEach.call(doc.querySelectorAll('[data-zone]'), function (el) { zones[el.dataset.zone] = el; });

  var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var current = -1;
  var routeAnim = null;
  var lineAnim = null;

  /* ── Escala do palco ─────────────────────────────── */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    doc.documentElement.style.setProperty('--s', String(s));
  }

  /* ── Medição de âncoras em coordenadas do palco (ignora transformações) ── */
  function stagePos(el) {
    var x = 0, y = 0, n = el;
    while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }

  // Extensão real do texto de um elemento, em coordenadas do palco. A razão entre o
  // retângulo renderizado e o offsetWidth anula escala do palco e transformações da camada.
  function textBox(el) {
    var base = stagePos(el);
    var er = el.getBoundingClientRect();
    var k = er.width / (el.offsetWidth || 1) || 1;
    var rg = doc.createRange();
    rg.selectNodeContents(el);
    var rs = Array.prototype.filter.call(rg.getClientRects(), function (r) { return r.width > 1 && r.height > 1; });
    if (!rs.length) return { x: base.x, y: base.y, w: base.w, h: base.h };
    var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    rs.forEach(function (q) { l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); });
    return { x: base.x + (l - er.left) / k, y: base.y + (t - er.top) / k, w: (r - l) / k, h: (b - t) / k };
  }
  function byId(id) { return doc.getElementById(id); }

  function lineGeometry(spec, dotC) {
    if (!spec || !dotC) return null;
    var a, start, end;
    if (spec.link) {
      a = stagePos(byId(spec.link));
      start = a.x + a.w + 8; end = dotC.x - dotC.r - 8;
    } else if (spec.linkRight) {
      a = stagePos(byId(spec.linkRight));
      start = dotC.x + dotC.r + 8; end = a.x - 8;
    } else return null;
    return { x: start, y: dotC.y, w: Math.max(0, end - start) };
  }

  function placeHero(B) {
    var color = B.tone === 'org' ? 'var(--org)' : 'var(--ver)';
    stage.style.setProperty('--hero', color);
    var dotC = null;
    var a = byId(B.dot);
    if (a) {
      var p = stagePos(a);
      var size = Math.max(p.w, 12);
      dotC = { x: p.x + p.w / 2, y: p.y + p.h / 2, r: size / 2 };
      stage.style.setProperty('--ds', size + 'px');
      stage.style.setProperty('--dx', (dotC.x - size / 2) + 'px');
      stage.style.setProperty('--dy', (dotC.y - size / 2) + 'px');
    }
    var g = lineGeometry(B.line, dotC);
    if (g) {
      stage.style.setProperty('--lx', g.x + 'px');
      stage.style.setProperty('--ly', (g.y - 2) + 'px');
      stage.style.setProperty('--lw', g.w + 'px');
    } else {
      // Sem conexão: o fio recolhe onde está e some; não varre o conteúdo novo.
      stage.style.setProperty('--lw', '0px');
    }
    line.classList.toggle('hero-line-off', !g);
    dot.classList.toggle('hero-hidden', !!B.hideDot);
    return dotC;
  }

  /* ── Mapa simulado ──────────────────────────────── */
  function markerAt(pt) { marker.style.transform = 'translate(' + (pt[0] - 14) + 'px,' + (pt[1] - 14) + 'px)'; }
  function lightZone(z) { Object.keys(zones).forEach(function (k) { zones[k].classList.toggle('lit', k === z); }); }
  function mapStatic(z) {
    if (routeAnim) { routeAnim.cancel(); routeAnim = null; }
    var atC = z === 'C';
    markerAt(atC ? ROUTE[ROUTE.length - 1] : ROUTE[0]);
    lightZone(z);
    trail.classList.toggle('drawn', atC);
    sectorValue.textContent = SECTOR_NAME[atC ? 'C' : 'A'];
    readState.textContent = 'simulada · por setor, não por coordenada';
  }
  function mapMove(forward) {
    var pts = forward ? ROUTE : ROUTE.slice().reverse();
    var target = forward ? 'C' : 'A';
    if (!marker.animate || reduced.matches) { mapStatic(target); return; }
    // Sample the rendered point before cancelling. WebKit may resample the
    // timeline when reverse()/currentTime changes; restarting from the actual
    // transform preserves continuity even with several reversals in one frame.
    if (routeAnim) {
      var rendered = getComputedStyle(marker).transform;
      var matrix = new DOMMatrixReadOnly(rendered);
      var point = [matrix.m41 + 14, matrix.m42 + 14];
      var nearest = 0, best = Infinity;
      for (var i = 0; i < ROUTE.length - 1; i++) {
        var a = ROUTE[i], b = ROUTE[i + 1];
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)));
        var ex = point[0] - (a[0] + t * dx), ey = point[1] - (a[1] + t * dy);
        var distance = ex * ex + ey * ey;
        if (distance < best) { best = distance; nearest = i; }
      }
      routeAnim.cancel();
      routeAnim = null;
      marker.style.transform = rendered;
      pts = [point].concat(forward ? ROUTE.slice(nearest + 1) : ROUTE.slice(0, nearest + 1).reverse());
    }
    trail.classList.toggle('drawn', forward);
    readState.textContent = 'deslocamento simulado em andamento';
    var frames = pts.map(function (pt) { return { transform: 'translate(' + (pt[0] - 14) + 'px,' + (pt[1] - 14) + 'px)' }; });
    var anim = marker.animate(frames, { duration: ROUTE_MS, easing: 'cubic-bezier(.22,1,.36,1)' });
    routeAnim = anim;
    anim.onfinish = function () {
      if (routeAnim !== anim) return;
      markerAt(pts[pts.length - 1]);
      routeAnim = null;
      lightZone(target);
      sectorValue.textContent = SECTOR_NAME[target];
      readState.textContent = 'simulada · por setor, não por coordenada';
    };
  }

  /* ── Fio de continuidade e morfose da marca ─────────────────────────────
     Autoridade única sobre o ponto (#hero-dot), o fio (#hero-wire-path) e os glifos
     (#hero-glyphs). O estado apresentado vive em `hero`; cada intenção nova parte dele.
     Entre cenas, o ponto percorre trilhos nas margens com o fio atrás. Na marca, o
     trecho final do fio é repartido em faixas colineares, uma por contorno da DM Mono 500;
     cada ponto quadrático interpola da faixa até a coordenada exata da fonte. */
  var GLYPHS = window.CONSTA_GLYPHS || null;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var wirePath = doc.getElementById('hero-wire-path');
  var wireSvg = doc.getElementById('hero-wire');
  var glyphGroup = doc.getElementById('hero-glyphs');
  var RAIL = { l: 36, r: 1884, t: 34, b: 1046 };
  var WIRE_W = 4;          // espessura do fio: a mesma do fio de conexão
  var CORNER = 28;         // raio das curvas nos trilhos
  var PAD = 26;            // folga mínima entre trilho e conteúdo protegido
  var ENDTOL = 30;         // a âncora fica junto do texto: o trecho inicial/final é a própria âncora
  var BEND = 160;          // custo por curva na escolha do trajeto
  var MORPH_MS = 960;
  var STRAIGHT_MS = 720;
  var RETRACT_MS = 300;
  var WIRE_MAX = 760;
  var LAG = 0.24;
  var STAGGER = 0.07;

  function cubicBezier(x1, y1, x2, y2) {
    function at(a, b, t) { var s = 1 - t; return 3 * a * t * s * s + 3 * b * t * t * s + t * t * t; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 26; i++) { t = (lo + hi) / 2; if (at(x1, x2, t) < x) lo = t; else hi = t; }
      return at(y1, y2, t);
    };
  }
  var ease = cubicBezier(.22, 1, .36, 1); // a mesma curva de --ease
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function dist(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpPt(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function fmt(p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }

  /* Rotas: polilinha densa com comprimento acumulado. */
  function makeRoute(pts) {
    var clean = [pts[0]];
    for (var i = 1; i < pts.length; i++) if (dist(pts[i], clean[clean.length - 1]) > 0.01) clean.push(pts[i]);
    var cum = [0];
    for (i = 1; i < clean.length; i++) cum.push(cum[i - 1] + dist(clean[i - 1], clean[i]));
    return { pts: clean, cum: cum, len: cum[cum.length - 1] };
  }
  function segIndex(R, s) {
    var lo = 0, hi = R.cum.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (R.cum[mid] <= s) lo = mid; else hi = mid; }
    return lo;
  }
  function routeAt(R, s) {
    if (R.pts.length < 2) return R.pts[0];
    s = Math.max(0, Math.min(R.len, s));
    var i = segIndex(R, s), l = R.cum[i + 1] - R.cum[i];
    return lerpPt(R.pts[i], R.pts[i + 1], l ? (s - R.cum[i]) / l : 0);
  }
  function routeSlice(R, a, b) {
    if (!R || b - a < 0.01) return [];
    var out = [routeAt(R, a)];
    for (var i = segIndex(R, a) + 1; i < R.pts.length && R.cum[i] < b; i++) out.push(R.pts[i]);
    out.push(routeAt(R, b));
    return out;
  }
  // Esquinas ortogonais arredondadas por quadráticas (raio limitado pelos trechos vizinhos).
  function rounded(corners) {
    var out = [corners[0]];
    for (var i = 1; i < corners.length - 1; i++) {
      var p = corners[i - 1], c = corners[i], n = corners[i + 1];
      var r = Math.min(CORNER, dist(p, c) / 2, dist(c, n) / 2);
      if (r < 1) { out.push(c); continue; }
      var a = lerpPt(c, p, r / dist(p, c)), b = lerpPt(c, n, r / dist(c, n));
      for (var k = 0; k <= 8; k++) {
        var t = k / 8, s = 1 - t;
        out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
      }
    }
    out.push(corners[corners.length - 1]);
    return out;
  }

  /* Conteúdo protegido em coordenadas do palco, no layout de repouso (sem transformações). */
  function htmlHost(el) {
    var n = el;
    while (n && (!(n instanceof HTMLElement) || !n.offsetWidth)) n = n.parentElement;
    return n;
  }
  function toStage(r, host) {
    var base = stagePos(host), hr = host.getBoundingClientRect();
    var k = hr.width / (host.offsetWidth || 1) || 1;
    return { l: base.x + (r.left - hr.left) / k, t: base.y + (r.top - hr.top) / k,
             r: base.x + (r.right - hr.left) / k, b: base.y + (r.bottom - hr.top) / k };
  }
  function shownAt(el, layerEl, beat) {
    for (var n = el; n && n !== layerEl; n = n.parentElement) {
      if (n.dataset && n.dataset.on !== undefined) {
        var off = n.dataset.off !== undefined ? Number(n.dataset.off) : Infinity;
        if (!(beat >= Number(n.dataset.on) && beat < off)) return false;
      }
    }
    return true;
  }
  function alphaOf(color) {
    var m = /rgba?\(([^)]+)\)/.exec(color || '');
    if (!m) return color && color !== 'transparent' ? 1 : 0;
    var p = m[1].split(',');
    return p.length > 3 ? Number(p[3]) : 1;
  }
  function painted(cs) {
    if (alphaOf(cs.backgroundColor) > 0.04 || cs.backgroundImage !== 'none') return true;
    return ['Top', 'Right', 'Bottom', 'Left'].some(function (s) {
      return parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none' && alphaOf(cs['border' + s + 'Color']) > 0.04;
    });
  }
  function collectLayer(layerEl, beat, role, skipEl, out) {
    if (!layerEl) return;
    function skip(el) { return (el.closest && el.closest('.anchor')) || (skipEl && skipEl.contains(el)); }
    function push(r, el) {
      if (r.width < 0.5 || r.height < 0.5) return;
      var host = htmlHost(el);
      if (!host) return;
      var o = toStage(r, host);
      if ((o.r - o.l) * (o.b - o.t) > 0.6 * 1920 * 1080) return;
      if (el.closest && el.closest('.rise')) o.b += 32;
      o.role = role;
      out.push(o);
    }
    var walker = doc.createTreeWalker(layerEl, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var node = walker.currentNode, el = node.parentElement;
      if (!el || !/\S/.test(node.textContent) || skip(el) || !shownAt(el, layerEl, beat)) continue;
      var rg = doc.createRange(); rg.selectNodeContents(node);
      Array.prototype.forEach.call(rg.getClientRects(), function (r) { push(r, el); });
    }
    Array.prototype.forEach.call(layerEl.querySelectorAll('*'), function (el) {
      if (el.ownerSVGElement || skip(el) || !shownAt(el, layerEl, beat)) return;
      var tag = el.tagName.toLowerCase();
      var box = tag === 'img' || tag === 'svg' || tag === 'video' || tag === 'canvas' || painted(getComputedStyle(el));
      if (box) push(el.getBoundingClientRect(), el);
    });
  }
  function obstacles(fromBeat, toBeat, skipEl) {
    var out = [];
    collectLayer(layers[BEATS[fromBeat].layer], fromBeat, 'out', skipEl, out);
    collectLayer(layers[BEATS[toBeat].layer], toBeat, 'in', skipEl, out);
    // Controles do apresentador ficam fora do palco escalonado: converte para o palco.
    var sr = stage.getBoundingClientRect(), s = sr.width / 1920 || 1;
    Array.prototype.forEach.call(doc.querySelectorAll('.controls a, .controls button, .controls span'), function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 1) return;
      out.push({ l: (r.left - sr.left) / s, t: (r.top - sr.top) / s, r: (r.right - sr.left) / s, b: (r.bottom - sr.top) / s, role: 'fixed' });
    });
    return out;
  }
  // Camadas: translateX ±72 px em 720 ms e opacidade em 480 ms (palco.css, .layer).
  function layerShift(role, tau) { return role === 'out' ? -72 * ease(tau / 720) : role === 'in' ? 72 * (1 - ease(tau / 720)) : 0; }
  function layerAlpha(role, tau) { return role === 'out' ? 1 - ease(tau / 480) : role === 'in' ? ease(tau / 480) : 1; }

  function hitsRect(a, b, o, pad, dx) {
    var lo = 0, hi = 1, ax = [a[0], b[0], o.l - pad + dx, o.r + pad + dx], ay = [a[1], b[1], o.t - pad, o.b + pad];
    for (var k = 0; k < 2; k++) {
      var q = k ? ay : ax, d = q[1] - q[0];
      if (Math.abs(d) < 1e-9) { if (q[0] < q[2] || q[0] > q[3]) return false; }
      else {
        var u = (q[2] - q[0]) / d, v = (q[3] - q[0]) / d;
        lo = Math.max(lo, Math.min(u, v)); hi = Math.min(hi, Math.max(u, v));
        if (lo > hi) return false;
      }
    }
    return true;
  }
  function segClear(a, b, obs, ta, tb) {
    var L = dist(a, b);
    if (L - ta - tb < 0.5) return true;
    var A = lerpPt(a, b, ta / L), B = lerpPt(a, b, 1 - tb / L);
    for (var i = 0; i < obs.length; i++) if (hitsRect(A, B, obs[i], PAD, 0)) return false;
    return true;
  }

  /* Trajeto ortogonal: trechos só sobre os trilhos das margens, mais as aproximações
     que tocam as âncoras. Dijkstra com custo por curva. */
  function findPath(P0, P1, obs) {
    function onRailPt(p) { return p[0] === RAIL.l || p[0] === RAIL.r || p[1] === RAIL.t || p[1] === RAIL.b; }
    var nodes = [P0, P1], xs = [P0[0], P1[0], RAIL.l, RAIL.r], ys = [P0[1], P1[1], RAIL.t, RAIL.b];
    xs.forEach(function (x) { ys.forEach(function (y) {
      var p = [x, y];
      if (onRailPt(p) && !nodes.some(function (n) { return n[0] === x && n[1] === y; })) nodes.push(p);
    }); });
    var N = nodes.length, adj = [];
    for (var i = 0; i < N; i++) adj.push([]);
    for (i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
      var a = nodes[i], b = nodes[j], h = a[1] === b[1], v = a[0] === b[0];
      if (!h && !v) continue;
      var end = i < 2 || j < 2;
      var rail = (h && (a[1] === RAIL.t || a[1] === RAIL.b)) || (v && (a[0] === RAIL.l || a[0] === RAIL.r));
      if (!rail && !end) continue;
      if (!segClear(a, b, obs, i < 2 ? ENDTOL : 0, j < 2 ? ENDTOL : 0)) continue;
      adj[i].push([j, h ? 1 : 2]); adj[j].push([i, h ? 1 : 2]);
    }
    var best = {}, prev = {}, open = [[0, 0, 0]];
    best['0:0'] = 0;
    while (open.length) {
      open.sort(function (p, q) { return p[0] - q[0]; });
      var cur = open.shift(), key = cur[1] + ':' + cur[2];
      if (cur[0] > best[key]) continue;
      if (cur[1] === 1) {
        var path = [nodes[1]], k2 = key;
        while (prev[k2]) { k2 = prev[k2]; path.unshift(nodes[Number(k2.split(':')[0])]); }
        return path;
      }
      adj[cur[1]].forEach(function (e) {
        var c = cur[0] + dist(nodes[cur[1]], nodes[e[0]]) + (cur[2] && cur[2] !== e[1] ? BEND : 0);
        var nk = e[0] + ':' + e[1];
        if (best[nk] === undefined || c < best[nk]) { best[nk] = c; prev[nk] = key; open.push([c, e[0], e[1]]); }
      });
    }
    return null;
  }

  /* Morfose: faixas do fio → contornos exatos da DM Mono 500. */
  function brandEl() { return current === FLOW_FIRST ? byId('flow-brand') : byId('t-brand'); }
  function measureMorph(word, lineY, endX) {
    if (!GLYPHS) return null;
    var tn = null;
    Array.prototype.some.call(word.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.indexOf(GLYPHS.word) >= 0) { tn = n; return true; } return false; });
    var base = word.querySelector('.br-base');
    if (!tn || !base) return null;
    var k = parseFloat(getComputedStyle(word).fontSize) / GLYPHS.unitsPerEm;
    var yb = toStage(base.getBoundingClientRect(), word).t; // âncora de tamanho zero na linha de base
    var off = tn.textContent.indexOf(GLYPHS.word), rg = doc.createRange(), cells = [];
    for (var i = 0; i < GLYPHS.word.length; i++) {
      rg.setStart(tn, off + i); rg.setEnd(tn, off + i + 1);
      var G = GLYPHS.glyphs[GLYPHS.word[i]], ox = toStage(rg.getBoundingClientRect(), word).l;
      cells.push({ G: G, ox: ox, x0: ox + G.bbox[0] * k, x1: ox + G.bbox[2] * k });
    }
    var bounds = [cells[0].x0];
    for (i = 1; i < cells.length; i++) bounds.push((cells[i - 1].x1 + cells[i].x0) / 2);
    bounds.push(endX);
    var yT = lineY - WIRE_W / 2, yB = lineY + WIRE_W / 2;
    var glyphs = cells.map(function (cell, gi) {
      var s0 = bounds[gi] - (gi ? 0.4 : 0), s1 = bounds[gi + 1] + (gi < cells.length - 1 ? 0.4 : 0), G = cell.G;
      var contours = G.contours.map(function (c) {
        var p = c.p, end = new Float64Array(p.length), start = new Float64Array(p.length);
        for (var q = 0; q < p.length; q += 2) { end[q] = cell.ox + p[q] * k; end[q + 1] = yb - p[q + 1] * k; }
        if (c.hole) {
          // Contraforma nasce com área zero sobre a linha e cresce até o miolo da letra.
          for (q = 0; q < p.length; q += 2) {
            start[q] = lerp(s0, s1, clamp01((p[q] - G.bbox[0]) / (G.bbox[2] - G.bbox[0])));
            start[q + 1] = lineY;
          }
        } else {
          // Cadeia esquerda→direita sobre a borda superior da faixa, volta pela inferior:
          // no início o contorno é exatamente o retângulo do fio.
          var xL = p[0], xR = p[c.r * 4];
          for (var pt = 0; pt < p.length / 2; pt++) {
            var sIdx = pt >> 1, ctrl = pt & 1, top = ctrl ? sIdx < c.r : sIdx <= c.r;
            start[2 * pt] = lerp(s0, s1, clamp01((p[2 * pt] - xL) / (xR - xL)));
            start[2 * pt + 1] = top ? yT : yB;
          }
        }
        return { start: start, end: end };
      });
      return { contours: contours, el: null };
    });
    return { glyphs: glyphs, x0: cells[0].x0, endX: endX, lineY: lineY };
  }
  function ensureGlyphEls(M) {
    while (glyphGroup.firstChild) glyphGroup.removeChild(glyphGroup.firstChild);
    M.glyphs.forEach(function (g) {
      var el = doc.createElementNS(SVGNS, 'path');
      el.setAttribute('data-logo-morph', '');
      el.setAttribute('fill-rule', 'evenodd');
      glyphGroup.appendChild(el);
      g.el = el;
    });
  }
  function parseRGB(c) {
    var m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (m) return m[1].split(',').slice(0, 3).map(Number);
    var h = /^#([0-9a-f]{6})$/i.exec((c || '').trim());
    return h ? [0, 2, 4].map(function (i) { return parseInt(h[1].substr(i, 2), 16); }) : [10, 10, 10];
  }
  function glyphD(g, e) {
    var d = '';
    g.contours.forEach(function (c) {
      var s = c.start, t = c.end, n = s.length / 2;
      function P(i) { i %= n; return (s[2 * i] + (t[2 * i] - s[2 * i]) * e).toFixed(2) + ' ' + (s[2 * i + 1] + (t[2 * i + 1] - s[2 * i + 1]) * e).toFixed(2); }
      d += 'M' + P(0);
      for (var q = 1; q < n; q += 2) d += 'Q' + P(q) + ' ' + P(q + 1);
      d += 'Z';
    });
    return d;
  }

  /* Estado apresentado. */
  var hero = { x: 960, y: 540, size: 28, route: null, head: 0, tail: 0, front: 0, from: -1, lineFromBrand: false,
               m: 0, glyphsOn: false, morph: null, wireRGB: null, textRGB: null,
               phases: [], pi: 0, t0: 0, raf: 0, target: null, flowS: 0 };

  function drawHero() {
    dot.style.transform = 'translate(' + (hero.x - hero.size / 2) + 'px,' + (hero.y - hero.size / 2) + 'px)';
    dot.style.width = dot.style.height = hero.size + 'px';
    var pts = hero.route ? routeSlice(hero.route, Math.min(hero.tail, hero.head), Math.max(hero.front, hero.head)) : [];
    wirePath.setAttribute('d', pts.length > 1 ? 'M' + pts.map(fmt).join('L') : '');
    glyphGroup.style.display = hero.glyphsOn ? '' : 'none';
    if (hero.glyphsOn && hero.morph) {
      var N = hero.morph.glyphs.length, span = 1 - (N - 1) * STAGGER;
      hero.morph.glyphs.forEach(function (g, i) {
        var u = clamp01((hero.m - i * STAGGER) / span), c = clamp01(u * 1.25);
        g.el.setAttribute('d', glyphD(g, ease(u)));
        g.el.setAttribute('fill', 'rgb(' + [0, 1, 2].map(function (j) { return Math.round(lerp(hero.wireRGB[j], hero.textRGB[j], c)); }).join(',') + ')');
      });
    }
  }
  function setForming(on) { var w = brandEl(); if (w) w.classList.toggle('is-forming', on); }
  function readColors() {
    var w = brandEl(), was = w.classList.contains('is-forming');
    w.classList.remove('is-forming');
    hero.textRGB = parseRGB(getComputedStyle(w).color);
    if (was) w.classList.add('is-forming');
    hero.wireRGB = parseRGB(getComputedStyle(dot).backgroundColor);
  }
  function wireVisible(s) { return !!s.route && Math.max(s.front, s.head) - Math.min(s.tail, s.head) > 0.5; }

  function heroSettle(T, morphHere) {
    if (hero.raf) { cancelAnimationFrame(hero.raf); hero.raf = 0; }
    hero.phases = [];
    hero.x = T.x; hero.y = T.y; hero.size = T.size;
    hero.route = null; hero.head = hero.tail = hero.front = 0; hero.lineFromBrand = false;
    hero.glyphsOn = false; hero.m = morphHere ? 1 : 0;
    setForming(false);
    wireSvg.dataset.phase = 'idle';
    drawHero();
  }

  // Fases calculadas de antemão sobre um estado simulado; cada uma escreve em `hero`.
  function planMove(sim, T, ctx, offset, morphGoal) {
    var P0 = [sim.x, sim.y], P1 = [T.x, T.y], obs = obstacles(ctx.from, ctx.to, morphGoal || sim.lineFromBrand ? brandEl() : null);
    var goal = morphGoal ? [RAIL.l, P1[1]] : P1;
    var M = null;
    if (morphGoal) { M = measureMorph(brandEl(), P1[1], P1[0]); if (!M) return null; }
    var R, h0, t0, f0;
    if (sim.lineFromBrand) {
      var c = findPath([RAIL.l, P0[1]], goal, obs);
      if (!c) return null;
      R = makeRoute(rounded([P0].concat(c, morphGoal ? [P1] : [])));
      h0 = 0; t0 = 0; f0 = sim.front;
    } else if (wireVisible(sim)) {
      var prefix = routeSlice(sim.route, 0, sim.head), suffix;
      if (ctx.to === sim.from) suffix = prefix.slice().reverse().concat([P1]);
      else {
        var c2 = findPath(P0, goal, obs);
        if (!c2) return null;
        suffix = rounded(c2.concat(morphGoal ? [P1] : []));
      }
      R = makeRoute(prefix.concat(suffix.slice(1)));
      // Trechos à frente do ponto (logo após desfazer a marca) recolhem: a nova rota parte do ponto.
      h0 = makeRoute(prefix).len; t0 = sim.tail; f0 = h0;
    } else {
      var c3 = findPath(P0, goal, obs);
      if (!c3) return null;
      R = makeRoute(rounded(c3.concat(morphGoal ? [P1] : [])));
      h0 = t0 = f0 = 0;
    }
    var S = R.len, endTail = morphGoal ? S - (P1[0] - M.x0) : S;
    var cap = Math.max(WIRE_MAX, h0 - t0, S - endTail);
    var dur = Math.max(760, Math.min(1500, 520 + 0.3 * (S - h0)));
    var size0 = sim.size;
    function at(u) {
      var head = lerp(h0, S, ease(u));
      var tail = lerp(t0, endTail, ease(clamp01((u - LAG) / (1 - LAG))));
      if (tail <= head && tail < head - cap) tail = head - cap;
      return { head: head, tail: tail, front: Math.max(f0, head) };
    }
    // Validação temporal: o fio nunca cruza texto ou controle enquanto ele está visível.
    var tolEnd = morphGoal ? S - endTail + ENDTOL : ENDTOL;
    for (var ms = 0; ms <= dur; ms += 32) {
      var st = at(ms / dur), tau = offset + ms;
      var lo = Math.max(Math.min(st.tail, st.head), ENDTOL), hi = Math.min(Math.max(st.front, st.head), S - tolEnd);
      var pts = routeSlice(R, lo, hi);
      for (var i = 0; i < obs.length; i++) {
        var o = obs[i];
        if (layerAlpha(o.role, tau) < 0.25) continue;
        var dx = layerShift(o.role, tau);
        for (var q = 1; q < pts.length; q++) if (hitsRect(pts[q - 1], pts[q], o, WIRE_W / 2 + 3, dx)) return null;
      }
    }
    sim.route = R; var fin = at(1);
    sim.head = fin.head; sim.tail = fin.tail; sim.front = fin.front;
    sim.x = P1[0]; sim.y = P1[1]; sim.size = T.size; sim.from = ctx.from; sim.lineFromBrand = false;
    if (!morphGoal) sim.route = null;
    return { type: 'move', dur: dur, morph: M,
      begin: function () {
        hero.route = R; hero.from = ctx.from; hero.lineFromBrand = false;
        if (morphGoal) { hero.morph = M; ensureGlyphEls(M); setForming(true); }
      },
      step: function (u) {
        var s = at(u), p = routeAt(R, s.head);
        hero.head = s.head; hero.tail = s.tail; hero.front = s.front;
        hero.x = p[0]; hero.y = p[1]; hero.size = lerp(size0, T.size, ease(u));
      },
      end: function () { if (!morphGoal) { hero.route = null; hero.head = hero.tail = hero.front = 0; } }
    };
  }
  function planUnmorph(sim) {
    var M = sim.morph || measureMorph(brandEl(), sim.y, sim.x);
    if (!M) return null;
    var m0 = sim.m, line = makeRoute([[sim.x, sim.y], [M.x0, sim.y]]);
    sim.m = 0; sim.morph = M; sim.route = line; sim.head = 0; sim.tail = 0; sim.front = line.len; sim.lineFromBrand = true;
    return { type: 'unmorph', dur: MORPH_MS * m0,
      begin: function () {
        if (hero.morph !== M || !glyphGroup.firstChild) { hero.morph = M; ensureGlyphEls(M); }
        readColors(); hero.route = null; hero.glyphsOn = true; setForming(true);
      },
      step: function (u) { hero.m = m0 * (1 - u); },
      end: function () {
        hero.glyphsOn = false; hero.m = 0;
        hero.route = line; hero.head = 0; hero.tail = 0; hero.front = line.len; hero.lineFromBrand = true;
      }
    };
  }
  function planForm(sim) {
    var m0 = sim.m;
    sim.m = 1; sim.route = null;
    return { type: 'form', dur: MORPH_MS * (1 - m0),
      begin: function () {
        if (!hero.morph) return;
        if (!glyphGroup.firstChild) ensureGlyphEls(hero.morph);
        readColors(); hero.route = null; hero.glyphsOn = true; setForming(true);
      },
      step: function (u) { hero.m = lerp(m0, 1, u); },
      end: function () {
        // Entrega no mesmo quadro: contornos exatos saem, wordmark canônica entra.
        hero.glyphsOn = false; hero.m = 1; setForming(false);
      }
    };
  }
  function planRetract(sim) {
    var t0 = sim.tail, f0 = sim.front, h = sim.head;
    sim.route = null; sim.lineFromBrand = false;
    return { type: 'retract', dur: RETRACT_MS,
      begin: function () {},
      step: function (u) { var e = ease(u); hero.tail = lerp(t0, h, e); hero.front = lerp(f0, h, e); },
      end: function () { hero.route = null; hero.lineFromBrand = false; }
    };
  }
  // The map camera reframes after the beat changes. Follow the rendered marker
  // through that reframe instead of handing off to a stale pre-camera coordinate.
  function planMapArrival() {
    var start = {x:hero.x, y:hero.y, size:hero.size};
    return {type:'map-entry', dur:1000,
      begin:function(){hero.route=null;hero.glyphsOn=false;hero.m=0;},
      step:function(u){
        var r=marker.getBoundingClientRect(), sr=stage.getBoundingClientRect(), scale=sr.width/1920;
        var x=(r.left+r.width/2-sr.left)/scale, y=(r.top+r.height/2-sr.top)/scale;
        var e=ease(u);hero.x=lerp(start.x,x,e);hero.y=lerp(start.y,y,e);hero.size=lerp(start.size,28,e);
      },
      end:function(){}
    };
  }
  function planStraight(sim, T) {
    var a = { x: sim.x, y: sim.y, size: sim.size };
    sim.x = T.x; sim.y = T.y; sim.size = T.size;
    return { type: 'straight', dur: STRAIGHT_MS,
      begin: function () {},
      step: function (u) { var e = ease(u); hero.x = lerp(a.x, T.x, e); hero.y = lerp(a.y, T.y, e); hero.size = lerp(a.size, T.size, e); },
      end: function () {}
    };
  }

  /* ── Fluxo das frentes (beats 13→14): o ponto percorre a rota SVG da IA ──
     Uma única variável apresentada (hero.flowS, comprimento ao longo da rota composta)
     determina tudo: posição do ponto, progresso do traço laranja, etapas manuais riscadas
     quando o ponto passa pelo centro de cada uma, pausa na revisão humana e chegada à gestão. */
  var FLOW_HOLD_MS = 560;
  var easeInOut = cubicBezier(.45, 0, .25, 1);
  var flowGeo = null;
  function flowSection() { return layers.benefits || null; }
  function buildFlow() {
    var sec = flowSection(), path = sec && sec.querySelector('#flow-route');
    var review = byId('flow-review-anchor'), fin = byId('flow-final-anchor') || byId('a-ben2');
    if (!path || !review || !fin || !path.getTotalLength) return null;
    var svg = path.ownerSVGElement, vb = svg.viewBox && svg.viewBox.baseVal;
    var box = toStage(svg.getBoundingClientRect(), htmlHost(svg));
    var bw = box.r - box.l, bh = box.b - box.t;
    var k = vb && vb.width ? Math.min(bw / vb.width, bh / vb.height) : 1;
    var ox = box.l + (vb && vb.width ? (bw - vb.width * k) / 2 - vb.x * k : 0);
    var oy = box.t + (vb && vb.width ? (bh - vb.height * k) / 2 - vb.y * k : 0);
    var total = path.getTotalLength(), pts = [];
    for (var i = 0; i <= 96; i++) {
      var q = path.getPointAtLength(total * i / 96);
      pts.push([ox + q.x * k, oy + q.y * k]);
    }
    function center(el) { var p = stagePos(el); return [p.x + p.w / 2, p.y + p.h / 2]; }
    var routeEnd = makeRoute(pts).len;
    var R1 = center(sec.querySelector('.flow-gate')), F = center(fin);
    // Da revisão até a gestão pela calha superior (acima do rótulo manual, abaixo do título):
    // não cruza "Confira e salve" nem os textos do cartão; chega ao ponto por cima.
    var head = makeRoute(pts.concat([R1])).len;
    var gutter = Math.min(R1[1], F[1]) - 140;
    var R = makeRoute(pts.concat(rounded([R1, [R1[0], gutter], [F[0], gutter], F])));
    var steps = Array.prototype.map.call(sec.querySelectorAll('.flow-step'), function (el) {
      var p = stagePos(el);
      return { el: el, cx: p.x + p.w / 2 };
    });
    return { sec: sec, R: R, routeEnd: routeEnd, review: head, end: R.len, steps: steps };
  }
  // Estado semântico derivado só da posição apresentada.
  function applyFlow(s, x, check) {
    var G = flowGeo;
    if (!G) return;
    var phase = s <= 0.5 ? 'manual' : s < G.routeEnd - 0.5 ? 'bypass' : s < G.end - 0.5 ? 'review' : 'complete';
    G.sec.dataset.flowPhase = phase;
    var completion = check === undefined ? (s > G.review ? 1 : 0) : clamp01(check);
    G.sec.style.setProperty('--flow-check-progress', String(completion));
    G.sec.dataset.flowChecked = completion >= 0.999 ? 'true' : 'false';
    G.sec.style.setProperty('--flow-route-progress', String(clamp01(s / G.routeEnd)));
    G.steps.forEach(function (st) {
      var crossed = phase !== 'manual' && (s >= G.routeEnd - 0.5 || x >= st.cx);
      st.el.dataset.state = crossed ? 'bypassed' : 'pending';
    });
  }
  function flowSemantic(beat) {
    if (!flowGeo) flowGeo = buildFlow();
    if (!flowGeo) return;
    hero.flowS = beat >= FLOW_LAST ? flowGeo.end : 0;
    var p = routeAt(flowGeo.R, hero.flowS);
    hero.flowCheck = beat >= FLOW_LAST ? 1 : 0;
    applyFlow(hero.flowS, p[0], hero.flowCheck);
  }
  function planFlow(sim, toEnd) {
    var G = flowGeo, s0 = hero.flowS, s1 = toEnd ? G.end : 0, segs = [];
    var c0 = Number(hero.flowCheck) || 0;
    var baseSize = byId('a-ben').offsetWidth || 28;
    function add(a, b, ca, cb, dur) { segs.push({ a: a, b: b, ca: ca, cb: cb, dur: dur }); }
    if (toEnd) {
      if (s0 < G.review) add(s0, G.review, 0, 0, 300 + 1.25 * (G.review - s0));
      if (s0 <= G.review && c0 < 1) add(G.review, G.review, c0, 1, FLOW_HOLD_MS * (1 - c0));
      add(Math.max(s0, G.review), s1, 1, 1, 260 + 0.6 * (s1 - Math.max(s0, G.review)));
    } else {
      if (s0 > G.review) add(s0, G.review, 1, 1, 260 + 0.8 * (s0 - G.review));
      if (c0 > 0) add(G.review, G.review, c0, 0, FLOW_HOLD_MS * c0);
      add(Math.min(s0, G.review), 0, 0, 0, 260 + 0.8 * Math.min(s0, G.review));
    }
    var dur = segs.reduce(function (t, g) { return t + g.dur; }, 0);
    var fin = routeAt(G.R, s1);
    sim.x = fin[0]; sim.y = fin[1]; sim.route = null;
    return { type: 'flow', dur: dur,
      begin: function () { hero.route = null; },
      step: function (u) {
        var t = u * dur, s = s1, check = toEnd ? 1 : 0;
        for (var i = 0; i < segs.length; i++) {
          var g = segs[i];
          if (t <= g.dur || i === segs.length - 1) {
            var q = easeInOut(clamp01(t / g.dur));
            s = lerp(g.a, g.b, q); check = lerp(g.ca, g.cb, q); break;
          }
          t -= g.dur;
        }
        var p = routeAt(G.R, s);
        hero.flowS = s; hero.flowCheck = check; hero.x = p[0]; hero.y = p[1];
        // The orange point becomes the gate's fill, so the drawn check stays visible.
        var exitScale = s > G.review ? clamp01((s - G.review) / 48) : 0;
        hero.size = baseSize * (s < G.review ? 1 : Math.max(1 - check, exitScale));
        applyFlow(s, p[0], check);
      },
      end: function () { hero.size = baseSize; }
    };
  }
  // One native timeline: point → exact logo outlines → the existing flow route.
  function startFlowIntro(continueArrival) {
    flowGeo = buildFlow();
    if (!flowGeo) return;
    var word = byId('flow-brand'), logo = stagePos(byId('flow-logo-dot'));
    word.classList.remove('is-forming');
    var T = {x: logo.x + logo.w / 2, y: logo.y + logo.h / 2, size: logo.w};
    var finish = routeAt(flowGeo.R, flowGeo.end);
    var arrival = continueArrival ? hero.phases.slice() : [];
    if (hero.raf) { cancelAnimationFrame(hero.raf); hero.raf = 0; }
    if (!continueArrival) heroSettle(T, false);
    flowSemantic(FLOW_FIRST);
    hero.target = {T: {x:finish[0], y:finish[1], size:28}, morphHere:false, beat:FLOW_LAST};
    if (reduced.matches || !GLYPHS) {
      heroSettle(hero.target.T, false); flowSemantic(FLOW_LAST); return;
    }
    var M = measureMorph(word, T.y, T.x);
    if (!M) { flowSemantic(FLOW_LAST); return; }
    hero.morph = M; ensureGlyphEls(M); readColors(); setForming(true);
    hero.flowS = 0; hero.flowCheck = 0;
    var baseline = makeRoute([[M.x0,T.y],[T.x,T.y]]);
    var origin = routeAt(flowGeo.R, 0);
    var transfer = makeRoute(rounded([[T.x,T.y],[T.x,390],[origin[0],390],origin]));
    var sim = {x:T.x,y:T.y,size:T.size,m:0};
    var unfold = {type:'logo-line',dur:480,
      begin:function(){hero.x=T.x;hero.y=T.y;hero.size=T.size;setForming(true);hero.route=baseline;hero.head=hero.front=baseline.len;},
      step:function(u){hero.tail=baseline.len*(1-ease(u));},
      end:function(){hero.route=null;}};
    var form = planForm(sim);
    var travel = {type:'flow-entry',dur:650,
      begin:function(){hero.m=0;hero.route=null;},
      step:function(u){var p=routeAt(transfer,transfer.len*ease(u));hero.x=p[0];hero.y=p[1];hero.size=lerp(T.size,28,ease(u));},
      end:function(){hero.x=origin[0];hero.y=origin[1];hero.size=28;}};
    hero.phases=arrival.concat([unfold,form,travel,planFlow(sim,true)]);
    hero.pi=0;hero.t0=performance.now();beginPhase();hero.raf=requestAnimationFrame(tick);
  }

  function onFlowRoute() {
    if (!flowGeo || wireVisible(hero) || hero.m > 0) return false;
    var p = routeAt(flowGeo.R, hero.flowS);
    return Math.abs(p[0] - hero.x) < 2 && Math.abs(p[1] - hero.y) < 2;
  }

  // Retorna o tempo até o ponto chegar (ms), usado para o fio de conexão crescer depois.
  function heroTo(T, ctx) {
    if (hero.raf) { cancelAnimationFrame(hero.raf); hero.raf = 0; }
    hero.target = { T: T, morphHere: !!ctx.morphEl, beat: ctx.to };
    if (ctx.instant || reduced.matches || !GLYPHS) { heroSettle(T, !!ctx.morphEl); flowGeo = buildFlow(); flowSemantic(ctx.to); return 0; }
    if (ctx.mapArrival) {
      flowSemantic(ctx.to);
      hero.phases=[planMapArrival()];hero.pi=0;hero.t0=performance.now();
      beginPhase();hero.raf=requestAnimationFrame(tick);return hero.phases[0].dur;
    }
    // 13 ↔ 14: o ponto percorre a rota da IA a partir do progresso apresentado.
    var flowStep = (ctx.to === FLOW_FIRST || ctx.to === FLOW_LAST) && (ctx.from === FLOW_FIRST || ctx.from === FLOW_LAST);
    if (!flowGeo) flowGeo = buildFlow();
    if (flowStep && onFlowRoute()) {
      var fsim = { x: hero.x, y: hero.y };
      hero.phases = [planFlow(fsim, ctx.to === FLOW_LAST)]; hero.pi = 0; hero.t0 = performance.now();
      beginPhase();
      hero.raf = requestAnimationFrame(tick);
      return hero.phases[0].dur;
    }
    flowSemantic(ctx.to);
    var sim = { x: hero.x, y: hero.y, size: hero.size, route: hero.route, head: hero.head, tail: hero.tail,
                front: hero.front, from: hero.from, lineFromBrand: hero.lineFromBrand, m: hero.m, morph: hero.morph };
    var morphGoal = !!ctx.morphEl && (ctx.routed || hero.glyphsOn);
    var phases = [], eta = 0, ph;
    if (sim.m > 0 && !hero.glyphsOn && !(ctx.routed && hero.m > 0)) sim.m = hero.m = 0; // marca assentada: sai com a camada
    if (morphGoal && sim.m > 0) phases.push(planForm(sim));
    else {
      if (sim.m > 0) { ph = planUnmorph(sim); if (ph) { phases.push(ph); eta += ph.dur; } else sim.m = hero.m = 0; }
      ph = ctx.routed ? planMove(sim, T, ctx, eta, morphGoal) : null;
      if (ph) phases.push(ph);
      else {
        if (wireVisible(sim)) { ph = planRetract(sim); phases.push(ph); eta += ph.dur; }
        phases.push(planStraight(sim, T));
        morphGoal = false;
      }
      eta += phases[phases.length - 1].dur;
      if (morphGoal) phases.push(planForm(sim));
    }
    if (!morphGoal && !hero.glyphsOn && phases[0].type !== 'unmorph') setForming(false);
    hero.phases = phases; hero.pi = 0; hero.t0 = performance.now();
    beginPhase();
    hero.raf = requestAnimationFrame(tick);
    return eta;
  }
  function beginPhase() {
    var ph = hero.phases[hero.pi];
    wireSvg.dataset.phase = ph.type;
    ph.begin(); ph.step(0); drawHero();
  }
  function tick(now) {
    hero.raf = 0;
    var ph = hero.phases[hero.pi];
    if (!ph) return;
    var u = ph.dur > 0 ? clamp01((now - hero.t0) / ph.dur) : 1;
    ph.step(u);
    if (u >= 1) {
      ph.end();
      hero.pi++; hero.t0 = now;
      if (hero.pi >= hero.phases.length) {
        hero.phases = [];
        if (!hero.glyphsOn) setForming(false);
        wireSvg.dataset.phase = 'idle';
        if (BEATS[current].map) { dot.classList.add('hero-hidden'); marker.style.visibility = ''; }
        drawHero();
        return;
      }
      beginPhase();
    }
    drawHero();
    hero.raf = requestAnimationFrame(tick);
  }
  function onReducedChange() {
    syncAmbient();
    if (reduced.matches && hero.target) {
      heroSettle(hero.target.T, hero.target.morphHere); flowSemantic(hero.target.beat);
      if (BEATS[current].map) { dot.classList.add('hero-hidden'); marker.style.visibility = ''; }
    }
  }

  /* ── Ambiente de rádio: só com o mapa visível e a aba ativa ── */
  function syncAmbient() {
    var on = current >= 0 && BEATS[current].layer === 'map' && !doc.hidden && !reduced.matches;
    body.classList.toggle('ambient', on);
  }

  /* ── Render ──────────────────────────────────────── */
  function render(b, instant) {
    var prev = current;
    var B = BEATS[b];
    var previousMap = prev >= 0 && BEATS[prev].layer === 'map';
    var markerOwned = previousMap && marker.style.visibility !== 'hidden';
    // Leave the indoor map from the displayed asset, including camera pan/zoom.
    var mapDeparture = null;
    if (markerOwned && B.layer !== 'map') {
      var mr = marker.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      var scale = sr.width / 1920;
      mapDeparture = { x: (mr.left + mr.width / 2 - sr.left) / scale, y: (mr.top + mr.height / 2 - sr.top) / scale };
    }
    var cs = getComputedStyle(line);
    // Valores de apresentação: uma interrupção parte de onde o fio está agora.
    var oldLine = {transform: cs.transform, width: cs.width, opacity: cs.opacity};
    if (lineAnim) { lineAnim.cancel(); lineAnim = null; }
    current = b;
    if (instant) stage.classList.add('snap');

    stage.dataset.beat = String(b);
    stage.dataset.scene = B.scene;
    body.dataset.theme = B.theme || (b >= LIGHT_FROM ? 'light' : 'dark');

    var ai = LAYER_ORDER.indexOf(B.layer);
    LAYER_ORDER.forEach(function (name, i) {
      var el = layers[name];
      if (!el) return;
      var active = i === ai;
      el.classList.toggle('is-active', active);
      el.classList.toggle('is-past', i < ai);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      if ('inert' in el) el.inert = !active;
    });

    reveals.forEach(function (el) {
      var on = Number(el.dataset.on);
      var off = el.dataset.off !== undefined ? Number(el.dataset.off) : Infinity;
      el.classList.toggle('is-on', b >= on && b < off);
    });

    var dotC = placeHero(B);
    if (b === FLOW_FIRST) {
      var logo = stagePos(byId('flow-logo-dot'));
      dotC = {x:logo.x + logo.w / 2, y:logo.y + logo.h / 2, r:logo.w / 2};
    }
    if (B.map) {
      if (!markerOwned) mapStatic(B.map);
      var targetMarker = marker.getBoundingClientRect(), stageRect = stage.getBoundingClientRect();
      var mapScale = stageRect.width / 1920;
      var mapLayerRect = layers.map.getBoundingClientRect(), mapBase = stagePos(layers.map);
      var shiftX = (mapLayerRect.left - stageRect.left) / mapScale - mapBase.x;
      var shiftY = (mapLayerRect.top - stageRect.top) / mapScale - mapBase.y;
      dotC = {x:(targetMarker.left + targetMarker.width / 2 - stageRect.left) / mapScale - shiftX, y:(targetMarker.top + targetMarker.height / 2 - stageRect.top) / mapScale - shiftY, r:14};
    }
    // Ponto, fio entre cenas e morfose da marca: um só controlador (heroTo).
    var routed = !instant && prev >= 0 && BEATS[prev].layer !== B.layer;
    if (mapDeparture) { hero.x = mapDeparture.x; hero.y = mapDeparture.y; hero.size = 28; drawHero(); }
    var eta = dotC ? heroTo({ x: dotC.x, y: dotC.y, size: dotC.r * 2 }, { instant: instant || prev < 0, routed: routed, from: prev, to: b, morphEl: B.morph || null, mapArrival: !!B.map && !markerOwned }) : 0;

    if (b === FLOW_FIRST) startFlowIntro(!instant && prev >= 0);
    if (B.map) {
      var arriving = !markerOwned && !instant && !reduced.matches;
      dot.classList.toggle('hero-hidden', !arriving);
      marker.style.visibility = arriving ? 'hidden' : '';
    } else { marker.style.visibility = ''; }

    // O fio recolhe antes de mudar de origem e só cresce depois que o ponto chegou:
    // nunca varre texto durante a viagem do ponto.
    var hadLine = parseFloat(oldLine.width) > 0.5 && Number(oldLine.opacity) > 0.05;
    var hasLine = !line.classList.contains('hero-line-off');
    if (!instant && prev >= 0 && line.animate && !reduced.matches && (hadLine || hasLine)) {
      var targetTransform = 'translate(' + stage.style.getPropertyValue('--lx') + ',' + stage.style.getPropertyValue('--ly') + ')';
      var targetWidth = stage.style.getPropertyValue('--lw');
      var frames;
      // O fio de conexão só cresce depois que o ponto chegou (eta do controlador).
      var total = Math.max(720, eta + 252);
      if (hasLine) {
        frames = [
          {transform: oldLine.transform, width: hadLine ? oldLine.width : '0px', opacity: 1, offset: 0},
          {transform: oldLine.transform, width: '0px', opacity: 1, offset: 130 / total},
          {transform: targetTransform, width: '0px', opacity: 1, offset: 144 / total},
          {transform: targetTransform, width: '0px', opacity: 1, offset: (total - 252) / total},
          {transform: targetTransform, width: targetWidth, opacity: 1, offset: 1}
        ];
      } else {
        frames = [
          {transform: oldLine.transform, width: oldLine.width, opacity: oldLine.opacity, offset: 0},
          {transform: oldLine.transform, width: '0px', opacity: 0, offset: .16},
          {transform: oldLine.transform, width: '0px', opacity: 0, offset: 1}
        ];
      }
      lineAnim = line.animate(frames, {duration: hasLine ? total : 720, easing: 'cubic-bezier(.22,1,.36,1)'});
    }

    if (B.map) {
      var prevMap = prev >= 0 ? BEATS[prev].map : null;
      if (!instant && markerOwned && prevMap === 'A' && B.map === 'C') mapMove(true);
      else if (!instant && markerOwned && prevMap === 'C' && B.map === 'A') mapMove(false);
      else if (!(prevMap === B.map && routeAnim)) mapStatic(B.map);
    } else {
      // Fora do mapa, o estado oculto do demonstrador depende só do beat.
      mapStatic(b < MAP_FIRST ? 'A' : 'C');
    }

    btnPrev.disabled = b === 0;
    btnNext.disabled = b === TOTAL - 1;
    ctlScene.textContent = SCENE_LABEL[B.scene];
    ctlCount.textContent = pad(PRESENTATION_ORDER.indexOf(b) + 1) + ' / ' + pad(PRESENTATION_TOTAL);
    if (prev === -1 || BEATS[prev].scene !== B.scene) live.textContent = SCENE_LABEL[B.scene];

    try { history.replaceState(null, '', '#b=' + b); } catch (e) { /* file:// sem history: ignora */ }

    if (instant) {
      void stage.offsetWidth;
      requestAnimationFrame(function () { stage.classList.remove('snap'); });
    }
    syncAmbient();
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function goTo(i, opts) {
    i = canonicalBeat(Math.max(0, Math.min(TOTAL - 1, Math.floor(Number(i) || 0))));
    if (i === current) return getState();
    var visibleDistance = Math.abs(PRESENTATION_ORDER.indexOf(i) - PRESENTATION_ORDER.indexOf(current));
    var instant = !!(opts && opts.instant) || visibleDistance > 1;
    render(i, instant);
    return getState();
  }
  function next() {
    var layer = BEATS[current].layer;
    var playback = layer === 'crm' ? window.constaProductDemo : layer === 'camera' ? window.constaCameraDemo : layer === 'smart-agenda' ? window.constaSmartAgenda : null;
    if (playback && playback.getState && playback.finishCurrent) {
      var state = playback.getState();
      if (state.beat === current && state.running) { playback.finishCurrent(); return goTo(adjacentBeat(1)); }
    }
    return goTo(adjacentBeat(1));
  }
  doc.addEventListener('consta:demo-complete', function (event) {
    var beat = event.detail && event.detail.beat;
    if ((beat === 8 || beat === 9) && current === beat) goTo(current + 1);
  });
  function prev() { return goTo(adjacentBeat(-1)); }
  function getState() { return { beat: current, scene: BEATS[current].scene, total: TOTAL }; }

  /* ── Tela cheia ─────────────────────────────────── */
  function toggleFullscreen() {
    var el = doc.documentElement;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(function () {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }

  /* ── Apoio (detalhes das frentes) ───────────────── */
  var tabs = Array.prototype.slice.call(appendix.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(appendix.querySelectorAll('[role="tabpanel"]'));
  var tabIndex = 0;
  function showTab(i, focus) {
    tabIndex = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) {
      var sel = k === tabIndex;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      panels[k].hidden = !sel;
    });
    if (focus) tabs[tabIndex].focus();
  }
  function openAppendix() { appendix.hidden = false; showTab(tabIndex, true); }
  function closeAppendix() { appendix.hidden = true; stage.focus({ preventScroll: true }); }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { showTab(k, true); }); });
  doc.getElementById('open-appendix').addEventListener('click', openAppendix);
  doc.getElementById('close-appendix').addEventListener('click', closeAppendix);
  appendix.addEventListener('click', function (e) { if (e.target === appendix) closeAppendix(); });

  /* ── Teclado e caneta de apresentação ───────────── */
  var lastKey = 0;
  var MIN_GAP = 140; // ms: absorve repetição dupla de alguns controles sem perder toques intencionais

  function isActivatable(t) {
    return t && t.closest && t.closest('a[href], button, input, textarea, select, [contenteditable="true"]');
  }

  doc.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;

    if (!appendix.hidden) {
      if (k === 'Escape') { e.preventDefault(); closeAppendix(); return; }
      var tabNext = k === 'ArrowRight' || k === 'PageDown' || k === 'ArrowDown';
      var tabPrev = k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp';
      if (tabNext || tabPrev) { e.preventDefault(); if (!e.repeat) showTab(tabIndex + (tabNext ? 1 : -1), true); }
      return;
    }

    var fwd = k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === 'Enter' || (k === ' ' && !e.shiftKey);
    var back = k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);
    var home = k === 'Home', end = k === 'End';

    // Enter/Espaço num link ou botão focado por teclado mantêm a ativação nativa.
    if ((k === 'Enter' || k === ' ') && isActivatable(e.target)) return;

    if (fwd || back || home || end) {
      e.preventDefault();
      if (e.repeat) return;
      var now = Date.now();
      if (now - lastKey < MIN_GAP) return;
      lastKey = now;
      if (fwd) next(); else if (back) prev(); else goTo(home ? 0 : TOTAL - 1);
      return;
    }
    if ((k === 'f' || k === 'F') && !e.repeat) { e.preventDefault(); toggleFullscreen(); }
  });

  // Após ativação por ponteiro, o foco volta ao palco: a caneta continua navegando
  // e um Enter posterior não reabre um link ou repete um botão.
  function releaseFocus() { setTimeout(function () { if (appendix.hidden) stage.focus({ preventScroll: true }); }, 0); }
  doc.getElementById('cover-link').addEventListener('click', function (e) {
    e.preventDefault();
    if (!appendix.hidden) closeAppendix();
    goTo(0);
    releaseFocus();
  });
  btnPrev.addEventListener('click', function (e) { prev(); if (e.detail) releaseFocus(); });
  btnNext.addEventListener('click', function (e) { next(); if (e.detail) releaseFocus(); });
  btnFs.addEventListener('click', function (e) { toggleFullscreen(); if (e.detail) releaseFocus(); });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a && e.detail) releaseFocus();
  });

  /* ── Ciclo de vida ──────────────────────────────── */
  doc.addEventListener('visibilitychange', syncAmbient);
  if (reduced.addEventListener) reduced.addEventListener('change', onReducedChange);
  else if (reduced.addListener) reduced.addListener(onReducedChange);
  window.addEventListener('resize', fit);

  function initialBeat() {
    var m = /[#&?]b=(\d+)/.exec(location.hash + location.search);
    return m ? Math.min(TOTAL - 1, Number(m[1])) : 0;
  }

  fit();
  render(canonicalBeat(initialBeat()), true);
  // Fontes locais podem alterar métricas depois do primeiro render: reposiciona o herói.
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { render(current, true); });
  window.addEventListener('load', function () { render(current, true); });
  window.addEventListener('hashchange', function () {
    var b = initialBeat();
    if (b !== current) goTo(b, { instant: true });
  });

  window.constaPitch = {
    next: next,
    prev: prev,
    goTo: function (i) { return goTo(i, { instant: true }); },
    getState: getState,
    scenes: SCENES.slice()
  };
})();
