import { useEffect, useRef, useState } from "react";
import { albumBgm, memoryPageText, type Memory } from "../data";
import PlaceholderImage from "./PlaceholderImage";

interface MemoryGalleryProps {
  memories: Memory[];
  onContinue: () => void;
}

export default function MemoryGallery({
  memories,
  onContinue,
}: MemoryGalleryProps) {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [bgmState, setBgmState] = useState<"idle" | "playing" | "missing">(
    "idle",
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = memories[active];
  const currentPhotos = current.images;
  const currentPhoto = currentPhotos[selectedPhoto] ?? currentPhotos[0];
  const previewPhotos = currentPhotos.slice(0, 4);
  const hiddenPhotoCount = Math.max(currentPhotos.length - previewPhotos.length, 0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggleBgm = async () => {
    const audio = audioRef.current;
    if (!audio || bgmState === "missing") return;

    if (bgmState === "playing") {
      audio.pause();
      setBgmState("idle");
      return;
    }

    try {
      audio.volume = 0.38;
      audio.loop = true;
      await audio.play();
      setBgmState("playing");
    } catch {
      setBgmState("idle");
    }
  };

  const goToMemory = (index: number) => {
    setActive(index);
    setSelectedPhoto(0);
  };

  const prev = () => {
    goToMemory(active === 0 ? memories.length - 1 : active - 1);
  };

  const next = () => {
    goToMemory(active === memories.length - 1 ? 0 : active + 1);
  };

  const openPhoto = (index: number) => {
    if (!currentPhotos.length) return;
    setSelectedPhoto(index);
    setModalOpen(true);
  };

  const prevPhoto = () => {
    setSelectedPhoto((index) =>
      index === 0 ? currentPhotos.length - 1 : index - 1,
    );
  };

  const nextPhoto = () => {
    setSelectedPhoto((index) =>
      index === currentPhotos.length - 1 ? 0 : index + 1,
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
        <audio
          ref={audioRef}
          src={albumBgm.src}
          preload="none"
          loop
          onError={() => setBgmState("missing")}
        />
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
            currentPhotos.length ? "" : "memory-card-text-only"
          }`}
          onPointerDown={(event) => setDragStart(event.clientX)}
          onPointerUp={(event) => endSwipe(event.clientX)}
          onPointerCancel={() => setDragStart(null)}
        >
          <div
            className={`memory-photo-grid photo-count-${Math.min(
              currentPhotos.length,
              4,
            )}`}
          >
            {previewPhotos.length ? (
              previewPhotos.map((photo, index) => (
                <button
                  className="memory-photo-button"
                  key={photo.src}
                  type="button"
                  onClick={() => openPhoto(index)}
                >
                  <PlaceholderImage
                    className="memory-photo"
                    src={photo.src}
                    alt={photo.alt}
                    label={photo.label}
                  />
                  {index === previewPhotos.length - 1 && hiddenPhotoCount > 0 && (
                    <span className="memory-more">+{hiddenPhotoCount}</span>
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
            <time>{current.date}</time>
            <h2>{current.title}</h2>
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

      <div className="memory-dots" aria-label="照片位置">
        {memories.map((memory, index) => (
          <button
            className={index === active ? "is-active" : ""}
            key={`${memory.date}-${memory.title}`}
            type="button"
            onClick={() => goToMemory(index)}
            aria-label={`第 ${index + 1} 页`}
          />
        ))}
      </div>

      <button className="primary-button" type="button" onClick={onContinue}>
        {memoryPageText.continueText}
      </button>

      {modalOpen && currentPhoto && (
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
              {currentPhotos.length > 1 && (
                <button
                  className="modal-photo-nav modal-photo-prev"
                  type="button"
                  onClick={prevPhoto}
                  aria-label="上一张照片"
                >
                  ‹
                </button>
              )}
              <PlaceholderImage
                className="modal-photo"
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                label={currentPhoto.label}
              />
              {currentPhotos.length > 1 && (
                <button
                  className="modal-photo-nav modal-photo-next"
                  type="button"
                  onClick={nextPhoto}
                  aria-label="下一张照片"
                >
                  ›
                </button>
              )}
            </div>
            {currentPhotos.length > 1 && (
              <div className="memory-thumbs" aria-label="同一天的照片">
                {currentPhotos.map((photo, index) => (
                  <button
                    className={index === selectedPhoto ? "is-active" : ""}
                    key={photo.src}
                    type="button"
                    onClick={() => setSelectedPhoto(index)}
                    aria-label={`查看 ${photo.label}`}
                  >
                    <PlaceholderImage
                      className="memory-thumb"
                      src={photo.src}
                      alt={photo.alt}
                      label={photo.label}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="memory-copy modal-copy">
              <time>{current.date}</time>
              <h2>{current.title}</h2>
              <p>{current.diary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
