/** Marcador para secciones que todavía no están listas. */
export function EnPreparacion({ titulo }: { titulo: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-marino">{titulo}</h1>
      <p className="text-lg">En preparación</p>
    </section>
  );
}
