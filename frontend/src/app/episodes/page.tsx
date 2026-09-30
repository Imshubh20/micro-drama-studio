"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EpisodesRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl py-14 text-center">
      <div className="skeleton h-48 rounded-xl" />
    </div>
  );
}
