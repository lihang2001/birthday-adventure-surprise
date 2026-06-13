const externalAssetPattern = /^(?:[a-z]+:)?\/\//i;

export function assetPath(src: string) {
  if (
    !src ||
    externalAssetPattern.test(src) ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  if (!src.startsWith("/")) return src;

  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}${src}`;
}
