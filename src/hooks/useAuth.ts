// This file is kept for backward compatibility.
// All auth logic lives in src/contexts/AuthContext.tsx
// Re-export useAuth so existing imports from "@/hooks/useAuth" still work.
export { useAuth } from "@/contexts/AuthContext";
export type { } from "@/contexts/AuthContext";
