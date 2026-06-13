interface GiftBurstProps {
  label: string;
  variant?: "cream" | "black";
}

const sparks = Array.from({ length: 24 }, (_, index) => index + 1);
const ribbons = Array.from({ length: 12 }, (_, index) => index + 1);

export default function GiftBurst({ label, variant = "cream" }: GiftBurstProps) {
  return (
    <div className={`gift-burst ${variant}`} aria-label={label}>
      <span className="burst-halo" aria-hidden="true" />
      {sparks.map((spark) => (
        <span className={`burst-spark s${spark}`} key={spark} aria-hidden="true" />
      ))}
      {ribbons.map((ribbon) => (
        <span
          className={`burst-ribbon r${ribbon}`}
          key={ribbon}
          aria-hidden="true"
        />
      ))}
      <span className="burst-gift" aria-hidden="true">
        <span className="burst-lid" />
        <span className="burst-body" />
      </span>
      <p>{label}</p>
    </div>
  );
}
