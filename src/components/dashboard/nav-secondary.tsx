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
  icon: any // Changed to any to support both Lucide and Phosphor
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
                <SidebarMenuButton
                  isActive={isActive}
                  render={
                    item.isExternal ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 w-full"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate({ to: item.url })}
                        className="flex items-center gap-2 w-full"
                      />
                    )
                  }
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
