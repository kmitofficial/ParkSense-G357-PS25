"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Car, Phone } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK

type QRResponse = {
  qrText: string
  qrImageUrl: string
}

const ParkingTips: React.FC = () => {
  const tips = [
    "Park within the lines to ensure space for others.",
    "Follow signs to your assigned parking level.",
    "Keep valuables out of sight for safety.",
    "Note your slot number for easy return.",
    "Contact support if you face any issues."
  ]

  return (
    <Card className="bg-[#1F1F1F] border-[#444444]">
      <CardHeader>
        <CardTitle className="text-white">Parking Tips</CardTitle>
        <CardDescription className="text-[#D1D1D1]">
          Make your parking experience smooth with these tips.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2 text-sm text-white">
          {tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {tip}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

const CountdownTimer: React.FC = () => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev <= 0 ? 100 : prev - 10))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#444444"
          strokeWidth="2"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#D1D1D1"
          strokeWidth="2"
          strokeDasharray={`${progress}, 100`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs text-[#D1D1D1]">
        {Math.ceil(progress / 10)}s
      </div>
    </div>
  )
}

const LatestQR: React.FC = () => {
  const [qrData, setQrData] = useState<QRResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchQr = () => {
      axios
        .get<QRResponse>(`${APP_LINK}/api/qr/generate-latest-qr`)
        .then((res) => {
          setQrData(res.data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setError('Failed to fetch QR code.')
          setLoading(false)
          toast({
            title: "Error",
            description: "Failed to fetch QR code. Please try again.",
            variant: "destructive",
          })
        })
    }

    fetchQr()
    const intervalId = setInterval(fetchQr, 1000)
    return () => clearInterval(intervalId)
  }, [toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#000000] text-[#FFFFFF]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-8 w-8 border-2 border-[#D1D1D1] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#000000] text-[#FFFFFF]">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-[#444444] p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto flex items-center gap-2"
        >
          <Car className="h-6 w-6 text-[#D1D1D1]" />
          <h1 className="text-2xl font-bold text-[#FFFFFF]">ParkSense</h1>
        </motion.div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* QR Code Section */}
          <Card className="bg-[#1F1F1F] border-[#444444] shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[#FFFFFF]">Scan to Find Your Parking Slot</CardTitle>
                  <CardDescription className="mt-1 text-[#D1D1D1]">
                    Scan the QR code to get directions to your assigned parking slot.
                  </CardDescription>
                </div>
                <CountdownTimer />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrData && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-[#FFFFFF] rounded-lg shadow-md"
                  >
                    <img
                      src={qrData.qrImageUrl}
                      alt="Parking QR Code"
                      className="w-48 h-48"
                    />
                  </motion.div>
                  <Badge variant="outline" className="mt-4 text-lg px-4 py-2 bg-[#2D2D2D] text-[#FFFFFF] border-[#444444]">
                    Slot: {qrData.qrText}
                  </Badge>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Button
                      className="mt-4 bg-[#D1D1D1] hover:bg-[#FFFFFF] text-[#000000]"
                      onClick={() => toast({
                        title: "Scan the QR Code",
                        description: "Use your phone's camera to scan the QR code above.",
                      })}
                    >
                      Scan Now
                    </Button>
                  </motion.div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Parking Tips and Instructions */}
          <div className="space-y-6">
            <ParkingTips />
            <Card className="bg-[#1F1F1F] border-[#444444]">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF]">Parking Instructions</CardTitle>
                <CardDescription className="text-[#D1D1D1]">
                  Follow these steps to reach your slot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#FFFFFF]">
                  <li>Scan the QR code with your phone’s camera.</li>
                  <li>Follow the link to view your slot details.</li>
                  <li>Use the signs to navigate to your parking level.</li>
                  <li>Park in the assigned slot shown in your QR link.</li>
                  <li>Contact support if you need assistance.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <div className="md:col-span-2">
            <Card className="bg-[#1F1F1F] border-[#444444]">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF]">Need Help?</CardTitle>
                <CardDescription className="text-[#D1D1D1]">
                  Common questions and support options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-[#FFFFFF]">What does the QR code do?</AccordionTrigger>
                    <AccordionContent className="text-[#D1D1D1]">
                      The QR code links to a page showing your assigned parking slot’s location and directions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-[#FFFFFF]">Can’t scan the QR code?</AccordionTrigger>
                    <AccordionContent className="text-[#D1D1D1]">
                      Ensure your phone’s camera is working. Alternatively, note the slot number ({qrData?.qrText || 'N/A'}) and follow the signs to your level.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-[#FFFFFF]">How do I contact support?</AccordionTrigger>
                    <AccordionContent className="text-[#D1D1D1]">
                      Call our support team at <a href="tel:+1234567890" className="text-[#FFFFFF] underline">+1 (234) 567-890</a> or email <a href="mailto:support@parksense.com" className="text-[#FFFFFF] underline">support@parksense.com</a>.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="mt-4 flex items-center gap-2 text-sm text-[#D1D1D1]">
                  <Phone className="h-4 w-4 text-[#D1D1D1]" />
                  <a href="tel:+1234567890" className="text-[#D1D1D1] underline">+1 (234) 567-890</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default LatestQR