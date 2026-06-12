import { useState } from "react";
import type { GiftReward } from "../data";
import { playGiftOpenSound } from "../sound";
import PlaceholderImage from "./PlaceholderImage";

interface GiftRevealProps {
  reward: GiftReward;
  onContinue: () => void;
}

export default function GiftReveal({ reward, onContinue }: GiftRevealProps) {
  const [opened, setOpened] = useState(false);
  const openGift = () => {
    if (!opened) {
      playGiftOpenSound("cream");
    }
    setOpened(true);
  };

  return (
    <div className="screen gift-screen">
      <div className="title-block compact">
        <p className="eyebrow">{reward.eyebrow}</p>
        <h1>{opened ? reward.openedTitle : reward.lockedTitle}</h1>
        <p>{opened ? reward.description : reward.closedText}</p>
      </div>

      <button
        className={`gift-box-button ${opened ? "is-open" : ""}`}
        type="button"
        onClick={openGift}
        aria-label="打开第一个礼盒"
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
        <div className="gift-content">
          <p className="gift-item">{reward.item}</p>
          <div
            className={`gift-image-grid image-count-${Math.min(
              reward.images.length,
              2,
            )}`}
          >
            {reward.images.map((image) => (
              <PlaceholderImage
                className="gift-image"
                key={image.src}
                src={image.src}
                alt={image.alt}
                label={image.label}
              />
            ))}
          </div>
          <p className="soft-copy">{reward.description}</p>
          <button className="primary-button" type="button" onClick={onContinue}>
            {reward.continueText}
          </button>
        </div>
      )}
    </div>
  );
}
