'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, X, AlertCircle } from 'lucide-react'

interface DemoVideoProps {
  videoUrl?: string // YouTube, Vimeo, or direct video URL
  videoId?: string // For YouTube/Vimeo
  videoType?: 'youtube' | 'vimeo' | 'direct' // Video source type
  thumbnailUrl?: string // Custom thumbnail (optional)
}

export default function DemoVideo({ 
  videoUrl, 
  videoId, 
  videoType = 'youtube',
  thumbnailUrl 
}: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Log video URL for debugging
  useEffect(() => {
    if (videoUrl) {
      console.log('DemoVideo: Video URL:', videoUrl)
      console.log('DemoVideo: Video Type:', videoType)
    }
  }, [videoUrl, videoType])

  // If no video provided, show placeholder
  if (!videoUrl && !videoId) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-700/50 dark:border-gray-600 group hover:border-emerald-500/30 transition-all duration-300 max-w-4xl mx-auto">
        <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
          <div className="text-center z-10">
            <button className="group/play mb-4 transition-transform hover:scale-110 active:scale-95 cursor-not-allowed opacity-50">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50 group-hover/play:shadow-emerald-500/70 transition-all duration-300">
                <Play className="w-12 h-12 text-white ml-1" />
              </div>
            </button>
            <p className="text-gray-300 text-xl font-semibold mb-2">Demo Video Coming Soon</p>
            <p className="text-gray-400 text-sm">Click "Try It Yourself" below to experience the platform</p>
          </div>
          {/* Animated decorative elements */}
          <div className="absolute top-4 left-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    )
  }

  const getEmbedUrl = () => {
    if (videoType === 'youtube' && videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    }
    if (videoType === 'vimeo' && videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    if (videoType === 'direct' && videoUrl) {
      return videoUrl
    }
    return ''
  }

  const getThumbnailUrl = () => {
    if (thumbnailUrl) return thumbnailUrl
    if (videoType === 'youtube' && videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return ''
  }

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-700/50 dark:border-gray-600 group hover:border-emerald-500/30 transition-all duration-300 max-w-4xl mx-auto">
        <div 
          className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center relative overflow-hidden cursor-pointer group/container"
          onClick={() => setIsPlaying(true)}
        >
          {/* Thumbnail or background */}
          {getThumbnailUrl() && (
            <img 
              src={getThumbnailUrl()} 
              alt="Demo Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/container:opacity-100 transition-opacity"
              onError={(e) => {
                // If thumbnail fails to load, hide it
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          
          {/* Play button overlay */}
          <div className="text-center z-10 relative">
            <button className="group/play mb-4 transition-transform hover:scale-110 active:scale-95">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50 group-hover/play:shadow-emerald-500/70 transition-all duration-300">
                <Play className="w-12 h-12 text-white ml-1" />
              </div>
            </button>
            <p className="text-gray-300 text-xl font-semibold mb-2 drop-shadow-lg">Watch Demo Video</p>
            <p className="text-gray-400 text-sm drop-shadow-lg">Click to play</p>
          </div>
          
          {/* Animated decorative elements (only if no thumbnail) */}
          {!getThumbnailUrl() && (
            <>
              <div className="absolute top-4 left-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-4 right-4 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          )}
        </div>
      </div>
    )
  }

  // Handle video errors
  const handleVideoError = (e?: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setHasError(true)
    setIsLoading(false)
    if (e && e.currentTarget) {
      const error = e.currentTarget.error
      if (error) {
        let message = 'Unknown error'
        let suggestion = ''
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            message = 'Video loading aborted'
            suggestion = 'Please try again or refresh the page'
            break
          case error.MEDIA_ERR_NETWORK:
            message = 'Network error while loading video'
            suggestion = 'Please check your internet connection'
            break
          case error.MEDIA_ERR_DECODE:
            message = 'Video decoding error - file may be corrupted'
            suggestion = 'The video file may be incomplete. Please regenerate the video.'
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'Video format not supported'
            suggestion = 'The video file format may not be compatible. Please ensure the video is a valid MP4 file with H.264 codec.'
            break
        }
        setErrorMessage(`${message}. ${suggestion}`)
        console.error('Video error details:', {
          code: error.code,
          message: message,
          videoUrl: videoUrl,
          networkState: e.currentTarget.networkState,
          readyState: e.currentTarget.readyState
        })
      } else {
        setErrorMessage('Failed to load video. Please check if the file exists and is accessible.')
      }
    } else {
      setErrorMessage('Video failed to load. Please try refreshing the page.')
    }
  }

  const handleVideoLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleVideoCanPlay = () => {
    setIsLoading(false)
  }

  // Reset error when closing
  const handleClose = () => {
    setIsPlaying(false)
    setHasError(false)
    setIsLoading(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  // Video player
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-700/50 dark:border-gray-600 group hover:border-emerald-500/30 transition-all duration-300 relative max-w-4xl mx-auto">
      <div className="aspect-video bg-black relative">
        {(videoType === 'youtube' || videoType === 'vimeo') ? (
          <iframe
            src={getEmbedUrl()}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="MedEvidence AI Demo Video"
            onError={() => setHasError(true)}
          />
        ) : (
          <>
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-8 max-w-md">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2">Video failed to load</p>
                  {errorMessage && (
                    <p className="text-gray-300 text-sm mb-2 font-medium">{errorMessage}</p>
                  )}
                  <p className="text-gray-400 text-sm mb-4">
                    {videoUrl ? `Trying to load: ${videoUrl}` : 'No video URL provided'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setHasError(false)
                        setErrorMessage('')
                        setIsLoading(true)
                        if (videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    handleVideoError(e)
                  }}
                  onLoadStart={handleVideoLoadStart}
                  onCanPlay={handleVideoCanPlay}
                  onLoadedData={handleVideoCanPlay}
                  onLoadedMetadata={() => setIsLoading(false)}
                >
                  <source src={`${videoUrl}?v=${Date.now()}`} type="video/mp4; codecs=avc1.42E01E, mp4a.40.2" />
                  <source src={`${videoUrl}?v=${Date.now()}`} type="video/mp4" />
                  <source src={`${videoUrl?.replace('.mp4', '.webm')}?v=${Date.now()}`} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </>
            )}
          </>
        )}
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors group/close"
          aria-label="Close video"
        >
          <X className="w-5 h-5 text-white group-hover/close:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  )
}


