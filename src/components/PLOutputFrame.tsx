import { useRef, useEffect } from 'react'

export interface PLDetection {
  // Normalised centre coords (0-1) relative to image
  cx: number
  cy: number
  // Normalised box dimensions (0-1) relative to image
  w: number
  h: number
  // 'active' = swimming upright, 'weak' = bent/slow
  status: 'active' | 'weak'
}

export interface PLCountResult {
  detections: PLDetection[]
  plStage: 'PL5' | 'PL8' | 'PL10' | 'PL12' | 'PL15'
  frameCount: number
  sampleVolumeMl: number
  bagVolumeMl: number
}

interface PLOutputFrameProps {
  imageUrl: string
  result: PLCountResult
}

export default function PLOutputFrame({ imageUrl, result }: PLOutputFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const maxW = container.clientWidth
      const scale = maxW / img.naturalWidth
      const displayH = img.naturalHeight * scale

      canvas.width = maxW
      canvas.height = displayH

      // Draw original image
      ctx.drawImage(img, 0, 0, maxW, displayH)

      // Draw standard YOLO bounding boxes for each detection
      result.detections.forEach((det) => {
        const boxW = (det.w || 0.04) * maxW
        const boxH = (det.h || 0.04) * displayH
        const x = det.cx * maxW - boxW / 2
        const y = det.cy * displayH - boxH / 2

        // Aquanubandh blue, thin 1.5px border, no fill
        ctx.strokeStyle = '#124BCF'
        ctx.lineWidth = 1.5
        ctx.strokeRect(x, y, boxW, boxH)
      })

      // Total count badge (top-right)
      const totalText = `${result.frameCount} PLs`
      ctx.font = 'bold 13px Inter, sans-serif'
      const tw = ctx.measureText(totalText).width
      ctx.fillStyle = '#0891b2'
      ctx.beginPath()
      ctx.roundRect(maxW - tw - 28, 10, tw + 20, 28, 6)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.fillText(totalText, maxW - 18, 28)
      ctx.textAlign = 'left'
    }
    img.src = imageUrl
  }, [imageUrl, result])

  return (
    <div ref={containerRef} className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
      <canvas ref={canvasRef} className="w-full block" />
    </div>
  )
}
