-- ==========================================
-- PRO MESS: Initial Admin Setup Instructions
-- ==========================================
-- Note: Since Supabase manages auth via GoTrue, you cannot simply INSERT into auth.users in plain SQL 
-- (passwords need to be encrypted via bcrypt by the auth server).
-- 
-- The recommended way to seed the initial Admin is to:
-- 1. Sign up a user in the Supabase Dashboard UI (e.g. muktadi@promess.local / changeme123)
-- 2. Once the user is created in `auth.users`, find their UUID.
-- 3. Run the following SQL to make them an Admin in the `profiles` table.

-- Replace 'YOUR_AUTH_USER_UUID' with the actual UUID from auth.users
/*
INSERT INTO profiles (id, name, role, avatar_color, must_change_password)
VALUES (
  'YOUR_AUTH_USER_UUID',
  'Muktadi',
  'admin',
  '#00b4a6',
  true
);

-- Then log in to the Next.js app with muktadi@promess.local / changeme123
-- You will be forced to change your password.
-- After that, you can use the "Members" page in the UI to create the other 5 members.
*/

-- ==========================================
-- (Optional) Sample Dummy Data for UI Testing
-- ==========================================
-- Only run this if you have created 6 members and want to see how the dashboard looks.
-- Replace the UUIDs with real member UUIDs.

/*
DO $$ 
DECLARE
  m_muktadi UUID := 'uuid-1';
  m_sefat UUID := 'uuid-2';
  m_mahbub UUID := 'uuid-3';
  m_jakaria UUID := 'uuid-4';
  m_sabbir UUID := 'uuid-5';
  m_yousuf UUID := 'uuid-6';
BEGIN
  -- Deposits
  INSERT INTO deposits (member_id, amount, month, year) VALUES
  (m_muktadi, 2500, 6, 2026),
  (m_sefat, 2000, 6, 2026),
  (m_mahbub, 3000, 6, 2026),
  (m_jakaria, 1500, 6, 2026),
  (m_sabbir, 2000, 6, 2026),
  (m_yousuf, 2500, 6, 2026);

  -- Bazar
  INSERT INTO bazar_entries (amount, date, items_note, month, year, duty_member) VALUES
  (450, '2026-06-01', 'Rice, Oil, Dal', 6, 2026, m_muktadi),
  (320, '2026-06-02', 'Chicken, Onion', 6, 2026, m_sefat),
  (510, '2026-06-04', 'Fish, Veggies', 6, 2026, m_mahbub);

  -- Meals (Just a few examples)
  INSERT INTO meals (member_id, date, count) VALUES
  (m_muktadi, '2026-06-01', 2),
  (m_sefat, '2026-06-01', 1.5),
  (m_mahbub, '2026-06-01', 2),
  (m_jakaria, '2026-06-01', 2),
  (m_sabbir, '2026-06-01', 0),
  (m_yousuf, '2026-06-01', 2);

  -- Fixed Costs
  INSERT INTO fixed_costs (category, amount, month, year, note) VALUES
  ('rent', 12000, 6, 2026, 'June Rent'),
  ('gas', 1080, 6, 2026, 'Double Burner'),
  ('internet', 500, 6, 2026, 'Broadband'),
  ('electricity', 1250, 6, 2026, 'Estimated');

  -- Rotation
  INSERT INTO bazar_rotation (member_id, assigned_date, status) VALUES
  (m_jakaria, '2026-06-05', 'upcoming'),
  (m_sabbir, '2026-06-06', 'upcoming'),
  (m_yousuf, '2026-06-07', 'upcoming');

END $$;
*/
