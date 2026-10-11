"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Droplets, Users, FileText, Calendar, Plus, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { StatusBadge } from "@/components/common/status-badge"
import { inventoryApi, statsApi, requestsApi, appointmentsApi, donorsApi } from "@/lib/api"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBloodUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    scheduledAppointments: 0,
  })
  const [bloodGroups, setBloodGroups] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsData, inventoryData, requestsData, appointmentsData, donorsData] = await Promise.all([
        statsApi.get(),
        inventoryApi.getAll(),
        requestsApi.getAll(),
        appointmentsApi.getAll(),
        donorsApi.getAll(),
      ])
      setStats(statsData)
      setBloodGroups(inventoryData)
      
      // Build recent activities from real data
      const activities: any[] = []
      
      // Add recent requests
      requestsData.slice(0, 3).forEach((req: any) => {
        activities.push({
          id: `req-${req.id}`,
          activity: "Blood request",
          details: `${req.bloodGroup} - ${req.units} units`,
          time: "Recently",
          type: "request",
          status: req.status
        })
      })
      
      // Add recent appointments
      appointmentsData.slice(0, 3).forEach((apt: any) => {
        activities.push({
          id: `apt-${apt.id}`,
          activity: "Appointment scheduled",
          details: `${apt.donorName || 'Unknown'} - ${apt.date}`,
          time: "Recently",
          type: "appointment",
          status: apt.status
        })
      })
      
      // Add recent donors
      donorsData.slice(-3).reverse().forEach((donor: any) => {
        activities.push({
          id: `donor-${donor.id}`,
          activity: "New donor registered",
          details: `${donor.name} (${donor.bloodGroup})`,
          time: "Recently",
          type: "registration"
        })
      })
      
      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { title: "Total Blood Units", value: stats.totalBloodUnits || 0, icon: Droplets, color: "text-[#D32F2F]", description: "Available in inventory" },
    { title: "Registered Donors", value: stats.totalDonors || 0, icon: Users, color: "text-[#1976D2]", description: "Active donors" },
    { title: "Pending Requests", value: stats.pendingRequests || 0, icon: FileText, color: "text-yellow-600", description: "Awaiting approval" },
    { title: "Scheduled Appointments", value: stats.scheduledAppointments || 0, icon: Calendar, color: "text-green-600", description: "Upcoming donations" },
  ]

  const monthlyDonations = [
    { month: "Jan", donations: 45 },
    { month: "Feb", donations: 52 },
    { month: "Mar", donations: 48 },
    { month: "Apr", donations: 61 },
    { month: "May", donations: 55 },
    { month: "Jun", donations: 67 },
  ]

  const quickActions = [
    { title: "Add Donor", description: "Register new blood donor", icon: Users, action: () => router.push('/donors'), color: "bg-[#1976D2]" },
    { title: "Schedule Appointment", description: "Book donation appointment", icon: Calendar, action: () => router.push('/appointments'), color: "bg-[#D32F2F]" },
    { title: "Manage Inventory", description: "Update blood stock levels", icon: Droplets, action: () => router.push('/inventory'), color: "bg-green-600" },
    { title: "View Requests", description: "Handle blood requests", icon: FileText, action: () => router.push('/requests'), color: "bg-purple-600" },
  ]
  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s an overview of your blood bank.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-8">Loading...</div>
          ) : (
            statsCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.title}
                    onClick={action.action}
                    className={`${action.color} hover:opacity-90 h-auto py-4 flex flex-col items-center gap-2`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Group Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Group Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloodGroups.map((bg) => (
                    <TableRow key={bg.id || bg.bloodGroup}>
                      <TableCell className="font-medium">{bg.bloodGroup}</TableCell>
                      <TableCell>{bg.units}</TableCell>
                      <TableCell>
                        <StatusBadge status={bg.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Monthly Donations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyDonations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donations" fill="#D32F2F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const getIcon = () => {
                    switch (activity.type) {
                      case 'request': return <FileText className="w-4 h-4 text-yellow-600" />
                      case 'appointment': return <Calendar className="w-4 h-4 text-green-600" />
                      case 'registration': return <Users className="w-4 h-4 text-blue-600" />
                      default: return <Clock className="w-4 h-4 text-gray-400" />
                    }
                  }
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{activity.activity}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                        {activity.status && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
