export default function Aviso({ aviso }) {
  if (!aviso) return null;
  return (
    <div className={`aviso aviso-${aviso.tipo}`} role="alert">
      {aviso.texto}
    </div>
  );
}
