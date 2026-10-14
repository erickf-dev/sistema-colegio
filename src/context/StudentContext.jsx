import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { StudentContext } from './studentContext'
import { ACTIONS, studentReducer } from './studentReducer'

const STORAGE_KEY = 'sistema-colegio-state'

const initialStudents = [
  { id: 1, name: 'Ana María Pérez', email: 'ana.perez@colegio.edu', age: 14, grade: '1ro', active: true, dateRegistered: '12/09/2025' },
  { id: 2, name: 'Mateo García', email: 'mateo.garcia@colegio.edu', age: 15, grade: '2do', active: true, dateRegistered: '14/09/2025' },
  { id: 3, name: 'Valentina López', email: 'valentina.lopez@colegio.edu', age: 16, grade: '3ro', active: false, dateRegistered: '17/09/2025' },
  { id: 4, name: 'Sebastián Ruiz', email: 'sebastian.ruiz@colegio.edu', age: 13, grade: '1ro', active: true, dateRegistered: '20/09/2025' },
  { id: 5, name: 'Lucía Torres', email: 'lucia.torres@colegio.edu', age: 17, grade: '3ro', active: true, dateRegistered: '21/09/2025' },
  { id: 6, name: 'Camilo Rojas', email: 'camilo.rojas@colegio.edu', age: 14, grade: '2do', active: false, dateRegistered: '22/09/2025' },
  { id: 7, name: 'Sofía Mendoza', email: 'sofia.mendoza@colegio.edu', age: 15, grade: '1ro', active: true, dateRegistered: '23/09/2025' },
  { id: 8, name: 'Daniel Castro', email: 'daniel.castro@colegio.edu', age: 16, grade: '2do', active: true, dateRegistered: '24/09/2025' },
]

const defaultState = {
  students: initialStudents,
  attendance: {},
  settings: {
    schoolName: 'Sistema Colegio',
    directorName: 'Adriana',
    defaultGrade: '1ro',
    notifications: true,
  },
}

function loadInitialState() {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY)
    if (!storedState) return defaultState

    const parsedState = JSON.parse(storedState)
    return {
      students: Array.isArray(parsedState.students) ? parsedState.students : defaultState.students,
      attendance: parsedState.attendance && typeof parsedState.attendance === 'object'
        ? parsedState.attendance
        : {},
      settings: { ...defaultState.settings, ...parsedState.settings },
    }
  } catch {
    return defaultState
  }
}

export function StudentProvider({ children }) {
  const [state, dispatch] = useReducer(studentReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable or full; the in-memory state remains usable.
    }
  }, [state])

  const updateStudents = useCallback((studentsOrUpdater) => {
    dispatch({ type: ACTIONS.UPDATE_STUDENTS, payload: studentsOrUpdater })
  }, [])

  const addStudent = useCallback((student) => {
    dispatch({
      type: ACTIONS.UPDATE_STUDENTS,
      payload: (students) => [...students, student],
    })
  }, [])

  const markAttendance = useCallback((studentId, present) => {
    dispatch({
      type: ACTIONS.MARK_ATTENDANCE,
      payload: { studentId, present, date: new Date().toLocaleDateString('es-ES') },
    })
  }, [])

  const updateSettings = useCallback((settings) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings })
  }, [])

  const value = useMemo(() => ({
    ...state,
    updateStudents,
    addStudent,
    markAttendance,
    updateSettings,
  }), [state, updateStudents, addStudent, markAttendance, updateSettings])

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}