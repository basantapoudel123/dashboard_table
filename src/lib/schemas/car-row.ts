import { z } from "zod"

const bodyStyleSchema = z.enum(["sedan", "suv", "truck", "coupe"])

const year = new Date().getFullYear()

/** Full row validation (post–column normalize). */
export const carRowSchema = z.object({
  id: z.string().min(1, "Missing id."),
  model: z.string().trim().min(2, "Model must be at least 2 characters."),
  bodyStyle: bodyStyleSchema,
  modelYear: z
    .number()
    .int()
    .min(1980, "Year too low.")
    .max(year + 1, "Year too high."),
  isElectric: z.boolean(),
  inStockSince: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date."),
  dealerPhone: z
    .string()
    .regex(/^\d{10}$/, "Dealer line must be exactly 10 digits."),
  msrp: z.number().finite().positive("MSRP must be positive."),
  promoRatePct: z
    .number()
    .finite()
    .min(0, "Promo % cannot be negative.")
    .max(100, "Promo % cannot exceed 100."),
  notes: z.string(),
  certifiedPreOwned: z.boolean(),
})

export type CarRowParsed = z.infer<typeof carRowSchema>
