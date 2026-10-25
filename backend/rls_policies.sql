# Supabase Row Level Security (RLS) Policies for Slotify

This document details the Row Level Security (RLS) policies configured in Supabase PostgreSQL to protect user profiles and scheduling resources.

## 1. Profiles Table Policies (`profiles`)

Enable RLS on `profiles`:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Users can view their own profile
```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid()::text);
```

### Policy 2: Users can update their own profile (excluding role)
```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (
  id = auth.uid()::text 
  AND role = (SELECT role FROM profiles WHERE id = auth.uid()::text)
);
```

### Policy 3: Coordinators have read access to all profiles
```sql
CREATE POLICY "Coordinators can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text AND role = 'coordinator'
  )
);
```

### Policy 4: Public/Service role profile insertion
```sql
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
TO authenticated, anon, service_role
WITH CHECK (true);
```

---

## 2. Bookings Table Policies (`bookings`)

Enable RLS on `bookings`:
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Candidates can view their own bookings
```sql
CREATE POLICY "Candidates can view own bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates 
    WHERE candidates.id = bookings.candidate_id 
      AND candidates.profile_id = auth.uid()::text
  )
);
```

### Policy 2: Interviewers can view their assigned bookings
```sql
CREATE POLICY "Interviewers can view assigned bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM interviewers 
    WHERE interviewers.id = bookings.interviewer_id 
      AND interviewers.profile_id = auth.uid()::text
  )
);
```

### Policy 3: Coordinators can manage all bookings
```sql
CREATE POLICY "Coordinators can manage all bookings"
ON bookings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::text AND profiles.role = 'coordinator'
  )
);
```
