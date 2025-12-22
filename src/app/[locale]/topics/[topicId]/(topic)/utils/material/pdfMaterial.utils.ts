import { PdfPageText } from '@/hooks/usePdfReader';

class PdfMaterialUtils {
    public getPdfContent({ pageTexts, start, end }: { pageTexts: PdfPageText[] | null; start: number; end: number }) {
        if (!pageTexts || pageTexts.length === 0) return '';
        const content = pageTexts
            .filter((item) => item.page >= start && item.page <= end)
            .map((item) => item.text)
            .join(' ');
        return content ?? '';
    }
}

export default new PdfMaterialUtils();
