import { createCourse, type Course } from "./gpa";
import { DEFAULT_SCALE_KEY, type ScaleKey } from "./gradingScales";

export interface CalculatorState {
  semester: string;
  scaleKey: ScaleKey;
  courses: Course[];
  /** Id of a course that was just added, so the UI can focus its name field. */
  lastAddedId: string | null;
}

export type CalculatorAction =
  | { type: "SET_SEMESTER"; semester: string }
  | { type: "SET_SCALE"; scaleKey: ScaleKey }
  | { type: "ADD_COURSE" }
  | { type: "REMOVE_COURSE"; id: string }
  | { type: "UPDATE_COURSE"; id: string; patch: Partial<Omit<Course, "id">> }
  | { type: "LOAD_SEMESTER"; semester: string; scaleKey: ScaleKey; courses: Course[] };

export const DEFAULT_SEMESTER = "Fall 2026";

// Fixed ids (rather than crypto.randomUUID()) so server-rendered markup and
// the client's first render agree — random ids here would mismatch on hydration.
function createStaticCourse(id: string, name: string, grade: string, credits: string): Course {
  return { id, name, grade, credits };
}

export function createInitialCourses(): Course[] {
  return [
    createStaticCourse("default-1", "Calculus I", "A-", "4"),
    createStaticCourse("default-2", "General Chemistry", "B+", "4"),
    createStaticCourse("default-3", "English Composition", "A", "3"),
    createStaticCourse("default-4", "Psychology", "A-", "3"),
  ];
}

export function createInitialState(): CalculatorState {
  return {
    semester: DEFAULT_SEMESTER,
    scaleKey: DEFAULT_SCALE_KEY,
    courses: createInitialCourses(),
    lastAddedId: null,
  };
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case "SET_SEMESTER":
      return { ...state, semester: action.semester };
    case "SET_SCALE":
      return { ...state, scaleKey: action.scaleKey };
    case "ADD_COURSE": {
      const course = createCourse("", "A", "3");
      return { ...state, courses: [...state.courses, course], lastAddedId: course.id };
    }
    case "REMOVE_COURSE":
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.id),
        lastAddedId: state.lastAddedId === action.id ? null : state.lastAddedId,
      };
    case "UPDATE_COURSE":
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c
        ),
      };
    case "LOAD_SEMESTER":
      return {
        semester: action.semester,
        scaleKey: action.scaleKey,
        courses: action.courses,
        lastAddedId: null,
      };
    default:
      return state;
  }
}
