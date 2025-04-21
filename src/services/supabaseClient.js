// supabaseClient.js - تكوين مركزي لـ Supabase

import { createClient } from '@supabase/supabase-js';

// استخدام متغيرات البيئة للحصول على عنوان Supabase ومفتاح API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkzaavondsmnxadovohv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
