import { assetPath } from "../assetPath";

export default function PixelCompanions() {
  return (
    <div className="pixel-companions" aria-hidden="true">
      <div className="pixel-stage">
        <img
          className="pixel-pet pixel-girl-pet"
          src={assetPath("/avatars/pixel-girl-pet.png")}
          alt=""
          draggable={false}
        />
        <img
          className="pixel-pet pixel-boy-pet"
          src={assetPath("/avatars/pixel-boy-pet.png")}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
