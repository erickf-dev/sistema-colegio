import { useMemo, useState } from 'react'

const ITEMS_PER_PAGE = 5

export default function StudentList({
  students,
  onStudentsChange,
  searchTerm,
  attendance,
  onAttendanceChange,
  getAttendancePercentage,
}) {
  const [gradeFilter, setGradeFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    email: '',
    age: '',
    grade: '1ro',
  })

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        [student.name, student.email, student.grade].join(' ').toLowerCase().includes(query)

      const matchesGrade = gradeFilter === 'todos' || student.grade === gradeFilter
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && student.active) ||
        (statusFilter === 'inactivos' && !student.active)

      return matchesSearch && matchesGrade && matchesStatus
    })
  }, [gradeFilter, searchTerm, statusFilter, students])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  )

  const handleGradeFilterChange = (value) => {
    setGradeFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleDelete = () => {
    if (!studentToDelete) {
      return
    }

    onStudentsChange((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentToDelete.id),
    )
    setStudentToDelete(null)
  }

  const startEditing = (student) => {
    setIsEditing(true)
    setEditForm({
      id: student.id,
      name: student.name,
      email: student.email,
      age: student.age,
      grade: student.grade,
    })
  }

  const handleEditChange = (field, value) => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const saveEdition = () => {
    const trimmedName = editForm.name.trim()
    const trimmedEmail = editForm.email.trim().toLowerCase()
    const numericAge = Number(editForm.age)

    if (!trimmedName || !trimmedEmail || !Number.isInteger(numericAge) || numericAge <= 0) {
      return
    }

    onStudentsChange((currentStudents) =>
      currentStudents.map((student) =>
        student.id === editForm.id
          ? {
              ...student,
              name: trimmedName,
              email: trimmedEmail,
              age: numericAge,
              grade: editForm.grade,
              dateUpdated: new Date().toLocaleDateString('es-ES'),
            }
          : student,
      ),
    )

    setIsEditing(false)
  }

  return (
    <section className="student-panel">
      <div className="table-header">
        <div>
          <p className="eyebrow">Matriculados</p>
          <h3>Lista de estudiantes</h3>
        </div>
        <span className="badge">{filteredStudents.length} registros</span>
      </div>

      <div className="filter-panel">
        <div className="filter-group">
          <label htmlFor="grade-filter">Grado</label>
          <select
            id="grade-filter"
            value={gradeFilter}
            onChange={(event) => handleGradeFilterChange(event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="1ro">1ro</option>
            <option value="2do">2do</option>
            <option value="3ro">3ro</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => handleStatusFilterChange(event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <div className="results-summary">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          No hay estudiantes que coincidan con los filtros actuales.
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Grado</th>
                  <th>Edad</th>
                  <th>Estado</th>
                  <th>Asistencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id ?? `${student.name}-${student.email}`}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.grade}</td>
                    <td>{student.age}</td>
                    <td>
                      <span className={student.active ? 'status-pill status-active' : 'status-pill status-inactive'}>
                        {student.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-actions">
                        <button
                          type="button"
                          className={attendance[`${student.id}_${new Date().toLocaleDateString('es-ES')}`]?.present ? 'attendance-button active' : 'attendance-button'}
                          onClick={() => onAttendanceChange(student.id, true)}
                        >
                          ✓ Presente
                        </button>
                        <button
                          type="button"
                          className={attendance[`${student.id}_${new Date().toLocaleDateString('es-ES')}`]?.present === false ? 'attendance-button inactive' : 'attendance-button'}
                          onClick={() => onAttendanceChange(student.id, false)}
                        >
                          ✕ Ausente
                        </button>
                      </div>
                      <small className="attendance-rate">{getAttendancePercentage(student.id)}% de asistencia</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={() => startEditing(student)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="action-button danger"
                          onClick={() => setStudentToDelete(student)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              type="button"
              className="page-button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            >
              ← Anterior
            </button>

            <span className="page-indicator">
              Página {safeCurrentPage} de {totalPages}
            </span>

            <button
              type="button"
              className="page-button"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      {studentToDelete ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Deseas eliminar a <strong>{studentToDelete.name}</strong> de la lista?
            </p>
            <div className="modal-actions">
              <button type="button" className="action-button secondary" onClick={() => setStudentToDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="action-button danger" onClick={handleDelete}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Editar estudiante</h3>

            <div className="form-grid modal-form">
              <label>
                <span>Nombre</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) => handleEditChange('name', event.target.value)}
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => handleEditChange('email', event.target.value)}
                />
              </label>

              <label>
                <span>Edad</span>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(event) => handleEditChange('age', event.target.value)}
                />
              </label>

              <label className="full-width">
                <span>Grado</span>
                <select
                  value={editForm.grade}
                  onChange={(event) => handleEditChange('grade', event.target.value)}
                >
                  <option value="1ro">1ro</option>
                  <option value="2do">2do</option>
                  <option value="3ro">3ro</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="action-button secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={saveEdition}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
