import { useState } from "react";
import type { FinalGiftText } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface FinalRevealProps {
  text: FinalGiftText;
  onRestart: () => void;
}

export default function FinalReveal({ text, onRestart }: FinalRevealProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className="screen final-screen">
      <div className="title-block compact">
        <p className="eyebrow">Final Gift</p>
        <h1>{opened ? text.titleAfterOpen : text.titleBeforeOpen}</h1>
        <p>{opened ? text.item : text.openHint}</p>
      </div>

      <button
        className={`black-gift-button ${opened ? "is-open" : ""}`}
        type="button"
        onClick={() => setOpened(true)}
        aria-label="打开最终礼盒"
      >
        <span className="gift-shadow" />
        <span className="gift-glow" />
        <span className="gift-lid" />
        <span className="gift-body" />
        <span className="gift-band vertical" />
        <span className="gift-band horizontal" />
        <span className="gift-ribbon" />
        <span className="gift-bow left" />
        <span className="gift-bow right" />
        <span className="gift-shine" />
      </button>

      {opened && (
        <div className="final-content">
          <p className="gift-item dark">{text.item}</p>
          <PlaceholderImage
            className="final-gift-image"
            src={text.giftImage.src}
            alt={text.giftImage.alt}
            label={text.giftImage.label}
          />
          <p className="final-next">{text.nextLine}</p>

          <div className="final-photo-grid">
            <PlaceholderImage
              className="final-photo"
              src={text.cakeImage.src}
              alt={text.cakeImage.alt}
              label={text.cakeImage.label}
            />
            <PlaceholderImage
              className="final-photo"
              src={text.finalPhoto.src}
              alt={text.finalPhoto.alt}
              label={text.finalPhoto.label}
            />
          </div>

          <div className="blessing-card">
            {text.blessing.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <button className="primary-button" type="button" onClick={onRestart}>
            {text.restartText}
          </button>
        </div>
      )}
    </div>
  );
}
