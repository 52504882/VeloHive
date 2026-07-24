create or replace function public.submit_listing_review_decision(
  p_listing_id uuid,
  p_actor_id uuid,
  p_decision text,
  p_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reason text := btrim(coalesce(p_reason, ''));
begin
  if auth.uid() is distinct from p_actor_id then
    raise exception 'actor must match authenticated user';
  end if;

  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') not in ('admin', 'moderator') then
    raise exception 'moderator permission required';
  end if;

  if p_decision not in ('approve', 'reject', 'remove') then
    raise exception 'invalid listing review decision';
  end if;

  if p_decision in ('reject', 'remove') and normalized_reason = '' then
    raise exception '拒绝或下架商品时必须填写原因';
  end if;

  if p_decision = 'approve' then
    update public.listings
    set
      status = 'active',
      removed_reason = null,
      updated_at = now()
    where id = p_listing_id
      and status = 'pending_review';
  else
    update public.listings
    set
      status = 'removed',
      removed_reason = normalized_reason,
      updated_at = now()
    where id = p_listing_id
      and status = 'pending_review';
  end if;

  if not found then
    raise exception 'listing not found or not pending review';
  end if;

  insert into public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    p_actor_id,
    'listing.' || p_decision,
    'listing',
    p_listing_id,
    jsonb_build_object('reason', normalized_reason)
  );
end;
$$;

revoke all on function public.submit_listing_review_decision(uuid, uuid, text, text) from public;
grant execute on function public.submit_listing_review_decision(uuid, uuid, text, text) to authenticated;
