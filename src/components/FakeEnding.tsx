import { useState } from "react";
import { assetPath } from "../assetPath";
import { fakeEndingText, type GiftImage } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface FakeEndingProps {
  onContinue: () => void;
}

function EndingMedia({
  item,
  className,
}: {
  item: GiftImage;
  className: string;
}) {
  if (item.type === "video") {
    const orientationClass =
      item.orientation === "flip-y" ? "is-flipped-y" : "";

    return (
      <video
        className={`soft-image ${className} ending-video ${orientationClass}`}
        src={assetPath(item.src)}
        aria-label={item.alt}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <PlaceholderImage
      className={className}
      src={item.src}
      alt={item.alt}
      label={item.label}
    />
  );
}

export default function FakeEnding({ onContinue }: FakeEndingProps) {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const endingPhotos = fakeEndingText.images.length
    ? fakeEndingText.images
    : [fakeEndingText.cakeImage];
  const currentPhoto = endingPhotos[activePhoto] ?? endingPhotos[0];
  const hasMultiplePhotos = endingPhotos.length > 1;

  const previousPhoto = () => {
    setActivePhoto((index) =>
      index === 0 ? endingPhotos.length - 1 : index - 1,
    );
  };

  const nextPhoto = () => {
    setActivePhoto((index) =>
      index === endingPhotos.length - 1 ? 0 : index + 1,
    );
  };

  return (
    <div className="screen fake-ending-screen">
      <div className="title-block compact">
        <p className="eyebrow">Almost Done</p>
        <h1>{fakeEndingText.title}</h1>
      </div>

      <div className="ending-photo-set">
        <div className="ending-main-frame">
          <EndingMedia item={currentPhoto} className="ending-main-photo" />
          {hasMultiplePhotos && (
            <>
              <button
                className="ending-photo-nav ending-photo-prev"
                type="button"
                onClick={previousPhoto}
                aria-label="上一张照片"
              >
                ‹
              </button>
              <button
                className="ending-photo-nav ending-photo-next"
                type="button"
                onClick={nextPhoto}
                aria-label="下一张照片"
              >
                ›
              </button>
              <span className="ending-photo-count">
                {activePhoto + 1}/{endingPhotos.length}
              </span>
            </>
          )}
        </div>

        <div className="ending-photo-strip" aria-label="最后一页照片集">
          {endingPhotos.map((photo, index) => (
            <button
              className={`ending-thumb-button ${index === activePhoto ? "is-active" : ""}`}
              key={photo.src}
              type="button"
              onClick={() => setActivePhoto(index)}
              aria-label={`查看照片 ${index + 1}`}
            >
              <EndingMedia item={photo} className="ending-thumb-photo" />
            </button>
          ))}
        </div>
      </div>

      <div className="ending-copy">
        <h2>{fakeEndingText.birthday}</h2>
        <p>{fakeEndingText.wish}</p>
      </div>

      <button className="primary-button" type="button" onClick={() => setOpen(true)}>
        {fakeEndingText.button}
      </button>

      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <h2>{fakeEndingText.modalTitle}</h2>
            <div className="modal-actions">
              {fakeEndingText.modalButtons.map((button) => (
                <button
                  className="primary-button"
                  key={button}
                  type="button"
                  onClick={onContinue}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
