import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "SUA_PROJECT_URL_AQUI"
const supabaseKey = "SUA_PUBLISHABLE_KEY_AQUI"

export const supabase = createClient(supabaseUrl, supabaseKey)
