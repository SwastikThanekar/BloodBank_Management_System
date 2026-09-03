"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, X, Eye, Building2, Plus } from "lucide-react"
import { StatusBadge } from "@/components/common/status-badge"
import { requestsApi, hospitalsApi } from "@/lib/api"
import { toast } from "sonner"
import { getCompatibleBloodGroups } from "@/lib/utils"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    hospitalId: "",
    bloodGroup: "",
    units: "",
    urgency: "Normal"
  })

  useEffect(() => {
    fetchRequests()
    fetchHospitals()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await requestsApi.getAll()
      setRequests(data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to load requests data')
    } finally {
      setLoading(false)
    }
  }

  const fetchHospitals = async () => {
    try {
      const data = await hospitalsApi.getAll()
      setHospitals(data)
    } catch (error) {
      console.error('Failed to fetch hospitals:', error)
    }
  }

  const handleAdd = () => {
    setFormData({ hospitalId: "", bloodGroup: "", units: "", urgency: "Normal" })
    setIsAddModalOpen(true)
  }

  const handleSaveAdd = async () => {
    if (!formData.hospitalId || !formData.bloodGroup || !formData.units) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await requestsApi.create({
        hospitalId: parseInt(formData.hospitalId),
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        urgency: formData.urgency,
        status: "Pending"
      })
      await fetchRequests()
      setIsAddModalOpen(false)
      toast.success('Request created successfully')
    } catch (error) {
      console.error('Failed to create request:', error)
      toast.error('Failed to create request')
    }
  }

  const handleApprove = async (request: any) => {
    try {
      await requestsApi.update(request.id, {
        hospitalId: request.hospitalId,
        bloodGroup: request.bloodGroup,
        units: request.units,
        urgency: request.urgency,
        status: "Approved"
      })
      await fetchRequests()
      toast.success('Request approved successfully')
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast.error('Failed to approve request')
    }
  }

  const handleReject = async (request: any) => {
    try {
      await requestsApi.update(request.id, {
        hospitalId: request.hospitalId,
        bloodGroup: request.bloodGroup,
        units: request.units,
        urgency: request.urgency,
        status: "Rejected"
      })
      await fetchRequests()
      toast.success('Request rejected successfully')
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast.error('Failed to reject request')
    }
  }

  const handleView = (request: any) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
  }

  const pendingRequests = requests.filter((r) => r.status === "Pending")
  const processedRequests = requests.filter((r) => r.status !== "Pending")

  return (
    <ProtectedRoute requiredRole={["admin", "hospital"]}>
      <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
            <p className="text-gray-600 mt-1">Manage and respond to blood requests</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : requests.filter(r => r.status === 'Pending').length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500">All blood requests have been processed.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Compatible Blood Groups</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(r => r.status === 'Pending').map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.hospitalName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.bloodGroup}</Badge>
                      </TableCell>
                      <TableCell>{request.units}</TableCell>
                      <TableCell>{request.urgency}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getCompatibleBloodGroups(request.bloodGroup).map((group) => (
                            <Badge key={group} variant="success" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={request.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(request)}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReject(request)}>
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleView(request)}>
                            <Eye className="w-4 h-4" />
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

        <Card>
          <CardHeader>
            <CardTitle>Processed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(r => r.status !== 'Pending').map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.hospitalName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.bloodGroup}</Badge>
                      </TableCell>
                      <TableCell>{request.units}</TableCell>
                      <TableCell><StatusBadge status={request.status} /></TableCell>
                      <TableCell>{request.requestDate || request.createdAt?.split('T')[0]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <DialogContent>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium">{selectedRequest.hospitalName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="font-medium">{selectedRequest.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Units Required</p>
                    <p className="font-medium">{selectedRequest.units}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgency</p>
                    <p className="font-medium">{selectedRequest.urgency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">{selectedRequest.requestDate || selectedRequest.createdAt?.split('T')[0]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium"><StatusBadge status={selectedRequest.status} /></p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Add Request Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogHeader>
            <DialogTitle>Create New Blood Request</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <select
                  id="hospital"
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units Required</Label>
                <Input
                  id="units"
                  type="number"
                  min="1"
                  value={formData.units}
                  onChange={(e) => setFormData({...formData, units: e.target.value})}
                  placeholder="Enter number of units"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <select
                  id="urgency"
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-[#D32F2F] hover:bg-[#B71C1C]">
              Create Request
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </MainLayout>
    </ProtectedRoute>
  )
}
