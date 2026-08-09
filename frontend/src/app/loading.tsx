import { BrandedLoader } from "@/components/site/branded-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <BrandedLoader />
    </div>
  );
}
