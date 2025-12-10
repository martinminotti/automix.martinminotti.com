import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  valueDisplay?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          {label && <span>{label}</span>}
          {valueDisplay && <span>{valueDisplay}</span>}
        </div>
        <input
          type="range"
          className={cn(
            "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
