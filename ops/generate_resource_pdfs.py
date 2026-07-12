#!/usr/bin/env python3
"""Generate polished customer-facing PDFs from DigiScience resource Markdown."""

from pathlib import Path
from html import escape
import re
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, KeepTogether


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "downloads"
OUTPUT = ROOT / "output" / "pdf"
PUBLISH = ROOT / "assets" / "downloads"

NAVY = colors.HexColor("#07101D")
BLUE = colors.HexColor("#5EA8FF")
MINT = colors.HexColor("#84F0DA")
INK = colors.HexColor("#102239")
MUTED = colors.HexColor("#50647E")
PALE = colors.HexColor("#EEF5FC")
LINE = colors.HexColor("#D7E4F1")


def clean_text(value: str) -> str:
    replacements = {
        "\u2011": "-", "\u2013": "-", "\u2014": "-", "\u2192": "->",
        "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return value.strip()


def register_fonts():
    regular = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    bold = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("DigiSans", str(regular)))
        pdfmetrics.registerFont(TTFont("DigiSans-Bold", str(bold)))
        return "DigiSans", "DigiSans-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName=FONT_BOLD, fontSize=25, leading=31, textColor=NAVY, alignment=TA_LEFT, spaceAfter=8 * mm),
        "subtitle": ParagraphStyle("Subtitle", parent=base["BodyText"], fontName=FONT, fontSize=11.5, leading=18, textColor=MUTED, spaceAfter=8 * mm),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName=FONT_BOLD, fontSize=15, leading=20, textColor=NAVY, spaceBefore=5 * mm, spaceAfter=3 * mm, keepWithNext=True),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName=FONT, fontSize=9.6, leading=15, textColor=INK, spaceAfter=3.2 * mm),
        "bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName=FONT, fontSize=9.4, leading=14.5, leftIndent=6 * mm, firstLineIndent=-3.5 * mm, bulletIndent=1.5 * mm, textColor=INK, spaceAfter=1.8 * mm),
        "label": ParagraphStyle("Label", parent=base["BodyText"], fontName=FONT_BOLD, fontSize=8.2, leading=11, textColor=BLUE, spaceAfter=2.5 * mm, uppercase=True),
        "cta": ParagraphStyle("CTA", parent=base["BodyText"], fontName=FONT_BOLD, fontSize=10.2, leading=15, textColor=NAVY, backColor=PALE, borderColor=LINE, borderWidth=0.6, borderPadding=10, borderRadius=6, spaceBefore=3 * mm, spaceAfter=4 * mm),
    }


STYLES = styles()


def draw_page(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 17 * mm, width, 17 * mm, fill=1, stroke=0)
    canvas.setFillColor(MINT)
    canvas.setFont(FONT_BOLD, 9)
    canvas.drawString(18 * mm, height - 10.5 * mm, "DIGISCIENCE TECHSOL")
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT, 7.6)
    canvas.drawRightString(width - 18 * mm, height - 10.5 * mm, "AI-first cloud transformation")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont(FONT, 7.4)
    canvas.drawString(18 * mm, 9 * mm, "digisciencetechsol.com")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def paragraph_markup(text: str) -> str:
    text = escape(clean_text(text))
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    return text


def build_story(markdown: str):
    lines = markdown.splitlines()
    story = [Spacer(1, 10 * mm)]
    title = "Enterprise AI Resource"
    pending = []

    def flush_pending():
        nonlocal pending
        if pending:
            story.append(Paragraph(paragraph_markup(" ".join(pending)), STYLES["body"]))
            pending = []

    for raw in lines:
        line = clean_text(raw)
        if not line:
            flush_pending()
            continue
        if line.startswith("# "):
            flush_pending()
            title = line[2:].strip()
            story.extend([
                Paragraph(paragraph_markup(title), STYLES["title"]),
                Paragraph("A practical enterprise decision guide from DigiScience Techsol", STYLES["subtitle"]),
            ])
        elif line.startswith("## "):
            flush_pending()
            heading = line[3:].strip()
            if heading == "Next Step CTA":
                story.append(Spacer(1, 2 * mm))
            else:
                story.append(Paragraph(paragraph_markup(heading), STYLES["h2"]))
        elif line.startswith("- "):
            flush_pending()
            story.append(Paragraph(paragraph_markup(line[2:]), STYLES["bullet"], bulletText="•"))
        elif line.lower().startswith("asset type:"):
            flush_pending()
            story.append(Paragraph(paragraph_markup(line.upper()), STYLES["label"]))
        elif story and isinstance(story[-1], Spacer) and "Book a 30-minute" in line:
            story.append(Paragraph(paragraph_markup(line), STYLES["cta"]))
        elif line.startswith("Book a 30-minute"):
            flush_pending()
            story.append(Paragraph(paragraph_markup(line), STYLES["cta"]))
        else:
            pending.append(line)

    flush_pending()
    story.extend([
        Spacer(1, 5 * mm),
        Paragraph("Reference architectures and solution briefs illustrate DigiScience delivery methods. Customer outcomes are published only with verified evidence and permission.", STYLES["body"]),
    ])
    return title, story


def generate(source: Path):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    output = OUTPUT / f"{source.stem}.pdf"
    _, story = build_story(source.read_text(encoding="utf-8"))
    doc = BaseDocTemplate(
        str(output), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=24 * mm, bottomMargin=20 * mm, title=source.stem.replace("-", " ").title(),
        author="DigiScience Techsol", subject="Enterprise AI architecture and decision guide",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")
    doc.addPageTemplates([PageTemplate(id="resource", frames=[frame], onPage=draw_page)])
    doc.build(story)
    published = PUBLISH / output.name
    shutil.copy2(output, published)
    return output, published


def main():
    for source in sorted(SOURCE.glob("*.md")):
        output, published = generate(source)
        print(f"Generated {output.relative_to(ROOT)} -> {published.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
