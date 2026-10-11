"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { inventoryApi, requestsApi, donorsApi, statsApi } from "@/lib/api"
import { toast } from "sonner"
import { Printer } from "lucide-react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const bloodGroupColors: Record<string, string> = {
  "A+": "#D32F2F",
  "A-": "#1976D2",
  "B+": "#388E3C",
  "B-": "#FFA000",
  "AB+": "#7B1FA2",
  "AB-": "#E64A19",
  "O+": "#0097A7",
  "O-": "#5D4037",
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [donors, setDonors] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const [inventoryData, requestsData, donorsData, statsData] = await Promise.all([
        inventoryApi.getAll(),
        requestsApi.getAll(),
        donorsApi.getAll(),
        statsApi.get(),
      ])
      setInventory(inventoryData)
      setRequests(requestsData)
      setDonors(donorsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  // Process inventory data for blood stock chart
  const bloodStockData = inventory.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.bloodGroup)
    if (existing) {
      existing.value += item.units
    } else {
      acc.push({
        name: item.bloodGroup,
        value: item.units,
        color: bloodGroupColors[item.bloodGroup] || "#8884d8",
      })
    }
    return acc
  }, [])

  // Process requests data for approval trends
  const requestTrends = requests.reduce((acc: any[], request) => {
    const dateValue = request.createdAt || request.requestDate
    if (!dateValue) return acc
    const month = new Date(dateValue).toLocaleString('default', { month: 'short' })
    const existing = acc.find((x) => x.month === month)
    if (existing) {
      if (request.status === 'Approved') existing.approved++
      if (request.status === 'Rejected') existing.rejected++
    } else {
      acc.push({
        month,
        approved: request.status === 'Approved' ? 1 : 0,
        rejected: request.status === 'Rejected' ? 1 : 0,
      })
    }
    return acc
  }, [])

  // Calculate summary statistics
  const totalDonations = donors.length
  const totalRequests = requests.length
  const approvedRequests = requests.filter((r) => r.status === 'Approved').length
  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Loading reports...</div>
      </MainLayout>
    )
  }
  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Analytics and statistics overview</p>
          </div>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Stock Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Stock Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {bloodStockData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bloodStockData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bloodStockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">No blood stock data available</div>
              )}
            </CardContent>
          </Card>

          {/* Request Approval Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Request Approval Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {requestTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="approved" stroke="#388E3C" strokeWidth={2} name="Approved" />
                    <Line type="monotone" dataKey="rejected" stroke="#D32F2F" strokeWidth={2} name="Rejected" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">No request data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalDonations}</div>
              <p className="text-sm text-gray-500 mt-1">Registered donors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalRequests}</div>
              <p className="text-sm text-gray-500 mt-1">Blood requests received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{approvalRate}%</div>
              <p className="text-sm text-gray-500 mt-1">{approvedRequests} approved / {totalRequests} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Blood Group Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Group Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodStockData.map((group) => (
                <div key={group.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: group.color }}>{group.name}</div>
                  <div className="text-lg font-semibold text-gray-900 mt-2">{group.value} units</div>
                  <div className="text-sm text-gray-500">
                    {bloodStockData.length > 0 ? Math.round((group.value / bloodStockData.reduce((sum, g) => sum + g.value, 0)) * 100) : 0}% of total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
