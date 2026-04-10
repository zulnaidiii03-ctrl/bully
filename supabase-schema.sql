-- Database Schema for Sistem Pelaporan Bullying Sekolah

-- 1. Create Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'guru_bk', 'siswa');
CREATE TYPE report_status AS ENUM ('laporan diterima', 'sedang diproses', 'selesai');

-- 2. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'siswa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Categories Table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Reports Table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL if anonymous
  is_anonymous BOOLEAN DEFAULT FALSE,
  victim_name TEXT NOT NULL,
  perpetrator_name TEXT,
  location TEXT NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  category_id BIGINT REFERENCES categories(id),
  status report_status DEFAULT 'laporan diterima',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Follow Ups Table
CREATE TABLE follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  counselor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- 7. Policies

-- Profiles: Users can read their own profile. Admins can read all.
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: Everyone can read. Only admins can manage.
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reports:
-- Siswa can create reports.
-- Siswa can view their own reports (if not anonymous).
-- Guru BK and Admin can view all reports.
CREATE POLICY "Siswa can create reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Siswa can view own reports" ON reports FOR SELECT USING (
  reporter_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru_bk'))
);
CREATE POLICY "Staff can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru_bk'))
);

-- Follow Ups: Only staff can manage.
CREATE POLICY "Staff can manage follow ups" ON follow_ups FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru_bk'))
);
CREATE POLICY "Siswa can view follow ups for their reports" ON follow_ups FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM reports 
    WHERE reports.id = follow_ups.report_id AND reports.reporter_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru_bk'))
);

-- 8. Trigger for first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'::user_role
      ELSE 'siswa'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
