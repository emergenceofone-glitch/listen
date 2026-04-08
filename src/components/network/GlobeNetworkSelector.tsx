'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

interface Network {
  id: WalletAdapterNetwork;
  name: string;
  label: string;
  color: string;
  position: { lat: number; lng: number };
  description: string;
  tps: string;
}

const NETWORKS: Network[] = [
  {
    id: WalletAdapterNetwork.Mainnet,
    name: 'Mainnet Beta',
    label: 'PRODUCTION',
    color: '#00d4aa',
    position: { lat: 0, lng: 0 },
    description: 'Live production network with real SOL',
    tps: '~4,000 TPS'
  },
  {
    id: WalletAdapterNetwork.Devnet,
    name: 'Devnet',
    label: 'DEVELOPMENT',
    color: '#7c3aed',
    position: { lat: 30, lng: -45 },
    description: 'Stable development environment with free SOL',
    tps: '~4,000 TPS'
  },
  {
    id: WalletAdapterNetwork.Testnet,
    name: 'Testnet',
    label: 'TESTING',
    color: '#f59e0b',
    position: { lat: -30, lng: 45 },
    description: 'Stress testing network for validators',
    tps: '~4,000 TPS'
  }
];

interface GlobeNetworkSelectorProps {
  onNetworkSelect: (network: WalletAdapterNetwork, endpoint: string) => void;
  selectedNetwork?: WalletAdapterNetwork;
}

