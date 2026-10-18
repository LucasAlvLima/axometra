import { BrandLogo } from "@/components/brand/brand-logo";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-12">
      <div className="text-center">
        <h1>
          <BrandLogo variant="stacked" />
        </h1>

        <p className="mt-6 text-sm text-muted">
          Train. Measure. Evolve.
        </p>
      </div>
    </main>
  );
}
