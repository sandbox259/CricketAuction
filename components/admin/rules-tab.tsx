"use client"

import Image from "next/image"

const rules = [
  {
    id: 1,
    src: "https://media.cmscallumni.in/rules/rule-1.webp",
    alt: "Cricket Auction Rules 1",
  },
  {
    id: 2,
    src: "https://media.cmscallumni.in/rules/rule-2.webp",
    alt: "Cricket Auction Rules 2",
  },
  {
    id: 3,
    src: "https://media.cmscallumni.in/rules/rule-3.webp",
    alt: "Cricket Auction Rules 3",
  },
  {
    id: 4,
    src: "https://media.cmscallumni.in/rules/rule-4.webp",
    alt: "Cricket Auction Rules 4",
  },
]

export default function RulesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Auction Rules
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review the official auction rules and guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-sm
              transition
              hover:shadow-md
            "
          >
            <Image
              src={rule.src}
              alt={rule.alt}
              width={520}
              height={789}
              className="w-full h-auto"
              priority={rule.id === 1}
            />
          </div>
        ))}
      </div>
    </div>
  )
}