import { useState, useRef, useCallback, useEffect } from 'react'
import { ScanLine, RotateCcw } from 'lucide-react'
import jsPDF from 'jspdf'
import Header from '../components/Header'
import ImageUploadZone from '../components/ImageUploadZone'
import PLOutputFrame from '../components/PLOutputFrame'
import type { PLCountResult, PLDetection } from '../components/PLOutputFrame'
import PLAssessmentCard from '../components/PLAssessmentCard'
import { yoloEngine } from '../utils/yolo'
import { trackEvent } from '../utils/analytics'
import { useSEO } from '../hooks/useSEO'

const logoImg = new Image()
logoImg.src = '/logo.png'

const BAG_VOLUME_ML = 10000 // standard 10L transfer bag

interface PLCounterPageProps {
  dark: boolean
  setDark: (v: boolean) => void
}

type PageState = 'idle' | 'loaded' | 'processing' | 'results'

export default function PLCounterPage({ dark, setDark }: PLCounterPageProps) {
  useSEO({
    title: 'PL Counter | Aquanubandh Lab',
    description: 'High-speed AI post-larvae (PL) counting. Accurately count shrimp larvae from a single basin photo running entirely in your browser.'
  })

  const [pageState, setPageState] = useState<PageState>('idle')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<PLCountResult | null>(null)
  const [processingMs, setProcessingMs] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start pre-loading ONNX model in background
    yoloEngine.init().catch(console.error)
  }, [])

  const handleImageSelected = useCallback((file: File, url: string) => {
    setImageFile(file)
    setPreviewUrl(url)
    setPageState('loaded')
    setResult(null)
  }, [])

  const handleClear = useCallback(() => {
    setImageFile(null)
    setPreviewUrl(null)
    setPageState('idle')
    setResult(null)
  }, [])

  const handleRunCount = async () => {
    if (!imageFile || !previewUrl) return
    setPageState('processing')

    try {
      const img = new Image()
      img.src = previewUrl
      await new Promise(r => {
        img.onload = r
        img.onerror = r
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(img, 0, 0)

      const startTime = performance.now()
      
      await yoloEngine.init()
      const onnxDetections = await yoloEngine.detect(canvas)
      
      const elapsed = performance.now() - startTime

      const detections: PLDetection[] = onnxDetections.map(d => ({
        cx: d.cx,
        cy: d.cy,
        w: d.w,
        h: d.h,
        status: d.classId === 0 ? 'active' : 'weak'
      }))

      const mockResult: PLCountResult = {
        detections,
        plStage: 'PL15', // Static stage for now
        frameCount: detections.length,
        sampleVolumeMl: 500,
        bagVolumeMl: BAG_VOLUME_ML,
      }

      setProcessingMs(Math.round(elapsed))
      setResult(mockResult)
      setPageState('results')

      trackEvent('pl_scan_completed', {
        detection_count: detections.length,
        processing_time_ms: Math.round(elapsed)
      })

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (e: any) {
      console.error(e)
      alert("AI processing failed: " + (e.message || String(e)))
      setPageState('loaded')
    }
  }

  const handleReset = () => handleClear()

  const handleSharePDF = async () => {
    try {
      const el = resultsRef.current
      if (!el || !result) return

      const diagCanvas = el.querySelector('canvas') as HTMLCanvasElement | null

      // ── Same setup as disease detector PDF ──
      const scale    = 3          // 3× for crisp text
      const logicalW = 800
      const padding  = 24
      const canvasH  = diagCanvas ? (diagCanvas.height / diagCanvas.width) * logicalW : 0
      const logicalH = canvasH + 220
      const bgColor  = dark ? '#0f172a' : '#f8fafc'

      const off = document.createElement('canvas')
      off.width  = (logicalW + padding * 2) * scale
      off.height = (logicalH + padding * 2) * scale
      const ctx = off.getContext('2d')!
      ctx.scale(scale, scale)

      // Fixed brand stripe colour
      const headerColor = '#3263fe'

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, logicalW + padding * 2, logicalH + padding * 2)

      // Header stripe with logo
      ctx.fillStyle = headerColor
      ctx.fillRect(padding, padding, logicalW, 56)
      if (logoImg.width > 0) {
        ctx.drawImage(logoImg, padding + 12, padding + 12, 32, 32)
      }
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillText('Aquanubandh - PL Count Report', padding + 12 + (logoImg.width > 0 ? 44 : 0), padding + 35)

      // Meta row
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = '13px Inter, system-ui, sans-serif'
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, padding + 12, padding + 76)
      ctx.fillText(`Engine: YOLOv26s  |  Processed in ${processingMs}ms`, padding + 12, padding + 96)

      // Diagnostic canvas image
      const imgTop = padding + 112
      if (diagCanvas && diagCanvas.width > 0) {
        ctx.drawImage(diagCanvas, padding, imgTop, logicalW, canvasH)
      }

      // PLs in Frame result block
      const textTop = imgTop + canvasH + 20
      ctx.fillStyle = headerColor
      ctx.fillRect(padding, textTop, logicalW, 36)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Inter, system-ui, sans-serif'
      ctx.fillText(`PLs in Frame: ${result.frameCount.toLocaleString()}`, padding + 12, textTop + 22)

      // Footer
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.font = '11px Inter, system-ui, sans-serif'
      ctx.fillText('For informational use only. Verify counts with certified hatchery protocols before stocking.', padding + 12, logicalH + padding * 2 - 12)

      // Convert to PDF – JPEG + FAST compression (same as disease detector)
      const imgData = off.toDataURL('image/jpeg', 0.85)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (off.height * pdfW) / off.width
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
      const fileName = `aquanubandh-pl-count-${new Date().toISOString().slice(0, 10)}.pdf`
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Aquanubandh PL Count Report',
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

  const canRun = (pageState === 'loaded' || pageState === 'results') && previewUrl
  const isProcessing = pageState === 'processing'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col page-enter">
      <Header dark={dark} setDark={setDark} showShare={pageState === 'results'} onShare={handleSharePDF} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Page title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            Post Larvae{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Counter
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accurate PL counts from tray photos - powered by YOLOv26s
          </p>
        </div>

        {/* Upper container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-800 p-5 space-y-5">

          {/* Upload zone */}
          <ImageUploadZone
            onImageSelected={handleImageSelected}
            previewUrl={pageState === 'idle' ? null : previewUrl}
            onClear={handleClear}
          />

          {/* Run button */}
          <button
            onClick={handleRunCount}
            disabled={!canRun || isProcessing}
            className={`
              w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden
              transition-all duration-200 active:scale-[0.98]
              ${canRun && !isProcessing
                ? 'text-white shadow-lg hover:opacity-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }
            `}
            style={canRun && !isProcessing ? {
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              boxShadow: '0 0 20px rgba(6,182,212,0.35)',
            } : {}}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Counting PLs with AI...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2.5">
                <ScanLine size={19} />
                Run PL Count
              </span>
            )}
          </button>
        </div>

        {/* Lower container - Results */}
        {(pageState === 'results' || pageState === 'processing') && (
          <div
            ref={resultsRef}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-800 p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-500" />
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                  Count Results
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw size={13} />
                New Count
              </button>
            </div>

            {pageState === 'processing' ? (
              <div className="space-y-4">
                <div className="w-full h-56 rounded-2xl shimmer" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-2xl shimmer" />
                  <div className="h-24 rounded-2xl shimmer" />
                  <div className="h-24 rounded-2xl shimmer" />
                </div>
                <div className="h-28 rounded-2xl shimmer" />
                <div className="h-10 rounded-xl shimmer" />
              </div>
            ) : (
              <>
                {previewUrl && result && (
                  <PLOutputFrame imageUrl={previewUrl} result={result} />
                )}
                {result && (
                  <PLAssessmentCard result={result} processingMs={processingMs} />
                )}
              </>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
          Aquanubandh PL Counter - For informational use only - Verify with certified hatchery protocols before stocking
        </p>
      </main>
    </div>
  )
}

