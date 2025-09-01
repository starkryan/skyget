"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getCookie } from "@/utils/cookie"
import { Loader2 } from "lucide-react"

interface ActiveOrder {
  id: string
  number: string
  serviceName: string
  dialcode: number
  isused: boolean
  ismultiuse: boolean
  nextsms: boolean
  messageCount: number
  keywords: string[]
  formate: string
  createdAt: string
  updatedAt: string
}

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState<ActiveOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true) // 🔹 loading state
  const perPage = 10
  const token = getCookie("token")

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true) // start loading
        const res = await fetch("/api/overview/active-orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const data: ActiveOrder[] = await res.json()
        setOrders(data)
      } catch (err) {
        console.error("Error fetching active orders:", err)
      } finally {
        setLoading(false) // stop loading
      }
    }
    fetchOrders()
  }, [])

  const totalPages = Math.ceil(orders.length / perPage)
  const paginatedOrders = orders.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Active Orders</h1>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Orders Table</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          {loading ? (
            // 🔹 Loading animation
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Loading orders...</span>
            </div>
          ) : (
            <>
              <Table className="min-w-[700px] md:min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Dial Code</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Multi-use</TableHead>
                    <TableHead>Next SMS</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>{order.number}</TableCell>
                      <TableCell>{order.serviceName}</TableCell>
                      <TableCell>{order.dialcode}</TableCell>
                      <TableCell>{order.isused ? "Yes" : "No"}</TableCell>
                      <TableCell>{order.ismultiuse ? "Yes" : "No"}</TableCell>
                      <TableCell>{order.nextsms ? "Yes" : "No"}</TableCell>
                      <TableCell>{order.messageCount}</TableCell>
                      <TableCell>{order.keywords.join(", ")}</TableCell>
                      <TableCell>{order.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-4">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
