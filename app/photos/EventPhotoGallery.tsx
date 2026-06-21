"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import PhotoLightbox, { type LightboxPhoto } from "./PhotoLightbox";

interface Props {
  photos: LightboxPhoto[];
}

export default function EventPhotoGallery({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="break-inside-avoid rounded-xl overflow-hidden relative group cursor-zoom-in"
            onClick={() => setLightboxIndex(i)}
          >
            <div className="relative w-full">
              <Image
                src={`/api/photos/${photo.id}`}
                alt={photo.description || "Event photo"}
                width={600}
                height={450}
                className="w-full object-cover rounded-xl"
                unoptimized
              />
            </div>
            {/* Expand hint on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-xl flex items-center justify-center pointer-events-none">
              <Maximize2 className="w-7 h-7 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" />
            </div>
            {photo.description && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-xl pointer-events-none">
                <p className="text-white text-sm">{photo.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
