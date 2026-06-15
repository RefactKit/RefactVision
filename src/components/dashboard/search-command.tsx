import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Building2Icon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useI18n } from '@/i18n/context'

interface SearchCommandProps {
  orgs: { id: string; name: string; slug: string }[]
}

export function SearchCommand({ orgs }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false)
  const { t, dir } = useI18n()
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { slug?: string }
  const slug = params.slug ?? orgs[0]?.slug

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 sm:w-64 p-0 sm:px-4 justify-center sm:justify-start rounded-full bg-transparent sm:bg-white dark:sm:bg-muted/50 hover:bg-muted border-transparent sm:border-border text-sm font-normal text-muted-foreground shadow-none sm:pr-12 transition-colors"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-[18px] sm:size-4 sm:mr-2" />
        <span className="hidden sm:inline-flex">{t.common.search}...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded-full border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command dir={dir} className="h-full w-full bg-transparent">
          <CommandInput placeholder={`${t.common.search}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={t.orgsPage.title}>
              <CommandItem
                value="organizations-list"
                onSelect={() =>
                  runCommand(() =>
                    navigate({
                      to: '/organizations',
                    }),
                  )
                }
              >
                <Building2Icon className="mr-2 size-4" />
                <span>{t.orgsPage.title}</span>
              </CommandItem>
            </CommandGroup>

            {slug && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t.sidebar.workspace}>
                  <CommandItem
                    value="dashboard"
                    onSelect={() =>
                      runCommand(() =>
                        navigate({
                          to: '/organizations/$slug/dashboard',
                          params: { slug },
                          search: { page: 1 },
                        }),
                      )
                    }
                  >
                    <LayoutDashboardIcon className="mr-2 size-4" />
                    <span>{t.sidebar.dashboard}</span>
                  </CommandItem>
                  <CommandItem
                    value="members"
                    onSelect={() =>
                      runCommand(() =>
                        navigate({
                          to: '/organizations/$slug/members',
                          params: { slug },
                        }),
                      )
                    }
                  >
                    <UsersIcon className="mr-2 size-4" />
                    <span>{t.sidebar.team}</span>
                  </CommandItem>
                  <CommandItem
                    value="settings"
                    onSelect={() =>
                      runCommand(() =>
                        navigate({
                          to: '/organizations/$slug/settings',
                          params: { slug },
                        }),
                      )
                    }
                  >
                    <SettingsIcon className="mr-2 size-4" />
                    <span>{t.sidebar.workspaceSettings}</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            <CommandSeparator />
            <CommandGroup heading={t.sidebar.organizationsLabel}>
              {orgs.map((org) => (
                <CommandItem
                  key={org.id}
                  value={`org-${org.slug}`}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({
                        to: '/organizations/$slug/dashboard',
                        params: { slug: org.slug },
                        search: { page: 1 },
                      }),
                    )
                  }
                >
                  <Building2Icon className="mr-2 size-4" />
                  <span>{org.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
