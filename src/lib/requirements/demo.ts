import type { PublicProject } from "./schema";

/** Fake project used when Supabase is not configured, or for the token "demo". Saves to localStorage only. */
export const DEMO_PROJECT: PublicProject = {
  customerName: "Demo Client Ltd",
  projectName: "Demo migration & DR sizing",
  customerAddress: "1 Example Street, Victoria Island, Lagos",
  salesContactName: "Your OPEX Cloud contact",
  salesContactEmail: "sales@opexcloud.example",
  salesContactPhone: "+234 000 000 0000",
};
