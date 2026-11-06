"""Gera as assinaturas Consta em curvas e suas versões rasterizadas."""
from pathlib import Path
import xml.etree.ElementTree as ET
import subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

BRAND = Path(__file__).resolve().parents[1]
ROOT = BRAND.parent
FONT = instantiateVariableFont(TTFont(BRAND / 'fonts/Manrope-Variable.ttf'), {'wght': 650})
glyphs = FONT.getGlyphSet()
cmap = FONT.getBestCmap()
source = ET.parse(BRAND / 'reference/consta-symbol-original.svg').getroot()
petals = ''.join(f'<path d="{node.attrib["d"]}"/>' for node in source.iter('{http://www.w3.org/2000/svg}path'))
word_paths = []
advance = 0
for letter in 'consta':
    name = cmap[ord(letter)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    word_paths.append(f'<path transform="translate({advance} 0)" d="{pen.getCommands()}"/>')
    advance += FONT['hmtx'][name][0] - 12
word = ''.join(word_paths)

def symbol(x, y, size, color):
    return f'<g fill="{color}" transform="translate({x} {y}) scale({size/373}) translate(-160 -145)">{petals}</g>'

def lettering(x, baseline, scale, color):
    return f'<g fill="{color}" transform="translate({x} {baseline}) scale({scale} {-scale})">{word}</g>'

# A escrita em curvas preserva a tipografia escolhida em qualquer dispositivo.
layouts = {
    'symbol': (440, 440, lambda a,b: symbol(34,34,373,a)),
    'wordmark': (1000, 300, lambda a,b: lettering(55,245,0.14,b)),
    'horizontal': (1280,440, lambda a,b: symbol(32,34,373,a) + lettering(460,304,0.12,b)),
    'stacked': (760,760, lambda a,b: symbol(190,64,380,a) + lettering(78,658,0.095,b)),
}
variants = {
    'navy': ('#154F6F','#154F6F',None),
    'ice': ('#D3EFFF','#D3EFFF',None),
    'black': ('#000000','#000000',None),
    'white': ('#FFFFFF','#FFFFFF',None),
    'on-ice': ('#154F6F','#154F6F','#D3EFFF'),
    'on-navy': ('#D3EFFF','#FFFFFF','#154F6F'),
    'on-white': ('#154F6F','#154F6F','#FFFFFF'),
    'on-black': ('#D3EFFF','#FFFFFF','#000000'),
}
for layout,(width,height,draw) in layouts.items():
    for variant,(a,b,bg) in variants.items():
        label = f'Consta — {layout} — {variant}'
        background = f'<rect width="{width}" height="{height}" fill="{bg}"/>' if bg else ''
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{label}</title>{background}{draw(a,b)}</svg>\n'
        target = BRAND / f'logo/svg/consta-{layout}-{variant}.svg'
        target.write_text(svg)
        subprocess.run(['rsvg-convert','-w',str(width*2),'-o',str(BRAND/f'logo/png/consta-{layout}-{variant}.png'),str(target)],check=True)
(ROOT/'consta-logo.svg').write_text((BRAND/'logo/svg/consta-symbol-navy.svg').read_text())
print('Arquivos SVG e PNG da marca gerados com sucesso.')

from PIL import Image, ImageDraw, ImageFont
sheet = Image.new('RGB', (1500, 1350), '#F4F6F7')
draw = ImageDraw.Draw(sheet)
label_font = ImageFont.truetype(str(BRAND/'fonts/Manrope-Variable.ttf'), 24)
draw.text((52,32), 'consta / identidade visual', fill='#154F6F', font=label_font)
for row, layout in enumerate(layouts):
    for col, variant in enumerate(['on-ice','on-navy','on-white']):
        x, y = 40+col*490, 100+row*310
        draw.rounded_rectangle((x,y,x+465,y+255), radius=18, fill=variants[variant][2])
        preview = Image.open(BRAND/f'logo/png/consta-{layout}-{variant}.png').convert('RGBA')
        preview.thumbnail((425,225))
        sheet.paste(preview, (x+(465-preview.width)//2,y+(255-preview.height)//2), preview)
        draw.text((x,y+265), f'{layout} / {variant}', fill='#154F6F', font=label_font)
sheet.save(BRAND/'brand-overview.png')
