import { useState } from "react";
import type { FinalGiftText } from "../data";
import { playGiftOpenSound } from "../sound";
import PlaceholderImage from "./PlaceholderImage";

interface FinalRevealProps {
  text: FinalGiftText;
  onRestart: () => void;
}

const secretConfetti = Array.from({ length: 18 }, (_, index) => index + 1);

function FinalMedia({
  item,
}: {
  item: FinalGiftText["cakeImage"] | FinalGiftText["finalPhoto"];
}) {
  if ("type" in item && item.type === "video") {
    return (
      <video
        className="soft-image final-photo final-video"
        src={item.src}
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
      className="final-photo"
      src={item.src}
      alt={item.alt}
      label={item.label}
    />
  );
}

export default function FinalReveal({ text, onRestart }: FinalRevealProps) {
  const [secretOpen, setSecretOpen] = useState(false);
  const openSecret = () => {
    if (!secretOpen) {
      playGiftOpenSound("black");
    }
    setSecretOpen(true);
  };

  return (
    <div className="screen final-screen">
      <div className="title-block compact">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </div>

      <button
        className="secret-prize-button"
        type="button"
        onClick={openSecret}
        aria-label={text.secretAriaLabel}
      >
        <span>{text.secretButtonText}</span>
        <small>{text.secretButtonSubText}</small>
      </button>

      <div className="final-content">
        <p className="final-next">{text.nextLine}</p>

        <div className="final-photo-grid">
          <FinalMedia item={text.cakeImage} />
          <FinalMedia item={text.finalPhoto} />
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

      {secretOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-modal secret-prize-modal">
            <span className="secret-prize-confetti" aria-hidden="true">
              {secretConfetti.map((piece) => (
                <span className={`confetti-piece c${piece}`} key={piece} />
              ))}
            </span>
            <h2>{text.secretTitle}</h2>
            <strong>{text.secretName}</strong>
            <p>{text.secretDescription}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => setSecretOpen(false)}
            >
              {text.secretCloseText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
