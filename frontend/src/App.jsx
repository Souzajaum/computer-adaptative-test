import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "./components/header/Header";
import Quiz from "./components/quiz/Quiz";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
    };

    getSession();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header user={user} />
      </div>

      {/* Espaço para compensar o Header fixo */}
      <div className="pt-[80px] px-4 flex-1">
        {user ? (
          <Quiz />
        ) : (
          <p className="text-center text-gray-600 text-lg mt-10">
            Você precisa estar logado para acessar o quiz.
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
