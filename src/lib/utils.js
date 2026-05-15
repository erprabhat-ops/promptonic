import { CATS } from "../constants/index.js";

export const cc = (id) => CATS.find(c => c.id === id)?.color || "#a78bfa";

export const timeAgo = (ts) => {
  const d = (Date.now() - ts) / 1000;
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};
