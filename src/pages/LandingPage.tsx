import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Microscope, ShieldCheck, Zap, BarChart3, Smartphone, Globe,
  ArrowRight, CheckCircle, ChevronRight, AlertTriangle, BookOpen,
  TrendingDown, Leaf, ChevronDown, Droplets, ScanLine
} from 'lucide-react'
import Header from '../components/Header'
import { useSEO } from '../hooks/useSEO'

interface LandingPageProps {
  dark: boolean
  setDark: (v: boolean) => void
}

/* ── Static data ─────────────────────────────────────────────── */

const features = [
  {
    icon: <Zap size={22} />,
    title: 'Instant AI Diagnosis',
    desc: 'Upload any shrimp photo and get a WSSV, BGD, or BSD diagnosis in under 30 milliseconds using our custom YOLOv11s model.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Early Disease Detection',
    desc: 'Catch White Spot Syndrome and other infections at the microscopic stage - before visible mass mortality begins.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-800/40',
  },
  {
    icon: <Microscope size={22} />,
    title: 'Multi-Species Support',
    desc: 'Works across Litopenaeus vannamei (Vannamei) and Penaeus monodon (Tiger Prawns) with species-adaptive detection.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Confidence Scoring',
    desc: 'Precision diagnostics ensuring accurate and definitive disease detection for every sample.',
    color: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-800/40',
  },
  {
    icon: <Smartphone size={22} />,
    title: 'Works on Any Phone',
    desc: 'Designed mobile-first. Take a photo with your smartphone camera and get results instantly - no hardware, no subscription.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    icon: <Globe size={22} />,
    title: 'Field-Ready Design',
    desc: 'High-contrast typography optimized for outdoor sunlight. Clear, colour-coded results farmers can read at a glance.',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-800/40',
  },
]

