import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';

/**
 * Generates automatic reports for legal cases.
 */
export class ReportGenerator {
  /**
   * Generates a report based on case details and saves it as a PDF file.
   * @param caseDetails - The details of the case.
   * @returns Path to the generated PDF file.
   */
  async generateReport(caseDetails: { notes: string[]; documents: File[] }): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const notesSection = caseDetails.notes.join('\n');
    const documentsSection = caseDetails.documents.map(doc => doc.name).join(', ');

    const content = `Case Report:\n\nNotes:\n${notesSection}\n\nDocuments:\n${documentsSection}`;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(content, {
      x: 50,
      y: height - 50 - textHeight,
      size: fontSize,
      font,
      maxWidth: width - 100,
    });

    const pdfBytes = await pdfDoc.save();
    const filePath = `./generated_report.pdf`;
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
  }
}
