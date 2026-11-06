import { z } from "zod";

/* Shared (client + server) types and zod schemas for the requirements portal. */

export const SERVER_KINDS = ["linux", "windows", "physical"] as const;
export type ServerKind = (typeof SERVER_KINDS)[number];

const str = (max = 500) => z.string().max(max).default("");
const longStr = (max = 5000) => z.string().max(max).default("");
const num = z.number().finite().nonnegative().max(1_000_000).nullable().default(null);
const strList = (maxItems = 50, max = 300) => z.array(z.string().max(max)).max(maxItems).default([]);

export const dataSizeSchema = z
  .object({
    value: num,
    unit: z.enum(["GB", "TB"]).default("GB"),
    notSure: z.boolean().default(false),
  })
  .default({ value: null, unit: "GB", notSure: false });
export type DataSize = z.infer<typeof dataSizeSchema>;

export const answersSchema = z.object({
  contact: z
    .object({
      customerName: str(200),
      customerAddress: longStr(1000),
      contactName: str(200),
      contactEmail: str(254),
      contactPhone: str(50),
      date: str(20),
    })
    .default({
      customerName: "",
      customerAddress: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      date: "",
    }),
  objectives: z
    .object({
      requirement: str(200),
      requirementOther: longStr(2000),
      challenges: strList(8, 1000),
      successCriteria: longStr(4000),
    })
    .default({ requirement: "", requirementOther: "", challenges: [], successCriteria: "" }),
  useCase: z
    .object({
      useCases: strList(4, 40),
      multiSiteMode: str(40),
      managedDrYears: num,
    })
    .default({ useCases: [], multiSiteMode: "", managedDrYears: null }),
  source: z
    .object({
      description: longStr(4000),
      platforms: strList(),
      platformOther: str(300),
      clouds: strList(),
      cloudOther: str(300),
      applications: strList(),
      applicationsOther: longStr(2000),
      weekdayStart: str(5),
      weekdayEnd: str(5),
      weekendStart: str(5),
      weekendEnd: str(5),
      windowNotSure: z.boolean().default(false),
      afterHours: str(20),
      bandwidthMbps: num,
      bandwidthNotSure: z.boolean().default(false),
      vmwareDataSize: dataSizeSchema,
      nonVmwareDataSize: dataSizeSchema,
    })
    .default({
      description: "",
      platforms: [],
      platformOther: "",
      clouds: [],
      cloudOther: "",
      applications: [],
      applicationsOther: "",
      weekdayStart: "",
      weekdayEnd: "",
      weekendStart: "",
      weekendEnd: "",
      windowNotSure: false,
      afterHours: "",
      bandwidthMbps: null,
      bandwidthNotSure: false,
      vmwareDataSize: { value: null, unit: "GB", notSure: false },
      nonVmwareDataSize: { value: null, unit: "GB", notSure: false },
    }),
  target: z
    .object({
      description: longStr(4000),
      bandwidthMbps: num,
      bandwidthNotSure: z.boolean().default(false),
      hosting: str(200),
      dataCentre: str(200),
      networkConnectivity: str(200),
      bareMetal: str(40),
      storageNewExisting: str(100),
      storagePersonality: strList(4, 40),
      mediaType: str(40),
      mediaTypeOther: str(200),
      dataResiliency: str(40),
      newOrMigrate: str(200),
    })
    .default({
      description: "",
      bandwidthMbps: null,
      bandwidthNotSure: false,
      hosting: "",
      dataCentre: "",
      networkConnectivity: "",
      bareMetal: "",
      storageNewExisting: "",
      storagePersonality: [],
      mediaType: "",
      mediaTypeOther: "",
      dataResiliency: "",
      newOrMigrate: "",
    }),
  inventory: z
    .object({
      sendSeparately: z.boolean().default(false),
      notes: longStr(4000),
    })
    .default({ sendSeparately: false, notes: "" }),
});
export type Answers = z.infer<typeof answersSchema>;

export const serverSchema = z.object({
  id: z.string().max(64),
  vcpu: num,
  ramGib: num,
  bootGib: num,
  os: str(120),
  osOther: str(120),
  osVersion: str(120),
  osType: str(40),
  publicIps: num,
  kernel: str(200),
  hostname: str(253),
  role: str(80),
  roleOther: str(200),
  hypervisor: str(80),
  hypervisorOther: str(200),
  drProtect: str(40),
  fstab: longStr(20000),
  lsblk: longStr(20000),
  disks: z.array(z.number().finite().nonnegative().max(1_000_000)).max(64).default([]),
});
export type ServerRow = z.infer<typeof serverSchema>;

export const MAX_SERVERS_PER_KIND = 2000;

export const serversSchema = z
  .object({
    linux: z.array(serverSchema).max(MAX_SERVERS_PER_KIND).default([]),
    windows: z.array(serverSchema).max(MAX_SERVERS_PER_KIND).default([]),
    physical: z.array(serverSchema).max(MAX_SERVERS_PER_KIND).default([]),
  })
  .default({ linux: [], windows: [], physical: [] });
export type Servers = z.infer<typeof serversSchema>;

export const draftSchema = z.object({
  answers: answersSchema,
  currentStep: z.number().int().min(0).max(5).default(0),
  servers: serversSchema,
});
export type Draft = z.infer<typeof draftSchema>;

export const tokenSchema = z
  .string()
  .regex(/^(demo|[A-Za-z0-9_-]{16,128})$/, "Invalid link");

export function emptyAnswers(): Answers {
  return answersSchema.parse({});
}

export function emptyServers(): Servers {
  return serversSchema.parse({});
}

export function newServerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyServer(): ServerRow {
  return serverSchema.parse({ id: newServerId() });
}

/** Project details safe to show the client (internal team fields are never included). */
export type PublicProject = {
  customerName: string;
  projectName: string;
  customerAddress: string;
  salesContactName: string;
  salesContactEmail: string;
  salesContactPhone: string;
};

export type PortalStatus = "invited" | "in_progress" | "submitted" | "reviewed";

export type PortalPayload = {
  mode: "live" | "demo";
  token: string;
  project: PublicProject;
  status: PortalStatus;
  expired: boolean;
  submittedAt: string | null;
  updatedAt: string | null;
  draft: Draft | null;
};
