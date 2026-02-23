import React, { useState } from 'react';
import { EmergenceContext } from '@/lib/emergence/emergenceTypes';

interface EmotionCheckInProps {
  onCheckIn: (context: Partial<EmergenceContext>, notes: string) => void;
  initialContext?: Partial<EmergenceContext>;
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
    <div className="p-6 border border-[rgba(0,240,255,0.2)] rounded-2xl bg-[rgba(10,15,20,0.8)] backdrop-blur-xl text-white max-w-md shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      <h2 className="text-xl font-semibold mb-6 neon-text-blue">Vessel Calibration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Valence Slider */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-300">Valence (Mood): <span className="text-[var(--neon-blue)]">{valence.toFixed(2)}</span></label>
          <input 
            type="range" 
            min="-1" 
            max="1" 
            step="0.01" 
            value={valence} 
            onChange={(e) => setValence(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--neon-blue)]"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
        </div>

        {/* Persistence Slider */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-300">Persistence (Duration): <span className="text-[var(--neon-purple)]">{persistence.toFixed(2)}</span></label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={persistence} 
            onChange={(e) => setPersistence(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--neon-purple)]"
          />
        </div>

        {/* Grounding Slider */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-300">Grounding (Stability): <span className="text-[var(--neon-green)]">{grounding.toFixed(2)}</span></label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={grounding} 
            onChange={(e) => setGrounding(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--neon-green)]"
          />
        </div>

        {/* Clarity Slider */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-300">Clarity (Focus): <span className="text-yellow-400">{clarity.toFixed(2)}</span></label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={clarity} 
            onChange={(e) => setClarity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        {/* Notes Input */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-300">Resonance Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl p-3 text-sm focus:border-[var(--neon-blue)] outline-none transition-all resize-none"
            rows={3}
            placeholder="Describe the current vector state..."
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] rounded-xl font-bold text-black transition-all transform active:scale-[0.98]"
        >
          Synchronize Vector
        </button>
      </form>
    </div>
  );
};
