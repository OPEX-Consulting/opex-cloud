import type { Metadata } from "next";
import Image from "next/image";
import { loadPortal } from "@/lib/requirements/server";
import { tokenSchema, type PortalPayload } from "@/lib/requirements/schema";
import Portal from "../_components/Portal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Requirements questionnaire",
  description: "OPEX Cloud solution design & sizing questionnaire.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-opex-navy">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4 sm:px-6">
          <Image src="/images/opexwhite.webp" alt="OPEX Cloud" width={132} height={42} priority className="h-7 w-auto object-contain" />
        </div>
      </header>
      <main className="mx-auto max-w-xl flex-1 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-opex-navy">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-secondary">{body}</p>
      </main>
    </div>
  );
}

export default async function RequirementsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!tokenSchema.safeParse(token).success) {
    return (
      <Message
        title="We couldn't find this questionnaire"
        body="Please check the link in your email, or ask your OPEX Cloud contact to send it again."
      />
    );
  }

  let payload: PortalPayload | null = null;
  try {
    payload = await loadPortal(token);
  } catch (error) {
    console.error("[requirements] page load failed", error);
    return (
      <Message
        title="We're having trouble loading your questionnaire"
        body="This is on our side and your saved answers are safe. Please refresh in a few minutes, or contact your OPEX Cloud team."
      />
    );
  }

  if (!payload) {
    return (
      <Message
        title="We couldn't find this questionnaire"
        body="Please check the link in your email, or ask your OPEX Cloud contact to send it again."
      />
    );
  }

  return <Portal payload={payload} />;
}
