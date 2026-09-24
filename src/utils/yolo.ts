import * as ort from 'onnxruntime-web'

import ortWasmUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm.wasm?url'
import ortWasmSimdUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm?url'

// 1. Configure ORT WASM correctly for Vite
ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': ortWasmUrl,
  'ort-wasm-simd.wasm': ortWasmSimdUrl
}

// Match Colab: conf=0.25, iou=0.45, imgsz=1024, max_det=2000
const CONF_THRESHOLD = 0.25
const IOU_THRESHOLD  = 0.45
const MODEL_SIZE     = 1024      // Must match ONNX export imgsz

const MODEL_URL = 'https://ai.aquanubandh.com/model.onnx'

export interface Detection {
  // All values normalised 0–1 relative to original image dimensions
  cx: number
  cy: number
  w: number
  h: number
  classId: number
  confidence: number
}

export class YoloEngine {
  private session: ort.InferenceSession | null = null

  /** Load once; subsequent calls are no-ops. */
  async init() {
    if (this.session) return

    console.log('[YoloEngine] Verifying ORT WASM initialization...')
    try {
      // Diagnostic test: Initialize an empty session to verify WASM backend works
      await ort.InferenceSession.create(new Uint8Array(0), { executionProviders: ['wasm'] })
        .catch(e => {
          // It will fail because Uint8Array(0) isn't a valid model, but we want to see if
          // the failure is "invalid model" (success) or "no available backend" (failure)
          if (e.message.includes('backend') || e.message.includes('TypeError')) {
             throw e
          }
        })
      console.log('[YoloEngine] Diagnostic OK: ORT WASM initialized successfully.')
    } catch (e) {
      console.error('[YoloEngine] Diagnostic FAILED. ORT cannot initialize:', e)
      throw e
    }

    const options: ort.InferenceSession.SessionOptions = {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    }

    // Use Cache API so users only download the ~37 MB model once.
    let buffer: ArrayBuffer
    if (typeof caches !== 'undefined') {
      const cache = await caches.open('yolo-model-v2-1024')
      let res = await cache.match(MODEL_URL)
      if (!res) {
        console.log('[YoloEngine] Fetching model from network…')
        res = await fetch(MODEL_URL)
        if (!res.ok) throw new Error(`Model fetch failed: ${res.status}`)
        await cache.put(MODEL_URL, res.clone())
      } else {
        console.log('[YoloEngine] Loaded model from browser cache.')
      }
      buffer = await res.arrayBuffer()
    } else {
      const res = await fetch(MODEL_URL)
      if (!res.ok) throw new Error(`Model fetch failed: ${res.status}`)
      buffer = await res.arrayBuffer()
    }

    this.session = await ort.InferenceSession.create(buffer, options)
    console.log(
      '[YoloEngine] Session ready. Inputs:',  this.session.inputNames,
      'Outputs:', this.session.outputNames
    )
  }

