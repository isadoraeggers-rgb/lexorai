-- Lexora demo seed data ------------------------------------------------------------
-- Populates a realistic demo law office. Safe to re-run against a fresh
-- database (idempotent by email/slug where practical). Run via:
--   supabase db reset            (applies migrations then this file), or
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- Demo login (password for all seeded users): Lexora@2026
--
-- auth.users is seeded directly with bcrypt-hashed passwords + matching
-- auth.identities rows so Supabase Auth can sign these accounts in exactly
-- like normal signups. Inserting into auth.users fires the existing
-- `on_auth_user_created` trigger, which is what actually creates the
-- organization + profile rows — the first user creates "Silva & Vasconcelos
-- Advogados", and the next two join it via `invited_organization_id`.

do $$
declare
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_owner_id uuid := gen_random_uuid();
  v_lawyer_id uuid := gen_random_uuid();
  v_paralegal_id uuid := gen_random_uuid();
  v_org_id uuid;

  v_client_maria uuid := gen_random_uuid();
  v_client_joao uuid := gen_random_uuid();
  v_client_techcorp uuid := gen_random_uuid();
  v_client_ana uuid := gen_random_uuid();
  v_client_construtora uuid := gen_random_uuid();

  v_process_1 uuid := gen_random_uuid();
  v_process_2 uuid := gen_random_uuid();
  v_process_3 uuid := gen_random_uuid();
  v_process_4 uuid := gen_random_uuid();
  v_process_5 uuid := gen_random_uuid();

  v_password text := crypt('Lexora@2026', gen_salt('bf'));
