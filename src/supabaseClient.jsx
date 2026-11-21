
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hbyphetuguypmlltudhp.supabase.co'
const supabaseKey = 'sb_publishable_0gRMVdU1OA1AFiAs4C3eNQ_X0bpLIC8'

export const supabase = createClient(supabaseUrl, supabaseKey)
