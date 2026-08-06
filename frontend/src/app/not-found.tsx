import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/2 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="container text-center">
        <Compass className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 font-display text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 font-display text-2xl font-semibold">This page wandered off</p>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/"><Home className="h-4 w-4" /> Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
