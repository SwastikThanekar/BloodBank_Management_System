"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { StatusBadge } from "@/components/common/status-badge"
import { appointmentsApi } from "@/lib/api"
import { donorsApi } from "@/lib/api"
import { toast } from "sonner"
import { formatDate, formatTime } from "@/lib/utils"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [formData, setFormData] = useState({
    donor: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    fetchAppointments()
    fetchDonors()
  }, [])

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsApi.getAll()
      setAppointments(data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast.error('Failed to load appointments data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDonors = async () => {
    try {
      const data = await donorsApi.getAll()
      setDonors(data)
    } catch (error) {
      console.error('Failed to fetch donors:', error)
      toast.error('Failed to load donors data')
    }
  }

  const handleAdd = () => {
    setFormData({ donor: "", date: "", time: "" })
    setIsAddModalOpen(true)
  }

  const handleInputChange = (field: "donor" | "date" | "time", value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment)
    setFormData({
      donor: appointment.donorName || '',
      date: appointment.appointmentDate || appointment.date,
      time: appointment.appointmentTime || appointment.time,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await appointmentsApi.delete(selectedAppointment.id)
        await fetchAppointments()
        setIsDeleteDialogOpen(false)
        setSelectedAppointment(null)
        toast.success('Appointment deleted successfully')
      } catch (error) {
        console.error('Failed to delete appointment:', error)
        toast.error('Failed to delete appointment')
      }
    }
  }

  const handleSaveAdd = async () => {
    if (!formData.donor || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await appointmentsApi.create({
        donorName: formData.donor,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
      })
      await fetchAppointments()
      setIsAddModalOpen(false)
      toast.success('Appointment scheduled successfully')
    } catch (error) {
      console.error('Failed to add appointment:', error)
      toast.error('Failed to schedule appointment. Please ensure the donor exists in the system.')
    }
  }

  const handleSaveEdit = async () => {
    if (!formData.donor || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    if (selectedAppointment) {
      try {
        // Find the donorId from donorName
        const donor = donors.find((d) => d.name === formData.donor)
        
        await appointmentsApi.update(selectedAppointment.id, {
          donorId: donor ? donor.id : selectedAppointment.donorId,
          date: formData.date,
          time: formData.time,
        })
        await fetchAppointments()
        setIsEditModalOpen(false)
        setSelectedAppointment(null)
        toast.success('Appointment updated successfully')
      } catch (error) {
        console.error('Failed to update appointment:', error)
        toast.error('Failed to update appointment')
      }
    }
  }

  const scheduledAppointments = appointments.filter((a) => a.status === "Scheduled")
  const pastAppointments = appointments.filter((a) => a.status !== "Scheduled")

  return (
    <ProtectedRoute requiredRole={["admin", "staff"]}>
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage donation appointments</p>
          </div>
          <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]" disabled={donors.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            {donors.length === 0 ? "Add Donors First" : "Schedule Appointment"}
          </Button>
        </div>

        {/* Scheduled Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : appointments.filter(a => a.status === "Scheduled").length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No scheduled appointments</h3>
                <p className="text-gray-500 mb-4">
                  {donors.length === 0 ? "Add donors first to schedule appointments." : "Schedule appointments to get started."}
                </p>
                {donors.length > 0 && (
                  <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.filter(a => a.status === "Scheduled").map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.donorName || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(appointment.appointmentDate || appointment.date)}</TableCell>
                      <TableCell>{formatTime(appointment.appointmentTime || appointment.time)}</TableCell>
                      <TableCell><StatusBadge status={appointment.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(appointment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(appointment)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : appointments.filter(a => a.status !== "Scheduled").length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No past appointments</h3>
                <p className="text-gray-500">Completed and cancelled appointments will appear here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.filter(a => a.status !== "Scheduled").map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.donorName || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(appointment.appointmentDate || appointment.date)}</TableCell>
                      <TableCell>{formatTime(appointment.appointmentTime || appointment.time)}</TableCell>
                      <TableCell><StatusBadge status={appointment.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(appointment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donor">Select Donor</Label>
                <select
                  id="donor"
                  value={formData.donor}
                  onChange={(e) => handleInputChange("donor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">Select a donor</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.name}>
                      {donor.name} ({donor.bloodGroup})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Schedule
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDonor">Select Donor</Label>
                <select
                  id="editDonor"
                  value={formData.donor}
                  onChange={(e) => handleInputChange("donor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">Select a donor</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.name}>
                      {donor.name} ({donor.bloodGroup})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTime">Time</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Save Changes
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Appointment"
          description="Are you sure you want to delete this appointment? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
