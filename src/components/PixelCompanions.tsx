export default function PixelCompanions() {
  return (
    <div className="pixel-companions" aria-hidden="true">
      <div className="pixel-stage">
        <span className="pixel-hit hit-left">敲</span>
        <img
          className="pixel-pet pixel-girl-pet"
          src="/avatars/pixel-girl-pet.png"
          alt=""
          draggable={false}
        />
        <img
          className="pixel-pet pixel-boy-pet"
          src="/avatars/pixel-boy-pet.png"
          alt=""
          draggable={false}
        />
        <span className="pixel-hit hit-right">敲</span>
      </div>
    </div>
  );
}
