/**
 * Plays a sound file without tracking it.
 * Use this for quick one-shot sounds (correct, wrong, fanfare).
 * Paths without a leading '/' are resolved relative to /sounds/.
 */
export const playSound = (fileOrPath) => {
  if (!fileOrPath) return;
  const path = fileOrPath.startsWith('/') ? fileOrPath : `/sounds/${fileOrPath}`;
  new Audio(path).play().catch(() => {});
};
