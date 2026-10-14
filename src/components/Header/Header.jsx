import { useStudents } from '../../hooks/useStudents'

export default function Header() {
  const { settings } = useStudents()
  return (
    <header className="top-header">
      <div className="brand-block">
        <div className="brand-mark">SC</div>
        <div>
          <span className="brand-kicker">Colegio</span>
          <h2>{settings.schoolName}</h2>
        </div>
      </div>

      <nav className="main-nav" aria-label="Navegación principal">
        <a href="#">Inicio</a>
        <a href="#">Estudiantes</a>
        <a href="#">Docentes</a>
        <a href="#">Reportes</a>
      </nav>

      <div className="user-pill">
        <span className="user-avatar">AD</span>
        <div>
          <strong>Adriana</strong>
          <small>Directora</small>
        </div>
      </div>
    </header>
  )
}
