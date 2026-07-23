"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — redirects to Big Bull Wind Energy. */
export default function NaturalGasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/energy-technologies/wind");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm" style={{ color: "#6b7c85" }}>
        Redirecting to Wind Energy…
      </p>
    </main>
  );
}
