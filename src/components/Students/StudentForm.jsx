import { useState } from 'react'
import { useStudents } from '../../hooks/useStudents'

export default function StudentForm({ students, onAddStudent }) {
  const { settings } = useStudents()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [grade, setGrade] = useState(settings.defaultGrade)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const nextErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const ageValue = Number(age)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedName) {
      nextErrors.name = 'El nombre es obligatorio.'
    }

    if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Ingresa un email válido.'
    }

    if (students.some((student) => student.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      nextErrors.email = 'Este email ya está registrado.'
    }

    if (!Number.isInteger(ageValue) || ageValue <= 0 || ageValue > 120) {
      nextErrors.age = 'La edad debe estar entre 1 y 120 años.'
    }

    if (!grade) {
      nextErrors.grade = 'Selecciona un grado.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const newStudent = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: Number(age),
        grade,
        active: true,
        dateRegistered: new Date().toLocaleDateString('es-ES'),
      }

      onAddStudent(newStudent)

      setName('')
      setEmail('')
      setAge('')
      setGrade(settings.defaultGrade)
      setErrors({})
      setIsSubmitting(false)
      setIsSuccess(settings.notifications)

      window.setTimeout(() => setIsSuccess(false), 2600)
    }, 400)
  }

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <div>
          <p className="eyebrow">Registro</p>
          <h3>Agregar estudiante</h3>
        </div>
      </div>

      {isSuccess ? <div className="success-message">✓ Estudiante agregado correctamente</div> : null}

      <div className="form-grid">
        <label>
          <span>Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Camila Torres"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ej. correo@colegio.edu"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email ? <small className="field-error">{errors.email}</small> : null}
        </label>

        <label>
          <span>Edad</span>
          <input
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Ej. 15"
            className={errors.age ? 'input-error' : ''}
            min="1"
            max="120"
          />
          {errors.age ? <small className="field-error">{errors.age}</small> : null}
        </label>

        <label className="full-width">
          <span>Grado</span>
          <select
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className={errors.grade ? 'input-error' : ''}
          >
            <option value="1ro">1ro</option>
            <option value="2do">2do</option>
            <option value="3ro">3ro</option>
          </select>
          {errors.grade ? <small className="field-error">{errors.grade}</small> : null}
        </label>
      </div>

      <button type="submit" className="primary-button form-button" disabled={isSubmitting}>
        {isSubmitting ? 'Agregando...' : 'Guardar estudiante'}
      </button>
    </form>
  )
}
