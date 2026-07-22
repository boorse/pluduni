import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://zzgcgowmuxqfzawursqi.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z2Nnb3dtdXhxZnphd3Vyc3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjI3NTcsImV4cCI6MjEwMDEzODc1N30.FnvK_fbQ9TCUQPNhdKG0e418UoYrwVkPTIofbRYfYTg'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
export const BUCKET = 'photos'

export function publicUrl(path) {
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
