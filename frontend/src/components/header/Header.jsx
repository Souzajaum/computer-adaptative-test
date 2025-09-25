import { Button } from "../ui/button";
import { supabase } from "../../../supabaseClient";

const Header = ({
  user,
  setUser,
  openLoginModal,
  setOpenLoginModal,
  openSignupModal,
  setOpenSignupModal,
}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Extrair primeiro nome
  const firstName = user
    ? user.user_metadata?.full_name
      ? user.user_metadata.full_name.split(" ")[0] // pega a primeira palavra do full_name
      : user.email.split("@")[0] // fallback: parte do email antes do "@"
    : "";

  return (
    <header className="w-full px-6 py-4 bg-gray-900 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold text-white">CAT QUIZ</div>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-gray-200 text-sm">Olá, {firstName}</span>
            <Button
              variant="default"
              onClick={handleLogout}
              className="transition-transform transform hover:scale-105 hover:bg-gray-700"
            >
              Sair
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="default"
              onClick={() => setOpenLoginModal(true)}
              className="transition-transform transform hover:scale-105 hover:bg-gray-700"
            >
              Login
            </Button>
            <Button
              variant="default"
              onClick={() => setOpenSignupModal(true)}
              className="transition-transform transform hover:scale-105 hover:bg-blue-700"
            >
              Cadastre-se
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
