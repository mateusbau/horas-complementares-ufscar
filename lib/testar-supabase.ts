import { supabase } from "./supabase"

export async function testarSupabase() {
  const { data, error } = await supabase
    .from("estado_demo")
    .select("id")
    .limit(1)

  if (error) {
    console.error("Erro ao conectar ao Supabase:", error)
    throw error
  }

  console.log("Supabase conectado!", data)
  return true
}
