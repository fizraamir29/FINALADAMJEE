'use client';
import React, { useState } from "react";
import { X } from "lucide-react";

interface SetupSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupSubmissionModal({ isOpen, onClose }: SetupSubmissionModalProps) {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full modal-scale-in space-y-4 border text-left">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="text-base font-black text-[#0a1b2d]">Submit Your Rig & Setup specs</h4>
          <button 
            onClick={() => { onClose(); setSubmitSuccess(false); }} 
            className="text-gray-400 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {submitSuccess ? (
          <div className="text-center py-6 space-y-3">
            <span className="text-4xl text-green-500">✓</span>
            <p className="text-sm text-gray-600 font-bold">Rig specifications submitted for Adamjee showcase ring!</p>
          </div>
        ) : (
          <form 
            onSubmit={e => { e.preventDefault(); setSubmitSuccess(true); }} 
            className="space-y-3.5 text-xs"
          >
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Rig Details (CPU, GPU, Cabinet, Lighting):</label>
              <input 
                type="text" 
                required 
                placeholder="Processor Ryzen 7800X3D + RTX 4080 Extreme" 
                className="w-full border rounded-xl px-3 py-2 bg-gray-50 font-semibold focus:outline-[#164475]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Your Discord or Instagram handle:</label>
              <input 
                type="text" 
                required 
                placeholder="@username" 
                className="w-full border rounded-xl px-3 py-2 bg-gray-50 font-semibold focus:outline-[#164475]"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#0a1b2d] hover:bg-[#164475] text-white py-3 rounded-xl font-bold uppercase tracking-wider transition cursor-pointer border-none"
            >
              Submit setup
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
