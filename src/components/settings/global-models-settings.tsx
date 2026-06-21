'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Brain, Cpu, GitBranch, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { createGlobalModel, deleteGlobalModel, getGlobalModels } from '@/server/model-fns'

interface GlobalModelsSettingsProps {
  className?: string
}

export function GlobalModelsSettings({ className }: GlobalModelsSettingsProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [framework, setFramework] = useState('ultralytics')
  const [customFramework, setCustomFramework] = useState('')
  const [architecture, setArchitecture] = useState('Object Detection')
  const [customArchitecture, setCustomArchitecture] = useState('')
  const [version, setVersion] = useState('v1.0.0')
  const [description, setDescription] = useState('')

  // Queries
  const { data: globalModels = [], isLoading } = useQuery({
    queryKey: ['global-models'],
    queryFn: () => getGlobalModels(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createGlobalModel({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-models'] })
      toast.success('Global model added to catalog')
      resetForm()
      setIsAddOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to add model')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGlobalModel({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-models'] })
      toast.success('Global model deleted from catalog')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to delete model')
    },
  })

  const resetForm = () => {
    setName('')
    setFramework('ultralytics')
    setCustomFramework('')
    setArchitecture('Object Detection')
    setCustomArchitecture('')
    setVersion('v1.0.0')
    setDescription('')
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Model name is required')
      return
    }

    const finalFramework = framework === 'other' ? customFramework.trim() : framework
    const finalArchitecture = architecture === 'other' ? customArchitecture.trim() : architecture

    if (!finalFramework) {
      toast.error('Framework is required')
      return
    }
    if (!finalArchitecture) {
      toast.error('Architecture is required')
      return
    }

    createMutation.mutate({
      name,
      framework: finalFramework,
      architecture: finalArchitecture,
      version,
      description: description || undefined,
    })
  }

  const filteredModels = globalModels.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.architecture.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFrameworkBadge = (fw: string) => {
    const fwLower = fw.toLowerCase()
    if (fwLower.includes('yolo') || fwLower.includes('ultralytics')) {
      return (
        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          Ultralytics
        </Badge>
      )
    }
    if (fwLower.includes('pytorch') || fwLower.includes('sam')) {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
          PyTorch
        </Badge>
      )
    }
    if (fwLower.includes('tensorflow') || fwLower.includes('keras')) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          TensorFlow
        </Badge>
      )
    }
    if (fwLower.includes('roboflow')) {
      return (
        <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
          Roboflow
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold mb-1">Global ML Models Catalog</h2>
          <p className="text-xs text-muted-foreground">
            Manage the list of base models available to all projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search base models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-9 border-border/60 focus:border-primary/50 text-xs"
            />
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Add Base Model
          </Button>
        </div>
      </div>

      <Card className={className}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/20">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Base Model Name</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Architecture / Task</TableHead>
                    <TableHead>Default Version</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((m) => (
                    <TableRow key={m.id} className="group hover:bg-muted/10 transition-colors">
                      <TableCell className="font-semibold text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">{m.name}</span>
                          {m.description && (
                            <span className="text-xs text-muted-foreground font-normal line-clamp-1">
                              {m.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getFrameworkBadge(m.framework)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Cpu className="size-3.5" />
                          {m.architecture}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <GitBranch className="size-3" />
                          {m.version}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to remove global model "${m.name}"? This might affect projects that reference it.`,
                              )
                            ) {
                              deleteMutation.mutate(m.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredModels.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground bg-muted/5"
                      >
                        No base models found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Model Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground font-heading">
                <Brain className="size-5 text-primary" />
                Add Base Model
              </DialogTitle>
              <DialogDescription>
                Define a new ML model to be available globally in the RefactVision model catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-5">
              {/* Name */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="base-name"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Model Name
                </label>
                <Input
                  id="base-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. YOLOv10n"
                  className="h-10 rounded-xl border-border/60"
                  required
                />
              </div>

              {/* Framework */}
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-0.5">
                  Framework
                </label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/60">
                    <SelectValue placeholder="Select Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultralytics">Ultralytics</SelectItem>
                    <SelectItem value="roboflow">Roboflow</SelectItem>
                    <SelectItem value="pytorch">PyTorch</SelectItem>
                    <SelectItem value="tensorflow">TensorFlow</SelectItem>
                    <SelectItem value="other">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
                {framework === 'other' && (
                  <Input
                    value={customFramework}
                    onChange={(e) => setCustomFramework(e.target.value)}
                    placeholder="Enter custom framework name..."
                    className="h-10 rounded-xl border-border/60 mt-1"
                    required
                  />
                )}
              </div>

              {/* Architecture */}
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-0.5">
                  Architecture / Task
                </label>
                <Select value={architecture} onValueChange={setArchitecture}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/60">
                    <SelectValue placeholder="Select Architecture / Task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Object Detection">Object Detection</SelectItem>
                    <SelectItem value="Instance Segmentation">Instance Segmentation</SelectItem>
                    <SelectItem value="Vision-Language">Vision-Language</SelectItem>
                    <SelectItem value="Image Classification">Image Classification</SelectItem>
                    <SelectItem value="other">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
                {architecture === 'other' && (
                  <Input
                    value={customArchitecture}
                    onChange={(e) => setCustomArchitecture(e.target.value)}
                    placeholder="Enter custom architecture/task..."
                    className="h-10 rounded-xl border-border/60 mt-1"
                    required
                  />
                )}
              </div>

              {/* Version */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="base-version"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Default Version
                </label>
                <Input
                  id="base-version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. v10.0"
                  className="h-10 rounded-xl border-border/60"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="base-desc"
                  className="text-xs font-semibold text-muted-foreground ml-0.5"
                >
                  Description
                </label>
                <Textarea
                  id="base-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. YOLOv10 model optimized for real-time inference on CPU..."
                  className="rounded-xl min-h-[60px] border-border/60"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsAddOpen(false)
                }}
                disabled={createMutation.isPending}
                className="h-10 rounded-xl border-border/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
                className="h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-medium"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Model'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
