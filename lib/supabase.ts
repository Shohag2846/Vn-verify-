
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ycyhocmawgauztycnvfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljeWhvY21hd2dhdXp0eWNudmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTk2ODQsImV4cCI6MjA4NjI5NTY4NH0.friaPGwEI1xCDYqkhHuG-k7zWCNKkOGhvZ9tEkGwTew';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
