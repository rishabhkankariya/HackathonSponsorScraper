import { z } from 'zod';

export const SponsorSchema = z.object({
  hackathon_url: z.string().url(),
  hackathon_name: z.string().optional(),
  location: z.string().optional(),
  sponsor_name: z.string(),
  sponsor_type: z.enum(['text', 'logo']),
  category: z.string().optional(),
  source: z.string(),
  logo_url: z.string().url().optional(),
  logo_alt: z.string().optional(),
  timestamp: z.string(),
});

export type Sponsor = z.infer<typeof SponsorSchema>;
