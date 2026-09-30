"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEpisodeById } from "@/services/api";

export default function StandaloneEpisodeRedirect() {
  const router = useRouter();
  const params = useParams();
  const episodeId = params?.episodeId as string;

  useEffect(() => {
    if (!episodeId) {
      router.replace("/");
      return;
    }

    getEpisodeById(episodeId)
      .then((data) => {
        if (data?.seriesId) {
          router.replace(`/series/${data.seriesId}/episodes/${episodeId}`);
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        router.replace("/");
      });
  }, [episodeId, router]);

  return (
    <div className="mx-auto max-w-7xl py-14 text-center">
      <div className="skeleton h-48 rounded-xl" />
    </div>
  );
}
