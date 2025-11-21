// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Reemplaza con tus valores reales de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)