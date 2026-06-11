import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { CollectLevelText } from "../data";
import {
  playCollectBadSound,
  playCollectGoodSound,
  primeGameAudio,
} from "../sound";
import GiftBurst from "./GiftBurst";

interface CollectGameProps {
  level: CollectLevelText;
  onContinue: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface MovingMonster extends Point {
  id: number;
  vx: number;
  vy: number;
}

const playerSize = 64;
const goodTokenWidth = 58;
const goodTokenHeight = 34;
const badThingSize = 50;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const spawnGoodThing = (width: number, height: number): Point => ({
  x: Math.round(34 + Math.random() * Math.max(1, width - 68 - goodTokenWidth)),
  y: Math.round(68 + Math.random() * Math.max(1, height - 170)),
});

export default function CollectGame({ level, onContinue }: CollectGameProps) {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef<Point | null>(null);
  const lastHitAt = useRef(0);
  const playerRef = useRef<Point>({ x: 0, y: 0 });
  const heartRef = useRef<Point>({ x: 0, y: 0 });
  const monstersRef = useRef<MovingMonster[]>([]);
  const collectedRef = useRef(0);
  const livesRef = useRef(level.lives);
  const completeRef = useRef(false);

  const [player, setPlayerState] = useState<Point>({ x: 0, y: 0 });
  const [heart, setHeartState] = useState<Point>({ x: 0, y: 0 });
  const [monsters, setMonstersState] = useState<MovingMonster[]>([]);
  const [collected, setCollected] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [message, setMessage] = useState(level.hint);
  const [complete, setComplete] = useState(false);
  const [hitPulse, setHitPulse] = useState(false);
  const currentAvatar =
    level.playerAvatars[collected % level.playerAvatars.length] ??
    level.playerAvatars[0];
  const currentGoodItem =
    level.goodItems[collected % level.goodItems.length] ?? "好运";

  const setPlayer = (point: Point) => {
    playerRef.current = point;
    setPlayerState(point);
  };

  const setHeart = (point: Point) => {
    heartRef.current = point;
    setHeartState(point);
  };

  const setMonsters = (items: MovingMonster[]) => {
    monstersRef.current = items;
    setMonstersState(items);
  };

  const initGame = useCallback(() => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;
    setPlayer({ x: width / 2 - playerSize / 2, y: height - 100 });
    setHeart(spawnGoodThing(width, height));
    setMonsters([
      { id: 1, x: 42, y: 112, vx: 0.72, vy: 0.48 },
      { id: 2, x: width - 82, y: 210, vx: -0.62, vy: 0.54 },
      { id: 3, x: width * 0.45, y: 306, vx: 0.5, vy: -0.58 },
    ]);
  }, []);

  useEffect(() => {
    initGame();
    window.addEventListener("resize", initGame);
    return () => window.removeEventListener("resize", initGame);
  }, [initGame]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect || completeRef.current) return;

