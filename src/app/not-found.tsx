'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
          <FileQuestion className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    </main>
  );
}
