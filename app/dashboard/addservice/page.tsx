"use client"

import { useState, useEffect, useRef } from "react"
import { getCookie } from "@/utils/cookie"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function AddServiceForm() {
  const [smsFormats, setSmsFormats] = useState<string[]>([""]) 
  const [showReplaceButtons, setShowReplaceButtons] = useState<boolean[]>([false]) 
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [multisms, setMultisms] = useState(true)

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, index: number) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const newFormats = [...smsFormats]
    newFormats[index] = pastedText
    setSmsFormats(newFormats)

    const newShow = [...showReplaceButtons]
    newShow[index] = true
    setShowReplaceButtons(newShow)
  }

  const handleReplace = (index: number) => {
    let replacedText = smsFormats[index]
    const otpKeywords = ["otp", "code", "password", "pass", "pin", "verification"]
    const otpRegex = new RegExp(`(${otpKeywords.join("|")})[^\\d]{0,10}(\\d{4,8})`, "i")
    const match = replacedText.match(otpRegex)

    if (match) {
      const otpValue = match[2]
      const otpNumberRegex = new RegExp(`\\b${otpValue}\\b`)
      replacedText = replacedText.replace(otpNumberRegex, "{otp}")
    } else {
      replacedText = replacedText.replace(/\b\d{4,8}\b/, "{otp}")
    }

    const newFormats = [...smsFormats]
    newFormats[index] = replacedText
    setSmsFormats(newFormats)

    const newShow = [...showReplaceButtons]
    newShow[index] = false
    setShowReplaceButtons(newShow)
  }

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
      code: form.code.value,
      formate: smsFormats,
      image: form.imageUrl.value,
      multisms: multisms,
      maxmessage: form.maxmessage.value
    }

    try {
      const res = await fetch("/api/services/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const result = await res.json()
      if (result.success) {
        setToast({ message: "Service created successfully.", type: "success" })
        form.reset()
        setSmsFormats([""])
        setShowReplaceButtons([false])
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

  const addFormat = () => {
    setSmsFormats([...smsFormats, ""])
    setShowReplaceButtons([...showReplaceButtons, false])
  }

  const removeFormat = (index: number) => {
    const newFormats = smsFormats.filter((_, i) => i !== index)
    const newShow = showReplaceButtons.filter((_, i) => i !== index)
    setSmsFormats(newFormats)
    setShowReplaceButtons(newShow)
  }

  const insertPlaceholder = (index: number, placeholder: string) => {
    const textarea = textareaRefs.current[index]
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = smsFormats[index]

    const newValue = value.substring(0, start) + placeholder + value.substring(end)
    const newFormats = [...smsFormats]
    newFormats[index] = newValue
    setSmsFormats(newFormats)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length
    }, 0)
  }

  const placeholders = ["{otp}", "{random}", "{date}", "{time}"]

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Add Service</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" placeholder="e.g., Telegram" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.png"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Service Code</Label>
              <Input id="code" name="code" placeholder="e.g., wiz" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxmessage">Max Message</Label>
              <Input id="maxmessage" name="maxmessage" placeholder="0 for unlimited" type="number" required />
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="multisms">Multisms</Label>
              <Switch id="multisms" checked={multisms} onCheckedChange={setMultisms} />
            </div>

            <div className="grid gap-4">
              <Label>SMS Formats</Label>
              {smsFormats.map((format, index) => (
                <div key={index} className="relative border p-3 rounded-lg">
                  <Textarea
                    ref={(el) => (textareaRefs.current[index] = el)}
                    value={format}
                    onChange={(e) => {
                      const newFormats = [...smsFormats]
                      newFormats[index] = e.target.value
                      setSmsFormats(newFormats)
                    }}
                    onPaste={(e) => handlePaste(e, index)}
                    placeholder={`Paste SMS format #${index + 1} here...`}
                    className="min-h-[120px] mb-2"
                    required
                  />
                  {showReplaceButtons[index] && (
                    <button
                      type="button"
                      onClick={() => handleReplace(index)}
                      className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Auto-replace OTP With <code>{'{otp}'}</code>
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {placeholders.map((ph) => (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => insertPlaceholder(index, ph)}
                        className="text-xs rounded bg-blue-600 px-2 py-1 "
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                  {smsFormats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFormat(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addFormat} variant="outline">
                + Add Another Format
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Create Service"}
            </Button>
          </CardFooter>
        </Card>
      </form>

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
