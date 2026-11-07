"""Verifica destinos locais, recursos da marca e sintaxe dos exemplos JSON."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(r'!?\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))')
CSS_URL = re.compile(r'url\(\s*[\'"]?([^\'"\s)]+)')
FENCED_BLOCK = re.compile(r'^(`{3,}|~{3,}).*?^\1[^\n]*$', re.MULTILINE | re.DOTALL)


class AssetLinks(HTMLParser):
    """Extrai referências estáticas de páginas HTML."""

    def __init__(self):
        super().__init__()
        self.targets = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in {'href', 'src'} and value:
                self.targets.append(value)


def local_link_error(root, source, target):
    """Retorna o problema de um destino local, ou None quando válido/externo."""
    parsed = urlsplit(target)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    path = unquote(parsed.path)
    # A entrada HTML do Vite usa a raiz da aplicação, inclusive em URLs aninhadas.
    is_vite_entry = source.suffix == '.html' and any((source.parent / name).is_file() for name in ('vite.config.ts', 'vite.config.js'))
    web_root = source.parent if is_vite_entry else root
    destination = (web_root / path.lstrip('/') if path.startswith('/') else source.parent / path).resolve()
    if not destination.is_relative_to(root.resolve()):
        return f'destino fora do repositório: {target}'
    if not destination.exists() and is_vite_entry:
        public_destination = (source.parent / 'public' / path.lstrip('/')).resolve()
        if public_destination.is_relative_to(root.resolve()) and public_destination.exists():
            destination = public_destination
    # Cópias estáticas geradas pelo build são verificadas pela origem declarada,
    # permitindo validar um checkout limpo antes de executar Node/Vite.
    manifest = source.parent / 'static-copies.json'
    if not destination.exists() and is_vite_entry and manifest.is_file():
        requested = Path(path.lstrip('/'))
        for mount, origin in json.loads(manifest.read_text(encoding='utf-8')).items():
            if requested.is_relative_to(Path(mount)):
                copied_source = (source.parent / origin / requested.relative_to(mount)).resolve()
                if copied_source.is_relative_to(root.resolve()) and copied_source.exists():
                    destination = copied_source
                    break
    if not destination.exists():
        return f'destino local inexistente: {target}'
    return None


def inspect_file(root, source):
    """Verifica referências de arquivo, sem acessar rede ou resolver âncoras."""
    errors = []
    targets = []
    try:
        if source.suffix == '.md':
            content = FENCED_BLOCK.sub('', source.read_text(encoding='utf-8'))
            targets = [match.group(1) or match.group(2) for match in MARKDOWN_LINK.finditer(content)]
        elif source.suffix == '.html':
            parser = AssetLinks()
            parser.feed(source.read_text(encoding='utf-8'))
            targets = parser.targets
        elif source.suffix == '.css':
            targets = CSS_URL.findall(source.read_text(encoding='utf-8'))
        elif source.suffix == '.json':
            json.loads(source.read_text(encoding='utf-8'))
        elif source.suffix == '.svg':
            ET.parse(source)
    except (ValueError, ET.ParseError, OSError) as error:
        return [f'arquivo inválido: {error}']
    for target in targets:
        error = local_link_error(root, source, target)
        if error:
            errors.append(error)
    return errors


def main():
    result = subprocess.run(
        ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        cwd=ROOT, check=True, capture_output=True,
    )
    errors = []
    for name in sorted(set(result.stdout.decode('utf-8').split('\0')) - {''}):
        source = ROOT / name
        if not source.is_file():
            errors.append(f'{name}: arquivo do índice ausente; revise a exclusão no Git')
            continue
        if source.suffix not in {'.md', '.html', '.css', '.json', '.svg'}:
            continue
        errors.extend(f'{name}: {message}' for message in inspect_file(ROOT, source))
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print('Referências locais, recursos da marca e sintaxe dos exemplos: OK.')
    print('Links externos, âncoras e comportamento do produto não foram verificados.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