      const width = rect.width;
      const height = rect.height;
      const nextMonsters = monstersRef.current.map((monster) => {
        let nextX = monster.x + monster.vx;
        let nextY = monster.y + monster.vy;
        let nextVx = monster.vx;
        let nextVy = monster.vy;

        if (nextX <= 10 || nextX >= width - badThingSize - 10) {
          nextVx *= -1;
          nextX = clamp(nextX, 10, width - badThingSize - 10);
        }
        if (nextY <= 72 || nextY >= height - badThingSize - 16) {
          nextVy *= -1;
          nextY = clamp(nextY, 72, height - badThingSize - 16);
        }

        return { ...monster, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
      });

      setMonsters(nextMonsters);

      const playerCenter = {
        x: playerRef.current.x + playerSize / 2,
        y: playerRef.current.y + playerSize / 2,
      };
      const heartCenter = {
        x: heartRef.current.x + goodTokenWidth / 2,
        y: heartRef.current.y + goodTokenHeight / 2,
      };

      if (distance(playerCenter, heartCenter) < 44) {
        const collectedItem =
          level.goodItems[collectedRef.current % level.goodItems.length] ?? "好运";
        const nextCollected = collectedRef.current + 1;
        playCollectGoodSound();
        collectedRef.current = nextCollected;
        setCollected(nextCollected);

        if (nextCollected >= level.target) {
          completeRef.current = true;
          setComplete(true);
          setMessage(level.completeText);
          return;
        }

        setMessage(`收集到「${collectedItem}」啦，继续找下一份好运。`);
        setHeart(spawnGoodThing(width, height));
      }

      const now = Date.now();
      const touchedMonster = nextMonsters.find((monster) =>
        distance(playerCenter, {
          x: monster.x + badThingSize / 2,
          y: monster.y + badThingSize / 2,
        }) < 42,
      );

      if (touchedMonster && now - lastHitAt.current > 1050) {
        lastHitAt.current = now;
        playCollectBadSound();
        const nextLives = livesRef.current - 1;
        if (nextLives <= 0) {
          livesRef.current = level.lives;
          setLives(level.lives);
          setMessage("被坏东西拦了一下，没关系，生命值补满继续。");
          setPlayer({ x: width / 2 - playerSize / 2, y: height - 100 });
        } else {
          const badItem =
            level.badItems[(touchedMonster.id - 1) % level.badItems.length] ??
            "霉运";
          livesRef.current = nextLives;
          setLives(nextLives);
          setMessage(`碰到「${badItem}」了，稍微绕一下。`);
        }
        setHitPulse(true);
        window.setTimeout(() => setHitPulse(false), 360);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [level.badItems, level.completeText, level.goodItems, level.lives, level.target]);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (complete) return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    primeGameAudio();
    arenaRef.current?.setPointerCapture(event.pointerId);
    dragOffset.current = {
      x: event.clientX - rect.left - playerRef.current.x,
      y: event.clientY - rect.top - playerRef.current.y,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current || complete) return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPlayer({
      x: clamp(
        event.clientX - rect.left - dragOffset.current.x,
        10,
        rect.width - playerSize - 10,
      ),
      y: clamp(
        event.clientY - rect.top - dragOffset.current.y,
        70,
        rect.height - playerSize - 16,
      ),
    });
  };

  const stopDrag = () => {
    dragOffset.current = null;
  };

  return (
    <div className="screen collect-screen">
      <div className="title-block compact">
        <p className="eyebrow">{level.eyebrow}</p>
        <h1>{level.title}</h1>
        <p>{level.subtitle}</p>
      </div>

      <div
        className={`collect-arena ${hitPulse ? "is-hit" : ""}`}
        ref={arenaRef}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="arena-hud">
          <div>
            <span>{level.lifeLabel}</span>
            <strong>{"●".repeat(lives)}</strong>
          </div>
          <div>
            <span>{level.collectedLabel}</span>
            <strong>
              {collected}/{level.target}
            </strong>
          </div>
        </div>

        <p className="arena-message">{message}</p>

        {!complete && (
          <span
            className="good-token"
            style={{ transform: `translate3d(${heart.x}px, ${heart.y}px, 0)` }}
            aria-label={`可收集好运：${currentGoodItem}`}
          >
            {currentGoodItem}
          </span>
        )}

        {monsters.map((monster) => {
          const badItem =
            level.badItems[(monster.id - 1) % level.badItems.length] ?? "霉运";

          return (
          <span
            className="bad-thing"
            key={monster.id}
            style={{ transform: `translate3d(${monster.x}px, ${monster.y}px, 0)` }}
            aria-label={`需要躲开的坏东西：${badItem}`}
          >
            <span>{badItem}</span>
          </span>
          );
        })}

        <div
          className={`player-token ${complete ? "is-complete" : ""}`}
          style={{ transform: `translate3d(${player.x}px, ${player.y}px, 0)` }}
          onPointerDown={startDrag}
          role="button"
          aria-label="拖动小角色"
          tabIndex={0}
        >
          <span className="player-avatar-glow" aria-hidden="true" />
          <img
            className="player-avatar-image"
            key={currentAvatar.src}
            src={currentAvatar.src}
            alt={currentAvatar.alt}
            draggable={false}
          />
        </div>

        {complete && (
          <div className="collect-complete">
            <GiftBurst label="奖励爆出来了" />
            <strong>{level.completeText}</strong>
            <button className="primary-button" type="button" onClick={onContinue}>
              {level.continueText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
