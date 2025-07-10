import { jsPDF } from 'jspdf';
import { arabicFontBase64 } from '../fonts/arabicFont';
import { createCanvas } from 'canvas';

// Add Arabic font support
declare module 'jspdf' {
  interface jsPDF {
    addFileToVFS(filename: string, filecontent: string): void;
    addFont(filename: string, fontName: string, fontStyle: string): void;
  }
}

/**
 * Generates automatic reports for legal cases in Arabic.
 */
export class ReportGenerator {
  /**
   * Generates a report based on case analysis and returns a downloadable URL.
   * @param analysis - The analysis result from the legal case.
   * @returns URL to download the generated PDF file.
   */
  async generateReport(analysis: any): Promise<string> {
    try {
      console.log('Full analysis object:', analysis);
      
      // Create a new PDF document using jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
      });
      
      // Add Arabic font support
      try {
        doc.addFileToVFS('NotoSansArabic-Regular.ttf', arabicFontBase64);
        doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
        doc.setFont('NotoSansArabic', 'normal');
      } catch (fontError) {
        console.log('Arabic font not available, using default font');
      }
      
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 8;
      
      // Create canvas for text measurement and rendering
      const canvas = createCanvas(pageWidth, pageHeight);
      const ctx = canvas.getContext('2d');
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Helper function to add RTL text with proper Arabic support
      const addRtlText = (text: string, y: number, options: {
        fontSize?: number;
        fontStyle?: string;
        maxWidth?: number;
      } = {}) => {
        const { fontSize = 10, maxWidth = pageWidth - 2 * margin } = options;

        doc.setFontSize(fontSize);
        doc.setFont('NotoSansArabic', 'normal');

        // Set canvas font to match PDF
        ctx.font = `${fontSize}px NotoSansArabic`;
        
        // Measure and wrap text using canvas
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? `${word} ${currentLine}` : word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Add each line to the PDF
        lines.reverse().forEach((line, index) => {
          if (y + (index * lineHeight) > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(line, pageWidth - margin, y + (index * lineHeight), {
            align: 'right',
            isInputVisual: true,
            isOutputVisual: true
          });
        });

        return y + (lines.length * lineHeight);
      };
      
      // Title
      yPosition = addRtlText('تقرير تحليل القضية القانونية', yPosition, {
        fontSize: 18
      });
      yPosition += 15;
      
      // Subtitle
      yPosition = addRtlText('المساعد القانوني الخبير - تحليل القانون المغربي', yPosition, {
        fontSize: 12
      });
      yPosition += 15;
      
      // Date in Arabic
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const arabicDate = today.toLocaleDateString('ar-MA', options);
      yPosition = addRtlText(`تاريخ الإنشاء: ${arabicDate}`, yPosition, {
        fontSize: 10
      });
      yPosition += 20;
      
      // Important note
      const noteText = 'ملاحظة مهمة: هذا التقرير يحتوي على النص العربي. إذا ظهر النص مشوهاً، يرجى الرجوع إلى التطبيق الأصلي.';
      yPosition = addRtlText(noteText, yPosition, {
        fontSize: 9
      });
      yPosition += 15;
      
      // Function to add section
      const addSection = (titleAr: string, content: string) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Section title
        yPosition = addRtlText(titleAr, yPosition, {
          fontSize: 12
        });
        yPosition += 10;
        
        // Section content
        yPosition = addRtlText(content, yPosition, {
          fontSize: 10
        });
        yPosition += 15;
        
        return yPosition;
      };
      
      // Add analysis content
      if (analysis && typeof analysis === 'object') {
        // Arabic keys with Arabic titles
        const sections = {
          'نوع_القضية': 'نوع القضية',
          'التكييف_القانوني': 'التكييف القانوني',
          'النصوص_القانونية_ذات_الصلة': 'النصوص القانونية ذات الصلة',
          'الوقائع_الجوهرية': 'الوقائع الجوهرية',
          'العناصر_المادية_والمعنوية': 'العناصر المادية والمعنوية',
          'الدفاعات_الممكنة': 'الدفاعات الممكنة',
          'الإجراءات_المقترحة': 'الإجراءات المقترحة',
          'سوابق_قضائية_مغربية_محتملة': 'سوابق قضائية مغربية محتملة'
        };

        let hasContent = false;
        
        // Process each section
        for (const [key, title] of Object.entries(sections)) {
          if (analysis[key]) {
            hasContent = true;
            
            let content = '';
            if (Array.isArray(analysis[key])) {
              content = analysis[key].map((item: string, index: number) => `${index + 1}. ${item}`).join('\n\n');
            } else {
              content = String(analysis[key]);
            }
            
            yPosition = addSection(title, content);
          }
        }

        // If no Arabic content, try English keys but display in Arabic
        if (!hasContent) {
          const englishToArabic = {
            'caseType': 'نوع القضية',
            'legalAnalysis': 'التحليل القانوني',
            'recommendations': 'التوصيات',
            'precedents': 'السوابق القانونية',
            'summary': 'الملخص',
            'raw': 'محتوى التحليل'
          };

          for (const [englishKey, arabicTitle] of Object.entries(englishToArabic)) {
            if (analysis[englishKey] && typeof analysis[englishKey] === 'string' && analysis[englishKey].trim() !== '') {
              hasContent = true;
              yPosition = addSection(arabicTitle, analysis[englishKey]);
            }
          }
        }

        // If still no content, display available data
        if (!hasContent) {
          yPosition = addSection('البيانات المتوفرة', JSON.stringify(analysis, null, 2));
        }
      } else {
        yPosition = addSection('نتيجة التحليل', 'لا توجد بيانات تحليل متاحة.');
      }

      // Footer on all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('NotoSansArabic', 'normal');
        
        const footerText = 'مولد بواسطة المساعد القانوني الخبير';
        doc.text(footerText, pageWidth - margin, pageHeight - 10, {
          align: 'right',
          isInputVisual: true,
          isOutputVisual: true
        });
        
        const pageText = `صفحة ${i} من ${pageCount}`;
        doc.text(pageText, pageWidth - 60, pageHeight - 10, {
          align: 'right',
          isInputVisual: true,
          isOutputVisual: true
        });
      }

      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Trigger download with Arabic filename
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير_تحليل_قانوني_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
