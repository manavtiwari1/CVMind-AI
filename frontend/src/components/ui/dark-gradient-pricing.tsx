import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-emerald-500 text-sm text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full bg-red-100 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">
          <X className="size-3" strokeWidth={3} />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-700 font-medium">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
  onClick?: () => void
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
  onClick,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ filter: "blur(2px)", y: 10, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.15 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border transition-all duration-300",
          "dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900/40 dark:to-zinc-950/70",
          "border-zinc-200/80 bg-white/70 backdrop-blur-md",
          "p-6 flex flex-col justify-between rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1",
          tier === "Pro" ? "border-purple-500/35 ring-1 ring-purple-500/20" : "",
          className,
        )}
      >
        <div>
          {tier === "Pro" && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase py-1 px-3 rounded-bl-xl shadow-sm">
              Most Popular
            </div>
          )}
          <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-800 border-zinc-200/80">
            <span className="mb-4 inline-block font-semibold text-xs tracking-wider uppercase dark:text-zinc-400 text-zinc-500">
              {tier}
            </span>
            <span className="mb-2 inline-block text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {price}
            </span>
            <span className="text-xs font-semibold dark:bg-gradient-to-br dark:from-zinc-300 dark:to-zinc-500 bg-gradient-to-br from-zinc-600 to-zinc-800 bg-clip-text text-center text-transparent">
              {bestFor}
            </span>
          </div>
          <div className="space-y-4 py-8">
            {benefits.map((benefit, index) => (
              <Benefit key={index} {...benefit} />
            ))}
          </div>
        </div>
        <Button
          className={cn(
            "w-full py-2.5 rounded-xl font-bold transition-all shadow-sm",
            tier === "Pro"
              ? "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-500/10"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
          )}
          variant={tier === "Pro" ? "default" : "ghost"}
          onClick={onClick}
        >
          {CTA}
        </Button>
      </Card>
    </motion.div>
  )
}
