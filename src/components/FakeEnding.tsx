import { useState } from "react";
import { fakeEndingText } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface FakeEndingProps {
  onContinue: () => void;
}

export default function FakeEnding({ onContinue }: FakeEndingProps) {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const endingPhotos = fakeEndingText.images.length
    ? fakeEndingText.images
    : [fakeEndingText.cakeImage];
  const currentPhoto = endingPhotos[activePhoto] ?? endingPhotos[0];

  return (
    <div className="screen fake-ending-screen">
      <div className="title-block compact">
        <p className="eyebrow">Almost Done</p>
        <h1>{fakeEndingText.title}</h1>
      </div>

      <div className="ending-photo-set">
        <PlaceholderImage
          className="ending-main-photo"
          src={currentPhoto.src}
          alt={currentPhoto.alt}
          label={currentPhoto.label}
        />

        <div className="ending-photo-strip" aria-label="最后一页照片集">
          {endingPhotos.map((photo, index) => (
            <button
              className={`ending-thumb-button ${index === activePhoto ? "is-active" : ""}`}
              key={photo.src}
              type="button"
              onClick={() => setActivePhoto(index)}
              aria-label={`查看照片 ${index + 1}`}
            >
              <PlaceholderImage
                className="ending-thumb-photo"
                src={photo.src}
                alt={photo.alt}
                label={`${index + 1}`}
              />
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
