-- Contatos e presença digital exibidos no perfil público do profissional.

alter table public.personais
  add column whatsapp text,
  add column instagram_url text,
  add column facebook_url text,
  add column tiktok_url text,
  add column youtube_url text,
  add column website_url text;

alter table public.personais
  add constraint personais_whatsapp_tamanho_check
    check (whatsapp is null or char_length(whatsapp) between 10 and 15),
  add constraint personais_instagram_url_tamanho_check
    check (instagram_url is null or char_length(instagram_url) <= 300),
  add constraint personais_facebook_url_tamanho_check
    check (facebook_url is null or char_length(facebook_url) <= 300),
  add constraint personais_tiktok_url_tamanho_check
    check (tiktok_url is null or char_length(tiktok_url) <= 300),
  add constraint personais_youtube_url_tamanho_check
    check (youtube_url is null or char_length(youtube_url) <= 300),
  add constraint personais_website_url_tamanho_check
    check (website_url is null or char_length(website_url) <= 300);
