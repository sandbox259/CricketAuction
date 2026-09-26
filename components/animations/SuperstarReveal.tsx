"use client"

import type { CSSProperties } from "react"
import { Star } from "lucide-react"

interface SuperstarRevealProps {
  durationMs?: number
}

export default function SuperstarReveal({
  durationMs = 3000,
}: SuperstarRevealProps) {
  const pieces = Array.from({ length: 42 })
  const duration = `${durationMs}ms`

  return (
    <div
      className="absolute inset-0"
      style={{ "--highlight-duration": duration } as CSSProperties}
    >
      {/* Golden flash */}
      <div className="absolute inset-0 animate-superstar-flash" />

      {/* Confetti explosion */}
      <div className="absolute left-1/2 top-1/2">
        {pieces.map((_, i) => {
          const angle = (360 / pieces.length) * i
          const distance = 100 + (i % 6) * 22

          return (
            <span
              key={i}
              className="absolute h-2.5 w-1.5 origin-center rounded-sm animate-superstar-confetti-burst"
              style={
                {
                  "--angle": `${angle}deg`,
                  "--distance": `${distance}px`,
                  "--highlight-duration": duration,
                  animationDelay: `${(i % 8) * 20}ms`,
                  background:
                    i % 4 === 0
                      ? "#facc15"
                      : i % 4 === 1
                        ? "#f59e0b"
                        : i % 4 === 2
                          ? "#fef08a"
                          : "#ffffff",
                } as CSSProperties
              }
            />
          )
        })}
      </div>

      {/* Extra star particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-yellow-400 animate-superstar-star"
            style={{
              left: `${10 + ((i * 29) % 80)}%`,
              top: `${10 + ((i * 47) % 75)}%`,
              "--highlight-duration": duration,
              animationDelay: `${(i % 6) * 80}ms`,
            } as CSSProperties}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Superstar title */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center animate-superstar-title"
        >
          <div className="flex items-center justify-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />

            <div className="text-3xl font-black tracking-[0.15em] text-yellow-500 drop-shadow-lg sm:text-4xl">
              SUPERSTAR
            </div>

            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>

          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-700">
            The Star Has Arrived
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes superstar-confetti-burst {
          0% {
            opacity: 1;
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(0)
              rotate(0deg);
          }
          55% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(var(--distance))
              rotate(220deg);
          }
        }

        @keyframes superstar-flash {
          0% {
            opacity: 0;
            background: rgba(250, 204, 21, 0);
          }
          10% {
            opacity: 1;
            background: rgba(250, 204, 21, 0.18);
          }
          28% {
            opacity: 0.65;
          }
          100% {
            opacity: 0;
            background: rgba(250, 204, 21, 0);
          }
        }

        @keyframes superstar-title {
          0% {
            opacity: 0;
            transform: scale(0.45);
          }
          15% {
            opacity: 1;
            transform: scale(1.1);
          }
          30% {
            transform: scale(1);
          }
          68% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.12);
          }
        }

        @keyframes superstar-star {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-30deg);
          }
          15% {
            opacity: 1;
            transform: scale(1.3) rotate(0deg);
          }
          45% {
            opacity: 1;
            transform: scale(1) rotate(20deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.7) rotate(90deg);
          }
        }

        .animate-superstar-confetti-burst {
          animation: superstar-confetti-burst var(--highlight-duration)
            cubic-bezier(0.15, 0.8, 0.25, 1) forwards;
        }

        .animate-superstar-flash {
          animation: superstar-flash var(--highlight-duration) ease-out forwards;
        }

        .animate-superstar-title {
          animation: superstar-title var(--highlight-duration) ease-out
            forwards;
        }

        .animate-superstar-star {
          animation: superstar-star var(--highlight-duration) ease-out forwards;
        }
      `}</style>
    </div>
  )
}
