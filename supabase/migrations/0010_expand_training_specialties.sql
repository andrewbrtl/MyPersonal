-- Amplia as opções do perfil profissional e da busca sem alterar vínculos existentes.

update public.modalidades
set categoria = 'Condicionamento'
where nome in ('Crossfit', 'Hyrox', 'Funcional');

insert into public.modalidades (nome, categoria) values
  ('Calistenia', 'Força'),
  ('Powerlifting', 'Força'),
  ('Levantamento olímpico', 'Força'),
  ('Emagrecimento', 'Objetivos'),
  ('Condicionamento físico', 'Objetivos'),
  ('Mobilidade', 'Mobilidade'),
  ('Yoga', 'Mobilidade'),
  ('Treino para idosos', 'Públicos específicos'),
  ('Treino para gestantes', 'Públicos específicos'),
  ('Pós-parto', 'Públicos específicos'),
  ('Treino em casa', 'Formato'),
  ('Preparação para testes físicos', 'Performance'),
  ('Triatlo', 'Endurance'),
  ('Vôlei (preparação física)', 'Esporte coletivo'),
  ('Basquete (preparação física)', 'Esporte coletivo')
on conflict (nome) do update
set categoria = excluded.categoria,
    ativo = true;
