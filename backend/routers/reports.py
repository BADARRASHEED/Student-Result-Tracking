from datetime import date
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from .. import models
from ..database import get_db
from ..services.analytics import calculate_percentage, grade_from_percentage

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/student/{student_id}")
def student_report(student_id: int, term: str = "Term 1", db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    margin = 42
    midnight = colors.HexColor("#0b1021")
    deep_blue = colors.HexColor("#1e3a8a")
    cyan = colors.HexColor("#22d3ee")
    soft_bg = colors.HexColor("#f8fafc")
    border = colors.HexColor("#e2e8f0")
    muted = colors.HexColor("#475569")

    def paint_canvas_backdrop() -> None:
        p.setFillColor(soft_bg)
        p.rect(0, 0, width, height, fill=1, stroke=0)
        p.setFillColor(midnight)
        p.roundRect(margin - 6, height - 170, width - 2 * (margin - 6), 140, 16, fill=1, stroke=0)
        p.setFillColor(deep_blue)
        p.roundRect(margin - 6, height - 210, width / 2.6, 60, 16, fill=1, stroke=0)

    def header_block() -> None:
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 18)
        p.drawString(margin + 8, height - 90, "Sajana Analytics • Student Performance")
        p.setFont("Helvetica", 11)
        p.drawString(margin + 8, height - 108, "Modern summary of grades, momentum, and insights")
        p.setFont("Helvetica-Bold", 10)
        p.setFillColor(cyan)
        p.drawString(width - margin - 140, height - 96, term.upper())
        p.setFillColor(colors.white)
        p.setFont("Helvetica", 9)
        p.drawString(width - margin - 140, height - 112, "Generated on: " + date.today().strftime("%b %d, %Y"))

    def student_identity_card(start_y: float) -> float:
        card_height = 86
        p.setFillColor(colors.white)
        p.roundRect(margin, start_y - card_height, width - 2 * margin, card_height, 12, fill=1, stroke=0)
        p.setStrokeColor(border)
        p.roundRect(margin, start_y - card_height, width - 2 * margin, card_height, 12, fill=0, stroke=1)

        p.setFillColor(midnight)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(margin + 16, start_y - 18, student.name)
        p.setFont("Helvetica", 10.5)
        p.setFillColor(muted)
        class_name = student.class_obj.name if student.class_obj else "N/A"
        p.drawString(margin + 16, start_y - 34, f"Roll #{student.roll_number}  •  Class {class_name}")
        p.drawString(margin + 16, start_y - 50, "Report powered by Sajana Insights")

        p.setFillColor(deep_blue)
        p.roundRect(width - margin - 120, start_y - 46, 110, 34, 10, fill=1, stroke=0)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(width - margin - 108, start_y - 24, "Student Profile")
        return start_y - card_height - 16

    def stat_chip(x_pos: float, y_pos: float, title: str, value: str, highlight: colors.Color) -> None:
        chip_width = (width - 2 * margin - 24) / 3
        p.setFillColor(colors.white)
        p.roundRect(x_pos, y_pos - 66, chip_width, 66, 10, fill=1, stroke=0)
        p.setStrokeColor(border)
        p.roundRect(x_pos, y_pos - 66, chip_width, 66, 10, fill=0, stroke=1)
        p.setFillColor(muted)
        p.setFont("Helvetica", 10)
        p.drawString(x_pos + 14, y_pos - 20, title)
        p.setFillColor(highlight)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(x_pos + 14, y_pos - 38, value)

    def table_header(y_pos: float) -> None:
        p.setFillColor(deep_blue)
        p.roundRect(margin, y_pos - 18, width - 2 * margin, 32, 10, fill=1, stroke=0)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(margin + 12, y_pos, "Assessment")
        p.drawString(margin + 210, y_pos, "Subject")
        p.drawString(margin + 360, y_pos, "Score")
        p.drawString(margin + 452, y_pos, "Percent")
        p.drawString(margin + 530, y_pos, "Grade")

    def ensure_row_space(current_y: float) -> float:
        if current_y < 110:
            p.showPage()
            paint_canvas_backdrop()
            header_block()
            after_header = student_identity_card(height - 200)
            summary_band(after_header)
            new_y = after_header - 120
            table_header(new_y)
            return new_y - 28
        return current_y

    def summary_band(start_y: float) -> float:
        metrics_y = start_y - 12
        stat_chip(margin, metrics_y, "Overall Percentage", f"{overall}%", cyan)
        stat_chip(margin + ((width - 2 * margin - 24) / 3) + 12, metrics_y, "Overall Grade", overall_grade, deep_blue)
        stat_chip(margin + 2 * ((width - 2 * margin - 24) / 3) + 24, metrics_y, "Assessments", str(len(term_marks)), midnight)
        return metrics_y - 78

    def narrative_block(start_y: float) -> None:
        p.setFillColor(colors.white)
        p.roundRect(margin, start_y - 86, width - 2 * margin, 86, 12, fill=1, stroke=0)
        p.setStrokeColor(border)
        p.roundRect(margin, start_y - 86, width - 2 * margin, 86, 12, fill=0, stroke=1)
        p.setFillColor(midnight)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(margin + 14, start_y - 22, "Coach Notes")
        p.setFillColor(muted)
        p.setFont("Helvetica", 10.5)
        p.drawString(margin + 14, start_y - 42, comment)
        p.setFillColor(cyan)
        p.setFont("Helvetica", 9)
        p.drawString(margin + 14, start_y - 62, "Shareable, printer ready, and aligned to Sajana's new visual system")

    paint_canvas_backdrop()
    header_block()

    term_marks = [mark for mark in student.marks if mark.assessment.term == term]
    term_marks.sort(key=lambda m: (m.assessment.date or date.min, m.assessment.name))

    total_pct = [calculate_percentage(m.marks_obtained, m.assessment.maximum_marks) for m in term_marks]
    overall = round(sum(total_pct) / len(total_pct), 2) if total_pct else 0
    overall_grade = grade_from_percentage(overall)

    comment = "Building foundation — add more practice sessions"
    if overall >= 90:
        comment = "Outstanding mastery — keep challenging with advanced material"
    elif overall >= 75:
        comment = "Great momentum — maintain consistency and stretch goals"
    elif overall >= 60:
        comment = "Solid progress — focus on weak topics for next term"

    y_position = student_identity_card(height - 200)
    y_position = summary_band(y_position)

    table_header(y_position)
    y_position -= 28

    if not term_marks:
        p.setFillColor(muted)
        p.setFont("Helvetica", 11)
        p.drawString(margin, y_position, "No assessments available for this term.")
        y_position -= 24
    else:
        for index, mark in enumerate(term_marks):
            pct = calculate_percentage(mark.marks_obtained, mark.assessment.maximum_marks)
            grade = grade_from_percentage(pct)
            row_color = colors.HexColor("#e0f2fe") if index % 2 == 0 else colors.white
            p.setFillColor(row_color)
            p.roundRect(margin, y_position - 14, width - 2 * margin, 28, 8, fill=1, stroke=0)

            p.setFillColor(midnight)
            p.setFont("Helvetica-Bold", 10.5)
            p.drawString(margin + 12, y_position + 2, mark.assessment.name)
            p.setFillColor(muted)
            p.setFont("Helvetica", 10.5)
            p.drawString(margin + 210, y_position + 2, mark.assessment.subject.name if mark.assessment.subject else "")
            p.drawString(margin + 360, y_position + 2, f"{mark.marks_obtained}/{mark.assessment.maximum_marks}")
            p.setFillColor(deep_blue)
            p.drawString(margin + 452, y_position + 2, f"{pct:.1f}%")
            p.setFillColor(cyan)
            p.drawString(margin + 530, y_position + 2, grade)

            y_position -= 28
            y_position = ensure_row_space(y_position)

    narrative_block(y_position)

    p.showPage()
    p.save()

    buffer.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=report_{student.roll_number}.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
