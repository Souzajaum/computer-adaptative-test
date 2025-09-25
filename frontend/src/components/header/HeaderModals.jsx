import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

// Formulário de login
const LoginForm = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Preencha email e senha.");
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user && onLoginSuccess) {
        onLoginSuccess(data.user);
        setEmail("");
        setPassword("");
        onClose();
      }
    } catch (err) {
      alert("Erro ao logar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded border border-gray-300 text-black"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded border border-gray-300 text-black"
      />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </div>
  );
};

// Formulário de cadastro
const SignupForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName)
      return alert("Preencha todos os campos.");
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      alert("Cadastro realizado! Verifique seu email para confirmar a conta.");
      setEmail("");
      setPassword("");
      setFullName("");
      onClose();
    } catch (err) {
      alert("Erro no cadastro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Nome completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="p-2 rounded border border-gray-300 text-black"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded border border-gray-300 text-black"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded border border-gray-300 text-black"
      />
      <Button onClick={handleSignup} disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </div>
  );
};

// Componente principal de modais
const HeaderModals = ({
  openLoginModal,
  setOpenLoginModal,
  openSignupModal,
  setOpenSignupModal,
  onLoginSuccess,
}) => {
  return (
    <>
      {/* Modal de Login */}
      <Modal
        open={openLoginModal}
        onOpenChange={setOpenLoginModal}
        title="Login"
      >
        <LoginForm
          onClose={() => setOpenLoginModal(false)}
          onLoginSuccess={onLoginSuccess}
        />
      </Modal>

      {/* Modal de Cadastro */}
      <Modal
        open={openSignupModal}
        onOpenChange={setOpenSignupModal}
        title="Cadastro"
      >
        <SignupForm onClose={() => setOpenSignupModal(false)} />
      </Modal>
    </>
  );
};

export default HeaderModals;
