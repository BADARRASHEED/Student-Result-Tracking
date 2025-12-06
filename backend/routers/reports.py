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

    margin = 50
    brand = colors.HexColor("#0f172a")
    accent = colors.HexColor("#0284c7")
    subtle = colors.HexColor("#e2e8f0")

    def page_header():
        p.setFillColor(brand)
        p.roundRect(margin, height - 125, width - 2 * margin, 86, 12, fill=1, stroke=0)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 18)
        p.drawString(margin + 16, height - 70, "Sajana · Student Result Tracking")
        p.setFont("Helvetica", 11)
        p.drawString(margin + 16, height - 88, "Performance & analytics snapshot")

    def info_panel():
        panel_height = 64
        y_pos = height - 154
        p.setFillColor(colors.HexColor("#f8fafc"))
        p.roundRect(margin, y_pos - panel_height + 8, width - 2 * margin, panel_height, 12, fill=1, stroke=0)
        p.setFillColor(subtle)
        p.roundRect(margin, y_pos - panel_height + 8, width - 2 * margin, panel_height, 12, fill=0, stroke=1)
        p.setFillColor(brand)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(margin + 16, y_pos, student.name)
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.HexColor("#334155"))
        class_name = student.class_obj.name if student.class_obj else "N/A"
        p.drawString(margin + 16, y_pos - 16, f"Roll: {student.roll_number}  |  Class: {class_name}  |  Term: {term}")
        p.setFillColor(accent)
        p.drawString(margin + 16, y_pos - 32, "Generated via Sajana Analytics")

    def draw_table_header(y_pos: float):
        p.setFillColor(colors.HexColor("#f1f5f9"))
        p.roundRect(margin, y_pos - 14, width - 2 * margin, 28, 8, fill=1, stroke=0)
        p.setFillColor(brand)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(margin + 8, y_pos + 4, "Assessment")
        p.drawString(margin + 200, y_pos + 4, "Subject")
        p.drawString(margin + 350, y_pos + 4, "Score")
        p.drawString(margin + 430, y_pos + 4, "Percent")
        p.drawString(margin + 500, y_pos + 4, "Grade")

    def ensure_space(current_y: float) -> float:
        if current_y < 110:
            p.showPage()
            page_header()
            info_panel()
            new_y = height - 220
            draw_table_header(new_y)
            return new_y - 26
        return current_y

    page_header()
    info_panel()

    term_marks = [mark for mark in student.marks if mark.assessment.term == term]
    term_marks.sort(key=lambda m: (m.assessment.date or date.min, m.assessment.name))

    y = height - 220
    draw_table_header(y)
    y -= 26
    total_pct = []

    if not term_marks:
        p.setFillColor(brand)
        p.setFont("Helvetica", 11)
        p.drawString(margin, y, "No assessments available for this term.")
        y -= 22
    else:
        for idx, mark in enumerate(term_marks):
            pct = calculate_percentage(mark.marks_obtained, mark.assessment.maximum_marks)
            grade = grade_from_percentage(pct)
            total_pct.append(pct)

            row_fill = colors.HexColor("#f8fafc") if idx % 2 == 0 else colors.white
            p.setFillColor(row_fill)
            p.roundRect(margin, y - 12, width - 2 * margin, 24, 6, fill=1, stroke=0)

            p.setFillColor(brand)
            p.setFont("Helvetica", 10.5)
            p.drawString(margin + 8, y + 2, mark.assessment.name)
            p.setFillColor(colors.HexColor("#475569"))
            p.drawString(margin + 200, y + 2, mark.assessment.subject.name if mark.assessment.subject else "")
            p.drawString(margin + 350, y + 2, f"{mark.marks_obtained}/{mark.assessment.maximum_marks}")
            p.drawString(margin + 430, y + 2, f"{pct:.1f}%")
            p.drawString(margin + 500, y + 2, grade)

            y -= 26
            y = ensure_space(y)

    overall = round(sum(total_pct) / len(total_pct), 2) if total_pct else 0
    overall_grade = grade_from_percentage(overall)

    summary_y = y - 6
    if summary_y - 90 < margin:
        p.showPage()
        page_header()
        info_panel()
        y = height - 220
        summary_y = y - 6

    card_width = (width - 2 * margin - 12) / 2

    p.setFillColor(colors.white)
    p.roundRect(margin, summary_y - 46, card_width, 52, 10, fill=1, stroke=0)
    p.setStrokeColor(subtle)
    p.roundRect(margin, summary_y - 46, card_width, 52, 10, fill=0, stroke=1)
    p.setFillColor(brand)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(margin + 14, summary_y - 18, "Overall Percentage")
    p.setFillColor(accent)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(margin + 14, summary_y - 32, f"{overall}%")

    p.setFillColor(colors.white)
    p.roundRect(margin + card_width + 12, summary_y - 46, card_width, 52, 10, fill=1, stroke=0)
    p.setStrokeColor(subtle)
    p.roundRect(margin + card_width + 12, summary_y - 46, card_width, 52, 10, fill=0, stroke=1)
    p.setFillColor(brand)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(margin + card_width + 26, summary_y - 18, "Overall Grade")
    p.setFillColor(accent)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(margin + card_width + 26, summary_y - 32, overall_grade)

    comment = "Needs improvement"
    if overall >= 85:
        comment = "Excellent performance"
    elif overall >= 70:
        comment = "Consistent, keep it up"
    elif overall >= 55:
        comment = "Satisfactory progress"

    note_y = summary_y - 64
    p.setFillColor(colors.HexColor("#f8fafc"))
    p.roundRect(margin, note_y - 42, width - 2 * margin, 52, 10, fill=1, stroke=0)
    p.setStrokeColor(subtle)
    p.roundRect(margin, note_y - 42, width - 2 * margin, 52, 10, fill=0, stroke=1)
    p.setFillColor(brand)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin + 14, note_y - 14, "Comment")
    p.setFont("Helvetica", 10.5)
    p.setFillColor(colors.HexColor("#475569"))
    p.drawString(margin + 14, note_y - 28, comment)
    p.setFillColor(colors.HexColor("#94a3b8"))
    p.setFont("Helvetica", 9)
    p.drawString(margin + 14, note_y - 40, "Generated with Sajana Analytics • Clear, concise, and ready to share")

    p.showPage()
    p.save()

    buffer.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=report_{student.roll_number}.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