const plFeatures = [
  {
    icon: <Droplets size={22} />,
    title: 'Photo-Based PL Count',
    desc: 'Photograph your transfer tray under normal lighting. The AI identifies and counts every visible larvae in the frame automatically.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    icon: <Zap size={22} />,
    title: 'Fast Results',
    desc: 'YOLO26 is optimised for speed on mobile hardware. Count results appear in under 25ms.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-800/40',
  },
  {
    icon: <Globe size={22} />,
    title: 'Works in the Hatchery',
    desc: 'No special lighting needed. Optimised for the wet, humid, bright-light conditions of a shrimp hatchery counting area.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
]

const ddStats = [
  { value: '< 30ms', label: 'Inference Time' },
  { value: '89%', label: 'Detection Accuracy' },
  { value: '5', label: 'Diseases Covered' },
  { value: '2', label: 'Shrimp Species' },
]

const plStats = [
  { value: '95%+', label: 'Counting Accuracy' },
  { value: '< 25ms', label: 'Inference Time' },
]

const diseases = [
  {
    code: 'WSSV',
    name: 'White Spot Syndrome Virus',
    severity: 'Critical',
    icon: '🦠',
    textColor: 'text-red-600 dark:text-red-400',
    pillBg: 'bg-red-600',
    cardBg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30',
    border: 'border-red-200 dark:border-red-800/60',
    desc: 'Most economically devastating viral disease. Causes white spots on the shell and can kill an entire pond within 3–10 days of onset.',
  },
  {
    code: 'BGD',
    name: 'Black Gill Disease',
    severity: 'High',
    icon: '⚠️',
    textColor: 'text-amber-600 dark:text-amber-400',
    pillBg: 'bg-amber-500',
    cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    desc: 'Fungal or bacterial infection affecting the gills. Leads to lethargy, respiratory distress, and mortality if untreated.',
  },
  {
    code: 'BSD',
    name: 'Black Spot Disease',
    severity: 'Medium',
    icon: '⚫',
    textColor: 'text-slate-700 dark:text-slate-300',
    pillBg: 'bg-slate-600',
    cardBg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    border: 'border-slate-300 dark:border-slate-700',
    desc: 'Shell disease caused by bacterial infection, leading to melanized lesions on the carapace. Affects market value.',
  },
  {
    code: 'AHPND',
    name: 'Early Mortality Syndrome',
    severity: 'Critical',
    icon: '💀',
    textColor: 'text-red-700 dark:text-red-400',
    pillBg: 'bg-red-700',
    cardBg: 'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/60 dark:to-red-900/30',
    border: 'border-red-300 dark:border-red-800/60',
    desc: 'Caused by toxin-producing Vibrio parahaemolyticus. Triggers mass die-off within the first 35 days of stocking.',
  },
  {
    code: 'TSV',
    name: 'Taura Syndrome Virus',
    severity: 'High',
    icon: '🧬',
    textColor: 'text-purple-600 dark:text-purple-400',
    pillBg: 'bg-purple-600',
    cardBg: 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-purple-900/30',
    border: 'border-purple-200 dark:border-purple-800/60',
    desc: 'RNA virus causing cuticular lesions and soft-shell mortality in Vannamei. Spreads rapidly through contaminated equipment.',
  },
]

const faqs = [
  {
    q: 'How accurate is the Aquanubandh AI shrimp disease detector?',
    a: 'Our YOLOv11s Custom Core model achieves approximately 89% detection accuracy across WSSV, BGD, BSD, AHPND, and TSV. Accuracy may vary based on image quality, lighting, and disease stage. We recommend using it as a first-response screening tool alongside lab confirmation for critical decisions.',
  },
  {
    q: 'Which shrimp species does Aquanubandh support?',
    a: 'Aquanubandh currently supports Litopenaeus vannamei (Pacific White Shrimp) and Penaeus monodon (Black Tiger Prawn) - the two most commercially farmed species in India and South-East Asia.',
  },
  {
    q: 'Do I need an internet connection to use the detector?',
    a: 'After the initial page load, the AI model runs entirely in your browser using WebAssembly inference. This means you can use it reliably at the pond edge even with limited connectivity.',
  },

  {
    q: 'Can I export or share the diagnostic results?',
    a: 'Yes. After running a diagnosis, click the "Share PDF" button in the header. A formatted PDF report is generated instantly with the bounding-box image, detected disease, confidence score, processing time, and a disclaimer - ready to share with your farm manager or veterinarian.',
  },
]

/* ── Rotating Disease Carousel ───────────────────────────────── */
function DiseaseCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const next = (idx?: number) => {
    setActive(idx !== undefined ? idx : (prev) => (prev + 1) % diseases.length)
  }

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(() => next(), 3200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, paused])

  const d = diseases[active]

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main card */}
      <div
        key={active}
        className={`rounded-3xl border p-6 sm:p-8 transition-all duration-500 animate-fade-in ${d.cardBg} ${d.border}`}
        style={{ minHeight: 220 }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{d.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xl font-extrabold ${d.textColor}`}>{d.code}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${d.pillBg}`}>
                  {d.severity}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{d.name}</p>
            </div>
          </div>
          {/* Auto-progress arc */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-slate-700" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeDasharray={`${(active + 1) / diseases.length * 94} 94`}
                className={d.textColor}
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
              {active + 1}/{diseases.length}
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {d.desc}
        </p>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {diseases.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPaused(false); next(i) }}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? 'w-6 h-2.5 bg-indigo-500'
                : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        {diseases.map((dis, i) => (
          <button
            key={dis.code}
            onClick={() => { setPaused(false); next(i) }}
            className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all duration-200
              ${i === active
                ? `${dis.cardBg} ${dis.border} ${dis.textColor} shadow-md scale-105`
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:scale-105'
              }`}
          >
            <div className="text-base mb-0.5">{dis.icon}</div>
            {dis.code}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── FAQ Accordion ───────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug pr-2">
              {faq.q}
            </span>
            <ChevronDown
              size={18}
              className={`flex-shrink-0 text-slate-400 transition-transform duration-300 mt-0.5 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 animate-fade-in">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────── */
export default function LandingPage({ dark, setDark }: LandingPageProps) {
  const navigate = useNavigate()

  useSEO({
    title: 'Aquanubandh Lab — AI Shrimp Disease Detection & PL Counter',
    description: 'Aquanubandh Lab provides state-of-the-art AI tools for aquaculture. Use our Disease Detector for instant WSSV diagnosis, or our PL Counter for high-speed larvae counting.'
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col page-enter">
      <Header dark={dark} setDark={setDark} />

      <main>
        {/* ══ HERO ══ */}
        <section className="gradient-hero text-white relative overflow-hidden min-h-[calc(100dvh-64px)] flex items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

          <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center relative z-10">


            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              Smarter Shrimp Farming,{' '}
              <span className="italic text-cyan-300">Powered by AI.</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
              Two free AI tools for shrimp farmers - detect shrimp diseases from a photo, or count Post Larvae batches instantly.{' '}
              <span className="text-white font-semibold">No hardware. No cost.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#tools"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-base
                           bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl
                           transition-all duration-200 active:scale-95"
              >
                <Zap size={18} />
                Explore Our Tools
                <ArrowRight size={16} />
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-base
                           border border-white/30 text-white hover:bg-white/10
                           transition-all duration-200"
              >
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* ══ TOOL PICKER ══ */}
        <section id="tools" className="bg-white dark:bg-slate-900 py-12 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Tool</h2>
              <p className="text-slate-500 dark:text-slate-400">Two free AI-powered apps - pick the one you need right now</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Disease Detector card */}
              <div className="group relative rounded-3xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white mb-4 shadow-md">
                  <Microscope size={24} />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Disease Detector</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">YOLOv11s</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  Upload a shrimp photo and detect WSSV, BGD, BSD, AHPND &amp; TSV with bounding-box annotations and confidence scoring.
                </p>
                <div className="space-y-1.5 mb-5">
                  {['5 disease types detected', 'High-precision detection', 'PDF report export'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle size={13} className="text-indigo-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/disease-detector')}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ScanLine size={16} />
                  Launch Disease Detector
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* PL Counter card */}
              <div className="group relative rounded-3xl border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-md">
                  <Droplets size={24} />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">PL Counter</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">YOLO26</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  Photograph a PL tray sample and get an instant, highly accurate larvae count directly on your device.
                </p>
                <div className="space-y-1.5 mb-5">
                  {['Instant larvae detection', 'Total in-frame count', 'Works fully offline in-browser'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle size={13} className="text-blue-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/pl-counter')}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Droplets size={16} />
                  Launch PL Counter
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ══ DISEASE DETECTOR SECTION ══ */}

        <section id="disease-detector" className="bg-white dark:bg-slate-900 py-14 px-4">
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Section header */}
            <div className="text-center">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                AI Shrimp Disease Detection
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Upload a shrimp photo. Get WSSV, BGD, BSD, AHPND and TSV diagnosis with bounding-box annotations in under 30ms.
              </p>
            </div>

            {/* DD Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ddStats.map((s) => (
                <div key={s.label} className="text-center bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl py-4 border border-indigo-100 dark:border-indigo-800/40">
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Disease carousel */}
            <div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Diseases We Detect - hover to pause
              </h3>
              <DiseaseCarousel />
            </div>

            {/* DD Features */}
            <div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Disease Detector Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => (
                  <div key={f.title} className={`p-5 rounded-2xl border ${f.bg} ${f.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                      {f.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{f.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DD SEO paragraph */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-indigo-500" />
                About AI Shrimp Disease Detection
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Shrimp diseases like <strong className="text-slate-700 dark:text-slate-300">White Spot Syndrome Virus (WSSV)</strong> can wipe out an entire grow-out pond within 10 days. Traditional PCR lab tests take 48-72 hours - far too slow for effective intervention. Aquanubandh's Disease Detector uses a custom-trained <strong className="text-slate-700 dark:text-slate-300">YOLOv11s object detection model</strong> to identify disease biomarkers from a smartphone photo in under 30ms, enabling farmers to act before mass mortality begins. The model detects WSSV, BGD, BSD, AHPND and TSV across <em>Litopenaeus vannamei</em> and <em>Penaeus monodon</em> with 89% accuracy and runs entirely in-browser - no data is ever sent to external servers.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/disease-detector')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95"
              >
                <Microscope size={16} />
                Open Disease Detector
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ══ PL COUNTER SECTION ══ */}
        <section id="pl-counter" className="bg-slate-50 dark:bg-slate-950 py-14 px-4">
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Section header */}
            <div className="text-center">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                AI Post Larvae Counting
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Photograph a PL tray sample and get an instant count, PL stage estimate, health score, and full batch extrapolation - no manual counting.
              </p>
            </div>

            {/* PL Stats */}
            <div className="flex justify-center gap-4">
              {plStats.map((s) => (
                <div key={s.label} className="w-48 text-center bg-cyan-50 dark:bg-cyan-950/30 rounded-2xl py-5 border border-cyan-100 dark:border-cyan-800/40">
                  <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* PL Features */}
            <div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                PL Counter Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plFeatures.map((f) => (
                  <div key={f.title} className={`p-5 rounded-2xl border ${f.bg} ${f.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                      {f.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{f.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PL SEO paragraph */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-cyan-500" />
                Why Accurate PL Counting Matters
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-300">Post Larvae (PL) counting</strong> is one of the most critical steps in shrimp aquaculture. Incorrect stocking density directly affects dissolved oxygen levels, FCR, growth uniformity, and disease susceptibility in grow-out ponds. Traditional manual counting from sample trays is slow, inconsistent, and causes physiological stress to the larvae. Aquanubandh's PL Counter uses <strong className="text-slate-700 dark:text-slate-300">YOLOv26s</strong> - a lightweight object detection model trained specifically on shrimp post-larvae imagery - to count every individual larvae in a photo frame with 95%+ accuracy. The model also estimates <strong className="text-slate-700 dark:text-slate-300">PL developmental stage</strong> (PL5 through PL15) and flags weak or bent larvae to give farmers a real-time batch health score before stocking decisions are made.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/pl-counter')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95"
              >
                <Droplets size={16} />
                Open PL Counter
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ══ SEO CONTENT - WHY EARLY DETECTION MATTERS ══ */}
        <section className="bg-white dark:bg-slate-900 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Why Early Shrimp Disease Detection Matters
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Aquaculture disease accounts for over $6 billion in annual losses globally.
                Early detection is the single highest-impact intervention available to shrimp farmers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                {
                  icon: <TrendingDown size={22} />,
                  color: 'from-red-500 to-rose-500',
                  bg: 'bg-red-50 dark:bg-red-950/30',
                  border: 'border-red-100 dark:border-red-800/40',
                  title: '$6B+ Lost Annually',
                  body: 'Shrimp diseases like WSSV cause catastrophic crop failures across South-East Asia and India every year. Early diagnosis can recover up to 70% of affected ponds.',
                },
                {
                  icon: <AlertTriangle size={22} />,
                  color: 'from-amber-500 to-orange-500',
                  bg: 'bg-amber-50 dark:bg-amber-950/30',
                  border: 'border-amber-100 dark:border-amber-800/40',
                  title: '3–10 Day Kill Window',
                  body: 'WSSV can eliminate an entire pond within 10 days of the first lesion. Traditional lab tests take 48–72 hours - that\'s often too late to act.',
                },
                {
                  icon: <Leaf size={22} />,
                  color: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  border: 'border-emerald-100 dark:border-emerald-800/40',
                  title: 'AI Detects in Seconds',
                  body: 'Aquanubandh\'s YOLOv11s model identifies disease biomarkers from a smartphone photo in under 30ms - giving farmers a critical head start before mass mortality.',
                },
              ].map((c) => (
                <div key={c.title} className={`p-5 rounded-2xl border ${c.bg} ${c.border} hover:shadow-lg transition-all duration-200`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-3`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{c.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>

            {/* Long-form SEO paragraph block */}
            <article className="prose prose-sm sm:prose-base max-w-none text-slate-600 dark:text-slate-400 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-500" />
                Shrimp Disease Detection Using AI - A Practical Guide
              </h3>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">White Spot Syndrome Virus (WSSV)</strong> is the most studied and feared pathogen
                in shrimp aquaculture. It was first reported in Taiwan in 1992 and has since spread to every
                major shrimp-farming region including Andhra Pradesh, Odisha, Tamil Nadu, Gujarat, and
                coastal Karnataka. It infects all penaeid shrimp species and causes mortality rates of up to 100%
                within days. Visual symptoms include white circular spots (0.5–2.0mm) on the inner surface of
                the carapace, reddish discolouration, and lethargic swimming at the surface.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Taura Syndrome Virus (TSV)</strong> primarily affects
                Litopenaeus vannamei (Pacific White Shrimp) and is characterised by a distinctive cuticular
                lesion phase with multifocal areas of necrosis. Mortality during the acute phase can reach
                70–90%. Farms that use infected broodstock or contaminated equipment are at highest risk.
                AI-assisted visual inspection of newly stocked shrimp can identify early TSV lesion patterns
                within the first two weeks of cultivation.
              </p>
              <p>
                Aquanubandh leverages a custom-trained <strong className="text-slate-800 dark:text-slate-200">YOLOv11s object detection model</strong> that
                was fine-tuned on a dataset of annotated shrimp pathology images spanning all five covered
                disease classes. The model runs entirely client-side using WebAssembly, making it suitable
                for deployment in low-bandwidth farming environments without sending any images to external
                servers - protecting farm data privacy by design.
              </p>
            </article>
          </div>
        </section>

        {/* ══ FAQ - SEO RICH ══ */}
        <section className="bg-slate-50 dark:bg-slate-950 py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Answers to Common Questions
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Everything shrimp farmers ask about AI disease detection
              </p>
            </div>
            <FAQ />
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="gradient-hero py-16 px-4 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Start Protecting Your Farm Today
            </h2>
            <p className="text-blue-100 text-lg">
              Two free tools. No sign-up. Works on any smartphone. One photo is all it takes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/disease-detector')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm
                           bg-white text-blue-700 hover:bg-blue-50 shadow-xl
                           transition-all duration-200 active:scale-95"
              >
                <Microscope size={16} />
                Disease Detector
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate('/pl-counter')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm
                           bg-white/15 border border-white/30 text-white hover:bg-white/25 shadow-lg
                           transition-all duration-200 active:scale-95"
              >
                <Droplets size={16} />
                PL Counter
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
              {['No hardware required', 'Free to use'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-blue-100">
                  <CheckCircle size={14} className="text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Aquanubandh" className="w-7 h-7 rounded-lg" />
            <span className="text-white font-bold text-sm">Aquanubandh</span>
          </div>
          <p className="text-xs text-center">
            © {new Date().getFullYear()} Aquanubandh. AI diagnostics for informational use only.
            Consult certified aquaculture veterinarians for clinical decisions.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Disease Detector -&gt;
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => navigate('/pl-counter')}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              PL Counter -&gt;
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

