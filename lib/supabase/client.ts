import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzqgnfhmegbekzwhnbha.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWduZmhtZWdiZWt6d2huYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjE2MjIsImV4cCI6MjA3ODQzNzYyMn0.zz13zsF6snSjsHKNEZqaYxx4LMOCmE6kjfuiHVeiqW4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
