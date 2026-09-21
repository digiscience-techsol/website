"""Build the public cost-planning one-pager from its reviewed Markdown source.

Requires reportlab. Run from any directory; no network calls or credentials.
"""
from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'proof-assets-source/cloud-ai-cost-governance-snapshot.md'
TARGET = ROOT / 'assets/digiscience-cloud-ai-cost-governance-snapshot.pdf'
styles = {
    'title': ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=22, leading=26, spaceAfter=10, textColor=colors.HexColor('#10233F')),
    'heading': ParagraphStyle('Heading', fontName='Helvetica-Bold', fontSize=11, leading=14, spaceBefore=8, spaceAfter=4, keepWithNext=True, textColor=colors.HexColor('#164B70')),
    'body': ParagraphStyle('Body', fontName='Helvetica', fontSize=9.5, leading=13, spaceAfter=6, textColor=colors.HexColor('#17233B')),
}

def linked_text(text):
    """Make only explicit public HTTPS references clickable in the PDF."""
    return re.sub(r'https://[^\s<>]+', lambda match: '<link href="' + match[0] + '" color="#164B70">' + match[0] + '</link>', escape(text))

def footer(canvas, document):
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#475569'))
    canvas.drawString(18 * mm, 12 * mm, 'DigiScience Techsol | Planning guidance | digisciencetechsol.com')
    canvas.drawRightString(192 * mm, 12 * mm, str(document.page))

story = []
for line in SOURCE.read_text().splitlines():
    if not line.strip():
        continue
    kind = 'title' if line.startswith('# ') else 'heading' if line.startswith('## ') else 'body'
    story.append(Paragraph(linked_text(line.lstrip('# ')), styles[kind]))

document = SimpleDocTemplate(str(TARGET), pagesize=(210 * mm, 297 * mm), leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=22 * mm, title='Cloud + AI Cost Governance Snapshot', author='DigiScience Techsol', invariant=1)
document.build(story, onFirstPage=footer, onLaterPages=footer)
print(TARGET)
