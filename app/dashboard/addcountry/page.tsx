"use client"

import { useState, useEffect } from "react"
import { getCookie } from "@/utils/cookie"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddCountryForm() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const token = getCookie("token")

    const body = {
      name: form.name.value,
      flag: form.flag.value,
      code: form.code.value,
      dial: parseInt(form.dial.value),
      active: form.active.checked,
    }

    try {
      const res = await fetch("/api/countries/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const result = await res.json()
      if (result.success) {
        setToast({ message: "Country added successfully.", type: "success" })
        form.reset()
      } else {
        setToast({ message: result.error || "Something went wrong.", type: "error" })
      }
    } catch (error) {
      console.error(error)
      setToast({ message: "Network error", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Add Country</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Country Name</Label>
              <Input id="name" name="name" placeholder="e.g., India" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="flag">Flag URL</Label>
              <Input
                id="flag"
                name="flag"
                type="url"
                placeholder="https://example.com/flag.png"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Country Code</Label>
              <Input id="code" name="code" placeholder="e.g., 22" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dial">Dial Code</Label>
              <Input id="dial" name="dial" type="number" placeholder="e.g., 91" required />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" name="active" defaultChecked className="scale-125" />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Create Country"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded px-6 py-3 text-white font-semibold shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
