import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
// @ts-expect-error: No types for 'arabic-reshaper'
import arabicReshaper from 'arabic-reshaper';
// @ts-expect-error: No types for 'bidi-js'
import bidi from 'bidi-js';
async function fetchFont(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

// Helper: shape and reorder Arabic text for PDF
function shapeArabic(text: string): string {
  // Reshape and apply bidi algorithm
  return bidi.getEmbeddingLevels(arabicReshaper.reshape(text)).text;
}

const arabicSections: Record<string, string> = {
  'نوع_القضية': 'نوع القضية',
  'التكييف_القانوني': 'التكييف القانوني',
  'النصوص_القانونية_ذات_الصلة': 'النصوص القانونية ذات الصلة',
  'الوقائع_الجوهرية': 'الوقائع الجوهرية',
  'العناصر_المادية_والمعنوية': 'العناصر المادية والمعنوية',
  'الدفاعات_الممكنة': 'الدفاعات الممكنة',
  'الإجراءات_المقترحة': 'الإجراءات المقترحة',
  'سوابق_قضائية_مغربية_محتملة': 'سوابق قضائية مغربية محتملة',
};

export class PDFLibReportGenerator {
  async generateReport(analysis: Record<string, any>): Promise<string> {
    // 1. Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetchFont('/fonts/NotoSansArabic-Regular.ttf');
    const arabicFont = await pdfDoc.embedFont(fontBytes, { subset: false });

    // 2. Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();
    let y = height - 80;
    const margin = 60;
    const lineHeight = 30;
    const sectionSpacing = 18;

    // Draw border for elegance
    page.drawRectangle({
      x: 30, y: 30, width: width - 60, height: height - 60,
      borderColor: rgb(0.2, 0.3, 0.5),
      borderWidth: 2,
      color: undefined,
    });

    // Title
    const title = shapeArabic('تقرير تحليل القضية');
    const titleWidth = arabicFont.widthOfTextAtSize(title, 28);
    page.drawText(title, {
      x: width - margin - titleWidth,
      y,
      size: 28,
      font: arabicFont,
      color: rgb(0.13, 0.18, 0.32),
    });
    y -= lineHeight * 1.5;

    // Note
    const note = shapeArabic('تم توليد هذا التقرير تلقائياً بواسطة المساعد القانوني الخبير. جميع المعلومات مستخلصة من تحليل نص القضية المدخل.');
    const noteWidth = arabicFont.widthOfTextAtSize(note, 13);
    page.drawText(note, {
      x: width - margin - noteWidth,
      y,
      size: 13,
      font: arabicFont,
      color: rgb(0.8, 0.2, 0.2),
    });
    y -= lineHeight * 1.2;

    // Sections
    for (const [key, title] of Object.entries(arabicSections)) {
      if (analysis[key]) {
        // Section title
        const sectionTitle = shapeArabic(title);
        const sectionTitleWidth = arabicFont.widthOfTextAtSize(sectionTitle, 18);
        page.drawText(sectionTitle, {
          x: width - margin - sectionTitleWidth,
          y,
          size: 18,
          font: arabicFont,
          color: rgb(0.16, 0.4, 0.7),
        });
        y -= lineHeight * 0.9;
        // Section content
        const content = Array.isArray(analysis[key]) ? analysis[key].join('\n') : String(analysis[key]);
        const lines = content.split(/\n|\r/).filter(Boolean);
        for (const line of lines) {
          const shapedLine = shapeArabic(line);
          const lineWidth = arabicFont.widthOfTextAtSize(shapedLine, 14);
          page.drawText(shapedLine, {
            x: width - margin - lineWidth,
            y,
            size: 14,
            font: arabicFont,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight * 0.7;
        }
        y -= sectionSpacing;
      }
    }

    // 6. Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_تحليل_قانوني_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return url;
  }
} 