import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BattleGame from "./components/BattleGame";
import CollectGame from "./components/CollectGame";
import CoverScreen from "./components/CoverScreen";
import FakeEnding from "./components/FakeEnding";
import FinalReveal from "./components/FinalReveal";
import GiftReveal from "./components/GiftReveal";
import MemoryGallery from "./components/MemoryGallery";
import {
  albumBgm,
  bossBattle,
  collectLevel,
  coverText,
  finalGiftText,
  firstBattle,
  firstGift,
  memories,
  sceneLabels,
  secondGift,
  type SceneId,
} from "./data";
import { playAlbumBgm } from "./sound";

const flow: SceneId[] = [
  "cover",
  "firstBattle",
  "firstGift",
  "collectHearts",
  "secondGift",
  "bossBattle",
  "memories",
  "fakeEnding",
  "finalGift",
];

export default function App() {
  const [scene, setScene] = useState<SceneId>("cover");
  const [visibleScene, setVisibleScene] = useState<SceneId>("cover");
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">(
    "idle",
  );
  const enterTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [visibleScene]);

  useEffect(() => {
    if (scene === visibleScene) return;

    window.clearTimeout(enterTimerRef.current);
    setTransitionPhase("out");
    const exitTimer = window.setTimeout(() => {
      setVisibleScene(scene);
      setTransitionPhase("in");
      enterTimerRef.current = window.setTimeout(() => {
        setTransitionPhase("idle");
      }, 460);
    }, 220);

    return () => {
      window.clearTimeout(exitTimer);
    };
  }, [scene, visibleScene]);

  const progressIndex = useMemo(() => flow.indexOf(visibleScene), [visibleScene]);

  const goTo = (next: SceneId) => {
    if (next === scene) return;
    if (next === "memories") {
      void playAlbumBgm(albumBgm.src);
    }
    setScene(next);
  };

  const content = {
    cover: <CoverScreen text={coverText} onStart={() => goTo("firstBattle")} />,
    firstBattle: (
      <BattleGame
        battle={firstBattle}
        variant="small"
        onContinue={() => goTo("firstGift")}
      />
    ),
    firstGift: (
      <GiftReveal reward={firstGift} onContinue={() => goTo("collectHearts")} />
    ),
    collectHearts: (
      <CollectGame level={collectLevel} onContinue={() => goTo("secondGift")} />
    ),
    secondGift: (
      <GiftReveal reward={secondGift} onContinue={() => goTo("bossBattle")} />
    ),
    memories: (
      <MemoryGallery memories={memories} onContinue={() => goTo("fakeEnding")} />
    ),
    bossBattle: (
      <BattleGame
        battle={bossBattle}
        variant="boss"
        onContinue={() => goTo("memories")}
      />
    ),
    fakeEnding: <FakeEnding onContinue={() => goTo("finalGift")} />,
    finalGift: <FinalReveal text={finalGiftText} onRestart={() => goTo("cover")} />,
  } satisfies Record<SceneId, ReactNode>;

  return (
    <div className="app">
      <main className="app-main">
        {visibleScene !== "cover" && (
          <nav className="progress-strip" aria-label="冒险进度">
            {flow.slice(1).map((step, index) => (
              <span
                className={`progress-dot ${
                  index + 1 <= progressIndex ? "is-active" : ""
                }`}
                key={step}
              >
                <span>{sceneLabels[step]}</span>
              </span>
            ))}
          </nav>
        )}
        <section
          className={`scene-transition scene-${transitionPhase}`}
          key={visibleScene}
        >
          {content[visibleScene]}
        </section>
      </main>
    </div>
  );
}
