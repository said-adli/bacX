-- Universal Toggle System RPC
-- Securely toggles boolean fields for whitelisted tables/columns

create or replace function public.toggle_resource_status(
    table_name text,
    record_id uuid,
    field_name text,
    new_value boolean
)
returns void
language plpgsql
security definer
as $$
declare
    is_allowed boolean := false;
begin
    -- 1. Whitelist Verification (Strict Security)
    -- Only allow specific table.column combinations
    if (table_name = 'subjects' and field_name = 'published') then
        is_allowed := true;
    elsif (table_name = 'coupons' and field_name = 'is_active') then
        is_allowed := true;
    elsif (table_name = 'profiles' and field_name = 'is_banned') then
        is_allowed := true;
    end if;

    if not is_allowed then
        raise exception 'Operation not allowed for this table/field combination';
    end if;

    -- 2. Execute Update
    -- Using dynamic SQL with format() to safely inject table/column names (since they are verified above)
    execute format('update public.%I set %I = $1 where id = $2', table_name, field_name)
    using new_value, record_id;
    
end;
$$;
