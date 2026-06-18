import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Github, Link as LinkIcon, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n/context'
import { getProjectById, updateProject } from '@/server/project-fns'

interface EditProjectDialogProps {
  projectId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTypes?: { id: string; name: string }[]
}

export function EditProjectDialog({
  projectId,
  open,
  onOpenChange,
  projectTypes = [],
}: EditProjectDialogProps) {
  const { t, dir, locale } = useI18n()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [typeId, setTypeId] = useState<string>('')
  const [githubUrl, setGithubUrl] = useState('')
  const [otherUrl, setOtherUrl] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById({ data: projectId! }),
    enabled: !!projectId && open,
  })

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || '')
      setTypeId(project.typeId || '')
      setGithubUrl(project.githubUrl || '')
      setOtherUrl(project.otherUrl || '')
    }
  }, [project])

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string
      title: string
      description?: string
      typeId?: string
      githubUrl?: string
      otherUrl?: string
    }) => updateProject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t.common?.success || 'Project updated successfully')
      onOpenChange(false)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update project')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return
    updateMutation.mutate({
      id: projectId,
      title: title.trim(),
      description: description.trim(),
      typeId: typeId || undefined,
      githubUrl: githubUrl || undefined,
      otherUrl: otherUrl || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} dir={dir} lang={locale}>
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl tracking-tight flex items-center gap-2">
                <Pencil className="size-6 text-primary" />
                Edit Project
              </DialogTitle>
              <DialogDescription>Update the details of your project.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="font-semibold ml-1">
                  {t.projects.form.title}
                </Label>
                <Input
                  id="edit-title"
                  placeholder={t.projects.form.placeholderTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-type" className="font-semibold ml-1">
                  {t.projects.form.type}
                </Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger id="edit-type" className="h-11 rounded-xl">
                    <SelectValue placeholder={t.projects.form.selectType} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {projectTypes.length > 0 ? (
                      projectTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="rounded-lg">
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="THESE" className="rounded-lg">
                          {t.projects.types.THESE}
                        </SelectItem>
                        <SelectItem value="STAGE" className="rounded-lg">
                          {t.projects.types.STAGE}
                        </SelectItem>
                        <SelectItem value="AUTRE" className="rounded-lg">
                          {t.projects.types.AUTRE}
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="font-semibold ml-1">
                  {t.projects.form.description}
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder={t.projects.form.placeholderDesc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] rounded-xl resize-none p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-github"
                    className="font-semibold flex items-center gap-2 ml-1"
                  >
                    <Github className="size-3.5 text-primary" />
                    {t.projects.form.github}
                  </Label>
                  <Input
                    id="edit-github"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-other"
                    className="font-semibold flex items-center gap-2 ml-1"
                  >
                    <LinkIcon className="size-3.5 text-primary" />
                    {t.projects.form.other}
                  </Label>
                  <Input
                    id="edit-other"
                    placeholder="https://..."
                    value={otherUrl}
                    onChange={(e) => setOtherUrl(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-11 px-6"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !title.trim()}
                className="rounded-xl h-11 px-6"
              >
                {updateMutation.isPending ? (
                  <Spinner className="mr-2 size-4" />
                ) : (
                  <Pencil className="mr-2 size-4" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
