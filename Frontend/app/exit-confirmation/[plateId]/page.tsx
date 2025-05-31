"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, LogOut, ThumbsUp } from "lucide-react"
import Timer from "@/components/timer"
import dotenv from "dotenv";
dotenv.config();

const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK;

interface Vehicle {
  _id: string
  plateNumber: string
  slot: string
  entryTime: string
  duration: string
  status: string
  user: { name?: string; phone: string }
}


export default function ExitConfirmation() {
  const params = useParams<{ plateId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [parkingStarted, setParkingStarted] = useState(true)
  const [exitTime, setExitTime] = useState<string | null>(null)
  const [parkingDuration, setParkingDuration] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const plateNumber = params.plateId || "Error"

  const deleteNumberPlate = async (plateNumber: string) => {
    try {
      const response = await fetch(`${APP_LINK}/api/numberplates/${plateNumber}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete number plate');
      }
  
      console.log('Deleted successfully:', data.message);
      return data.message;
    } catch (error) {
      console.error('Error deleting number plate:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${APP_LINK}/api/vehicles/get/${plateNumber}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Vehicle ${plateNumber} not found. Please start a parking session.`)
            return
          }
          throw new Error(`Failed to fetch vehicle: ${response.status}`)
        }
        const data: Vehicle = await response.json()
        setVehicle(data)
        setParkingStarted(data.status !== "Exited")
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        setError("Failed to load vehicle data. Please try again or start a new session.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicle()
  }, [plateNumber])

  const handleExit = async () => {
    if (!vehicle) return

    try {
      const start = new Date(vehicle.entryTime)
      const end = new Date()
      const durationMs = end.getTime() - start.getTime()

      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      const formattedDuration = (hours > 0 ? `${hours}h ` : '') + `${minutes}m`

      const response = await fetch(`${APP_LINK}/api/vehicles/${plateNumber}/exit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exitTime: end.toISOString(),
          duration: formattedDuration,
          status: "Exited",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update vehicle status')
      }
      deleteNumberPlate(plateNumber);
      setParkingStarted(false)
      setExitTime(end.toISOString())
      setParkingDuration(formattedDuration)

      toast({
        title: "Parking Session Ended",
        description: `${plateNumber} parking duration: ${formattedDuration}`,
      })

    } catch (error) {
      console.error('Error ending parking session:', error)
      toast({
        title: "Error",
        description: "Failed to end parking session. Please try again.",
        variant: "destructive",
      })
    }
  }


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
            <h1 className="text-xl font-bold">ParkSense</h1>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading vehicle data...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Please start a parking session for vehicle {plateNumber}.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push(`/user/${plateNumber}`)}>
                  Start Parking Session
                </Button>
              </CardFooter>
            </Card>
          ) : vehicle ? (
            <Card>
              <CardHeader>
                <CardTitle>Exit Confirmation</CardTitle>
                <CardDescription>Confirm your vehicle details and end your parking session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border border-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Your Vehicle</h3>
                      <Badge variant="outline">{vehicle.plateNumber}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Parking Spot</p>
                        <p className="text-lg font-medium">{vehicle.slot}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Level</p>
                        <p className="text-lg font-medium">{vehicle.slot.split('-')[0]}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Entry Time</p>
                        <p className="text-lg font-medium">
                          {new Date(vehicle.entryTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Status</p>
                        <Badge variant="secondary" className="text-sm">
                          {parkingStarted ? "Active" : "Exited"}
                        </Badge>
                      </div>
                      {parkingDuration && (
                        <>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Exit Time</p>
                            <p className="text-lg font-medium">
                              {exitTime
                                ? new Date(exitTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : '-'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="text-lg font-medium">{parkingDuration}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border border-gray-800 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Parking Duration</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Timer isRunning={parkingStarted} startTime={vehicle.entryTime} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleExit}
                  disabled={!parkingStarted}
                >
                  <LogOut className="mr-2 h-4 w-4" /> {parkingStarted ? "End Parking Session" : "Session Ended"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Vehicle Found</CardTitle>
                <CardDescription>Could not find vehicle {plateNumber}.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => router.push(`/user/${plateNumber}`)}>
                  Start Parking Session
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>

      </main>
    </div>
  )
}