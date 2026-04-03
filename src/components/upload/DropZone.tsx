'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useConvertStore } from '@/stores/useConvertStore'
import { uploadFile } from '@/lib/upload/uploadFile'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DropZoneProps {
  className?: string
}

export function DropZone({ className = '' }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    setSourceFile,
    setSourcePreview,
    setUploadPath,
    setUploading,
    setUploadError,
    isUploading,
  } = useConvertStore()

  const abortRef = useRef<AbortController | null>(null)

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setValidationError(null)
      setUploadError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setValidationError(
          'Invalid file type. Please upload a PNG, JPEG, WebP, or GIF image.'
        )
        return
      }

      if (file.size > MAX_SIZE_BYTES) {
        setValidationError(
          `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
        )
        return
      }

      setSelectedFileName(file.name)
      setSelectedFileSize(file.size)

      // Generate a local Data URL for preview (kept client-side only)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setSourceFile(file)
        setSourcePreview(dataUrl)
      }
      reader.onerror = () => {
        setValidationError('Failed to read the file. Please try again.')
      }
      reader.readAsDataURL(file)

      // Upload to server in parallel (non-blocking for preview)
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setUploading(true)
      setUploadPath(null)

      uploadFile(file, controller.signal)
        .then((result) => {
          setUploadPath(result.path)
          setUploading(false)
        })
        .catch((err) => {
          if (controller.signal.aborted) return
          setUploadError(err instanceof Error ? err.message : 'Upload failed')
          setUploading(false)
        })
    },
    [setSourceFile, setSourcePreview, setUploadPath, setUploading, setUploadError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        validateAndProcessFile(file)
      }
    },
    [validateAndProcessFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        validateAndProcessFile(file)
      }
    },
    [validateAndProcessFile]
  )

  return (
    <motion.div
      className={`relative ${className}`}
      animate={isDragOver ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex min-h-[280px] cursor-pointer flex-col items-center justify-center
          rounded-xl border-2 border-dashed p-8 transition-all duration-200
          ${
            isDragOver
              ? 'border-accent bg-accent-glow shadow-[0_0_40px_rgba(124,92,252,0.1)]'
              : 'border-text-tertiary hover:border-accent hover:bg-accent-surface'
          }
        `}
        aria-label="Upload image drop zone"
      >
        {/* Upload icon */}
        <motion.div
          animate={isDragOver ? { y: -4 } : { y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors duration-200 ${
              isDragOver ? 'text-accent' : 'text-text-tertiary'
            }`}
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>

        <p className="text-lg font-medium text-text-primary">
          Drop your image here
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          or click to browse
        </p>
        <p className="mt-3 text-xs text-text-tertiary">
          PNG, JPEG, WebP, GIF -- up to 10 MB
        </p>

        {selectedFileName && selectedFileSize !== null && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-pewter px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-sm text-text-primary">{selectedFileName}</span>
            <span className="text-xs text-text-tertiary">
              ({formatFileSize(selectedFileSize)})
            </span>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm text-accent">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading securely...
          </div>
        )}

        {validationError && (
          <div className="mt-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
            {validationError}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </motion.div>
  )
}
