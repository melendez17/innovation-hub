export default function Competencias({ valores = [] }) {
  return valores.length ? (
    <ul className="competencias-texto">
      {valores.map((valor) => (
        <li key={valor._id}>{valor.nombre}</li>
      ))}
    </ul>
  ) : (
    <span className="texto-secundario">Sin competencias registradas</span>
  )
}
