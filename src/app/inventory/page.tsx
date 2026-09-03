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
import { Plus, Edit, Trash2, Filter, Download } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { StatusBadge } from "@/components/common/status-badge"
import { inventoryApi } from "@/lib/api"
import { toast } from "sonner"
import { exportToCSV, formatDate, isExpiringSoon, isExpired } from "@/lib/utils"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

// Common blood group colors for better UX
const getBloodGroupColor = (group: string) => {
  const colors: Record<string, string> = {
    "A+": "bg-red-100 text-red-800",
    "A-": "bg-red-50 text-red-700",
    "B+": "bg-blue-100 text-blue-800",
    "B-": "bg-blue-50 text-blue-700",
    "AB+": "bg-purple-100 text-purple-800",
    "AB-": "bg-purple-50 text-purple-700",
    "O+": "bg-green-100 text-green-800",
    "O-": "bg-green-50 text-green-700",
  }
  return colors[group] || "bg-gray-100 text-gray-800"
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    bloodGroup: "",
    units: "",
    expiryDate: "",
  })

  const filteredInventory = inventory.filter((item) => {
    const matchesFilter = filterGroup === "" || item.bloodGroup === filterGroup
    return matchesFilter
  })

  // Check for low stock items (less than 10 units)
  const lowStockItems = inventory.filter((item) => item.units < 10)
  const hasLowStock = lowStockItems.length > 0

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.getAll()
      setInventory(data)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ bloodGroup: "", units: "", expiryDate: "" })
    setIsAddModalOpen(true)
  }

  const handleExport = () => {
    const success = exportToCSV(
      filteredInventory,
      'blood-inventory',
      ['bloodGroup', 'units', 'expiryDate', 'status']
    )
    if (success) {
      toast.success('Inventory exported successfully')
    } else {
      toast.error('No data to export')
    }
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setFormData({
      bloodGroup: item.bloodGroup,
      units: item.units.toString(),
      expiryDate: item.expiryDate,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (item: any) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        await inventoryApi.delete(selectedItem.id)
        await fetchInventory()
        setIsDeleteDialogOpen(false)
        setSelectedItem(null)
        toast.success('Blood unit deleted successfully')
      } catch (error) {
        console.error('Failed to delete item:', error)
        toast.error('Failed to delete blood unit')
      }
    }
  }

  const handleSaveAdd = async () => {
    if (!formData.bloodGroup || !formData.units || !formData.expiryDate) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      const units = parseInt(formData.units)
      await inventoryApi.create({
        bloodGroup: formData.bloodGroup,
        units,
        expiryDate: formData.expiryDate,
      })
      await fetchInventory()
      setIsAddModalOpen(false)
      toast.success('Blood unit added successfully')
    } catch (error) {
      console.error('Failed to add item:', error)
      toast.error('Failed to add blood unit')
    }
  }

  const handleSaveEdit = async () => {
    if (!formData.bloodGroup || !formData.units || !formData.expiryDate) {
      toast.error('Please fill in all fields')
      return
    }
    if (selectedItem) {
      try {
        await inventoryApi.update(selectedItem.id, {
          bloodGroup: formData.bloodGroup,
          units: parseInt(formData.units),
          expiryDate: formData.expiryDate,
        })
        await fetchInventory()
        setIsEditModalOpen(false)
        setSelectedItem(null)
        toast.success('Blood unit updated successfully')
      } catch (error) {
        console.error('Failed to update item:', error)
        toast.error('Failed to update blood unit')
      }
    }
  }

  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Inventory</h1>
            <p className="text-gray-600 mt-1">Manage blood stock levels</p>
          </div>
          <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
            <Plus className="w-4 h-4 mr-2" />
            Add Blood Unit
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Low Stock Alert */}
        {hasLowStock && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Filter className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    {lowStockItems.length} blood group(s) have low stock (less than 10 units): {lowStockItems.map(item => item.bloodGroup).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Filter className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No blood units found</h3>
                <p className="text-gray-500 mb-4">Add blood units to get started or adjust your filter.</p>
                <Button onClick={handleAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Blood Unit
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units Available</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Badge className={getBloodGroupColor(item.bloodGroup)}>
                          {item.bloodGroup}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.units}</TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>
                        {isExpired(item.expiryDate) ? (
                          <StatusBadge status="Expired" />
                        ) : isExpiringSoon(item.expiryDate, 7) ? (
                          <StatusBadge status="Expiring Soon" />
                        ) : (
                          <StatusBadge status="Valid" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
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
            <DialogTitle>Add Blood Unit</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
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
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  placeholder="Enter number of units"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Add
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Blood Unit</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
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
                <Label htmlFor="editUnits">Units</Label>
                <Input
                  id="editUnits"
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editExpiryDate">Expiry Date</Label>
                <Input
                  id="editExpiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Blood Unit"
          description="Are you sure you want to delete this blood unit? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
