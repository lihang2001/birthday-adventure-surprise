import { useEffect, useState } from "react";
import { albumBgm, memoryPageText, type GiftImage, type Memory } from "../data";
import { isAlbumBgmPlaying, pauseAlbumBgm, playAlbumBgm } from "../sound";
import PlaceholderImage from "./PlaceholderImage";

interface MemoryGalleryProps {
  memories: Memory[];
  onContinue: () => void;
}

interface MemoryMediaProps {
  item: GiftImage;
  className: string;
  modal?: boolean;
  onVideoPlay?: () => void;
}

function MemoryMedia({
  item,
  className,
  modal = false,
  onVideoPlay,
}: MemoryMediaProps) {
  if (item.type === "video") {
    return (
      <span className={`memory-video-wrap ${modal ? "is-modal" : ""}`}>
        <video
          className={`soft-image ${className}`}
          src={item.src}
          aria-label={item.alt}
          controls={modal}
          muted={!modal}
          loop={!modal}
          playsInline
          preload="metadata"
          autoPlay={!modal}
          onPlay={onVideoPlay}
        />
        {!modal && <span className="memory-video-badge">视频</span>}
      </span>
    );
  }

  return (
    <PlaceholderImage
      className={className}
      src={item.src}
      alt={item.alt}
      label={item.label}
    />
  );
}

