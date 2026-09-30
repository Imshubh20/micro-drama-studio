"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EpisodesRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/series/${id}`);
    } else {
      router.replace("/");
    }
  }, [id, router]);

  return (
    <div className="mx-auto max-w-7xl py-14 text-center">
      <div className="skeleton h-48 rounded-xl" />
    </div>
  );
}
