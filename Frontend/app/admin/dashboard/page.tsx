"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Car, LogOut, MoreHorizontal, RefreshCw, Search, User } from "lucide-react"
import SimplifiedParkingMap from "@/components/enhanced-parking-map"
import Clock from "@/components/clock"
import LastUpdated from "@/components/last-updated"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dotenv from "dotenv"
dotenv.config()

const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK;

interface VehicleUser {
  name?: string
  phone: string
}

interface Vehicle {
  _id: string
  plateNumber: string
  slot: string
  entryTime: string
  duration: string
  status: string
  user: VehicleUser
}

interface Feedback {
  _id: string
  plateNumber: string
  phoneNumber: string
  rating: number
  comment: string
  createdAt: string
}

const mockRoverData = [
  {
    id: "Rover-001",
    batteryHealth: 85,
    lastCharged: "2025-04-29T18:00:00Z",
    distanceRoamed: 3200,
    platesScanned: 45,
    recentActivity: [
      "2025-04-29T17:45:00Z: Scanned plate KA01AB1234 at L1-A3",
      "2025-04-29T17:30:00Z: Moved to L2-B section",
      "2025-04-29T17:15:00Z: Scanned plate MH02CD5678 at L2-B7",
      "2025-04-29T17:00:00Z: Detected obstacle at L3-C12",
      "2025-04-29T16:45:00Z: Scanned plate DL03EF9012 at L3-C12",
    ],
  },
  {
    id: "Rover-002",
    batteryHealth: 92,
    lastCharged: "2025-04-29T20:00:00Z",
    distanceRoamed: 2800,
    platesScanned: 38,
    recentActivity: [
      "2025-04-29T19:50:00Z: Scanned plate GJ04GH3456 at L4-D5",
      "2025-04-29T19:40:00Z: Moved to L1-A section",
      "2025-04-29T19:30:00Z: Scanned plate KA01AB1234 at L1-A3",
      "2025-04-29T19:20:00Z: Detected low battery warning",
      "2025-04-29T19:10:00Z: Scanned plate MH02CD5678 at L2-B7",
    ],
  },
]

