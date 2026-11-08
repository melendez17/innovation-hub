function Panel({ titulo, children }) {
  return (
    <section className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 card-title mb-3">{titulo}</h2>
        {children}
      </div>
    </section>
  )
}

export default Panel