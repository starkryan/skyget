"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCookie } from "@/utils/cookie"

export default function PanelPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔹 Fetch existing URL from API on mount
  useEffect(() => {
    const token = getCookie("token")
    fetch("/api/panel", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.url) setUrl(data.url)
      })
      .catch(() => {})
  }, [])

  // 🔹 Save / Update Panel URL
  const handleSave = async () => {
    setLoading(true)
    try {
      const token = getCookie("token")
      const res = await fetch("/api/panel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        alert(`Error: ${data.error || 'Failed to save URL'}`)
        return
      }
      
      alert(data.message || "Panel URL saved successfully")
    } catch (err) {
      console.error(err)
      alert("Network error: Failed to save URL")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-card shadow-lg rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Panel URL</h1>

        <Input
          type="text"
          placeholder="Enter panel URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save URL"}
        </Button>
      </div>
    </div>
  )
}
