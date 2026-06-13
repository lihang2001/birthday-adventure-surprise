import { assetPath } from "../assetPath";
import type { GiftImage } from "../data";

interface PrizePopImageProps {
  image: GiftImage;
}

export default function PrizePopImage({ image }: PrizePopImageProps) {
  return (
    <div className="prize-pop-overlay" aria-hidden="true">
      <img
        className="prize-pop-image"
        src={assetPath(image.src)}
        alt=""
        draggable={false}
      />
    </div>
  );
}
