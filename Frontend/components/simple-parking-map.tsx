"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Car } from 'lucide-react'

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
  row: number
  column: number
  isOccupied: boolean
  isSuggested: boolean
  isSelected: boolean
  direction: "up" | "down"
}

interface SimplifiedParkingMapProps {
  suggestedSlot: string | null
  selectedSlot: string | null
  onSlotSelect: (slot: string) => void
  isAdminView?: boolean
  vehicles?: Vehicle[]
  onOccupiedSlotClick?: (vehicle: Vehicle) => void
}

const SimplifiedParkingMap = ({
  suggestedSlot,
  selectedSlot,
  onSlotSelect,
  isAdminView = false,
  vehicles = [],
  onOccupiedSlotClick,
}: SimplifiedParkingMapProps) => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([])

  // Generate parking slots
  useEffect(() => {
    const slots: ParkingSlot[] = []
    const rows = 4
    const columns = 12
    const sections = ["A", "B", "C", "D"]

    for (let row = 0; row < rows; row++) {
      const sectionIndex = Math.floor(row / 2)
      const section = sections[sectionIndex]
      const direction = row % 2 === 0 ? "down" : "up"

      for (let col = 0; col < columns; col++) {
        const slotNumber = (row % 2) * columns + col + 1
        const slotId = `${section}${slotNumber}`

        const isOccupied = vehicles.some((vehicle) => vehicle.slot === slotId)
        const isSuggested = slotId === suggestedSlot
        const isSelected = slotId === selectedSlot

        slots.push({
          id: slotId,
          row,
          column: col,
          isOccupied: isSuggested ? false : isOccupied,
          isSuggested,
          isSelected,
          direction,
        })
      }
    }

    setParkingSlots(slots)
  }, [suggestedSlot, selectedSlot, vehicles])

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.isOccupied && isAdminView && onOccupiedSlotClick) {
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

      <div className="border border-gray-800 rounded-lg p-4 bg-gray-600 overflow-auto">
        {/* Entrance */}
        <div className="mb-6 flex justify-center">
          <Badge variant="outline" className="px-4 bg-gray-800 text-white">
            Entrance
          </Badge>
        </div>

        {/* Parking Layout */}
        <div className="relative w-full" style={{ height: "600px" }}>
          {/* SVG for parking lines */}
          <svg width="100%" height="100%" className="absolute top-0 left-0">
            {/* Top driving lane */}
            <rect x="0%" y="0%" width="100%" height="7.5%" fill="#444" />
            <line x1="0%" y1="3.75%" x2="100%" y2="3.75%" stroke="white" strokeWidth="2" strokeDasharray="10,10" />

            {/* Top pair - Row 1 (facing down) */}
            <g>
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={`top-row1-vertical-${i}`}
                  x1={`${(i * 100) / 12}%`}
                  y1="7.5%"
                  x2={`${(i * 100) / 12}%`}
                  y2="22.5%"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              <line x1="0%" y1="22.5%" x2="100%" y2="22.5%" stroke="white" strokeWidth="2" />
            </g>

            {/* Top pair - Row 2 (facing up) */}
            <g>
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={`top-row2-vertical-${i}`}
                  x1={`${(i * 100) / 12}%`}
                  y1="22.5%"
                  x2={`${(i * 100) / 12}%`}
                  y2="37.5%"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Middle driving lane */}
            <rect x="0%" y="37.5%" width="100%" height="7.5%" fill="#444" />
            <line x1="0%" y1="41.25%" x2="100%" y2="41.25%" stroke="white" strokeWidth="2" strokeDasharray="10,10" />

            {/* Bottom pair - Row 3 (facing down) */}
            <g>
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={`bottom-row1-vertical-${i}`}
                  x1={`${(i * 100) / 12}%`}
                  y1="45%"
                  x2={`${(i * 100) / 12}%`}
                  y2="60%"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="white" strokeWidth="2" />
            </g>

            {/* Bottom pair - Row 4 (facing up) */}
            <g>
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={`bottom-row2-vertical-${i}`}
                  x1={`${(i * 100) / 12}%`}
                  y1="60%"
                  x2={`${(i * 100) / 12}%`}
                  y2="75%"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Bottom driving lane */}
            <rect x="0%" y="75%" width="100%" height="7.5%" fill="#444" />
            <line x1="0%" y1="78.75%" x2="100%" y2="78.75%" stroke="white" strokeWidth="2" strokeDasharray="10,10" />
          </svg>

          {/* Parking slots */}
          {parkingSlots.map((slot) => {
            const xPos = ((slot.column + 0.5) * 100) / 12
            let yPos
            if (slot.row === 0) yPos = 15
            else if (slot.row === 1) yPos = 30
            else if (slot.row === 2) yPos = 52.5
            else yPos = 67.5

            return (
              <motion.div
                key={slot.id}
                // whileHover={slot.isOccupied ? { scale: 1.05 } : {}}
                onClick={() => handleSlotClick(slot)}
                className={`
                  absolute flex items-center justify-center rounded-md
                  ${slot.isOccupied ? "bg-gray-700 cursor-pointer" : "bg-transparent cursor-not-allowed hover:bg-gray-500/30"}
                  ${slot.isSuggested && !slot.isSelected ? "border-2 border-primary border-dashed animate-pulse" : ""}
                  ${slot.isSelected ? "bg-primary/30 border-2 border-primary" : ""}
                `}
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  width: "7%",
                  height: "12%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="text-center">
                  <div className="text-xs font-medium text-white">{slot.id}</div>
                  {slot.isOccupied && (
                    <Car
                      className="h-4 w-4 mx-auto text-white"
                      style={{
                        transform: slot.direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Road labels */}
          <div className="absolute left-1/2 top-[3.75%] transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 py-1 rounded text-xs text-white">
            Driving Lane
          </div>
          <div className="absolute left-1/2 top-[41.25%] transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 py-1 rounded text-xs text-white">
            Driving Lane
          </div>
          <div className="absolute left-1/2 top-[78.75%] transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 py-1 rounded text-xs text-white">
            Driving Lane
          </div>
        </div>

        {/* Exit */}
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="px-4 bg-gray-800 text-white">
            Exit
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default SimplifiedParkingMap