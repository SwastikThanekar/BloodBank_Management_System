import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "destructive"
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariant = (status: string): "default" | "success" | "warning" | "destructive" => {
    if (variant) return variant
    
    const normalizedStatus = status.toLowerCase()
    
    if (normalizedStatus === "approved" || normalizedStatus === "available" || normalizedStatus === "completed" || normalizedStatus === "valid") {
      return "success"
    }
    if (normalizedStatus === "pending" || normalizedStatus === "low" || normalizedStatus === "scheduled" || normalizedStatus === "expiring soon") {
      return "warning"
    }
    if (normalizedStatus === "rejected" || normalizedStatus === "critical" || normalizedStatus === "cancelled" || normalizedStatus === "expired") {
      return "destructive"
    }
    
    return "default"
  }

  return <Badge variant={getVariant(status)}>{status}</Badge>
}