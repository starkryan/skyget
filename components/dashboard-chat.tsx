"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getCookie } from "@/utils/cookie"

interface ChartData {
  date: string
  totalSuccessOrders: number
  totalUnsuccessOrders: number
  usedNumbers: number
}

export function ActivationActionChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
 const token = getCookie("token")
  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch("/api/overview/chart",{
           headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        })
        const data: ChartData[] = await res.json()
        const mapped = data.map(item => ({
          date: item.date,
          activation: item.totalSuccessOrders,
          action: item.totalUnsuccessOrders,
          cancel: item.usedNumbers,
        }))
        setChartData(mapped)
      } catch (err) {
        console.error("Error fetching chart data:", err)
      }
    }
    fetchChartData()
  }, [])

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Activation & Orders Trends (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 py-2">
        <div style={{ width: "100%", height: 400 }}>
        <ChartContainer
          config={{
            activation: { label: "Success Orders", color: "hsl(var(--chart-1))" },
            action: { label: "Unsuccess Orders", color: "hsl(var(--chart-2))" },
            cancel: { label: "Used Numbers", color: "hsl(var(--chart-3))" },
          }}
        >
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="activation" fill="hsl(var(--chart-1))" name="Success Orders" />
                <Bar dataKey="action" fill="hsl(var(--chart-2))" name="Unsuccess Orders" />
                <Bar dataKey="cancel" fill="hsl(var(--chart-3))" name="Used Numbers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
