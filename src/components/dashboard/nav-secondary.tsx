import { useMatchRoute, useNavigate } from '@tanstack/react-router'
import type React from 'react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface NavSecondaryItem {
  title: string
  url: string
  icon: React.ElementType
  isExternal?: boolean
}

export function NavSecondary({
  items,
  ...props
}: {
  items: NavSecondaryItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = !!matchRoute({ to: item.url, fuzzy: true })

            return (
              <SidebarMenuItem key={item.title}>
                {item.isExternal ? (
                  <SidebarMenuButton
                    isActive={isActive}
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    isActive={isActive}
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => navigate({ to: item.url })}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
