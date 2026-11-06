import { test } from "node:test";
import assert from "node:assert/strict";
import { draftSchema } from "../requirements/schema";
import { engineInputsFromRequirements } from "./fromRequirements";
import { priceQuote } from "./engine";
import { DEFAULT_PRICING } from "./defaults";

const opts = { margin: 0.2, partner: "Recommended" as const, termMonths: 12 };
const q = (value: number) => ({ value, notSure: false });

/** Portal answers equivalent to the sheet's sample Quote Builder inputs. */
export function sampleDraft() {
  return draftSchema.parse({
    answers: {
      services: {
        storageTier: "SSD",
        objectStorageGb: q(1000),
        publicIps: q(2),
        internetSites: q(1),
        bandwidthMbps: q(100),
        vpn: q(1),
        firewalls: q(1),
        loadBalancers: q(1),
        monitoring: q(1),
        standby: "No",
      },
    },
    servers: {
      linux: [{ id: "a", vcpu: 4, ramGib: 8, bootGib: 50, disks: [150], os: "Ubuntu", role: "Other", roleOther: "Web portal", backup: "Yes", replication: "None" }],
    },
  });
}

test("sheet-sample-equivalent answers price exactly like the sheet", () => {
  const d = sampleDraft();
  const { inputs, assumptions } = engineInputsFromRequirements(d.answers, d.servers, opts);
  assert.deepEqual(assumptions, []);
  assert.deepEqual(inputs.servers, [
    { role: "Web portal", os: "Linux", qty: 1, vcpu: 4, ramGb: 8, ssdGb: 200, hddGb: 0, backup: true, replication: "None", assumed: [] },
  ]);
  const r = priceQuote(inputs, DEFAULT_PRICING, 1400);
  assert.equal(r.quote.subtotal, 384136.2);
  assert.equal(r.quote.monthlyTotal, 412946.42);
  assert.equal(r.quote.termTotal, 4955356.98);
});

test("identical servers are grouped; physical Windows servers use cores; HDD and mixed tiers split disks", () => {
  const d = sampleDraft();
  d.answers.services.storageTier = "Mixed";
  d.servers.linux.push({ ...d.servers.linux[0], id: "b" });
  d.servers.physical.push({ ...d.servers.linux[0], id: "c", os: "Win Server 2022 Std Edition", role: "DB", vcpu: 16, ramGib: 64 });
  const { inputs } = engineInputsFromRequirements(d.answers, d.servers, opts);
  assert.equal(inputs.servers.length, 2);
  assert.equal(inputs.servers[0].qty, 2);
  assert.equal(inputs.servers[0].ssdGb, 50);
  assert.equal(inputs.servers[0].hddGb, 150);
  assert.equal(inputs.servers[1].os, "Windows");
  assert.equal(inputs.servers[1].vcpu, 16);
});

test("Not sure answers use defaults and are flagged; DR use case defaults to Active-passive", () => {
  const d = sampleDraft();
  d.answers.useCase.useCases = ["dr"];
  d.answers.services.vpn = { value: null, notSure: true };
  d.answers.services.storageTier = "Not sure";
  d.servers.linux[0].replication = "";
  d.servers.linux[0].backup = "";
  const { inputs, assumptions } = engineInputsFromRequirements(d.answers, d.servers, opts);
  assert.equal(inputs.vpn, 1);
  assert.equal(inputs.assumed?.vpn, "VPN appliances assumed");
  assert.equal(inputs.servers[0].replication, "Active-passive");
  assert.equal(inputs.servers[0].backup, true);
  assert.ok(assumptions.length >= 3);
  const r = priceQuote(inputs, DEFAULT_PRICING, 1400);
  assert.ok(r.quote.lines.find((l) => l.key === "vpn")?.assumed);
  assert.ok(r.quote.lines.find((l) => l.key === "compute")?.assumed?.includes("replication assumed"));
});
