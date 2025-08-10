import { AlertCircle, CheckCircle, Download, Eye, Github, Printer, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { SavedProject, userAccountService } from '../services/userAccountService';

interface ProjectManagerProps {
  content: any;
  type: 'idea' | 'story' | 'prd' | 'prototype';
  title: string;
  stage: number;
  onSave?: (projectId: string) => void;
  onShare?: (shareUrl: string) => void;
  language: 'en' | 'ar';
  isDarkMode: boolean;
}

interface ExportOptions {
  format: 'pdf' | 'json' | 'markdown';
  includeMetadata: boolean;
  watermark: boolean;
}

export default function ProjectManager({
  content,
  type,
  title,
  stage,
  onSave,
  onShare,
  language,
  isDarkMode
}: ProjectManagerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeMetadata: true,
    watermark: true
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  const previewRef = useRef<HTMLDivElement>(null);

  const isArabic = language === 'ar';
  const theme = isDarkMode ? 'dark' : 'light';

  const translations = {
    en: {
      save: 'Save Project',
      export: 'Export',
      share: 'Share',
      preview: 'Preview',
      print: 'Print',
      submitGitHub: 'Submit to GitHub',
      exportOptions: 'Export Options',
      format: 'Format',
      includeMetadata: 'Include Metadata',
      watermark: 'Add Watermark',
      close: 'Close',
      download: 'Download',
      saving: 'Saving...',
      exporting: 'Exporting...',
      submitting: 'Submitting...',
      savedSuccess: 'Project saved successfully!',
      exportSuccess: 'Export completed successfully!',
      submitSuccess: 'Submitted to GitHub successfully!',
      error: 'An error occurred. Please try again.',
      stage2Ready: 'Ready for Stage 2 (Solo-UltimatePro)',
      submitForValidation: 'Submit for Validation',
      prepareStage2: 'Prepare for Stage 2'
    },
    ar: {
      save: 'حفظ المشروع',
      export: 'تصدير',
      share: 'مشاركة',
      preview: 'معاينة',
      print: 'طباعة',
      submitGitHub: 'إرسال إلى GitHub',
      exportOptions: 'خيارات التصدير',
      format: 'التنسيق',
      includeMetadata: 'تضمين البيانات الوصفية',
      watermark: 'إضافة علامة مائية',
      close: 'إغلاق',
      download: 'تحميل',
      saving: 'جاري الحفظ...',
      exporting: 'جاري التصدير...',
      submitting: 'جاري الإرسال...',
      savedSuccess: 'تم حفظ المشروع بنجاح!',
      exportSuccess: 'تم التصدير بنجاح!',
      submitSuccess: 'تم الإرسال إلى GitHub بنجاح!',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      stage2Ready: 'جاهز للمرحلة الثانية (نموذجي المثالي)',
      submitForValidation: 'إرسال للتحقق',
      prepareStage2: 'التحضير للمرحلة الثانية'
    }
  };

  const t = translations[language];

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const project: Omit<SavedProject, 'id' | 'userId'> = {
        title,
        titleAr: isArabic ? title : undefined,
        type,
        stage,
        content,
        metadata: {
          industry: 'Technology', // Default, should be from user context
          tags: [type, `stage-${stage}`],
          estimatedValue: Math.floor(Math.random() * 1000000) + 100000,
          feasibilityScore: Math.floor(Math.random() * 40) + 60,
          lastModified: new Date().toISOString(),
          version: 1
        },
        shared: false
      };

      const savedProject = await userAccountService.saveProject(project);
      addNotification('success', t.savedSuccess);
      onSave?.(savedProject.id);
    } catch (error) {
      console.error('Save error:', error);
      addNotification('error', t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${type}`;

      if (exportOptions.format === 'pdf') {
        await userAccountService.exportAsPDF(content, filename);
      } else if (exportOptions.format === 'json') {
        const project: SavedProject = {
          id: 'temp',
          userId: 'temp',
          title,
          type,
          stage,
          content,
          metadata: {
            industry: 'Technology',
            tags: [type],
            estimatedValue: 0,
            feasibilityScore: 0,
            lastModified: new Date().toISOString(),
            version: 1
          },
          shared: false
        };
        await userAccountService.exportAsJSON(project);
      }

      addNotification('success', t.exportSuccess);
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export error:', error);
      addNotification('error', t.error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmitToGitHub = async (submissionType: 'validation' | 'stage2_preparation') => {
    setIsSubmitting(true);
    try {
      const project: SavedProject = {
        id: Date.now().toString(),
        userId: 'current-user',
        title,
        type,
        stage,
        content,
        metadata: {
          industry: 'Technology',
          tags: [type, submissionType],
          estimatedValue: 0,
          feasibilityScore: 0,
          lastModified: new Date().toISOString(),
          version: 1
        },
        shared: true
      };

      const submission = await userAccountService.submitToGitHub(project, submissionType);
      addNotification('success', t.submitSuccess);

      // Open the GitHub repository in a new tab
      window.open(submission.repositoryUrl, '_blank');
    } catch (error) {
      console.error('GitHub submission error:', error);
      addNotification('error', t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isPrototypeComplete = type === 'prototype' && stage === 4;

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? t.saving : t.save}
        </button>

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
          >
            <Download className="w-4 h-4" />
            {t.export}
          </button>

          {/* Export Options Dropdown */}
          {showExportOptions && (
            <div className={`absolute top-full mt-2 w-64 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg shadow-lg z-10`}>
              <div className="p-4 space-y-3">
                <h3 className="font-medium">{t.exportOptions}</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.format}</label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                  >
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                    <option value="markdown">Markdown</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="metadata"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="metadata" className="text-sm">{t.includeMetadata}</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={exportOptions.watermark}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, watermark: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="watermark" className="text-sm">{t.watermark}</label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {isExporting ? t.exporting : t.download}
                  </button>
                  <button
                    onClick={() => setShowExportOptions(false)}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <button
          onClick={() => setIsPreviewOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${isDarkMode
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
        >
          <Eye className="w-4 h-4" />
          {t.preview}
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${isDarkMode
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
        >
          <Printer className="w-4 h-4" />
          {t.print}
        </button>

        {/* GitHub Submission - Only for prototypes */}
        {isPrototypeComplete && (
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmitToGitHub('validation')}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isDarkMode
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                } disabled:opacity-50`}
            >
              <Github className="w-4 h-4" />
              {isSubmitting ? t.submitting : t.submitForValidation}
            </button>

            <button
              onClick={() => handleSubmitToGitHub('stage2_preparation')}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                } disabled:opacity-50`}
            >
              <Github className="w-4 h-4" />
              {isSubmitting ? t.submitting : t.prepareStage2}
            </button>
          </div>
        )}
      </div>

      {/* Stage 2 Ready Indicator */}
      {isPrototypeComplete && (
        <div className={`mb-6 p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-purple-400 bg-purple-900/20' : 'border-purple-300 bg-purple-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t.stage2Ready}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isArabic
                  ? 'مشروعك جاهز للانتقال إلى المرحلة الثانية من Solo-UltimatePro'
                  : 'Your project is ready to advance to Solo-UltimatePro Stage 2'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-4xl max-h-[90vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">{t.preview}: {title}</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={previewRef} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="prose dark:prose-invert max-w-none">
                {typeof content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
                ) : (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
