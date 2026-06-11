import { useState } from "react";
import { fakeEndingText } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface FakeEndingProps {
  onContinue: () => void;
}

export default function FakeEnding({ onContinue }: FakeEndingProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="screen fake-ending-screen">
      <div className="title-block compact">
        <p className="eyebrow">Almost Done</p>
        <h1>{fakeEndingText.title}</h1>
      </div>

      <PlaceholderImage
        className="cake-preview"
        src={fakeEndingText.cakeImage.src}
        alt={fakeEndingText.cakeImage.alt}
        label={fakeEndingText.cakeImage.label}
      />

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
