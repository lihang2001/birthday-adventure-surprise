import { useState } from "react";
import { assetPath } from "../assetPath";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  label: string;
  className?: string;
}

export default function PlaceholderImage({
  src,
  alt,
  label,
  className = "",
}: PlaceholderImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`image-placeholder ${className}`} role="img" aria-label={alt}>
        <span className="placeholder-line" />
        <strong>{label}</strong>
        <small>替换图片后会自动显示</small>
      </div>
    );
  }

  return (
    <img
      className={`soft-image ${className}`}
      src={assetPath(src)}
      alt={alt}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
