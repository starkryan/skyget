"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LabelList,
  Cell,
} from "recharts"
import { getCookie } from "@/utils/cookie"

interface TodayChartData {
  hour: number
  totalSuccessOrders: number
  totalUnsuccessOrders: number
}

export function TodaySuccessChart() {
  const [chartData, setChartData] = useState<TodayChartData[]>([])
  const [successRate, setSuccessRate] = useState(0)
  const [peakHour, setPeakHour] = useState<number | null>(null)
  const token = getCookie("token")
  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch("/api/overview/today",{
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        })
        const data: TodayChartData[] = await res.json()

        const fullData: TodayChartData[] = Array.from({ length: 24 }, (_, i) => {
          const item = data.find(d => d.hour === i)
          return item || { hour: i, totalSuccessOrders: 0, totalUnsuccessOrders: 0 }
        })

        const totalOrdersPerHour = fullData.map(d => ({
          ...d,
          total: d.totalSuccessOrders + d.totalUnsuccessOrders
        }))

        const maxOrders = Math.max(...totalOrdersPerHour.map(d => d.total))
        const peak = totalOrdersPerHour.find(d => d.total === maxOrders)?.hour ?? null

        const totalSuccess = fullData.reduce((acc, d) => acc + d.totalSuccessOrders, 0)
        const totalOrders = fullData.reduce((acc, d) => acc + d.totalSuccessOrders + d.totalUnsuccessOrders, 0)
        const rate = totalOrders > 0 ? Math.round((totalSuccess / totalOrders) * 100) : 0

        setChartData(fullData)
        setSuccessRate(rate)
        setPeakHour(peak)
      } catch (err) {
        console.error(err)
      }
    }
    fetchChartData()
  }, [])

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Today’s Orders (Hourly)</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 py-2">
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSuccessOrders" name="Success Orders" fill="#4ade80">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`success-${index}`}
                    fill={entry.hour === peakHour ? "#facc15" : "#4ade80"}
                  />
                ))}
                <LabelList dataKey="totalSuccessOrders" position="top" />
              </Bar>
              <Bar dataKey="totalUnsuccessOrders" name="Failed Orders" fill="#f87171">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`fail-${index}`}
                    fill={entry.hour === peakHour ? "#fcd34d" : "#f87171"}
                  />
                ))}
                <LabelList dataKey="totalUnsuccessOrders" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary text */}
        <div className="mt-3 text-center text-lg font-medium text-gray-700 dark:text-gray-200">
          Today’s Success Rate: <span className="text-green-500">{successRate}%</span>
        </div>
        {peakHour !== null && (
          <div className="mt-1 text-center text-sm text-yellow-600 font-semibold">
            Peak Orders Hour: {peakHour}:00 - {peakHour + 1}:00
          </div>
        )}
        <p className="mt-1 text-center text-sm text-gray-500">
          Peak buying hour is highlighted in yellow.
        </p>
      </CardContent>
    </Card>
  )
}
