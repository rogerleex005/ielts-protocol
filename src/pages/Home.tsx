import { useMemo, useState } from "react";
import type { DayRecord, SaveState } from "@/types";
import { addDaysStr, isDayAllDone, todayStr } from "@/lib/storage";
import { SectionHeader, StatusTag, ValButton } from "@/components/ValBits";
import { cn } from "@/lib/utils";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function Calendar({
  save,
  selected,
  onSelect,
}: {
  save: SaveState;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = todayStr();
  const [cursor, setCursor] = useState(() => new Date());

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    // Monday-first offset
    const offset = (first.getDay() + 6) % 7;
    const arr: Array<{ date: string; day: number } | null> = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({
        date: todayStr(new Date(cursor.getFullYear(), cursor.getMonth(), d)),
        day: d,
      });
    }
    return arr;
  }, [cursor]);

  const move = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(next);
  };

  const canGoNext = monthKey(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) <= monthKey(new Date());

  return (
    <div className="clip-card border border-val-line bg-val-panel p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => move(-1)}
          className="clip-card-sm flex h-11 w-11 items-center justify-center border border-val-line text-val-dim hover:border-val-red hover:text-val-red"
          aria-label="上个月"
        >
          ◀
        </button>
        <p className="val-title text-sm text-val-text">
          {cursor.getFullYear()} / {String(cursor.getMonth() + 1).padStart(2, "0")}
          <span className="ml-2 text-[10px] text-val-dim">OPS CALENDAR</span>
        </p>
        <button
          onClick={() => move(1)}
          disabled={!canGoNext}
          className="clip-card-sm flex h-11 w-11 items-center justify-center border border-val-line text-val-dim hover:border-val-red hover:text-val-red disabled:opacity-30"
          aria-label="下个月"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-val-dim">
        {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
          <div key={d} className="py-1 val-title">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const rec: DayRecord | undefined = save.daily[c.date];
          const isFuture = c.date > today;
          const isToday = c.date === today;
          const allDone = isDayAllDone(rec);
          const partial =
            !allDone &&
            !!rec &&
            (rec.newTask.done || rec.reviewTask.done || rec.quizTask.done || rec.readingTask.done);
          return (
            <button
              key={c.date}
              onClick={() => onSelect(c.date)}
              className={cn(
                "clip-card-sm flex min-h-[48px] flex-col items-center justify-center border text-sm transition-colors sm:min-h-[56px]",
                isToday
                  ? "border-val-red bg-val-red/15 text-val-text"
                  : selected === c.date
                    ? "border-val-teal/70 bg-val-teal/10 text-val-text"
                    : isFuture
                      ? "border-val-line/40 text-val-dim/40"
                      : "border-val-line/70 text-val-dim hover:border-val-line hover:text-val-text"
              )}
            >
              <span className={cn("val-title", isToday && "text-val-red")}>{c.day}</span>
              <span className="mt-0.5 text-[10px] leading-none">
                {allDone ? (
                  <span className="text-val-teal">✓</span>
                ) : partial ? (
                  <span className="text-val-gold">◐</span>
                ) : isFuture ? (
                  <span className="text-val-dim/30">·</span>
                ) : (
                  <span className="text-val-dim/60">○</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type MissionKind = "new" | "review" | "quiz" | "reading";

export function DayMissions({
  save,
  date,
  onLaunch,
}: {
  save: SaveState;
  date: string;
  onLaunch: (kind: MissionKind) => void;
}) {
  const today = todayStr();
  const rec = save.daily[date];
  const isToday = date === today;
  const isFuture = date > today;

  const missions: Array<{
    kind: MissionKind;
    icon: string;
    title: string;
    en: string;
    desc: string;
    done: boolean;
    partial: boolean;
  }> = rec
    ? [
        {
          kind: "new",
          icon: "🃏",
          title: "新词学习",
          en: "INTEL ACQUISITION",
          desc: rec.newTask.idxs.length > 0 ? `${rec.newTask.idxs.length} 个新单词` : "今日无新词",
          done: rec.newTask.done,
          partial: false,
        },
        {
          kind: "review",
          icon: "🔁",
          title: "战术复习",
          en: "RE-ENGAGEMENT",
          desc: rec.reviewTask.words.length > 0 ? `${rec.reviewTask.words.length} 个词到期` : "无到期复习",
          done: rec.reviewTask.done,
          partial: false,
        },
        {
          kind: "quiz",
          icon: "🎯",
          title: "靶场测验",
          en: "RANGE TRIAL",
          desc: rec.quizTask.locked
            ? "词汇量不足，先学新词"
            : rec.quizTask.done
              ? `${rec.quizTask.score}/${rec.quizTask.total} 命中`
              : "10 题混合测验",
          done: rec.quizTask.done,
          partial: false,
        },
        {
          kind: "reading",
          icon: "📡",
          title: "阅读理解",
          en: "RECON REPORT",
          desc: rec.readingTask.done
            ? `${rec.readingTask.correct}/${rec.readingTask.total} 正确`
            : "1 篇战术简报",
          done: rec.readingTask.done,
          partial: false,
        },
      ]
    : [];

  return (
    <div className="clip-card border border-val-line bg-val-panel p-4">
      <SectionHeader
        title={isToday ? `今日行动 // ${date}` : `行动记录 // ${date}`}
        right={rec && isDayAllDone(rec) ? <span className="val-title text-[10px] text-val-teal">ALL CLEAR ✓</span> : undefined}
      />
      {isFuture ? (
        <p className="py-6 text-center text-sm text-val-dim">
          🔒 该区域尚未解锁 —— 未来的任务到时才会下达。
        </p>
      ) : !rec ? (
        <p className="py-6 text-center text-sm text-val-dim">这一天没有行动记录。</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {missions.map((m) => (
            <button
              key={m.kind}
              disabled={!isToday}
              onClick={() => onLaunch(m.kind)}
              className={cn(
                "clip-card-sm flex min-h-[64px] items-center gap-3 border p-3 text-left transition-colors",
                m.done
                  ? "border-val-teal/40 bg-val-teal/5"
                  : "border-val-line bg-val-panel2 hover:border-val-red/60",
                !isToday && "cursor-default opacity-80"
              )}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="val-title block text-xs text-val-text">
                  {m.title} <span className="text-[9px] text-val-dim">// {m.en}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-val-dim">{m.desc}</span>
              </span>
              <StatusTag done={m.done} partial={m.partial} />
            </button>
          ))}
        </div>
      )}
      {isToday && rec && !isDayAllDone(rec) && (
        <p className="mt-3 text-[11px] text-val-dim">
          ▸ 完成全部 4 项任务可获得 <span className="text-val-gold">+50 XP</span> 每日行动奖励，并计入连续打卡。
        </p>
      )}
    </div>
  );
}

export function HomePage({
  save,
  totalWords,
  onLaunch,
}: {
  save: SaveState;
  totalWords: number;
  onLaunch: (kind: MissionKind) => void;
}) {
  const [selected, setSelected] = useState(todayStr());
  const learned = save.wordCursor;
  const pct = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 简报横幅 */}
      <div className="clip-card relative overflow-hidden border border-val-red/50 bg-gradient-to-r from-val-red/20 via-val-panel to-val-panel p-4">
        <div className="bg-stripes absolute inset-0" />
        <div className="relative">
          <p className="val-title text-[10px] tracking-[0.35em] text-val-red">MISSION BRIEFING</p>
          <h1 className="val-title mt-1 text-xl text-val-text sm:text-2xl">
            每日行动 <span className="text-val-dim">// DAILY PROTOCOL</span>
          </h1>
          <p className="mt-1 text-xs text-val-dim">
            已部署 {learned}/{totalWords} 词（{pct}%）· 每天 20 新词 + 复习 + 测验 + 阅读，特工。
          </p>
          <div className="clip-tag mt-2 h-1.5 w-full bg-val-panel2">
            <div
              className="h-full bg-gradient-to-r from-val-teal to-val-red transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <Calendar save={save} selected={selected} onSelect={setSelected} />
      <DayMissions save={save} date={selected} onLaunch={onLaunch} />

      {selected !== todayStr() && (
        <ValButton variant="ghost" className="w-full" onClick={() => setSelected(todayStr())}>
          返回今日 // BACK TO TODAY
        </ValButton>
      )}
      {save.createdAt === addDaysStr(todayStr(), 0) && save.wordCursor === 0 && (
        <p className="text-center text-[11px] text-val-dim">
          欢迎加入协议，特工。从今天的 4 项任务开始你的第一次行动。
        </p>
      )}
    </div>
  );
}
