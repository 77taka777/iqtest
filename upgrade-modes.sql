begin;
alter table public.mindscope_scores
 add column mode text not null default 'standard' check (mode in ('standard','hard')),
 add constraint mindscope_scores_hard_total check (mode <> 'hard' or total = 30);
grant insert (mode) on public.mindscope_scores to anon, authenticated;
create index mindscope_scores_mode_recent on public.mindscope_scores (mode, created_at desc, id desc);
commit;
