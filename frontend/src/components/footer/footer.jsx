// src/components/Footer.jsx
import { Link } from "react-router-dom";
import logoufsm from "../../assets/logoufsm.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Links Rápidos */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">Links Rápidos</h3>
          <ul className="space-y-1">
            <li className="p-2">
              <Link to="/" className="hover:text-white transition-colors">
                Início
              </Link>
            </li>
            <li className="p-2">
              <Link to="/login" className="hover:text-white transition-colors">
                Login
              </Link>
            </li>
            <li className="p-2">
              <Link to="/signup" className="hover:text-white transition-colors">
                Cadastro
              </Link>
            </li>
          </ul>
        </div>

        {/* Logo */}
        <div className="flex-1 flex justify-center md:justify-center">
          <img
            src={logoufsm}
            alt="Logo universidade federal de santa maria"
            className="w-full max-w-[140px] h-auto rounded-lg"
          />
        </div>

        {/* Universidade */}
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-xl font-bold mb-2">
            Universidade Federal de Santa Maria
          </h3>
          <p className="text-gray-400 text-sm">
            Sistema de Testes Adaptativos Informatizados desenvolvido por Nilton
            Filho e João Souza com orientação do Profº Fernando Junior
          </p>
        </div>
      </div>

      {/* Direitos */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        © 2025 UFSM. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
