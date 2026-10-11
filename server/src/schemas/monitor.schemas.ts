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

