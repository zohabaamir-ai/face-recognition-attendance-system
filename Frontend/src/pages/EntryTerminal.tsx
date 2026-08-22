import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { apiFetch } from '../services/api'

import {
  sendDeviceHeartbeat,
} from '../services/deviceService'

type TerminalState =
  | 'ready'
  | 'scanning'
  | 'success'
  | 'unknown'
  | 'error'

interface RecognitionResult {
  student_id: number | null
  name: string | null
  distance: number
  matched: boolean
  timestamp: string | null
}

interface RecognitionResponse {
  results: RecognitionResult[]
}

interface ErrorResponse {
  detail?: string
}

function EntryTerminal() {
  const [terminalState, setTerminalState] =
    useState<TerminalState>('ready')

  const [cameraError, setCameraError] =
    useState('')

  const [recognitionError, setRecognitionError] =
    useState('')

  const [recognizedPerson, setRecognizedPerson] =
    useState<RecognitionResult | null>(null)

  const videoRef =
    useRef<HTMLVideoElement>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const canvasRef =
    useRef<HTMLCanvasElement>(null)

  const DEVICE_KEY =
    import.meta.env.VITE_ENTRY_DEVICE_KEY

  useEffect(() => {
    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

  async function startCamera() {
    try {
      setCameraError('')

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera access is not supported by this browser.',
        )

        setTerminalState('error')

        return
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream
      }

      setTerminalState('ready')
    } catch (error) {
      console.error(
        'Unable to access camera:',
        error,
      )

      setCameraError(
        'Unable to access the camera. Please allow camera permission and try again.',
      )

      setTerminalState('error')
    }
  }

    useEffect(() => {
    if (!DEVICE_KEY) {
        console.error(
        'VITE_ENTRY_DEVICE_KEY is not configured.',
        )

        return
    }

    async function heartbeat() {
        try {
        await sendDeviceHeartbeat(
            DEVICE_KEY,
        )
        } catch (error) {
        console.warn(
            'Device heartbeat failed:',
            error,
        )
        }
    }

    heartbeat()

    const intervalId =
        window.setInterval(
        heartbeat,
        15_000,
        )

    return () => {
        window.clearInterval(
        intervalId,
        )
    }
    }, [DEVICE_KEY])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop()
        })

      streamRef.current = null
    }
  }

  async function scanEntry() {
    if (
      !videoRef.current ||
      !canvasRef.current
    ) {
      return
    }

    if (
      terminalState === 'scanning'
    ) {
      return
    }

    setTerminalState('scanning')
    setRecognizedPerson(null)
    setRecognitionError('')

    const video =
      videoRef.current

    const canvas =
      canvasRef.current

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setTerminalState('error')

      setRecognitionError(
        'The camera is not ready yet. Please try again.',
      )

      return
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setTerminalState('error')

      setRecognitionError(
        'Unable to read the camera image. Please try again.',
      )

      return
    }

    canvas.width =
      video.videoWidth

    canvas.height =
      video.videoHeight

    const context =
      canvas.getContext('2d')

    if (!context) {
      setTerminalState('error')

      setRecognitionError(
        'Unable to capture the camera image.',
      )

      return
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    const blob =
      await new Promise<Blob | null>(
        (resolve) => {
          canvas.toBlob(
            (result) => {
              resolve(result)
            },
            'image/jpeg',
            0.9,
          )
        },
      )

    if (!blob) {
      setTerminalState('error')

      setRecognitionError(
        'Unable to create an image from the camera.',
      )

      return
    }

    const formData =
      new FormData()

    formData.append(
      'file',
      blob,
      'entry-capture.jpg',
    )

    try {
      const response =
        await apiFetch(
          '/recognize',
          {
            method: 'POST',
            body: formData,
          },
        )

      const data =
        (await response.json()) as
          | RecognitionResponse
          | ErrorResponse

      if (!response.ok) {
        setTerminalState('error')

        setRecognitionError(
          'detail' in data &&
            data.detail
            ? data.detail
            : 'Recognition failed. Please try again.',
        )

        return
      }

      const recognition =
        data as RecognitionResponse

      const result =
        recognition.results?.[0]

      if (!result) {
        setTerminalState('unknown')

        setRecognitionError(
          'No face could be recognized from the captured image.',
        )

        return
      }

      setRecognizedPerson(
        result,
      )

      if (result.matched) {
        setTerminalState('success')
      } else {
        setTerminalState('unknown')
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          'AUTHENTICATION_EXPIRED'
      ) {
        return
      }

      console.error(
        'Recognition request failed:',
        error,
      )

      setTerminalState('error')

      setRecognitionError(
        'Unable to connect to the entry server.',
      )
    }
  }

  function resetTerminal() {
    setRecognizedPerson(null)
    setRecognitionError('')

    if (cameraError) {
      setTerminalState('error')
      return
    }

    setTerminalState('ready')
  }

  function formatTime(
    timestamp: string | null,
  ) {
    if (!timestamp) {
      return '—'
    }

    return new Date(
      timestamp,
    ).toLocaleTimeString(
      'en-US',
      {
        timeZone:
          'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }

  function formatDistance(
    distance: number,
  ) {
    if (!Number.isFinite(distance)) {
      return '—'
    }

    return distance.toFixed(3)
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">

      <div className="flex h-full flex-col">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <ScanFace size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-wide">
                SmartEntrySystem
              </p>

              <p className="text-[11px] text-slate-400">
                Entry Terminal
              </p>
            </div>

          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
              terminalState === 'error'
                ? 'border-red-400/20 bg-red-400/10'
                : terminalState === 'scanning'
                  ? 'border-amber-400/20 bg-amber-400/10'
                  : 'border-emerald-400/20 bg-emerald-400/10'
            }`}
          >

            <span
              className={`h-2 w-2 rounded-full ${
                terminalState === 'error'
                  ? 'bg-red-400'
                  : terminalState === 'scanning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              }`}
            />

            <span
              className={`text-xs font-medium ${
                terminalState === 'error'
                  ? 'text-red-300'
                  : terminalState === 'scanning'
                    ? 'text-amber-300'
                    : 'text-emerald-300'
              }`}
            >
              {terminalState ===
                'scanning'
                ? 'Recognizing'
                : terminalState ===
                    'error'
                  ? 'Attention Required'
                  : 'Terminal Ready'}
            </span>

          </div>

        </header>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-3 sm:px-6">

          <div className="flex h-full w-full max-w-xl flex-col justify-center">

            {/* =================================================
                TERMINAL CARD
            ================================================== */}

            <div className="min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">

              {/* =================================================
                  CAMERA
              ================================================== */}

              <div className="relative h-[43vh] min-h-62.5 max-h-97.5 overflow-hidden bg-black">

                {cameraError ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                      <Camera size={24} />
                    </div>

                    <h2 className="mt-3 text-base font-semibold text-slate-200">
                      Camera unavailable
                    </h2>

                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                      {cameraError}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setCameraError('')
                        setRecognitionError('')
                        setTerminalState(
                          'ready',
                        )

                        startCamera()
                      }}
                      className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                    >
                      Try Camera Again
                    </button>

                  </div>
                ) : (
                  <>
                    {/* Live Camera */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />

                    {/* Camera overlay */}
                    <div className="pointer-events-none absolute inset-0">

                      {/* Subtle outer frame */}
                      <div className="absolute inset-5 rounded-xl border border-white/15" />

                      {/* Face guide */}
                      <div
                        className={`absolute left-1/2 top-1/2 h-[70%] w-[46%] max-h-70 max-w-52.5 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 transition-colors ${
                          terminalState ===
                            'scanning' ||
                          terminalState ===
                            'success'
                            ? 'border-emerald-400'
                            : terminalState ===
                                'unknown' ||
                              terminalState ===
                                'error'
                              ? 'border-red-400'
                              : 'border-white/40'
                        }`}
                      />

                    </div>

                    {/* Scanning overlay */}
                    {terminalState ===
                      'scanning' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">

                        <div className="rounded-full border border-white/10 bg-slate-950/80 px-5 py-3 shadow-xl backdrop-blur">

                          <div className="flex items-center gap-3">

                            <LoaderCircle
                              size={18}
                              className="animate-spin text-emerald-400"
                            />

                            <span className="text-sm font-medium">
                              Recognizing...
                            </span>

                          </div>

                        </div>

                      </div>
                    )}

                  </>
                )}

              </div>

              {/* =================================================
                  RESULT
              ================================================== */}

              <div className="border-t border-white/10 px-5 py-5 text-center sm:px-8">

                {/* READY */}
                {terminalState ===
                  'ready' && (
                  <>

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300">
                      <ShieldCheck size={20} />
                    </div>

                    <h2 className="mt-2 text-lg font-semibold">
                      Ready to scan
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Look at the camera and scan your entry.
                    </p>

                    <button
                      type="button"
                      onClick={
                        scanEntry
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.98]"
                    >
                      <ScanFace size={17} />

                      Scan Entry
                    </button>

                  </>
                )}

                {/* SCANNING */}
                {terminalState ===
                  'scanning' && (
                  <>

                    <div className="mx-auto flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                      <ScanFace size={20} />
                    </div>

                    <h2 className="mt-2 text-lg font-semibold">
                      Recognizing...
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Please remain in front of the terminal.
                    </p>

                  </>
                )}

                {/* SUCCESS */}
                {terminalState ===
                  'success' &&
                  recognizedPerson && (
                  <>

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                      <CheckCircle2 size={22} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-emerald-400">
                      Entry Recorded
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {recognizedPerson.name}
                    </h2>

                    <div className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-6 border-t border-white/10 pt-3 text-xs text-slate-400">

                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={14} />

                        ID:{' '}
                        {recognizedPerson.student_id ??
                          '—'}
                      </span>

                      <span>
                        Match:{' '}
                        {formatDistance(
                          recognizedPerson.distance,
                        )}
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Entry recorded at{' '}
                      {formatTime(
                        recognizedPerson.timestamp,
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetTerminal
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 px-5 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
                    >
                      <RefreshCw
                        size={15}
                      />

                      Ready for Next Entry
                    </button>

                  </>
                )}

                {/* UNKNOWN */}
                {terminalState ===
                  'unknown' && (
                  <>

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                      <XCircle size={22} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-red-400">
                      Entry Not Recognized
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Unknown Entry
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {recognitionError ||
                        'No registered person matched this face.'}
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetTerminal
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      <RefreshCw
                        size={15}
                      />

                      Try Again
                    </button>

                  </>
                )}

                {/* ERROR */}
                {terminalState ===
                  'error' &&
                  !cameraError && (
                  <>

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                      <XCircle size={22} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-red-400">
                      Recognition Unavailable
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Something went wrong
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {recognitionError ||
                        'Please try again.'}
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetTerminal
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      <RefreshCw
                        size={15}
                      />

                      Try Again
                    </button>

                  </>
                )}

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="mt-2 flex shrink-0 justify-center text-[11px] text-slate-500">

              <span>
                Main Entrance Terminal
              </span>

            </div>

          </div>

        </main>

        {/* Hidden capture canvas */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

      </div>

    </div>
  )
}

export default EntryTerminal