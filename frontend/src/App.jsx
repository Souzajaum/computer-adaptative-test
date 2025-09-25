import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "./components/header/Header.jsx";
import Quiz from "./components/quiz/Quiz";
import { Button } from "./components/ui/button";
import HeaderModals from "./components/header/HeaderModals.jsx";
import ilustracao from "./assets/estudantepc.png";
import Benefits from "./components/benefits/Benefits.jsx";
import Footer from "./components/footer/footer.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  // Modais
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  // Checa sessão ao carregar
  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listener de autenticação
    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup seguro
    return () => {
      if (listener?.data?.subscription?.unsubscribe) {
        listener.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Acessar sistema
  const handleAccessSystem = () => {
    if (user) {
      setActiveTab("quiz");
    } else {
      setLoginModalOpen(true);
    }
  };

  // Callback login bem-sucedido
  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    setLoginModalOpen(false);
    setActiveTab("quiz");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          user={user}
          setUser={setUser}
          openLoginModal={loginModalOpen}
          setOpenLoginModal={setLoginModalOpen}
          openSignupModal={signupModalOpen}
          setOpenSignupModal={setSignupModalOpen}
        />
      </div>

      <div className="pt-[80px] px-6 flex-1 flex flex-col items-center w-full">
        {activeTab === "home" && (
          <>
            <div className="bg-white w-full min-h-[40vh] md:min-h-[45vh] shadow-md rounded-lg p-8 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 flex flex-col justify-center mb-6 md:mb-0 pr-0 md:pr-6 text-black">
                <div className="flex flex-col space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold pb-4">
                    Testes Adaptativos Informatizados
                  </h1>
                  <p className="pb-4">
                    Teste seus conhecimentos com quizzes adaptativos e
                    interativos. 🚀
                  </p>
                  <Button onClick={handleAccessSystem} className="mb-4">
                    Acessar Sistema
                  </Button>
                  {!user && (
                    <p className="pb-4">
                      Faça login ou cadastre-se para iniciar o quiz.
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 flex justify-center items-center">
                <img
                  src={ilustracao}
                  alt="Estudante no computador"
                  className="w-full max-w-[350px] md:max-w-[400px] h-auto rounded-lg"
                />
              </div>
            </div>

            <Benefits />
          </>
        )}

        {activeTab === "quiz" && user && (
          <Quiz user={user} onFinish={() => setActiveTab("home")} />
        )}
      </div>

      {/* Footer só aparece fora do quiz */}
      {activeTab !== "quiz" && (
        <div className="flex justify-center items-center w-full">
          <Footer />
        </div>
      )}

      {/* Modais */}
      <HeaderModals
        openLoginModal={loginModalOpen}
        setOpenLoginModal={setLoginModalOpen}
        openSignupModal={signupModalOpen}
        setOpenSignupModal={setSignupModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
