import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { DetectionResult } from '@/server/detection-fns'
import { runDetection } from '@/server/detection-fns'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  BugIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  FlaskConicalIcon,
  Loader2Icon,
  ScanLineIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  XCircleIcon,
  ZapIcon,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/dashboard')({
  component: DashboardPage,
})


const MODELS = [
  {
    id: 'yolov8n',
    name: 'YOLOv8n',
    type: 'Nano',
    description: 'Le plus rapide, idéal pour le temps réel sur CPU.',
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8s',
    type: 'Small',
    description: 'Bon compromis vitesse / précision, recommandé par défaut.',
  },
  {
    id: 'yolov8m',
    name: 'YOLOv8m',
    type: 'Medium',
    description: 'Plus précis, légèrement plus lent que YOLOv8s.',
  },
  {
    id: 'yolov9s',
    name: 'YOLOv9s',
    type: 'Small',
    description: 'Architecture YOLOv9, meilleure détection des petites lésions.',
  },
  {
    id: 'yolov10s',
    name: 'YOLOv10s',
    type: 'Small',
    description: 'Sans NMS, inférence plus rapide à précision équivalente.',
  },
  {
    id: 'yolov11s',
    name: 'YOLOv11s',
    type: 'Small',
    description: 'Dernière génération YOLO, meilleur équilibre global.',
  },
  {
    id: 'rt-detr',
    name: 'RT-DETR',
    type: 'Transformer',
    description: 'Basé sur les transformers, précision maximale.',
  },
]



function drawDetections(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  detections: DetectionResult['detections'],
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.drawImage(img, 0, 0)

  const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7']
  const colorMap: Record<string, string> = {}
  let colorIndex = 0

  for (const det of detections) {
    if (!colorMap[det.class]) {
      colorMap[det.class] = palette[colorIndex % palette.length]
      colorIndex++
    }

    const [x1, y1, x2, y2] = det.bbox
    const color = colorMap[det.class]
    const lineWidth = Math.max(2, canvas.width / 300)
    const fontSize = Math.max(12, canvas.width / 50)
    const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

    ctx.font = `bold ${fontSize}px sans-serif`
    const textWidth = ctx.measureText(label).width
    const labelH = fontSize + 6
    ctx.fillStyle = color
    ctx.fillRect(x1, y1 - labelH, textWidth + 8, labelH)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x1 + 4, y1 - 4)
  }
}


