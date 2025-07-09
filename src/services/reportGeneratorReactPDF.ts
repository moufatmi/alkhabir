import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a365d'
  },
  arabicTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    color: '#2d3748',
    fontFamily: 'Helvetica' // Arabic fonts can be added here
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4a5568'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2b6cb0'
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 15,
    textAlign: 'right' // For Arabic text
  },
  note: {
    fontSize: 10,
    color: '#e53e3e',
    fontStyle: 'italic',
    marginBottom: 20
  }
});

// PDF Document Component
const LegalReportPDF = ({ analysis }: { analysis: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Legal Case Analysis Report</Text>
        <Text style={styles.arabicTitle}>تقرير تحليل القضية القانونية</Text>
        <Text style={styles.subtitle}>Al-Khabir Legal Assistant - Moroccan Law Analysis</Text>
        <Text style={styles.subtitle}>المساعد القانوني الخبير - تحليل القانون المغربي</Text>
        
        <Text style={styles.note}>
          Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </Text>
        
        {analysis && Object.entries(analysis).map(([key, value]) => (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{key}</Text>
            <Text style={styles.content}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export class ReactPDFReportGenerator {
  async generateReport(analysis: any): Promise<string> {
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
      
      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
