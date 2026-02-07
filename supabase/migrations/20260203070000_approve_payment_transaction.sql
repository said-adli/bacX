-- Add columns for auditing if they don't exist
alter table payment_requests 
add column if not exists reviewed_by uuid references auth.users(id),
add column if not exists reviewed_at timestamptz;

-- Create the Atomic Transaction Function
create or replace function approve_payment_transaction(
  p_request_id uuid,
  p_admin_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_duration_days int;
begin
  -- 1. Fetch Plan Info from payment_requests
  select user_id, plan_id into v_user_id, v_plan_id
  from payment_requests
  where id = p_request_id;

  if v_user_id is null then
    raise exception 'Payment request not found';
  end if;

  -- Fetch duration from subscription_plans (default 30 days)
  select duration_days into v_duration_days
  from subscription_plans
  where id = v_plan_id;

  if v_duration_days is null then
    v_duration_days := 30;
  end if;

  -- 2. Update Request (Audit Trail)
  update payment_requests
  set 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = now()
  where id = p_request_id;
  
  -- 3. Update Profile (Grant Access)
  update profiles
  set 
    is_subscribed = true,
    plan_id = v_plan_id,
    subscription_end_date = (now() + (v_duration_days || ' days')::interval)
  where id = v_user_id;

  return true;
end;
$$;
