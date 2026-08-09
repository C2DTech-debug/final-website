import { z } from "zod";

// ---------- Reusable field validators ----------

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(120, "Name must be under 120 characters")
  .regex(/^[\p{L}\d\s.'’-]+$/u, "Name may only contain letters, numbers, spaces, dots, hyphens and apostrophes");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(200, "Email must be under 200 characters");

/** A valid Indian mobile number: exactly 10 digits starting with 6–9. */
export const INDIAN_MOBILE_REGEX = /^[6-9][0-9]{9}$/;

/**
 * Returns a human-readable error for an Indian mobile field, or null when valid.
 * The field is optional, so an empty value is considered valid.
 */
export function indianMobileError(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("+")) return "Enter your 10-digit mobile number without the country code.";
  const digitsOnly = v.replace(/\D/g, "");
  if (digitsOnly.length !== 10) return "Please enter a valid 10-digit mobile number.";
  if (!INDIAN_MOBILE_REGEX.test(digitsOnly)) return "Mobile number must start with 6, 7, 8, or 9.";
  return null;
}

/** Optional Indian mobile field (empty allowed). */
export const optionalIndianMobile = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    const error = indianMobileError(val);
    if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  })
  .optional()
  .default("");

export const messageSchema = z
  .string()
  .trim()
  .min(10, "Message must be at least 10 characters")
  .max(5000, "Message must be under 5000 characters");

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(600, "URL must be under 600 characters")
  .optional()
  .default("")
  .superRefine((val, ctx) => {
    if (!val) return;
    if (!/^https?:\/\/[^\s]+\.[^\s]+/i.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid URL starting with http:// or https://" });
    }
  });

// ---------- Public form schemas ----------

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalIndianMobile,
  service: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  timeline: z.string().trim().max(80).optional().default(""),
  message: messageSchema,
});

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const estimateFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalIndianMobile,
  services: z.array(z.string().max(80)).min(1, "Select at least one service"),
  addons: z.array(z.string().max(120)).optional().default([]),
  notes: z.string().trim().max(2000, "Notes must be under 2000 characters").optional().default(""),
});

export const applyFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalIndianMobile,
  coverLetter: z.string().trim().max(5000, "Cover letter must be under 5000 characters").optional().default(""),
  linkedin: optionalUrlSchema,
  portfolio: optionalUrlSchema,
  expectedSalary: z.string().trim().max(80, "Expected salary must be under 80 characters").optional().default(""),
});

// ---------- Admin auth ----------

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(200),
});

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type EstimateFormValues = z.infer<typeof estimateFormSchema>;
export type ApplyFormValues = z.infer<typeof applyFormSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

import type { ClipboardEvent } from "react";

/**
 * Handles paste on fixed-length numeric fields (e.g. 10-digit Indian mobile,
 * 6-digit OTP). Formats the clipboard content to digits and never lets a paste
 * be silently truncated by maxLength into a different number:
 * - digits longer than the field allows: blocked, onInvalid(message) fired
 * - digits that fit: applied via apply(value) with formatting stripped
 */
export function handleNumericPaste(
  e: ClipboardEvent<HTMLInputElement>,
  maxDigits: number,
  apply: (value: string) => void,
  onInvalid: (message: string) => void,
  invalidMessage: string,
): void {
  const text = e.clipboardData.getData("text");
  if (!text) return;
  const digits = text.replace(/\D/g, "");
  if (digits.length === 0) {
    e.preventDefault();
    return;
  }
  if (digits.length > maxDigits) {
    e.preventDefault();
    onInvalid(invalidMessage);
    return;
  }
  e.preventDefault();
  apply(digits);
}
