import TarjetaIniciativa from './TarjetaIniciativa'
export default function ListaIniciativas({ iniciativas = [] }) {
  return (
    <div className="row g-4">
      {iniciativas.map((iniciativa) => (
        <div className="col-md-6 col-xl-4" key={iniciativa._id}>
          <TarjetaIniciativa iniciativa={iniciativa} />
        </div>
      ))}
    </div>
  )
}
