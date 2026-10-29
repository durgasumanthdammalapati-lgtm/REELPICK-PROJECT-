import { useCallback, useEffect, useState } from "react";

const LIKES_PREFIX = "mr_likes_";

function load(key) {
  try {
    const ids = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

/** Each account gets its own list of liked movie ids. */
export function useLikes(userId) {
  const key = LIKES_PREFIX + userId;
  const [liked, setLiked] = useState(() => load(key));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(liked));
    } catch {
      /* storage unavailable: picks just won't persist */
    }
  }, [key, liked]);

  const toggleLike = useCallback(
    (id) => setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const clearLikes = useCallback(() => setLiked([]), []);

  return { liked, toggleLike, clearLikes };
}
