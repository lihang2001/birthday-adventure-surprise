import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

interface BoardImage {
  id: string;
  name: string;
  src: string;
}

interface BoardEntry {
  id: string;
  text: string;
  images: BoardImage[];
  createdAt: string;
}

const storageKey = "birthday-adventure-message-board-v1";
const maxImagesPerEntry = 4;

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("image read failed"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<BoardImage> {
  const src = await readFileAsDataUrl(file);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        resolve({ id: makeId(), name: file.name, src });
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve({
        id: makeId(),
        name: file.name,
        src: canvas.toDataURL("image/jpeg", 0.82),
      });
    };
    image.onerror = () => resolve({ id: makeId(), name: file.name, src });
    image.src = src;
  });
}

export default function MessageBoard() {
  const [entries, setEntries] = useState<BoardEntry[]>(() => loadEntries());
  const [text, setText] = useState("");
  const [images, setImages] = useState<BoardImage[]>([]);
  const [isReadingImages, setIsReadingImages] = useState(false);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      setStatus("图片太多啦，先删掉一两张再试试。");
    }
  }, [entries]);

  const remainingImageSlots = useMemo(
    () => Math.max(0, maxImagesPerEntry - images.length),
    [images.length],
  );

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingImageSlots);

    if (!files.length) return;

    setIsReadingImages(true);
    setStatus("");

    try {
      const nextImages = await Promise.all(files.map((file) => compressImage(file)));
      setImages((current) => [...current, ...nextImages].slice(0, maxImagesPerEntry));
    } catch {
      setStatus("有张图片没有读出来，换一张试试。");
    } finally {
      setIsReadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeDraftImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id));
  };

  const submitEntry = () => {
    const trimmedText = text.trim();
    if (!trimmedText && !images.length) {
      setStatus("先写点什么，或者放一张照片。");
      return;
    }

    const entry: BoardEntry = {
      id: makeId(),
      text: trimmedText,
      images,
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [entry, ...current]);
    setText("");
    setImages([]);
    setStatus("已经贴上去啦。");
  };

  const removeEntry = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <section className="message-board" aria-label="留言板">
      <div className="message-board-heading">
        <span>Message Board</span>
        <h2>我们的留言板</h2>
      </div>

      <div className="message-composer">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="写一句想留下的话"
          maxLength={600}
          rows={4}
        />

        {images.length > 0 && (
          <div className="draft-image-grid" aria-label="待发布图片">
            {images.map((image) => (
              <button
                className="draft-image-button"
                key={image.id}
                type="button"
                onClick={() => removeDraftImage(image.id)}
                aria-label={`移除 ${image.name}`}
              >
                <img src={image.src} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="message-actions">
          <label
            className={`image-upload-button ${
              remainingImageSlots === 0 ? "is-disabled" : ""
            }`}
          >
            <span>插入图片</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={remainingImageSlots === 0 || isReadingImages}
              onChange={handleImageChange}
            />
          </label>
          <button
            className="primary-button"
            type="button"
            onClick={submitEntry}
            disabled={isReadingImages}
          >
            {isReadingImages ? "读取中" : "贴上去"}
          </button>
        </div>

        {status && <p className="message-status">{status}</p>}
      </div>

      <div className="message-list">
        {entries.length ? (
          entries.map((entry) => (
            <article className="message-note" key={entry.id}>
              <div className="message-note-meta">
                <time>{formatDate(entry.createdAt)}</time>
                <button type="button" onClick={() => removeEntry(entry.id)}>
                  删除
                </button>
              </div>
              {entry.text && <p>{entry.text}</p>}
              {entry.images.length > 0 && (
                <div
                  className={`message-image-grid image-count-${Math.min(
                    entry.images.length,
                    4,
                  )}`}
                >
                  {entry.images.map((image) => (
                    <img src={image.src} alt={image.name} key={image.id} />
                  ))}
                </div>
              )}
            </article>
          ))
        ) : (
          <p className="empty-message">这里还空着，等第一张小纸条。</p>
        )}
      </div>
    </section>
  );
}
