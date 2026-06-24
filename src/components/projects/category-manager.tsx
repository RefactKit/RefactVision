import { Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  parentId?: string | null
  subcategories?: Category[]
}

interface CategoryManagerProps {
  categories: Category[]
  onCreateCategory: (name: string, parentId?: string) => void
  onDeleteCategory: (id: string) => void
  onSelectCategory: (id: string | null) => void
  selectedCategoryId: string | null
}

export function CategoryManager({
  categories,
  onCreateCategory,
  onDeleteCategory,
  onSelectCategory,
  selectedCategoryId,
}: CategoryManagerProps) {
  const { t } = useI18n()
  const [newCatName, setNewCatName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleCreate = () => {
    if (newCatName.trim()) {
      onCreateCategory(newCatName)
      setNewCatName('')
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-md border-r border-border/40 p-4 w-72">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Tag className="size-4" />
          {t.projects.studio.classes}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
          <Input
            placeholder="Class name..."
            className="h-9 rounded-lg"
            autoFocus
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 rounded-lg" onClick={handleCreate}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 rounded-lg"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
            selectedCategoryId === null
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'hover:bg-muted/50 text-foreground/70',
          )}
          onClick={() => onSelectCategory(null)}
        >
          <div
            className={cn(
              'size-2 rounded-full',
              selectedCategoryId === null ? 'bg-primary-foreground' : 'bg-muted-foreground/40',
            )}
          />
          {t.projects.studio.unlabeled}
        </button>

        {categories.map((cat) => (
          <div key={cat.id} className="group relative">
            <button
              type="button"
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                selectedCategoryId === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'hover:bg-muted/50 text-foreground/70',
              )}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className={cn(
                    'size-2 rounded-full',
                    selectedCategoryId === cat.id ? 'bg-primary-foreground' : 'bg-primary/40',
                  )}
                />
                <span className="truncate">{cat.name}</span>
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteCategory(cat.id)
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button className="w-full rounded-xl gap-2 h-11 font-semibold" variant="outline">
          {t.projects.studio.syncRoboflow}
        </Button>
      </div>
    </div>
  )
}
