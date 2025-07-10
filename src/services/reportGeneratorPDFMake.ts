import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// You need to convert your NotoSansArabic-Regular.ttf to base64 and add it here
// For demo, we'll use the built-in fonts, but you should replace with your own
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Example: If you have the base64 string for NotoSansArabic-Regular.ttf
// pdfMake.vfs['NotoSansArabic-Regular.ttf'] = 'AAEAAA...';

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

export class PDFMakeReportGenerator {
  async generateReport(analysis: Record<string, any>): Promise<void> {
    // Build content
    const content: any[] = [
      { text: 'تقرير تحليل القضية', style: 'header', alignment: 'center', margin: [0, 0, 0, 16] },
      { text: 'تم توليد هذا التقرير تلقائياً بواسطة المساعد القانوني الخبير. جميع المعلومات مستخلصة من تحليل نص القضية المدخل.', style: 'note', alignment: 'center', margin: [0, 0, 0, 20] },
    ];

    for (const [key, title] of Object.entries(arabicSections)) {
      if (analysis[key]) {
        content.push({ text: title, style: 'sectionHeader', alignment: 'right', margin: [0, 0, 0, 6] });
        const value = Array.isArray(analysis[key]) ? analysis[key].join('\n') : String(analysis[key]);
        content.push({ text: value, style: 'sectionContent', alignment: 'right', margin: [0, 0, 0, 16] });
      }
    }

    // Define document
    const docDefinition = {
      content,
      defaultStyle: {
        font: 'NotoSansArabic',
        fontSize: 14,
        alignment: 'right',
      },
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: '#1a365d',
        },
        note: {
          fontSize: 12,
          color: '#e53e3e',
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          color: '#2b6cb0',
        },
        sectionContent: {
          fontSize: 14,
          color: '#222',
        },
      },
      pageMargins: [40, 60, 40, 60],
      pageSize: 'A4',
      pageOrientation: 'portrait',
      // Register your font here
      fonts: {
        NotoSansArabic: {
          normal: 'NotoSansArabic-Regular.ttf',
          bold: 'NotoSansArabic-Regular.ttf',
          italics: 'NotoSansArabic-Regular.ttf',
          bolditalics: 'NotoSansArabic-Regular.ttf',
        },
      },
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`تقرير_تحليل_قانوني_${new Date().toISOString().split('T')[0]}.pdf`);
  }
} 