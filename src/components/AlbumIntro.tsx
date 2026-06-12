import type { GiftImage, Memory } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface AlbumIntroProps {
  text: {
    eyebrow: string;
    title: string;
    subtitle: string;
    note: string;
    button: string;
  };
  memories: Memory[];
  onContinue: () => void;
}

export default function AlbumIntro({
  text,
  memories,
  onContinue,
}: AlbumIntroProps) {
  const previewImages = memories
    .flatMap((memory) => memory.images)
    .filter((image): image is GiftImage => image.type !== "video")
    .slice(0, 4);

  return (
    <div className="screen album-intro-screen">
      <div className="title-block compact">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </div>

      <div className="album-intro-card">
        <div className="album-lock" aria-hidden="true">
          <span className="album-lock-shackle" />
          <span className="album-lock-body" />
        </div>

        <div className="album-preview-stack" aria-label="回忆相册预览">
          {previewImages.map((image, index) => (
            <PlaceholderImage
              className={`album-preview-photo photo-${index + 1}`}
              key={image.src}
              src={image.src}
              alt={image.alt}
              label={image.label}
            />
          ))}
        </div>

        <div className="album-intro-copy">
          <strong>相册钥匙正在发光</strong>
          <p>{text.note}</p>
        </div>
      </div>

      <button className="primary-button" type="button" onClick={onContinue}>
        {text.button}
      </button>
    </div>
  );
}
