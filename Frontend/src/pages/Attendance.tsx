import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Search,
  Upload,
  UserCheck,
  XCircle,
} from 'lucide-react'

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

interface AttendanceRecord {
  id: number
  student_id: number
  name: string
  roll_number: string
  timestamp: string
  match_distance: number
}

type PhotoMode = 'upload' | 'camera'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function Attendance() {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null)

  const [photoMode, setPhotoMode] =
    useState<PhotoMode>('upload')

  const [isCameraOpen, setIsCameraOpen] =
    useState(false)

  const [isCameraLoading, setIsCameraLoading] =
    useState(false)

  const [recognitionResult, setRecognitionResult] =
    useState<RecognitionResult | null>(null)

  const [records, setRecords] =
    useState<AttendanceRecord[]>([])

  const [isRecognizing, setIsRecognizing] =
    useState(false)

  const [isLoadingRecords, setIsLoadingRecords] =
    useState(true)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [error, setError] = useState('')

  const videoRef =
    useRef<HTMLVideoElement | null>(null)

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchAttendanceRecords()

    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function fetchAttendanceRecords() {
    const token =
      localStorage.getItem('access_token')

    if (!token) {
      setError('You are not authenticated.')
      setIsLoadingRecords(false)
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            'Your session has expired. Please log in again.',
          )
        } else {
          setError(
            'Failed to load attendance records.',
          )
        }

        return
      }

      const data: AttendanceRecord[] =
        await response.json()

      setRecords(data)
    } catch {
      setError(
        'Unable to connect to the attendance server.',
      )
    } finally {
      setIsLoadingRecords(false)
    }
  }

  function clearSelectedPhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)
    setRecognitionResult(null)
  }

  function handleUploadMode() {
    stopCamera()
    clearSelectedPhoto()

    setPhotoMode('upload')
    setError('')
  }

  function handleCameraMode() {
    stopCamera()
    clearSelectedPhoto()

    setPhotoMode('camera')
    setError('')

    startCamera()
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    stopCamera()

    setPhotoMode('upload')
    setSelectedFile(file)
    setRecognitionResult(null)
    setError('')

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(
      URL.createObjectURL(file),
    )

    /*
     * Reset the input value so selecting
     * the same file again still triggers
     * onChange.
     */
    event.target.value = ''
  }

  async function startCamera() {
    setError('')
    setIsCameraOpen(true)
    setIsCameraLoading(true)

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
          audio: false,
        })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream

        await videoRef.current.play()
      }
    } catch {
      setIsCameraOpen(false)

      setError(
        'Unable to access the camera. Please allow camera permission or use photo upload.',
      )
    } finally {
      setIsCameraLoading(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsCameraOpen(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      return
    }

    const width = video.videoWidth
    const height = video.videoHeight

    if (!width || !height) {
      setError(
        'Camera is not ready yet.',
      )

      return
    }

    canvas.width = width
    canvas.height = height

    const context =
      canvas.getContext('2d')

    if (!context) {
      setError(
        'Unable to capture the photo.',
      )

      return
    }

    context.drawImage(
      video,
      0,
      0,
      width,
      height,
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(
            'Unable to create the captured image.',
          )

          return
        }

        const file = new File(
          [blob],
          'recognition-capture.jpg',
          {
            type: 'image/jpeg',
          },
        )

        setSelectedFile(file)

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }

        setPreviewUrl(
          URL.createObjectURL(file),
        )

        stopCamera()
      },
      'image/jpeg',
      0.9,
    )
  }

  async function handleRecognition() {
    if (!selectedFile) {
      setError(
        'Please upload or capture a photo first.',
      )

      return
    }

    const token =
      localStorage.getItem(
        'access_token',
      )

    if (!token) {
      setError(
        'You are not authenticated.',
      )

      return
    }

    setIsRecognizing(true)
    setRecognitionResult(null)
    setError('')

    const formData =
      new FormData()

    formData.append(
      'file',
      selectedFile,
    )

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/recognize`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        )

      const data: RecognitionResponse =
        await response.json()

      if (!response.ok) {
        setError(
          'Face recognition request failed.',
        )

        return
      }

      if (
        data.results.length === 0
      ) {
        setError(
          'No face was detected in the image.',
        )

        return
      }

      setRecognitionResult(
        data.results[0],
      )

      await fetchAttendanceRecords()
    } catch {
      setError(
        'Unable to connect to the attendance server.',
      )
    } finally {
      setIsRecognizing(false)
    }
  }

  function handleChooseAnotherPhoto() {
    clearSelectedPhoto()
    setError('')
  }

  function handleRetakePhoto() {
    stopCamera()
    clearSelectedPhoto()

    setPhotoMode('camera')
    setError('')

    startCamera()
  }

  const filteredRecords =
    records.filter((record) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return true
      }

      return (
        record.name
          .toLowerCase()
          .includes(query) ||
        record.roll_number
          .toLowerCase()
          .includes(query)
      )
    })

  function formatDateTime(
    timestamp: string,
  ) {
    const date =
      new Date(timestamp)

    return {
      date:
        date.toLocaleDateString(
          'en-GB',
          {
            timeZone:
              'Asia/Karachi',
          },
        ),

      time:
        date.toLocaleTimeString(
          'en-US',
          {
            timeZone:
              'Asia/Karachi',
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Attendance & Entry
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Recognize registered students and record their university entry.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* Recognition */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Face Recognition
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload a photo or use your camera to identify a registered student.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* Capture Section */}
          <div>
            {/* Photo Mode */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={
                  handleUploadMode
                }
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  photoMode ===
                  'upload'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload size={16} />
                Upload Photo
              </button>

              <button
                type="button"
                onClick={
                  handleCameraMode
                }
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  photoMode ===
                  'camera'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Camera size={16} />
                Take Photo
              </button>
            </div>

            {/* Upload Mode */}
            {photoMode ===
              'upload' && (
              <>
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={previewUrl}
                        alt="Selected face"
                        className="aspect-video w-full object-contain"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleChooseAnotherPhoto
                      }
                      disabled={
                        isRecognizing
                      }
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw
                        size={16}
                      />
                      Choose Another Photo
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="recognition-image"
                    className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    <Upload
                      size={28}
                      className="text-slate-500"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Choose an image
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Use a clear image containing one face.
                    </p>

                    <input
                      id="recognition-image"
                      type="file"
                      accept="image/*"
                      onChange={
                        handleFileChange
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </>
            )}

            {/* Camera Mode */}
            {photoMode ===
              'camera' && (
              <div className="space-y-3">
                {isCameraOpen ? (
                  <>
                    <div className="overflow-hidden rounded-xl bg-black">
                      <video
                        ref={
                          videoRef
                        }
                        autoPlay
                        muted
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        capturePhoto
                      }
                      disabled={
                        isCameraLoading
                      }
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera
                        size={17}
                      />

                      {isCameraLoading
                        ? 'Starting camera...'
                        : 'Capture Photo'}
                    </button>
                  </>
                ) : previewUrl ? (
                  <>
                    <div className="overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={previewUrl}
                        alt="Captured face"
                        className="aspect-video w-full object-contain"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleRetakePhoto
                      }
                      disabled={
                        isRecognizing
                      }
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw
                        size={16}
                      />
                      Retake Photo
                    </button>
                  </>
                ) : null}
              </div>
            )}

            {/* Recognize */}
            <button
              type="button"
              onClick={
                handleRecognition
              }
              disabled={
                !selectedFile ||
                isRecognizing
              }
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserCheck
                size={18}
              />

              {isRecognizing
                ? 'Recognizing...'
                : 'Recognize Student'}
            </button>
          </div>

          {/* Result */}
          <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
            {!recognitionResult ? (
              <div className="text-center">
                <UserCheck
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Recognition result
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Capture or upload a photo to begin.
                </p>
              </div>
            ) : recognitionResult.matched ? (
              <div className="w-full text-center">
                <CheckCircle2
                  size={42}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-3 text-sm font-medium text-emerald-600">
                  Student Recognized
                </p>

                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    recognitionResult.name
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Entry recorded successfully.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-slate-400">
                      Match Distance
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {recognitionResult.distance.toFixed(
                        3,
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-slate-400">
                      Entry Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {recognitionResult.timestamp
                        ? formatDateTime(
                            recognitionResult.timestamp,
                          ).time
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <XCircle
                  size={42}
                  className="mx-auto text-red-500"
                />

                <p className="mt-3 text-sm font-medium text-red-600">
                  Unknown Student
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No registered student matched this face.
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Match distance:{' '}
                  {recognitionResult.distance.toFixed(
                    3,
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Entry Records */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Entry Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent recognized student entries.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              placeholder="Search students..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">
                  Student
                </th>

                <th className="px-5 py-3 font-medium">
                  Roll Number
                </th>

                <th className="px-5 py-3 font-medium">
                  Date
                </th>

                <th className="px-5 py-3 font-medium">
                  Time
                </th>

                <th className="px-5 py-3 font-medium">
                  Match
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoadingRecords ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading entry records...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map(
                  (record) => {
                    const formatted =
                      formatDateTime(
                        record.timestamp,
                      )

                    return (
                      <tr
                        key={
                          record.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {
                              record.name
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {
                            record.roll_number
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {
                            formatted.date
                          }
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock3
                              size={
                                15
                              }
                            />

                            {
                              formatted.time
                            }
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {record.match_distance.toFixed(
                              3,
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No entry records found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Recognized students will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing{' '}
            {
              filteredRecords.length
            }{' '}
            of{' '}
            {
              records.length
            }{' '}
            records
          </p>
        </div>
      </div>
    </div>
  )
}

export default Attendance