// Function to format time difference
const formatTimeAgo = (entryTime: string) => {
  const entryDate = new Date(entryTime)
  const now = new Date()
  const diffInMs = now.getTime() - entryDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInMinutes < 1) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}day${diffInDays > 1 ? 's' : ''} ago`
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingSOS, setIsSendingSOS] = useState(false)
  const [parkingData, setParkingData] = useState<Vehicle[]>([])
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null)
  
  // Set default dates: yesterday for feedbackFromDate, today for feedbackToDate
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const formatDate = (date: Date) => date.toISOString().split("T")[0]
  
  const [feedbackFromDate, setFeedbackFromDate] = useState<string>(formatDate(yesterday))
  const [feedbackToDate, setFeedbackToDate] = useState<string>(formatDate(today))
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState<string>("")
  const [feedbackSortBy, setFeedbackSortBy] = useState<string>("createdAt")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [reportFromDate, setReportFromDate] = useState<string>(formatDate(yesterday))
  const [reportToDate, setReportToDate] = useState<string>(formatDate(today))
  
  // Vehicle filters
  const past24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const [vehicleFromDate, setVehicleFromDate] = useState<string>(formatDate(past24Hours))
  const [vehicleToDate, setVehicleToDate] = useState<string>(formatDate(today))
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>("")
  const [vehicleSortBy, setVehicleSortBy] = useState<string>("entryTimeDesc")
  
  const [count, setCount] = useState(0)

  // Fetch car image when selectedVehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      const fetchCarImage = async () => {
        try {
          const response = await fetch(`${APP_LINK}/api/numberplates/${selectedVehicle.plateNumber}`)
          if (!response.ok) {
            throw new Error('Failed to fetch car image')
          }
          const data = await response.json()
          setCarImageUrl(data.imageUrl)
        } catch (error) {
          console.error('Error fetching car image:', error)
          toast({
            title: 'Error',
            description: 'Failed to load car image. Please try again.',
            variant: 'destructive',
          })
          setCarImageUrl(null)
        }
      }
      fetchCarImage()
    } else {
      setCarImageUrl(null)
    }
  }, [selectedVehicle, toast])

  useEffect(() => {
    axios.get(`${APP_LINK}/api/vehicles/active-count`)
      .then(res => setCount(res.data.count))
      .catch(err => {
        console.error('Error:', err)
        toast({ title: 'Error', description: 'Failed to load active vehicle count.', variant: 'destructive' })
      })
  }, [])

  useEffect(() => {
    const reloadInterval = setInterval(() => {
      window.location.reload()
    }, 20000)

    return () => clearInterval(reloadInterval)
  }, [])

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${APP_LINK}/api/vehicles`)
        if (!response.ok) throw new Error('Failed to fetch vehicles')
        const data: Vehicle[] = await response.json()
        setParkingData(data)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        toast({ title: 'Error', description: 'Failed to load vehicle data.', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${APP_LINK}/api/feedback/get`)
        if (response.status !== 200) throw new Error('Failed to fetch feedbacks')
        const data: Feedback[] = response.data
        setFeedbackData(data)
      } catch (error) {
        console.error('Error fetching feedbacks:', error)
        toast({ title: 'Error', description: 'Failed to load feedback data.', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeedbacks()
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    await setTimeout(() => {
      toast({
        title: "Data Refreshed",
        description: "Parking data has been updated.",
      })
      setIsLoading(false)
    }, 1000)
    window.location.reload()
  }

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
    router.push("/admin/login")
  }

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowVehicleDetails(true)
  }

  const handleSendSOS = async () => {
    if (!selectedVehicle) return
    setIsSendingSOS(true)
    try {
      const response = await axios.post(`${APP_LINK}/api/sos`, {
        userId: selectedVehicle.user.phone,
        message: `Urgent: Please check your vehicle ${selectedVehicle.plateNumber} at slot ${selectedVehicle.slot} or contact support immediately!`,
      })
      toast({
        title: 'SOS Alert Sent',
        description: `Alert sent to user with phone ${selectedVehicle.user.phone}.`,
      })
      setShowVehicleDetails(false)
    } catch (error: any) {
      console.error('Error sending SOS:', error)
      const errorMessage =
        error.response?.data?.error === "User not connected"
          ? "User is not currently connected. They may not receive the alert."
          : "Failed to send SOS alert. Please try again."
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendSOS()}
            className="border-[#D1D1D1] text-[#D1D1D1] hover:bg-[#444444]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        ),
      })
    } finally {
      setIsSendingSOS(false)
    }
  }

  const downloadCSV = () => {
    const filteredData = parkingData.filter((entry) => {
      const entryDate = new Date(entry.entryTime).toISOString().split("T")[0]
      return entryDate >= reportFromDate && entryDate <= reportToDate
    })

    const headers = ["ID,Plate Number,Slot,Entry Time,Duration,Status"]
    const rows = filteredData.map((entry) =>
      `${entry._id},${entry.plateNumber},${entry.slot},${entry.entryTime},${entry.duration},${entry.status}`
    )
    const csvContent = [...headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `parking_entries_exits_${reportFromDate}_to_${reportToDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadFeedbackCSV = () => {
    const filteredFeedbacks = filteredFeedbackData
    const headers = ["ID,Plate Number,Phone Number,Rating,Comment,Created At"]
    const rows = filteredFeedbacks.map((feedback) =>
      `${feedback._id},${feedback.plateNumber},${feedback.phoneNumber},${feedback.rating},${feedback.comment.replace(/,/g, '')},${feedback.createdAt}`
    )
    const csvContent = [...headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `feedbacks_${feedbackFromDate}_to_${feedbackToDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter and sort feedback data
  const filteredFeedbackData = feedbackData
    .filter((feedback) => {
      let matchesDate = true
      if (feedbackFromDate && feedbackToDate) {
        const feedbackDate = new Date(feedback.createdAt).toISOString().split("T")[0]
        matchesDate = feedbackDate >= feedbackFromDate && feedbackDate <= feedbackToDate
      }
      
      const matchesSearch = feedbackSearchQuery
        ? feedback.plateNumber.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
          feedback.phoneNumber.includes(feedbackSearchQuery)
        : true

      const matchesRating = ratingFilter !== "all" ? feedback.rating === parseInt(ratingFilter) : true

      return matchesDate && matchesSearch && matchesRating
    })
    .sort((a, b) => {
      if (feedbackSortBy === "plateNumber") {
        return a.plateNumber.localeCompare(b.plateNumber)
      } else if (feedbackSortBy === "phoneNumber") {
        return a.phoneNumber.localeCompare(b.phoneNumber)
      } else if (feedbackSortBy === "rating") {
        return b.rating - a.rating
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Filter and sort vehicle data
  const filteredVehicleData = parkingData
    .filter((vehicle) => {
      // Date filter
      let matchesDate = true
      if (vehicleFromDate && vehicleToDate) {
        const entryDate = new Date(vehicle.entryTime).toISOString().split("T")[0]
        matchesDate = entryDate >= vehicleFromDate && entryDate <= vehicleToDate
      }

      // Search filter
      const matchesSearch = vehicleSearchQuery
        ? vehicle.plateNumber.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
          vehicle.user.phone.includes(vehicleSearchQuery)
        : true

      return matchesDate && matchesSearch
    })
    .sort((a, b) => {
      if (vehicleSortBy === "statusAsc") {
        return a.status.localeCompare(b.status)
      } else if (vehicleSortBy === "statusDesc") {
        return b.status.localeCompare(a.status)
      } else if (vehicleSortBy === "durationAsc") {
        const parseDuration = (duration: string) => {
          const [hours, minutes] = duration.split("h ").map((s) => parseInt(s || "0"))
          return hours * 60 + (minutes || 0)
        }
        return parseDuration(a.duration) - parseDuration(b.duration)
      } else if (vehicleSortBy === "durationDesc") {
        const parseDuration = (duration: string) => {
          const [hours, minutes] = duration.split("h ").map((s) => parseInt(s || "0"))
          return hours * 60 + (minutes || 0)
        }
        return parseDuration(b.duration) - parseDuration(a.duration)
      } else if (vehicleSortBy === "entryTimeAsc") {
        return new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
      } else {
        // Default: entryTimeDesc
        return new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      }
    })

  // Filter entries for reports based on reportFromDate and reportToDate
  const filteredEntries = parkingData.filter((entry) => {
    const entryDate = new Date(entry.entryTime).toISOString().split("T")[0]
    return entryDate >= reportFromDate && entryDate <= reportToDate
  })

  // Calculate metrics based on filteredEntries
  const totalEntries = filteredEntries.length
  const totalExits = filteredEntries.filter((entry) => entry.status === "Exited").length
  const avgDuration =
    filteredEntries
      .filter((entry) => entry.duration !== "0h")
      .reduce((sum, entry) => {
        const [hours, minutes] = entry.duration.split("h ").map((s) => parseInt(s || "0"))
        return sum + hours * 60 + (minutes || 0)
      }, 0) /
    totalExits || 0
  const peakHours = filteredEntries
    .map((entry) => new Date(entry.entryTime).getHours())
    .reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
  const peakHour = Object.entries(peakHours).reduce(
    (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour), count } : max),
    { hour: 0, count: 0 }
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Car className="h-6 w-6" />
            <h1 className="text-xl font-bold">ParkSense Admin</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Parking Overview</h2>
                <p className="text-gray-400">Monitor and manage all parking activities</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-gray-900 rounded-md p-2 flex items-center gap-2">
                  <Badge className="text-lg" variant="outline">{count}/192</Badge>
                  <span className="text-lg">Spots Occupied</span>
                </div>

                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Find Vehicle
                </Button>
              </div>
            </div>

            <Tabs defaultValue="map">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="map">Parking Map</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Live Parking Map</CardTitle>
                        <CardDescription className="mt-1">Real-time view of all parking spots and their current status.</CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <Clock />
                        <LastUpdated />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full">
                      <SimplifiedParkingMap
                        suggestedSlot={null}
                        isAdminView={true}
                        vehicles={parkingData.filter((entry) => entry.status !== "Exited")}
                        onOccupiedSlotClick={handleVehicleClick}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Vehicles</CardTitle>
                    <CardDescription>List of all vehicles currently in the parking lot.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="vehicleFromDate">From Date</Label>
                        <Input
                          id="vehicleFromDate"
                          type="date"
                          value={vehicleFromDate}
                          onChange={(e) => setVehicleFromDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleToDate">To Date</Label>
                        <Input
                          id="vehicleToDate"
                          type="date"
                          value={vehicleToDate}
                          onChange={(e) => setVehicleToDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleSearchQuery">Search</Label>
                        <Input
                          id="vehicleSearchQuery"
                          type="text"
                          placeholder="Plate or Phone Number"
                          value={vehicleSearchQuery}
                          onChange={(e) => setVehicleSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <Label htmlFor="vehicleSortBy">Sort By</Label>
                        <Select value={vehicleSortBy} onValueChange={setVehicleSortBy}>
                          <SelectTrigger id="vehicleSortBy" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entryTimeDesc">Entry Time (Newest)</SelectItem>
                            <SelectItem value="entryTimeAsc">Entry Time (Oldest)</SelectItem>
                            <SelectItem value="statusAsc">Status (Active First)</SelectItem>
                            <SelectItem value="statusDesc">Status (Exited First)</SelectItem>
                            <SelectItem value="durationAsc">Duration (Shortest)</SelectItem>
                            <SelectItem value="durationDesc">Duration (Longest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Slot</TableHead>
                            <TableHead>Entry Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVehicleData.map((vehicle) => (
                            <TableRow
                              key={vehicle._id}
                              className="cursor-pointer hover:bg-gray-900"
                              onClick={() => handleVehicleClick(vehicle)}
                            >
                              <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                              <TableCell>{vehicle.slot}</TableCell>
                              <TableCell>{formatTimeAgo(vehicle.entryTime)}</TableCell>
                              <TableCell>{vehicle.duration}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {vehicle.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleVehicleClick(vehicle)
                                      }}
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toast({
                                          title: "Manual Exit",
                                          description: `Vehicle ${vehicle.plateNumber} has been marked as exited.`,
                                        })
                                      }}
                                    >
                                      Mark as Exited
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Download Entry/Exit Reports</CardTitle>
                      <CardDescription>Select a date range to download vehicle entry and exit data as CSV.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="reportFromDate">From Date</Label>
                          <Input
                            id="reportFromDate"
                            type="date"
                            value={reportFromDate}
                            onChange={(e) => setReportFromDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reportToDate">To Date</Label>
                          <Input
                            id="reportToDate"
                            type="date"
                            value={reportToDate}
                            onChange={(e) => setReportToDate(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={downloadCSV} className="w-full">
                            Download CSV
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Automated Parking System Reports</CardTitle>
                      <CardDescription>Summary of parking activity based on selected date range ({reportFromDate} to {reportToDate}).</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Total Entries</h3>
                          <p className="text-2xl font-bold">{totalEntries}</p>
                        </div>
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Total Exits</h3>
                          <p className="text-2xl font-bold">{totalExits}</p>
                        </div>
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Average Parking Duration</h3>
                          <p className="text-2xl font-bold">
                            {Math.floor(avgDuration / 60)}h {avgDuration % 60}m
                          </p>
                        </div>
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Peak Parking Hour</h3>
                          <p className="text-2xl font-bold">
                            {peakHour.count > 0 ? `${peakHour.hour}:00 - ${peakHour.hour + 1}:00 (${peakHour.count} entries)` : "No entries"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rover Reports</CardTitle>
                      <CardDescription>Latest status and activity of autonomous rovers in the parking facility.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mockRoverData.map((rover) => (
                        <div key={rover.id} className="mb-6 p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">{rover.id}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Battery Health</p>
                              <p className="text-xl font-bold">{rover.batteryHealth}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Last Charged</p>
                              <p className="text-xl font-bold">
                                {new Date(rover.lastCharged).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Distance Roamed</p>
                              <p className="text-xl font-bold">{rover.distanceRoamed} meters</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Number Plates Scanned</p>
                              <p className="text-xl font-bold">{rover.platesScanned}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-400">Recent Activity</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-400">
                              {rover.recentActivity.map((activity, index) => (
                                <li key={index}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feedbacks" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Feedbacks</CardTitle>
                    <CardDescription>List of all feedback submitted by users.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label htmlFor="feedbackFromDate">From Date</Label>
                        <Input
                          id="feedbackFromDate"
                          type="date"
                          value={feedbackFromDate}
                          onChange={(e) => setFeedbackFromDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="feedbackToDate">To Date</Label>
                        <Input
                          id="feedbackToDate"
                          type="date"
                          value={feedbackToDate}
                          onChange={(e) => setFeedbackToDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="feedbackSearchQuery">Search</Label>
                        <Input
                          id="feedbackSearchQuery"
                          type="text"
                          placeholder="Plate or Phone Number"
                          value={feedbackSearchQuery}
                          onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ratingFilter">Rating</Label>
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                          <SelectTrigger id="ratingFilter">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <Label htmlFor="feedbackSortBy">Sort By</Label>
                        <Select value={feedbackSortBy} onValueChange={setFeedbackSortBy}>
                          <SelectTrigger id="feedbackSortBy" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="createdAt">Date (Newest)</SelectItem>
                            <SelectItem value="plateNumber">Plate Number (A-Z)</SelectItem>
                            <SelectItem value="phoneNumber">Phone Number (A-Z)</SelectItem>
                            <SelectItem value="rating">Rating (High to Low)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={downloadFeedbackCSV}>Download CSV</Button>
                    </div>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Submitted At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFeedbackData.map((feedback) => (
                            <TableRow key={feedback._id}>
                              <TableCell className="font-medium">{feedback.plateNumber}</TableCell>
                              <TableCell>{feedback.phoneNumber}</TableCell>
                              <TableCell>{feedback.rating} ★</TableCell>
                              <TableCell>{feedback.comment}</TableCell>
                              <TableCell>{new Date(feedback.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Vehicle Details Dialog */}
          {selectedVehicle && (
            <Dialog open={showVehicleDetails} onOpenChange={setShowVehicleDetails}>
              <DialogContent className="sm:max-w-md bg-[#1F1F1F] border-[#444444] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Vehicle Details</DialogTitle>
                  <DialogDescription className="text-[#D1D1D1]">
                    Detailed information about the selected vehicle.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-4 p-4 border border-[#444444] rounded-lg bg-[#2D2D2D]">
                    {carImageUrl ? (
                      <img
                        src={carImageUrl}
                        alt={`Vehicle with plate ${selectedVehicle.plateNumber}`}
                        className="w-full max-w-[200px] h-auto rounded-md"
                      />
                    ) : (
                      <Car className="h-12 w-12 text-[#D1D1D1]" />
                    )}
                    <Badge variant="outline" className="text-lg px-4 py-2 bg-[#2D2D2D] text-white border-[#444444]">
                      {selectedVehicle.plateNumber}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-[#D1D1D1]">Parking Slot</p>
                      <p className="text-lg font-medium text-white">{selectedVehicle.slot}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#D1D1D1]">Entry Time</p>
                      <p className="text-sm font-medium text-white">{formatTimeAgo(selectedVehicle.entryTime)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#D1D1D1]">Duration</p>
                      <p className="text-lg font-medium text-white">{selectedVehicle.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#D1D1D1]">Status</p>
                      <Badge variant="outline" className="capitalize bg-[#2D2D2D] text-white border-[#444444]">
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-[#444444] pt-4">
                    <h4 className="text-sm font-medium text-white mb-2">Driver Information</h4>
                    <div className="flex items-center gap-4 p-2 border border-[#444444] rounded-lg bg-[#2D2D2D]">
                      <User className="h-8 w-8 text-[#D1D1D1]" />
                      <div>
                        <p className="text-sm text-[#D1D1D1]">{selectedVehicle.user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowVehicleDetails(false)}
                    className="bg-[#2D2D2D] text-white border-[#444444] hover:bg-[#444444]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Manual Exit",
                        description: `Vehicle ${selectedVehicle.plateNumber} has been marked as exited.`,
                      })
                      setShowVehicleDetails(false)
                    }}
                    className="bg-[#D1D1D1] text-black hover:bg-[#FFFFFF]"
                  >
                    Mark as Exited
                  </Button>
                  <Button
                    onClick={handleSendSOS}
                    disabled={isSendingSOS}
                    className="bg-[#D1D1D1] text-black hover:bg-[#FFFFFF] flex items-center gap-2 disabled:opacity-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {isSendingSOS ? "Sending..." : "Send SOS Alert"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </main>
    </div>
  )
}