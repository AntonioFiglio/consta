"""Regression checks for irreversible CPF masking and corpus exclusions."""
import unittest
import fitz
from preparar_corpus_publico import public_pdf, mask_text, exclusion
from pathlib import Path


class PublicCorpusTests(unittest.TestCase):
    def test_pdf_mask_preserves_asset_identity(self):
        document = fitz.open()
        page = document.new_page()
        page.insert_text((60, 60), 'CPF 123.456.789-\n00\nSerie 04389 / Patrimonio FZ18204')
        source = document.tobytes()
        public, status = public_pdf(source)
        self.assertEqual(status, 'derivado_com_cpf_alvo_ocultado')
        parsed = fitz.open(stream=public, filetype='pdf')
        text = parsed[0].get_text()
        self.assertNotIn('123.456.789', text)
        self.assertIn('04389', text)
        self.assertIn('FZ18204', text)
        self.assertIn('123.456.789', fitz.open(stream=source, filetype='pdf')[0].get_text())

    def test_auxiliary_text_masks_wrapped_and_plain_cpf(self):
        self.assertNotIn('123.456.789', mask_text('CPF: 123.456.789-\n00'))
        self.assertNotIn('12345678900', mask_text('CPF/MF: 12345678900'))
        self.assertIn('04389', mask_text('Serie 04389'))

    def test_no_raw_archives_or_internal_plans(self):
        self.assertIsNotNone(exclusion(Path('08-hospital-unico-HCFMUSP/02-planta/planta.pdf')))
        self.assertIsNotNone(exclusion(Path('07-dossies-por-contrato/a/_raw/a.pdf')))
        self.assertIsNotNone(exclusion(Path('contratos/fonte.zip')))
        self.assertIsNone(exclusion(Path('contratos/contrato.pdf')))


if __name__ == '__main__':
    unittest.main()
