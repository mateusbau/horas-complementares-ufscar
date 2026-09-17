import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://twzrsevzgznanrquzith.supabase.co"
const supabaseKey = "sb_publishable_siZPKBF1CsyyZr2tNt7IVQ__ElYMJpr"

export const supabase = createClient(supabaseUrl, supabaseKey)
