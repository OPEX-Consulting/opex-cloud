/**
 * Option lists for the OPEX Cloud requirements portal.
 *
 * Source: Google Sheet "Opex_Cloud_Data_Gathering_Questionnaire"
 * (tabs "Sheet1" and "Z"), updated after review:
 *  - OS lists gain Windows Server 2025, Rocky Linux and AlmaLinux; CentOS is flagged end of life.
 *  - Hypervisors drop Stratoscale Symphony and Zadara zCompute and gain VMware 8.x, Proxmox and Other.
 *  - Bandwidth is a number in Mbps (the sheet's "MB" dropdown is retired).
 *  - The global "Region" list is dropped (all hosting is in Nigeria).
 */

export const NOT_SURE = "Not sure";
export const OTHER = "Other";

export type Option = {
  value: string;
  label?: string;
  hint?: string;
  flag?: string;
};

export type OptionGroup = { group: string; options: Option[] };

/* ---------- Step 2: objectives (Sheet1 "Requirement") ---------- */

export const REQUIREMENT_OPTIONS: Option[] = [
  {
    value: "Migration from on-premises to a secure cloud location",
    hint: "Move your workloads to OPEX Cloud once.",
  },
  {
    value: "Migration along with DRaaS to a secure cloud location",
    hint: "Move workloads and keep them protected with Disaster Recovery as a Service.",
  },
  { value: OTHER, label: "Something else", hint: "Describe it in your own words." },
];

/* ---------- Step 3: use case ---------- */

export const USE_CASES = [
  {
    value: "migration",
    title: "Migration",
    subtitle: "One-time replication from source to target",
    hint: "Your servers are copied to OPEX Cloud once, then you switch over.",
  },
  {
    value: "dr",
    title: "Disaster Recovery",
    subtitle: "Continuous replication from source to target",
    hint: "Changes are copied continuously so you can fail over if your main site goes down.",
  },
  {
    value: "multisite_dr",
    title: "Multi-site DR",
    subtitle: "One source replicated to two targets (parallel or cascaded)",
    hint: "Parallel: source copies to both targets. Cascaded: source copies to target A, which copies on to target B.",
  },
  {
    value: "managed_dr",
    title: "Managed Disaster Recovery",
    subtitle: "OPEX Cloud runs and tests your DR for a contract term",
    hint: "We look after replication, monitoring and DR testing for the number of years you choose.",
  },
] as const;

export type UseCaseValue = (typeof USE_CASES)[number]["value"];

export const MULTISITE_MODES: Option[] = [
  { value: "Parallel", hint: "Source replicates to both targets at the same time." },
  { value: "Cascaded", hint: "Source replicates to target A, which replicates on to target B." },
  { value: NOT_SURE },
];

/* ---------- Step 3: source (Sheet1 "Source Site", "Cloud", "Applications") ---------- */

export const SOURCE_PLATFORMS: Option[] = [
  { value: "VMware vSphere / ESXi" },
  { value: "Microsoft Hyper-V" },
  { value: "Citrix XenServer" },
  { value: "OpenStack / KVM" },
  { value: "Proxmox VE" },
  { value: "Nutanix AHV (Acropolis)" },
  { value: "Red Hat Virtualization (RHEV)" },
  { value: "Oracle VM" },
  { value: "Physical Windows servers" },
  { value: "Physical Linux servers" },
  { value: OTHER },
  { value: NOT_SURE },
];

export const SOURCE_CLOUDS: Option[] = [
  { value: "AWS" },
  { value: "Microsoft Azure" },
  { value: "Google Cloud (GCP)" },
  { value: "Alibaba Cloud" },
  { value: "Oracle Cloud" },
  { value: "Other private cloud" },
  { value: "None – on-premises only" },
  { value: NOT_SURE },
];

