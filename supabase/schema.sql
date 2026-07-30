-- FlowSensei Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- Boards table: represents Kanban boards
create table boards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid not null,
  created_at timestamp with time zone default now()
);

-- Columns table: represents Kanban columns (e.g., "To Do", "In Progress", "Done")
create table columns (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid references boards(id) on delete cascade not null,
  name text not null,
  position integer not null default 0
);

-- Cards table: represents individual tasks/tickets
create table cards (
  id uuid primary key default uuid_generate_v4(),
  column_id uuid references columns(id) on delete cascade not null,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Board members table: manages multi-user access to boards
create table board_members (
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid not null,
  role text not null check (role in ('owner', 'member', 'guest')),
  created_at timestamp with time zone default now(),
  primary key (board_id, user_id)
);

-- Row Level Security Policies
-- Enable RLS on all tables
alter table boards enable row level security;
alter table columns enable row level security;
alter table cards enable row level security;
alter table board_members enable row level security;

-- Boards policies
create policy "Users can view boards they are a member of"
  on boards
  for select
  using (exists (
    select 1 from board_members
    where board_id = boards.id
    and user_id = auth.uid()
  ));

create policy "Users can insert boards they create"
  on boards
  for insert
  with check (created_by = auth.uid());

create policy "Users can update boards they own or are members of"
  on boards
  for update
  using (exists (
    select 1 from board_members
    where board_id = boards.id
    and user_id = auth.uid()
  ));

create policy "Users can delete boards they own"
  on boards
  for delete
  using (created_by = auth.uid());

-- Columns policies
create policy "Users can view columns of boards they are members of"
  on columns
  for select
  using (exists (
    select 1 from board_members
    where board_id = columns.board_id
    and user_id = auth.uid()
  ));

create policy "Users can insert columns for boards they are members of"
  on columns
  for insert
  with check (exists (
    select 1 from board_members
    where board_id = columns.board_id
    and user_id = auth.uid()
  ));

create policy "Users can update columns of boards they are members of"
  on columns
  for update
  using (exists (
    select 1 from board_members
    where board_id = columns.board_id
    and user_id = auth.uid()
  ));

create policy "Users can delete columns of boards they own"
  on columns
  for delete
  using (exists (
    select 1 from board_members bm
    join boards b on b.id = columns.board_id
    where bm.board_id = columns.board_id
    and bm.user_id = auth.uid()
    and bm.role = 'owner'
  ));

-- Cards policies
create policy "Users can view cards of boards they are members of"
  on cards
  for select
  using (exists (
    select 1 from board_members bm
    join columns c on c.id = cards.column_id
    where c.board_id = bm.board_id
    and bm.user_id = auth.uid()
  ));

create policy "Users can insert cards for boards they are members of"
  on cards
  for insert
  with check (exists (
    select 1 from board_members bm
    join columns c on c.id = cards.column_id
    where c.board_id = bm.board_id
    and bm.user_id = auth.uid()
  ));

create policy "Users can update cards of boards they are members of"
  on cards
  for update
  using (exists (
    select 1 from board_members bm
    join columns c on c.id = cards.column_id
    where c.board_id = bm.board_id
    and bm.user_id = auth.uid()
  ));

create policy "Users can delete cards of boards they own"
  on cards
  for delete
  using (exists (
    select 1 from board_members bm
    join columns c on c.id = cards.column_id
    join boards b on b.id = c.board_id
    where b.id = c.board_id
    and bm.board_id = b.id
    and bm.user_id = auth.uid()
    and bm.role = 'owner'
  ));

-- Board members policies
create policy "Users can view board members of boards they own"
  on board_members
  for select
  using (exists (
    select 1 from boards
    where id = board_members.board_id
    and created_by = auth.uid()
  ));

create policy "Users can insert board members for boards they own"
  on board_members
  for insert
  with check (exists (
    select 1 from boards
    where id = board_members.board_id
    and created_by = auth.uid()
  ));

create policy "Users can update board members of boards they own"
  on board_members
  for update
  using (exists (
    select 1 from boards
    where id = board_members.board_id
    and created_by = auth.uid()
  ));

create policy "Users can delete board members of boards they own"
  on board_members
  for delete
  using (exists (
    select 1 from boards
    where id = board_members.board_id
    and created_by = auth.uid()
  ));

-- Add some useful indexes for performance
create index if not exists idx_columns_board_id on columns(board_id);
create index if not exists idx_cards_column_id on cards(column_id);
create index if not exists idx_board_members_user_id on board_members(user_id);

-- Retrospectives table
create table retros (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid references boards(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table retros enable row level security;

create policy "Users can view retros of boards they are members of"
  on retros
  for select
  using (exists (
    select 1 from board_members
    where board_id = retros.board_id
    and user_id = auth.uid()
  ));

create policy "Users can insert retros for boards they are members of"
  on retros
  for insert
  with check (exists (
    select 1 from board_members
    where board_id = retros.board_id
    and user_id = auth.uid()
  ));