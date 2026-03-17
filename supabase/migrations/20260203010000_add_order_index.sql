-- Add order_index to units and lessons
alter table public.units 
add column if not exists order_index integer default 0;

alter table public.lessons 
add column if not exists order_index integer default 0;

-- Function to Bulk Update Order (RPC)
-- This allows sending an array of {id, order} and updating efficiently in one transaction.
-- But Supabase JS client can't easily pass Table types to RPC without strict definitions.
-- Alternative: Use a JSONB parameter and loop in PLPGSQL.

create or replace function public.reorder_items(
    table_name text,
    updates jsonb -- Array of {id: uuid, order: int}
)
returns void
language plpgsql
security definer
as $$
declare
    item jsonb;
begin
    -- Validate table name to prevent injection/arbitrary updates
    if table_name not in ('units', 'lessons') then
        raise exception 'Invalid table for reordering';
    end if;

    -- Loop through updates
    for item in select * from jsonb_array_elements(updates)
    loop
        execute format('update public.%I set order_index = %s where id = %L', 
            table_name, 
            (item->>'order')::int, 
            (item->>'id')::uuid
        );
    end loop;
end;
$$;
