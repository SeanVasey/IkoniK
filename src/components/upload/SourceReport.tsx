'use client'

import { useState, useEffect } from 'react'

interface SourceReportProps {
  file: File
  preview: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SourceReport({ file, preview }: SourceReportProps) {
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = preview
  }, [preview])

  return (
    <div className="flex items-start gap-3 rounded-lg bg-pewter p-3">
      {/* Thumbnail */}
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={`Thumbnail of ${file.name}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {file.name}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-secondary">
          <span>{formatFileSize(file.size)}</span>
          <span className="uppercase">{file.type.split('/')[1]}</span>
          {dimensions && (
            <span>
              {dimensions.width} x {dimensions.height}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
