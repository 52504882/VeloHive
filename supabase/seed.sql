insert into public.prohibited_rules (keyword, severity, explanation)
values
  ('假货', 'block', '禁止发布假货或仿品'),
  ('来路不明', 'review', '来源描述不清，需要人工复核'),
  ('改号', 'block', '禁止发布修改、遮盖或伪造车架号/序列号的商品')
on conflict (keyword) do nothing;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'aze@example.test',
    crypt('velohive-dev-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nickname":"阿泽"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'puxi-climber@example.test',
    crypt('velohive-dev-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nickname":"浦西爬坡手"}',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, nickname, avatar_url, city, rider_tags, status, accepted_terms_at, accepted_privacy_at)
values
  ('00000000-0000-0000-0000-000000000001', '阿泽', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', '上海', array['周末骑', '青浦线', '器材党'], 'active', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '浦西爬坡手', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80', '上海', array['整车升级', '咖啡骑'], 'active', now(), now())
on conflict (id) do nothing;

insert into public.hubs (id, owner_id, name, type, address, latitude, longitude, business_hours, facility_tags, image_urls, contact_method, suitable_for_inspection, onboarding_status)
values
  ('10000000-0000-0000-0000-000000000001', null, '青浦湖畔咖啡', 'cafe', '上海市青浦区淀山湖大道 168 号', 31.1042, 121.0154, '09:00-20:00', array['咖啡', '补水', '停车', '厕所', '适合验货'], array['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80'], '到店前电话确认', true, 'approved'),
  ('10000000-0000-0000-0000-000000000002', null, '松江骑行驿站', 'cycling_stop', '上海市松江区辰塔路 88 号', 31.0338, 121.2277, '08:30-19:30', array['打气', '补水', '充电', '停车', '适合验货'], array['https://images.unsplash.com/photo-1525102195674-3ad0b706c7a6?auto=format&fit=crop&w=900&q=80'], '公众号预约', true, 'approved'),
  ('10000000-0000-0000-0000-000000000003', null, '昆山周末农庄', 'farm_stay', '昆山市锦溪镇环湖路 28 号', 31.1781, 120.9034, '10:00-21:00', array['餐食', '停车', '厕所', '集合'], array['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'], '电话预约包间', false, 'approved')
on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, category, brand, model, price, condition, specs, description, flaw_description, image_urls, status, supports_offline_inspection, recommended_hub_ids)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Specialized Tarmac SL7 整车 52 码', 'complete_bike', 'Specialized', 'Tarmac SL7', 32800, '9 成新', array['52 码', 'Ultegra Di2', '碳轮', '含码表架'], '升级新车后出，上海可当面看车。', '右侧手变有轻微擦痕，已拍照标注。', array['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80'], 'active', true, array['10000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000002'::uuid]),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Shimano Ultegra R8170 套件', 'groupset', 'Shimano', 'Ultegra R8170', 6200, '8.5 成新', array['油压碟刹', '172.5 曲柄', '11-30 飞轮'], '正常使用拆车件，功能正常。', '后拨外侧有正常使用痕迹。', array['https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80'], 'active', true, array['10000000-0000-0000-0000-000000000002'::uuid]),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Garmin Edge 840 码表', 'computer', 'Garmin', 'Edge 840', 2180, '95 新', array['国行', '盒装', '含硅胶套'], '使用频率低，屏幕无划痕。', '外盒一角压痕。', array['https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80'], 'active', false, array[]::uuid[])
on conflict (id) do nothing;

insert into public.listing_verifications (listing_id, purchase_proof_urls, masked_serial_or_frame_number, self_verification_score, notes)
values
  ('20000000-0000-0000-0000-000000000001', array['https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80'], 'WSBC****0427', 92, '购买凭证、车架号和瑕疵照片齐全。'),
  ('20000000-0000-0000-0000-000000000002', array[]::text[], 'R8170****21', 74, '有序列号和拆车说明，缺购买凭证。'),
  ('20000000-0000-0000-0000-000000000003', array[]::text[], null, 58, '基础照片齐全，未提供购买凭证。')
on conflict (listing_id) do nothing;
