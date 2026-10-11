import { storage } from './storage';

// In Vercel services deployment, use relative URL for API calls
// This allows the rewrites to route /api/* to the backend service
// For local development, use the localhost backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    storage.setToken(data.token);
    storage.setUser(data.user);
    return data;
  },
  logout: () => {
    storage.clearAuth();
  },
  isAuthenticated: () => storage.isAuthenticated(),
  register: async (userData: any) => {
    const data = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  },
};

// Users API
export const usersApi = {
  getAll: () => apiRequest('/users'),
  updateStatus: (id: number, status: string) => apiRequest(`/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id: number) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Blood Inventory API
export const inventoryApi = {
  getAll: async () => {
    const data = await apiRequest('/inventory');
    // Transform backend data to match frontend expectations
    return data.map((item: any) => ({
      ...item,
      // Backend uses 'bloodGroup' consistently
      group: item.bloodGroup, // Add 'group' field for compatibility
    }));
  },
  create: (data: any) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      bloodGroup: data.bloodGroup || data.group,
      units: data.units || 0,
      status: data.status || 'Available',
    };
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },
  update: (id: number, data: any) => {
    const backendData = {
      bloodGroup: data.bloodGroup || data.group,
      units: data.units,
      status: data.status,
    };
    return apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },
  delete: (id: number) => apiRequest(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Donors API
export const donorsApi = {
  getAll: async () => {
    const data = await apiRequest('/donors');
    // Transform backend data to match frontend expectations
    return data.map((donor: any) => ({
      ...donor,
      // Backend uses 'name' but frontend expects 'name' (same field)
      // Backend uses 'phone' and 'email' directly
      bloodGroup: donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate,
    }));
  },
  create: (data: any) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      name: data.name,
      bloodGroup: data.bloodGroup,
      phone: data.phone,
      email: data.email,
      age: data.age || null,
      gender: data.gender || null,
    };
    return apiRequest('/donors', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },
  update: (id: number, data: any) => {
    const backendData = {
      name: data.name,
      bloodGroup: data.bloodGroup,
      phone: data.phone,
      email: data.email,
      age: data.age || null,
      gender: data.gender || null,
    };
    return apiRequest(`/donors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },
  delete: (id: number) => apiRequest(`/donors/${id}`, {
    method: 'DELETE',
  }),
};

// Blood Requests API
export const requestsApi = {
  getAll: async () => {
    const data = await apiRequest('/requests');
    // Get hospitals to map hospital names
    const hospitals = await apiRequest('/hospitals');
    
    // Transform backend data to match frontend expectations
    return data.map((request: any) => {
      const hospital = hospitals.find((h: any) => h.id === request.hospitalId);
      return {
        ...request,
        // Map hospital name from hospitalId
        hospitalName: hospital ? hospital.name : 'Unknown Hospital',
        requestDate: request.requestDate || request.createdAt?.split('T')[0],
        status: request.status || 'Pending',
      };
    });
  },
  create: (data: any) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      hospitalId: data.hospitalId || null,
      bloodGroup: data.bloodGroup,
      units: data.units,
      urgency: data.urgency || 'Normal',
      status: data.status || 'Pending',
    };
    return apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },
  updateStatus: (id: number, status: string) => apiRequest(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  update: (id: number, data: any) => {
    const backendData = {
      hospitalId: data.hospitalId,
      bloodGroup: data.bloodGroup,
      units: data.units,
      urgency: data.urgency,
      status: data.status,
    };
    return apiRequest(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },
};

// Hospitals API
export const hospitalsApi = {
  getAll: () => apiRequest('/hospitals'),
  create: (data: any) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
      contactPerson: data.contactPerson || null,
    };
    return apiRequest('/hospitals', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },
  update: (id: number, data: any) => {
    const backendData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
      contactPerson: data.contactPerson || null,
    };
    return apiRequest(`/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },
  delete: (id: number) => apiRequest(`/hospitals/${id}`, {
    method: 'DELETE',
  }),
};

// Appointments API
export const appointmentsApi = {
  getAll: async () => {
    const data = await apiRequest('/appointments');
    // Transform backend data to match frontend expectations
    return data.map((appointment: any) => ({
      ...appointment,
      // Backend returns donorName from JOIN, date and time separately
      donorName: appointment.donorName || 'Unknown Donor',
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
    }));
  },
  create: async (data: any) => {
    // Transform frontend data to match backend expectations
    // Frontend sends: donorName, appointmentDate, appointmentTime
    // Backend expects: donorId, date, time
    
    // First, we need to resolve donorId from donorName
    const donors = await apiRequest('/donors');
    const donor = donors.find((d: any) => d.name === data.donorName);
    
    if (!donor) {
      throw new Error('Donor not found. Please ensure the donor exists in the system.');
    }
    
    const backendData = {
      donorId: donor.id,
      date: data.appointmentDate,
      time: data.appointmentTime,
    };
    
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },
  update: (id: number, data: any) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      donorId: data.donorId || null,
      date: data.appointmentDate || data.date,
      time: data.appointmentTime || data.time,
      status: data.status,
    };
    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },
  delete: (id: number) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE',
  }),
};

// Stats API
export const statsApi = {
  get: async () => {
    try {
      const data = await apiRequest('/stats');
      // Ensure all stats are present with defaults
      return {
        totalBloodUnits: data.totalBloodUnits || 0,
        totalDonors: data.totalDonors || 0,
        pendingRequests: data.pendingRequests || 0,
        scheduledAppointments: data.scheduledAppointments || 0,
      };
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Return default stats if API fails
      return {
        totalBloodUnits: 0,
        totalDonors: 0,
        pendingRequests: 0,
        scheduledAppointments: 0,
      };
    }
  },
};