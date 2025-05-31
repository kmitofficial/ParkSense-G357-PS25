"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "./ui/badge"
import { Car } from "lucide-react"

interface VehicleUser {
  name: string
  phone: string
}

interface Vehicle {
  id: number
  plateNumber: string
  slot: string
  entryTime: string
  duration: string
  status: string
  user: VehicleUser
}

interface ParkingSlot {
  id: string
  row: string
  number: number
  isOccupied: boolean
  isSuggested: boolean
  isSelected: boolean
}

interface ParkingMapProps {
  suggestedSlot: string | null
  selectedSlot: string | null
  onSlotSelect: (slot: string) => void
  isAdminView?: boolean
  vehicles?: Vehicle[]
  onOccupiedSlotClick?: (vehicle: Vehicle) => void
}

const ParkingMap = ({ suggestedSlot, selectedSlot, onSlotSelect, isAdminView = false, vehicles = [], onOccupiedSlotClick }: ParkingMapProps) => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([])

  // Generate parking slots
  useEffect(() => {
    const slots: ParkingSlot[] = []
    const rows = ["A", "B", "C", "D"]

    rows.forEach((row) => {
      for (let i = 1; i <= 5; i++) {
        const slotId = `${row}${i}`
        const isOccupied = vehicles.some((vehicle) => vehicle.slot === slotId)
        const isSuggested = slotId === suggestedSlot
        const isSelected = slotId === selectedSlot

        slots.push({
          id: slotId,
          row,
          number: i,
          isOccupied: isSuggested ? false : isOccupied, // Suggested slot is always available
          isSuggested,
          isSelected,
        })
      }
    })

    setParkingSlots(slots)
  }, [suggestedSlot, selectedSlot])

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.isOccupied && isAdminView && onOccupiedSlotClick) {
      // Find the vehicle for this slot
      const vehicle = vehicles.find((v) => v.slot === slot.id)
      if (vehicle) {
        onOccupiedSlotClick(vehicle)
      }
    } else if (!slot.isOccupied) {
      onSlotSelect(slot.id)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Parking Map</h3>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-600 rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4 bg-gray-950">
        {/* Entrance */}
        <div className="mb-6 flex justify-center">
          <Badge variant="outline" className="px-4">
            Entrance
          </Badge>
        </div>

        {/* Parking Grid */}
        <div className="grid grid-cols-5 gap-2">
          {parkingSlots.map((slot) => (
            <motion.div
              key={slot.id}
              whileHover={!slot.isOccupied ? { scale: 1.05 } : {}}
              onClick={() => handleSlotClick(slot)}
              className={`
                aspect-square flex items-center justify-center rounded-md border
                ${slot.isOccupied ? "bg-gray-800 border-gray-700 cursor-not-alloed" : "bg-transparent border-gray-700 cursor-pointer hover:border-gray-500"}
                ${slot.isSuggested && !slot.isSelected ? "border-primary border-dashed animate-pulse" : ""}
                ${slot.isSelected ? "bg-primary border-primary" : ""}
              `}
            >
              <div className="text-center">
                <div className="text-xs font-medium">{slot.id}</div>
                {slot.isOccupied && <Car className="h-4 w-4 mx-auto mt-1" />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Exit */}
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="px-4">
            Exit
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default ParkingMap
