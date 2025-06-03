"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Car, CheckCircle, Info } from "lucide-react"
import jsQR from "jsqr"

export default function QRCodeScanner() {
  const { toast } = useToast()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setIsScanning(true)
          scanQRCode()
        }
      } catch (err) {
        console.error("Error accessing webcam:", err)
        setError("Failed to access webcam. Please ensure camera permissions are granted.")
        toast({
          title: "Error",
          description: "Unable to access webcam. Please check permissions.",
          variant: "destructive",
        })
      }
    }

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return

      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (!context) return

      const scan = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight
          canvas.width = video.videoWidth
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            const scannedUrl = code.data
            setScannedData(scannedUrl)
            setIsScanning(false)

            // Validate if the scanned data is a URL
            try {
              new URL(scannedUrl)
              toast({
                title: "QR Code Detected",
                description: `Redirecting to: ${scannedUrl}`,
              })
              router.push(scannedUrl)
            } catch (e) {
              toast({
                title: "Invalid QR Code",
                description: "The scanned QR code does not contain a valid URL.",
                variant: "destructive",
              })
              setError("Invalid URL in QR code.")
            }
            return
          }
        }
        if (isScanning) {
          requestAnimationFrame(scan)
        }
      }
      requestAnimationFrame(scan)
    }

    if (isScanning) {
      startScanner()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isScanning, toast, router])

  const handleStartScanning = () => {
    setScannedData(null)
    setError(null)
    setIsScanning(true)
  }

  const handleStopScanning = () => {
    setIsScanning(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
            <h1 className="text-xl font-bold">Parksense</h1>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Exit QR Code Scanner</CardTitle>
              <CardDescription>Scan a QR code to exit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="p-4 border border-gray-800 rounded-lg">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="p-4 border border-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Webcam Feed</h3>
                  </div>
                  <div className="relative flex justify-center">
                    <video
                      ref={videoRef}
                      className="w-full max-w-md rounded-lg"
                      style={{ display: isScanning ? "block" : "none" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  {scannedData && (
                    <div className="mt-4 p-4 border border-gray-800 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Scanned Result</h3>
                      <p className="text-lg font-medium">{scannedData}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isScanning ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleStopScanning}
                >
                  <Camera className="mr-2 h-4 w-4" /> Stop Scanning
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleStartScanning}
                  disabled={!!error}
                >
                  <Camera className="mr-2 h-4 w-4" /> Start Scanning
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Instructions Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to Scan
              </CardTitle>
              <CardDescription>Tips for a successful QR code scan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>Ensure your camera is clean and has good lighting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>Position the QR code within the camera frame.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>Hold steady until the scan is complete.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>Grant camera permissions in your browser settings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>Access the site via HTTPS or http://localhost for local testing.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 Parksense. All rights reserved.</p>
          <p className="mt-1">
            Need help? Contact us at{' '}
            <a href="mailto:support@parksense.com" className="text-blue-400 hover:underline">
              support@parksense.com
            </a>
          </p>
          <p className="mt-1">
            Parksense - Smart Parking Solutions for a Seamless Experience
          </p>
        </div>
      </footer>
    </div>
  )
}