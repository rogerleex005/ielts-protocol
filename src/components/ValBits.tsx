import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { RankDef } from "@/lib/game";
import { speak } from "@/lib/speech";

/* 小红色竖条 + 大写标题 */
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 bg-val-red" />
        <h2 className="val-title text-sm text-val-text">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function ValButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "teal";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-val-red text-white hover:bg-val-red2 active:bg-val-red2",
    teal: "bg-val-teal text-val-bg hover:brightness-110",
    ghost: "bg-transparent border border-val-line text-val-text hover:border-val-red hover:text-val-red",
    danger: "bg-[#3a1d24] border border-val-red/60 text-val-red hover:bg-val-red hover:text-white",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "clip-btn val-title min-h-[44px] px-5 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function RankChip({ rank, size = "md" }: { rank: RankDef; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "clip-tag val-title inline-flex items-center gap-1.5",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
      style={{ background: `${rank.color}22`, color: rank.color, border: `1px solid ${rank.color}66` }}
    >
      <span
        className="inline-block h-2 w-2 rotate-45"
        style={{ background: rank.color, boxShadow: `0 0 6px ${rank.color}` }}
      />
      {rank.cnName}
    </span>
  );
}

export function XpBar({ rank, xp }: { rank: RankDef; xp: number }) {
  const cur = xp - rank.minXp;
  const need = rank.nextXp !== null ? rank.nextXp - rank.minXp : 1;
  const pct = Math.min(100, Math.round((cur / need) * 100));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[10px] text-val-dim">
        <span className="val-title">XP {xp}</span>
        <span>{rank.nextXp !== null ? `${cur}/${need}` : "MAX"}</span>
      </div>
      <div className="clip-tag h-2 w-full bg-val-panel2">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${rank.color}, #ff4655)` }}
        />
      </div>
    </div>
  );
}

export function SpeakerButton({ text, size = "md", className }: { text: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = size === "lg" ? "h-14 w-14 text-2xl" : size === "md" ? "h-11 w-11 text-lg" : "h-9 w-9 text-sm";
  return (
    <button
      aria-label="播放发音"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={cn(
        "clip-card-sm inline-flex items-center justify-center border border-val-line bg-val-panel2 text-val-teal transition-colors hover:border-val-teal active:bg-val-teal active:text-val-bg",
        dims,
        className
      )}
    >
      🔊
    </button>
  );
}

/* 任务状态徽标 */
export function StatusTag({ done, partial }: { done: boolean; partial?: boolean }) {
  if (done)
    return (
      <span className="clip-tag val-title bg-val-teal/15 px-2 py-0.5 text-[10px] text-val-teal border border-val-teal/40">
        ✓ 已完成
      </span>
    );
  if (partial)
    return (
      <span className="clip-tag val-title bg-val-gold/15 px-2 py-0.5 text-[10px] text-val-gold border border-val-gold/40">
        ◐ 进行中
      </span>
    );
  return (
    <span className="clip-tag val-title bg-val-panel2 px-2 py-0.5 text-[10px] text-val-dim border border-val-line">
      ○ 未开始
    </span>
  );
}
