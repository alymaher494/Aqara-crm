"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

// Theme-aware colors using CSS custom properties
// These provide good contrast and work in both light and dark modes
const CHART_COLORS = [
    "hsl(221, 83%, 53%)",  // Blue (primary-like)
    "hsl(142, 71%, 45%)",  // Green (success)
    "hsl(38, 92%, 50%)",   // Amber (accent)
    "hsl(0, 84%, 60%)",    // Red (destructive)
    "hsl(262, 83%, 58%)",  // Purple
]

interface LeadSourceChartProps {
    data: { name: string; value: number }[]
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="hsl(221, 83%, 53%)"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

interface MonthlyGrowthChartProps {
    data: { name: string; value: number }[]
}

export function MonthlyGrowthChart({ data }: MonthlyGrowthChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))'
                    }}
                />
                <Bar
                    dataKey="value"
                    fill="hsl(221, 83%, 53%)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
