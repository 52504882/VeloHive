insert into storage.buckets (id, name, public)
values
  ('listing-images', 'listing-images', true),
  ('hub-images', 'hub-images', true),
  ('message-images', 'message-images', true)
on conflict (id) do nothing;

alter table public.listings
  add constraint listings_image_urls_count check (
    (status = 'removed' and cardinality(image_urls) = 0)
    or (status <> 'removed' and cardinality(image_urls) between 1 and 9)
  );

create policy "authenticated users upload listing images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "public listing images are readable"
on storage.objects for select
to public
using (bucket_id = 'listing-images');

create policy "users delete own listing images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
