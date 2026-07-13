-- media 버킷: 사진용 파일 크기/타입 제한
-- 30 MB (고해상도 사진 넉넉). 영상은 추후 별도 'video' 버킷 + Supabase Pro 로 확장.
update storage.buckets
set
  file_size_limit = 31457280, -- 30 MB
  allowed_mime_types = array[
    'image/jpeg','image/png','image/webp','image/avif','image/gif'
  ]
where id = 'media';
