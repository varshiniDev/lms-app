// Generates a printable certificate PDF in the browser (jsPDF, loaded on demand).
import { BRAND } from "../config/brand";
export async function downloadCertificate({ certificateNo, studentName, courseName, issuedOn, grade }) {
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }); const W = 297, H = 210;
  doc.setDrawColor(255, 90, 68); doc.setLineWidth(2.2); doc.rect(8, 8, W - 16, H - 16); doc.setDrawColor(245, 130, 32); doc.setLineWidth(0.6); doc.rect(13, 13, W - 26, H - 26);
  doc.setTextColor(32, 32, 32); doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text(BRAND.name.toUpperCase(), W / 2, 40, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(13); doc.setTextColor(110); doc.text("CERTIFICATE OF COMPLETION", W / 2, 52, { align: "center" });
  doc.setFontSize(12); doc.text("This is to certify that", W / 2, 76, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(34); doc.setTextColor(255, 90, 68); doc.text(studentName, W / 2, 98, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(60); doc.text("has successfully completed the course", W / 2, 116, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(32, 32, 32); doc.text(courseName, W / 2, 132, { align: "center" });
  if (grade) { doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(60); doc.text(`Grade: ${grade}`, W / 2, 144, { align: "center" }); }
  doc.setFontSize(10); doc.setTextColor(110); doc.text(`Date of issue: ${issuedOn}`, 30, 178); doc.text(`Certificate No: ${certificateNo}`, W - 30, 178, { align: "right" });
  doc.setDrawColor(150); doc.setLineWidth(0.3); doc.line(W / 2 - 30, 176, W / 2 + 30, 176); doc.text("Authorised signatory", W / 2, 182, { align: "center" });
  doc.save(`${certificateNo}-${studentName.replace(/\s+/g, "_")}.pdf`);
}
