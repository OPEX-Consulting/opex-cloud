"use client";

import { useState } from "react";
import Link from "next/link";

const SERVICES = [
  {
    id: "compute",
    number: "01",
    category: "Infrastructure",
    title: "Cloud compute",
    shortDescription:
      "Run business applications on virtual machines with resources suited to your workloads.",
    description:
      "Deploy the workloads your organisation depends on, from business applications and internal systems to development environments. Plan your compute resources around your application's requirements and operational needs.",
    capabilities: [
      "Virtual machine infrastructure",
      "Snapshots and recovery points",
      "Key-pair access management",
      "Workload scaling options",
    ],
    useCases: ["ERP and business applications", "Development and testing"],
    icon: "compute",
  },
  {
    id: "networking",
    number: "02",
    category: "Connectivity",
    title: "Private networking",
    shortDescription:
      "Connect and organise cloud workloads within a virtual private network.",
    description:
      "Structure how your cloud resources communicate. Virtual private cloud networking gives you a foundation for organising workloads, separating network environments and configuring access between resources.",
    capabilities: [
      "Virtual private clouds and subnets",
      "Route tables and network interfaces",
      "Security group configuration",
      "Network segmentation",
    ],
    useCases: ["Multi-tier applications", "Private business systems"],
    icon: "network",
  },
  {
    id: "storage",
    number: "03",
    category: "Data",
    title: "Storage & protection",
    shortDescription:
      "Choose storage options and plan how important workload data is protected.",
    description:
      "Different workloads have different storage requirements. Consider how application data is stored, how snapshots fit into your recovery strategy and what protection your organisation needs.",
    capabilities: [
      "Block storage",
      "File and object storage options",
      "Snapshots and recovery planning",
      "Backup and data protection options",
    ],
    useCases: ["Business data and documents", "Disaster recovery planning"],
    icon: "storage",
  },
  {
    id: "monitoring",
    number: "04",
    category: "Operations",
    title: "Monitoring & availability",
    shortDescription:
      "Improve visibility into infrastructure performance and operational issues.",
    description:
      "Understand how your infrastructure behaves over time. Monitoring, alerting and load-balancing capabilities can help your team observe workloads, investigate issues and plan for operational continuity.",
    capabilities: [
      "Infrastructure metrics",
      "Monitoring and alerting",
      "Load-balancing capabilities",
      "Operational visibility",
    ],
    useCases: ["Customer-facing applications", "Business-critical workloads"],
    icon: "monitoring",
  },
  {
    id: "managed",
    number: "05",
    category: "Expertise",
    title: "Cloud guidance & migration",
    shortDescription:
      "Get practical guidance on architecture, workload migration and deployment.",
    description:
      "Moving to cloud starts with understanding what you already run and what your organisation needs next. Discuss your current infrastructure, migration requirements and deployment approach with the Opex Cloud team.",
    capabilities: [
      "Cloud architecture discussions",
      "Workload and infrastructure assessment",
      "Migration planning",
      "Deployment guidance",
    ],
    useCases: ["Moving existing applications", "Planning a cloud adoption"],
    icon: "managed",
  },
] as const;

type ServiceIconName = (typeof SERVICES)[number]["icon"];

