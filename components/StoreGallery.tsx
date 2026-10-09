import { FunctionComponent } from "react";
import { StoreGalleryImage } from "../server/domain/types";

export type StoreGalleryProps = {
  images: StoreGalleryImage[];
  title?: string;
};

const Tile = ({ image, className = "" }: { image: StoreGalleryImage; className?: string }) => (
  <div className={`group relative rounded-2xl overflow-hidden bg-gray-100 ${className}`}>
    <img
      src={image.imageUrl}
      alt={image.caption ?? ""}
      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />
    {image.caption && (
      <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm max-w-[80%]">
        <p className="text-sm font-bold text-gray-900 leading-snug">{image.caption}</p>
      </div>
    )}
  </div>
);

const StoreGallery: FunctionComponent<StoreGalleryProps> = ({ images, title }) => {
  if (images.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-0">
        {title && (
          <h2
            className="font-bold text-gray-900 mb-6"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
          >
            {title}
          </h2>
        )}
        {images.length === 1 && (
          <Tile image={images[0]} className="h-80 sm:h-[28rem]" />
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image) => (
              <Tile key={image.id} image={image} className="h-64 sm:h-96" />
            ))}
          </div>
        )}

        {images.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:h-[28rem]">
            <Tile image={images[0]} className="h-64 sm:h-full" />
            <div className="grid grid-rows-2 gap-4 h-full">
              <Tile image={images[1]} className="h-64 sm:h-full" />
              <Tile image={images[2]} className="h-64 sm:h-full" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreGallery;
