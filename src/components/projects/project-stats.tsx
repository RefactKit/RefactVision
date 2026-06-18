'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ExtensionData {
  extension: string
  count: number
}

interface DimensionGroup {
  name: string
  width: number
  height: number
}

interface SizeGroup {
  name: string
  value: number
}

interface ProjectStatsData {
  totalFiles: number
  meanSize: number
  sizeGroups: SizeGroup[]
  dimensionsData: DimensionGroup[]
  meanWidth: number
  meanHeight: number
  extensionsData?: ExtensionData[]
}

export function ProjectStats({ stats }: { stats: ProjectStatsData }) {
  if (!stats) return null

  // Hex colors matching other UI cards (emerald, sky, violet, amber, pink)
  const colors = [
    '#10b981', // Emerald (matches Dimensions Width)
    '#0ea5e9', // Sky (matches Dimensions Height)
    '#8b5cf6', // Violet (matches File Size)
    '#f59e0b', // Amber
    '#ec4899', // Pink
  ]

  // Build data and config for file formats pie chart
  const chartData =
    stats.extensionsData?.map((item, index) => ({
      extension: item.extension,
      count: item.count,
      fill: colors[index % colors.length],
    })) || []

  const chartConfig = {
    count: {
      label: 'Files',
    },
    ...(stats.extensionsData || []).reduce((acc: ChartConfig, item, index) => {
      acc[item.extension] = {
        label: `.${item.extension}`,
        color: colors[index % colors.length],
      }
      return acc
    }, {}),
  } satisfies ChartConfig

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Dimensions Chart */}
      <Card className="w-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Image Dimensions</CardTitle>
          <CardDescription>
            Width and height distribution in pixels
            <br />
            {stats.totalFiles} images · Mean W: {stats.meanWidth} px · Mean H: {stats.meanHeight} px
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.dimensionsData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
                <Tooltip />
                <Bar dataKey="width" fill="#10b981" radius={[4, 4, 0, 0]} name="Width" />
                <Bar dataKey="height" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Height" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* File Size Chart */}
      <Card className="w-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Image File Size</CardTitle>
          <CardDescription>
            File size distribution
            <br />
            {stats.totalFiles} images · Mean: {(stats.meanSize / 1024).toFixed(1)} KB
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sizeGroups} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Images" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* File Extension (Pie Chart) */}
      <Card className="w-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle>File Formats</CardTitle>
          <CardDescription>
            Distribution of file extensions
            <br />
            {stats.totalFiles} files in total
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center min-h-[256px]">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[280px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="extension"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.extension} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="extension" />}
                className="-translate-y-2 flex-wrap gap-2"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
