export const ACTIONS = {
  UPDATE_STUDENTS: 'UPDATE_STUDENTS',
  MARK_ATTENDANCE: 'MARK_ATTENDANCE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
}

export function studentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_STUDENTS:
      return {
        ...state,
        students:
          typeof action.payload === 'function'
            ? action.payload(state.students)
            : action.payload,
      }
    case ACTIONS.MARK_ATTENDANCE: {
      const { studentId, date, present } = action.payload
      return {
        ...state,
        attendance: {
          ...state.attendance,
          [`${studentId}_${date}`]: { present },
        },
      }
    }
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    default:
      return state
  }
}