begin

  -- 1. Team (auth.users -> trigger creates organization + profiles) --------------

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    v_instance_id, v_owner_id, 'authenticated', 'authenticated',
    'maria.silva@lexora.demo', v_password, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Maria Silva', 'organization_name', 'Silva & Vasconcelos Advogados'),
    now(), now(), '', '', '', ''
  );

  select organization_id into v_org_id from public.profiles where id = v_owner_id;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    v_instance_id, v_lawyer_id, 'authenticated', 'authenticated',
    'pedro.vasconcelos@lexora.demo', v_password, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Pedro Vasconcelos', 'invited_organization_id', v_org_id, 'invited_role', 'lawyer'),
    now(), now(), '', '', '', ''
  );

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    v_instance_id, v_paralegal_id, 'authenticated', 'authenticated',
    'camila.souza@lexora.demo', v_password, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Camila Souza', 'invited_organization_id', v_org_id, 'invited_role', 'paralegal'),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values
    (gen_random_uuid(), v_owner_id::text, v_owner_id, jsonb_build_object('sub', v_owner_id::text, 'email', 'maria.silva@lexora.demo'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_lawyer_id::text, v_lawyer_id, jsonb_build_object('sub', v_lawyer_id::text, 'email', 'pedro.vasconcelos@lexora.demo'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_paralegal_id::text, v_paralegal_id, jsonb_build_object('sub', v_paralegal_id::text, 'email', 'camila.souza@lexora.demo'), 'email', now(), now(), now());

  update public.profiles set oab_number = '123.456', title = 'Sócia Fundadora' where id = v_owner_id;
  update public.profiles set oab_number = '234.567', title = 'Advogado Associado' where id = v_lawyer_id;
  update public.profiles set title = 'Paralegal' where id = v_paralegal_id;

  -- Onboarding already completed + OAB registrations configured, so the demo
  -- accounts land straight on the dashboard instead of the setup wizard.
  update public.organizations
  set
    email = 'contato@silvavasconcelos.demo',
    phone = '(11) 3456-7890',
    onboarding_completed_at = now()
  where id = v_org_id;

  insert into public.oab_registrations (organization_id, profile_id, oab_number, oab_state, practice_areas, is_active, is_monitored)
  values
    (v_org_id, v_owner_id, '123.456', 'SP', array['Cível', 'Societário'], true, true),
    (v_org_id, v_lawyer_id, '234.567', 'SP', array['Trabalhista', 'Cível'], true, true);

  -- 2. Clients ---------------------------------------------------------------------

  insert into public.clients (id, organization_id, type, name, cpf, email, phone, address, tags, created_by)
  values
    (v_client_maria, v_org_id, 'individual', 'Maria Fernanda Costa', '111.222.333-44', 'mfcosta@email.com', '(11) 98888-1111',
      '{"street":"Av. Paulista, 1000","city":"São Paulo","state":"SP","zip":"01310-100"}', array['Trabalhista','VIP'], v_owner_id),
    (v_client_joao, v_org_id, 'individual', 'João Pereira Lima', '222.333.444-55', 'joao.lima@email.com', '(11) 97777-2222',
      '{"street":"Rua Augusta, 500","city":"São Paulo","state":"SP","zip":"01305-000"}', array['Família'], v_owner_id),
    (v_client_ana, v_org_id, 'individual', 'Ana Beatriz Rocha', '333.444.555-66', 'ana.rocha@email.com', '(21) 96666-3333',
      '{"street":"Rua das Laranjeiras, 200","city":"Rio de Janeiro","state":"RJ","zip":"22240-000"}', array['Consumidor'], v_lawyer_id);

  insert into public.clients (id, organization_id, type, name, cnpj, email, phone, address, tags, created_by)
  values
    (v_client_techcorp, v_org_id, 'company', 'TechCorp Soluções Digitais Ltda.', '12.345.678/0001-90', 'juridico@techcorp.demo', '(11) 3333-4444',
      '{"street":"Av. Faria Lima, 3000","city":"São Paulo","state":"SP","zip":"04538-132"}', array['Societário','Contrato'], v_owner_id),
    (v_client_construtora, v_org_id, 'company', 'Construtora Horizonte S.A.', '98.765.432/0001-10', 'contencioso@horizonte.demo', '(11) 3222-5555',
      '{"street":"Rua Funchal, 400","city":"São Paulo","state":"SP","zip":"04551-060"}', array['Imobiliário'], v_lawyer_id);

  insert into public.client_timeline_events (organization_id, client_id, event_type, title, created_by)
  select v_org_id, id, 'client_created', 'Cliente cadastrado', created_by from public.clients where organization_id = v_org_id;

  -- 3. Processes ---------------------------------------------------------------------

  insert into public.processes (id, organization_id, number, court, judge, class, subject, opposing_party, lawyer_id, responsible_user_id, status, risk_level, priority, case_value, distribution_date, last_movement_at, created_by)
  values
    (v_process_1, v_org_id, '1001234-56.2024.8.26.0100', '3ª Vara Cível de São Paulo', 'Dr. Roberto Alencar', 'Procedimento Comum Cível',
      'Rescisão contratual c/c indenização por danos morais', 'DataFlow Sistemas Ltda. (fornecedora)', v_owner_id, v_lawyer_id,
      'active', 'medium', 'high', 85000.00, current_date - 120, now() - interval '2 days', v_owner_id),
    (v_process_2, v_org_id, '2002345-67.2024.8.26.0100', '5ª Vara do Trabalho de São Paulo', 'Dra. Fernanda Lima', 'Reclamação Trabalhista',
      'Verbas rescisórias e horas extras', 'Comércio de Roupas Estrela Ltda. (ex-empregadora)', v_lawyer_id, v_lawyer_id,
      'active', 'high', 'urgent', 45000.00, current_date - 60, now() - interval '45 days', v_owner_id),
    (v_process_3, v_org_id, '3003456-78.2023.8.26.0100', '2ª Vara de Família de São Paulo', 'Dr. Carlos Mendes', 'Divórcio Litigioso',
      'Guarda compartilhada e partilha de bens', 'Sandra Regina Lima (ex-cônjuge)', v_owner_id, v_owner_id,
      'active', 'low', 'medium', null, current_date - 300, now() - interval '10 days', v_owner_id),
    (v_process_4, v_org_id, '4004567-89.2024.8.19.0001', '1ª Vara Cível do Rio de Janeiro', 'Dra. Patricia Nunes', 'Ação de Indenização',
      'Cobrança indevida e negativação irregular', 'Banco Atlântico S.A.', v_lawyer_id, v_paralegal_id,
      'active', 'medium', 'medium', 12000.00, current_date - 40, now() - interval '5 days', v_owner_id),
    (v_process_5, v_org_id, '5005678-90.2022.8.26.0100', '4ª Vara Cível de São Paulo', 'Dr. Roberto Alencar', 'Execução de Título Extrajudicial',
      'Descumprimento de contrato de empreitada', 'Incorporadora Vale Verde Ltda. (devedora)', v_owner_id, v_lawyer_id,
      'won', 'low', 'low', 230000.00, current_date - 500, now() - interval '200 days', v_owner_id);

  insert into public.process_clients (process_id, client_id, role) values
    (v_process_1, v_client_techcorp, 'client'),
    (v_process_2, v_client_maria, 'client'),
    (v_process_3, v_client_joao, 'client'),
    (v_process_4, v_client_ana, 'client'),
    (v_process_5, v_client_construtora, 'client');

  insert into public.process_timeline_events (organization_id, process_id, event_type, title, description, created_by)
  values
    (v_org_id, v_process_1, 'process_created', 'Processo cadastrado', null, v_owner_id),
    (v_org_id, v_process_1, 'movement', 'Juntada de contestação', 'Parte contrária apresentou contestação.', v_lawyer_id),
    (v_org_id, v_process_2, 'process_created', 'Processo cadastrado', null, v_owner_id),
    (v_org_id, v_process_2, 'movement', 'Audiência de instrução designada', null, v_lawyer_id),
    (v_org_id, v_process_5, 'movement', 'Sentença procedente', 'Ação julgada procedente em primeira instância.', v_owner_id);

  -- 4. Deadlines -----------------------------------------------------------------

  insert into public.deadlines (organization_id, process_id, title, description, due_date, priority, reminder_frequency, responsible_user_id, created_by)
  values
    (v_org_id, v_process_1, 'Apresentar réplica à contestação', 'Prazo de 15 dias corridos.', now() + interval '3 days', 'high', 'daily', v_lawyer_id, v_owner_id),
    (v_org_id, v_process_2, 'Protocolar recurso ordinário', 'Prazo fatal — verificar tempestividade.', now() + interval '1 day', 'urgent', 'daily', v_lawyer_id, v_owner_id),
    (v_org_id, v_process_3, 'Enviar proposta de acordo de partilha', null, now() + interval '10 days', 'medium', 'weekly', v_owner_id, v_owner_id),
    (v_org_id, v_process_4, 'Juntar comprovantes de negativação', null, now() - interval '2 days', 'high', 'daily', v_paralegal_id, v_owner_id),
    (v_org_id, null, 'Renovar certidões do escritório', 'OAB, CND federal, estadual e municipal.', now() + interval '20 days', 'low', 'monthly', v_owner_id, v_owner_id);

  -- 5. Hearings --------------------------------------------------------------------

  insert into public.hearings (organization_id, process_id, title, hearing_type, scheduled_at, location_type, address, meet_url, judge, status, created_by)
  values
    (v_org_id, v_process_2, 'Audiência de Instrução e Julgamento', 'Instrução', now() + interval '4 days', 'in_person',
      'Fórum Trabalhista de São Paulo, Sala 12', null, 'Dra. Fernanda Lima', 'scheduled', v_owner_id),
    (v_org_id, v_process_1, 'Audiência de Conciliação', 'Conciliação', now() + interval '2 days', 'online', null,
      'https://meet.google.com/lexora-demo-abc', 'Dr. Roberto Alencar', 'scheduled', v_owner_id),
    (v_org_id, v_process_3, 'Audiência de Mediação Familiar', 'Mediação', now() - interval '15 days', 'in_person',
      'Fórum Central de São Paulo, Sala 4', null, 'Dr. Carlos Mendes', 'completed', v_owner_id);

  insert into public.hearing_checklist_items (hearing_id, title, is_done, order_index)
  select id, item, done, ord
  from public.hearings h
  cross join lateral (values
    ('Revisar petição inicial', true, 1),
    ('Confirmar testemunhas', false, 2),
    ('Preparar cliente para depoimento', false, 3)
  ) as items(item, done, ord)
  where h.organization_id = v_org_id and h.process_id = v_process_2;

  -- 6. Tasks ---------------------------------------------------------------------

  insert into public.tasks (organization_id, process_id, title, description, status, priority, due_date, assigned_to, created_by, order_index)
  values
    (v_org_id, v_process_1, 'Redigir réplica', 'Usar modelo de réplica cível.', 'doing', 'high', now() + interval '2 days', v_lawyer_id, v_owner_id, 1),
    (v_org_id, v_process_2, 'Reunir provas de horas extras', null, 'todo', 'urgent', now() + interval '1 day', v_lawyer_id, v_owner_id, 2),
    (v_org_id, null, 'Atualizar contrato de honorários padrão', null, 'todo', 'low', now() + interval '15 days', v_owner_id, v_owner_id, 3),
    (v_org_id, v_process_4, 'Solicitar extrato de negativação ao cliente', null, 'waiting', 'medium', now() + interval '5 days', v_paralegal_id, v_owner_id, 4),
    (v_org_id, v_process_5, 'Arquivar processo finalizado', null, 'done', 'low', now() - interval '10 days', v_lawyer_id, v_owner_id, 5),
    (v_org_id, null, 'Preparar relatório mensal de produtividade', null, 'todo', 'medium', now() + interval '7 days', v_owner_id, v_owner_id, 6);

  -- 7. Templates -------------------------------------------------------------------

  insert into public.templates (organization_id, name, category, description, content, created_by)
  values
    (v_org_id, 'Petição Inicial — Indenização por Danos Morais', 'petition', 'Modelo padrão para ações de indenização.',
      E'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{vara}}\n\n{{nome_cliente}}, já qualificado(a) nos autos, vem respeitosamente à presença de Vossa Excelência propor a presente\n\nAÇÃO DE INDENIZAÇÃO POR DANOS MORAIS\n\nem face de {{parte_contraria}}, pelos fatos e fundamentos a seguir expostos...\n\nDOS FATOS\n{{fatos}}\n\nDO DIREITO\n{{fundamentacao_juridica}}\n\nDOS PEDIDOS\nAnte o exposto, requer-se...', v_owner_id),
    (v_org_id, 'Contestação Cível Padrão', 'petition', 'Estrutura base para contestações em processos cíveis.',
      E'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO\n\nProcesso nº {{numero_processo}}\n\n{{nome_cliente}}, já qualificado(a), vem apresentar CONTESTAÇÃO...\n\nPRELIMINARMENTE\n{{preliminares}}\n\nNO MÉRITO\n{{merito}}', v_owner_id),
    (v_org_id, 'Contrato de Prestação de Serviços Advocatícios', 'contract', 'Contrato padrão de honorários.',
      E'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS\n\nCONTRATANTE: {{nome_cliente}}\nCONTRATADO: Silva & Vasconcelos Advogados\n\nCláusula 1ª — Do objeto\n{{objeto_contrato}}\n\nCláusula 2ª — Dos honorários\n{{valor_honorarios}}', v_owner_id),
    (v_org_id, 'E-mail de Atualização ao Cliente', 'email', 'Modelo para comunicar andamentos processuais.',
      E'Prezado(a) {{nome_cliente}},\n\nEsperamos que esteja bem. Escrevemos para atualizá-lo(a) sobre o andamento do processo nº {{numero_processo}}.\n\n{{atualizacao}}\n\nPermanecemos à disposição.\n\nAtenciosamente,\n{{advogado_responsavel}}', v_owner_id),
    (v_org_id, 'Notificação Extrajudicial', 'notification', 'Modelo de notificação extrajudicial padrão.',
      E'NOTIFICAÇÃO EXTRAJUDICIAL\n\nNOTIFICANTE: {{nome_cliente}}\nNOTIFICADO: {{parte_contraria}}\n\nPelo presente instrumento, fica Vossa Senhoria notificada de que {{motivo_notificacao}}, devendo regularizar a situação no prazo de {{prazo}} dias.', v_owner_id);

  -- 8. Second Brain memories (no embeddings — generated at runtime via OpenAI) ----

  insert into public.second_brain_memories (organization_id, type, title, content, process_id, client_id, source, created_by)
  values
    (v_org_id, 'strategy', 'Estratégia — Caso TechCorp (rescisão contratual)',
      'Optamos por buscar acordo antes da réplica, dado o custo de oportunidade do litígio. Cliente aceita redução de até 20% no valor pleiteado.',
      v_process_1, v_client_techcorp, 'manual', v_owner_id),
    (v_org_id, 'client_preference', 'Preferência — Maria Fernanda Costa',
      'Cliente prefere comunicação por WhatsApp em vez de e-mail. Disponível para reuniões apenas após as 18h.',
      null, v_client_maria, 'manual', v_owner_id),
    (v_org_id, 'procedural_history', 'Histórico — Vara do Trabalho de SP (5ª Vara)',
      'A 5ª Vara do Trabalho de São Paulo costuma priorizar audiências de conciliação antes da instrução. Juíza Fernanda Lima é rigorosa quanto à pontualidade.',
      v_process_2, null, 'manual', v_owner_id),
    (v_org_id, 'decision', 'Decisão — Não recorrer da sentença (Construtora Horizonte)',
      'Optado por não recorrer da sentença procedente por ser integralmente favorável ao cliente. Processo transitado em julgado.',
      v_process_5, v_client_construtora, 'manual', v_owner_id);

  -- 9. Notifications ---------------------------------------------------------------

  insert into public.notifications (organization_id, user_id, type, channel, title, body, link)
  values
    (v_org_id, v_lawyer_id, 'deadline_due', 'in_app', 'Prazo se aproxima', 'Recurso ordinário vence amanhã.', '/deadlines'),
    (v_org_id, v_owner_id, 'hearing_reminder', 'in_app', 'Audiência em 2 dias', 'Audiência de conciliação — Processo 1001234-56.2024.8.26.0100.', '/hearings'),
    (v_org_id, v_paralegal_id, 'task_assigned', 'in_app', 'Nova tarefa atribuída', 'Solicitar extrato de negativação ao cliente.', '/tasks');

end $$;
