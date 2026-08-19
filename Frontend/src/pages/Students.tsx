import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'

interface Student {
  id: number
  name: string
  roll_number: string
}

type PhotoMode = 'upload' | 'camera'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')

  const [faceFile, setFaceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [photoMode, setPhotoMode] =
    useState<PhotoMode>('upload')

  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchStudents()

    return () => {
      stopCamera()
    }
  }, [])

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return students
    }

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(query) ||
        student.roll_number.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, students])

  async function fetchStudents() {
    setIsLoading(true)

    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('You are not authenticated.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to load students.')
      }

      const data: Student[] = await response.json()

      setStudents(data)
    } catch {
      setError('Failed to load students.')
    } finally {
      setIsLoading(false)
    }
  }

  function clearSelectedPhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFaceFile(null)
    setPreviewUrl(null)
  }

  function resetForm() {
    stopCamera()
    clearSelectedPhoto()

    setName('')
    setRollNumber('')
    setPhotoMode('upload')
    setIsCameraOpen(false)
  }

  function closeModal() {
    if (isSubmitting) {
      return
    }

    resetForm()
    setIsAddModalOpen(false)
    setError('')
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
    const file = event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    stopCamera()

    setPhotoMode('upload')
    setFaceFile(file)
    setError('')

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(URL.createObjectURL(file))

    // Allows selecting the same file again.
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
        videoRef.current.srcObject = stream

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
      setError('Camera is not ready yet.')
      return
    }

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')

    if (!context) {
      setError('Unable to capture the photo.')
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
          setError('Unable to create the captured image.')
          return
        }

        const file = new File(
          [blob],
          'student-camera-capture.jpg',
          {
            type: 'image/jpeg',
          },
        )

        setFaceFile(file)

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

  function handleRetakePhoto() {
    stopCamera()
    clearSelectedPhoto()

    setPhotoMode('camera')
    setError('')

    startCamera()
  }

  async function handleAddStudent(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccessMessage('')

    if (!faceFile) {
      setError(
        'Please upload a photo or take a photo first.',
      )
      return
    }

    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('You are not authenticated.')
      return
    }

    const formData = new FormData()

    formData.append('name', name.trim())
    formData.append(
      'roll_number',
      rollNumber.trim(),
    )
    formData.append('file', faceFile)

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Student enrollment failed.',
        )
        return
      }

      setSuccessMessage(
        `${data.name} was enrolled successfully.`,
      )

      await fetchStudents()

      closeModal()
    } catch {
      setError(
        'Unable to connect to the attendance server.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteStudent(
    student: Student,
  ) {
    const confirmed = window.confirm(
      `Delete ${student.name} (${student.roll_number})? This will also delete their attendance records.`,
    )

    if (!confirmed) {
      return
    }

    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('You are not authenticated.')
      return
    }

    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/students/${student.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Failed to delete student.',
        )
        return
      }

      setStudents((current) =>
        current.filter(
          (item) => item.id !== student.id,
        ),
      )

      setSuccessMessage(
        `${student.name} was deleted successfully.`,
      )
    } catch {
      setError(
        'Unable to connect to the attendance server.',
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered students and their face recognition profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('')
            setSuccessMessage('')
            setIsAddModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Add Student
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      )}

      {error && !isAddModalOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Students
              </p>

              <p className="text-2xl font-semibold text-slate-900">
                {students.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Face Registered
              </p>

              <p className="text-2xl font-semibold text-slate-900">
                {students.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Student Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage registered students.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
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
                  Face Recognition
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {student.name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {student.roll_number}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Registered
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteStudent(
                            student,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {searchQuery
                        ? 'Try another search.'
                        : 'No students have been registered yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredStudents.length} of{' '}
            {students.length} students
          </p>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Register Student
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the student's identity and face profile.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="space-y-5 px-6 py-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="student-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="e.g. Muhammad Ali"
                    required
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label
                    htmlFor="student-roll-number"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    University Roll Number
                  </label>

                  <input
                    id="student-roll-number"
                    type="text"
                    value={rollNumber}
                    onChange={(event) =>
                      setRollNumber(event.target.value)
                    }
                    placeholder="e.g. F2022376133"
                    required
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* Photo */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Face Photo
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleUploadMode}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                        photoMode === 'upload'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Upload size={16} />
                      Upload Photo
                    </button>

                    <button
                      type="button"
                      onClick={handleCameraMode}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                        photoMode === 'camera'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Camera size={16} />
                      Take Photo
                    </button>
                  </div>
                </div>

                {/* Upload Mode */}
                {photoMode === 'upload' && (
                  <>
                    {previewUrl ? (
                      <div className="space-y-3">
                        <div className="overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={previewUrl}
                            alt="Selected face"
                            className="aspect-video w-full object-contain"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={clearSelectedPhoto}
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Choose Another Photo
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="student-face"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        <Upload
                          size={24}
                          className="text-slate-500"
                        />

                        <p className="mt-2 text-sm font-medium text-slate-700">
                          Choose a face photo
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          One clear, front-facing person.
                        </p>

                        <input
                          id="student-face"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    )}
                  </>
                )}

                {/* Camera Mode */}
                {photoMode === 'camera' && (
                  <div className="space-y-3">
                    {isCameraOpen ? (
                      <>
                        <div className="overflow-hidden rounded-lg bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="aspect-video w-full object-cover"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCameraLoading}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Camera size={17} />

                          {isCameraLoading
                            ? 'Starting camera...'
                            : 'Capture Photo'}
                        </button>
                      </>
                    ) : previewUrl ? (
                      <>
                        <div className="overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={previewUrl}
                            alt="Captured face"
                            className="aspect-video w-full object-contain"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Retake Photo
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || !faceFile
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Registering...'
                    : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students