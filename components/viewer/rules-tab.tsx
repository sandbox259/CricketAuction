"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const rules = [
  {
    id: 1,
    src: "https://media.cmscallumni.in/rules/rule-1.webp",
    alt: "Auction Rules - Page 1",
  },
  {
    id: 2,
    src: "https://media.cmscallumni.in/rules/rule-2.webp",
    alt: "Auction Rules - Page 2",
  },
  {
    id: 3,
    src: "https://media.cmscallumni.in/rules/rule-3.webp",
    alt: "Auction Rules - Page 3",
  },
  {
    id: 4,
    src: "https://media.cmscallumni.in/rules/rule-4.webp",
    alt: "Auction Rules - Page 4",
  },
]

export default function RulesTab() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentRule = rules[currentIndex]

  const previousRule = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? rules.length - 1 : prev - 1
    )
  }

  const nextRule = () => {
    setCurrentIndex((prev) =>
      prev === rules.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Heading */}
      {/* <div className="flex items-center justify-center gap-2">
        <FileText className="h-5 w-5 text-amber-600" />

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Auction Rules
          </h2>

          <p className="text-xs text-gray-500">
            Please read the rules before the auction begins
          </p>
        </div>
      </div> */}

      {/* Poster Carousel */}
      <Card className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <div className="relative flex items-center justify-center">
            {/* Previous Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={previousRule}
              aria-label="Previous rule"
              className="
                absolute
                left-1
                top-1/2
                z-10
                h-10
                w-10
                -translate-y-1/2
                rounded-full
                border-amber-200
                bg-white/95
                shadow-md
                hover:bg-amber-50
                sm:left-3
              "
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>

            {/* Poster */}
            <div className="flex w-full justify-center">
              <img
                key={currentRule.id}
                src={currentRule.src}
                alt={currentRule.alt}
                className="
                  max-h-[calc(100vh-260px)]
                  w-auto
                  max-w-full
                  rounded-lg
                  object-contain
                  shadow-sm
                  transition-opacity
                  duration-300
                "
              />
            </div>

            {/* Next Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={nextRule}
              aria-label="Next rule"
              className="
                absolute
                right-1
                top-1/2
                z-10
                h-10
                w-10
                -translate-y-1/2
                rounded-full
                border-amber-200
                bg-white/95
                shadow-md
                hover:bg-amber-50
                sm:right-3
              "
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
          </div>

          {/* Page indicator */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={previousRule}
              className="
                rounded-lg
                border
                border-gray-200
                px-3
                py-1.5
                text-xs
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >
              Previous
            </button>

            <div className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {currentIndex + 1} / {rules.length}
            </div>

            <button
              type="button"
              onClick={nextRule}
              className="
                rounded-lg
                border
                border-gray-200
                px-3
                py-1.5
                text-xs
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >
              Next
            </button>
          </div>

          {/* Dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            {rules.map((rule, index) => (
              <button
                key={rule.id}
                type="button"
                aria-label={`Go to rule ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    currentIndex === index
                      ? "w-6 bg-amber-500"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }
                `}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}