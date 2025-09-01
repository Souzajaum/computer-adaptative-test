import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import AuthModal from "../auth/AuthModal";
import SignupModal from "../auth/SignupModal";

const useSyncProfile = () => {
  useEffect(() => {
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Verifica se o perfil já existe
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile && user.user_metadata) {
        const { full_name, phone, city } = user.user_metadata;

        await supabase.from("user_profiles").insert({
          id: user.id,
          full_name,
          phone,
          city,
        });
      }
    };

    sync();
  }, []);
};

const Header = () => {
  useSyncProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .single();
        setProfile(profileData);
      }
    };

    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <header className="w-full px-6 py-4 bg-white shadow-md flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">CAT QUIZ</div>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-gray-700 text-sm">
              Olá, {profile?.full_name || "Usuário"}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Login
            </Button>
            <Button variant="default" onClick={() => setSignupOpen(true)}>
              Cadastre-se
            </Button>
          </>
        )}
      </div>

      <AuthModal open={modalOpen} onOpenChange={setModalOpen} />
      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </header>
  );
};

export default Header;
