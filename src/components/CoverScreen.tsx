import { useState } from "react";
import type { CoverText } from "../data";

interface CoverScreenProps {
  text: CoverText;
  onStart: () => void;
}

const randomOffset = () => ({
  x: Math.round(Math.random() * 190 - 95),
  y: Math.round(Math.random() * 150 - 75),
});

export default function CoverScreen({ text, onStart }: CoverScreenProps) {
  const [attempts, setAttempts] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const moveAway = () => {
    setAttempts((value) => value + 1);
    setOffset(randomOffset());
  };

  const tip =
    attempts > 0 ? text.avoidTips[(attempts - 1) % text.avoidTips.length] : "";

  return (
    <div className="screen cover-screen">
      <div className="cover-badge">{text.badge}</div>
      <div className="cover-hero" aria-hidden="true">
        <span className="cover-gift-lid" />
        <span className="cover-gift-box" />
        <span className="cover-sparkle s1" />
        <span className="cover-sparkle s2" />
        <span className="cover-sparkle s3" />
      </div>

      <div className="title-block">
        <p className="eyebrow">给今天的小寿星</p>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </div>

      <div className="cover-actions">
        <button className="primary-button" type="button" onClick={onStart}>
          {text.startButton}
        </button>
        <button
          className="ghost-button runaway-button"
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            moveAway();
          }}
          onPointerEnter={moveAway}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          }}
        >
          {text.avoidButton}
        </button>
      </div>

      <div className={`tiny-tip ${tip ? "is-visible" : ""}`}>{tip}</div>
    </div>
  );
}