export default function MemoryGallery({
  memories,
  onContinue,
}: MemoryGalleryProps) {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [bgmState, setBgmState] = useState<"idle" | "playing" | "missing">(
    "idle",
  );

  const current = memories[active];
  const currentMedia = current.images;
  const selectedItem = currentMedia[selectedMedia] ?? currentMedia[0];
  const previewMedia = currentMedia.slice(0, 4);
  const hiddenMediaCount = Math.max(currentMedia.length - previewMedia.length, 0);

  useEffect(() => {
    let mounted = true;

    setBgmState(isAlbumBgmPlaying() ? "playing" : "idle");
    void playAlbumBgm(albumBgm.src).then((result) => {
      if (!mounted) return;
      if (result === "playing") {
        setBgmState("playing");
      } else if (result === "missing") {
        setBgmState("missing");
      } else {
        setBgmState("idle");
      }
    });

    return () => {
      mounted = false;
      pauseAlbumBgm();
    };
  }, []);

  const toggleBgm = async () => {
    if (bgmState === "missing") return;

    if (bgmState === "playing") {
      pauseAlbumBgm();
      setBgmState("idle");
      return;
    }

    const result = await playAlbumBgm(albumBgm.src);
    if (result === "playing") {
      setBgmState("playing");
    } else if (result === "missing") {
      setBgmState("missing");
    } else {
      setBgmState("idle");
    }
  };

  const keepAlbumBgmWithVideo = async () => {
    if (bgmState === "missing") return;

    const result = await playAlbumBgm(albumBgm.src);
    if (result === "playing") {
      setBgmState("playing");
    } else if (result === "missing") {
      setBgmState("missing");
    }
  };

  const goToMemory = (index: number) => {
    setActive(index);
    setSelectedMedia(0);
  };

  const prev = () => {
    goToMemory(active === 0 ? memories.length - 1 : active - 1);
  };

  const next = () => {
    goToMemory(active === memories.length - 1 ? 0 : active + 1);
  };

  const openMedia = (index: number) => {
    if (!currentMedia.length) return;
    if (currentMedia[index]?.type === "video") {
      void keepAlbumBgmWithVideo();
    }
    setSelectedMedia(index);
    setModalOpen(true);
  };

  const prevMedia = () => {
    setSelectedMedia((index) =>
      index === 0 ? currentMedia.length - 1 : index - 1,
    );
  };

  const nextMedia = () => {
    setSelectedMedia((index) =>
      index === currentMedia.length - 1 ? 0 : index + 1,
    );
  };

  const endSwipe = (clientX: number) => {
    if (dragStart === null) return;
    const diff = clientX - dragStart;
    if (Math.abs(diff) > 44) {
      diff > 0 ? prev() : next();
    }
    setDragStart(null);
  };

  return (
    <div className="screen memory-screen">
      <div className="title-block compact">
        <p className="eyebrow">{memoryPageText.eyebrow}</p>
        <h1>{memoryPageText.title}</h1>
        <p>{memoryPageText.subtitle}</p>
      </div>

      <div className={`memory-bgm ${bgmState === "playing" ? "is-playing" : ""}`}>
        <button
          type="button"
          onClick={toggleBgm}
          disabled={bgmState === "missing"}
          aria-pressed={bgmState === "playing"}
        >
          <span className="bgm-disc" aria-hidden="true">
            <span />
          </span>
          <span>
            <strong>{albumBgm.title}</strong>
            <small>
              {bgmState === "missing"
                ? albumBgm.missingText
                : bgmState === "playing"
                  ? albumBgm.pauseText
                  : albumBgm.playText}
              {" · "}
              {albumBgm.artist}
            </small>
          </span>
        </button>
      </div>

      <div className="memory-stage">
        <button
          className="round-nav"
          type="button"
          onClick={prev}
          aria-label={memoryPageText.previousLabel}
        >
          ‹
        </button>

        <article
          className={`memory-card ${
            currentMedia.length ? "" : "memory-card-text-only"
          }`}
          onPointerDown={(event) => setDragStart(event.clientX)}
          onPointerUp={(event) => endSwipe(event.clientX)}
          onPointerCancel={() => setDragStart(null)}
        >
          <div
            className={`memory-photo-grid photo-count-${Math.min(
              currentMedia.length,
              4,
            )}`}
          >
            {previewMedia.length ? (
              previewMedia.map((item, index) => (
                <button
                  className="memory-photo-button"
                  key={item.src}
                  type="button"
                  onClick={() => openMedia(index)}
                >
                  <MemoryMedia item={item} className="memory-photo" />
                  {index === previewMedia.length - 1 && hiddenMediaCount > 0 && (
                    <span className="memory-more">+{hiddenMediaCount}</span>
                  )}
                </button>
              ))
            ) : (
              <div className="memory-empty-photo" aria-label="文字日记">
                <span>Diary</span>
                <strong>这一页先把文字留下</strong>
              </div>
            )}
          </div>
          <div className="memory-copy">
            {current.date && <time>{current.date}</time>}
            {current.title && <h2>{current.title}</h2>}
            <p>{current.diary}</p>
          </div>
        </article>

        <button
          className="round-nav"
          type="button"
          onClick={next}
          aria-label={memoryPageText.nextLabel}
        >
          ›
        </button>
      </div>

      <div className="memory-dots memory-page-links" aria-label="相册分页">
        {memories.map((memory, index) => (
          <button
            className={index === active ? "is-active" : ""}
            key={`${memory.date || "memory"}-${memory.title || "untitled"}-${index}`}
            type="button"
            onClick={() => goToMemory(index)}
            aria-label={`跳到第 ${index + 1} 页`}
          >
            <span>{index + 1}</span>
            <small>{memory.date || "照片集"}</small>
          </button>
        ))}
      </div>

      <button className="primary-button" type="button" onClick={onContinue}>
        {memoryPageText.continueText}
      </button>

      {modalOpen && selectedItem && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="memory-modal">
            <button
              className="modal-close"
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label={memoryPageText.closeLabel}
            >
              ×
            </button>
            <div className="modal-photo-frame">
              {currentMedia.length > 1 && (
                <button
                  className="modal-photo-nav modal-photo-prev"
                  type="button"
                  onClick={prevMedia}
                  aria-label="上一张照片"
                >
                  ‹
                </button>
              )}
              <MemoryMedia
                item={selectedItem}
                className="modal-photo"
                modal
                onVideoPlay={() => {
                  void keepAlbumBgmWithVideo();
                }}
              />
              {currentMedia.length > 1 && (
                <button
                  className="modal-photo-nav modal-photo-next"
                  type="button"
                  onClick={nextMedia}
                  aria-label="下一张照片"
                >
                  ›
                </button>
              )}
            </div>
            {currentMedia.length > 1 && (
              <div className="memory-thumbs" aria-label="同一天的照片">
                {currentMedia.map((item, index) => (
                  <button
                    className={index === selectedMedia ? "is-active" : ""}
                    key={item.src}
                    type="button"
                    onClick={() => setSelectedMedia(index)}
                    aria-label={`查看 ${item.label}`}
                  >
                    <MemoryMedia item={item} className="memory-thumb" />
                  </button>
                ))}
              </div>
            )}
            <div className="memory-copy modal-copy">
              {current.date && <time>{current.date}</time>}
              {current.title && <h2>{current.title}</h2>}
              <p>{current.diary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
