import { useState, useRef, useCallback } from 'react'
import { Scan, RotateCcw } from 'lucide-react'
import jsPDF from 'jspdf'
import Header from '../components/Header'
import ImageUploadZone from '../components/ImageUploadZone'
import DiagnosticOutputFrame from '../components/DiagnosticOutputFrame'
import AssessmentCard from '../components/AssessmentCard'
import { trackEvent } from '../utils/analytics'
import { useSEO } from '../hooks/useSEO'

const logoImg = new Image()
logoImg.src = '/logo.png'

export interface ApiResponse {
  result: 'identified' | 'unknown'
  disease_identified?: string
  diseases_detected?: string[]
  instances_count?: number
  average_confidence?: number
  confidences?: number[]
  processed_image: string
  message?: string
}

interface AppPageProps {
  dark: boolean
  setDark: (v: boolean) => void
}

type AppState = 'idle' | 'loaded' | 'processing' | 'results'

export default function AppPage({ dark, setDark }: AppPageProps) {
  useSEO({
    title: 'Shrimp Disease Detector | Aquanubandh Lab',
    description: 'Use Aquanubandh AI to detect shrimp diseases from images. Upload a shrimp photo to screen for visible signs of common shrimp diseases.'
  })

  const [appState, setAppState] = useState<AppState>('idle')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [processingMs, setProcessingMs] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleImageSelected = useCallback((file: File, url: string) => {
    setImageFile(file)
    setPreviewUrl(url)
    setAppState('loaded')
    setApiResponse(null)
  }, [])

  const handleClear = useCallback(() => {
    setImageFile(null)
    setPreviewUrl(null)
    setAppState('idle')
    setApiResponse(null)
  }, [])

  const handleRunDiagnosis = async () => {
    if (!imageFile) return
    setAppState('processing')

    const start = Date.now()

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const res = await fetch('https://ai.aquanubandh.com/predict', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`API Error: HTTP ${res.status} - ${errText}`)
        throw new Error(`API Error: ${res.status}`)
      }

      const data: ApiResponse = await res.json()
      const elapsed = Date.now() - start

      setProcessingMs(elapsed)
      setApiResponse(data)
      setAppState('results')

      trackEvent('disease_scan_completed', {
        disease: data.disease_identified || (data.diseases_detected ? data.diseases_detected.join(',') : 'none'),
        detection_count: data.instances_count || (data.diseases_detected ? data.diseases_detected.length : 0),
        average_confidence: data.average_confidence || 0,
        processing_time_ms: elapsed
      })

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error(err)
      alert('Diagnosis failed. Please try again.')
      setAppState('loaded')
    }
  }

  const handleReset = () => {
    handleClear()
  }

  const handleSharePDF = async () => {
    try {
      const el = resultsRef.current
      if (!el || !apiResponse) return

      const diagImg = el.querySelector('img') as HTMLImageElement | null

      // Build an offscreen composite canvas
      const scale = 3 // 3x resolution for crisp text
      const logicalW = 800
      const padding = 24
      const imgH = diagImg && diagImg.naturalWidth > 0 ? (diagImg.naturalHeight / diagImg.naturalWidth) * logicalW : 0
      const logicalH = imgH + 320
      const bgColor = dark ? '#0f172a' : '#f8fafc'

      const off = document.createElement('canvas')
      off.width = (logicalW + padding * 2) * scale
      off.height = (logicalH + padding * 2) * scale
      const ctx = off.getContext('2d')!
      ctx.scale(scale, scale)

      // Fixed brand colour for header stripe
      const headerColor = '#3263fe'

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, logicalW + padding * 2, logicalH + padding * 2)

      // Header row
      ctx.fillStyle = headerColor
      ctx.fillRect(padding, padding, logicalW, 56)
      if (logoImg.width > 0) {
        ctx.drawImage(logoImg, padding + 12, padding + 12, 32, 32)
      }
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillText('Aquanubandh - AI Diagnostic Report', padding + 12 + (logoImg.width > 0 ? 44 : 0), padding + 35)

      // Date
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = '13px Inter, system-ui, sans-serif'
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, padding + 12, padding + 76)
      ctx.fillText(`Engine: YOLOv11s Custom Core  |  Processed in ${processingMs}ms`, padding + 12, padding + 96)

      // Draw the diagnostic canvas image
      const imgTop = padding + 112
      if (diagImg && diagImg.naturalWidth > 0) {
        ctx.drawImage(diagImg, padding, imgTop, logicalW, imgH)
      }

      // Assessment text block
      const textTop = imgTop + imgH + 20
      const isHealthy = apiResponse.result === 'unknown'

      if (isHealthy) {
        ctx.fillStyle = '#10b981'
        ctx.fillRect(padding, textTop, logicalW, 36)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 14px Inter, system-ui, sans-serif'
        ctx.fillText('✓  Condition Status: Shrimp Appears Healthy. No anomalies detected.', padding + 12, textTop + 22)
      } else {
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(padding, textTop, logicalW, 36)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 14px Inter, system-ui, sans-serif'
        ctx.fillText('⚠  Active Infection Detected', padding + 12, textTop + 22)

        apiResponse.diseases_detected?.forEach((d, i) => {
          const conf = apiResponse.confidences?.[i] ?? 0
          const dy = textTop + 48 + i * 28
          ctx.fillStyle = dark ? '#1e293b' : '#fef2f2'
          ctx.fillRect(padding, dy, logicalW, 24)
          ctx.fillStyle = '#dc2626'
          ctx.font = '13px Inter, system-ui, sans-serif'
          ctx.fillText(`  • ${d} - Confidence: ${conf.toFixed(2)}%`, padding + 8, dy + 16)
        })
      }

      // Footer
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.font = '11px Inter, system-ui, sans-serif'
      ctx.fillText('For informational use only. Consult a certified aquaculture veterinarian for clinical decisions.', padding + 12, logicalH + padding * 2 - 12)

      // Convert to PDF
      const imgData = off.toDataURL('image/jpeg', 0.85) // Use JPEG with high quality
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (off.height * pdfW) / off.width
      // Use FAST compression in jsPDF to keep file size small
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
      
      const fileName = `aquanubandh-diagnosis-${new Date().toISOString().slice(0, 10)}.pdf`
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Aquanubandh Diagnostic Report',
            files: [file]
          })
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            pdf.save(fileName)
          }
        }
      } else {
        // Fallback for desktop/unsupported browsers
        pdf.save(fileName)
      }
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    }
  }

  const canRun = (appState === 'loaded' || appState === 'results') && previewUrl
  const isProcessing = appState === 'processing'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col page-enter">
      <Header dark={dark} setDark={setDark} showShare={appState === 'results'} onShare={handleSharePDF} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Page Title ── */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            Shrimp Disease{' '}
            <span className="gradient-text">Detector</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-species analysis powered by YOLOv11s
          </p>
        </div>

        {/* ══ Upper Container ══ */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-800 p-5 space-y-5">

          {/* Upload zone */}
          <ImageUploadZone
            onImageSelected={handleImageSelected}
            previewUrl={appState === 'idle' ? null : previewUrl}
            onClear={handleClear}
          />



          {/* Run button */}
          <button
            onClick={handleRunDiagnosis}
            disabled={!canRun || isProcessing}
            className={`
              w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden
              transition-all duration-200 active:scale-[0.98]
              ${canRun && !isProcessing
                ? 'gradient-brand text-white shadow-glow-indigo hover:shadow-glow-teal hover:opacity-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing with AI…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2.5">
                <Scan size={19} />
                Run AI Diagnosis
              </span>
            )}
            {/* shimmer sweep on hover */}
            {canRun && !isProcessing && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            )}
          </button>
        </div>

        {/* ══ Lower Container - Visual Metrics Display ══ */}
        {(appState === 'results' || appState === 'processing') && (
          <div
            ref={resultsRef}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-800 p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                  Visual Diagnostic Output
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw size={13} />
                New Scan
              </button>
            </div>

            {appState === 'processing' ? (
              /* Loading skeleton */
              <div className="space-y-4">
                <div className="w-full h-56 rounded-2xl shimmer" />
                <div className="h-24 rounded-2xl shimmer" />
                <div className="h-10 rounded-xl shimmer" />
              </div>
            ) : (
              /* Results */
              <>
                {apiResponse && (
                  <DiagnosticOutputFrame
                    imageUrl={apiResponse.processed_image}
                  />
                )}
                {apiResponse && (
                  <AssessmentCard
                    apiResponse={apiResponse}
                    processingMs={processingMs}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
          Aquanubandh AI Diagnostics · For informational use only · Consult a fisheries expert for clinical decisions
        </p>
      </main>
    </div>
  )
}