  async detect(imageCanvas: HTMLCanvasElement): Promise<Detection[]> {
    if (!this.session) throw new Error('YoloEngine not initialised – call init() first')

    const origW = imageCanvas.width
    const origH = imageCanvas.height

    // ── 1. Letterbox: scale to MODEL_SIZE×MODEL_SIZE keeping aspect ratio ──
    const fitScale = Math.min(MODEL_SIZE / origW, MODEL_SIZE / origH)
    const scaledW  = Math.round(origW * fitScale)
    const scaledH  = Math.round(origH * fitScale)
    const padX     = Math.round((MODEL_SIZE - scaledW) / 2)
    const padY     = Math.round((MODEL_SIZE - scaledH) / 2)

    const offCanvas = document.createElement('canvas')
    offCanvas.width  = MODEL_SIZE
    offCanvas.height = MODEL_SIZE
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true })!

    // Fill with Ultralytics standard grey (114, 114, 114)
    ctx.fillStyle = 'rgb(114,114,114)'
    ctx.fillRect(0, 0, MODEL_SIZE, MODEL_SIZE)
    ctx.drawImage(imageCanvas, padX, padY, scaledW, scaledH)

    // ── 2. Build NCHW Float32 tensor, normalised to [0, 1] ──
    const imgData = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data
    const nPixels = MODEL_SIZE * MODEL_SIZE
    const float32 = new Float32Array(3 * nPixels)

    for (let i = 0; i < nPixels; i++) {
      float32[i]              = imgData[i * 4]     / 255.0  // R
      float32[nPixels + i]    = imgData[i * 4 + 1] / 255.0  // G
      float32[2 * nPixels + i]= imgData[i * 4 + 2] / 255.0  // B
    }

    const inputTensor = new ort.Tensor('float32', float32, [1, 3, MODEL_SIZE, MODEL_SIZE])
    const feeds: Record<string, ort.Tensor> = {}
    feeds[this.session.inputNames[0]] = inputTensor

    // ── 3. Run inference ──
    const results    = await this.session.run(feeds)
    const outputName = this.session.outputNames[0]
    const output     = results[outputName]
    const data       = output.data as Float32Array
    const dims       = output.dims   // expected [1, 5, numAnchors]

    console.log('[YoloEngine] Output dims:', dims)

    // ── 4. Decode output: YOLOv8/26 format [1, (4+classes), anchors] ──
    const numAnchors = dims[2]   // e.g. 21504 for 1024px
    const numRows    = dims[1]   // 4 bbox + numClasses
    const numClasses = numRows - 4

    const rawBoxes: { box: [number, number, number, number]; conf: number; classId: number }[] = []

    for (let anchor = 0; anchor < numAnchors; anchor++) {
      // Coordinates are in MODEL_SIZE pixel space (cx, cy, w, h)
      const cx  = data[0 * numAnchors + anchor]
      const cy  = data[1 * numAnchors + anchor]
      const bw  = data[2 * numAnchors + anchor]
      const bh  = data[3 * numAnchors + anchor]

      let maxConf  = 0
      let maxClass = 0
      for (let cls = 0; cls < numClasses; cls++) {
        const conf = data[(4 + cls) * numAnchors + anchor]
        if (conf > maxConf) { maxConf = conf; maxClass = cls }
      }

      if (maxConf >= CONF_THRESHOLD) {
        rawBoxes.push({ box: [cx, cy, bw, bh], conf: maxConf, classId: maxClass })
      }
    }

    console.log(`[YoloEngine] Pre-NMS detections: ${rawBoxes.length}`)

    // ── 5. NMS (class-agnostic, matching Ultralytics default) ──
    rawBoxes.sort((a, b) => b.conf - a.conf)
    const kept: typeof rawBoxes = []

    for (const candidate of rawBoxes) {
      let suppress = false
      for (const s of kept) {
        if (iou(candidate.box, s.box) > IOU_THRESHOLD) { suppress = true; break }
      }
      if (!suppress) kept.push(candidate)
    }

    console.log(`[YoloEngine] Post-NMS detections: ${kept.length}`)

    // ── 6. Map letterbox coords → normalised original-image coords ──
    return kept.map(({ box, conf, classId }) => {
      const [cx, cy, bw, bh] = box

      // Remove letterbox padding, then scale back to original dimensions
      const origCx = (cx - padX) / fitScale
      const origCy = (cy - padY) / fitScale
      const origBw = bw / fitScale
      const origBh = bh / fitScale

      return {
        cx:         origCx / origW,
        cy:         origCy / origH,
        w:          origBw / origW,
        h:          origBh / origH,
        classId,
        confidence: conf,
      }
    })
  }
}

// ── IoU helper (boxes in [cx, cy, w, h] format, MODEL_SIZE pixel space) ──
function iou(a: [number, number, number, number], b: [number, number, number, number]): number {
  const ax1 = a[0] - a[2] / 2, ay1 = a[1] - a[3] / 2
  const ax2 = a[0] + a[2] / 2, ay2 = a[1] + a[3] / 2
  const bx1 = b[0] - b[2] / 2, by1 = b[1] - b[3] / 2
  const bx2 = b[0] + b[2] / 2, by2 = b[1] + b[3] / 2

  const interW = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1))
  const interH = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1))
  const inter  = interW * interH
  if (inter === 0) return 0

  const aArea = a[2] * a[3]
  const bArea = b[2] * b[3]
  return inter / (aArea + bArea - inter)
}

/** Singleton – import and call .init() once, then .detect() per frame. */
export const yoloEngine = new YoloEngine()
