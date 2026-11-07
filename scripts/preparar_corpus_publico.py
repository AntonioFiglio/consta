"""Build a public, text-auditable contract corpus without changing source files.

Requires PyMuPDF. Excludes source archives, internal plans and image-only PDFs.
CPF masking is a targeted precaution, not a full personal-data/legal audit.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import zipfile

import fitz

CPF = re.compile(r"(?<!\d)\d{3}\s*\.\s*\d{3}\s*\.\s*\d{3}\s*-\s*\d{2}(?!\d)")
PLAIN_CPF = re.compile(r"(?i)(CPF(?:\s*/\s*MF)?\s*(?:n[ºo°.]*)?\s*[:=]?\s*)(\d{11})(?!\d)")
TEXT_TYPES = {'.txt', '.md', '.csv', '.json'}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def mask_text(text: str) -> str:
    return PLAIN_CPF.sub(r'\1[CPF OCULTADO]', CPF.sub('[CPF OCULTADO]', text))


def public_pdf(data: bytes) -> tuple[bytes | None, str]:
    document = fitz.open(stream=data, filetype='pdf')
    masked = False
    try:
        if document.needs_pass:
            return None, 'pdf_protegido_requer_revisao_local'
        for page in document:
            page_text = page.get_text()
            if not page_text.strip() and page.get_images():
                return None, 'pagina_imagem_sem_texto_requer_revisao_local'
            compact_text = re.sub(r'\s+', '', page_text)
            if not CPF.search(compact_text) and not PLAIN_CPF.search(compact_text):
                continue
            characters = []
            for block in page.get_text('rawdict')['blocks']:
                for line in block.get('lines', []):
                    for span in line['spans']:
                        characters.extend(span['chars'])
            # Ignore whitespace when matching a CPF wrapped across lines.
            characters = [char for char in characters if not char['c'].isspace()]
            compact = ''.join(char['c'] for char in characters)
            spans = [(match.start(), match.end()) for match in CPF.finditer(compact)]
            for match in PLAIN_CPF.finditer(compact):
                spans.append(match.span(2))
            for start, end in spans:
                for char in characters[start:end]:
                    page.add_redact_annot(fitz.Rect(char['bbox']), fill=(0, 0, 0))
                masked = True
            if spans:
                page.apply_redactions(images=2, graphics=0, text=0)
        if not masked:
            return data, 'original_textual_sem_cpf_alvo_detectado'
        result = document.tobytes(garbage=4, deflate=True)
        verification = fitz.open(stream=result, filetype='pdf')
        try:
            for page in verification:
                compact = re.sub(r'\s+', '', page.get_text())
                if CPF.search(compact) or PLAIN_CPF.search(compact):
                    raise ValueError('CPF alvo permanece no texto do derivado')
        finally:
            verification.close()
        return result, 'derivado_com_cpf_alvo_ocultado'
    finally:
        document.close()


def exclusion(path: Path) -> str | None:
    if any(part.startswith('.') or part == '_raw' for part in path.parts):
        return 'metadado_oculto_ou_raw_duplicado'
    if '02-planta' in path.parts:
        return 'planta_interna_fora_do_corpus_de_contratos'
    if path.suffix.lower() not in TEXT_TYPES | {'.pdf'}:
        return 'arquivo_auxiliar_ou_pacote_aninhado_preservado_na_origem'
    return None


def build(source: Path, output: Path, manifest: Path) -> None:
    records = []
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.building.zip')
    try:
        with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for path in sorted(source.rglob('*')):
                if not path.is_file():
                    continue
                relative = path.relative_to(source)
                reason = exclusion(relative)
                record = {'arquivo': relative.as_posix()}
                if reason:
                    record.update(estado='excluido', motivo=reason)
                    records.append(record)
                    continue
                original = path.read_bytes()
                record.update(sha256_origem=digest(original), bytes_origem=len(original))
                try:
                    if path.suffix.lower() == '.pdf':
                        print('Processando:', relative, flush=True)
                        public, status = public_pdf(original)
                    else:
                        text = original.decode('utf-8-sig')
                        public = mask_text(text).encode('utf-8')
                        status = 'texto_auxiliar_cpf_alvo_ocultado' if public != original else 'texto_auxiliar'
                except (ValueError, RuntimeError, UnicodeError) as error:
                    public, status = None, 'erro_processamento_' + type(error).__name__
                if public is None:
                    record.update(estado='excluido', motivo=status)
                else:
                    archive.writestr(source.name + '/' + relative.as_posix(), public)
                    record.update(estado='incluido', tratamento=status, sha256=digest(public), bytes=len(public))
                records.append(record)
            note = ('Corpus público para avaliação documental. Originais preservados em Downloads. '
                    'Cópias com CPFs-alvo ocultados não conservam validade de assinatura digital. '
                    'Planilhas são auxiliares heurísticos, não gabarito. Plantas, _raw, pacotes aninhados '
                    'e PDFs de imagem sem texto ficaram fora. Mascaramento automático não é auditoria integral de dados pessoais.\n')
            archive.writestr(source.name + '/LEIA-ME-CORPUS-PUBLICO.txt', note)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    manifest.write_text(json.dumps({
        'origem': 'Pasta fornecida por Matheus em 07/11/2026; originais preservados fora do repositório.',
        'escopo': 'Corpus público derivado e curado; não é cópia integral nem auditoria jurídica/PII completa.',
        'pacote': {'arquivo': output.name, 'raiz': source.name, 'sha256': digest(output.read_bytes())},
        'arquivos': records,
    }, ensure_ascii=False, indent=2) + '\n')
    print('Pacote e manifesto preparados:', output, manifest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('manifest', type=Path)
    args = parser.parse_args()
    build(args.source, args.output, args.manifest)
