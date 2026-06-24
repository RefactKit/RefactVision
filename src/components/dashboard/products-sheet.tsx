import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductResult } from '@/server/products-fns'
import { getProductsForDisease } from '@/server/products-fns'
import { useQuery } from '@tanstack/react-query'
import {
  BeakerIcon,
  ClockIcon,
  FlaskConicalIcon,
  LeafIcon,
  PackageIcon,
  ShieldAlertIcon,
  SyringeIcon,
} from 'lucide-react'
import { useState } from 'react'

// Couleurs sémantiques par catégorie
const CATEGORY_VARIANT: Record<string, 'destructive' | 'secondary' | 'outline' | 'default'> = {
  'Fongicide': 'secondary',
  'Insecticide': 'destructive',
  'Herbicide': 'outline',
  'Insecticide-Acaricide': 'destructive',
  'Fongicide-Bactéricide': 'secondary',
  'Régulateur de croissance': 'outline',
  'Attractif': 'outline',
}

const TOXICITY_COLOR: Record<string, string> = {
  'A': 'text-destructive',
  'B': 'text-destructive',
  'C': 'text-muted-foreground',
}

function ProductCard({ product }: { product: ProductResult }) {
  const imageUrl = product.imageUrl
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold truncate">{product.nomFr}</span>
          <span className="text-xs text-muted-foreground font-mono">{product.numeroHomologation}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <Badge variant={CATEGORY_VARIANT[product.categorieFr] ?? 'outline'} className="text-[10px]">
            {product.categorieFr}
          </Badge>
          {product.tableauToxicologique && (
            <Badge variant="outline" className={`text-[10px] ${TOXICITY_COLOR[product.tableauToxicologique] ?? ''}`}>
              <ShieldAlertIcon className="size-2.5 mr-0.5" />
              Tableau {product.tableauToxicologique}
            </Badge>
          )}
        </div>
      </div>

      {/* Matières actives */}
      {product.matieresFr.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <BeakerIcon className="size-3" />
            Matières actives
          </span>
          <div className="flex flex-wrap gap-1">
            {product.matieresFr.map((m) => (
              <Badge key={m} variant="outline" className="text-[10px] font-normal">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Usage */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <SyringeIcon className="size-3" />
            Dose
          </span>
          <span className="text-xs font-medium">{product.usage.dose || '—'}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ClockIcon className="size-3" />
            DAR
          </span>
          <span className="text-xs font-medium">
            {product.usage.dar && product.usage.dar !== '-' ? `${product.usage.dar} j` : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <FlaskConicalIcon className="size-3" />
            Max appli.
          </span>
          <span className="text-xs font-medium">
            {product.usage.max_appli && product.usage.max_appli !== '-' ? product.usage.max_appli : '—'}
          </span>
        </div>
      </div>

      {/* Formulation */}
      <div className="flex items-center gap-1.5">
        <PackageIcon className="size-3 text-muted-foreground shrink-0" />
        <span className="text-[11px] text-muted-foreground truncate">{product.formulationFr}</span>
      </div>
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-border/50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Separator />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ProductsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diseaseName: string
}

const CATEGORY_ORDER = ['Fongicide', 'Fongicide-Bactéricide', 'Insecticide', 'Insecticide-Acaricide', 'Herbicide', 'Attractif', 'Régulateur de croissance']

export function ProductsSheet({ open, onOpenChange, diseaseName }: ProductsSheetProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products-for-disease', diseaseName],
    queryFn: () => getProductsForDisease({ data: { diseaseName } }),
    enabled: open && !!diseaseName,
    staleTime: 1000 * 60 * 10, // 10 min cache
  })

  const products = data?.products ?? []

  // Grouper par catégorie
  const categories = [...new Set(products.map((p) => p.categorieFr))]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))

  const filtered = activeCategory
    ? products.filter((p) => p.categorieFr === activeCategory)
    : products

  // Dédupliquer par numéro d'homologation pour l'affichage
  const seen = new Set<string>()
  const deduplicated = filtered.filter((p) => {
    if (seen.has(p.numeroHomologation)) return false
    seen.add(p.numeroHomologation)
    return true
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LeafIcon className="size-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">Traitements homologués</SheetTitle>
              <SheetDescription className="text-xs">
                {data?.diseaseName ?? diseaseName} — {data?.total ?? '...'} produit(s) homologués
              </SheetDescription>
            </div>
          </div>

          {/* Filtre par catégorie */}
          {categories.length > 1 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Tous ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat} ({products.filter((p) => p.categorieFr === cat).length})
                </button>
              ))}
            </div>
          )}
        </SheetHeader>

        {/* Liste */}
        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="pt-4">
              <ProductsSkeleton />
            </div>
          ) : deduplicated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
              <PackageIcon className="size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                Aucun produit homologué trouvé
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-6">
              {deduplicated.map((product) => (
                <ProductCard key={`${product.id}-${product.usage.organisme_fr}`} product={product} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {!isLoading && deduplicated.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground text-center">
              Source : ONSSA — Homologations produits phytosanitaires Maroc
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}