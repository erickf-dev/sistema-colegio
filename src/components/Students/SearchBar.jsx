export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-box">
      <span>Buscar</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nombre, email o grado"
      />
    </label>
  )
}
