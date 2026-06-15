import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { galleryQuery } from '@/server/query-keys'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/gallery')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search?.page ?? 1),
    }
  },
  component: GalleryPage,
})

function GalleryPage() {
  const { t } = useI18n()
  const { org } = OrgRoute.useLoaderData()
  const { page } = Route.useSearch()
  const queryClient = useQueryClient()

  const { data: gallery, isLoading } = useQuery(galleryQuery(org.id, page))

  // Prefetching for instant transitions
  const prefetchPage = (p: number) => {
    queryClient.prefetchQuery(galleryQuery(org.id, p))
  }

  // TanStack Table Integration
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'url', header: 'URL' },
      { accessorKey: 'name', header: 'Name' },
    ],
    [],
  )

  const table = useReactTable({
    data: gallery?.images || [],
    columns,
    pageCount: gallery?.totalPages || 0,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: 10,
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Helper for pagination numbers
  const getPageNumbers = () => {
    const totalPages = table.getPageCount()
    const current = page
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    if (current <= 3) {
      pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
    } else if (current >= totalPages - 2) {
      pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.gallery.title}</h1>
        <p className="text-muted-foreground mt-2">{t.gallery.subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col gap-6 rounded-xl border border-dashed border-border min-h-[400px] p-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex flex-col gap-2 rounded-md overflow-hidden border">
                <Skeleton className="w-full h-32" />
                <div className="px-2 pb-2 mt-1">
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {table.getRowModel().rows.map((row) => {
                const img = row.original
                return (
                  <div
                    key={img.id}
                    className="flex flex-col gap-2 rounded-md overflow-hidden border bg-background"
                  >
                    <div className="w-full h-32 bg-muted/30">
                      <img src={img.url} alt={img.name} className="w-full h-32 object-cover" />
                    </div>
                    <p className="text-xs truncate px-2 pb-2 font-medium mt-1">{img.name}</p>
                  </div>
                )
              })}
              {(gallery?.images.length || 0) === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                  {t.gallery.noImages}
                </div>
              )}
            </div>

            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  to="."
                  search={{ page: Math.max(1, page - 1) }}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    !table.getCanPreviousPage() && 'pointer-events-none opacity-50',
                  )}
                  onMouseEnter={() => prefetchPage(Math.max(1, page - 1))}
                >
                  <ChevronLeftIcon className="mr-1 h-4 w-4" />
                  {/* Previous can be translated if needed, but keeping it simple for now as per original code */}
                  Previous
                </Link>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((num, idx) =>
                    num === 'ellipsis' ? (
                      <span key={idx} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Link
                        key={idx}
                        to="."
                        search={{ page: num }}
                        className={cn(
                          buttonVariants({
                            variant: page === num ? 'default' : 'ghost',
                            size: 'sm',
                          }),
                          'w-9',
                        )}
                        onMouseEnter={() => prefetchPage(num)}
                      >
                        {num}
                      </Link>
                    ),
                  )}
                </div>

                <Link
                  to="."
                  search={{ page: Math.min(table.getPageCount(), page + 1) }}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    !table.getCanNextPage() && 'pointer-events-none opacity-50',
                  )}
                  onMouseEnter={() => prefetchPage(Math.min(table.getPageCount(), page + 1))}
                >
                  Next
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
