import { PartyPageClient } from "@/components/party-page-client";
import { notFound } from "next/navigation";

type PartyPageProps = {
  params: { id: string };
};

export default async function PartyPage({ params }: PartyPageProps) {
  if (!params.id) {
    notFound();
  }

  return <PartyPageClient partyId={params.id} />;
}
