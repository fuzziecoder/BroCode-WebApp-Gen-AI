
import { createClient } from '@supabase/supabase-js';

// Using mock credentials to prevent the app from crashing when env vars are not set.
// A validly formatted URL and a JWT-like key are used to satisfy the client's internal validation.
const MOCK_SUPABASE_URL = 'https://abzdefghijklmnopqrst.supabase.co';
const MOCK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiemRlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.c_B123456789abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ_0';


// FIX: Safely access process.env to prevent crashes in browser environments where it might be undefined.
const supabaseUrl = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_URL) || MOCK_SUPABASE_URL;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY) || MOCK_SUPABASE_ANON_KEY;

if (supabaseUrl === MOCK_SUPABASE_URL) {
    console.warn(`Supabase credentials are not configured. Using placeholder values. 
    Please create a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.`);
}


// This client is initialized with placeholder credentials to allow the app to load.
// The current application logic uses mocked data, so no actual calls are made to Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);