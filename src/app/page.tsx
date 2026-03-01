import { PartyForm } from '@/components/party-form';
import { PartyPopper } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
             <PartyPopper className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Welcome to <span className="text-primary">PartyConnect</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base md:text-lg">
            The easiest way to plan your party and chat with guests. Get started by creating your event below.
          </p>
        </div>
        <PartyForm />
      </div>
    </main>
  );
}
