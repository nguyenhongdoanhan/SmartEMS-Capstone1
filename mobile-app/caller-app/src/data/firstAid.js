/**
 * Thư viện sơ cứu offline (C-06/C-07) - 8 chủ đề đúng tài liệu thiết kế:
 * CPR & hô hấp (6) · Cầm máu (4) · Bỏng (5) · Gãy xương (5) · Đuối nước (5)
 * · Côn trùng cắn (4) · Sốc phản vệ (3) · Co giật (4).
 * Bundle sẵn trong app - mở được không cần mạng (băng hải đảo, mất sóng...).
 *
 * Nội dung tham khảo hướng dẫn sơ cứu phổ biến (QRKVN/Chữ thập đỏ/AHA),
 * chỉ mang tính tham khảo chung - KHÔNG thay thế chuyên môn y tế.
 */
export const FIRST_AID_TOPICS = [
  {
    id: 'cpr',
    emoji: '❤️',
    title: 'CPR & hô cấp cứu',
    searchTitle: 'CPR — Hỗ trợ hô hấp',
    badge: 'KHẨN CẤP',
    keywords: 'cpr hô hấp tim ngừng thở ep ngực tim phổi',
    steps: [
      'Kiểm tra phản ứng: vỗ vai gọi to, đồng thời nhìn – nghe – cảm nhận hô hấp trong tối đa 10 giây.',
      'Gọi người xung quanh hỗ trợ: nhờ một người gọi 115 ngay, một người tìm máy sốc tim tự động (AED) nếu nơi đó có.',
      'Đặt người bệnh nằm trên nền cứng, quỳ cạnh vai, đặt gốc bàn tay giữa ngực (nửa dưới xương ức).',
      'Ép ngực sâu 5–6 cm, nhịp 100–120 lần/phút, để lồng ngực phồng trở lại hoàn toàn giữa hai nhịp ép.',
      'Sau mỗi 30 lần ép, thổi ngực 2 lần: ngửa đầu – nâng cằm, bịt mũi, ngậm kín miệng, thổi tới khi ngực nâng.',
      'Lặp liên tục chu kỳ 30:2 cho tới khi có AED, xe cấp cứu tới, hoặc người bệnh thở trở lại.',
    ],
    note: 'Nếu bạn không dám hoặc chưa được tập thổi ngực, hãy ép ngực liên tục không nghỉ — vẫn hiệu quả hơn nhiều so với đứng im không làm gì.',
  },
  {
    id: 'bleeding',
    emoji: '🩸',
    title: 'Cầm máu',
    badge: null,
    keywords: 'cầm máu chảy máu vết thương băng',
    steps: [
      'Đeo găng tay/bao nilon sạch nếu có để tránh lây nhiễm qua máu.',
      'Ép trực tiếp và liên tục lên vết thương bằng gạc hoặc vải sạch trong 10–15 phút, không nhấc ra xem.',
      'Băng quanh vết thương vừa đủ để giữ gạc ép; nếu máu thấm qua, đắp thêm lớp gạc mới phía trên.',
      'Nâng cao vùng bị thương quá mức tim (nếu không nghi gãy xương) và gọi 115 khi máu phun tia, không cầm được sau 15 phút, hoặc vết thương rộng sâu.',
    ],
    note: null,
  },
  {
    id: 'burn',
    emoji: '🔥',
    title: 'Bỏng',
    badge: null,
    keywords: 'bỏng nóng nước lửa điện bong bóng nước',
    steps: [
      'Đưa nạn nhân ra khỏi nguồn nhiệt; với bỏng điện phải ngắt nguồn điện trước khi chạm vào người.',
      'Làm mát ngay bằng nước sạch mát (15–25°C) chảy nhẹ qua vết bỏng liên tục 15–20 phút.',
      'Cởi bỏ nhẫn, đồng hồ, quần áo vùng bỏng trước khi da sưng; không giật ra nếu đã dính chặt vào da.',
      'Che phủ vùng bỏng bằng gạc sạch hoặc vải không xơ; KHÔNG bôi kem đánh răng, nước mắm, lòng trắng trứng.',
      'Không cố ý làm vỡ bóng nước. Đưa tới cơ sở y tế khi bỏng rộng hơn bàn tay, bỏng sâu, hoặc ở mặt – bàn tay – bộ phận sinh dục.',
    ],
    note: 'Chỉ làm mát bằng NƯỚC MÁT — tuyệt đối không chườm đá trực tiếp lên vết bỏng.',
  },
  {
    id: 'fracture',
    emoji: '🩹',
    title: 'Gãy xương',
    badge: null,
    keywords: 'gãy xương nẹp bất động trật khớp',
    steps: [
      'Bất động vùng gãy bằng nẹp cứng (nhựa, gỗ, bìa cứng) — cố định cả khớp trên và khớp dưới chỗ gãy.',
      'Không nắn, kéo, xoay hay cố "lên khớp" vùng nghi gãy — điều đó dành cho nhân viên y tế.',
      'Chườm lạnh qua khăn 15–20 phút mỗi lần để giảm sưng đau; kê gạc mềm quanh nẹp trước khi cố định.',
      'Nếu gãy hở (xương đâm ra da): che vết thương bằng gạc sạch, tuyệt đối không đẩy xương vào trong.',
      'Gọi 115 khi nghi gãy xương sống – cổ (nạn nhân không cử động được, tê liệt), gãy xương chậu, xương đùi, hoặc gãy nhiều nơi.',
    ],
    note: 'Với nghi chấn thương cột sống: KHÔNG di chuyển nạn nhân trừ khi có nguy hiểm tính mạng, giữ đầu – cổ – thân thẳng hàng.',
  },
  {
    id: 'drowning',
    emoji: '🌊',
    title: 'Đuối nước',
    badge: null,
    keywords: 'đuối nước chết đuối sông biển hồ bơi',
    steps: [
      'Đưa nạn nhân ra khỏi nước một cách an toàn — ném phao, đưa cán gậy/dây, không nhảy trực tiếp xuống ôm nếu chưa được tập cứu hộ.',
      'Đặt nạn nhân nơi khô ráo, ấm; kiểm tra phản ứng và hô hấp trong tối đa 10 giây.',
      'Nếu không thở: bắt đầu CPR ngay với 30 lần ép ngực, sau đó 2 lần thổi ngực, lặp lại 30:2.',
      'Nếu còn thở: đặt nằm nghiêng an toàn, cởi bỏ quần áo ướt, phủ chăn giữ ấm.',
      'Vẫn đưa tới bệnh viện kể cả khi nạn nhân đã tỉnh — ngạt nước có thể gây tổn thương phổi xuất hiện muộn vài giờ.',
    ],
    note: null,
  },
  {
    id: 'insect',
    emoji: '🐍',
    title: 'Côn trùng cắn',
    badge: null,
    keywords: 'côn trùng cắn ong bọ cạp rắn độc nọc',
    steps: [
      'Rời khỏi khu vực nhiều côn trùng, ngồi yên, hạn chế vận động mạnh để độc tố không lan nhanh.',
      'Với ong/bọ cạp: cạo nọc ra bằng thẻ cứng thay vì bóp; KHÔNG hút vết cắn bằng miệng.',
      'Rửa vùng cắn bằng nước sạch và xà phòng, chườm lạnh qua khăn để giảm sưng đau.',
      'Theo dõi tối thiểu 30 phút: nếu khó thở, tức ngực, nổi mề đay lan nhanh, sưng môi – mặt, chóng mặt → sốc phản vệ, gọi 115 NGAY.',
    ],
    note: 'Với rắn cắn: giữ bình tĩnh, bất động chi thấp hơn tim, không rạch rửa băng garo — gọi 115 càng sớm càng tốt.',
  },
  {
    id: 'anaphylaxis',
    emoji: '⚡',
    title: 'Sốc phản vệ',
    badge: 'KHẨN CẤP',
    keywords: 'sốc phản vệ dị ứng anaphylaxis adrenaline',
    steps: [
      'Gọi 115 NGAY LẬP TỨC — sốc phản vệ có thể tử vong chỉ trong vài phút.',
      'Nếu có bút adrenaline tự tiêm (EpiPen): tiêm vào mặt ngoài đùi, giữ nguyên 3 giây rồi xoa nhẹ quanh chỗ tiêm; có thể tiêm lại liều 2 sau 5–15 phút nếu không đỡ.',
      'Đặt nạn nhân nằm ngửa, nâng chân khoảng 30 cm; nếu khó thở thì cho ngồi nửa người; nếu nôn thì nghiêng đầu sang một bên; KHÔNG cho uống bất cứ thứ gì.',
    ],
    note: 'Người từng sốc phản vệ luôn phải mang theo bút adrenaline và đeo vòng/yết hầu ghi rõ dị ứng.',
  },
  {
    id: 'seizure',
    emoji: '🧠',
    title: 'Co giật',
    badge: null,
    keywords: 'co giật động kinh epilepsy cơn giật',
    steps: [
      'Ghi nhớ giờ bắt đầu cơn co giật (đồng hồ/bấm giờ) và dọn các vật cứng, sắc nhọn xung quanh ra xa.',
      'Lót vật mềm dưới đầu, nới lỏng cổ áo, thắt lưng cho thoáng.',
      'KHÔNG nhét bất cứ thứ gì vào miệng (đũa, khăn, ngón tay), không ghì chặt tay chân đang giật.',
      'Sau khi cơn ngừng: đặt nạn nhân nằm nghiêng an toàn để tránh hít sặc; gọi 115 nếu cơn kéo dài quá 5 phút, co giật lặp liên tiếp, hoặc đây là cơn co giật đầu tiên trong đời.',
    ],
    note: null,
  },
];

export function findTopic(id) {
  return FIRST_AID_TOPICS.find((t) => t.id === id) || null;
}

/** Bỏ dấu tiếng Việt cho search thân thiện (không cần thư viện ngoài). */
export function normalizeSearch(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

/** Tìm chủ đề theo từ khóa: khớp cả tiêu đề lẫn keyword, không phân biệt dấu. */
export function searchTopics(query) {
  const q = normalizeSearch(query.trim());
  if (!q) return FIRST_AID_TOPICS;
  return FIRST_AID_TOPICS.filter((t) =>
    normalizeSearch(`${t.title} ${t.searchTitle || ''} ${t.keywords || ''}`).includes(q),
  );
}
