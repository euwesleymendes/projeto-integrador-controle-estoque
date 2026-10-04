export default function Campo({ id, rotulo, obrigatorio, erro, children }) {
  return (
    <div className={erro ? 'campo com-erro' : 'campo'}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="obrigatorio"> *</span>}
      </label>
      {children}
      {erro && <span className="mensagem-erro">{erro}</span>}
    </div>
  );
}
