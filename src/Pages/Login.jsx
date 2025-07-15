import { useRef, useState } from "react";
import image from "../assets/loginImage.png"


export default function Login({ onLogin }) {
  const inputRef = useRef(null);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [errors, setErrors] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    let tempErrors = [];

    if (nome.trim() !== "Guest" || senha.trim() !== "welcome123") {
      tempErrors.push("Usuário ou senha inválidos. Tente novamente.");
      setErrors(tempErrors);
    } else {
      setErrors([]);
      onLogin(nome);
    }
  }

  function handleClean(e) {
    e.preventDefault();
    setNome("");
    setSenha("");
    setErrors([]);
    inputRef.current.focus();
  }

  return (
   <div className="min-h-screen flex flex-col items-center justify-start bg-white space-y-2 px-4 pt-8">
      <img src={image} 
       alt="Imagem" 
       className="w-full max-w-xs object-contain mx-auto mb-2 "
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white border-4 border-green-600 p-8 rounded-3xl shadow-lg w-full max-w-sm space-y-2"
      >
        <h2 className="text-3xl font-semibold rond text-green-700 text-center">
          Aceder à sua Conta
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="nome" className="block text-green-700 mb-2 font-medium">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              ref={inputRef}
              value={nome}
              placeholder="Insira aqui o seu nome"
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-400 transition"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-green-700 mb-2 font-medium">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={senha}
              placeholder="Insira aqui sua senha"
              onChange={(e) => setSenha(e.target.value)}
              className="w-full mb-2 px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-400 transition"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1">
            {errors.map((error, i) => (
              <li
                key={i}
                className="text-sm text-red-600 font-semibold text-center"
              >
                {error}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-shadow shadow-md hover:shadow-lg font-semibold"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={handleClean}
            className="w-full bg-green-100 text-green-700 py-3 rounded-xl hover:bg-green-200 transition font-semibold"
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}
