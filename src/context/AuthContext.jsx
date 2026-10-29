import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/*
 * DEMO AUTH: accounts live in this browser's localStorage, and passwords are
 * salted + hashed with SHA-256 before they are saved. That is fine for a class
 * project or prototype. A real product needs a server (and a slow password
 * hash such as bcrypt or argon2) - see the README.
 */

const USERS_KEY = "mr_users";
const SESSION_KEY = "mr_session";
const LIKES_PREFIX = "mr_likes_";

const AuthContext = createContext(null);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

function makeSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hashPassword(password, salt) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Secure password hashing is not available. Open the app on localhost or HTTPS.");
  }
  const data = new TextEncoder().encode(salt + password);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Never expose the salt or hash to the rest of the app.
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readJSON(USERS_KEY, []));
  const [sessionId, setSessionId] = useState(() => readJSON(SESSION_KEY, null));

  useEffect(() => {
    writeJSON(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    try {
      if (sessionId) localStorage.setItem(SESSION_KEY, JSON.stringify(sessionId));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [sessionId]);

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.id === sessionId);
    return found ? publicUser(found) : null;
  }, [users, sessionId]);

  const signup = useCallback(
    async ({ name, email, password }) => {
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalized)) {
        throw new Error("An account with this email already exists. Log in instead.");
      }
      const salt = makeSalt();
      const hash = await hashPassword(password, salt);
      const user = {
        id: newId(),
        name: name.trim(),
        email: normalized,
        salt,
        hash,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, user]);
      setSessionId(user.id);
    },
    [users]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const normalized = email.trim().toLowerCase();
      const user = users.find((u) => u.email === normalized);
      const hash = user ? await hashPassword(password, user.salt) : null;
      // Same message for "no such email" and "wrong password".
      if (!user || hash !== user.hash) {
        throw new Error("Email or password is incorrect.");
      }
      setSessionId(user.id);
    },
    [users]
  );

  const logout = useCallback(() => setSessionId(null), []);

  const deleteAccount = useCallback(() => {
    if (!sessionId) return;
    try {
      localStorage.removeItem(LIKES_PREFIX + sessionId);
    } catch {
      /* ignore */
    }
    setUsers((prev) => prev.filter((u) => u.id !== sessionId));
    setSessionId(null);
  }, [sessionId]);

  const value = useMemo(
    () => ({ currentUser, signup, login, logout, deleteAccount }),
    [currentUser, signup, login, logout, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
