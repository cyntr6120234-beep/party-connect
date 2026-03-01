import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { Party } from "@/lib/types";
import { PartyPageClient } from "@/components/party-page-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

type PartyPageProps = {
  params: { id: string };
};

async function getParty(id: string): Promise<Party | null> {
  if (!db) {
    console.error("Cannot get party, Firebase is not configured.");
    return null;
  }
  const docRef = doc(db, "parties", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Party;
}

export default async function PartyPage({ params }: PartyPageProps) {
  // A check to ensure Firebase config is set. This is a good practice for pages that need it.
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            You need to set up your Firebase environment variables to view party details.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const party = await getParty(params.id);

  if (!party) {
    notFound();
  }

  return <PartyPageClient initialParty={party} />;
}
