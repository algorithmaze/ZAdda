import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diswncvttvgunqljkleu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpc3duY3Z0dHZndW5xbGprbGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDYzMzMsImV4cCI6MjA2ODIyMjMzM30.YrbStBVFwL1nPKI-MCS5dDIk-l5Vusjsuv7n5ee2ym0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
