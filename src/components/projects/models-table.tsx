'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Boxes,
  Cpu,
  ExternalLink,
  Eye,
  GitBranch,
  Percent,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  createProjectModel,
  type createProjectModelSchema,
  deleteProjectModel,
  getGlobalModels,
  getProjectModels,
} from '@/server/model-fns'

interface ModelsTableProps {
  projectId: string
}

type CreateProjectModelInput = z.infer<typeof createProjectModelSchema>

export function ModelsTable({ projectId }: ModelsTableProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // Form states
  const [selectedModelId, setSelectedModelId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customVersion, setCustomVersion] = useState('v1.0.0')
  const [status, setStatus] = useState<'draft' | 'training' | 'ready' | 'deployed' | 'archived'>(
    'ready',
  )
  const [description, setDescription] = useState('')
  const [mapVal, setMapVal] = useState('')
  const [precisionVal, setPrecisionVal] = useState('')
  const [recallVal, setRecallVal] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  // Queries
  const { data: globalModels = [], isLoading: isLoadingGlobals } = useQuery({
    queryKey: ['global-models'],
    queryFn: () => getGlobalModels(),
  })

  const { data: projectModels = [], isLoading: isLoadingProjectModels } = useQuery({
    queryKey: ['project-models', projectId],
    queryFn: () => getProjectModels({ data: projectId }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectModelInput) => createProjectModel({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-models', projectId] })
      toast.success('Model registered successfully')
      resetForm()
      setIsRegisterOpen(false)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to register model')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectModel({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-models', projectId] })
      toast.success('Model deleted successfully')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to delete model')
    },
  })

  const resetForm = () => {
    setSelectedModelId('')
    setCustomName('')
    setCustomVersion('v1.0.0')
    setStatus('ready')
    setDescription('')
    setMapVal('')
    setPrecisionVal('')
    setRecallVal('')
    setFileUrl('')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModelId || !customName.trim()) {
      toast.error('Please select a base model and provide a name')
      return
    }

    const metricsObj: Record<string, number> = {}
    if (mapVal) metricsObj.mAP = parseFloat(mapVal)
    if (precisionVal) metricsObj.precision = parseFloat(precisionVal)
    if (recallVal) metricsObj.recall = parseFloat(recallVal)

    createMutation.mutate({
      projectId,
      modelId: selectedModelId,
      name: customName,
      version: customVersion,
      status,
      description: description || undefined,
      metrics: Object.keys(metricsObj).length > 0 ? JSON.stringify(metricsObj) : undefined,
      fileUrl: fileUrl || undefined,
    })
  }

  const handleBaseModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    const baseModel = globalModels.find((m) => m.id === modelId)
    if (baseModel) {
      setCustomName(`${baseModel.name}-run`)
      setCustomVersion(baseModel.version || 'v1.0.0')
    }
  }

  const filteredModels = projectModels.filter(
    (pm) =>
      pm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.baseModelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.framework.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
            Draft
          </Badge>
        )
      case 'training':
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
          >
            Training
          </Badge>
        )
      case 'ready':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Ready
          </Badge>
        )
      case 'deployed':
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
          >
            Active
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
            Archived
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFrameworkBadge = (fw: string) => {
    const fwLower = fw.toLowerCase()
    if (fwLower.includes('ultralytics') || fwLower.includes('yolo')) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
          Ultralytics
        </Badge>
      )
    }
    if (fwLower.includes('roboflow')) {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
          Roboflow
        </Badge>
      )
    }
    if (fwLower.includes('pytorch')) {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
          PyTorch
        </Badge>
      )
    }
    if (fwLower.includes('tensorflow')) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          TensorFlow
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
        {fw}
      </Badge>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 bg-background border border-border/40 shadow-sm rounded-2xl overflow-hidden p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Cpu className="size-5 text-primary" />
            ML Models
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {projectModels.length} models registered ·{' '}
            {projectModels.filter((m) => m.status === 'deployed').length} active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-10 border-border/60 focus:border-primary/50"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-border/60 hover:bg-muted"
            render={<Link to="/settings" search={{ view: 'models' } as any} />}
            title="View Global Catalog"
          >
            <Eye className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            onClick={() => setIsRegisterOpen(true)}
            className="h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Register Model
          </Button>
        </div>
      </div>

      {isLoadingProjectModels ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : (
        <div className="border border-border/40 rounded-xl overflow-hidden mt-2 shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Model / Custom Name</TableHead>
                <TableHead>Base Model</TableHead>
                <TableHead>Framework & Architecture</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((pm) => {
                let metricsObj: any = null
                if (pm.metrics) {
                  try {
                    metricsObj = JSON.parse(pm.metrics)
                  } catch (_e) {
                    // ignore
                  }
                }

                return (
                  <TableRow key={pm.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-semibold">{pm.name}</span>
                        {pm.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {pm.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Cpu className="size-3.5" />
                        {pm.baseModelName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFrameworkBadge(pm.framework)}
                        <span className="text-xs text-muted-foreground">{pm.architecture}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      <div className="flex items-center gap-1">
                        <GitBranch className="size-3" />
                        {pm.version}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(pm.status)}</TableCell>
                    <TableCell>
                      {metricsObj ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                          {metricsObj.mAP !== undefined && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono py-0.5 px-1.5 bg-muted/40 border border-border/30 gap-0.5"
                            >
                              mAP:{' '}
                              <span className="font-bold text-foreground">
                                {(metricsObj.mAP * 100).toFixed(1)}%
                              </span>
                            </Badge>
                          )}
                          {metricsObj.precision !== undefined && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono py-0.5 px-1.5 bg-muted/40 border border-border/30 gap-0.5"
                            >
                              P:{' '}
                              <span className="font-bold text-foreground">
                                {(metricsObj.precision * 100).toFixed(1)}%
                              </span>
                            </Badge>
                          )}
                          {metricsObj.recall !== undefined && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono py-0.5 px-1.5 bg-muted/40 border border-border/30 gap-0.5"
                            >
                              R:{' '}
                              <span className="font-bold text-foreground">
                                {(metricsObj.recall * 100).toFixed(1)}%
                              </span>
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                          render={<Link to="/settings" search={{ view: 'models' } as any} />}
                          title="View Global Catalog"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        {pm.fileUrl && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => window.open(pm.fileUrl || '', '_blank')}
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove model "${pm.name}"?`)) {
                              deleteMutation.mutate(pm.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredModels.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground bg-muted/5"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-sm">No models registered yet</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Register trained model weights and training runs to compare metrics and
                        deploy inference models.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Register Model Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <form onSubmit={handleRegister}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground font-heading">
                <Cpu className="size-5 text-primary" />
                Register Trained Model
              </DialogTitle>
              <DialogDescription>
                Select a base model architecture and input the training results, weights URL, and
                metrics.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-5">
              {/* Base Model selection */}
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-0.5">
                  Base Model Framework
                </label>
                {isLoadingGlobals ? (
                  <Spinner className="size-5" />
                ) : (
                  <Select value={selectedModelId} onValueChange={handleBaseModelChange}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/60">
                      <SelectValue placeholder="Select base model architecture..." />
                    </SelectTrigger>
                    <SelectContent>
                      {globalModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            {getFrameworkBadge(m.framework)}
                            <span className="font-medium text-foreground">{m.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({m.architecture})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Custom Name */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="custom-name"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Model Custom Name
                </label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. YOLOv8n-fire-detection-v1"
                  className="h-10 rounded-xl border-border/60"
                  required
                />
              </div>

              {/* Version & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="model-version"
                    className="text-xs font-semibold text-muted-foreground ml-0.5"
                  >
                    Version
                  </label>
                  <Input
                    id="model-version"
                    value={customVersion}
                    onChange={(e) => setCustomVersion(e.target.value)}
                    placeholder="e.g. v1.0.0"
                    className="h-10 rounded-xl border-border/60"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground ml-0.5">
                    Status
                  </label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/60">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="deployed">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="model-desc"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Description / Notes
                </label>
                <Textarea
                  id="model-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your training run, config choices, hyperparameters..."
                  className="rounded-xl min-h-[60px] border-border/60"
                />
              </div>

              {/* Metrics Header */}
              <div className="border-t border-border/30 pt-3">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Percent className="size-3.5 text-primary" />
                  Validation Metrics (between 0.0 and 1.0)
                </span>
              </div>

              {/* Metrics inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="metric-map"
                    className="text-[10px] font-semibold text-muted-foreground ml-0.5"
                  >
                    mAP (50-95)
                  </label>
                  <Input
                    id="metric-map"
                    value={mapVal}
                    onChange={(e) => setMapVal(e.target.value)}
                    placeholder="e.g. 0.84"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="h-10 rounded-xl border-border/60"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label
                    htmlFor="metric-prec"
                    className="text-[10px] font-semibold text-muted-foreground ml-0.5"
                  >
                    Precision
                  </label>
                  <Input
                    id="metric-prec"
                    value={precisionVal}
                    onChange={(e) => setPrecisionVal(e.target.value)}
                    placeholder="e.g. 0.89"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="h-10 rounded-xl border-border/60"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label
                    htmlFor="metric-rec"
                    className="text-[10px] font-semibold text-muted-foreground ml-0.5"
                  >
                    Recall
                  </label>
                  <Input
                    id="metric-rec"
                    value={recallVal}
                    onChange={(e) => setRecallVal(e.target.value)}
                    placeholder="e.g. 0.81"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="h-10 rounded-xl border-border/60"
                  />
                </div>
              </div>

              {/* Weights File URL */}
              <div className="grid gap-1.5 border-t border-border/30 pt-3">
                <label
                  htmlFor="weights-url"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Trained Weights URL (Roboflow / Ultralytics link)
                </label>
                <Input
                  id="weights-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://app.roboflow.com/..."
                  className="h-10 rounded-xl border-border/60"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsRegisterOpen(false)
                }}
                disabled={createMutation.isPending}
                className="h-10 rounded-xl border-border/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !selectedModelId || !customName.trim()}
                className="h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-medium"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Model'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
