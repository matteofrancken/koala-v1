
import { createClient } from '@supabase/supabase-js';

// Gebruik de exacte URL uit jouw Supabase settings (met de 'u')
const supabaseUrl = 'https://aztmkdjjetcuqpndzclx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dG1rZGpqZXRjdXFwbmR6Y2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODY5NTcsImV4cCI6MjA4MzM2Mjk1N30.c2s5MLCkgw7PTtHdrKca3GR3DEBogBZNncMWgKZiEpw';

// Minimale configuratie voor maximale compatibiliteit.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
