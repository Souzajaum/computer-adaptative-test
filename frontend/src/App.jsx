import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "./components/header/Header.jsx";
import Quiz from "./components/quiz/Quiz";
import HeaderModals from "./components/header/HeaderModals.jsx";
import Benefits from "./components/benefits/Benefits.jsx";
import Footer from "./components/footer/footer.jsx";
import ilustracao from "./assets/estudantepc.png";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  // Captura a sessão atual ao carregar página
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const loggedUser = data.session?.user ?? null;
      setUser(loggedUser);

      if (loggedUser) setActiveTab("home"); // Home logado após email
    };
    getSession();

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setActiveTab("home");
    });

    return () => listener.data.subscription.unsubscribe();
  }, []);

  const handleAccessSystem = () => {
    if (user) setActiveTab("quiz");
    else setLoginModalOpen(true);
  };

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    setLoginModalOpen(false);
    setSignupModalOpen(false);
    setActiveTab("quiz");
  };

  const handleSignupSuccess = (loggedUser) => {
    setUser(loggedUser);
    setSignupModalOpen(false);
    setActiveTab("home"); // Home logado após cadastro
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
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
            <div className="bg-white w-full min-h-[40vh] md:min-h-[45vh] shadow-md rounded-lg p-8 flex flex-col md:flex-row items-center text-black">
              <div className="w-full md:w-1/2 flex flex-col justify-center mb-6 md:mb-0 pr-0 md:pr-6">
                <h1 className="text-3xl md:text-4xl font-bold pb-4">
                  Testes Adaptativos Informatizados
                </h1>
                <p className="pb-4">
                  Teste seus conhecimentos com quizzes adaptativos e
                  interativos. 🚀
                </p>
                <button
                  onClick={handleAccessSystem}
                  className="mb-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                >
                  Acessar Sistema
                </button>
                {!user && <p>Faça login ou cadastre-se para iniciar o quiz.</p>}
              </div>

              <div className="w-full md:w-1/2 flex justify-center items-center">
                <img
                  src={ilustracao}
                  alt="Estudante no computador"
                  className="w-full max-w-[400px] h-auto rounded-lg"
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

      {activeTab !== "quiz" && <Footer />}

      <HeaderModals
        openLoginModal={loginModalOpen}
        setOpenLoginModal={setLoginModalOpen}
        openSignupModal={signupModalOpen}
        setOpenSignupModal={setSignupModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onSignupSuccess={handleSignupSuccess}
      />
    </div>
  );
};

export default App;
