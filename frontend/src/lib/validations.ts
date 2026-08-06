import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  service: z.string().optional().default(""),
  budget: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const estimateFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  services: z.array(z.string()).min(1, "Select at least one service"),
  addons: z.array(z.string()).optional().default([]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type EstimateFormValues = z.infer<typeof estimateFormSchema>;
