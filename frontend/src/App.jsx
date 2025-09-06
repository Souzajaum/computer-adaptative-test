import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "./components/header/Header";
import Quiz from "./components/quiz/Quiz";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // pega sessão atual
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    // atualiza ao logar/sair
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header user={user} setUser={setUser} />
      </div>

      {/* Espaço para compensar o Header fixo */}
      <div className="pt-[80px] px-4 flex-1">
        <Quiz user={user} />
      </div>
    </div>
  );
};

export default App;
