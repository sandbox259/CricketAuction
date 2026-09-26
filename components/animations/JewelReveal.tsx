"use client"

import type { CSSProperties } from "react"
import { Gem } from "lucide-react"

interface JewelRevealProps {
  durationMs?: number
}

export default function JewelReveal({
  durationMs = 3000,
}: JewelRevealProps) {
  const stars = Array.from({ length: 34 })
  const duration = `${durationMs}ms`

  return (
    <div
      className="absolute inset-0"
      style={{ "--highlight-duration": duration } as CSSProperties}
    >
      <div className="absolute inset-0 animate-jewel-glow" />

      {/* Golden curtain of stars */}
      <div className="absolute inset-x-0 top-0 h-full">
        {stars.map((_, i) => (
          <span
            key={i}
            className="absolute text-yellow-400 animate-star-curtain"
            style={{
              left: `${(i * 37) % 101}%`,
              top: `-${10 + (i % 5) * 8}px`,
              fontSize: `${10 + (i % 4) * 4}px`,
              animationDelay: `${(i % 10) * 65}ms`,
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Soft golden shimmer */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-yellow-300/20 via-yellow-200/5 to-transparent" />

      {/* Center label during animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="animate-category-pop rounded-full border border-yellow-300/50 bg-yellow-50/90 px-5 py-2 shadow-lg backdrop-blur-sm"
          >
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-black tracking-[0.3em] text-yellow-700">
              JEWEL
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes jewel-star-curtain {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.4) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          55% {
            opacity: 1;
            transform: translateY(190px) scale(1) rotate(120deg);
          }
          100% {
            opacity: 0;
            transform: translateY(330px) scale(0.6) rotate(240deg);
          }
        }

        @keyframes jewel-glow {
          0% {
            opacity: 0;
            background: radial-gradient(
              circle at center,
              rgba(250, 204, 21, 0.25),
              transparent 65%
            );
          }
          15% {
            opacity: 1;
          }
          45% {
            opacity: 0.65;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes jewel-category-pop {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }
          15% {
            opacity: 1;
            transform: scale(1.08);
          }
          35% {
            transform: scale(1);
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.08);
          }
        }

        .animate-star-curtain {
          animation: jewel-star-curtain var(--highlight-duration) ease-out
            forwards;
        }

        .animate-jewel-glow {
          animation: jewel-glow var(--highlight-duration) ease-out forwards;
        }

        .animate-category-pop {
          animation: jewel-category-pop var(--highlight-duration) ease-out
            forwards;
        }
      `}</style>
    </div>
  )
}
