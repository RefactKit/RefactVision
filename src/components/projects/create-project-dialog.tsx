import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/i18n/context'
import { Spinner } from '@/components/ui/spinner'
import { LayoutGrid, Github, Link as LinkIcon, Plus } from 'lucide-react'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description: string
    typeId?: string
    githubUrl?: string
    otherUrl?: string
  }) => void
  isPending?: boolean
  projectTypes?: { id: string; name: string }[]
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  projectTypes = [],
}: CreateProjectDialogProps) {
  const { t, dir, locale } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [typeId, setTypeId] = useState<string>('')
  const [githubUrl, setGithubUrl] = useState('')
  const [otherUrl, setOtherUrl] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setGithubUrl('')
      setOtherUrl('')
      // Only set initial typeId if we have projectTypes
      if (projectTypes.length > 0) {
        setTypeId(projectTypes[0].id)
      } else {
        setTypeId('')
      }
    }
  }, [open]) // Only run when 'open' changes

  // Update typeId if projectTypes load while the dialog is open and no typeId is set
  useEffect(() => {
    if (open && projectTypes.length > 0 && !typeId) {
      setTypeId(projectTypes[0].id)
    }
  }, [open, projectTypes, typeId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
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
        <form onSubmit={handleSubmit} dir={dir} lang={locale}>
          <DialogHeader>
            <DialogTitle className="font-semibold text-2xl tracking-tight flex items-center gap-2">
              <LayoutGrid className="size-6 text-primary" />
              {t.projects.createNew}
            </DialogTitle>
            <DialogDescription>{t.projects.form.configureDesc}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-semibold ml-1">
                {t.projects.form.title}
              </Label>
              <Input
                id="title"
                placeholder={t.projects.form.placeholderTitle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="font-semibold ml-1">
                {t.projects.form.type}
              </Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger id="type" className="h-11 rounded-xl">
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
              <Label htmlFor="description" className="font-semibold ml-1">
                {t.projects.form.description}
              </Label>
              <Textarea
                id="description"
                placeholder={t.projects.form.placeholderDesc}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-xl resize-none p-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="github" className="font-semibold flex items-center gap-2 ml-1">
                  <Github className="size-3.5 text-primary" />
                  {t.projects.form.github}
                </Label>
                <Input
                  id="github"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="other" className="font-semibold flex items-center gap-2 ml-1">
                  <LinkIcon className="size-3.5 text-primary" />
                  {t.projects.form.other}
                </Label>
                <Input
                  id="other"
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
              disabled={isPending || !title.trim()}
              className="rounded-xl h-11 px-6"
            >
              {isPending ? <Spinner className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
              {t.projects.createNew}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
