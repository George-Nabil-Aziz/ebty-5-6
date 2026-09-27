-- سياسة مسح المحاولات — الصقها في SQL Editor ودوس Run
drop policy if exists admin_deletes_attempts on attempts;

create policy admin_deletes_attempts on attempts
  for delete to authenticated using (true);
