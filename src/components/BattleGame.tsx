import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import type { BattleText } from "../data";
import {
  playBattleHitSound,
  playBattleVictorySound,
  playCounterAttackSound,
  playRewardFireworkSound,
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

interface SpaceGrooveChampion {
  id: string;
  name: string;
  cost: number;
  damage: number;
  image: string;
}

const spaceGrooveChampions: SpaceGrooveChampion[] = [
  {
    id: "nasus",
    name: "内瑟斯",
    cost: 1,
    damage: 18,
    image: "/champions/space-groove-nasus.png",
  },
  {
    id: "teemo",
    name: "提莫",
    cost: 1,
    damage: 18,
    image: "/champions/space-groove-teemo.png",
  },
  {
    id: "gwen",
    name: "格温",
    cost: 2,
    damage: 22,
    image: "/champions/space-groove-gwen.png",
  },
  {
    id: "ornn",
    name: "奥恩",
    cost: 3,
    damage: 24,
    image: "/champions/space-groove-ornn.png",
  },
  {
    id: "samira",
    name: "莎弥拉",
    cost: 3,
    damage: 26,
    image: "/champions/space-groove-samira.png",
  },
  {
    id: "nami",
    name: "娜美",
    cost: 4,
    damage: 28,
    image: "/champions/space-groove-nami.png",
  },
  {
    id: "blitzcrank",
    name: "布里茨",
    cost: 5,
    damage: 32,
    image: "/champions/space-groove-blitzcrank.png",
  },
];

const spaceGrooveTiers = [1, 3, 5, 7];

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

const playerMaxHp = 100;
const bossCounterDamage = 18;

export default function BattleGame({
  battle,
  variant,
  onContinue,
}: BattleGameProps) {
  const [hp, setHp] = useState(battle.hp);
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [hits, setHits] = useState<HitFx[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [impacting, setImpacting] = useState(false);
  const [countering, setCountering] = useState(false);
  const [combo, setCombo] = useState(0);
  const [defeated, setDefeated] = useState(false);
  const [rewardReady, setRewardReady] = useState(false);
  const [draggingChampionId, setDraggingChampionId] = useState<string | null>(
    null,
  );
  const [deployedChampions, setDeployedChampions] = useState<string[]>([]);
  const [traitPulseKey, setTraitPulseKey] = useState(0);
  const comboTimerRef = useRef<number | undefined>(undefined);
  const counterStartRef = useRef<number | undefined>(undefined);
  const counterEndRef = useRef<number | undefined>(undefined);
  const rewardReadyRef = useRef<number | undefined>(undefined);
  const playerDamagedRef = useRef<number | undefined>(undefined);

  const hpPercent = Math.max(0, Math.round((hp / battle.hp) * 100));
  const playerHpPercent = Math.max(
    0,
    Math.round((playerHp / playerMaxHp) * 100),
  );

  const line = useMemo(() => {
    if (defeated) return battle.lines[battle.lines.length - 1];
    if (hpPercent <= 25) return battle.lines[3] ?? battle.lines[0];
    if (hpPercent <= 55) return battle.lines[2] ?? battle.lines[0];
    if (hpPercent <= 80) return battle.lines[1] ?? battle.lines[0];
    return battle.lines[0];
  }, [battle.lines, defeated, hpPercent]);

  const sprite = monsterSprites[battle.id];
  const isFinalBoss = battle.id === "boss";
  const deployedChampionSet = useMemo(
    () => new Set(deployedChampions),
    [deployedChampions],
  );
  const activeSpaceGrooveTier =
    spaceGrooveTiers.reduce(
      (activeTier, tier) =>
        deployedChampions.length >= tier ? tier : activeTier,
      0,
    );

  useEffect(() => {
    return () => {
      window.clearTimeout(comboTimerRef.current);
      window.clearTimeout(counterStartRef.current);
      window.clearTimeout(counterEndRef.current);
      window.clearTimeout(rewardReadyRef.current);
      window.clearTimeout(playerDamagedRef.current);
    };
  }, []);

  const triggerCounter = () => {
    window.clearTimeout(counterStartRef.current);
    window.clearTimeout(counterEndRef.current);

    counterStartRef.current = window.setTimeout(() => {
      playCounterAttackSound(battle.id);
      navigator.vibrate?.(isFinalBoss ? [16, 24, 18] : [14, 18]);
      setCountering(true);
      if (isFinalBoss) {
        setPlayerDamaged(true);
        setPlayerHp((current) => Math.max(8, current - bossCounterDamage));
        window.clearTimeout(playerDamagedRef.current);
        playerDamagedRef.current = window.setTimeout(() => {
          setPlayerDamaged(false);
        }, 520);
      }

      counterEndRef.current = window.setTimeout(() => {
        setCountering(false);
      }, isFinalBoss ? 620 : 520);
    }, isFinalBoss ? 180 : 150);
  };

  const attack = (
    damage = battle.damage,
    attackSource: "player" | "spaceGroove" = "player",
  ) => {
    if (defeated || hp <= 0) return;

    navigator.vibrate?.(
      attackSource === "spaceGroove"
        ? [10, 12, 10]
        : isFinalBoss
          ? [28, 18, 32]
          : [20, 18, 26],
    );
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
        value: damage,
        angle: Math.round(Math.random() * 40 - 20),
        critical:
          attackSource === "spaceGroove" ||
          Math.random() > (battle.id === "first" ? 0.48 : 0.62),
        punchX: Math.random() > 0.5 ? -1 : 1,
        magicX: Math.random() > 0.5 ? -1 : 1,
      },
    ]);

    window.setTimeout(() => {
      setHits((current) => current.slice(1));
    }, 650);

    setHp((current) => {
      const next = Math.max(0, current - damage);
      if (next === 0) {
        window.clearTimeout(counterStartRef.current);
        window.clearTimeout(counterEndRef.current);
        window.clearTimeout(playerDamagedRef.current);
        setCountering(false);
        setPlayerDamaged(false);
        setRewardReady(false);
        playBattleVictorySound(battle.id);
        window.setTimeout(() => {
          playRewardFireworkSound(variant === "boss" ? "black" : "cream");
          setDefeated(true);
          window.clearTimeout(rewardReadyRef.current);
          rewardReadyRef.current = window.setTimeout(() => {
            setRewardReady(true);
          }, 920);
        }, 250);
      } else if (nextCombo % (isFinalBoss ? 3 : 4) === 0) {
        triggerCounter();
      }
      return next;
    });
  };

  const deployChampion = (championId: string) => {
    if (!isFinalBoss || defeated) return;

    const champion = spaceGrooveChampions.find((item) => item.id === championId);
    if (!champion || deployedChampionSet.has(championId)) return;

    setDeployedChampions((current) =>
      current.includes(championId) ? current : [...current, championId],
    );
    setTraitPulseKey((key) => key + 1);
    window.setTimeout(() => {
      attack(champion.damage, "spaceGroove");
    }, 120);
  };

  const attackWithChampion = (champion: SpaceGrooveChampion) => {
    if (!isFinalBoss || defeated) return;
    attack(champion.damage, "spaceGroove");
  };

  const handleChampionDragStart = (
    event: DragEvent<HTMLButtonElement>,
    championId: string,
  ) => {
    setDraggingChampionId(championId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/space-groove-champion", championId);
  };

  const handleChampionDragEnd = () => {
    setDraggingChampionId(null);
  };

  const handleFieldDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const championId =
      event.dataTransfer.getData("text/space-groove-champion") ||
      draggingChampionId;
    if (championId) deployChampion(championId);
    setDraggingChampionId(null);
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

        {isFinalBoss && (
          <div className={`player-hp-panel ${playerDamaged ? "is-damaged" : ""}`}>
            <div className="hp-header">
              <span>你的 HP</span>
              <strong>
                {playerHp}/{playerMaxHp}
              </strong>
            </div>
            <div className="hp-bar player-hp-bar" aria-label={`你的剩余血量 ${playerHpPercent}%`}>
              <span style={{ width: `${playerHpPercent}%` }} />
            </div>
            <p>
              {playerHpPercent <= 35
                ? "快撑住了，最后几下就能打开相册。"
                : playerDamaged
                  ? `Boss 反击命中，-${bossCounterDamage} HP`
                  : "Boss 会反击，小心一点点。"}
            </p>
          </div>
        )}

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
              onClick={isFinalBoss ? undefined : () => attack()}
              disabled={isFinalBoss}
              aria-label={
                isFinalBoss ? "拖动太空律动英雄攻击大 Boss" : battle.attackLabel
              }
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

        {isFinalBoss && !defeated && (
          <div className="space-groove-console">
            <aside className="space-groove-trait" key={traitPulseKey}>
              <div className="trait-icon" aria-hidden="true">
                SG
              </div>
              <div>
                <span>太空律动</span>
                <strong>{deployedChampions.length}/7</strong>
              </div>
              <p>
                上场一个英雄，羁绊数量 +1；拖到场上会立刻攻击 Boss。
              </p>
              <div className="trait-tiers" aria-label="太空律动羁绊阶段">
                {spaceGrooveTiers.map((tier) => (
                  <span
                    className={tier <= activeSpaceGrooveTier ? "is-active" : ""}
                    key={tier}
                  >
                    {tier}
                  </span>
                ))}
              </div>
            </aside>

            <div className="space-groove-playmat">
              <div
                className={`space-groove-field ${
                  draggingChampionId ? "is-dragging" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleFieldDrop}
              >
                {deployedChampions.length ? (
                  deployedChampions.map((championId) => {
                    const champion = spaceGrooveChampions.find(
                      (item) => item.id === championId,
                    );
                    if (!champion) return null;

                    return (
                      <button
                        className="field-champion"
                        key={champion.id}
                        type="button"
                        onClick={() => attackWithChampion(champion)}
                        aria-label={`${champion.name} 攻击大 Boss`}
                      >
                        <img src={champion.image} alt="" draggable={false} />
                        <span>{champion.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <p>把下方头像拖到这里上场</p>
                )}
              </div>

              <div className="space-groove-bench" aria-label="太空律动英雄">
                {spaceGrooveChampions.map((champion) => {
                  const isDeployed = deployedChampionSet.has(champion.id);

                  return (
                    <button
                      className={`bench-champion ${
                        isDeployed ? "is-deployed" : ""
                      }`}
                      key={champion.id}
                      type="button"
                      draggable={!isDeployed}
                      disabled={isDeployed}
                      onClick={() => deployChampion(champion.id)}
                      onDragStart={(event) =>
                        handleChampionDragStart(event, champion.id)
                      }
                      onDragEnd={handleChampionDragEnd}
                      aria-label={`${champion.name} 上场`}
                    >
                      <img src={champion.image} alt="" draggable={false} />
                      <span>{champion.name}</span>
                      <small>{champion.cost}费</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {defeated && (
        <div className="result-panel">
          <strong>{battle.defeatedText}</strong>
          <p className="result-note">
            {rewardReady ? "奖励已经稳稳落下啦。" : "小烟花正在庆祝，奖励马上落下。"}
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={onContinue}
            disabled={!rewardReady}
          >
            {battle.continueText}
          </button>
        </div>
      )}
    </div>
  );
}
