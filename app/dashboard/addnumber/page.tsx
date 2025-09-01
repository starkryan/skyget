"use client"

import { useEffect, useState } from "react"
import { getCookie } from "@/utils/cookie"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function AddNumberForm() {
  const [countries, setCountries] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [loading, setLoading] = useState(false)
  const [multiuse, setMultiuse] = useState(false)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch("/api/countries/all")
        const data = await res.json()
        if (data.success) {
          setCountries(data.countries)
        }
      } catch (error) {
        console.error("Failed to load countries:", error)
      }
    }
    loadCountries()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const token = getCookie("token")

    const gapInHours = Number(form.multigap?.value) || 0
    const gapInSeconds = gapInHours * 3600

    const body = {
      number: Number(form.number.value),
      countryid: form.countryid.value,
      multiuse: multiuse,
      multigap: multiuse ? gapInSeconds : 0,
      active: form.active.checked,
    }

    try {
      const res = await fetch("/api/numbers/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const result = await res.json()
      if (result.success) {
        setToast({ message: "Number added successfully.", type: "success" })
        form.reset()
        setMultiuse(false)
      } else {
        setToast({ message: result.error || "Something went wrong.", type: "error" })
      }
    } catch (error) {
      console.error("Network error:", error)
      setToast({ message: "Network error", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Add Number</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="number">Phone Number Without Dialcode</Label>
              <Input id="number" name="number" type="number" placeholder="Enter phone number" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="countryid">Country</Label>
              <select
                id="countryid"
                name="countryid"
                className="border rounded px-3 py-2"
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="multiuse">Multiuse</Label>
              <Switch id="multiuse" checked={multiuse} onCheckedChange={setMultiuse} />
            </div>

            {multiuse && (
              <div className="grid gap-2">
                <Label htmlFor="multigap">Gap (in hours)</Label>
                <Input
                  id="multigap"
                  name="multigap"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1 for 1 hour"
                  required={multiuse}
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <Label htmlFor="active">Active</Label>
              <Switch id="active" name="active" defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Add Number"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded px-6 py-3 text-white font-semibold shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