export const APPLICATIONS: Option[] = [
  { value: "Databases", hint: "Oracle, MS SQL, Exchange, SAP, etc." },
  { value: "Web servers", hint: "Apache, NGINX, IIS" },
  { value: "Custom applications", hint: "In-house or bespoke software" },
  { value: "Email", hint: "Exchange, Zimbra, etc." },
  { value: "File servers", hint: "SMB/NFS shares, document stores" },
  { value: OTHER },
];

export const YES_NO_NOT_SURE: Option[] = [
  { value: "Yes" },
  { value: "No" },
  { value: NOT_SURE },
];

/* ---------- Step 4: target & hosting (sheet tab "Z") ---------- */

export const HOSTING_MODELS: Option[] = [
  {
    value: "Public cloud at an OPEX Cloud data centre in Nigeria",
    hint: "Shared, secure OPEX Cloud infrastructure in a Nigerian data centre.",
  },
  {
    value: "Private cloud at the customer's site",
    hint: "Dedicated OPEX Cloud stack installed in your own facility.",
  },
  {
    value: "Private cloud at an OPEX Cloud data centre in Nigeria",
    hint: "Dedicated infrastructure for you, hosted in an OPEX Cloud data centre.",
  },
  { value: NOT_SURE },
];

export const PUBLIC_CLOUD_HOSTING = HOSTING_MODELS[0].value;
export const isOpexDcHosting = (v: string) => v.includes("OPEX Cloud data centre");

/**
 * TODO(opex): fill in the confirmed OPEX Cloud data-centre sites.
 * Left empty on purpose: the site list was not provided and must not be invented.
 * While empty, the data-centre question is not shown to clients.
 */
export const OPEX_DATA_CENTRES: string[] = [];

export const NETWORK_CONNECTIVITY: Option[] = [
  { value: "OPEX Cloud-provided internet 100 Mbps (unmetered)" },
  { value: "OPEX Cloud-provided internet 200 Mbps (unmetered)" },
  { value: "OPEX Cloud-provided internet 1,000 Mbps (unmetered)" },
  { value: "OPEX Cloud-provided internet 10,000 Mbps (unmetered)" },
  { value: "Customer-provided SD-WAN connection" },
  { value: NOT_SURE },
];

export const BARE_METAL: Option[] = [
  { value: "Yes", label: "Yes – customer server, GPU, firewall/WAF/VPN or router" },
  { value: "No" },
  { value: NOT_SURE },
];

export const STORAGE_NEW_EXISTING: Option[] = [
  { value: "Use existing OPEX Cloud storage" },
  { value: "Include new OPEX Cloud storage" },
  { value: NOT_SURE },
];

export const STORAGE_PERSONALITY: Option[] = [
  { value: "Block", hint: "Disks attached to servers – most VMs and databases." },
  { value: "File", hint: "Shared folders (NFS/SMB)." },
  { value: "Object", hint: "S3-style buckets for backups, media and archives." },
  { value: NOT_SURE },
];

export const MEDIA_TYPES: Option[] = [
  { value: "SSD" },
  { value: "Tiered" },
  { value: "Hybrid" },
  { value: "HDD" },
  { value: OTHER },
  { value: NOT_SURE },
];

export const DATA_RESILIENCY: Option[] = [
  { value: "RAID 0" },
  { value: "RAID 1/10" },
  { value: "RAID 5/6" },
  { value: "RAID other" },
  { value: "EC 2+1" },
  { value: "EC 4+2" },
  { value: "EC 6+3" },
  { value: "EC 9+3" },
  { value: "EC 6+2" },
  { value: "EC 8+2" },
  { value: "EC other" },
  { value: NOT_SURE },
];

