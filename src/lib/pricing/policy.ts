/**
 * [PLACEHOLDER] Pricing policy for answers the client left blank or marked "Not sure".
 *
 * The invoice is priced on these defaults and each affected line is flagged "assumed" so the client and the OPEX team
 * can see what to confirm. Every value below is a placeholder business decision for OPEX Cloud to confirm or change.
 */
export const ASSUMPTION_DEFAULTS = {
  /** Server rows missing CPU / RAM / boot disk. */
  vcpu: 2, // [PLACEHOLDER]
  ramGb: 4, // [PLACEHOLDER]
  bootGb: 50, // [PLACEHOLDER]
  /** Managed backup when not answered: price it (safer than under-quoting). */
  backup: true, // [PLACEHOLDER]
  /** Replication when not answered: Active-passive if a DR use case was chosen, otherwise None. */
  replicationWithDr: "Active-passive" as const, // [PLACEHOLDER]
  replicationWithoutDr: "None" as const, // [PLACEHOLDER]
  /** Storage tier when not answered: SSD for everything. */
  storageTier: "SSD" as const, // [PLACEHOLDER]
  /** Object storage GB when "Not sure": this much if "Object" storage was ticked in step 4, otherwise none. */
  objectGbIfObjectTicked: 500, // [PLACEHOLDER]
  objectGbOtherwise: 0, // [PLACEHOLDER]
  /** Static public IPs when "Not sure": the sum of the per-server public IPs, or at least this many. */
  minPublicIps: 1, // [PLACEHOLDER]
  internetSites: 1, // [PLACEHOLDER]
  /** Bandwidth when "Not sure": the "network connectivity" choice from step 4 if it names a speed, else this. */
  bandwidthMbps: 100, // [PLACEHOLDER]
  vpn: 1, // [PLACEHOLDER]
  firewalls: 1, // [PLACEHOLDER]
  loadBalancers: 0, // [PLACEHOLDER]
  monitoring: 1, // [PLACEHOLDER]
  standby: false, // [PLACEHOLDER]
};
