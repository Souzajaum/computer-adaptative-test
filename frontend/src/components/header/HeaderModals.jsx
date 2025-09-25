import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

const HeaderModals = ({
  openLoginModal,
  setOpenLoginModal,
  onLoginSuccess,
}) => {
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
        setOpenLoginModal(false);
      }
    } catch (err) {
      alert("Erro ao logar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={openLoginModal} onOpenChange={setOpenLoginModal} title="Login">
      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border border-gray-300"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-gray-300"
        />
        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </Modal>
  );
};

export default HeaderModals;
