-- 1. Create Subjects Table
create table public.subjects (
  id text primary key, -- e.g. 'math', 'physics'
  name text not null,
  icon text not null,
  description text,
  color text, -- e.g. 'blue', 'purple'
  unit_count int default 0,
  lesson_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Lessons Table
create table public.lessons (
  id text primary key, -- e.g. 'math-01'
  subject_id text references public.subjects(id) on delete cascade not null,
  title text not null,
  duration text,
  video_url text, -- Store the ID or Full URL
  pdf_url text,
  is_free boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.subjects enable row level security;
alter table public.lessons enable row level security;

-- 4. Policies
-- Public Read Access
create policy "Enable read access for all users" on public.subjects for select using (true);
create policy "Enable read access for all users" on public.lessons for select using (true);

-- Admin Full Access (Assuming user metadata or a check function exists, for simplicity we allow authenticated users to *read*, only admins to write if we had custom claims, but here we keep it simple or assume admin role check in app for write)
-- Ideally: create policy "Enable write for admins" ...
-- For this "V20" migration, we will rely on App-Logic security for writes or simple auth policies.

-- 5. Seed Data (Migrated from mockLibrary.ts)

-- Subjects
insert into public.subjects (id, name, icon, description, color, unit_count, lesson_count) values
('math', 'الرياضيات', '📐', 'تحليل، جبر، وهندسة فضائية مع التركيز على حل المشكلات المعقدة.', 'blue', 12, 45),
('physics', 'الفيزياء', '⚡', 'الموجات، التحولات النووية، والكهرباء.', 'purple', 8, 32),
('chemistry', 'الكيمياء', '🧪', 'التحولات السريعة والبطيئة، وحالة توازن مجموعة كيميائية.', 'green', 6, 28),
('philosophy', 'الفلسفة', '🤔', 'مجزوءة الوضع البشري، المعرفة، والسياسة.', 'orange', 4, 20),
('english', 'اللغة الإنجليزية', '🇬🇧', 'Grammar, Vocabulary, and Writing skills.', 'red', 10, 40),
('svt', 'علوم الحياة والأرض', '🧬', 'استهلاك المادة العضوية وتدفق الطاقة.', 'emerald', 6, 24);

-- Lessons (Math)
insert into public.lessons (id, subject_id, title, duration) values
('math-01', 'math', 'مراجعة شاملة: الدوال الأسية', '1:30:00'),
('math-02', 'math', 'الأعداد العقدية: الجزء الأول', '45:00'),
('math-03', 'math', 'حساب الاحتمالات', '1:15:00'),
('math-04', 'math', 'المتتاليات العددية', '0:55:00'),
('math-05', 'math', 'التكامل وحساب المساحات', '1:20:00');

-- Lessons (Physics)
insert into public.lessons (id, subject_id, title, duration) values
('phys-01', 'physics', 'الموجات الميكانيكية المتوالية', '1:10:00'),
('phys-02', 'physics', 'التحولات النووية: التناقص الإشعاعي', '1:45:00'),
('phys-03', 'physics', 'ثنائي القطب RC', '1:00:00'),
('phys-04', 'physics', 'الميكانيك: قوانين نيوتن', '2:00:00');

-- Lessons (Chemistry)
insert into public.lessons (id, subject_id, title, duration) values
('chem-01', 'chemistry', 'التحولات السريعة والتحولات البطيئة', '0:50:00'),
('chem-02', 'chemistry', 'التحولات المقرونة بتفاعلات حمض-قاعدة', '1:15:00'),
('chem-03', 'chemistry', 'تطور مجموعة كيميائية نحو حالة التوازن', '1:30:00');

-- Lessons (Philosophy)
insert into public.lessons (id, subject_id, title, duration) values
('philo-01', 'philosophy', 'الشخص والهوية', '0:45:00'),
('philo-02', 'philosophy', 'الغير: وجود الغير', '1:00:00'),
('philo-03', 'philosophy', 'النظرية والتجربة', '1:15:00');

-- Lessons (English)
insert into public.lessons (id, subject_id, title, duration) values
('eng-01', 'english', 'Tenses Review: Past Simple vs Continuous', '0:40:00'),
('eng-02', 'english', 'Writing: Argumentative Essay', '1:00:00'),
('eng-03', 'english', 'Vocabulary: Education & Youth', '0:30:00');

-- Lessons (SVT)
insert into public.lessons (id, subject_id, title, duration) values
('svt-01', 'svt', 'تحرير الطاقة الكامنة في المادة العضوية', '1:20:00'),
('svt-02', 'svt', 'ألية تقلص العضلة الهيكلية', '1:10:00'),
('svt-03', 'svt', 'الخبر الوراثي', '1:30:00');

-- 6. User Progress Table
create table public.user_progress (
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id text references public.lessons(id) on delete cascade not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  last_watched_position integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, lesson_id)
);

-- RLS for Progress
alter table public.user_progress enable row level security;

create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can update own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on public.user_progress
  for update using (auth.uid() = user_id);
