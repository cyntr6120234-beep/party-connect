import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
        <Skeleton className="w-full h-full" />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                 <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading Chat...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
