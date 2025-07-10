import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Define types for the analysis data
interface AnalysisData {
  [key: string]: any;
}

// Register NotoSansArabic Regular font
Font.register({ family: 'NotoSansArabic', src: '/fonts/NotoSansArabic-Regular.ttf' });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'NotoSansArabic',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  arabicTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 18,
    color: '#2d3748',
    fontFamily: 'NotoSansArabic',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2b6cb0',
    fontFamily: 'NotoSansArabic',
    textAlign: 'right',
  },
  content: {
    fontSize: 14,
    lineHeight: 1.8,
    marginBottom: 18,
    textAlign: 'right',
    fontFamily: 'NotoSansArabic',
  },
  note: {
    fontSize: 10,
    color: '#e53e3e',
    marginBottom: 20,
    fontFamily: 'NotoSansArabic',
    textAlign: 'right',
  },
});

// Props interface for the PDF component
interface LegalReportPDFProps {
  analysis: AnalysisData;
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

// PDF Document Component
const LegalReportPDF: React.FC<LegalReportPDFProps> = ({ analysis }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.arabicTitle}>تقرير تحليل القضية القانونية</Text>
        <Text style={styles.note}>
          تم توليد هذا التقرير تلقائياً بواسطة المساعد القانوني الخبير. جميع المعلومات مستخلصة من تحليل نص القضية المدخل.
        </Text>
        {analysis && Object.entries(arabicSections).map(([key, title]) => (
          analysis[key] && (
            <View key={key} style={styles.section}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.content}>{Array.isArray(analysis[key]) ? analysis[key].join('\n') : String(analysis[key])}</Text>
            </View>
          )
        ))}
      </View>
    </Page>
  </Document>
);

export class ReactPDFReportGenerator {
  async generateReport(analysis: AnalysisData): Promise<string> {
    try {
      const doc = <LegalReportPDF analysis={analysis} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `legal_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateBlobUrl(analysis: AnalysisData): Promise<string> {
    try {
      const doc = <LegalReportPDF analysis={analysis} />;
      const blob = await pdf(doc).toBlob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating PDF blob:', error);
      throw new Error('Failed to generate PDF blob: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
