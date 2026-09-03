"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Phone, MapPin, Building2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { hospitalsApi } from "@/lib/api"
import { toast } from "sonner"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const data = await hospitalsApi.getAll()
      setHospitals(data)
    } catch (error) {
      console.error('Failed to fetch hospitals:', error)
      toast.error('Failed to load hospitals data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ name: "", contact: "", address: "" })
    setIsAddModalOpen(true)
  }

  const handleEdit = (hospital: any) => {
    setSelectedHospital(hospital)
    setFormData({
      name: hospital.name,
      contact: hospital.phone,
      address: hospital.address,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (hospital: any) => {
    setSelectedHospital(hospital)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedHospital) {
      try {
        await hospitalsApi.delete(selectedHospital.id)
        await fetchHospitals()
        setIsDeleteDialogOpen(false)
        setSelectedHospital(null)
        toast.success('Hospital deleted successfully')
      } catch (error) {
        console.error('Failed to delete hospital:', error)
        toast.error('Failed to delete hospital')
      }
    }
  }

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.contact || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await hospitalsApi.create({
        name: formData.name,
        phone: formData.contact,
        address: formData.address,
      })
      await fetchHospitals()
      setIsAddModalOpen(false)
      toast.success('Hospital added successfully')
    } catch (error) {
      console.error('Failed to add hospital:', error)
      toast.error('Failed to add hospital')
    }
  }

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.contact || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }
    if (selectedHospital) {
      try {
        await hospitalsApi.update(selectedHospital.id, {
          name: formData.name,
          phone: formData.contact,
          address: formData.address,
        })
        await fetchHospitals()
        setIsEditModalOpen(false)
        setSelectedHospital(null)
        toast.success('Hospital updated successfully')
      } catch (error) {
        console.error('Failed to update hospital:', error)
        toast.error('Failed to update hospital')
      }
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-600 mt-1">Manage partner hospitals</p>
          </div>
          <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
            <Plus className="w-4 h-4 mr-2" />
            Add Hospital
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : hospitals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No hospitals found</h3>
                      <p className="text-gray-500 mb-4">Add hospitals to get started.</p>
                      <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Hospital
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  hospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#D32F2F]" />
                          {hospital.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {hospital.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {hospital.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(hospital)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(hospital)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hospital name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="555-1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter hospital address"
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Add Hospital
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Hospital Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContact">Contact Number</Label>
                <Input
                  id="editContact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
          title="Delete Hospital"
          description="Are you sure you want to delete this hospital? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
