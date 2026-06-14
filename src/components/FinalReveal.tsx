import { useEffect, useState } from "react";
import { assetPath } from "../assetPath";
import type { FinalGiftText } from "../data";
import { playGiftOpenSound } from "../sound";
import MessageBoard from "./MessageBoard";
import PlaceholderImage from "./PlaceholderImage";

interface FinalRevealProps {
  text: FinalGiftText;
  onRestart: () => void;
}

const secretConfetti = Array.from({ length: 24 }, (_, index) => index + 1);

type FinalMediaItem = FinalGiftText["finalMediaColumns"][number][number];

function FinalMedia({
  item,
}: {
  item: FinalMediaItem;
}) {
  if (item.type === "video") {
    return (
      <video
        className="soft-image final-photo final-video"
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
      className="final-photo"
      src={item.src}
      alt={item.alt}
      label={item.label}
    />
  );
}

function FinalMediaCarousel({
  items,
  columnIndex,
}: {
  items: FinalMediaItem[];
  columnIndex: number;
}) {
  const [active, setActive] = useState(0);
  const activeItem = items[active] ?? items[0];

  useEffect(() => {
    setActive(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(
      () => {
        setActive((index) => (index + 1) % items.length);
      },
      columnIndex === 0 ? 5200 : 5900,
    );

    return () => window.clearInterval(timer);
  }, [columnIndex, items.length]);

  return (
    <div className="final-carousel-frame">
      <FinalMedia item={activeItem} />
      {items.length > 1 && (
        <span className="final-carousel-dots" aria-hidden="true">
          {items.map((item, index) => (
            <span
              className={index === active ? "is-active" : ""}
              key={item.src}
            />
          ))}
        </span>
      )}
    </div>
  );
}

export default function FinalReveal({ text, onRestart }: FinalRevealProps) {
  const [secretOpen, setSecretOpen] = useState(false);
  const mediaColumns = text.finalMediaColumns;

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
          {mediaColumns.map((items, index) => (
            <FinalMediaCarousel
              columnIndex={index}
              items={items}
              key={`final-column-${index}`}
            />
          ))}
        </div>

        <div className="blessing-card">
          {text.blessing.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <MessageBoard />

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
