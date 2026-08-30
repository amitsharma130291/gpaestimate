import { z } from "zod";
import { DEFAULT_SCALE_KEY, isScaleKey, type ScaleKey } from "./gradingScales";
import type { Course } from "./gpa";

const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  grade: z.string(),
  credits: z.string(),
});

const SemesterRecordSchema = z.object({
  semester: z.string(),
  scaleKey: z.string(),
  courses: z.array(CourseSchema),
  savedAt: z.string(),
});

export type SemesterRecord = z.infer<typeof SemesterRecordSchema>;

const STORAGE_KEY = "gpaestimate.savedSemesters.v1";

function readStore(): Record<string, SemesterRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const result = z.record(z.string(), SemesterRecordSchema).safeParse(parsed);
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, SemesterRecord>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage may be unavailable (private browsing quota, disabled storage) — fail silently.
  }
}

export function saveSemester(semester: string, scaleKey: ScaleKey, courses: Course[]): void {
  const store = readStore();
  store[semester] = {
    semester,
    scaleKey,
    courses,
    savedAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function loadSemester(semester: string): SemesterRecord | null {
  const store = readStore();
  return store[semester] ?? null;
}

export function listSavedSemesters(): SemesterRecord[] {
  return Object.values(readStore()).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function safeScaleKey(value: string): ScaleKey {
  return isScaleKey(value) ? value : DEFAULT_SCALE_KEY;
}
