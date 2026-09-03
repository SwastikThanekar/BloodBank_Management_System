"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Form validation
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address")
      toast.error("Please enter a valid email address")
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      toast.success("Login successful")
      router.push("/dashboard")
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (error) setError("")
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#D32F2F] rounded-xl flex items-center justify-center">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Blood Bank Management</CardTitle>
          <CardDescription>Sign in to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@bloodbank.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#D32F2F] hover:bg-[#B71C1C]" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
            {error && (
              <div className="text-sm text-red-600 text-center mt-2">{error}</div>
            )}
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p>Admin: admin@bloodbank.com / admin123</p>
              <p>Hospital: hospital@bloodbank.com / hospital123</p>
              <p>Staff: staff@bloodbank.com / staff123</p>
            </div>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/register" className="text-[#D32F2F] hover:underline">
              Don't have an account? Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
