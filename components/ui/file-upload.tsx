"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  fileType?: string // Add fileType prop
}

export function FileUpload({ onFilesSelected, accept = "*", multiple = false, fileType = "file" }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      const newFiles = [...files, ...fileArray]
      setFiles(newFiles)
      onFilesSelected(newFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files)
      const newFiles = [...files, ...fileArray]
      setFiles(newFiles)
      onFilesSelected(newFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
      />

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
          <div
            className={`p-4 rounded-full ${
              isDragging ? "bg-purple-500/20" : "bg-white/10"
            } transition-colors duration-200`}
          >
            <Upload className="h-8 w-8 text-white/80" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragging ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-sm text-white/60 mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-white/40">
            {multiple ? `Upload unlimited ${fileType} files` : `Upload a ${fileType} file`}
          </p>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="text-sm font-medium text-white/80 mb-2 flex justify-between items-center">
              <span>Selected Files ({files.length})</span>
              {files.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
                  onClick={() => {
                    setFiles([])
                    onFilesSelected([])
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="max-h-[200px] overflow-y-auto pr-1 mb-2 border border-white/10 rounded-lg bg-black/20">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-white/60 shrink-0" />
                    <div className="truncate max-w-[200px] sm:max-w-xs">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
