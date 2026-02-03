import React, { useState } from 'react';
import { EmergenceContext } from '../emergenceFlow';

interface EmotionCheckInProps {
  onCheckIn: (context: EmergenceContext, notes: string) => void;
  initialContext?: EmergenceContext;
}

export const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({ onCheckIn, initialContext }) => {
  const [valence, setValence] = useState(initialContext?.valence || 0);
  const [persistence, setPersistence] = useState(initialContext?.persistence || 0.5);
  const [grounding, setGrounding] = useState(initialContext?.grounding || 0.5);
  const [clarity, setClarity] = useState(initialContext?.clarity || 0.5);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn({ valence, persistence, grounding, clarity }, notes);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-900 text-white max-w-md">
      <h2 className="text-xl font-bold mb-4">Vessel Calibration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Valence Slider */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Valence (Mood): {valence.toFixed(2)}</label>
          <input 
            type="range" 
            min="-1" 
            max="1" 
            step="0.1" 
            value={valence} 
            onChange={(e) => setValence(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
        </div>

        {/* Persistence Slider */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Persistence (Duration): {persistence.toFixed(2)}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={persistence} 
            onChange={(e) => setPersistence(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Grounding Slider */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Grounding (Stability): {grounding.toFixed(2)}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={grounding} 
            onChange={(e) => setGrounding(parseFloat(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>

        {/* Clarity Slider */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Clarity (Focus): {clarity.toFixed(2)}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={clarity} 
            onChange={(e) => setClarity(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
        </div>

        {/* Notes Input */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Resonance Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
            rows={3}
            placeholder="Describe the current vector state..."
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors"
        >
          Synchronize Vector
        </button>
      </form>
    </div>
  );
};
