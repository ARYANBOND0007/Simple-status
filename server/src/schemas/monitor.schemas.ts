import { z } from "zod";

export const createMonitorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  url: z.string().url("Invalid URL"),

  intervalSeconds: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(120),
    z.literal(180),
    z.literal(300),
  ]),
});
export const updateMonitorSchema = z.object({
  name: z.string().trim().min(1).optional(),
  url: z.string().url().optional(),
  intervalSeconds: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(120),
    z.literal(180),
    z.literal(300),
  ]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

