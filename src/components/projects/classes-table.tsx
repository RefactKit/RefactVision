'use client'

import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getFileCategoryIds } from '@/lib/utils'
import { Image as ImageIcon, Search, Shapes } from 'lucide-react'
import { useState } from 'react'

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

export function ClassesTable({
  categories,
  files,
}: {
  categories: Category[]
  files: ProjectFile[]
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalAnnotations = files.filter((f) => getFileCategoryIds(f).length > 0).length
  const totalImages = files.filter((f) => getFileCategoryIds(f).length > 0).length

  return (
    <div className="w-full flex flex-col gap-4 bg-background border border-border/40 shadow-sm rounded-2xl overflow-hidden p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Classes</h3>
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

              return (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className={cn('size-3.5 rounded-full shrink-0 shadow-sm', colorClass)} />
                      {index}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
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
