"use client"

import type { CSSProperties } from "react"
import { Medal } from "lucide-react"

interface TreasureRevealProps {
  durationMs?: number
}

export default function TreasureReveal({
  durationMs = 3000,
}: TreasureRevealProps) {
  const stars = Array.from({ length: 34 })
  const duration = `${durationMs}ms`

  return (
    <div
      className="absolute inset-0"
      style={{ "--highlight-duration": duration } as CSSProperties}
    >
      <div className="absolute inset-0 animate-treasure-glow" />

      {/* Silver curtain of stars */}
      <div className="absolute inset-x-0 top-0 h-full">
        {stars.map((_, i) => (
          <span
            key={i}
            className="absolute text-slate-300 animate-treasure-star-curtain"
            style={{
              left: `${(i * 43) % 101}%`,
              top: `-${10 + (i % 5) * 8}px`,
              fontSize: `${10 + (i % 4) * 4}px`,
              animationDelay: `${(i % 10) * 70}ms`,
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Silver metallic sweep */}
      <div
        className="absolute inset-y-0 -left-1/3 w-1/3 animate-silver-sweep bg-gradient-to-r from-transparent via-white/50 to-transparent blur-md"
      />

      {/* Center label during animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="animate-treasure-category-pop rounded-full border border-slate-300/60 bg-slate-50/90 px-5 py-2 shadow-lg backdrop-blur-sm"
          >
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-black tracking-[0.3em] text-slate-600">
              TREASURE
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes treasure-star-curtain {
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

        @keyframes treasure-glow {
          0% {
            opacity: 0;
            background: radial-gradient(
              circle at center,
              rgba(148, 163, 184, 0.25),
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

        @keyframes treasure-category-pop {
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

        @keyframes treasure-silver-sweep {
          0% {
            left: -40%;
          }
          100% {
            left: 140%;
          }
        }

        .animate-treasure-star-curtain {
          animation: treasure-star-curtain var(--highlight-duration) ease-out
            forwards;
        }

        .animate-treasure-glow {
          animation: treasure-glow var(--highlight-duration) ease-out forwards;
        }

        .animate-treasure-category-pop {
          animation: treasure-category-pop var(--highlight-duration) ease-out
            forwards;
        }

        .animate-silver-sweep {
          animation: treasure-silver-sweep var(--highlight-duration)
            cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
