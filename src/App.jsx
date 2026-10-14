import { useMemo, useState } from 'react'
import {
  Header,
  SearchBar,
  StatsContainer,
  StudentForm,
  StudentList,
} from './components'
import { StudentProvider } from './context/StudentContext'
import { useStudents } from './hooks/useStudents'
import './App.css'

function App() {
  return (
    <StudentProvider>
      <SchoolDashboard />
    </StudentProvider>
  )
}

function SchoolDashboard() {
  const { students, attendance, settings, updateStudents, addStudent, markAttendance, updateSettings } = useStudents()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState('gestion')

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return students
    }

    return students.filter((student) =>
      [student.name, student.email, student.grade]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [searchTerm, students])

  const getAttendancePercentage = (studentId) => {
    const currentDayRecords = Object.entries(attendance).filter(([key]) =>
      key.startsWith(`${studentId}_`),
    )

    if (currentDayRecords.length === 0) {
      return 0
    }

    const presentCount = currentDayRecords.filter(([, value]) => value.present).length
    return Math.round((presentCount / currentDayRecords.length) * 100)
  }

  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeStudents = students.filter((student) => student.active).length
    const averageAge = totalStudents
      ? (students.reduce((sum, student) => sum + Number(student.age), 0) / totalStudents).toFixed(1)
      : '0'
    const today = new Date().toLocaleDateString('es-ES')
    const presentToday = students.filter(
      (student) => attendance[`${student.id}_${today}`]?.present,
    ).length
    const attendanceRate = totalStudents ? Math.round((presentToday / totalStudents) * 100) : 0

    return [
      { title: 'Estudiantes', value: totalStudents, subtitle: `${activeStudents} activos` },
      { title: 'Activos', value: activeStudents, subtitle: `${totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 0}% del total` },
      { title: 'Edad promedio', value: averageAge, subtitle: 'años' },
      { title: 'Asistencia', value: `${attendanceRate}%`, subtitle: 'hoy' },
    ]
  }, [attendance, students])

  const gradeStats = useMemo(() => ['1ro', '2do', '3ro'].map((grade) => {
    const gradeStudents = students.filter((student) => student.grade === grade)
    return {
      grade,
      total: gradeStudents.length,
      active: gradeStudents.filter((student) => student.active).length,
      averageAge: gradeStudents.length
        ? (gradeStudents.reduce((sum, student) => sum + Number(student.age), 0) / gradeStudents.length).toFixed(1)
        : '0.0',
    }
  }), [students])

  const exportStudents = () => {
    const rows = [
      ['Nombre', 'Correo', 'Edad', 'Grado', 'Estado'],
      ...students.map((student) => [student.name, student.email, student.age, student.grade, student.active ? 'Activo' : 'Inactivo']),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'estudiantes.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="dashboard-main">
        <aside className="sidebar-panel">
          <div className="welcome-card">
            <p className="eyebrow">Panel general</p>
            <h2>¡Buen día, {settings.directorName}!</h2>
            <p>Hoy tienes 3 tareas pendientes y 2 reuniones.</p>
          </div>

          <div className="mini-card">
            <span className="mini-label">Franja horaria</span>
            <strong>8:00 - 12:00</strong>
            <small>Clases en curso</small>
          </div>

          <div className="mini-card accent">
            <span className="mini-label">Próximo evento</span>
            <strong>Festival académico</strong>
            <small>Viernes, 9:00 a.m.</small>
          </div>
        </aside>

        <section className="content-panel">
          <div className="topbar">
            <div>
              <p className="eyebrow">Resumen académico</p>
              <h1>Administración del colegio</h1>
            </div>
            <button type="button" className="primary-button" onClick={() => setCurrentPage('gestion')}>
              + Nuevo registro
            </button>
          </div>

          <nav className="page-tabs" aria-label="Vistas del sistema">
            {[
              ['gestion', 'Gestión'],
              ['reportes', 'Reportes'],
              ['configuracion', 'Configuración'],
            ].map(([page, label]) => (
              <button
                key={page}
                type="button"
                className={currentPage === page ? 'page-tab active' : 'page-tab'}
                aria-current={currentPage === page ? 'page' : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {label}
              </button>
            ))}
          </nav>

          {currentPage === 'gestion' ? (
            <>
              <StatsContainer stats={stats} />

              <div className="toolbar">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
                <button type="button" className="ghost-button" onClick={exportStudents}>
                  Exportar CSV
                </button>
              </div>

              <StudentForm students={students} onAddStudent={addStudent} />
              <StudentList
                students={filteredStudents}
                onStudentsChange={updateStudents}
                searchTerm={searchTerm}
                attendance={attendance}
                onAttendanceChange={markAttendance}
                getAttendancePercentage={getAttendancePercentage}
              />
            </>
          ) : null}

          {currentPage === 'reportes' ? (
            <section className="view-section" aria-labelledby="reports-heading">
              <div className="view-heading">
                <p className="eyebrow">Análisis académico</p>
                <h2 id="reports-heading">Reportes por grado</h2>
                <p>Resumen actualizado con los datos compartidos del sistema.</p>
              </div>
              <StatsContainer stats={stats} />
              <div className="report-table-wrap">
                <table>
                  <thead>
                    <tr><th>Grado</th><th>Estudiantes</th><th>Activos</th><th>Edad promedio</th></tr>
                  </thead>
                  <tbody>
                    {gradeStats.map((item) => (
                      <tr key={item.grade}>
                        <td>{item.grade}</td><td>{item.total}</td><td>{item.active}</td><td>{item.averageAge} años</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {currentPage === 'configuracion' ? (
            <section className="view-section settings-view" aria-labelledby="settings-heading">
              <div className="view-heading">
                <p className="eyebrow">Preferencias</p>
                <h2 id="settings-heading">Configuración del sistema</h2>
                <p>Estos ajustes y los registros se conservan en este navegador.</p>
              </div>
              <label className="setting-field">
                <span>Nombre del colegio</span>
                <input
                  value={settings.schoolName}
                  onChange={(event) => updateSettings({ schoolName: event.target.value })}
                  maxLength={60}
                />
              </label>
              <label className="setting-field">
                <span>Nombre de dirección</span>
                <input
                  value={settings.directorName}
                  onChange={(event) => updateSettings({ directorName: event.target.value })}
                  maxLength={50}
                />
              </label>
              <label className="setting-field">
                <span>Grado predeterminado para nuevos registros</span>
                <select
                  value={settings.defaultGrade}
                  onChange={(event) => updateSettings({ defaultGrade: event.target.value })}
                >
                  <option value="1ro">1ro</option>
                  <option value="2do">2do</option>
                  <option value="3ro">3ro</option>
                </select>
              </label>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(event) => updateSettings({ notifications: event.target.checked })}
                />
                <span>Mostrar confirmaciones al registrar estudiantes</span>
              </label>
            </section>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default App
