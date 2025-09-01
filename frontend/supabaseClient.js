// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upjxpgnpeosvbwpjamiw.supabase.co"; // 🔗 URL do projeto Supabase
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanhwZ25wZW9zdmJ3cGphbWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzUzNjMsImV4cCI6MjA2NjQ1MTM2M30.LA0g8CY-5hG8pchPWldNZ39PtsdWUSGm9gcX_mTgsMI"; // 🔑 Chave pública (anon key)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const loginAnon = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) console.error("Erro ao logar:", error);
  return data?.user?.id;
};
