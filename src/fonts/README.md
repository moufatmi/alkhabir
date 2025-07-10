# Arabic Font Integration Guide

## Quick Setup for Native Arabic Support

### Step 1: Download Arabic Font
Download Noto Sans Arabic from Google Fonts:
- Go to: https://fonts.google.com/specimen/Noto+Sans+Arabic
- Click "Download family"
- Extract the TTF file

### Step 2: Convert to Base64
1. Go to: https://www.base64encode.org/
2. Upload your `NotoSansArabic-Regular.ttf` file
3. Copy the Base64 string

### Step 3: Add to Project
Create a file `arabicFont.ts` in this folder with:

```typescript
export const arabicFontBase64 = "YOUR_BASE64_STRING_HERE";
```

### Step 4: Update Report Generator
Add this to your `reportGenerator.ts`:

```typescript
import { arabicFontBase64 } from '../fonts/arabicFont';

// In generateReport function:
try {
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', arabicFontBase64);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  
  // Use Arabic font for Arabic text
  if (isArabic) {
    doc.setFont('NotoSansArabic', 'normal');
  }
} catch (error) {
  console.log('Arabic font not available, using fallback');
}
```

## Alternative: Use React-PDF
The `ReactPDFReportGenerator` we just fixed supports Arabic better out of the box.
