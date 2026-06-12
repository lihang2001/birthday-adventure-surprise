import { useEffect, useMemo, useRef, useState } from "react";
import type { BattleText } from "../data";
import {
  playBattleHitSound,
  playBattleVictorySound,
  playCounterAttackSound,
  primeGameAudio,
} from "../sound";
import GiftBurst from "./GiftBurst";

interface BattleGameProps {
  battle: BattleText;
  variant: "small" | "boss";
  onContinue: () => void;
}

interface HitFx {
  id: number;
  x: number;
  y: number;
  value: number;
  angle: number;
  critical: boolean;
  punchX: number;
  magicX: number;
}

const monsterSprites: Record<
  BattleText["id"],
  { idle: string; hurt: string; attack: string; alt: string }
> = {
  first: {
    idle: "/monsters/first-slime-idle.png",
    hurt: "/monsters/first-slime-hurt.png",
    attack: "/monsters/first-slime-attack.png",
    alt: "紫色独眼小史莱姆",
  },
  boss: {
    idle: "/monsters/final-eye-king-idle.png",
    hurt: "/monsters/final-eye-king-hurt.png",
    attack: "/monsters/final-eye-king-attack.png",
    alt: "贱眼魔王",
  },
};

export default function BattleGame({
  battle,
  variant,
  onContinue,
}: BattleGameProps) {
  const [hp, setHp] = useState(battle.hp);
  const [hits, setHits] = useState<HitFx[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [impacting, setImpacting] = useState(false);
  const [countering, setCountering] = useState(false);
  const [combo, setCombo] = useState(0);
  const [defeated, setDefeated] = useState(false);
  const comboTimerRef = useRef<number | undefined>(undefined);
  const counterStartRef = useRef<number | undefined>(undefined);
  const counterEndRef = useRef<number | undefined>(undefined);

  const hpPercent = Math.max(0, Math.round((hp / battle.hp) * 100));

  const line = useMemo(() => {
    if (defeated) return battle.lines[battle.lines.length - 1];
    if (hpPercent <= 25) return battle.lines[3] ?? battle.lines[0];
    if (hpPercent <= 55) return battle.lines[2] ?? battle.lines[0];
    if (hpPercent <= 80) return battle.lines[1] ?? battle.lines[0];
    return battle.lines[0];
  }, [battle.lines, defeated, hpPercent]);

  const sprite = monsterSprites[battle.id];
  const isFinalBoss = battle.id === "boss";

  useEffect(() => {
    return () => {
      window.clearTimeout(comboTimerRef.current);
      window.clearTimeout(counterStartRef.current);
      window.clearTimeout(counterEndRef.current);
    };
  }, []);

  const triggerCounter = () => {
    window.clearTimeout(counterStartRef.current);
    window.clearTimeout(counterEndRef.current);

    counterStartRef.current = window.setTimeout(() => {
      playCounterAttackSound(battle.id);
      navigator.vibrate?.(isFinalBoss ? [16, 24, 18] : [14, 18]);
      setCountering(true);

      counterEndRef.current = window.setTimeout(() => {
        setCountering(false);
      }, isFinalBoss ? 620 : 520);
    }, isFinalBoss ? 180 : 150);
  };

  const attack = () => {
    if (defeated) return;

    navigator.vibrate?.(isFinalBoss ? [28, 18, 32] : [20, 18, 26]);
    primeGameAudio();
    playBattleHitSound(battle.id);
    const impactDuration = isFinalBoss ? 260 : 210;

    setImpacting(false);
    window.requestAnimationFrame(() => setImpacting(true));
    window.setTimeout(() => setImpacting(false), impactDuration);
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    window.clearTimeout(comboTimerRef.current);
    comboTimerRef.current = window.setTimeout(() => setCombo(0), 900);
    setShakeKey((key) => key + 1);
    setHits((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        x: 38 + Math.random() * 24,
        y: 34 + Math.random() * 22,
        value: battle.damage,
        angle: Math.round(Math.random() * 40 - 20),
        critical: Math.random() > (battle.id === "first" ? 0.48 : 0.62),
        punchX: Math.random() > 0.5 ? -1 : 1,
        magicX: Math.random() > 0.5 ? -1 : 1,
      },
    ]);

    window.setTimeout(() => {
      setHits((current) => current.slice(1));
    }, 650);

    setHp((current) => {
      const next = Math.max(0, current - battle.damage);
      if (next === 0) {
        window.clearTimeout(counterStartRef.current);
        window.clearTimeout(counterEndRef.current);
        setCountering(false);
        playBattleVictorySound(battle.id);
        window.setTimeout(() => setDefeated(true), 250);
      } else if (nextCombo % (isFinalBoss ? 3 : 4) === 0) {
        triggerCounter();
      }
      return next;
    });
  };

  return (
    <div className={`screen battle-screen battle-${variant} battle-id-${battle.id}`}>
      <div className="title-block compact">
        <p className="eyebrow">{battle.eyebrow}</p>
        <h1>{battle.title}</h1>
        <p>{battle.subtitle}</p>
      </div>

      <div className={`battle-card ${impacting ? "is-impacting" : ""}`}>
        <div className="hp-header">
          <span>{battle.hpLabel}</span>
          <strong>
            {hp}/{battle.hp}
          </strong>
        </div>
        <div className="hp-bar" aria-label={`剩余血量 ${hpPercent}%`}>
          <span style={{ width: `${hpPercent}%` }} />
        </div>

        <div className="speech-bubble">{line}</div>

        <div className={`monster-zone ${defeated ? "is-defeated" : ""}`}>
          {combo > 1 && !defeated && <div className="combo-badge">Combo x{combo}</div>}
          {!defeated && (
            <button
              className={`monster-button ${variant} ${
                battle.id === "first" ? "slime-boss" : "eye-king"
              } mood-${hpPercent <= 35 ? "panic" : "calm"} ${
                countering ? "is-countering" : ""
              }`}
              key={shakeKey}
              type="button"
              onClick={attack}
              aria-label={battle.attackLabel}
            >
              <span className={`boss-sprite-wrap ${isFinalBoss ? "has-3d-depth" : ""}`}>
                {isFinalBoss && <span className="boss-depth-shadow" aria-hidden="true" />}
                <img
                  className="boss-sprite boss-idle"
                  src={sprite.idle}
                  alt={sprite.alt}
                  draggable={false}
                />
                <img
                  className="boss-sprite boss-hurt"
                  src={sprite.hurt}
                  alt=""
                  draggable={false}
                />
                <img
                  className="boss-sprite boss-attack"
                  src={sprite.attack}
                  alt=""
                  draggable={false}
                />
              </span>
            </button>
          )}

          {countering && !defeated && (
            <span
              className={`boss-counter-effect counter-${battle.id}`}
              aria-hidden="true"
            >
              <span className="counter-orb" />
              <span className="counter-beam" />
              <span className="counter-spark s1" />
              <span className="counter-spark s2" />
              <span className="counter-spark s3" />
            </span>
          )}

          {hits.map((hit) => (
            <span
              className={`hit-pack ${isFinalBoss ? "is-final-boss-hit" : ""}`}
              key={hit.id}
            >
              {isFinalBoss && (
                <>
                  <span
                    className="magic-burst"
                    style={{
                      left: `${hit.x + hit.magicX * 11}%`,
                      top: `${hit.y + 8}%`,
                    }}
                  >
                    <span />
                  </span>
                  <span
                    className="sword-effect sword-a"
                    style={{
                      left: `${hit.x - 16}%`,
                      top: `${hit.y - 12}%`,
                      rotate: `${hit.angle - 28}deg`,
                    }}
                  >
                    <span className="sword-blade" />
                    <span className="sword-guard" />
                    <span className="sword-handle" />
                  </span>
                  <span
                    className="sword-effect sword-b"
                    style={{
                      left: `${hit.x + 14}%`,
                      top: `${hit.y + 8}%`,
                      rotate: `${hit.angle + 132}deg`,
                    }}
                  >
                    <span className="sword-blade" />
                    <span className="sword-guard" />
                    <span className="sword-handle" />
                  </span>
                </>
              )}
              <span
                className="impact-ring"
                style={{ left: `${hit.x}%`, top: `${hit.y}%` }}
              />
              <span
                className="fist-effect"
                style={{
                  left: `${hit.x + hit.punchX * 8}%`,
                  top: `${hit.y - 18}%`,
                  rotate: `${hit.punchX * -16}deg`,
                }}
              >
                <span className="fist-palm" />
                <span className="fist-thumb" />
                <span className="fist-knuckles">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              </span>
              <span
                className="slash-effect"
                style={{
                  left: `${hit.x - 8}%`,
                  top: `${hit.y + 4}%`,
                  rotate: `${hit.angle}deg`,
                }}
              />
              <span
                className={`hit-effect ${hit.critical ? "is-critical" : ""}`}
                style={{ left: `${hit.x + 4}%`, top: `${hit.y - 4}%` }}
              >
                -{hit.value}
              </span>
            </span>
          ))}

          {defeated && (
            <GiftBurst
              label={battle.unlockedText}
              variant={variant === "boss" ? "black" : "cream"}
            />
          )}
        </div>
      </div>

      {defeated && (
        <div className="result-panel">
          <strong>{battle.defeatedText}</strong>
          <button className="primary-button" type="button" onClick={onContinue}>
            {battle.continueText}
          </button>
        </div>
      )}
    </div>
  );
}
