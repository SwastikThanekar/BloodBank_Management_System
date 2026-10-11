"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Phone, Mail, Download, History } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { donorsApi } from "@/lib/api"
import { toast } from "sonner"
import { exportToCSV, formatDate } from "@/lib/utils"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function DonorsPage() {
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    contact: "",
    email: "",
    lastDonation: "",
  })

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      const data = await donorsApi.getAll()
      setDonors(data)
    } catch (error) {
      console.error('Failed to fetch donors:', error)
      toast.error('Failed to load donors data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ name: "", bloodGroup: "", contact: "", email: "", lastDonation: "" })
    setIsAddModalOpen(true)
  }

  const handleExport = () => {
    const success = exportToCSV(
      donors,
      'donors',
      ['name', 'bloodGroup', 'phone', 'email', 'lastDonation']
    )
    if (success) {
      toast.success('Donors exported successfully')
    } else {
      toast.error('No data to export')
    }
  }

  const handleEdit = (donor: any) => {
    setSelectedDonor(donor)
    setFormData({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      contact: donor.phone,
      email: donor.email,
      lastDonation: donor.lastDonationDate,
    })
    setIsEditModalOpen(true)
  }

  const handleViewHistory = (donor: any) => {
    setSelectedDonor(donor)
    setIsHistoryModalOpen(true)
  }

  const handleDelete = (donor: any) => {
    setSelectedDonor(donor)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedDonor) {
      try {
        await donorsApi.delete(selectedDonor.id)
        await fetchDonors()
        setIsDeleteDialogOpen(false)
        setSelectedDonor(null)
        toast.success('Donor deleted successfully')
      } catch (error) {
        console.error('Failed to delete donor:', error)
        toast.error('Failed to delete donor')
      }
    }
  }

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.bloodGroup || !formData.contact || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await donorsApi.create({
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        phone: formData.contact,
        email: formData.email,
        age: null,
        gender: null,
      })
      await fetchDonors()
      setIsAddModalOpen(false)
      toast.success('Donor added successfully')
    } catch (error) {
      console.error('Failed to add donor:', error)
      toast.error('Failed to add donor')
    }
  }

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.bloodGroup || !formData.contact || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }
    if (selectedDonor) {
      try {
        await donorsApi.update(selectedDonor.id, {
          name: formData.name,
          bloodGroup: formData.bloodGroup,
          phone: formData.contact,
          email: formData.email,
          lastDonationDate: formData.lastDonation || null,
        })
        await fetchDonors()
        setIsEditModalOpen(false)
        setSelectedDonor(null)
        toast.success('Donor updated successfully')
      } catch (error) {
        console.error('Failed to update donor:', error)
        toast.error('Failed to update donor')
      }
    }
  }

  return (
    <ProtectedRoute requiredRole={["admin", "staff"]}>
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Management</h1>
            <p className="text-gray-600 mt-1">Manage registered blood donors</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              <Plus className="w-4 h-4 mr-2" />
              Add Donor
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : donors.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🩸</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No donors found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first donor.</p>
                <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Donor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Donation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{donor.bloodGroup}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {donor.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {donor.email || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewHistory(donor)} title="View History">
                            <History className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(donor)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(donor)}>
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

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter donor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Phone Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Add Donor
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBloodGroup">Blood Group</Label>
                <select
                  id="editBloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContact">Phone Number</Label>
                <Input
                  id="editContact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          title="Delete Donor"
          description="Are you sure you want to delete this donor? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
        />

        {/* Donation History Modal */}
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogHeader>
            <DialogTitle>Donation History</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedDonor?.name}</h3>
                <p className="text-sm text-gray-600">Blood Group: {selectedDonor?.bloodGroup}</p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Recent Donations</h4>
                {selectedDonor?.lastDonationDate ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Blood Donation</p>
                        <p className="text-sm text-gray-600">{selectedDonor.bloodGroup}</p>
                      </div>
                      <Badge variant="success">{formatDate(selectedDonor.lastDonationDate)}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No donation history available</p>
                )}
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
