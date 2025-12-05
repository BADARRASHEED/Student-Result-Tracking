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

    # Header banner
    p.setFillColor(colors.HexColor("#0f172a"))
    p.roundRect(margin, height - 125, width - 2 * margin, 90, 10, fill=1, stroke=0)
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 18)
    p.drawString(margin + 18, height - 65, "Sajana – Student Result Tracking")
    p.setFont("Helvetica", 11)
    p.drawString(margin + 18, height - 82, "Performance & Analytics Report")

    # Student info strip
    info_y = height - 150
    p.setFillColor(colors.HexColor("#0ea5e9"))
    p.roundRect(margin, info_y - 6, width - 2 * margin, 32, 6, fill=1, stroke=0)
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin + 12, info_y + 10, f"Student: {student.name}")
    p.setFont("Helvetica", 10)
    p.drawString(margin + 12, info_y - 4, f"Roll: {student.roll_number}   Class: {student.class_obj.name if student.class_obj else 'N/A'}   Term: {term}")

    def draw_table_header(y_pos: float):
        p.setFillColor(colors.HexColor("#e5e7eb"))
        p.roundRect(margin, y_pos - 14, width - 2 * margin, 28, 6, fill=1, stroke=0)
        p.setFillColor(colors.HexColor("#111827"))
        p.setFont("Helvetica-Bold", 11)
        p.drawString(margin + 8, y_pos + 4, "Assessment")
        p.drawString(margin + 170, y_pos + 4, "Subject")
        p.drawString(margin + 310, y_pos + 4, "Score")
        p.drawString(margin + 380, y_pos + 4, "Percent")
        p.drawString(margin + 460, y_pos + 4, "Grade")

    y = height - 200
    draw_table_header(y)
    y -= 26
    total_pct = []
    for mark in student.marks:
        if mark.assessment.term != term:
            continue
        pct = calculate_percentage(mark.marks_obtained, mark.assessment.maximum_marks)
        grade = grade_from_percentage(pct)
        total_pct.append(pct)
        p.setFillColor(colors.HexColor("#111827"))
        p.setFont("Helvetica", 11)
        p.drawString(margin + 8, y, mark.assessment.name)
        p.drawString(margin + 170, y, mark.assessment.subject.name if mark.assessment.subject else "")
        p.drawString(margin + 310, y, f"{mark.marks_obtained}/{mark.assessment.maximum_marks}")
        p.drawString(margin + 380, y, f"{pct:.1f}%")
        p.drawString(margin + 460, y, grade)
        y -= 22
        if y < 120:
            p.showPage()
            y = height - 80
            draw_table_header(y)
            y -= 26

    overall = round(sum(total_pct) / len(total_pct), 2) if total_pct else 0
    overall_grade = grade_from_percentage(overall)

    summary_y = y - 6
    p.setFillColor(colors.HexColor("#0ea5e9"))
    p.roundRect(margin, summary_y - 32, (width - 2 * margin) / 2 - 6, 42, 8, fill=1, stroke=0)
    p.roundRect(margin + (width - 2 * margin) / 2 + 6, summary_y - 32, (width - 2 * margin) / 2 - 6, 42, 8, fill=1, stroke=0)
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(margin + 14, summary_y - 8, f"Overall Percentage: {overall}%")
    p.drawString(margin + (width - 2 * margin) / 2 + 20, summary_y - 8, f"Overall Grade: {overall_grade}")

    comment = "Needs Improvement"
    if overall >= 85:
        comment = "Excellent performance"
    elif overall >= 70:
        comment = "Good job"
    elif overall >= 55:
        comment = "Satisfactory"

    p.setFillColor(colors.HexColor("#111827"))
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin, summary_y - 48, "Comment")
    p.setFont("Helvetica", 11)
    p.drawString(margin, summary_y - 64, comment)
    p.setFillColor(colors.HexColor("#6b7280"))
    p.setFont("Helvetica", 9)
    p.drawString(margin, summary_y - 80, "Thank you for using Sajana Analytics to track student growth.")

    p.showPage()
    p.save()

    buffer.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=report_{student.roll_number}.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
