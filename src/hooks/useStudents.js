import { useContext } from 'react'
import { StudentContext } from '../context/studentContext'

export function useStudents() {
  const context = useContext(StudentContext)

  if (!context) {
    throw new Error('useStudents debe usarse dentro de StudentProvider')
  }

  return context
}