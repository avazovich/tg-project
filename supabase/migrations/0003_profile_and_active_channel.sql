-- Profile fields for the sidebar/profile page.
alter table accounts add column display_name text;
alter table accounts add column avatar_url text;

-- Single-channel focus: the app operates against one "active" channel at a
-- time; switching is an explicit action, not automatic aggregation.
alter table accounts add column active_channel_id uuid references channels(id);

-- Public bucket for profile photos. Filenames are namespaced by account_id
-- (see upload action), so anyone can read but only the owner can write to
-- their own prefix.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');
