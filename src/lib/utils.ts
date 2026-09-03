import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isExpiringSoon(date: string | Date, daysThreshold: number = 30): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return false
  
  const today = new Date()
  const diffTime = d.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 && diffDays <= daysThreshold
}

export function isExpired(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return false
  
  return d < new Date()
}

// Blood compatibility checking
export function isBloodCompatible(donorBloodGroup: string, recipientBloodGroup: string): boolean {
  const compatibility: Record<string, string[]> = {
    "O+": ["O+", "A+", "B+", "AB+"],
    "O-": ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    "A+": ["A+", "AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "B+": ["B+", "AB+"],
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB+": ["AB+"],
    "AB-": ["AB+", "AB-"],
  }

  return compatibility[donorBloodGroup]?.includes(recipientBloodGroup) || false
}

export function getCompatibleBloodGroups(recipientBloodGroup: string): string[] {
  const compatibility: Record<string, string[]> = {
    "O+": ["O+", "O-"],
    "O-": ["O-"],
    "A+": ["O+", "O-", "A+", "A-"],
    "A-": ["O-", "A-"],
    "B+": ["O+", "O-", "B+", "B-"],
    "B-": ["O-", "B-"],
    "AB+": ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    "AB-": ["O-", "A-", "B-", "AB-"],
  }

  return compatibility[recipientBloodGroup] || []
}

// CSV Export utility
export function exportToCSV(data: any[], filename: string, headers: string[]) {
  if (data.length === 0) {
    return false
  }

  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header] || ''
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  return true
}
