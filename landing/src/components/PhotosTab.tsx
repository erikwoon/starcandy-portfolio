import type { Photo } from '../types';

type PhotosTabProps = {
  photos: Photo[];
  onOpenPhoto: (id: string) => void;
};

function PhotosTab({ photos, onOpenPhoto }: PhotosTabProps) {
  return (
    <section
      className="panel"
      id="panel-photos"
      role="tabpanel"
      aria-labelledby="tab-photos"
    >
      <div className="gallery">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="gallery__item reveal"
            onClick={() => onOpenPhoto(photo.id)}
            aria-label={`View photo${
              photo.exif?.date ? ` from ${photo.exif.date}` : ''
            } full-size`}
          >
            <img src={photo.thumb} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default PhotosTab;