function ServiceIcon({ name }: { name: ServiceIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "compute":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="4" y="4" width="16" height="6" rx="1.5" />
          <rect x="4" y="14" width="16" height="6" rx="1.5" />
          <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
        </svg>
      );

    case "network":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="9" y="3" width="6" height="5" rx="1.2" />
          <rect x="3" y="16" width="6" height="5" rx="1.2" />
          <rect x="15" y="16" width="6" height="5" rx="1.2" />
          <path d="M12 8v4M6 16v-4h12v4" />
        </svg>
      );

    case "storage":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <ellipse cx="12" cy="5" rx="7.5" ry="3" />
          <path d="M4.5 5v14c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V5" />
          <path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
        </svg>
      );

    case "monitoring":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M7 13h2l2-5 3 7 2-4h1" />
          <path d="M9 21h6M12 17v4" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3 20 6v5.5c0 4.3-3.2 7.7-8 9.5-4.8-1.8-8-5.2-8-9.5V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <path
        d="m4.5 10 3.2 3.2L15.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Service() {
  const [activeService, setActiveService] = useState(0);
  const selectedService = SERVICES[activeService];

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % SERVICES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + SERVICES.length) % SERVICES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SERVICES.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveService(nextIndex);

    document.getElementById(`service-tab-${SERVICES[nextIndex].id}`)?.focus();
  }

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="service-section relative overflow-hidden bg-white py-24 text-[#07152f] sm:py-28 lg:py-32"
    >
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section introduction */}
        <div className="service-intro grid gap-8 lg:grid-cols-[1.1fr_0.7fr] lg:items-end">
          <div>
            <h2
              id="services-heading"
              className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-6xl"
            >
              The infrastructure
              <span className="block text-[#3977e8]">
                behind your next move.
              </span>
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-xl text-base leading-7 text-[#52647e] sm:text-lg sm:leading-8">
              From virtual machines and private networking to storage,
              monitoring and migration guidance, explore the cloud capabilities
              available to support your workloads.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#dce6f6] bg-[#f7f9fd] px-3.5 py-2 text-xs font-semibold text-[#344966]">
                Virtual Private Cloud
              </span>
              <span className="rounded-full border border-[#dce6f6] bg-[#f7f9fd] px-3.5 py-2 text-xs font-semibold text-[#344966]">
                Pay-as-you-go
              </span>
              <span className="rounded-full border border-[#dce6f6] bg-[#f7f9fd] px-3.5 py-2 text-xs font-semibold text-[#344966]">
                Naira billing
              </span>
            </div>
          </div>
        </div>

        {/* Interactive services */}
        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          {/* Service selector */}
          <div
            className="service-list grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1"
            role="tablist"
            aria-label="Cloud services"
            aria-orientation="vertical"
          >
            {SERVICES.map((service, index) => {
              const isActive = activeService === index;

              return (
                <button
                  key={service.id}
                  id={`service-tab-${service.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`service-panel-${service.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveService(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`service-tab group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition duration-300 sm:p-5 ${
                    isActive
                      ? "border-[#cbd9f1] bg-white shadow-[0_12px_35px_rgba(7,21,47,0.07)]"
                      : "border-transparent bg-white hover:border-[#dce5f3] hover:bg-[#fbfcff]"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-[#e8efff] text-[#2862cb]"
                        : "bg-[#edf1f7] text-[#65758e] group-hover:bg-[#e8efff] group-hover:text-[#2862cb]"
                    }`}
                  >
                    <span className="h-5 w-5">
                      <ServiceIcon name={service.icon} />
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#8290a5]">
                      {service.number} / {service.category}
                    </span>

                    <span className="block text-base font-semibold tracking-[-0.025em] text-[#07152f] sm:text-[17px]">
                      {service.title}
                    </span>

                    <span className="mt-1.5 block text-sm leading-6 text-[#68778d]">
                      {service.shortDescription}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`mt-1 hidden h-2 w-2 shrink-0 rounded-full lg:block ${
                      isActive ? "bg-[#3977e8]" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected service details */}
          <div
            key={selectedService.id}
            id={`service-panel-${selectedService.id}`}
            role="tabpanel"
            aria-labelledby={`service-tab-${selectedService.id}`}
            tabIndex={0}
            className="service-detail relative flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-[#e0e7f1] bg-white p-7 shadow-[0_20px_70px_rgba(7,21,47,0.05)] sm:p-10 lg:p-12"
          >
            {/* Decorative rings */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#e5edfa]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border border-[#e5edfa]"
            />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e2eaf7] bg-[#f7f9fd] px-3 py-2 text-xs font-semibold text-[#536783]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3977e8]" />
                {selectedService.category}
              </span>

              <span className="text-sm font-semibold tabular-nums text-[#a0acbd]">
                {selectedService.number} / 05
              </span>
            </div>

            <div className="relative z-10 mt-9 max-w-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#07152f] text-[#a9c8ff] shadow-[0_8px_24px_rgba(7,21,47,0.16)]">
                <span className="h-7 w-7">
                  <ServiceIcon name={selectedService.icon} />
                </span>
              </div>

              <h3 className="text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
                {selectedService.title}
              </h3>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#617189] sm:text-lg sm:leading-8">
                {selectedService.description}
              </p>
            </div>

            {/* Capabilities */}
            <div className="relative z-10 mt-8 border-t border-[#e9eef5] pt-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#8b98aa]">
                Service capabilities
              </p>

              <ul className="grid gap-3 sm:grid-cols-2">
                {selectedService.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex items-start gap-3 text-sm leading-6 text-[#344761]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff] text-[#2862cb]">
                      <CheckIcon />
                    </span>
                    {capability}
                  </li>
                ))}
              </ul>
            </div>

            {/* Relevant use cases */}
            <div className="relative z-10 mt-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8b98aa]">
                Example workloads
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedService.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    className="rounded-lg border border-[#e4eaf3] bg-[#fbfcff] px-3 py-2 text-xs font-medium text-[#536783]"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-9">
              <Link
                href="/onboarding"
                className="service-cta inline-flex min-h-12 items-center justify-center rounded-full bg-[#07152f] px-6 py-3 text-sm font-semibold !text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2"
              >
                Discuss your requirements
              </Link>
            </div>
          </div>
        </div>

        {/* Use-case strip */}
        <div className="mt-14">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3977e8]">
              Built around real workloads
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Cloud for the work your organisation does.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#68778d] sm:text-base">
              Explore infrastructure options for business systems, digital
              services and workloads that need a considered deployment plan.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Business applications",
                description:
                  "Run ERP platforms, internal tools and operational systems.",
                icon: "01",
              },
              {
                title: "Education platforms",
                description:
                  "Support student portals and digital learning services.",
                icon: "02",
              },
              {
                title: "Financial workloads",
                description:
                  "Discuss infrastructure requirements for financial systems.",
                icon: "03",
              },
              {
                title: "Backup and recovery",
                description:
                  "Plan for data protection and recovery requirements.",
                icon: "04",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e3e9f2] bg-[#fbfcff] p-5 transition duration-300 hover:border-[#cbd9f1] hover:bg-white"
              >
                <span className="text-xs font-bold tracking-[0.14em] text-[#3977e8]">
                  {item.icon}
                </span>
                <h4 className="mt-5 text-base font-semibold tracking-[-0.02em]">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#68778d]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="service-bottom mt-10 flex flex-col gap-6 rounded-2xl border border-[#dce5f1] bg-[#f7f9fd] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8efff] text-[#2862cb]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  d="M12 3v18M3 12h18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-semibold tracking-[-0.02em]">
                Not sure what your workload needs?
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#697990]">
                Tell us what you're building, what you're running today and what
                you need from your infrastructure. We can discuss the options
                that fit your requirements.
              </p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#07152f] px-5 py-3 text-sm font-semibold !text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2"
          >
            Talk to a cloud expert
          </Link>
        </div>
      </div>

      <style jsx>{`
        .service-tab:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: 3px;
        }

        .service-detail {
          animation: detailReveal 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        .service-cta {
          box-shadow: 0 8px 22px rgb(7 21 47 / 12%);
        }

        .service-cta:hover {
          box-shadow: 0 12px 28px rgb(7 21 47 / 20%);
        }

        @keyframes detailReveal {
          from {
            opacity: 0.6;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 639px) {
          .service-section {
            padding-top: 5rem;
            padding-bottom: 5rem;
          }

          .service-detail {
            min-height: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .service-detail {
            animation: none;
          }

          .service-tab,
          .service-cta {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
