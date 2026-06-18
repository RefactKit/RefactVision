'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Cpu,
  Image as ImageIcon,
  Keyboard,
  Pencil,
  Plus,
  Search,
  Shapes,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getFileCategoryIds } from '@/lib/utils'
import { createCategory, deleteCategory, updateCategory } from '@/server/project-fns'

const colorsPalette = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-teal-500',
]

interface Category {
  id: string
  name: string
}

interface ProjectFile {
  categoryId: string | null
  metadata?: string | null
}

interface ClassesTableProps {
  projectId: string
  categories: Category[]
  files: ProjectFile[]
}

export function ClassesTable({ projectId, categories, files }: ClassesTableProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  // Inline edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // New class inline state
  const [newClassName, setNewClassName] = useState('')

  // Mutations
  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory({ data: { projectId, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Class added successfully')
      setNewClassName('')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to add class')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory({ data: { id, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Class updated successfully')
      setEditingCategoryId(null)
      setEditingName('')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to update class')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Class deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to delete class')
    },
  })

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newClassName.trim()
    if (!name) return

    // Prevent duplicate check
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A class with this name already exists')
      return
    }

    createMutation.mutate(name)
  }

  const handleStartEdit = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setEditingName(cat.name)
  }

  const handleSaveEdit = (cat: Category) => {
    const name = editingName.trim()
    if (!name) return
    if (name === cat.name) {
      setEditingCategoryId(null)
      return
    }

    // Prevent duplicate check
    if (categories.some((c) => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A class with this name already exists')
      return
    }

    updateMutation.mutate({ id: cat.id, name })
  }

  const handleDeleteClass = (cat: Category) => {
    const fileCount = files.filter((f) => getFileCategoryIds(f).includes(cat.id)).length
    const warningMsg =
      fileCount > 0
        ? `Class "${cat.name}" has ${fileCount} annotated images. Deleting it will unlabel these files. Are you sure you want to proceed?`
        : `Are you sure you want to delete class "${cat.name}"?`

    if (confirm(warningMsg)) {
      deleteMutation.mutate(cat.id)
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalAnnotations = files.filter((f) => getFileCategoryIds(f).length > 0).length
  const totalImages = files.filter((f) => getFileCategoryIds(f).length > 0).length

  return (
    <div className="w-full flex flex-col gap-4 bg-background border border-border/40 shadow-sm rounded-2xl overflow-hidden p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Cpu className="size-5 text-primary" />
            Classes
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} classes · {totalAnnotations} annotations
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-10 border-border/60 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden mt-2 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">Index</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Annotations</TableHead>
              <TableHead className="text-right">Images</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((cat, index) => {
              const fileCount = files.filter((f) => getFileCategoryIds(f).includes(cat.id)).length
              const colorClass = colorsPalette[index % colorsPalette.length]
              const isEditing = editingCategoryId === cat.id

              return (
                <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className={cn('size-3.5 rounded-full shrink-0 shadow-sm', colorClass)} />
                      {index}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <div className="flex items-center gap-2 max-w-sm">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cat)
                            if (e.key === 'Escape') setEditingCategoryId(null)
                          }}
                          className="h-8 rounded-lg text-sm border-primary/50 focus:border-primary/80"
                          autoFocus
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleSaveEdit(cat)}
                          className="text-emerald-500 hover:bg-emerald-500/10 shrink-0"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setEditingCategoryId(null)}
                          className="text-muted-foreground hover:bg-muted shrink-0"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-foreground">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => handleStartEdit(cat)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => handleDeleteClass(cat)}
                            className="text-destructive hover:bg-destructive/10"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === cat.id ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md w-fit ml-auto border border-border/20">
                      <Shapes className="size-3.5" />
                      {fileCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md w-fit ml-auto border border-border/20">
                      <ImageIcon className="size-3.5" />
                      {fileCount}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Quick Add Row (Dashed/Input Style) */}
            <TableRow className="border-t border-dashed bg-muted/5">
              <TableCell className="font-medium text-muted-foreground/60">
                <div className="flex items-center gap-3">
                  <div className="size-3.5 rounded-full shrink-0 border border-dashed border-muted-foreground/30 bg-muted/20" />
                  +
                </div>
              </TableCell>
              <TableCell colSpan={3}>
                <form onSubmit={handleAddClass} className="flex items-center gap-2">
                  <Input
                    placeholder="Type to add a new class (press Enter)..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    disabled={createMutation.isPending}
                    className="h-9 rounded-xl border-dashed border-border bg-transparent hover:border-primary/40 focus:border-primary/50 focus:bg-background transition-colors text-sm pl-3 shadow-none w-full max-w-md"
                  />
                  {newClassName.trim() && (
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      size="sm"
                      className="h-8 rounded-xl bg-primary text-primary-foreground text-xs gap-1 py-1"
                    >
                      {createMutation.isPending ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          Add
                        </>
                      )}
                    </Button>
                  )}
                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/60 ml-2">
                    <Keyboard className="size-3" />
                    <span>Enter to save</span>
                  </div>
                </form>
              </TableCell>
            </TableRow>

            {/* Total Row */}
            {filteredCategories.length > 0 && (
              <TableRow className="bg-muted/10 font-medium hover:bg-muted/10">
                <TableCell colSpan={2} className="text-muted-foreground text-center">
                  Total
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-foreground bg-muted/40 px-2 py-1 rounded-md w-fit ml-auto border border-border/30">
                    <Shapes className="size-3.5" />
                    {totalAnnotations}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-foreground bg-muted/40 px-2 py-1 rounded-md w-fit ml-auto border border-border/30">
                    <ImageIcon className="size-3.5" />
                    {totalImages}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredCategories.length === 0 && (
        <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border/40 rounded-xl mt-4 bg-muted/10">
          No classes found matching your search.
        </div>
      )}
    </div>
  )
}
