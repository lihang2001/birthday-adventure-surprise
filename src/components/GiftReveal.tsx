import { useEffect, useRef, useState } from "react";
import type { GiftReward } from "../data";
import { playGiftOpenSound, primeGameAudio } from "../sound";
import PlaceholderImage from "./PlaceholderImage";
import PrizePopImage from "./PrizePopImage";

interface GiftRevealProps {
  reward: GiftReward;
  onContinue: () => void;
}

const openConfetti = Array.from({ length: 24 }, (_, index) => index + 1);

export default function GiftReveal({ reward, onContinue }: GiftRevealProps) {
  const [opened, setOpened] = useState(false);
  const [popVisible, setPopVisible] = useState(false);
  const popTimerRef = useRef<number | undefined>(undefined);
  const soundFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    primeGameAudio();
    return () => {
      window.clearTimeout(popTimerRef.current);
      window.cancelAnimationFrame(soundFrameRef.current ?? 0);
    };
  }, []);

  const openGift = () => {
    if (!opened) {
      if (reward.popImage) {
        setPopVisible(true);
        window.clearTimeout(popTimerRef.current);
        popTimerRef.current = window.setTimeout(() => {
          setPopVisible(false);
        }, 1000);
      }
      window.cancelAnimationFrame(soundFrameRef.current ?? 0);
      soundFrameRef.current = window.requestAnimationFrame(() => {
        playGiftOpenSound("cream", reward.soundStyle ?? "default");
      });
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
        onPointerDown={primeGameAudio}
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
        {opened && (
          <span className="gift-open-confetti" aria-hidden="true">
            {openConfetti.map((piece) => (
              <span className={`confetti-piece c${piece}`} key={piece} />
            ))}
          </span>
        )}
      </button>

      {popVisible && reward.popImage && <PrizePopImage image={reward.popImage} />}

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
