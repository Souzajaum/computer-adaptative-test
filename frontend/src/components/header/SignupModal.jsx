import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const SignupModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const open = () => onOpenChange(true);
    document.addEventListener("openSignup", open);
    return () => document.removeEventListener("openSignup", open);
  }, [onOpenChange]);

  const validateFields = () => {
    if (!fullName) return "Nome completo é obrigatório.";
    if (!phone || phone.length < 8) return "Telefone inválido.";
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Email inválido.";
    if (!password || password.length < 6)
      return "Senha precisa ter ao menos 6 caracteres.";
    return null;
  };

  const handleSignup = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://computer-adaptative-test-v11.vercel.app",
        data: { full_name: fullName, phone, city },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccessMsg("Cadastro realizado! Verifique seu e-mail para confirmar.");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setCity("");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastro</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar sua conta.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {successMsg ? (
            <p className="text-green-600 text-sm">{successMsg}</p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button onClick={handleSignup} disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
