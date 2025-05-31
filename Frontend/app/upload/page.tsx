"use client"

import React, { useState } from 'react';
import dotenv from "dotenv";
dotenv.config();

const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK;

interface UploadResponse {
  message: string;
  qrCode: string;
  details: {
    number: string;
    imageUrl: string;
  };
}

const UploadForm: React.FC = () => {
  const [number, setNumber] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [details, setDetails] = useState<{ number: string; imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !number) {
      alert('Both fields are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('number', number);
    formData.append('image', image);

    try {
      const res = await fetch(`${APP_LINK}/api/upload/upload`, {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (res.ok) {
        setQrCode(data.qrCode);
        setDetails(data.details);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      alert('Error uploading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Number Plate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter number plate text"
          className="w-full p-2 border rounded"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload & Generate QR'}
        </button>
      </form>

      {qrCode && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-medium mb-2">QR Code:</h3>
          <img src={qrCode} alt="QR Code" className="mx-auto w-56 h-56" />
          <p className="mt-2 text-sm">
            <strong>Number:</strong> {details?.number} <br />
            <strong>Image URL:</strong> <a href={details?.imageUrl} target="_blank" rel="noreferrer">{details?.imageUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