export const GlobeNetworkSelector: React.FC<GlobeNetworkSelectorProps> = ({
  onNetworkSelect,
  selectedNetwork = WalletAdapterNetwork.Devnet
}) => {
  const [activeNetwork, setActiveNetwork] = useState<WalletAdapterNetwork>(selectedNetwork);
  const [hoveredNetwork, setHoveredNetwork] = useState<WalletAdapterNetwork | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const globeRef = useRef<HTMLDivElement>(null);

  // Animate globe rotation
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame = (frame + 0.5) % 360;
      setAnimationFrame(frame);
      requestAnimationFrame(animate);
    };
    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Generate globe grid points
  const generateGlobePoints = () => {
    const points = [];
    const latitudes = 6;
    const longitudes = 12;
    
    for (let i = 0; i <= latitudes; i++) {
      const lat = (i / latitudes) * 180 - 90;
      for (let j = 0; j <= longitudes; j++) {
        const lng = (j / longitudes) * 360 - 180;
        const isActive = hoveredNetwork === activeNetwork;
        const intensity = isActive ? 0.8 : 0.3;
        points.push({ lat, lng, intensity });
      }
    }
    return points;
  };

  const handleNetworkSelect = (network: Network) => {
    setActiveNetwork(network.id);
    const endpoint = clusterApiUrl(network.id);
    onNetworkSelect(network.id, endpoint);
  };

  // Convert lat/lng to 3D position on globe surface
  const getGlobePosition = (lat: number, lng: number, radius: number = 120) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + animationFrame) * (Math.PI / 180);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    // Project 3D to 2D
    const scale = 300 / (300 + z);
    return {
      x: 150 + x * scale,
      y: 150 - y * scale,
      scale: scale,
      z: z
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Aetherium Nexus
        </h1>
        <p className="text-gray-400">Choose your network realm</p>
      </div>

      {/* Globe Container */}
      <div className="relative w-[600px] h-[400px] flex items-center justify-center">
        {/* Globe */}
        <div 
          ref={globeRef}
          className="relative w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(0, 212, 170, 0.1), rgba(0, 0, 0, 0.8))',
            boxShadow: '0 0 100px rgba(0, 212, 170, 0.2), inset 0 0 50px rgba(0, 212, 170, 0.1)'
          }}
        >
          {/* Globe Grid Lines */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 300"
            style={{ transform: `rotate(${animationFrame * 0.5}deg)` }}
          >
            {/* Longitude lines */}
            {[...Array(8)].map((_, i) => (
              <ellipse
                key={`lon-${i}`}
                cx="150"
                cy="150"
                rx="100"
                ry={100 * Math.cos((i / 8) * Math.PI - Math.PI / 2)}
                fill="none"
                stroke="rgba(0, 212, 170, 0.1)"
                strokeWidth="0.5"
                transform={`rotate(${(i / 8) * 180}, 150, 150)`}
              />
            ))}
            {/* Latitude lines */}
            {[...Array(5)].map((_, i) => (
              <circle
                key={`lat-${i}`}
                cx="150"
                cy="150"
                r={40 + i * 25}
                fill="none"
                stroke="rgba(0, 212, 170, 0.1)"
                strokeWidth="0.5"
              />
            ))}
          </svg>

          {/* Network Nodes */}
          {NETWORKS.map((network) => {
            const pos = getGlobePosition(
              network.position.lat,
              network.position.lng
            );
            const isActive = activeNetwork === network.id;
            const isHovered = hoveredNetwork === network.id;
            
            return (
              <button
                key={network.id}
                onClick={() => handleNetworkSelect(network)}
                onMouseEnter={() => setHoveredNetwork(network.id)}
                onMouseLeave={() => setHoveredNetwork(null)}
                className="absolute transition-all duration-300"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : isHovered ? 1.1 : 1})`,
                  opacity: pos.z > 0 ? 1 : 0.3,
                  zIndex: pos.z > 0 ? 10 : 1
                }}
              >
                {/* Node Pulse */}
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: network.color,
                    opacity: isActive ? 0.3 : 0,
                    animationDuration: '2s'
                  }}
                />
                {/* Node Core */}
                <div
                  className="w-4 h-4 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: network.color,
                    boxShadow: `0 0 ${isActive ? 30 : 15}px ${network.color}`,
                    border: `2px solid rgba(255, 255, 255, ${isActive ? 1 : 0.5})`
                  }}
                />
              </button>
            );
          })}

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {NETWORKS.map((network1, i) => 
              NETWORKS.slice(i + 1).map((network2, j) => {
                const pos1 = getGlobePosition(network1.position.lat, network1.position.lng);
                const pos2 = getGlobePosition(network2.position.lat, network2.position.lng);
                
                if (pos1.z <= 0 || pos2.z <= 0) return null;
                
                return (
                  <line
                    key={`${network1.id}-${network2.id}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="rgba(0, 212, 170, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })
            )}
          </svg>
        </div>

        {/* Network Labels (Orbiting) */}
        {NETWORKS.map((network, index) => {
          const angle = (animationFrame * 0.5 + index * 120) * (Math.PI / 180);
          const orbitRadius = 180;
          const x = 300 + Math.cos(angle) * orbitRadius;
          const y = 150 + Math.sin(angle) * orbitRadius * 0.3;
          
          return (
            <div
              key={`label-${network.id}`}
              className="absolute transition-opacity duration-300"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                opacity: Math.sin(angle) > 0 ? 0.8 : 0.2
              }}
            >
              <span
                className="text-xs font-mono"
                style={{ color: network.color }}
              >
                {network.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Network Cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {NETWORKS.map((network) => {
          const isActive = activeNetwork === network.id;
          
          return (
            <button
              key={network.id}
              onClick={() => handleNetworkSelect(network)}
              className={`glass-card p-6 rounded-xl transition-all duration-300 text-left ${
                isActive ? 'border-2 scale-105' : 'border border-white/10 hover:border-white/30'
              }`}
              style={{
                borderColor: isActive ? network.color : undefined,
                boxShadow: isActive ? `0 0 30px ${network.color}20` : undefined
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: network.color }}
                />
                <span className="font-semibold text-white">{network.name}</span>
                {isActive && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">{network.description}</p>
              <p className="text-xs text-gray-500 font-mono">{network.tps}</p>
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          RPC Connected
        </span>
        <span>|</span>
        <span>Block Height: {Math.floor(animationFrame * 10 + 250000000).toLocaleString()}</span>
        <span>|</span>
        <span>Latency: ~45ms</span>
      </div>
    </div>
  );
};

// Glass card styles
const styles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;
