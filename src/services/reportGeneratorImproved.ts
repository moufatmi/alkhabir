import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Fallback font loading with better error handling
async function loadArabicFont(pdfDoc: PDFDocument): Promise<any> {
  try {
    // Try to load from public folder first
    const fontUrl = '/fonts/NotoSansArabic-Regular.ttf';
    console.log('Attempting to load font from:', fontUrl);
    
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const fontBytes = await response.arrayBuffer();
    console.log('Font loaded successfully, size:', fontBytes.byteLength);
    
    const arabicFont = await pdfDoc.embedFont(new Uint8Array(fontBytes), { subset: false });
    console.log('Arabic font embedded successfully');
    return arabicFont;
  } catch (error) {
    console.warn('Failed to load Arabic font, using fallback:', error);
    // Return Helvetica as fallback
    return null;
  }
}

// Safe Arabic text reshaping with fallback
function safeReshapeText(text: string): string {
  try {
    // Try to use arabic-reshaper and bidi-js if available
    if (typeof window !== 'undefined' && (window as any).arabicReshaper && (window as any).bidi) {
      const reshaper = (window as any).arabicReshaper;
      const bidi = (window as any).bidi;
      return bidi.getEmbeddingLevels(reshaper.reshape(text)).text;
    }
    
    // Simple fallback: just reverse for RTL display
    return text.split('').reverse().join('');
  } catch (error) {
    console.warn('Text reshaping failed, using original:', error);
    return text;
  }
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

export class ImprovedReportGenerator {
  async generateReport(analysis: Record<string, any>): Promise<string> {
    try {
      console.log('Starting PDF generation with analysis:', analysis);
      
      // Step 1: Create PDF document
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      
      // Step 2: Try to load Arabic font
      const arabicFont = await loadArabicFont(pdfDoc);
      const usingArabicFont = arabicFont !== null;
      console.log('Using Arabic font:', usingArabicFont);
      
      // Step 3: Add page
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      let y = height - 80;
      const margin = 60;
      const lineHeight = 25;
      
      // Step 4: Helper function to add text with proper positioning
      const addText = (text: string, fontSize: number = 14, color = rgb(0, 0, 0)) => {
        try {
          let processedText = text;
          let textWidth = 0;
          
          if (usingArabicFont) {
            processedText = safeReshapeText(text);
            textWidth = arabicFont.widthOfTextAtSize(processedText, fontSize);
          } else {
            // For fallback font, estimate width
            textWidth = text.length * fontSize * 0.6;
          }
          
          const x = Math.max(margin, width - margin - textWidth);
          
          page.drawText(processedText, {
            x,
            y,
            size: fontSize,
            font: usingArabicFont ? arabicFont : undefined,
            color,
          });
          
          y -= lineHeight;
          console.log(`Added text: "${text.substring(0, 50)}..." at y=${y}`);
        } catch (error) {
          console.error('Error adding text:', error);
          // Skip this text and continue
          y -= lineHeight;
        }
      };
      
      // Step 5: Add content
      // Title
      addText('تقرير تحليل القضية القانونية', 24, rgb(0.13, 0.18, 0.32));
      y -= 10;
      
      // Subtitle
      addText('المساعد القانوني الخبير - القانون المغربي', 16, rgb(0.16, 0.4, 0.7));
      y -= 10;
      
      // Date
      const now = new Date();
      const dateText = `تاريخ الإنشاء: ${now.toLocaleDateString('ar-MA')} - ${now.toLocaleTimeString('ar-MA')}`;
      addText(dateText, 12, rgb(0.5, 0.5, 0.5));
      y -= 20;
      
      // Content sections
      let hasContent = false;
      for (const [key, title] of Object.entries(arabicSections)) {
        if (analysis && analysis[key]) {
          hasContent = true;
          
          // Section title
          addText(title, 16, rgb(0.16, 0.4, 0.7));
          y -= 5;
          
          // Section content
          let content = '';
          if (Array.isArray(analysis[key])) {
            content = analysis[key].map((item: any, index: number) => `${index + 1}. ${String(item)}`).join('\n');
          } else {
            content = String(analysis[key]);
          }
          
          // Split content into lines
          const lines = content.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (y < margin + 50) {
              // Add new page if needed
              const newPage = pdfDoc.addPage([595.28, 841.89]);
              y = height - 80;
            }
            addText(line.trim(), 12);
          }
          
          y -= 10; // Extra space between sections
        }
      }
      
      // If no Arabic content found, try English keys
      if (!hasContent && analysis) {
        const englishKeys = ['summary', 'analysis', 'recommendations', 'conclusion', 'raw'];
        for (const key of englishKeys) {
          if (analysis[key] && typeof analysis[key] === 'string' && analysis[key].trim()) {
            hasContent = true;
            addText(`${key}: ${analysis[key]}`, 12);
            y -= 5;
          }
        }
      }
      
      // If still no content, show debug info
      if (!hasContent) {
        addText('لا توجد بيانات تحليل متاحة', 14, rgb(0.8, 0.2, 0.2));
        addText(`البيانات المتوفرة: ${JSON.stringify(Object.keys(analysis || {})).substring(0, 100)}`, 10);
      }
      
      // Footer
      const footerY = 40;
      page.drawText('مولد بواسطة المساعد القانوني الخبير', {
        x: width - margin - 200,
        y: footerY,
        size: 10,
        font: usingArabicFont ? arabicFont : undefined,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Step 6: Generate and download
      console.log('Generating PDF bytes...');
      const pdfBytes = await pdfDoc.save();
      console.log('PDF generated successfully, size:', pdfBytes.length);
      
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير_قانوني_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download triggered successfully');
      return url;
      
    } catch (error) {
      console.error('Complete PDF generation error:', error);
      
      // Detailed error reporting
      if (error instanceof Error) {
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name
        };
        console.error('Error details:', errorDetails);
        throw new Error(`فشل في توليد التقرير: ${error.message}`);
      } else {
        console.error('Unknown error type:', error);
        throw new Error('فشل في توليد التقرير: خطأ غير معروف');
      }
    }
  }
}