export const NEW_OR_MIGRATE: Option[] = [
  { value: "New environment" },
  { value: "Migrate from VMware ESXi 5.x" },
  { value: "Migrate from VMware ESXi 6.x" },
  { value: "Migrate from VMware ESXi 7.x" },
  { value: "Migrate from VMware ESXi 8.x" },
  { value: "Migrate from AWS" },
  { value: "Migrate from Azure" },
  { value: "Migrate from GCP" },
  { value: "Migrate from Oracle Cloud" },
  { value: "Migrate from IBM Cloud" },
  { value: "Migrate from Hyper-V on Windows Server 2012" },
  { value: "Migrate from Hyper-V on Windows Server 2016" },
  { value: "Migrate from Hyper-V on Windows Server 2019" },
  { value: "Migrate from Hyper-V on Windows Server 2022" },
  { value: "Migrate from Nutanix Acropolis" },
  { value: "Migrate from Citrix XenServer" },
  { value: "Migrate from Red Hat RHEV" },
  { value: "Migrate from Proxmox" },
  { value: "Migrate from other KVM" },
  { value: "Migrate from another cloud platform" },
  { value: NOT_SURE },
];

/* ---------- Step 5: server inventory (sheet tab "Z") ---------- */

export const SERVER_ROLES: Option[] = [
  { value: "Host for VMs" },
  { value: "Host for Storage" },
  { value: "HyperConverged" },
  { value: "Web", hint: "Apache, NGINX, IIS" },
  { value: "App", hint: "ERP, HRIS, MQIS, SharePoint, WebLogic, Tomcat, WebSphere, JBoss, Tibco" },
  {
    value: "DB",
    hint: "MS SQL, MySQL, MariaDB, PostgreSQL, Oracle DB, SQLite, MongoDB, Ingres, Firebird, Hadoop, Amazon RDS",
  },
  {
    value: "Storage",
    hint: "Block/file volumes, object storage, Samba, NFS, FTP, Swift, OpenFiler, vSAN, Windows DFS, Storage Spaces",
  },
  { value: "VDI", hint: "Citrix, Microsoft, Parallels, V2" },
  { value: "VNF/Appliance", hint: "F5, ASAv, vMX, WANos, Steelhead" },
  { value: "OVF Appliance", hint: "LAMP, Drupal, WordPress, DomainC, Zimbra, OTRS, Fog, Moodle" },
  { value: "Net Service", hint: "DNS, IAM, LDAP, SSO, MFA, NTP" },
  { value: "Email", hint: "Exchange, Axigen, Zimbra" },
  { value: "Monitoring", hint: "SNMP, Syslog, SIEM, OpsView" },
  { value: "AI/ML", hint: "Splunk, TensorFlow, ELK, Torch" },
  { value: "Proxy", hint: "Squid, SMTP gateway" },
  { value: "Domain Ctl", label: "Domain controller", hint: "Active Directory controller" },
  { value: OTHER },
  { value: NOT_SURE },
];

export const WINDOWS_OS: Option[] = [
  { value: "Win Server 2012 Std Edition", flag: "end of support" },
  { value: "Win Server 2012 DC Edition", flag: "end of support" },
  { value: "Win Server 2016 Std Edition" },
  { value: "Win Server 2016 DC Edition" },
  { value: "Win Server 2019 Std Edition" },
  { value: "Win Server 2019 DC Edition" },
  { value: "Win Server 2022 Std Edition" },
  { value: "Win Server 2022 DC Edition" },
  { value: "Win Server 2025 Std Edition" },
  { value: "Win Server 2025 DC Edition" },
  { value: "Windows (other)" },
  { value: NOT_SURE },
];

export const LINUX_OS: Option[] = [
  { value: "Ubuntu" },
  { value: "Debian" },
  { value: "RHEL", label: "Red Hat Enterprise Linux (RHEL)" },
  { value: "Rocky Linux" },
  { value: "AlmaLinux" },
  { value: "CentOS", flag: "end of life" },
  { value: "Oracle Linux" },
  { value: "Fedora" },
  { value: "OpenSUSE" },
  { value: "Mandriva" },
  { value: "Linux (other)" },
  { value: NOT_SURE },
];

