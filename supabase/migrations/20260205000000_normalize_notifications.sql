-- Create the join table for tracking read status
create table if not exists public.user_notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  read_at timestamp with time zone not null default now(),
  constraint user_notifications_pkey primary key (id),
  constraint user_notifications_user_id_notification_id_key unique (user_id, notification_id)
);

-- Enable RLS
alter table public.user_notifications enable row level security;

-- Policies
create policy "Users can view their own read receipts"
  on public.user_notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own read receipts"
  on public.user_notifications for insert
  with check (auth.uid() = user_id);

-- Add index for performance
create index if not exists user_notifications_user_id_idx on public.user_notifications(user_id);
