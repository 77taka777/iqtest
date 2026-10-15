-- MINDSCOPE setup for the explicitly selected Supabase project.
-- No existing application tables are read, changed or dropped.
begin;
create table public.mindscope_scores (
 id uuid primary key,
 nickname text not null check (char_length(nickname) between 1 and 20 and nickname = btrim(nickname) and nickname !~ '[[:cntrl:]]'),
 total smallint not null check (total in (20,30)),
 d0 smallint not null check (d0 between 0 and total/5),
 d1 smallint not null check (d1 between 0 and total/5),
 d2 smallint not null check (d2 between 0 and total/5),
 d3 smallint not null check (d3 between 0 and total/5),
 d4 smallint not null check (d4 between 0 and total/5),
 score smallint generated always as ((d0+d1+d2+d3+d4)::smallint) stored,
 duration_seconds integer not null check (duration_seconds between 0 and 604800),
 completed_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index mindscope_scores_recent on public.mindscope_scores (created_at desc, id desc);
alter table public.mindscope_scores enable row level security;
revoke all on public.mindscope_scores from public, anon, authenticated;
grant select on public.mindscope_scores to anon, authenticated;
grant insert (id,nickname,total,d0,d1,d2,d3,d4,duration_seconds,completed_at) on public.mindscope_scores to anon, authenticated;
create policy "read_shared_mindscope_scores" on public.mindscope_scores for select to anon, authenticated using (true);
create policy "insert_shared_mindscope_scores" on public.mindscope_scores for insert to anon, authenticated with check (true);
-- No update/delete grants or policies: participants cannot modify others' records.
comment on table public.mindscope_scores is 'Opt-in pseudonymous MINDSCOPE session results; not validated IQ scores. Client-submitted results are not proof of ability or identity.';
commit;
