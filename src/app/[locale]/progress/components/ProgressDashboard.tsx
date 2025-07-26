import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Printer, 
  Share2, 
  Download,
  ChevronDown 
} from 'lucide-react';
import { 
  useProgressStatistics, 
  useDashboardStatistics, 
  useDailyStudyRecords,
  useLearningMethodsDistribution,
  useWeeklyComparison,
  useCompletedTopics 
} from '@/hooks/useProgress';
import { ContentType } from '@/types/progress';
import DailyStudyBarChart from './DailyStudyBarChart';
import LearningMethodsPieChart from './LearningMethodsPieChart';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';

const ProgressDashboard: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('progress');
  
  // Database statistics
  const { data: stats, loading: statsLoading, error: statsError } = useProgressStatistics();
  const { data: dashboard, loading: dashboardLoading, error: dashboardError } = useDashboardStatistics();
  const { data: dailyStudy, loading: dailyStudyLoading } = useDailyStudyRecords(7);
  const { data: learningMethods, loading: learningMethodsLoading } = useLearningMethodsDistribution();
  const { data: weeklyComparison, loading: weeklyComparisonLoading } = useWeeklyComparison();
  const { data: completedTopics, loading: completedTopicsLoading } = useCompletedTopics();
  
  // Real-time learning tracking
  const { getStudyMetrics, activity, sendLearningTrackingData } = useUserTrackingContext();
  const currentSessionMetrics = getStudyMetrics();
  
  // Auto-save learning data every 30 seconds if there's activity
  useEffect(() => {
    if (activity.studyHours > 0 || activity.completedTopics > 0) {
      const interval = setInterval(async () => {
          await sendLearningTrackingData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activity.studyHours, activity.completedTopics, sendLearningTrackingData]);
  
  // Listen for progress updates from other components
  useEffect(() => {
    const handleProgressUpdate = () => {
      // Force re-fetch dashboard data
      window.location.reload(); 
    };
    
    window.addEventListener('progressUpdated', handleProgressUpdate);
    return () => window.removeEventListener('progressUpdated', handleProgressUpdate);
  }, []);
  
  // Combine database stats with real-time metrics
  const totalStudyHours = (dashboard?.totalStudyHours || 0) + (activity.studyHours || 0);
  const totalCompletedTopics = (completedTopics?.completedTopics || 0) + (activity.completedTopics || 0);



  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  if (statsError || dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{t('error')}</div>
      </div>
    );
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.QUIZ:
        return 'bg-blue-500';
      case ContentType.FLASHCARD:
        return 'bg-green-500';
      // case ContentType.VIDEO:
      //   return 'bg-purple-500';
      // case ContentType.ARTICLE:
      //   return 'bg-orange-500';
      // case ContentType.COURSE:
      //   return 'bg-indigo-500';
      // case ContentType.LESSON:
        // return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6" ref={printRef}>
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalContents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedContents || 0}</div>
            <Progress 
              value={stats ? (stats.completedContents / stats.totalContents) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.inProgressContents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('averageScore')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Statistics */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('studyOverview')}</CardTitle>
              <CardDescription>{t('learningProgress')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>{t('totalStudyHours')}</span>
                <span className="font-bold flex items-center gap-2">
                  {totalStudyHours.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('completedTopics')}</span>
                <span className="font-bold flex items-center gap-2">
                  {totalCompletedTopics}
                </span>
              </div>
           
              {activity.currentTopic && (
                <div className="flex justify-between items-center">
                  <span>Current Topic</span>
                  <Badge variant="outline">{activity.currentTopic}</Badge>
                </div>
              )}
              {/* <div className="flex justify-between items-center">
                <span>{t('weeklyChange')}</span>
                <span className={`font-bold ${weeklyComparison?.percentageChange && weeklyComparison.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyComparison?.percentageChange ? (weeklyComparison.percentageChange >= 0 ? '+' : '') + weeklyComparison.percentageChange.toFixed(1) : '0'}%
                </span>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('learningMethods')}</CardTitle>
              <CardDescription>{t('distribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <LearningMethodsPieChart data={learningMethods || []} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Study Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dailyStudyHours')}</CardTitle>
          <CardDescription>{t('studyTimeDistribution')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStudyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-gray-500">{t('loadingChart')}</div>
            </div>
          ) : (
            <DailyStudyBarChart data={dailyStudy || []} />
          )}
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card className="no-print">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t('reportGenerated')} {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Export Format Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('exportPdf')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('exportExcel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('exportCsv')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Print Button */}
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                {t('print')}
              </Button>

              {/* Share Button */}
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                {t('share')}
              </Button>

              {/* Export Button */}
              <Button onClick={() => handleExport('pdf')} className="gap-2">
                <Download className="h-4 w-4" />
                {t('export')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );

  // Handler functions
  async function handleExport(format: 'pdf' | 'excel' | 'csv') {
    try {
      if (format === 'pdf') {
        await exportToPDF();
      } else if (format === 'excel') {
        await exportToExcel();
      } else if (format === 'csv') {
        await exportToCSV();
      }
    } catch (error) {
      alert(t('exportError', { format }));
    }
  }

  async function exportToPDF() {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`progress-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async function exportToExcel() {
    const XLSX = await import('xlsx');
    
    // Prepare data for Excel
    const progressData = [
      [t('progressReportTitle')],
      [t('reportGenerated'), new Date().toLocaleDateString()],
      [''],
      [t('studyOverview')],
      [t('totalContents'), stats?.totalContents || 0],
      [t('completed'), stats?.completedContents || 0],
      [t('inProgress'), stats?.inProgressContents || 0],
      [t('averageScore'), `${stats?.averageScore?.toFixed(1) || 0}%`],
      [''],
      [t('studyOverview')],
      [t('totalStudyHours'), totalStudyHours.toFixed(1)],
      [t('completedTopics'), totalCompletedTopics],
      [t('weeklyChange'), `${weeklyComparison?.percentageChange?.toFixed(1) || 0}%`],
      [''],
      [t('dailyStudyHours')],
      ['Day', 'Hours', 'Date'],
      ...((dailyStudy || []).map(day => [day.day, day.hours, day.date]))
    ];

    const ws = XLSX.utils.aoa_to_sheet(progressData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('progressReportTitle'));
    
    XLSX.writeFile(wb, `progress-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async function exportToCSV() {
    const dailyStudyCSV = [
      ['Day', 'Hours', 'Date'],
      ...((dailyStudy || []).map(day => [day.day, day.hours, day.date]))
    ];

    const csvContent = dailyStudyCSV.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daily-study-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>{t('progressReportTitle')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .border { border: 1px solid #e5e7eb; }
            .rounded-lg { border-radius: 0.5rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .text-sm { font-size: 0.875rem; }
            .text-2xl { font-size: 1.5rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .text-green-600 { color: #16a34a; }
            .text-blue-600 { color: #2563eb; }
            .text-muted-foreground { color: #6b7280; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <h1>{t('progressReportTitle')}</h1>
          <p>{t('reportGenerated')} ${new Date().toLocaleDateString()}</p>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  async function handleShare() {
    const shareData = {
      title: t('progressReportTitle'),
      text: t('progressReportText', { 
        hours: totalStudyHours.toFixed(1), 
        topics: totalCompletedTopics 
      }),
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        
        // Show success message
        alert(t('reportDetailsCopied'));
      }
    } catch (error) {
      
      // Final fallback: copy URL only
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(t('urlCopied'));
      } catch (clipboardError) {
        alert(t('shareError'));
      }
    }
  }
};

export default ProgressDashboard; 