/** Bare-metal host operating systems / hypervisors (sheet "Z" OS list, updated). */
export const HOST_OS: Option[] = [
  { value: "ESXi", hint: "VMware" },
  { value: "Hyper-V", hint: "Microsoft" },
  { value: "XenServer", hint: "Citrix" },
  { value: "Oracle VM", hint: "Oracle" },
  { value: "KVM" },
  { value: "Proxmox VE" },
  { value: "Acropolis", hint: "Nutanix" },
  { value: "RHEV", hint: "Red Hat" },
  { value: "vSAN", hint: "VMware" },
  { value: "Storage Spaces", hint: "Microsoft" },
  { value: "DOS" },
];

export const PHYSICAL_OS_GROUPS: OptionGroup[] = [
  { group: "Windows", options: WINDOWS_OS.filter((o) => o.value !== NOT_SURE) },
  { group: "Linux", options: LINUX_OS.filter((o) => o.value !== NOT_SURE) },
  { group: "Hypervisor / host OS", options: HOST_OS },
  { group: "Other", options: [{ value: OTHER }, { value: NOT_SURE }] },
];

export const OS_TYPES: Option[] = [
  { value: "x86" },
  { value: "x64" },
  { value: "DOS" },
  { value: "GPU", flag: "special hardware" },
  { value: "ARM", flag: "special hardware" },
  { value: NOT_SURE },
];

export const DR_PROTECT: Option[] = [
  { value: "Prod site", hint: "Runs at the production site only" },
  { value: "DR site", hint: "Runs at the DR site only" },
  { value: "Both", hint: "Protected at both sites" },
  { value: "AutoScale" },
  { value: NOT_SURE },
];

export const HYPERVISORS: Option[] = [
  { value: "(none)" },
  { value: "VMware 5.x", hint: "VMware" },
  { value: "VMware 6.x", hint: "VMware" },
  { value: "VMware 7.x", hint: "VMware" },
  { value: "VMware 8.x", hint: "VMware" },
  { value: "Hyper-V on WS 2012", hint: "Microsoft" },
  { value: "Hyper-V on WS 2016", hint: "Microsoft" },
  { value: "Hyper-V on WS 2019", hint: "Microsoft" },
  { value: "Hyper-V on WS 2022", hint: "Microsoft" },
  { value: "Hyper-V on WS 2025", hint: "Microsoft" },
  { value: "XenServer", hint: "Citrix" },
  { value: "Oracle VM", hint: "Oracle" },
  { value: "Proxmox" },
  { value: "Other KVM" },
  { value: "Acropolis", hint: "Nutanix" },
  { value: "RHEV", hint: "Red Hat" },
  { value: OTHER },
  { value: NOT_SURE },
];

export const optionLabel = (o: Option) =>
  `${o.label ?? o.value}${o.flag ? ` (${o.flag})` : ""}`;

/* ---------- Pricing questions (Phase 2: requirements to invoice) ---------- */

export const STORAGE_TIERS: Option[] = [
  { value: "SSD", label: "SSD / NVMe for all disks", hint: "Fastest. Best for databases and busy applications." },
  { value: "HDD", label: "HDD for all disks", hint: "Lower cost. Suits archives, file shares and backups." },
  { value: "Mixed", label: "SSD for boot disks, HDD for data disks", hint: "A balance of speed and cost." },
  { value: NOT_SURE },
];

export const BACKUP_OPTIONS: Option[] = [{ value: "Yes" }, { value: "No" }];

export const REPLICATION_OPTIONS: Option[] = [
  { value: "None", hint: "No copy at a second site." },
  { value: "Active-passive", hint: "A standby copy at a second site that takes over if the main site fails." },
  { value: "Active-active", hint: "Both sites run live and share the load." },
  { value: NOT_SURE },
];

export const STANDBY_OPTIONS: Option[] = [
  { value: "Yes", hint: "Reserve matching compute and storage at the secondary site for replicated servers." },
  { value: "No", hint: "Replication only. Standby capacity is arranged later if needed." },
  { value: NOT_SURE },
];

/** Use cases that imply replication to a second site. */
export const DR_USE_CASES = ["dr", "multisite_dr", "managed_dr"];
