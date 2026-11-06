-- One test project for the requirements portal.
-- Open: /requirements/test-token-0123456789abcdef
insert into public.projects (
  token, customer_name, project_name, customer_address,
  opex_sales_contact_name, opex_sales_contact_email, opex_sales_contact_phone,
  project_manager, lead_engineer, deployment_engineer,
  status, expires_at
) values (
  'test-token-0123456789abcdef',
  'Test Customer Ltd',
  'Test migration & DR sizing',
  '1 Test Road, Ikoyi, Lagos',
  'Test Sales Contact',
  'sales.test@example.com',
  '+234 000 000 0000',
  'Internal PM (not shown to client)',
  'Internal lead engineer (not shown to client)',
  'Internal deployment engineer (not shown to client)',
  'invited',
  now() + interval '60 days'
)
on conflict (token) do nothing;