function DashboardPage() {
  const { org } = OrgRoute.useLoaderData()

  const [dragOver, setDragOver] = useState(false)
  const [selectedModel, setSelectedModel] = useState('yolov8s')
  const [modelOpen, setModelOpen] = useState(false)
  const [confidence, setConfidence] = useState(25)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selectedModelInfo = MODELS.find((m) => m.id === selectedModel) ?? MODELS[1]

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez uploader une image valide (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image doit faire moins de 10MB")
      return
    }
    setSelectedFile(file)
    setResult(null)
    setResultImageUrl(null)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDetect = async () => {
    if (!selectedFile) {
      toast.error('Veuillez uploader une image')
      return
    }

    setIsLoading(true)
    setResult(null)
    setResultImageUrl(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('model_name', selectedModel)

      const detectionResult = await runDetection({ data: formData })

      const filteredDetections = detectionResult.detections.filter(
        (det) => det.confidence >= confidence / 100,
      )
      const filteredResult = { ...detectionResult, detections: filteredDetections }

      setResult(filteredResult)

      if (previewUrl && canvasRef.current) {
        const img = new Image()
        img.onload = () => {
          if (canvasRef.current) {
            drawDetections(canvasRef.current, img, filteredDetections)
            setResultImageUrl(canvasRef.current.toDataURL('image/jpeg', 0.9))
          }
        }
        img.src = previewUrl
      }

      if (filteredDetections.length === 0) {
        toast.success('Analyse terminée — Aucune maladie détectée')
      } else {
        toast.success(`${filteredDetections.length} région(s) détectée(s)`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de la détection'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setResultImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const detectionSummary = result
    ? Object.entries(
        result.detections.reduce(
          (acc, det) => {
            acc[det.class] = (acc[det.class] ?? 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      )
    : []

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 px-4 sm:px-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Détection des Maladies de l'Olivier
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Uploadez une photo de feuille ou de branche pour détecter les maladies — {org.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Modèles disponibles', value: '7', icon: FlaskConicalIcon },
          { label: 'Maladies détectables', value: '3', icon: BugIcon },
          { label: 'Meilleure précision', value: '96%', icon: ShieldCheckIcon },
          { label: 'Temps inférence', value: '<3s', icon: ZapIcon },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <stat.icon className="size-4 text-primary opacity-60" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — Upload (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Upload zone */}
          <Card>
            <CardHeader>
              <CardTitle>Uploader une Image</CardTitle>
              <CardDescription>
                Glissez-déposez ou cliquez pour sélectionner une photo d'olivier
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!previewUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-border hover:bg-muted/30',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-16 items-center justify-center rounded-full transition-all',
                      dragOver ? 'bg-primary/10' : 'bg-muted',
                    )}
                  >
                    <UploadCloudIcon
                      className={cn(
                        'size-8',
                        dragOver ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-sm font-medium">
                      Déposez votre image ici ou{' '}
                      <span className="text-primary underline-offset-4 hover:underline">
                        parcourir
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP jusqu'à 10MB</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UploadCloudIcon data-icon="inline-start" />
                    Choisir un fichier
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20">
                    <img
                      src={resultImageUrl ?? previewUrl}
                      alt="Aperçu"
                      className="w-full object-contain max-h-96"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                        <Loader2Icon className="size-10 text-primary animate-spin" />
                        <p className="text-sm font-medium">
                          Analyse avec {selectedModelInfo.name}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          CPU gratuit — peut prendre quelques secondes
                        </p>
                      </div>
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Result */}
                  {result && (
                    <div
                      className={cn(
                        'rounded-xl border p-4 flex flex-col gap-3',
                        result.detections.length > 0
                          ? 'border-destructive/30 bg-destructive/5'
                          : 'border-primary/30 bg-primary/5',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {result.detections.length > 0 ? (
                          <AlertTriangleIcon className="size-5 text-destructive shrink-0" />
                        ) : (
                          <CheckCircle2Icon className="size-5 text-primary shrink-0" />
                        )}
                        <span className="text-sm font-semibold">
                          {result.detections.length > 0
                            ? `${result.detections.length} région(s) détectée(s)`
                            : 'Aucune maladie détectée — Plante saine'}
                        </span>
                      </div>
                      {detectionSummary.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {detectionSummary.map(([cls, count]) => {
                            const avgConf =
                              (result.detections
                                .filter((d) => d.class === cls)
                                .reduce((s, d) => s + d.confidence, 0) /
                                count) *
                              100
                            return (
                              <div
                                key={cls}
                                className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-background px-3 py-1.5"
                              >
                                <span className="text-xs font-semibold">{cls}</span>
                                <Badge variant="destructive" className="text-[10px]">
                                  {count}x
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {avgConf.toFixed(1)}% moy.
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={handleDetect} disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <Loader2Icon data-icon="inline-start" className="animate-spin" />
                      ) : (
                        <ScanLineIcon data-icon="inline-start" />
                      )}
                      {isLoading
                        ? 'Analyse en cours...'
                        : result
                          ? 'Ré-analyser'
                          : 'Détecter les maladies'}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                      <XCircleIcon data-icon="inline-start" />
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right col (1/3) */}
        <div className="flex flex-col gap-4">

          {/* Model selector via Collapsible */}
          <Card>
            <CardHeader>
              <CardTitle>Modèle de Détection</CardTitle>
              <CardDescription>Sélectionnez l'architecture de deep learning</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={modelOpen} onOpenChange={(open: boolean) => setModelOpen(open)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm font-semibold">{selectedModelInfo.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedModelInfo.type}
                    </Badge>
                  </div>
                  <ChevronDownIcon
                    className={cn(
                      'size-4 text-muted-foreground transition-transform duration-200',
                      modelOpen && 'rotate-180',
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-1 pt-2">
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id)
                          setModelOpen(false)
                        }}
                        className={cn(
                          'flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                          selectedModel === model.id
                            ? 'bg-primary/5 border border-primary/20'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <div
                          className={cn(
                            'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                            selectedModel === model.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/40',
                          )}
                        >
                          {selectedModel === model.id && (
                            <div className="size-1.5 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium">{model.name}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {model.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {model.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Confidence threshold — native range input */}
          <Card>
            <CardHeader>
              <CardTitle>Seuil de Confiance</CardTitle>
              <CardDescription>Filtrer les prédictions faibles</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confiance minimale</span>
                <Badge variant="secondary">{confidence}%</Badge>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Les prédictions sous {confidence}% de confiance seront ignorées.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}