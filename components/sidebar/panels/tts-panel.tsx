"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  useTTS, 
  useTTSPlayback, 
  useTTSSettings, 
  useTTSQuota,
  type TTSItem 
} from "@/lib/stores/tts-store"
import { useUI } from "@/lib/stores/ui-store"
import { sidebarVariants, listVariants, listItemVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"
import { 
  X,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  Settings,
  Trash2,
  RotateCcw,
  Clock,
  Zap,
  Activity,
  FileAudio,
  Headphones,
  Speaker
} from "lucide-react"

interface TTSPanelProps {
  className?: string
}

/**
 * TTS Panel Component
 * Complete interface for text-to-speech controls and queue management
 */
export function TTSPanel({ className }: TTSPanelProps) {
  const {
    queue,
    currentItem,
    isPlaying,
    playNext,
    pausePlayback,
    stopPlayback,
    skipCurrent,
    clearQueue,
    removeFromQueue,
  } = useTTSPlayback()

  const {
    settings,
    updateSettings,
    setVoice,
    setRate,
    setVolume,
    setAutoPlay,
    setEnabled,
  } = useTTSSettings()

  const {
    remaining: quotaRemaining,
    limit: quotaLimit,
    percentage: quotaPercentage,
    canUse: canUseTTS,
  } = useTTSQuota()

  const { activePanel, setActivePanel } = useUI()
  const { shouldAnimate } = useAnimationSafeMotion()

  // Local state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showSettings, setShowSettings] = useState(false)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // Get medical-optimized voices
  const getMedicalVoices = () => {
    return availableVoices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Aria') || 
       voice.name.includes('Neural') || 
       voice.name.includes('Premium') ||
       voice.quality === 'high')
    )
  }

  // Format queue item duration
  const formatDuration = (text: string) => {
    // Rough estimation: 150 words per minute
    const words = text.split(' ').length
    const minutes = Math.ceil(words / 150)
    return `~${minutes}m`
  }

  // Get status color
  const getStatusColor = (status: TTSItem['status']) => {
    switch (status) {
      case 'playing': return 'text-green-600'
      case 'completed': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  // Handle voice selection
  const handleVoiceChange = (voiceName: string) => {
    const voice = availableVoices.find(v => v.name === voiceName)
    if (voice) {
      setVoice(voice.name)
    }
  }

  if (activePanel !== 'tts') return null

  return (
    <motion.div 
      className={cn(
        "fixed inset-y-16 right-0 w-96 bg-background border-l border-border shadow-lg z-40",
        className
      )}
      variants={sidebarVariants}
      initial="closed"
      animate="open"
      exit="closed"
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Mic className="h-5 w-5 text-medical-primary" />
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="font-semibold">Text-to-Speech</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>TTS Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel(null)}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* TTS Status and Quota */}
      <div className="p-4 border-b bg-muted/30">
        <div className="space-y-3">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                settings.enabled ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="text-sm font-medium">
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isPlaying ? "default" : "secondary"} className="text-xs">
                {isPlaying ? 'Playing' : queue.length > 0 ? `${queue.length} Queued` : 'Idle'}
              </Badge>
            </div>
          </div>

          {/* Quota Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Quota</span>
              <span className="font-medium">{quotaRemaining}/{quotaLimit}</span>
            </div>
            <Progress 
              value={quotaPercentage} 
              className="h-2"
              aria-label={`TTS quota: ${quotaRemaining} of ${quotaLimit} remaining`}
            />
            <div className="text-xs text-center text-muted-foreground">
              {quotaPercentage.toFixed(1)}% used today
            </div>
          </div>

          {/* Warning if quota low */}
          {quotaPercentage > 80 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2">
              <div className="flex items-center gap-2 text-amber-800">
                <Zap className="h-3 w-3" />
                <span className="text-xs">
                  {quotaPercentage > 95 ? 'Quota nearly exhausted' : 'Quota running low'}
                </span>
              </div>
            </div>
          )}

          {/* Disabled warning */}
          {!settings.enabled && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <div className="flex items-center gap-2 text-gray-600">
                <VolumeX className="h-3 w-3" />
                <span className="text-xs">TTS is currently disabled</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TTS Settings Panel */}
      {showSettings && (
        <div className="border-b bg-muted/20">
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium">Settings</h4>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Enable TTS</label>
              <Button
                variant={settings.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => setEnabled(!settings.enabled)}
              >
                {settings.enabled ? (
                  <>
                    <Volume2 className="h-3 w-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3 w-3 mr-1" />
                    Disabled
                  </>
                )}
              </Button>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={settings.voice} onValueChange={handleVoiceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Medical Optimized
                  </div>
                  {getMedicalVoices().map(voice => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <div className="flex items-center gap-2">
                        <Headphones className="h-3 w-3" />
                        {voice.name}
                      </div>
                    </SelectItem>
                  ))}
                  <Separator />
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    All Voices
                  </div>
                  {availableVoices.filter(v => !getMedicalVoices().includes(v)).map(voice => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <div className="flex items-center gap-2">
                        <Speaker className="h-3 w-3" />
                        {voice.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speech Rate */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Speech Rate</label>
                <span className="text-xs text-muted-foreground">{settings.rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={([value]) => setRate(value)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Volume</label>
                <span className="text-xs text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([value]) => setVolume(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Auto-play */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Auto-play queue</label>
              <Button
                variant={settings.autoPlay ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoPlay(!settings.autoPlay)}
              >
                {settings.autoPlay ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Playing */}
      {currentItem && (
        <div className="p-4 border-b bg-green-50/50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-800">Now Playing</span>
            </div>

            <div className="bg-white/80 rounded p-3">
              <p className="text-sm line-clamp-3">{currentItem.text}</p>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatDuration(currentItem.text)}</span>
                <span>{currentItem.voice}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isPlaying ? pausePlayback : playNext}
                      disabled={!canUseTTS}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isPlaying ? 'Pause' : 'Resume'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipCurrent}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Skip</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopPlayback}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Stop</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Queue Management */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Audio Queue</h4>
            <div className="flex items-center gap-1">
              {queue.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearQueue}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear queue</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {!currentItem && queue.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={playNext}
                        disabled={!canUseTTS}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start playback</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Queue Items */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {queue.length === 0 ? (
              <div className="text-center py-8">
                <FileAudio className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No items in queue
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the speaker button on search results to add audio
                </p>
              </div>
            ) : (
              <motion.div 
                className="space-y-2"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {queue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={listItemVariants}
                    layout={shouldAnimate}
                  >
                    <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{item.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(item.text)}
                              </span>
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                getStatusColor(item.status)
                              )} />
                            </div>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromQueue(item.id)}
                                  className="p-1"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove from queue</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Voice: {item.voice} • Rate: {item.rate}x • Added: {new Date(item.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-center text-muted-foreground">
          {currentItem ? 'Playing' : queue.length > 0 ? `${queue.length} items queued` : 'Queue is empty'}
          {canUseTTS ? '' : ' • Quota exceeded'}
        </div>
      </div>
    </motion.div>
  )
}

TTSPanel.displayName = "TTSPanel"

export default TTSPanel