import { jsPDF } from 'jspdf';

// Add Arabic font support
declare module 'jspdf' {
  interface jsPDF {
    addFileToVFS(filename: string, filecontent: string): void;
    addFont(filename: string, fontName: string, fontStyle: string): void;
  }
}

/**
 * Generates automatic reports for legal cases.
 */
export class ReportGenerator {
  /**
   * Processes text for better PDF display by handling Arabic characters
   */
  private processTextForPdf(text: string): string {
    if (!text || text.trim() === '') return '';
    
    // Clean up text
    let processed = text.replace(/\s+/g, ' ').trim();
    
    // If text contains Arabic characters, create a note
    if (this.hasArabicText(processed)) {
      const arabicWords = processed.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g) || [];
      const transliterated = this.transliterateArabicText(processed);
      
      if (arabicWords.length > 0) {
        return `${transliterated}\n\n[Note: Original text contains Arabic content - refer to the web application for accurate display]`;
      }
    }
    
    return processed;
  }

  /**
   * Checks if text contains Arabic characters
   */
  private hasArabicText(text: string): boolean {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  }

  /**
   * Transliterates Arabic text to Latin characters
   */
  private transliterateArabicText(text: string): string {
    const arabicToLatin: { [key: string]: string } = {
      'ت': 't', 'ب': 'b', 'ا': 'a', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ر': 'r', 'س': 's', 'ع': 'a', 'ف': 'f', 
      'ق': 'q', 'ك': 'k', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o', 'إ': 'i', 'أ': 'a',
      'آ': 'aa', 'ة': 'h', 'ى': 'a', 'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ز': 'z', 'ش': 'sh',
      'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'غ': 'gh', 'ث': 'th',
      // Common words
      'قضية': 'Qadiya (Case)', 'قانون': 'Qanun (Law)', 'محكمة': 'Mahkama (Court)', 'نوع': 'Naw (Type)',
      'التكييف': 'Takyif (Classification)', 'القانوني': 'Qanuni (Legal)', 'النصوص': 'Nusus (Texts)',
      'الوقائع': 'Waqai (Facts)', 'الجوهرية': 'Jawhariya (Essential)', 'العناصر': 'Anasr (Elements)',
      'المادية': 'Madiya (Material)', 'المعنوية': 'Manawiya (Moral)', 'الدفاعات': 'Difa\'at (Defenses)',
      'الممكنة': 'Mumkina (Possible)', 'الإجراءات': 'Ijra\'at (Procedures)', 'المقترحة': 'Muqtaraha (Suggested)',
      'سوابق': 'Sawabiq (Precedents)', 'قضائية': 'Qada\'iya (Judicial)', 'مغربية': 'Maghribiya (Moroccan)',
      'محتملة': 'Muhtamala (Potential)', 'جنائية': 'Jinayya (Criminal)', 'مدنية': 'Madaniya (Civil)',
      'تجارية': 'Tijariya (Commercial)', 'إدارية': 'Idariya (Administrative)'
    };

    let result = text;
    
    // Replace whole words first
    for (const [arabic, latin] of Object.entries(arabicToLatin)) {
      if (arabic.length > 1) {
        const regex = new RegExp(`\\b${arabic}\\b`, 'g');
        result = result.replace(regex, latin);
      }
    }
    
    // Replace individual characters
    for (const [arabic, latin] of Object.entries(arabicToLatin)) {
      if (arabic.length === 1) {
        const regex = new RegExp(arabic, 'g');
        result = result.replace(regex, latin);
      }
    }
    
    // Clean up any remaining Arabic characters
    result = result.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
    result = result.replace(/\s+/g, ' ').trim();
    
    return result || '[Arabic content - transliteration not available]';
  }

  /**
   * Generates a report based on case analysis and returns a downloadable URL.
   * @param analysis - The analysis result from the legal case.
   * @returns URL to download the generated PDF file.
   */
  async generateReport(analysis: any): Promise<string> {
    try {
      console.log('Full analysis object:', analysis);
      
      // Create a new PDF document using jsPDF
      const doc = new jsPDF();
      
      // Try to add Arabic font support (optional enhancement)
      try {
        // You can add a custom Arabic font here
        // doc.addFileToVFS('NotoSansArabic-Regular.ttf', arabicFontBase64);
        // doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
      } catch (fontError) {
        console.log('Arabic font not available, using default font');
      }
      
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 8;
      
      // Helper function to add text with Arabic support
      const addText = (text: string, x: number, y: number, options: {
        fontSize?: number;
        fontStyle?: string;
        isArabic?: boolean;
        maxWidth?: number;
      } = {}) => {
        const { fontSize = 10, fontStyle = 'normal', isArabic = false, maxWidth = pageWidth - 2 * margin } = options;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        
        let textToAdd = text;
        
        // If Arabic text detected, try to use Arabic font or fallback to transliteration
        if (isArabic && this.hasArabicText(text)) {
          try {
            // Try to set Arabic font if available
            // doc.setFont('NotoSansArabic', 'normal');
            // If no Arabic font, use transliteration
            textToAdd = this.processTextForPdf(text);
          } catch (error) {
            textToAdd = this.processTextForPdf(text);
          }
        }
        
        // Handle text wrapping
        const lines = doc.splitTextToSize(textToAdd, maxWidth);
        lines.forEach((line: string, index: number) => {
          if (y + (index * lineHeight) > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, x, y + (index * lineHeight));
        });
        
        return y + (lines.length * lineHeight);
      };
      
      // Title (English)
      yPosition = addText('Legal Case Analysis Report', margin, yPosition, {
        fontSize: 18,
        fontStyle: 'bold'
      });
      yPosition += 10;
      
      // Title (Arabic)
      yPosition = addText('تقرير تحليل القضية القانونية', margin, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        isArabic: true
      });
      yPosition += 15;
      
      // Subtitle (English)
      yPosition = addText('Al-Khabir Legal Assistant - Moroccan Law Analysis', margin, yPosition, {
        fontSize: 12
      });
      yPosition += 8;
      
      // Subtitle (Arabic)
      yPosition = addText('المساعد القانوني الخبير - تحليل القانون المغربي', margin, yPosition, {
        fontSize: 11,
        isArabic: true
      });
      yPosition += 15;
      
      // Date
      yPosition = addText(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPosition, {
        fontSize: 10
      });
      yPosition += 20;
      
      // Important note
      const noteText = 'ملاحظة مهمة: هذا التقرير يحتوي على النص العربي. إذا ظهر النص مشوهاً، يرجى الرجوع إلى التطبيق الأصلي.';
      yPosition = addText(noteText, margin, yPosition, {
        fontSize: 9,
        fontStyle: 'italic',
        isArabic: true
      });
      yPosition += 15;
      
      // Function to add section
      const addSection = (titleEn: string, titleAr: string, content: string) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Section title (English)
        yPosition = addText(titleEn, margin, yPosition, {
          fontSize: 12,
          fontStyle: 'bold'
        });
        yPosition += 2;
        
        // Section title (Arabic)
        yPosition = addText(titleAr, margin, yPosition, {
          fontSize: 11,
          fontStyle: 'bold',
          isArabic: true
        });
        yPosition += 10;
        
        // Section content
        yPosition = addText(content, margin, yPosition, {
          fontSize: 10,
          isArabic: true
        });
        yPosition += 15;
        
        return yPosition;
      };
      
      // Add analysis content
      if (analysis && typeof analysis === 'object') {
        // Arabic keys with both English and Arabic titles
        const sections = {
          'نوع_القضية': {
            en: 'Case Type',
            ar: 'نوع القضية'
          },
          'التكييف_القانوني': {
            en: 'Legal Classification',
            ar: 'التكييف القانوني'
          },
          'النصوص_القانونية_ذات_الصلة': {
            en: 'Relevant Legal Texts',
            ar: 'النصوص القانونية ذات الصلة'
          },
          'الوقائع_الجوهرية': {
            en: 'Key Facts',
            ar: 'الوقائع الجوهرية'
          },
          'العناصر_المادية_والمعنوية': {
            en: 'Material and Moral Elements',
            ar: 'العناصر المادية والمعنوية'
          },
          'الدفاعات_الممكنة': {
            en: 'Possible Defenses',
            ar: 'الدفاعات الممكنة'
          },
          'الإجراءات_المقترحة': {
            en: 'Suggested Procedures',
            ar: 'الإجراءات المقترحة'
          },
          'سوابق_قضائية_مغربية_محتملة': {
            en: 'Potential Moroccan Precedents',
            ar: 'سوابق قضائية مغربية محتملة'
          }
        };

        let hasContent = false;
        
        // Process each section
        for (const [key, titles] of Object.entries(sections)) {
          if (analysis[key]) {
            hasContent = true;
            
            let content = '';
            if (Array.isArray(analysis[key])) {
              content = analysis[key].map((item: string, index: number) => `${index + 1}. ${item}`).join('\n\n');
            } else {
              content = String(analysis[key]);
            }
            
            yPosition = addSection(titles.en, titles.ar, content);
          }
        }

        // If no Arabic content, try English keys
        if (!hasContent) {
          const englishKeys = {
            'caseType': 'Case Type',
            'legalAnalysis': 'Legal Analysis',
            'recommendations': 'Recommendations',
            'precedents': 'Legal Precedents',
            'summary': 'Summary',
            'raw': 'Analysis Content'
          };

          for (const [englishKey, englishTitle] of Object.entries(englishKeys)) {
            if (analysis[englishKey] && typeof analysis[englishKey] === 'string' && analysis[englishKey].trim() !== '') {
              hasContent = true;
              yPosition = addSection(englishTitle, englishTitle, analysis[englishKey]);
            }
          }
        }

        // If still no content, display available data
        if (!hasContent) {
          yPosition = addSection('Available Analysis Data', 'البيانات المتوفرة', JSON.stringify(analysis, null, 2));
        }
      } else {
        yPosition = addSection('Analysis Result', 'نتيجة التحليل', 'No analysis data available.');
      }

      // Footer on all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Generated by Al-Khabir Legal Assistant | مولد بواسطة المساعد القانوني الخبير', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${pageCount} | صفحة ${i} من ${pageCount}`, pageWidth - 60, pageHeight - 10);
      }

      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `legal_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
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
