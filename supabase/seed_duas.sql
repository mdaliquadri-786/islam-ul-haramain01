-- ============================================================================
-- ISLAM UL HARAMAIN (إسلام الحرمين)
-- DUAS & ADHKAR ENGINE SEED DATA (M2.4)
-- Generated: 2026-09-23T17:48:07.081Z
-- Total Sources: 1
-- Total Categories: 132
-- Total Duas: 268
-- Dataset Checksum: dd490f5fd26c959fb3487686df152cea22ea6757a38ee407dcdd34bb0b11c357
-- ============================================================================

BEGIN;

-- Temporarily enable seed override for idempotent updates
SET LOCAL app.allow_dua_override = 'true';

-- 1. Dua Sources Registry
INSERT INTO public.dua_sources (id, slug, name_arabic, name_english, name_urdu, author, author_arabic, author_death_year_ah, author_death_year_ce, license, description, status) VALUES ('hisn-al-muslim', 'hisn-al-muslim', 'حِصْنُ المُسْلِمِ مِنْ أَذْكَارِ الكِتَابِ وَالسُّنَّةِ', 'Fortress of the Muslim (Hisn al-Muslim)', 'حصن المسلم من أذكار الكتاب والسنة', 'Shaykh Sa''id ibn Ali ibn Wahf al-Qahtani (رحمه الله)', 'د. سعيد بن علي بن وهف القحطاني', 1440, 2018, 'Islamic Waqf (Dedicated for Free Non-Commercial Propagation)', 'The globally authoritative compendium of authentic daily supplications and remembrances derived strictly from the Noble Quran and Sahih Sunnah.', 'published')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, author = EXCLUDED.author, author_arabic = EXCLUDED.author_arabic, author_death_year_ah = EXCLUDED.author_death_year_ah, author_death_year_ce = EXCLUDED.author_death_year_ce, license = EXCLUDED.license, description = EXCLUDED.description, status = EXCLUDED.status;

-- 2. Dua Categories
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (1, 'when-waking-up', 'أذكار الاستيقاظ من النوم', 'When waking up', 'سو کر بیدار ہوتے وقت کے اذکار', 1, 4)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (2, 'when-wearing-a-garment', 'دعاء لبس الثوب', 'When wearing a garment', 'لباس پہنتے وقت کی دعا', 2, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (3, 'when-wearing-a-new-garment', 'دعاء لبس الثوب الجديد', 'When wearing a new garment', 'نیا لباس پہنتے وقت کی دعا', 3, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (4, 'to-someone-wearing-a-new-garment', 'الدعاء لمن لبس ثوباً جديداً', 'To someone wearing a new garment', 'نئے لباس والے کو دعا', 4, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (5, 'before-undressing', 'ما يقول إذا وضع الثوب', 'Before undressing', 'لباس اتارتے وقت کا ذکر', 5, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (6, 'before-entering-the-bathroom', 'دعاء دخول الخلاء', 'Before entering the bathroom', 'بیت الخلاء میں داخل ہونے کی دعا', 6, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (7, 'after-leaving-the-bathroom', 'دعاء الخروج من الخلاء', 'After leaving the bathroom', 'بیت الخلاء سے نکلنے کی دعا', 7, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (8, 'before-ablution', 'الذكر قبل الوضوء', 'Before ablution', 'وضو شروع کرتے وقت کی دعا', 8, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (9, 'upon-completing-the-ablution', 'الذكر بعد الفراغ من الوضوء', 'Upon completing the ablution', 'وضو مکمل کرنے کے بعد کی دعا', 9, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (10, 'remembrance-when-leaving-the-home', 'الذكر عند الخروج من المنزل', 'Remembrance when leaving the home', 'گھر سے نکلتے وقت کی دعا', 10, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (11, 'remembrance-upon-entering-the-home', 'الذكر عند الدخول المنزل', 'Remembrance upon entering the home', 'گھر میں داخل ہوتے وقت کی دعا', 11, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (12, 'when-going-to-the-mosque', 'دعاء الذهاب إلى المسجد', 'When going to the mosque', 'مسجد جاتے وقت کی دعا', 12, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (13, 'upon-entering-the-mosque', 'دعاء دخول المسجد', 'Upon entering the mosque', 'مسجد میں داخل ہوتے وقت کی دعا', 13, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (14, 'upon-leaving-the-mosque', 'دعاء الخروج من المسجد', 'Upon leaving the mosque', 'مسجد سے نکلتے وقت کی دعا', 14, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (15, 'concerning-the-athan-the-call-to-prayer', 'أذكار الأذان', 'Concerning the athan (the call to prayer)', 'اذان کے وقت کے اذکار', 15, 5)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (16, 'at-the-start-of-the-prayer-after-takbeer', 'دعاء الاستفتاح', 'At the start of the prayer (after takbeer)', 'دعائے استفتاح (تکبیر تحریمہ کے بعد)', 16, 6)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (17, 'while-bowing-in-prayer', 'دعاء الركوع', 'While bowing in prayer', 'رکوع کی دعائیں', 17, 5)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (18, 'upon-rising-from-the-bowing-position', 'دعاء الرفع من الركوع', 'Upon rising from the bowing position', 'رکوع سے اٹھتے وقت کی دعا', 18, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (19, 'while-prostrating', 'دعاء السجود', 'While prostrating', 'سجدے کی دعائیں', 19, 7)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (20, 'between-the-two-prostrations', 'دعاء الجلسة بين السجدتين', 'Between the two prostrations', 'دونوں سجدوں کے درمیان کی دعا', 20, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (21, 'when-prostrating-due-to-recitation-of-the-quran', 'دعاء سجود التلاوة', 'When prostrating due to recitation of the Quran', NULL, 21, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (22, 'the-tashahhud', 'التشهد', 'The Tashahhud', 'التحیات (تشہد)', 22, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (23, 'prayers-upon-the-prophet-after-the-tashahhud', 'الصلاة على النبي صلى الله عليه وسلم بعد التشهد', 'Prayers upon the Prophet ﷺ after the tashahhud', 'درود شریف (تشہد کے بعد)', 23, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (24, 'after-the-last-tashahhud-and-before-salam', 'الدعاء بعد التشهد الأخير وقبل السلام', 'After the last tashahhud and before salam', NULL, 24, 11)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (25, 'after-salam', 'الأذكار بعد السلام من الصلاة', 'After salam', 'نماز کے سلام کے بعد کے اذکار', 25, 8)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (26, 'for-seeking-guidance-in-forming-a-decision-or-choosing-the-proper-course', 'دعاء صلاة الاستخارة', 'For seeking guidance in forming a decision or choosing the proper course', 'دعائے استخارہ', 26, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (27, 'in-the-morning-and-evening', 'أذكار الصباح والمساء', 'In the morning and evening', 'صبح اور شام کے مسنون اذکار', 27, 25)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (28, 'before-sleeping', 'أذكار النوم', 'Before sleeping', 'سونے سے پہلے کے اذکار', 28, 13)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (29, 'when-tossing-and-turning-during-the-night', 'الدعاء إذا تقلب ليلاً', 'When tossing and turning during the night', 'رات کو بے خوابی یا کروٹ بدلتے وقت', 29, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (30, 'upon-experiencing-unrest-fear-apprehensiveness-during-sleep', 'دعاء القلق والفزع في النوم ومن بلي بالوحشة', 'Upon experiencing unrest, fear, apprehensiveness during sleep', NULL, 30, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (31, 'upon-seeing-a-good-dream-or-a-bad-dream', 'ما يفعل من رأى الرؤيا أو الحلم', 'Upon seeing a good dream or a bad dream', 'اچھا یا برا خواب دیکھنے کے بعد', 31, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (32, 'qunoot-al-witr', 'دعاء قنوت الوتر', 'Qunoot Al-Witr', 'دعائے قنوت وتر', 32, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (33, 'immediately-after-salam-of-the-witr-prayer', 'الذكر عقب السلام من الوتر', 'Immediately after salam of the witr prayer', 'وتر کے سلام کے فوراً بعد کا ذکر', 33, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (34, 'for-anxiety-and-sorrow', 'دعاء الهم والحزن', 'For anxiety and sorrow', 'فکر، غم اور پریشانی کی دعا', 34, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (35, 'for-one-in-distress', 'دعاء الكرب', 'For one in distress', 'سخت مصیبت اور بے چینی کی دعا', 35, 4)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (36, 'upon-encountering-an-enemy-or-those-of-authority', 'دعاء لقاء العدو وذي السلطان', 'Upon encountering an enemy or those of authority', 'دشمن یا ظالم حاکم سے سامنا ہونے پر', 36, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (37, 'for-one-afraid-of-the-rulers-injustice', 'دعاء من خاف ظلم السلطان', 'For one afraid of the ruler''s injustice', 'حاکم کے ظلم سے خوفزدہ شخص کی دعا', 37, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (38, 'against-enemies', 'الدعاء على العدو', 'Against enemies', 'دشمنوں کے خلاف دعا', 38, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (39, 'when-being-afraid-of-a-group-of-people', 'ما يقول من خاف قوماً', 'When being afraid of a group of people', NULL, 39, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (40, 'for-one-afflicted-with-doubt-in-his-faith', 'دعاء من أصابه شك في الإيمان', 'For one afflicted with doubt in his faith', 'ایمان میں وسوسہ آنے پر دعا', 40, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (41, 'settling-a-debt', 'الدعاء قضاء الدين', 'Settling a debt', 'قرض کی ادائیگی کی دعا', 41, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (42, 'for-one-afflicted-by-whisperings-in-prayer-or-recitation', 'دعاء الوسوسة في الصلاة والقراءة', 'For one afflicted by whisperings in prayer or recitation', 'نماز یا تلاوت میں وسوسے دور کرنے کی دعا', 42, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (43, 'for-one-whose-affairs-have-become-difficult', 'دعاء من استصعب عليه أمر', 'For one whose affairs have become difficult', 'مشکل آسان کرنے کی دعا', 43, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (44, 'upon-committing-a-sin', 'ما يقول ويفعل من أذنب ذنباً', 'Upon committing a sin', 'گناہ سرزد ہونے پر توبہ کی دعا', 44, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (45, 'for-expelling-the-devil-and-his-whisperings', 'دعاء طرد الشيطان ووساوسه', 'For expelling the devil and his whisperings', 'شیطان اور اس کے وسوسوں کو بھگانے کی دعا', 45, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (46, 'when-stricken-with-a-mishap-or-overtaken-by-an-affair', 'الدعاء حينما يقع مالا يرضاه أو غلب على أمره', 'When stricken with a mishap or overtaken by an affair', 'ناگوار بات یا حادثہ پیش آنے پر دعا', 46, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (47, 'congratulation-on-the-occasion-of-a-birth-and-its-reply', 'تهنئة المولود له وجوابه', 'Congratulation on the occasion of a birth and its reply', NULL, 47, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (48, 'placing-childen-under-allahs-protection', 'ما يعوذ به الأولاد', 'Placing childen under Allah’s protection', NULL, 48, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (49, 'when-visiting-the-sick', 'الدعاء للمريض في عيادته', 'When visiting the sick', 'مریض کی عیادت کے وقت کی دعا', 49, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (50, 'excellence-of-visiting-the-sick', 'فضل عيادة المريض', 'Excellence of visiting the sick', 'مریض کی عیادت کی فضیلت', 50, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (51, 'when-the-sick-have-renounced-all-hope-of-life', 'دعاء المريض الذي يئس من حياته', 'When the sick have renounced all hope of life', 'مایوس العلاج مریض کی دعا', 51, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (52, 'instruction-for-the-one-nearing-death', 'تلقين المحتضر', 'Instruction for the one nearing death', 'قریب المرگ کو تلقین (کلمہ)', 52, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (53, 'for-one-afflicted-by-a-calamity', 'دعاء من أصيب بمصيبة', 'For one afflicted by a calamity', 'مصیبت کے وقت کی دعا (انا للہ)', 53, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (54, 'when-closing-the-eyes-of-the-deceased', 'الدعاء عند إغماض الميت', 'When closing the eyes of the deceased', 'میت کی آنکھیں بند کرتے وقت کی دعا', 54, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (55, 'for-the-deceased-at-the-funeral-prayer', 'الدعاء للميت في الصلاة عليه', 'For the deceased at the funeral prayer', 'نماز جنازہ کی دعا', 55, 4)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (56, 'when-the-deceased-is-a-child-during-the-funeral-prayer', 'الدعاء للفرط في الصلاة عليه', 'When the deceased is a child, during the funeral prayer', 'نابالغ بچے کی نماز جنازہ کی دعا', 56, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (57, 'condolence', 'دعاء التعزية', 'Condolence', 'تعزیت کے کلمات', 57, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (58, 'placing-the-deceased-in-the-grave', 'الدعاء عند إدخال الميت القبر', 'Placing the deceased in the grave', 'میت کو قبر میں اتارتے وقت کی دعا', 58, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (59, 'after-burying-the-deceased', 'الدعاء بعد دفن الميت', 'After burying the deceased', 'تدفین کے بعد کی دعا', 59, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (60, 'visiting-the-graves', 'دعاء زيارة القبور', 'Visiting the graves', 'زیارت قبور کی دعا', 60, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (61, 'during-a-wind-storm', 'دعاء الريح', 'During a wind storm', 'آندھی اور تیز ہوا کے وقت کی دعا', 61, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (62, 'upon-hearing-thunder', 'دعاء الرعد', 'Upon hearing thunder', 'بجلی کی گرج سن کر دعا', 62, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (63, 'for-rain', 'من أدعية الاستسقاء', 'For rain', 'طلب باران (استسقاء) کی دعا', 63, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (64, 'when-it-rains', 'الدعاء إذا نزل المطر', 'When it rains', 'بارش برستے وقت کی دعا', 64, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (65, 'after-rainfall', 'الذكر بعد نزول المطر', 'After rainfall', 'بارش کے بعد کا ذکر', 65, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (66, 'asking-for-clear-skies', 'من أدعية الاستصحاء', 'Asking for clear skies', 'بارش بند ہونے اور بادل چھٹنے کی دعا', 66, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (67, 'upon-sighting-the-crescent-moon', 'دعاء رؤية الهلال', 'Upon sighting the crescent moon', 'نیا چاند دیکھنے کی دعا', 67, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (68, 'upon-breaking-fast', 'الدعاء عند إفطار الصائم', 'Upon breaking fast', 'افطار کے وقت کی دعا', 68, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (69, 'before-eating', 'الدعاء قبل الطعام', 'Before eating', 'کھانا شروع کرنے کی دعا', 69, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (70, 'upon-completing-the-meal', 'الدعاء عند الفراغ من الطعام', 'Upon completing the meal', 'کھانے سے فارغ ہونے کی دعا', 70, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (71, 'of-the-guest-for-the-host', 'دعاء الضيف لصاحب الطعام', 'Of the guest for the host', 'مہمان کی میزبان کے لیے دعا', 71, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (72, 'to-one-who-intends-to-give-food-or-drink', 'الدعاء لمن سقاه أو إذا أراد ذلك', 'To one who intends to give food or drink', NULL, 72, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (73, 'when-breaking-fast-in-someones-home', 'الدعاء إذا أفطر عند أهل بيت', 'When breaking fast in someone’s home', 'کسی کے ہاں روزہ افطار کرنے کی دعا', 73, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (74, 'by-one-fasting-when-presented-with-food-and-does-not-break-his-fast', 'دعاء الصائم إذا حضر الطعام ولم يفطر', 'By one fasting when presented with food and does not break his fast', 'روزہ دار کو کھانے کی دعوت پر دعا', 74, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (75, 'when-insulted-while-fasting', 'ما يقول الصائم إذا سابه أحد', 'When insulted while fasting', 'روزہ کی حالت میں کوئی گالی دے تو کیا کہے', 75, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (76, 'upon-seeing-the-early-or-premature-fruit', 'الدعاء عند رؤية باكورة الثمر', 'Upon seeing the early or premature fruit', 'نیا پھل دیکھنے کی دعا', 76, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (77, 'upon-sneezing', 'دعاء العطاس', 'Upon sneezing', 'چھینک آنے کے آداب و دعائیں', 77, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (78, 'when-a-disbeliever-praises-allah-after-sneezing', 'ما يقالُ للكافر إذا عطس فحمد الله', 'When a disbeliever praises Allah after sneezing', NULL, 78, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (79, 'to-the-newlywed', 'الدعاء للمتزوج', 'To the newlywed', 'شادی کے موقع پر دولہا دلہن کو دعا', 79, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (80, 'on-the-wedding-night-or-when-buying-an-animal', 'دعاء المتزوج لنفسه ودعاء شراء الدابة', 'On the wedding night or when buying an animal', NULL, 80, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (81, 'before-sexual-intercourse-with-the-wife', 'الدعاء قبل إتيان الزوجة', 'Before sexual intercourse with the wife', NULL, 81, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (82, 'when-angry', 'دعاء الغضب', 'When angry', 'غصہ آنے کے وقت کی دعا', 82, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (83, 'upon-seeing-someone-in-trial-or-tribulation', 'دعاء من رأى مبتلى', 'Upon seeing someone in trial or tribulation', 'مصیبت زدہ کو دیکھ کر پڑھنے کی دعا', 83, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (84, 'at-a-sitting-or-gathering', 'ما يقال في المجلس', 'At a sitting or gathering', NULL, 84, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (85, 'for-the-expiation-of-sins-said-at-the-conclusion-of-a-sitting-or-gathering', 'كفارة المجلس ومايختم به المجالس', 'For the expiation of sins, said at the conclusion of a sitting or gathering', 'کفارہ مجلس کی دعا', 85, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (86, 'returning-a-supplication-of-forgiveness', 'الدعاء لمن قال غفر الله لك', 'Returning a supplication of forgiveness', NULL, 86, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (87, 'to-one-who-does-you-a-favour', 'الدعاء لمن صنع إليك معروفاً', 'To one who does you a favour', 'احسان کرنے والے کو جزاک اللہ خیرا کہنا', 87, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (88, 'protection-from-the-dajjal', 'ما يعصم به من الدجال', 'Protection from the Dajjal', 'فتنہ دجال سے بچاؤ کی دعا', 88, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (89, 'to-one-who-pronounces-his-love-for-you-for-allahs-sake', 'الدعاء لمن قال إني أحبك في الله', 'To one who pronounces his love for you, for Allah’s sake', 'محبت فی اللہ کا اظہار کرنے والے کو دعا', 89, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (90, 'to-one-who-has-offered-you-some-of-his-wealth', 'الدعاء لمن عرض عليك ماله', 'To one who has offered you some of his wealth', NULL, 90, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (91, 'to-the-debtor-when-his-debt-is-settled', 'الدعاء لمن أقرض عند القضاء', 'To the debtor when his debt is settled', NULL, 91, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (92, 'for-fear-of-shirk', 'دعاء الخوف من الشرك', 'For fear of shirk', 'شرک کے خوف کے وقت کی دعا', 92, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (93, 'to-someone-who-says-may-allah-bless-you', 'الدعاء لمن قال بارك الله فيك', 'To someone who says "May Allah bless you"', NULL, 93, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (94, 'the-scorn-of-ascribing-things-to-evil-omens', 'دعاء كراهية الطيرة', 'The scorn of ascribing things to evil omens', NULL, 94, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (95, 'when-mounting-an-animal-or-any-means-of-transport', 'دعاء ركوب الدابة', 'When mounting an animal or any means of transport', NULL, 95, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (96, 'for-travel', 'دعاء السفر', 'For travel', 'سفر کی مسنون دعا', 96, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (97, 'upon-entering-a-town-or-village', 'دعاء دخول القرية أو البلدة', 'Upon entering a town or village', NULL, 97, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (98, 'when-entering-the-market', 'دعاء دخول السوق', 'When entering the market', 'بازار میں داخل ہوتے وقت کی دعا', 98, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (99, 'when-the-mounted-animal-or-mean-of-transport-stumbles', 'الدعاء إذا تعس المركوب', 'When the mounted animal (or mean of transport) stumbles', NULL, 99, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (100, 'supplication-of-the-traveller-for-the-resident', 'دعاء المسافر للمقيم', 'Supplication of the traveller for the resident', NULL, 100, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (101, 'supplication-of-the-resident-for-the-traveller', 'دعاء المقيم للمسافر', 'Supplication of the resident for the traveller', 'مقیم کی مسافر کے لیے دعا', 101, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (102, 'takbir-and-tasbih-during-travel', 'التكبير والتسبيح في سير السفر', 'Takbir and Tasbih during travel', NULL, 102, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (103, 'prayer-of-the-traveller-as-dawn-approaches', 'دعاء المسافر إذا أسحر', 'Prayer of the traveller as dawn approaches', NULL, 103, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (104, 'stopping-or-lodging-somewhere-in-travel-and-otherwise', 'الدعاء إذا نزل منزلا في سفر أو غيره', 'Stopping or lodging somewhere in travel and otherwise', NULL, 104, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (105, 'while-returning-from-travel', 'ذكر الرجوع من السفر', 'While returning from travel', 'سفر سے واپسی کی دعا', 105, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (106, 'what-to-say-upon-receiving-pleasing-or-displeasing-news', 'ما يقول ويفعل من أتاه أمر يسره أو يكرهه', 'What to say upon receiving pleasing or displeasing news', NULL, 106, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (107, 'excellence-of-sending-prayers-upon-the-prophet-saws', 'فضل الصلاة على النبي صلى الله عليه وسلم', 'Excellence of sending prayers upon the Prophet (saws)', 'نبی کریم ﷺ پر درود بھیجنے کی فضیلت', 107, 5)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (108, 'excellence-of-spreading-the-islamic-greeting', 'إفشاء السلام', 'Excellence of spreading the Islamic greeting', 'سلام پھیلانے کی فضیلت', 108, 3)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (109, 'returning-a-greeting-to-a-disbeliever', 'كيف يرد السلام على الكافر إذا سلم', 'Returning a greeting to a disbeliever', 'غیر مسلم کے سلام کا جواب', 109, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (110, 'upon-hearing-a-rooster-crow-or-the-braying-of-a-donkey', 'دعاء صياح الديك ونهيق الحمار', 'Upon hearing a rooster crow or the braying of a donkey', NULL, 110, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (111, 'upon-hearing-the-barking-of-dogs-at-night', 'دعاء نباح الكلاب بالليل', 'Upon hearing the barking of dogs at night', NULL, 111, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (112, 'for-one-you-have-insulted', 'الدعاء لمن سببته', 'For one you have insulted', NULL, 112, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (113, 'the-etiquette-of-praising-a-fellow-muslim', 'ما يقول المسلم إذا مدح المسلم', 'The etiquette of praising a fellow Muslim', 'کسی مسلمان کی تعریف کرنے کے آداب', 113, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (114, 'for-the-one-that-have-been-praised', 'ما يقول المسلم إذا زكي', 'For the one that have been praised', NULL, 114, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (115, 'the-talbiya-for-the-one-doing-hajj-or-umrah', 'كيف يلبي المحرم في الحج أو العمرة', 'The Talbiya for the one doing Hajj or ''Umrah', NULL, 115, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (116, 'the-takb-r-passing-the-black-stone', 'التكبيرة إذا أتي الركن الأسود', 'The Takbîr passing the black stone', NULL, 116, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (117, 'between-the-yemeni-corner-and-the-black-stone', 'الدعاء بين الركن اليماني والحجر الأسود', 'Between the Yemeni corner and the black stone', 'رکن یمانی اور حجر اسود کے درمیان کی دعا', 117, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (118, 'when-at-mount-safa-and-mount-marwah', 'دعاء الوقوف على الصفا والمروة', 'When at Mount Safa and Mount Marwah', 'صفا اور مروہ پر کھڑے ہو کر دعائیں', 118, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (119, 'the-day-of-arafah', 'الدعاء يوم عرفة', 'The Day of ''Arafah', 'یوم عرفہ کی دعا', 119, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (120, 'remembrance-at-muzdalifa', 'الذكر عند المشعر الحرام', 'Remembrance at Muzdalifa', NULL, 120, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (121, 'takbir-when-throwing-each-pebble-at-the-jamarat', 'التكبيرة عند رمي الجمار مع كل حصاة', 'Takbir when throwing each pebble at the Jamarat', NULL, 121, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (122, 'at-times-of-amazement-and-that-which-delights', 'ما يقول عند التعجب والأمر السار', 'At times of amazement and that which delights', 'تعجب اور خوشی کے لمحات میں', 122, 2)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (123, 'upon-receiving-pleasant-news', 'ما يفعل من أتاه أمر يسره', 'Upon receiving pleasant news', 'خوشخبری ملنے پر سجدہ شکر', 123, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (124, 'when-feeling-some-pain-in-the-body', 'ما يقول من أحس وجعاً في جسده', 'When feeling some pain in the body', 'جسم میں درد محسوس ہونے پر دم', 124, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (125, 'when-in-fear-of-afflicting-something-with-an-evil-eye-from-oneself', 'دعاء من خشي أن يصيب شيئاً بعينه', 'When in fear of afflicting something with an (evil) eye from oneself', NULL, 125, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (126, 'when-startled', 'ما يقال عند الفزع', 'When startled', NULL, 126, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (127, 'when-slaughtering-or-offering-a-sacrifice', 'ما يقول عند الذبح أو النحر', 'When slaughtering or offering a sacrifice', NULL, 127, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (128, 'to-ward-off-the-plot-of-the-rebellious-devils', 'ما يقول لرد كيد مردة الشياطين', 'To ward off the plot of the rebellious devils', 'سرکش شیاطین کی سازش کو دفع کرنے کی دعا', 128, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (129, 'seeking-forgiveness-and-repentance', 'الاستغفار والتوبة', 'Seeking forgiveness and repentance', 'استغفار اور توبہ کی دعائیں', 129, 6)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (130, 'excellence-of-tasbih-tahmid-tahlil-and-takbir', 'فضل التسبيح والتحميد ، والتهليل ، والتكبير', 'Excellence of Tasbih, Tahmid, Tahlil, and Takbir', 'تسبیح، تحمید، تہلیل اور تکبیر کی فضیلت', 130, 12)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (131, 'how-the-prophet-made-tasbeeh', 'كيف كان النبي صلى الله عليه وسلم يسبح ؟', 'How the Prophet ﷺ made tasbeeh', 'نبی کریم ﷺ تسبیح کیسے شمار فرماتے تھے', 131, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;
INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (132, 'comprehensive-types-of-good-and-manners', 'من أنواع الخير والآداب الجامعة', 'Comprehensive types of good and manners', 'جامع خیر اور نبوی آداب', 132, 1)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;

-- 3. Duas & Adhkar Records
INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (1, 'hisn-1', 1, 'hisn-al-muslim', 1, 'الحَمْـدُ لِلّهِ الّذي أَحْـيانا
بَعْـدَ ما أَماتَـنا
وَإليه النُّـشور', 'Alḥamdu lillāhil-ladhī ''aḥyānā 
ba`da mā ''amātanā 
wa ''ilayhin-nushūr.', 'Praise is to Allah Who gives us life
after He has caused us to die
and to Him is the return.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/113; Muslim 4/2083', NULL, '6050ef146b7772e7dc9d30c669db986524f89d71c55cd87dea6424b3c4abbc98', 'الحمد لله الذي احيانا بعد ما اماتنا واليه النشور', 1, TRUE, 'published'),
  (2, 'hisn-2', 1, 'hisn-al-muslim', 2, 'لا إلهَ إلاّ اللّهُ وَحْـدَهُ لا شَـريكَ له،
لهُ المُلـكُ ولهُ الحَمـد،
وهوَ على كلّ شيءٍ قدير،
سُـبْحانَ اللهِ، والحمْـدُ لله،
ولا إلهَ إلاّ اللهُ واللهُ أكبَر،
وَلا حَولَ وَلا قوّة إلاّ باللّهِ العليّ العظيم،
رَبِّ اغْفرْ لي', 'Lā ''ilāha ''illallāhu waḥdahu la sharīka lahu, 
lahul-mulku wa lahul-ḥamdu, 
wa huwa ''alā kulli shay''in qadīr
Subḥānallāhi, walḥamdu lillāhi, 
wa lā ''ilāha ''illallāhu, wallāhu ''akbar, 
wa lā ḥaula wa lā quwwata ''illā billāhil-`aliyyil-`aẓīm, 
rabbighfir lī.', 'There is none worthy of worship but Allah alone, Who has no partner, 
His is the dominion and to Him belongs all praise, 
and He is able to do all things.
Glory is to Allah. Praise is to Allah.
There is none worthy of worship but Allah. Allah is the Most Great. 
There is no might and no power except by Allah''s leave, the Exalted, the Mighty.
My Lord, forgive me.', NULL, 10, NULL, NULL, NULL, 'bukhari', NULL, 'Whoever says this will be forgiven, and if he supplicates Allah, his prayer 
will be answered; if he performs ablution and prays, his prayer will be 
accepted. Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/39, among others. The 
wording here is from Ibn Majah 2/335.', NULL, '6303a81373a74adcccc8a534ccb2e86b0c8def4cb85883740cf6f2d8a529ea81', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير سبحان الله والحمد لله ولا اله الا الله والله اكبر ولا حول ولا قوه الا بالله العلي العظيم رب اغفر لي', 1, TRUE, 'published'),
  (3, 'hisn-3', 1, 'hisn-al-muslim', 3, 'الحمدُ للهِ الذي
عافاني في جَسَدي
وَرَدّ عَليّ روحي
وَأَذِنَ لي بِذِكْرِه', 'Al-ḥamdu lillāhil-ladhī 
`āfānī fī jasadī, 
wa radda `alayya rūḥī, 
wa ''adhina lī bidhikrihi.', 'Praise is to Allah Who 
gave strength to my body 
and returned my soul to me 
and permitted me to remember Him.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/473. See Al-Albani''s Sahih Tirmidhi 3/144.', 'Sahih', 'f49d6fdd9fce6ff56cf2ba99919c5564f6109a680e872a9afcec7669936d7816', 'الحمد لله الذي عافاني في جسدي ورد علي روحي واذن لي بذكره', 1, TRUE, 'published'),
  (4, 'hisn-4', 1, 'hisn-al-muslim', 4, 'إِنَّ فِي خَلْقِ السَّمَوَاتِ وَالأَرْضِ وَاخْتِلاَفِ اللَّيْلِ
وَالنَّهَارِ لآيَاتٍ لأُوْلِي الألْبَابِ {190} الَّذِينَ يَذْكُرُونَ اللهَ
قِيَامًا وَقُعُودًا وَعَلَىَ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ
السَّمَوَاتِ وَالأَرْضِ رَبَّنَا مَا خَلَقْتَ هَذا بَاطِلاً سُبْحَانَكَ
فَقِنَا عَذَابَ النَّارِ {191} رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ
فَقَدْ أَخْزَيْتَهُ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ {192} رَّبَّنَا
إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلإِيمَانِ أَنْ ءامِنُواْ
بِرَبِّكُمْ فَآمَنَّا رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا
سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الأبْرَارِ {193} رَبَّنَا وَءاتِنَا مَا
وَعَدتَّنَا عَلَى رُسُلِكَ وَلاَ تُخْزِنَا يَوْمَ الْقِيَامَةِ إِنَّكَ لاَ
تُخْلِفُ الْمِيعَادَ {194} فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لاَ أُضِيعُ
عَمَلَ عَامِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَى بَعْضُكُم مِّن بَعْضٍ
فَالَّذِينَ هَاجَرُواْ وَأُخْرِجُواْ مِن دِيَارِهِمْ وَأُوذُواْ فِي
سَبِيلِي وَقَاتَلُواْ وَقُتِلُواْ لأُكَفِّرَنَّ عَنْهُمْ سَيِّئَاتِهِمْ
وَلأُدْخِلَنَّهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الأَنْهَارُ ثَوَابًا مِّن
عِندِ اللهِ وَاللهُ عِندَهُ حُسْنُ الثَّوَابِ {195} لاَ يَغُرَّنَّكَ
تَقَلُّبُ الَّذِينَ كَفَرُواْ فِي الْبِلاَدِ {196} مَتَاعٌ قَلِيلٌ ثُمَّ
مَأْوَاهُمْ جَهَنَّمُ وَبِئْسَ الْمِهَادُ {197} لَكِنِ الَّذِينَ اتَّقَوْاْ
رَبَّهُمْ لَهُمْ جَنَّاتٌ تَجْرِي مِن تَحْتِهَا الأَنْهَارُ خَالِدِينَ
فِيهَا نُزُلاً مِّنْ عِندِ اللهِ وَمَا عِندَ اللهِ خَيْرٌ لِّلأَبْرَارِ
{198} وَإِنَّ مِنْ أَهْلِ الْكِتَابِ لَمَن يُؤْمِنُ بِاللهِ وَمَا أُنزِلَ
إِلَيْكُمْ وَمَآ أُنزِلَ إِلَيْهِمْ خَاشِعِينَ للهِ لاَ يَشْتَرُونَ
بِآيَاتِ اللهِ ثَمَنًا قَلِيلاً أُوْلَئِكَ لَهُمْ أَجْرُهُمْ عِندَ
رَبِّهِمْ إِنَّ اللهَ سَرِيعُ الْحِسَابِ {199} يَا أَيُّهَا الَّذِينَ
ءامَنُواْ اصْبِرُواْ وَصَابِرُواْ وَرَابِطُواْ وَاتَّقُواْ اللهَ
لَعَلَّكُمْ تُفْلِحُونَ {200}', '''Inna fī khalqi-ssamāwāti wal-''arđi wakhtilāfi-llayli wan-nahāri la''āyātin li''wlī-l-''albāb.
Al-ladhīna yadhkurūna-allaha qiyāman wa qu`ūdan wa `alā junūbihim wa yatafakkarūna fī Khalqi-ssamāwāti wal-''arđi rabbanā mā khalaqta hādhā bāţilāan subĥānaka faqinā `adhāban-nār.
Rabbanā ''innaka man tudkhili-nnāra faqad ''akhzaytahu wa mā li-žžālimīna min ''anşārin.
Rabbanā ''innanā sami`nā munādīan yunādī lil''īmāni ''an ''āminū birabbikum fa ''āmannā. 
Rabbanā fāghfirlanā dhunūbanā wa kaffir `annā sayyi''ātinā wa tawaffanā ma`a al-''abrāri.
Rabbanā wa ''ātinā mā wa`adtanā `alá rusulika wa lā tukhzinā yawmal-qiyāmati ''innaka lā tukhliful-mī`ād.
Fāstajāba lahum rabbuhum ''annī lā ''uđī`u `amala `āmilin minkum min dhakarin ''aw ''unthá ba`đukum min ba`đin fa-lladhīna hājarū wa ''ukhrijū min diyārihim wa ''ūdhū fī sabīlī wa qātalū wa qutilū la''ukaffiranna `anhum sayyi''ātihim wa la''udkhilannahum jannātin tajrī min taĥtihāl-''anhāru thawāban min `indil-lahi wal-lāhu `indahu ĥusnuth-thawāb.
Lā yaghurrannaka taqallubu ''l-ladhīna kafarū fī l-bilādi.
Matā`un qalīlun thumma ma''wāhum jahannamu wa bi''sa ''l-mihād.
Lakini ''l-ladhīna ''ttaqaw rabbahum lahum jannātun tajrī min taĥtihā ''l-''anhāru khālidīna fīhā nuzulan min `indi ''l-lahi wa mā `inda ''llahi khayrun li ''l-abrār.
Wa ''inna min ''ahli ''l-kitābi laman yu''minu bil-lahi wa mā ''unzila ''ilaykum wa mā ''unzila ''ilayhim khāshi`īna lillahi lā yashtarūna bi''āyāti ''l-lahi thamanan qalīlāan ''ulā''ika lahum ''ajruhum `inda rabbihim ''inna ''l-laha sarī`u al-ĥisāb.
Yā ''ayyuhā ''l-ladhīna ''āmanū-şbirū wa şābirū wa rābiţū wa ''ttaqu ''l-laha la`allakum tufliĥūn.', 'Indeed, in the creation of the heavens and the earth and the alternation of the day and night there are signs for people of reason.
˹They are˺ those who remember Allah while standing, sitting, and lying on their sides, and reflect on the creation of the heavens and the earth ˹and pray˺, “Our Lord! You have not created ˹all of˺ this without purpose. Glory be to You! Protect us from the torment of the Fire.
Our Lord! Indeed, those You commit to the Fire will be ˹completely˺ disgraced! And the wrongdoers will have no helpers.
Our Lord! We have heard the caller to ˹true˺ belief, ˹proclaiming,˺ ‘Believe in your Lord ˹alone˺,’ so we believed. Our Lord! Forgive our sins, absolve us of our misdeeds, and allow us ˹each˺ to die as one of the virtuous.
Our Lord! Grant us what You have promised us through Your messengers and do not put us to shame on Judgment Day—for certainly You never fail in Your promise.”
So their Lord responded to them: “I will never deny any of you—male or female—the reward of your deeds. Both are equal in reward. Those who migrated or were expelled from their homes, and were persecuted for My sake and fought and ˹some˺ were martyred—I will certainly forgive their sins and admit them into Gardens under which rivers flow, as a reward from Allah. And with Allah is the finest reward!”
Do not be deceived by the prosperity of the disbelievers throughout the land.
It is only a brief enjoyment. Then Hell will be their home—what an evil place to rest!
But those who are mindful of their Lord will be in Gardens under which rivers flow, to stay there forever—as an accommodation from Allah. And what is with Allah is best for the virtuous.
Indeed, there are some among the People of the Book who truly believe in Allah and what has been revealed to you ˹believers˺ and what was revealed to them. They humble themselves before Allah—never trading Allah’s revelations for a fleeting gain. Their reward is with their Lord. Surely Allah is swift in reckoning.
O believers! Patiently endure, persevere, stand on guard, and be mindful of Allah, so you may be successful.', NULL, 1, NULL, 3, '190-200', 'bukhari', NULL, 'Qur''an Āl-''Imran 3: 190-200; Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 
8/237; Muslim 1/530.', NULL, 'f8060ba326d47e5dd6c0d7432060cb19864341b2f9587da349bdcc10956fbe24', 'ان في خلق السموات والارض واختلاف الليل والنهار لايات لاولي الالباب 190 الذين يذكرون الله قياما وقعودا وعلي جنوبهم ويتفكرون في خلق السموات والارض ربنا ما خلقت هذا باطلا سبحانك فقنا عذاب النار 191 ربنا انك من تدخل النار فقد اخزيته وما للظالمين من انصار 192 ربنا اننا سمعنا مناديا ينادي للايمان ان ءامنوا بربكم فامنا ربنا فاغفر لنا ذنوبنا وكفر عنا سيياتنا وتوفنا مع الابرار 193 ربنا وءاتنا ما وعدتنا علي رسلك ولا تخزنا يوم القيامه انك لا تخلف الميعاد 194 فاستجاب لهم ربهم اني لا اضيع عمل عامل منكم من ذكر او انثي بعضكم من بعض فالذين هاجروا واخرجوا من ديارهم واوذوا في سبيلي وقاتلوا وقتلوا لاكفرن عنهم سيياتهم ولادخلنهم جنات تجري من تحتها الانهار ثوابا من عند الله والله عنده حسن الثواب 195 لا يغرنك تقلب الذين كفروا في البلاد 196 متاع قليل ثم ماواهم جهنم وبيس المهاد 197 لكن الذين اتقوا ربهم لهم جنات تجري من تحتها الانهار خالدين فيها نزلا من عند الله وما عند الله خير للابرار 198 وان من اهل الكتاب لمن يومن بالله وما انزل اليكم وما انزل اليهم خاشعين لله لا يشترون بايات الله ثمنا قليلا اوليك لهم اجرهم عند ربهم ان الله سريع الحساب 199 يا ايها الذين ءامنوا اصبروا وصابروا ورابطوا واتقوا الله لعلكم تفلحون 200', 1, TRUE, 'published'),
  (5, 'hisn-5', 2, 'hisn-al-muslim', 5, 'الحمدُ للهِ الّذي كَساني هذا (الثّوب)
وَرَزَقَنيه مِنْ غَـيـْرِ حَولٍ مِنّي وَلا قـوّة', 'Alḥamdu lillāhil-ladhī kasānī hādhā (aththawba) 
wa razaqanīhi min ghayri hawlim-minnī wa lā quwwah.', 'Praise is to Allah Who has clothed me with this (garment)
and provided it for me, though I was powerless myself and incapable', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, Muslim, Abu Dawud, Ibn Majah, At-Tirmidhi. See also 
''Irwa''ul-Ghalil 7/47.', NULL, 'f4c60d3bc8a6178e29d24d8448502f27e4001d7ef5aca97172e7259b6b012817', 'الحمد لله الذي كساني هذا الثوب ورزقنيه من غير حول مني ولا قوه', 1, TRUE, 'published'),
  (6, 'hisn-6', 3, 'hisn-al-muslim', 6, 'اللّهُـمَّ لَـكَ الحَـمْـدُ أنْـتَ كَسَـوْتَنيهِ،
أََسْأََلُـكَ مِـنْ خَـيرِهِ وَخَـيْرِ مَا صُنِعَ لَـه،
وَأَعوذُ بِكَ مِـنْ شَـرِّهِ وَشَـرِّ مـا صُنِعَ لَـهُ', 'Allāhumma lakal-ḥamdu ''anta kasawtanīhi, 
''as''aluka min khayrihi wa khayri mā ṣuni`a lahu, 
wa ''a`oothu bika min sharrihi wa sharri mā ṣuni`a lahu.', 'O Allah, praise is to You. You have clothed me. 
I ask You for its goodness and the goodness of what it has been made for,
and I seek Your protection from the evil of it and the evil of what it has been made for.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud and At-Tirmidhi. See also Al-Albani, Mukhtasar Shama''il 
At-Tirmidhi, p. 47.', NULL, 'e4167a425c57cce415cf859f26d4fead03b2034ba029b9ef6d16211585935e4f', 'اللهم لك الحمد انت كسوتنيه اسالك من خيره وخير ما صنع له واعوذ بك من شره وشر ما صنع له', 1, TRUE, 'published'),
  (7, 'hisn-7', 4, 'hisn-al-muslim', 7, 'تُبْـلي وَيُـخْلِفُ اللهُ تَعَالى', 'Tublī wa yukhliful-lāhu ta`ālā.', 'May Allah replace it when it is worn out.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/41. See also Al-Albani Sahih Abu Dawud 2/760.', 'Sahih', '8f073878287def95876851d96c79d33573cb32f23502aba6bddd904d2a2843c0', 'تبلي ويخلف الله تعالي', 1, TRUE, 'published'),
  (8, 'hisn-8', 4, 'hisn-al-muslim', 8, 'اِلبَـس جَديـداً
وَعِـشْ حَمـيداً
وَمُـتْ شهيداً', 'Ilbas jadīdan,
 wa `ish ḥamīdan, 
wa mut shahīdan.', 'Put on new clothes,
live a praise-worthy life 
and die as a martyr.', NULL, 1, NULL, NULL, NULL, 'ibn-majah', NULL, 'Ibn Majah 2/1178, Al-Baghawi 12/41. See also Al-Albani, Sahih Ibn Majah 
2/275', 'Sahih', '4c0e3c754778f529683f9ca6f63042984ae4bbff0f44a4b77713fac83d818a72', 'البس جديدا وعش حميدا ومت شهيدا', 1, TRUE, 'published'),
  (9, 'hisn-9', 5, 'hisn-al-muslim', 9, 'بِسْمِ الله', 'Bismillāhi', 'In the Name of Allah.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', '49', 'At-Tirmidhi 2/505, among others. See ''Irwa''ul Ghalil no. 49 and 
Sahihul-Jami'' 3/203', 'Sahih', '44667b012022106cb47d9b5500f14712ddbf6ec466e404b970c43414351ef87d', 'بسم الله', 1, TRUE, 'published'),
  (10, 'hisn-10', 6, 'hisn-al-muslim', 10, '(بِسْمِ الله)
اللّهُـمَّ إِنِّـي أَعـوذُ بِـكَ مِـنَ الْخُـبْثِ وَالْخَبائِث', '[Bismillāhi]
 Allāhumma ''innī ''a`ūdhu bika minal-khubthi walkhabā''ith.', '[In the Name of Allah]. 
O Allah, I seek protection in You from evil and the evil ones 
(or, from the evil male and female Jinn).', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/45, Muslim 1/283. The addition of Bismillah at its beginning 
was reported by Said bin Mansur. See Fathul-Bari 1/244', NULL, '58d1e793e473792b191520089e525b6168b6efa9cbcaf84c53fb795b05a0478b', 'بسم الله اللهم اني اعوذ بك من الخبث والخبايث', 1, TRUE, 'published'),
  (11, 'hisn-11', 7, 'hisn-al-muslim', 11, 'غُفْـرانَك', 'Ghufrānaka', 'I seek Your forgiveness.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah and At-Tirmidhi. An-Nasa''i recorded it in ''Amalul-Yawm 
wal-Laylah. Also see the checking of Ibn Al-Qayyim''s Zadul-Ma''ad, 2/387.', NULL, 'eb4d67c557dc717eb633b9d6c5224684b4b857320e0eaee3623df1d5ca182bef', 'غفرانك', 1, TRUE, 'published'),
  (12, 'hisn-12', 8, 'hisn-al-muslim', 12, 'بِسْمِ الله', 'Bismillāhi', 'In the Name of Allah', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud, Ibn Majah, and Ahmad. See also Al-Albani, ''Irwa''ul-Ghain 1/122.', NULL, '44667b012022106cb47d9b5500f14712ddbf6ec466e404b970c43414351ef87d', 'بسم الله', 1, TRUE, 'published'),
  (13, 'hisn-13', 9, 'hisn-al-muslim', 13, 'أَشْهَدُ أَنْ لا إِلَـهَ إِلاّ اللهُ
وَحْدَهُ لا شَريـكَ لَـهُ
وَأَشْهَدُأَنَّ مُحَمّـداً عَبْـدُهُ وَرَسـولُـه', '''Ash-hadu ''an lā ''ilāha ''illallāhu 
waḥdahu lā sharīka lahu 
wa ''ash-hadu ''anna Muḥammadan `abduhu wa Rasūluhu.', 'I bear witness that none has the right to be worshipped but Allah alone, 
Who has no partner; 
and I bear witness that Muhammad is His slave and His Messenger.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/209.', NULL, '710a5a24877cfcdf65640d645f64bdd5c59061a1f55879aac83e5313dd02e267', 'اشهد ان لا اله الا الله وحده لا شريك له واشهدان محمدا عبده ورسوله', 1, TRUE, 'published'),
  (14, 'hisn-14', 9, 'hisn-al-muslim', 14, 'اللّهُـمَّ اجْعَلنـي مِنَ التَّـوّابينَ
وَاجْعَـلْني مِنَ المتَطَهّـرين.', 'Allāhummaj`alnī minat-tawwābīna 
waj`alnī minal-mutaṭahhirīn.', 'O Allah, make me among those who turn to You in repentance, 
and make me among those who are purified.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 1/78. See also Al-Albani, Sahih At- Tirmidhi 1/18', 'Sahih', '7161df9f004ed907f8c00a12002a01d281ed12f87bfff78e677014902c3cf967', 'اللهم اجعلني من التوابين واجعلني من المتطهرين', 1, TRUE, 'published'),
  (15, 'hisn-15', 9, 'hisn-al-muslim', 15, 'سُبْحـانَكَ اللّهُـمَّ وَبِحَمدِك
أَشْهَـدُ أَنْ لا إِلهَ إِلاّ أَنْتَ
أَسْتَغْفِرُكَ وَأَتوبُ إِلَـيْك', 'Subḥānaka Allāhumma wa biḥamdika, 
''ash-hadu ''an lā ''ilāha ''illā ''Anta,
''astaghfiruka wa ''atūbu ''ilayk.', 'Glory is to You, O Allah, and praise; 
I bear witness that there is none 
worthy of worship but You. 
I seek Your forgiveness and turn to You in 
repentance.', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i, ''Amalul-Yawm wal-Laylah, p. 173. See also Al-Albani, 
''Irwa''ul-Ghalil 1/135 and 2/94.', NULL, '9792accbb2e6cfb3ff60ac772febd87bca2b22b346d2a0f66fd0585e75e64b0b', 'سبحانك اللهم وبحمدك اشهد ان لا اله الا انت استغفرك واتوب اليك', 1, TRUE, 'published'),
  (16, 'hisn-16', 10, 'hisn-al-muslim', 16, 'بِسْمِ اللهِ ، تَوَكَّلْـتُ عَلى اللهِ
وَلا حَوْلَ وَلا قُـوَّةَ إِلاّ بِالله', 'Bismillāhi, tawakkaltu `alallāhi, 
wa lā ḥawla wa lā quwwata illā billāh.', 'In the Name of Allah, I have placed my trust in Allah, 
there is no might and no power except by Allah.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 4/325, At-Tirmidhi 5/490. See also Al-Albani, Sahih At-Tirmidhi 
3/151', 'Sahih', 'b6cfb888fb3162e23269263d5f45854ded76225765647ea81f28f695af00c321', 'بسم الله توكلت علي الله ولا حول ولا قوه الا بالله', 1, TRUE, 'published'),
  (17, 'hisn-17', 10, 'hisn-al-muslim', 17, 'اللّهُـمَّ إِنِّـي أَعـوذُ بِكَ
 أَنْ أَضِـلَّ أَوْ أُضَـل ،
 أَوْ أَزِلَّ أَوْ أُزَل ،
 أَوْ أَظْلِـمَ أَوْ أَُظْلَـم ،
 أَوْ أَجْهَلَ أَوْ يُـجْهَلَ عَلَـيّ', 'Allāhumma ''innī ''a`ūdhu bika 
''an ''aḍilla, ''aw ''uḍalla, 
''aw ''azilla, ''aw ''uzalla, 
''aw ''aẓlima, ''aw ''uẓlama, 
''aw ''ajhala ''aw yujhala `alayya.', 'O Allah, I seek refuge in You 
lest I misguide others , or I am misguided by 
others , 
lest I cause others to err or I am caused to err , 
lest I abuse others or be abused, 
and lest I behave foolishly or meet with the 
foolishness of others.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi. See also Al-Albani, Sahih 
At-Tirmidhi 3/152 and Sahih Ibn Majah 2/336', 'Sahih', '946d9a192409d57c6655f7b4b08730bfe5e0ede4e48f8f6fc67dd9cebb01b862', 'اللهم اني اعوذ بك ان اضل او اضل او ازل او ازل او اظلم او اظلم او اجهل او يجهل علي', 1, TRUE, 'published'),
  (18, 'hisn-18', 11, 'hisn-al-muslim', 18, 'بِسْـمِ اللهِ وَلَجْنـا،
وَبِسْـمِ اللهِ خَـرَجْنـا،
وَعَلـى رَبِّنـا تَوَكّلْـن
(ثم ليسلم على أهله.)', 'Bismillāhi walajnā, 
wa bismillāhi kharajnā, 
wa `ala Rabbinā tawakkalnā', 'In the Name of Allah we enter , 
in the Name of Allah we leave , 
and upon our Lord we depend 
[then say As-Salāmu `Alaykum to those present].', NULL, 1, NULL, NULL, NULL, 'muslim', '2018', 'Abu Dawud 4/325. Muslim {Hadith no. 2018) says that one should mention the 
Name of Allah when entering the home and when beginning to eat; and that 
the devil, hearing this, says: "There is no shelter for us here tonight and 
no food."', NULL, 'bfba8960e2578875a657412e273a2a35c0f28778215911060d3dc3abaf9ddde5', 'بسم الله ولجنا وبسم الله خرجنا وعلي ربنا توكلن ثم ليسلم علي اهله', 1, TRUE, 'published'),
  (19, 'hisn-19', 12, 'hisn-al-muslim', 19, 'اللّهُـمَّ اجْعَـلْ فِي قَلْبـي نُوراً ،
 وَفي لِسَـانِي نُوراً،
 وَفِي سَمْعِي نُوراً,
 وَفِي بَصَرِيِ نُوراً,
 وَمِنْ فََوْقِي نُوراً ,
 وَ مِنْ تَحْتِي نُوراً,
 وَ عَنْ يَمِينيِ نُوراَ,
 وعَنْ شِمَالِي نُوراً,
 وَمْن أَماَمِي نُوراً,
 وَمِنْ خَلْفيِ نُوراَ,
 واجْعَلْ فِي نَفْسِي نُوراً,
وأَعْظِمْ لِي نُوراً,
 وَعظِّمْ لِي نُوراً,
 وَاجْعَلْ لِي نُوراً,
 واجْعَلنِي نُوراً,
 أللَّهُمَّ أَعْطِنِي نُوراً,
 واجْعَلْ فِي عَصَبِي نُوراً,
 وَفِي لَحْمِي نُوراً,
 وَفِي دَمِي نُوراً
 وَفِي شَعْرِي نُوراً,
 وفِي بَشَرِي نُوراً
 (أَللَّهُمَّ اجِعَلْ لِي نُوراً فِي قّبْرِي
 وَ نُوراَ فِي عِظاَمِي)
(وَزِدْنِي نُوراً,
 وَزِدْنِي نُوراَ ,
 وَزِدْنِي نُوراً)
 (وَهَبْ لِي نُوراً عَلَى نُوراً )', 'Allāhummaj''al fī qalbī nūran, 
wa fī lisānī nūran, 
wa fī sam`ī nūran, 
wa fī baṣarī nūran, 
wa min fawqī nūran, 
wa min taḥtī nūran, 
wa `an yamīnī nūran, 
wa `an shimālī nūran, 
wa min ''amāmī nūran, 
wa min khalfī nūran, 
waj`al fī nafsī nūran, 
wa ''a`ẓim lī nūran, 
wa `ẓẓim lī nūran, 
waj`allī nūran, 
waj`alnī nūran, 
Allāhumma ''a`tinī nūran, 
waj''al fī `aṣabī nūran, 
wa fī laḥmī nūran, 
wa fī damī nūran, 
wa fī sha`rī nūran, 
wa fī basharī nūran. 
[Allāhummaj`allī nūran fī qabrī 
wa nūran fī `iẓāmī.] 
[Wa zidnī nūran, 
wa zidnī nūran, 
wa zidnī nūran.]
[Wa hab lī nūran `alā nūr.]', 'O Allah, place light in my heart, 
and on my tongue light, 
and in my ears light 
and in my sight light, 
and above me light, 
and below me light, 
and to my right light, 
and to my left light, 
and before me light 
and behind me light. 
Place in my soul light. 
Magnify for me light, 
and amplify for me light. 
Make for me light 
and make me a light. 
O Allah, grant me light, 
and place light in my nerves, 
and in my body light 
and in my blood light 
and in my hair light 
and in my skin light.1 
[O Allah, make for me a light in my 
grave... 
and a light in my bones.]
(At-Tirmidhi 5/483 (Hadith no. 3419).) 
[Increase me in light, 
increase me in light, 
increase me in light .]
(Al-Bukhari in Al-''Adab Al-Mufrad (Hadith no. 695), p. 258. See also 
Al-Albani, Sahih Al-''Adab Al-Mufrad(no. 536).)
 [Grant me light upon light.] 
(Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/118.)', NULL, 1, NULL, NULL, NULL, 'bukhari', '6316', '1 Up to this point was reported by Al-Bukhari 11 / 116 (Hadith no. 6316) 
and by Muslim 1/526, 529-530 (Hadithno. 763).', NULL, '650c0dac2bbf3b4ad045846b685354495d7d63a6492b97446d35eb36bfd70a24', 'اللهم اجعل في قلبي نورا وفي لساني نورا وفي سمعي نورا وفي بصري نورا ومن فوقي نورا و من تحتي نورا و عن يميني نورا وعن شمالي نورا ومن امامي نورا ومن خلفي نورا واجعل في نفسي نورا واعظم لي نورا وعظم لي نورا واجعل لي نورا واجعلني نورا اللهم اعطني نورا واجعل في عصبي نورا وفي لحمي نورا وفي دمي نورا وفي شعري نورا وفي بشري نورا اللهم اجعل لي نورا في قبري و نورا في عظامي وزدني نورا وزدني نورا وزدني نورا وهب لي نورا علي نورا', 1, TRUE, 'published'),
  (20, 'hisn-20', 13, 'hisn-al-muslim', 20, 'أَعوذُ باللهِ العَظيـم
وَبِوَجْهِـهِ الكَرِيـم
وَسُلْطـانِه القَديـم
مِنَ الشّيْـطانِ الرَّجـيم،
[ بِسْـمِ الله، وَالصَّلاةُ وَالسَّلامُ عَلى رَسولِ
الله]،
اللّهُـمَّ افْتَـحْ لي أَبْوابَ رَحْمَتـِك', '''A`ūdhu billāhi l-`aẓīm, 
wa bi-wajhihil-karīm, 
wa sultānihil-qadīm, 
min ash-shaytānir-rajīm. 
[Bismillāhi, wassalātu wassalāmu `alā rasūlillāhi.] 
Allāhummaftaḥ lī ''abwāba raḥmatik.', 'I seek refuge in Almighty Allah, 
By His Noble Face, 
By His primordial power, 
From Satan the outcast.1 
[In the Name of Allah, and blessings 2 and peace be upon the Messenger of Allah.3
O Allah, open before me the doors of Your mercy.4', NULL, 1, NULL, NULL, NULL, 'muslim', '4591', '1. Abu Dawud and Al-Albani, Sahihul-Jdmi'' As-Saghir (Hadithno. 4591).
2. Ibn As-Sunni (Hadith no. 88), graded good by Al-Albani.
3. Abu Dawud 1/126, see also Al-Albani, Sahihul-Jami''As-Saghir 1/528.
4. Muslim 1/494. 
There is also a report in Sunan Ibn Majah on the authority of Fatimah (RA), : "O Allah, forgive me my sins and open for me the doors 
of Your mercy." It was graded authentic by 
Al-Albani due to supporting Ahadith. See Sahih Ibn Majah 1/128-9.', 'Sahih', 'b35cb488ca41474c6d41761841e45bd69bd358e91e850e89f48e3242458402b6', 'اعوذ بالله العظيم وبوجهه الكريم وسلطانه القديم من الشيطان الرجيم بسم الله والصلاه والسلام علي رسول الله اللهم افتح لي ابواب رحمتك', 1, TRUE, 'published'),
  (21, 'hisn-21', 14, 'hisn-al-muslim', 21, 'بِسمِ الله وَالصّلاةُ وَالسّلامُ عَلى رَسولِ الله،
اللّهُـمَّ إِنّـي أَسْأَلُكَ مِـنْ فَضْـلِك،
اللّهُـمَّ اعصِمْنـي مِنَ الشَّيْـطانِ الرَّجـيم', 'Bismillāhi waṣṣalātu wassalāmu ''alā Rasūlillāhi, 
Allāhumma ''innī ''as''aluka min faḍlika,
Allāhumma`ṣimnī min ash-shaytānir-rajīm.', 'In the Name of Allah, and peace and blessings be upon the Messenger of Allah.
O Allah, I ask for Your favor,
O Allah, protect me from Satan the outcast.', NULL, 1, NULL, NULL, NULL, NULL, NULL, 'ibid.', NULL, 'e6f3322c5fadddcd9dff074b28bf5e695cc735544ae87c68d51ea5ffa2c7f1dd', 'بسم الله والصلاه والسلام علي رسول الله اللهم اني اسالك من فضلك اللهم اعصمني من الشيطان الرجيم', 1, TRUE, 'published'),
  (22, 'hisn-22', 15, 'hisn-al-muslim', 22, 'يقول مثل ما يقول المؤذن إلا في (حي على الصلاة ، وحي على الفلاح) فيقول
لا حول ولا قوة إلا بالله.', 'Repeat what the Mu''adh-dhin says, except for when he says:
Hayya ''alas-Salāh (hasten to the prayer) and Hayya ''alal-Falāh (hasten to salvation). Here you should say: 
Lā ḥawla wa lā quwwata ''illā billāh.', 'There is no might and no power except by Allah.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/152, Muslim 1/288.', NULL, '4154b6e465c4fedf8aa3f85e3bb794a5490d1ed233bc39112706535730712f8c', 'يقول مثل ما يقول الموذن الا في حي علي الصلاه وحي علي الفلاح فيقول لا حول ولا قوه الا بالله', 1, TRUE, 'published'),
  (23, 'hisn-23', 15, 'hisn-al-muslim', 23, 'وَأَنا أَشْـهَدُ أَنْ لا إِلـهَ إِلاّ اللهُ
وَحْـدَهُ لا شَـريكَ لَـه ،
وَأَنَّ محَمّـداً عَبْـدُهُ وَرَسـولُه،
رَضيـتُ بِاللهِ رَبَّاً ،
وَبِمُحَمَّـدٍ رَسـولاً
وَبِالإِسْلامِ دينَـاً', 'Wa ''anā ''ash-hadu ''an lā ''ilāha ''illallāhu 
waḥdahu lā sharīka lahu 
wa ''anna Muḥammadan ''abduhu wa rasūluhu, 
raḍītu billāhi rabban, 
wa bi Muḥammadin rasūlan 
wa bi ''l-islāmi dīnan.', 'I bear witness that none has the right to be worshipped but Allah
alone, Who has no partner, 
and that Muhammad is His slave and His Messenger. 
I am pleased with Allah as my Lord, 
with Muhammad as my Messenger 
and with Islam as my religion.1

[To be recited in Arabic after the mu''adh-dhin''s tashahhud or the words of affirmation of Faith] 2', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, '1. Muslim 1/290.
2. Ibn Khuzaymah 1/220.', NULL, '49d291c88c6120fc754dbd399350c62ba23937746728089200478634c9143f98', 'وانا اشهد ان لا اله الا الله وحده لا شريك له وان محمدا عبده ورسوله رضيت بالله ربا وبمحمد رسولا وبالاسلام دينا', 1, TRUE, 'published'),
  (24, 'hisn-24', 15, 'hisn-al-muslim', 24, 'يُصَلِّي عَلَى النَّبِيِّ صلى الله عليه وسلم بَعْدَ فَرَاغِهِ مِنْ إِجَابَةِ الْمُؤَذِّنِ', NULL, 'After replying to the call of Mu''adh-dhin. you should recite in Arabic Allah''s blessings on the Prophet (ﷺ).', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/288', NULL, '48653338956001c0ee8acb65e9089d199191a720e0b6502cd4a4cbb2e89bf76f', 'يصلي علي النبي صلي الله عليه وسلم بعد فراغه من اجابه الموذن', 1, TRUE, 'published'),
  (25, 'hisn-25', 15, 'hisn-al-muslim', 25, 'اللّهُـمَّ رَبَّ هَذِهِ الدّعْـوَةِ التّـامَّة
وَالصّلاةِ القَـائِمَة
آتِ محَـمَّداً الوَسيـلةَ وَالْفَضـيلَة
وَابْعَـثْه مَقـامـاً مَحـموداً الَّذي وَعَـدْتَه
[إِنَّـكَ لا تُـخْلِفُ الميـعاد]', 'Allāhumma rabba hādhihi ''d-da''wati ''t-tāmmah
waṣ-ṣalāti ''l-qā''imah, 
''āti Muhammadani ''l-wasīlata walfaḍīlata,
wab ''ath-hu maqāma ''m-mahmūdani ''l-ladhī wa`adtahu, 
[''innaka lā tukhliful-mī''ād]', 'O Allah , Lord of this perfect call 
and established prayer. 
Grant Muhammad the intercession and favor,
and raise him to the honored station You have promised him, 
[verily You do not neglect promises].', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/152, and the addition between brackets is from Al-Bayhaqi 
1/410 with a good (Hasan) chain of narration. See ''Abdul-Azlz bin Baz''s 
Tuhfatul-''Akhyar, pg. 38.', 'Hasan', '3f8a62c0e88d29f287ce29e82733c288a847de00d2a3f5a00af1496376819db9', 'اللهم رب هذه الدعوه التامه والصلاه القايمه ات محمدا الوسيله والفضيله وابعثه مقاما محمودا الذي وعدته انك لا تخلف الميعاد', 1, TRUE, 'published'),
  (26, 'hisn-26', 15, 'hisn-al-muslim', 26, 'يَدْعُو لِنَفسِهِ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ فَإِنَّ الدُّعَاءَ حِينَئِذٍ لاَ يُرَدُّ', NULL, 'Between the call to prayer and the ''Iqamah, you should supplicate Allah for yourself. 
Invocation during this time is not rejected.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi, Abu Dawud, Ahmed. See Irwaa Al-Ghalil 1/262', NULL, '9e959850985136df4ad8912fa736db7066af56b46197b37601f4952d792ef5d1', 'يدعو لنفسه بين الاذان والاقامه فان الدعاء حينيذ لا يرد', 1, TRUE, 'published'),
  (27, 'hisn-27', 16, 'hisn-al-muslim', 27, 'اللّهُـمَّ باعِـدْ بَيـني وَبَيْنَ خَطـايايَ
كَما باعَدْتَ بَيْنَ المَشْرِقِ وَالمَغْرِبْ ،
اللّهُـمَّ نَقِّنـي مِنْ خَطايايَ
كَمـا يُـنَقَّى الثَّـوْبُ الأَبْيَضُ مِنَ الدَّنَسْ ،
اللّهُـمَّ اغْسِلْنـي مِنْ خَطايـايَ
بِالثَّلـجِ وَالمـاءِ وَالْبَرَدْ.', 'Allāhumma bā''id baynī wa bayna khatāyāya
kamā bāa''adta bayn al-mashriqi wal-maghribi,
Allāhumma naqqinī min khatāyāya 
kamā yunaqqa ''th-thawbu ''l-''abyaḍu min ad-danasi, 
Allāhumma ''ghsilnī min khatāyāya, 
bi ''th-thalji wal-mā''i wal-barad.', 'O Allah, separate me from my sins 
as You have separated the East from the West. 
O Allah, cleanse me of my transgressions 
as the white garment is cleansed of stains. 
O Allah, wash away my sins 
with ice and water and frost.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/181, Muslim 1/419.', NULL, '6d4c8824a6e93f5c5116609e7494e52c62e212b7741702caaaa27d08c39e105c', 'اللهم باعد بيني وبين خطاياي كما باعدت بين المشرق والمغرب اللهم نقني من خطاياي كما ينقي الثوب الابيض من الدنس اللهم اغسلني من خطاياي بالثلج والماء والبرد', 1, TRUE, 'published'),
  (28, 'hisn-28', 16, 'hisn-al-muslim', 28, 'سُبْـحانَكَ اللّهُـمَّ وَبِحَمْـدِكَ
وَتَبارَكَ اسْمُـكَ
وَتَعـالى جَـدُّكَ
وَلا إِلهَ غَيْرُك', 'Subhānaka Allāhumma wa biḥamdika, 
wa tabāraka ''smuka, 
wa ta''ālā jadduka, 
wa lā ''ilāha ghayruk.', 'Glory is to You O Allah, and praise. 
Blessed is Your Name 
and Exalted is Your Majesty. 
There is none worthy of worship but You', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi. See Al-Albani, Sahih 
At-Tirmidhi 1/77 and Sahih Ibn Majah 1/135.', 'Sahih', '2a8dad06e31213b8fc1bfb3ced3c10184dfa51a1c943901a5055f2cce84acfef', 'سبحانك اللهم وبحمدك وتبارك اسمك وتعالي جدك ولا اله غيرك', 1, TRUE, 'published'),
  (29, 'hisn-29', 16, 'hisn-al-muslim', 29, 'وَجَّهـتُ وَجْهِـيَ لِلَّذي فَطَرَ السَّمـواتِ وَالأَرْضَ
حَنـيفَاً وَمـا أَنا مِنَ المشْرِكين ،
إِنَّ صَلاتـي ، وَنُسُكي ، وَمَحْـيايَ ، وَمَماتـي للهِ رَبِّ العالَمين ،
لا شَريـكَ لَهُ وَبِذلكَ أُمِرْتُ وَأَنا مِنَ المسْلِـمين.
اللّهُـمَّ أَنْتَ المَلِكُ لا إِلهَ إِلاّ أَنْت،
أَنْتَ رَبِّـي وَأَنـا عَبْـدُك ،
ظَلَمْـتُ نَفْسـي وَاعْـتَرَفْتُ بِذَنْبـي
فَاغْفِرْ لي ذُنوبي جَميعاً
إِنَّـه لا يَغْـفِرُ الذُّنـوبَ إلاّ أَنْت.
وَاهْدِنـي لأَحْسَنِ الأَخْلاقِ
لا يَهْـدي لأَحْسَـنِها إِلاّ أَنْـت ،
وَاصْـرِف عَـنّْي سَيِّئَهـا،
لا يَصْرِفُ عَـنّْي سَيِّئَهـا إِلاّ أَنْـت،
لَبَّـيْكَ وَسَعْـدَيْك،
وَالخَـيْرُ كُلُّـهُ بِيَـدَيْـك،
وَالشَّرُّ لَيْـسَ إِلَـيْك ،
أَنا بِكَ وَإِلَيْـك ،
تَبـارَكْتَ وَتَعـالَيتَ
أَسْتَغْـفِرُكَ وَأَتوبُ إِلَـيك', 'Wajjahtu wajhiya li ''l-ladhî faṭara s-samāwāti wa ''l-arḍa, 
ḥanīfan wa mā ana min al-mushrikīna. 
Inna salāti wa nusukī, wa mahyāya wa mamātī lillāhi rabbi ''l-`ālamīna,
lā sharīka lahu. Wa bi dhālika umirtu wa ana min al-muslimīna. 
Allāhumma anta ''l-maliku lā ilāha illā anta.
Anta rabbī wa ana `abduka, 
ẓalamtu nafsī wa`taraftu bi dhanbī. 
Faghfir lī dhunūbī jamī`an, 
innahu lā yaghfiru ''dh-dhunūba illā anta. 
Wahdinī li-aḥsani ''l-akhlāqi, 
lā yahdī li aḥsanihā illā anta. 
Waṣrif `annī sayyi''ahā, 
lā yaṣrifu `annī sayyi''ahā illā anta. 
Labbayka wa sa`dayka, 
wa ''l-khayru kulluhu bi yadayka, 
wa ''sh-sharru laysa ilayka, 
ana bika wa ilayka, 
tabārakta wa ta`ālayta, 
astaghfiruka wa atūbu ilayka.', '"I have turned my face sincerely towards He who has brought forth the heavens and the Earth 
and I am not of those who associate (others with Allah). 
Indeed my prayer, my sacrifice, my life and my death are for Allah, Lord of the worlds,
no partner has He, with this I am commanded and I am of the Muslims. 
O Allah, You are the Sovereign, none has the right to be worshipped except You. 
You are my Lord and I am Your servant, 
I have wronged my own soul and have acknowledged my sin, 
so forgive me all my sins 
for no one forgives sins except You. 
Guide me to the best of characters 
for none can guide to it other than You, 
and deliver me from the worst of characters 
for none can deliver me from it other than You. 
Here I am, in answer to Your call, happy to serve you. 
All good is within Your hands 
and evil does not stem from You. 
I exist by your will and will return to you. 
Blessed and High are You, 
I seek Your forgiveness and repent unto You."', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/534', NULL, 'c12a425494adb04cbbd901814a94423cae787ca0c114187a1241a3c28a154ce3', 'وجهت وجهي للذي فطر السموات والارض حنيفا وما انا من المشركين ان صلاتي ونسكي ومحياي ومماتي لله رب العالمين لا شريك له وبذلك امرت وانا من المسلمين اللهم انت الملك لا اله الا انت انت ربي وانا عبدك ظلمت نفسي واعترفت بذنبي فاغفر لي ذنوبي جميعا انه لا يغفر الذنوب الا انت واهدني لاحسن الاخلاق لا يهدي لاحسنها الا انت واصرف عني سييها لا يصرف عني سييها الا انت لبيك وسعديك والخير كله بيديك والشر ليس اليك انا بك واليك تباركت وتعاليت استغفرك واتوب اليك', 1, TRUE, 'published'),
  (30, 'hisn-30', 16, 'hisn-al-muslim', 30, 'اللّهُـمَّ رَبَّ جِـبْرائيل ، وَميكـائيل ، وَإِسْـرافيل،
فاطِـرَ السَّمواتِ وَالأَرْض ،
عالـِمَ الغَيْـبِ وَالشَّهـادَةِ
أَنْـتَ تَحْـكمُ بَيْـنَ عِبـادِكَ فيـما كانوا فيهِ يَخْتَلِفـون.
اهدِنـي لِمـا اخْتُـلِفَ فيـهِ مِنَ الْحَـقِّ بِإِذْنِك ،
إِنَّـكَ تَهْـدي مَنْ تَشـاءُ إِلى صِراطٍ مُسْتَقـيم', 'Allāhumma, rabba Jibrā''īla, wa Mīkā''īla, wa Isrāfīla 
Fāṭira ''s-samāwāti wa ''l-arḍi, `
ālima ''l-ghaybi wa ''sh-shahādati, 
anta taḥkumu bayna `ibādika fīmā kānū fīhi yakhtalifūna. 
Ihdinī li makhtulifa fīhi min al-ḥaqqi bi idhnika. 
Innaka tahdī man tashā''u ilā ṣirāṭin mustaqīm.', 'O Allah, Lord of Jibraīl, Mīkaīl and Israfīl (great angels),
Creator of the heavens and the Earth, 
Knower of the seen and the unseen. 
You are the arbitrator between Your servants in that which they have disputed. 
Guide me to the truth by Your leave, in that which they have differed, 
for verily You guide whom You will to a straight path."', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/534', NULL, '39a808b3ad5989459b8970c3fbffb74a3d7f73b50f7e3e083017268749b847be', 'اللهم رب جبراييل وميكاييل واسرافيل فاطر السموات والارض عالم الغيب والشهاده انت تحكم بين عبادك فيما كانوا فيه يختلفون اهدني لما اختلف فيه من الحق باذنك انك تهدي من تشاء الي صراط مستقيم', 1, TRUE, 'published'),
  (31, 'hisn-31', 16, 'hisn-al-muslim', 31, 'اللهُ أَكْبَـرُ كَبـيرا ،
اللهُ أَكْبَـرُ كَبـيرا ،
اللهُ أَكْبَـرُ كَبـيرا ،
وَالْحَـمْدُ للهِ كَثـيرا ،
وَالْحَـمْدُ للهِ كَثـيرا ،
وَالْحَـمْدُ للهِ كَثـيرا ،
وَسُبْـحانَ اللهِ بكْـرَةً وَأَصيـلا.( ثَلاثاً )
أَعـوذُ بِاللهِ مِنَ الشَّـيْطانِ
مِنْ نَفْخِـهِ وَنَفْـثِهِ وَهَمْـزِه', 'Allāhu ''Akbar Kabīra, 
Allāhu ''Akbar Kabīra, 
Allāhu ''Akbar Kabīra, 
walḥamdu lillāhi kathīra, 
walḥamdu lillāhi kathīra, 
walḥamdu lillāhi kathīra, 
wa Subḥānallāhi bukratan wa''aṣīla.[Recite three times in Arabic.] 
''A `ūdhu billāhi min ash-shayṭān
min nafkhihi, wa nafthihi, wa hamzihi.', 'Allah is the Greatest, Most Great. 
Allah is the Greatest, Most Great. 
Allah is the Greatest, Most Great. 
Praise is to Allah, abundantly. 
Praise is to Allah, abundantly. 
Praise is to Allah, abundantly. 
Glory is to Allah, at the break of day and at its end. [Recite three times in Arabic.] 
I seek refuge in Allah from Satan. 
From his breath, and from his voice, and from his whisper.', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Abu Dawud 1/203, Ibn Majah 1/265, ai Ahmad 4/85. Muslim recorded a similar 
Hadil 1/420.', NULL, '6ce214e95e77e84e7741454daa9dcbd23ead3669c7b77386408bd01d55f17a5b', 'الله اكبر كبيرا الله اكبر كبيرا الله اكبر كبيرا والحمد لله كثيرا والحمد لله كثيرا والحمد لله كثيرا وسبحان الله بكره واصيلا ثلاثا اعوذ بالله من الشيطان من نفخه ونفثه وهمزه', 1, TRUE, 'published'),
  (32, 'hisn-32', 16, 'hisn-al-muslim', 32, 'اللّهُـمَّ لَكَ الْحَمْدُ أَنْتَ نـورُ السَّمـواتِ وَالأَرْضِ وَمَنْ فيـهِن ،
 وَلَكَ الْحَمْدُ أَنْتَ قَـيِّمُ السَّـمواتِ وَالأَرْضِ وَمَنْ فيـهِن ،
[وَلَكَ الْحَمْدُ أَنْتَ رَبُّ السَّـمواتِ وَالأَرْضِ وَمَنْ فيـهِن]
[وَلَكَ الْحَمْدُ لَكَ مُلْـكُ السَّـمواتِ وَالأَرْضِ وَمَنْ فيـهِن]
[وَلَكَ الْحَمْدُ أَنْتَ مَلِـكُ السَّـمواتِ وَالأَرْضِ ]
[وَلَكَ الْحَمْدُ]
[أَنْتَ الْحَـقّ وَوَعْـدُكَ الْحَـق ،
وَقَوْلُـكَ الْحَـق ، وَلِقـاؤُكَ الْحَـق ،
وَالْجَـنَّةُحَـق ، وَالنّـارُ حَـق ،
وَالنَّبِـيّونَ حَـق ، وَمـحَمَّدٌ حَـق ،
 وَالسّـاعَةُحَـق]
[اللّهُـمَّ لَكَ أَسْلَمت ، وَعَلَـيْكَ تَوَكَّلْـت ،
وَبِكَ آمَنْـت ، وَإِلَـيْكَ أَنَبْـت ،
وَبِـكَ خاصَمْت ، وَإِلَـيْكَ حاكَمْـت .
 فاغْفِـرْ لي مـا قَدَّمْتُ ، وَما أَخَّـرْت ،
وَما أَسْـرَرْت ، وَما أَعْلَـنْت ]
[أَنْتَ المُقَـدِّمُ وَأَنْتَ المُـؤَخِّر ،
لا إِاـهَ إِلاّ أَنْـت]
[أَنْـتَ إِلـهي لا إِاـهَ إِلاّ أَنْـت', 'Allāhumma lakal-ḥamdu ''Anta nūrussamāwāti wal''arḍhi wa man fīhinna, 
wa lakal-ḥamdu ''Anta qayyimus-samāwāti wal''arḍi wa man fīhinna, 
[wa lakal-ḥamdu ''Anta Rabbus-samāwāti wal''arḍi wa man fīhinna] 
[wa lakal-ḥamdu laka mulkus-samāwāti wal''arḍi wa man fīhinna] 
[wa lakal-ḥamdu ''Anta Malikus-samāwāti wal''arḍi] 
[wa lakal-ḥamdu]
[''Antal-ḥaqq, wa wa`dukal-ḥaqq, 
wa qawlukal-ḥaqq, wa liqā''ukal-ḥaqq, 
waljannatu ḥaqq, wannāru ḥaqq, 
wannabiyyūna ḥaqq, wa Muḥammadun (sallallāhu ''alayhi wa sallam) ḥaqq, 
wassā`atu ḥaqq] 
[Allāhumma laka ''aslamtu, wa `alayka tawakkaltu, 
wa bika ''āmantu, wa ''ilayka ''anabtu, 
wa bika khāṣamtu, wa ''ilayka ḥākamtu. 
Faghfir lī maa qaddamtu, wa mā ''akhkhartu, 
wa mā ''asrartu, wa mā ''a`lantu 
[''Antal-Muqaddimu, wa ''Antal-Mu''akhkhiru 
laa ''ilāha ''illā ''Anta] 
[''Anta ''ilāhī lā ''ilāha ''illā ''Anta].', 'O Allah, praise is to You. 
You are the Light of the heavens and the earth and all that they contain. 
Praise is to You, You are the Sustainer of the heavens and the earth and all they contain. 
[Praise is to You, You are the Lord of the heavens and the earth and all they contain.] 
[Praise is to You, Yours is dominion of the heavens and the earth and all they contain.] 
[Praise is to You, You are the King of the heavens and the earth.] 
[And praise is to You.] 
[You are the Truth, Your Promise is true, 
Your Word is true, Your audience is true, 
Paradise is true, Hell is true, 
the Prophets are true, and Muhammad (peace and blessings be upon him) is true, 
and the Hour of Judgment is true.] 
[O Allah, to You I have submitted, and upon You I depend. 
I have believed in You and to You I turn in repentance . 
For Your sake I dispute and by Your standard I judge. 
Forgive me what I have sent before me and what I have left behind me, 
what I have concealed and what I have declared.] 
[You are the One Who sends forth and You are the One Who delays, 
there is none who has the right to be worshipped but You.] 
[You are my God, there is none who has the right to be worshipped but 
You.]', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/3 , 11/ 116, 13/371, 423, 465. 
See also Muslim for a shorter account, 1/532.', NULL, '1e7fc1b366160f605dd383ad75e8deb7a9d8d3cdae536168515058c6e23fbddb', 'اللهم لك الحمد انت نور السموات والارض ومن فيهن ولك الحمد انت قيم السموات والارض ومن فيهن ولك الحمد انت رب السموات والارض ومن فيهن ولك الحمد لك ملك السموات والارض ومن فيهن ولك الحمد انت ملك السموات والارض ولك الحمد انت الحق ووعدك الحق وقولك الحق ولقاوك الحق والجنهحق والنار حق والنبيون حق ومحمد حق والساعهحق اللهم لك اسلمت وعليك توكلت وبك امنت واليك انبت وبك خاصمت واليك حاكمت فاغفر لي ما قدمت وما اخرت وما اسررت وما اعلنت انت المقدم وانت الموخر لا ااه الا انت انت الهي لا ااه الا انت', 1, TRUE, 'published'),
  (33, 'hisn-33', 17, 'hisn-al-muslim', 33, 'سُبْـحانَ رَبِّـيَ الْعَظـيم (ثلاث مرات)', 'Subḥāna Rabbiyal-`Aẓīm.[three times]', 'Glory to my Lord the Exalted (three times in Arabic)', NULL, 3, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi, and Ahmad. See Al-Albani''s 
Sahih At-Tirmidhi 1/83.', 'Sahih', 'fcca1513e75392ea1e44a3574f59e805c73f2a6fb4ada57d512594cdc5fcc2b6', 'سبحان ربي العظيم ثلاث مرات', 1, TRUE, 'published'),
  (34, 'hisn-34', 17, 'hisn-al-muslim', 34, 'سُبْـحانَكَ اللّهُـمَّ رَبَّـنا وَبِحَـمْدِك ،
اللّهُـمَّ اغْفِـرْ لي', 'Subḥānaka Allāhumma Rabbanā wa biḥamdika 
Allāhum-maghfir lī.', 'Glory is to You , O Allah , our Lord , and praise is Yours . 
O Allah , forgive me.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/99, Muslim 1/350.', NULL, 'dee5d4442378fc7f8e964a45023eb5050bbe49e9c69e5c61da55a3ded916e866', 'سبحانك اللهم ربنا وبحمدك اللهم اغفر لي', 1, TRUE, 'published'),
  (35, 'hisn-35', 17, 'hisn-al-muslim', 35, 'سُبـّوحٌ قُـدّْوس ، رَبُّ الملائِكَـةِ وَالـرُّوح', 'Subbūḥun, Quddūsun, Rabbul-malā''ikati warrūḥ.', 'Glory (to You) , Most Holy (are You) , 
Lord of the angels and the Spirit.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/353, Abu Dawud 1/230.', NULL, '3074a3b503cc7be62feaeda6433b6c738dc33b2084e84ca51fc6fab1e04f708c', 'سبوح قدوس رب الملايكه والروح', 1, TRUE, 'published'),
  (36, 'hisn-36', 17, 'hisn-al-muslim', 36, 'اللّهُـمَّ لَكَ رَكَـعْتُ
 وَبِكَ آمَـنْت، ولَكَ أَسْلَـمْت ،
 خَشَـعَ لَكَ سَمْـعي، وَبَصَـري ،
 وَمُخِّـي، وَعَظْمـي، وَعَصَـبي ،
 وَما استَقَـلَّ بِهِ قَدَمي', 'Allāhumma laka raka`tu, 
wa bika ''āmantu, wa laka ''aslamtu 
khasha`a laka sam`ee wa baṣarī, 
wa mukhkhī, wa `aẓmī, wa `aṣabī, 
wa mastaqalla bihi qadamī.', 'O Allah , to You I bow (in prayer) 
and in You I believe and to You I have submitted. 
Before You my hearing is humbled, and my sight, 
and my mind, my bones, my nerves 
and what my feet have mounted upon (for travel).', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/534, Abu Dawud, An-Nasa''i and At- Tirmidhi.', NULL, '6a91934b53b1bb021ee7dd89ccd3142360f5b3cb1d6a37eeb1953da1e55cc5d2', 'اللهم لك ركعت وبك امنت ولك اسلمت خشع لك سمعي وبصري ومخي وعظمي وعصبي وما استقل به قدمي', 1, TRUE, 'published'),
  (37, 'hisn-37', 17, 'hisn-al-muslim', 37, 'سُبْـحانَ ذي الْجَبَـروت، والمَلَـكوت، وَالكِبْـرِياء، وَالْعَظَـمَةِ', 'Subḥāna dhil-jabarūti, walmalakūti, walkibriyā''i, wal`aẓamati.', 'Glory is to You, Master of power, of dominion, of majesty and greatness.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 1/230, An-Nasa''i and Ahmad. Its chain of narration is good 
(Hasan).', 'Hasan', '24f0908e60492c5b56baed4920e01337eab5fb3a293bfded6b39103dca3d7269', 'سبحان ذي الجبروت والملكوت والكبرياء والعظمه', 1, TRUE, 'published'),
  (38, 'hisn-38', 18, 'hisn-al-muslim', 38, 'سَمِـعَ اللهُ لِمَـنْ حَمِـدَه', 'Sami`allāhu liman ḥamidah.', 'Allah hears whoever praises Him.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 2/282.', NULL, 'c7e0ff30190f3e9ceb04dc3ce3fdb11bc014613c6438efa82a5145eef0dbbe00', 'سمع الله لمن حمده', 1, TRUE, 'published'),
  (39, 'hisn-39', 18, 'hisn-al-muslim', 39, 'رَبَّنـا وَلَكَ الحَمْـدُ
حَمْـداً كَثـيراً طَيِّـباً مُـبارَكاً فيه', 'Rabbanā wa lakal-ḥamd, 
ḥamdan kathīran ṭayyiban mubārakan fīh.', 'Our Lord, praise is Yours, 
abundant, good and blessed praise.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 2/284.', NULL, 'f98cafa891bd2eb933c5fca1c80c64c8639c9357df47d3d6fd5d22a77017b6ed', 'ربنا ولك الحمد حمدا كثيرا طيبا مباركا فيه', 1, TRUE, 'published'),
  (40, 'hisn-40', 18, 'hisn-al-muslim', 40, 'مِلْءَ السَّمـواتِ وَمِلْءَ الأَرْض، وَما بَيْـنَهُمـا ،
وَمِلْءَ ما شِئْـتَ مِنْ شَيءٍ بَعْـد .
أَهـلَ الثَّـناءِ وَالمَجـد ،
أََحَـقُّ ما قالَ العَبْـد ،
وَكُلُّـنا لَكَ عَـبد .
اللّهُـمَّ لا مانِعَ لِما أَعْطَـيْت ،
وَلا مُعْطِـيَ لِما مَنَـعْت ،
وَلا يَنْفَـعُ ذا الجَـدِّ مِنْـكَ الجَـد', 'Mil''a ''s-samāwāti wa mil''a ''l-''arḍi wa mā baynahumā, 
wa mil''a mā shi''ta min shay''in ba`d. 
''Ahla ''th-thanā''i wa ''l-majdi, 
''aḥaqqu mā qāla ''l-`abdu,
wa kullunā laka `abdun. 
Allāhumma lā māni`a limā ''a`ṭayta, 
wa lā mu`ṭiya limā mana`ta,
wa lā yanfa`u dhal-jaddi minka ''l-jadd.
.', '(A praise that) fills the heavens and the earth and what lies between them, 
and whatever else You please. 
(You Allah) are most worthy of praise and majesty, and what the slave has said - we are all Your slaves. 
O Allah, there is none who can withhold what You give,
and none may give what You have withheld. 
And the might of the mighty person cannot benefit him against You.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/346.', NULL, 'a600f379011c919131e339b7a99cfad736e3800c60bbbab188f135a2fea9ba1f', 'ملء السموات وملء الارض وما بينهما وملء ما شيت من شيء بعد اهل الثناء والمجد احق ما قال العبد وكلنا لك عبد اللهم لا مانع لما اعطيت ولا معطي لما منعت ولا ينفع ذا الجد منك الجد', 1, TRUE, 'published'),
  (41, 'hisn-41', 19, 'hisn-al-muslim', 41, 'سُبْـحانَ رَبِّـيَ الأَعْلـى. (ثلاث مرات)', 'Subḥāna Rabbiya ‘l-a`lā.', 'Glory is to my Lord, the Most High. (This is said three times in Arabic.)', NULL, 3, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi, and Ahmad. See also 
Al-Albani, Sahih At-Tirmidhi 1/83.', 'Sahih', 'c0a851416941538e3facb5d2aaa5a11bdef537d12240ad811246a046f41a2e11', 'سبحان ربي الاعلي ثلاث مرات', 1, TRUE, 'published'),
  (42, 'hisn-42', 19, 'hisn-al-muslim', 42, 'سُبْـحانَكَ اللّهُـمَّ رَبَّـنا وَبِحَـمْدِكَ ،
اللّهُـمَّ اغْفِرْ لي', 'Subḥānaka Allāhumma Rabbanā wa biḥamdika 
Allāhumma ‘ghfir lī.', 'Glory is to You, O Allah, our Lord, and praise is Yours. 
O Allah, forgive me.', NULL, 1, NULL, NULL, NULL, 'bukhari', '34', 'Al-Bukhari and Muslim, see invocation no. 34 above.', NULL, '217f076b5a0c2368e8f22109da25be796b8996e2b5a1537e1fe5472dacc06aa4', 'سبحانك اللهم ربنا وبحمدك اللهم اغفر لي', 1, TRUE, 'published'),
  (43, 'hisn-43', 19, 'hisn-al-muslim', 43, 'سُبـّوحٌ قُـدّوس، رَبُّ الملائِكَـةِ وَالـرُّوح', 'Subbūḥun, Quddūsun, Rabbu ‘l-malā''ikati warrūḥ.', 'Glory (to You), Most Holy (are You), Lord of the angels and the Spirit.', NULL, 1, NULL, NULL, NULL, 'muslim', '35', 'Muslim 1/533, see invocation no. 35 above.', NULL, '6d5c5793224dc4baf596bbe3e8921fe6dbe2c9abc2c8ae32ae2336fbf7e79e72', 'سبوح قدوس رب الملايكه والروح', 1, TRUE, 'published'),
  (44, 'hisn-44', 19, 'hisn-al-muslim', 44, 'اللّهُـمَّ لَكَ سَـجَدْتُ
وَبِـكَ آمَنْـت ،
وَلَكَ أَسْلَـمْت ،
سَجَـدَ وَجْهـي للَّـذي خَلَقَـهُ وَصَـوَّرَهُ
وَشَقَّ سَمْـعَـهُ وَبَصَـرَه ،
تَبـارَكَ اللهُ أَحْسـنُ الخـالِقيـن', 'Allāhumma laka sajadtu 
wa bika āmantu, 
wa laka aslamtu, 
sajada waj’hiya lilladhī khalaqahu, wa ṣawwarahu, 
wa shaqqa sam`ahu wa baṣarahu, 
tabārakallāhu ''aḥsanul-khāliqīn.', 'O Allah, to You I prostrate myself and in You I believe. 
To You I have submitted. 
My face is prostrated to the One Who created it, fashioned it, and gave it hearing and sight. 
Blessed is Allah, the Best of creators', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/534 and others.', NULL, '3b5b025acb3699d2069d9f945a660eadbde82a89553d33e74e130c1e87bd2d47', 'اللهم لك سجدت وبك امنت ولك اسلمت سجد وجهي للذي خلقه وصوره وشق سمعه وبصره تبارك الله احسن الخالقين', 1, TRUE, 'published'),
  (45, 'hisn-45', 19, 'hisn-al-muslim', 45, 'سُبْـحانَ ذي الْجَبَـروت، والمَلَكـوت، والكِبْـرِياء، وَالعَظَمَـةِ.', 'Subḥāna dhi ’l-jabarūti, wa ’l-malakūti, wa ‘l-kibriyā''i, wa ‘l-aẓamati.', 'Glory is to the master of power, sovereignty, of majesty and greatness.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', '37', 'Abu Dawud 1/230, An-Nasa''i, Ahmad. See also Al-Albani, Sahih Abu Dawud 
1/166, see invocation no. 37 above.', 'Sahih', '28247643909f097409948fcd89bd1c28b8d135f51e9f465f6063571e9cc9e123', 'سبحان ذي الجبروت والملكوت والكبرياء والعظمه', 1, TRUE, 'published'),
  (46, 'hisn-46', 19, 'hisn-al-muslim', 46, 'اللّهُـمَّ اغْفِـرْ لي ذَنْـبي كُلَّـه ،
دِقَّـهُ وَجِلَّـه ،
وَأَوَّلَـهُ وَآخِـرَه ،
وَعَلانِيَّتَـهُ وَسِـرَّه', 'Allāhumma’ghfir lī dhanbī kullahu, 
diqqahu wa jillahu, 
wa awwalahu wa ākhirahu 
wa `alāniyyatahu wa sirrahu.', 'O Allah, forgive me all my sins, 
great and small, 
the first and the last, 
those that are apparent and those that are hidden.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/350.', NULL, 'feb714d0bf7a79c9e67ada697ce92bced90543bfd2aa66a2d5aeb7d3f34746fe', 'اللهم اغفر لي ذنبي كله دقه وجله واوله واخره وعلانيته وسره', 1, TRUE, 'published'),
  (47, 'hisn-47', 19, 'hisn-al-muslim', 47, 'اللّهُـمَّ إِنِّـي أَعـوذُ بِرِضـاكَ مِنْ سَخَطِـك ، وَبِمعـافاتِـكَ مِنْ عُقوبَـتِك ،
وَأَعـوذُ بِكَ مِنْـك ،
لا أُحْصـي ثَنـاءً عَلَـيْك ،
أَنْـتَ كَمـا أَثْنَـيْتَ عَلـى نَفْسـِك', 'Allāhumma innī a`ūdhu biriḍāka min sakhaṭika, 
wa bimu`āfātika min `uqūbatika 
wa a`ūdhu bika minka
lā uḥṣī thanā''an `alayka 
anta kamā athnayta `alā nafsika.', 'O Allah, I seek protection in Your pleasure from Your anger,
and I seek protection in Your forgiveness from Your punishment. 
I seek protection in You from You. 
I cannot count Your praises. 
You are as You have praised Yourself.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/352.', NULL, 'c74f3f4ae540d3daf518f12f908821f90c50419b9a4631e50ba4f34249bb9ab4', 'اللهم اني اعوذ برضاك من سخطك وبمعافاتك من عقوبتك واعوذ بك منك لا احصي ثناء عليك انت كما اثنيت علي نفسك', 1, TRUE, 'published'),
  (48, 'hisn-48', 20, 'hisn-al-muslim', 48, 'رَبِّ اغْفِـرْ لي ، رَبِّ اغْفِـرْ لي', 'Rabbi’ghfir lī, Rabbi’ghfir lī.', 'Lord, forgive me. My Lord, forgive me.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 1/231. See also Al-Albani, Sahihibn Mdjah 1/148.', 'Sahih', 'cff7157f25a2382098bf7e8eefcc223841cc98b1ad733fdae5c9f197b5f41602', 'رب اغفر لي رب اغفر لي', 1, TRUE, 'published'),
  (49, 'hisn-49', 20, 'hisn-al-muslim', 49, 'اللّهُـمَّ اغْفِـرْ لي ، وَارْحَمْـني ،
وَاهْدِنـي ، وَاجْبُرْنـي ،
وَعافِنـي وَارْزُقْنـي وَارْفَعْـني', 'Allāhumma’ghfir lī, war’ḥamnī, 
wahdinī, wajburnī, 
wa `āfinī, warzuqnī, warfa`nī.', 'O Allah forgive me, have mercy on me, 
guide me, support me, 
protect me, provide for me, and elevate me.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, At-Tirmidhi. See also Al-Albani, Sahih At-Tirmidhi 
1/90 and Sahih Ibn Majah 1/148.', 'Sahih', '439f73f048503d1f6a8e805a5ad6595a4c7f81f62ff190fdcebeb38fa838c5be', 'اللهم اغفر لي وارحمني واهدني واجبرني وعافني وارزقني وارفعني', 1, TRUE, 'published'),
  (50, 'hisn-50', 21, 'hisn-al-muslim', 50, 'سَجَـدَ وَجْهـي للَّـذي خَلَقَـهُ
وَشَقَّ سَمْـعَـهُ وَبَصَـرَهُ بِحَـوْلِـهِ وَقُـوَّتِهِ
﴿فتَبـارَكَ اللهُ أَحْسَـنُ الخـالِقيـن﴾.', 'Sajada wajhiya lilladhī khalaqahu, 
wa shaqqa sam`ahu wa baṣarahu biḥawlihi wa quwwatihi.
Fatabārakallāhu ''aḥsanul-khāliqīn.', 'I have prostrated my face to the One Who created it, 
and gave it hearing and sight by His might and His power. 
Glory is to Allah, the Best of creators.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 2/474, Ahmad 6/30, and Al-Hakim', NULL, 'd438206f00d0617c9eec393e2c2d3fb822eccbd38ab40c4750d46d7021fc624e', 'سجد وجهي للذي خلقه وشق سمعه وبصره بحوله وقوته ﴿فتبارك الله احسن الخالقين﴾', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (51, 'hisn-51', 21, 'hisn-al-muslim', 51, 'اللّهُـمَّ اكْتُـبْ لي بِهـا عِنْـدَكَ أَجْـراً ،
وَضَـعْ عَنِّـي بِهـا وِزْراً ،
وَاجْعَـلها لي عِنْـدَكَ ذُخْـراً ،
وَتَقَبَّـلها مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ.', 'Allāhummak’tub lī bihā `indaka ajra, 
waḍa` `annī bihā wizra,
waj`alhā lī `indaka dhukhra, 
wa taqabbal’hā minnī kamā taqabbal’tahā min `abdika Dāwūd.', 'O Allah, write it as a reward for me, 
and release me from a burden for it, 
and make it a treasure for me with You.
Accept it from me as You accepted it from your servant Dawud.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 2/473, and Al-Hakim who graded it authentic and Ath-Thahabi 
agreed 1/219.', 'Sahih', 'e0672331e02b09c8984581446f6e5b74970d3846636e7f0038278f9d3eb8d415', 'اللهم اكتب لي بها عندك اجرا وضع عني بها وزرا واجعلها لي عندك ذخرا وتقبلها مني كما تقبلتها من عبدك داود', 1, TRUE, 'published'),
  (52, 'hisn-52', 22, 'hisn-al-muslim', 52, 'التَّحِيّـاتُ للهِ وَالصَّلَـواتُ والطَّيِّـبات ،
السَّلامُ عَلَيـكَ أَيُّهـا النَّبِـيُّ وَرَحْمَـةُ اللهِ وَبَرَكـاتُه ،
السَّلامُ عَلَيْـناوَعَلـى عِبـادِ للهِ الصَّـالِحـين .
أَشْـهَدُ أَنْ لا إِلـهَ إِلاّ الله ،
وَأَشْـهَدُ أَنَّ مُحَمّـداً عَبْـدُهُ وَرَسـولُه', 'Attaḥiyyātu lillāhi waṣṣalawātu, waṭṭayyibāt,
assalāmu `alayka ''ayyuhan-Nabiyyu 
wa raḥmatullāhi wa barakātuh, 
assalāmu `alaynā wa `alā ‘ibādillāhiṣ-ṣāliḥīn. 
''Ash-hadu ''an lā ''ilāha ''illallāh 
wa ''ash-hadu ''anna Muḥammadan `abduhu wa rasūluh.', 'All greetings of humility are for Allah, and all prayers and goodness. 
Peace be upon you, O Prophet, and the mercy of Allah and His blessings. 
Peace be upon us and upon the righteous slaves of Allah. I bear witness 
that there is none worthy of worship but Allah, and I bear witness that 
Muhammad is His slave and His Messenger.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, Muslim 1/301. See also Al-Asqalani, Fathul-Bal 1/13', NULL, 'db170788befd0fdb740e3ed8e0419be1d46f98c1c50f0a2466e6483ab4d19649', 'التحيات لله والصلوات والطيبات السلام عليك ايها النبي ورحمه الله وبركاته السلام عليناوعلي عباد لله الصالحين اشهد ان لا اله الا الله واشهد ان محمدا عبده ورسوله', 1, TRUE, 'published'),
  (53, 'hisn-53', 23, 'hisn-al-muslim', 53, 'اللّهُـمَّ صَلِّ عَلـى مُحمَّـد، وَعَلـى آلِ مُحمَّد،
كَمـا صَلَّيـتَ عَلـى إبْراهـيمَ وَعَلـى آلِ إبْراهـيم،
إِنَّكَ حَمـيدٌ مَجـيد ،
اللّهُـمَّ بارِكْ عَلـى مُحمَّـد، وَعَلـى آلِ مُحمَّـد،
كَمـا بارِكْتَ عَلـى إبْراهـيمَ وَعَلـى آلِ إبْراهيم،
إِنَّكَ حَمـيدٌ مَجـيد', 'Allāhumma ṣalli `alā Muḥammadinwa `alā ’āli Muḥammadin, 
kamā ṣallayta `alā ''Ibrāhīma wa `alā ’āli ''Ibrāhīma, ''innaka ḥamīdum-majīd.
Allāhumma bārik `alā Muḥammadin wa `alā ’āli Muḥammadin, 
kamā bārakta `alā ''Ibrāhīma wa `alā ''āli ''Ibrāhīma, 
''innaka ḥamīdum-majīd.', 'O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. 
O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/408.', NULL, '3bd9c46cc8d2c209a0615ff5f775a859608ecc4179e67e47d42a3dd4000fdcf1', 'اللهم صل علي محمد وعلي ال محمد كما صليت علي ابراهيم وعلي ال ابراهيم انك حميد مجيد اللهم بارك علي محمد وعلي ال محمد كما باركت علي ابراهيم وعلي ال ابراهيم انك حميد مجيد', 1, TRUE, 'published'),
  (54, 'hisn-54', 23, 'hisn-al-muslim', 54, 'اللّهُـمَّ صَلِّ عَلـى مُحمَّـدٍ
وَعَلـى أَزْواجِـهِ وَذُرِّيَّـتِه،
كَمـا صَلَّيْـتَ عَلـى آلِ إبْراهـيم .
وَبارِكْ عَلـى مُحمَّـدٍ
وَعَلـى أَزْواجِـهِ وَذُرِّيَّـتِه،
كَمـا بارِكْتَ عَلـى آلِ إبْراهـيم .
إِنَّكَ حَمـيدٌ مَجـيد', 'Allāhumma ṣalli `alā Muḥammadin
wa `alā ''azwājihi wa dhurriyyatihi,
kamā ṣallayta `alā ''āli ''Ibrāhīma. 
Wa bārik `alā Muḥammadin
wa `alā ''azwājihi wa dhurriyyatihi, 
kamā bārakta `alā ''āli ''Ibrāhīma.
''Innaka ḥamīdum-majīd.', 'O Allah, bestow Your favor on Muhammad and upon his wives and progeny as You have bestowed Your favor upon the family of Ibrahim. 
And bless Muhammad and his wives and progeny as You have blessed the family of Ibrahim, You are full of praise, Most Glorious.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, from Al-Asqalani, Fathul-Bari 6/ 407, Muslim 1/306.', NULL, 'fe2b833b6bc5df73efd4f927510d15fe7f670ba9a336a727477318afc17ebfbc', 'اللهم صل علي محمد وعلي ازواجه وذريته كما صليت علي ال ابراهيم وبارك علي محمد وعلي ازواجه وذريته كما باركت علي ال ابراهيم انك حميد مجيد', 1, TRUE, 'published'),
  (55, 'hisn-55', 24, 'hisn-al-muslim', 55, 'اللّهُـمَّ إِنِّـي أَعـوذُ بِكَ مِـنْ عَذابِ القَـبْر،
وَمِـنْ عَذابِ جَهَـنَّم،
وَمِـنْ فِتْـنَةِ المَحْـيا وَالمَمـات،
وَمِـنْ شَـرِّ فِتْـنَةِ المَسيحِ الدَّجّال', 'Allāhumma ‘innī ‘a`ūdhu bika min `adhābi ‘l-qabri, 
wa min `adhābi jahannam, 
wa min fitnati ‘l-maḥyā wa ‘l-mamāti, 
wa min sharri fitnati ‘l-masīḥid-dajjāl.', 'O Allah, I seek refuge in You from the punishment of the grave, and from the punishment of Hell-fire, and from the trials of life and death, and 
from the evil of the trial of the False Messiah.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 2/102, Muslim 1/412, and this is Muslim''s wording.', NULL, '8cc9827565e25257ac00fb95bcb385236d8162cb6257d2fe7dbbe3e6e7feed6e', 'اللهم اني اعوذ بك من عذاب القبر ومن عذاب جهنم ومن فتنه المحيا والممات ومن شر فتنه المسيح الدجال', 1, TRUE, 'published'),
  (56, 'hisn-56', 24, 'hisn-al-muslim', 56, 'اللّهُـمَّ إِنِّـي أَعـوذُ بِكَ مِـنْ عَذابِ القَـبْر ،
وَأَعـوذُ بِكَ مِـنْ فِتْـنَةِ المَسيحِ الدَّجّـال ،
أَعـوذُ بِكَ مِـنْ فِتْـنَةِ المَحْـيا وَالمَمـات .
اللّهُـمَّ إِنِّـي أَعـوذُ بِكَ مِنَ المَأْثَـمِ وَالمَغْـرَم', 'Allāhumma ''innī ‘a`ūdhu bika min `adhābi ‘l-qabr, 
wa ‘a`ūdhu bika min fitnati ‘l-masīḥid-dajjāl, 
wa ‘a`ūdhu bika min fitnati ‘l-maḥyā wa ‘l-mamāt. 
Allāhumma ‘innī ‘a`ūdhu bika mina ‘l-m’athami wa ‘l-maghram.', 'O Allah, I seek refuge in You from the punishment of the grave,
and I seek refuge in You from the trial of the False Messiah, 
and I seek refuge in You from the trials of life and death. 
O Allah, I seek refuge in You from sin and from debt.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/202, Muslim 1/412.', NULL, '7c4898ef29da49d90e3fddcd32e28f1a6cb89f4002a686e3e4e448459810a5a3', 'اللهم اني اعوذ بك من عذاب القبر واعوذ بك من فتنه المسيح الدجال اعوذ بك من فتنه المحيا والممات اللهم اني اعوذ بك من الماثم والمغرم', 1, TRUE, 'published'),
  (57, 'hisn-57', 24, 'hisn-al-muslim', 57, 'اللّهُـمَّ إِنِّـي ظَلَـمْتُ نَفْسـي ظُلْمـاً كَثـيراً
وَلا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْت،
فَاغْـفِر لي مَغْـفِرَةً مِنْ عِنْـدِك وَارْحَمْـني،
إِنَّكَ أَنْتَ الغَـفورُ الرَّحـيم', 'Allāhumma ‘innī ẓalamtu nafsī ẓulman kathīran, 
wa lā yaghfiru-dhdhunūba illā ''anta, 
faghfir lī maghfiratam’min `indika warḥamnī 
innaka ''anta ‘l-Ghafūr ur-Rahīm.', 'O Allah, I have greatly wronged myself,
and no one forgives sins but You. 
So, grant me forgiveness and have mercy on me.
Surely, you are Forgiving, Merciful.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 8/168, Muslim 4/2078.', NULL, 'ca64adf2cbd3c4c72d6f9f8d79a40b97c95e867fccc04c71f842643810e0fa15', 'اللهم اني ظلمت نفسي ظلما كثيرا ولا يغفر الذنوب الا انت فاغفر لي مغفره من عندك وارحمني انك انت الغفور الرحيم', 1, TRUE, 'published'),
  (58, 'hisn-58', 24, 'hisn-al-muslim', 58, 'اللّهُـمَّ اغْـفِرْ لي ما قَدَّمْـتُ وَما أَخَّرْت ،
وَما أَسْـرَرْتُ وَما أَعْلَـنْت ،
وَما أَسْـرَفْت ، وَما أَنْتَ أَعْـلَمُ بِهِ مِنِّي .
أَنْتَ المُقَـدِّمُ، وَأَنْتَ المُـؤَخِّـرُ
لا إِلهَ إِلاّ أَنْـت', 'Allāhummagh’fir lī mā qaddamtu, wa mā ‘akhkhartu, 
wa mā ‘asrartu, wa mā ‘a`lantu, 
wa mā ‘asraftu, wa mā ''anta ‘a`lamu bihi minnī.
‘anta ‘l-Muqaddimu, wa ''anta ‘l-Mu‘akhkhiru 
lā ''ilāha ''illā ''anta.', 'O Allah, forgive me what I have sent before me and what I have left behind me, 
what I have concealed and what I have done openly, 
what I have done in excess, and what You are better aware of than I. 
You are the One Who sends forth and You are the One Who delays. 
There is none worthy of worship but You.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/534.', NULL, '7b4739f2bc5e8912519bf5123a558cae308d768d6f57cd84d9dc1e8deaf3eb31', 'اللهم اغفر لي ما قدمت وما اخرت وما اسررت وما اعلنت وما اسرفت وما انت اعلم به مني انت المقدم وانت الموخر لا اله الا انت', 1, TRUE, 'published'),
  (59, 'hisn-59', 24, 'hisn-al-muslim', 59, 'اللّهُـمَّ أَعِـنِّي عَلـى ذِكْـرِكَ وَشُكْـرِك ،
وَحُسْـنِ عِبـادَتِـك', 'Allāhumma ‘a`innī `alā dhikrika, wa shukrika, 
wa ḥusni `ibādatik.', 'O Allah, help me to remember You, to give You thanks, 
and to perform Your worship in the best manner.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/86, An-Nasa''i 3/53. See also Al-Albani Sahih Abu Dawud 1 /284.', 'Sahih', '88525a779183914ebe6149d3c1709ff5da88441f4ad07e6ef873c743b921d6a5', 'اللهم اعني علي ذكرك وشكرك وحسن عبادتك', 1, TRUE, 'published'),
  (60, 'hisn-60', 24, 'hisn-al-muslim', 60, 'اللّهُـمَّ إِنِّـي أَعوذُ بِكَ مِنَ البُخْـل،
وَأَعوذُ بِكَ مِنَ الجُـبْن،
وَأَعوذُ بِكَ مِنْ أَنْ أُرَدَّ إِلى أَرْذَلِ الـعُمُر،
وَأََعوذُ بِكَ مِنْ فِتْنَـةِ الدُّنْـيا وَعَـذابِ القَـبْر', 'Allāhumma ''innī ‘a`udhu bika mina ‘l-bukhl, 
wa ‘a`udhu bika mina ‘l-jubn,
wa ‘a`udhu bika min ‘an ‘uradda ilā ‘ardhali ‘l-`umur, 
wa ‘a`udhu bika min fitnatid-dunyā wa `adhābi ‘l-qabr.', 'O Allah, I seek Your protection from miserliness, 
I seek Your protection from cowardice, 
and I seek Your protection from being returned to feeble old age. 
I seek Your protection from the trials of this world and from the torment of the grave.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/35', NULL, '9e1f9a2b07cc2b1dfa0055245c4903ef73a35971175823ee95805995f57f2a8e', 'اللهم اني اعوذ بك من البخل واعوذ بك من الجبن واعوذ بك من ان ارد الي ارذل العمر واعوذ بك من فتنه الدنيا وعذاب القبر', 1, TRUE, 'published'),
  (61, 'hisn-61', 24, 'hisn-al-muslim', 61, 'اللّهُـمَّ إِنِّـي أَسْأَلُـكَ الجَـنَّةَ
وأََعوذُ بِـكَ مِـنَ الـنّار', 'Allāhumma innī as''aluka ‘l-jannah
wa a`ūdhu bika minan-nār.', 'O Allah, I ask You for Paradise,
and I seek Your protection from the Fire.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud. See also Al-Albani, Sahih Ibn Majah 2/328.', 'Sahih', 'd608777812ff5a83a95c8b05219e61d8c0a6a794be21468fb3024c0f7d88167b', 'اللهم اني اسالك الجنه واعوذ بك من النار', 1, TRUE, 'published'),
  (62, 'hisn-62', 24, 'hisn-al-muslim', 62, 'اللّهُـمَّ بِعِلْـمِكَ الغَـيْبِ وَقُـدْرَتِـكَ عَلـى الْخَلقِ
أَحْـيِني ما عَلِـمْتَ الحـياةَ خَـيْراً لـي،
وَتَوَفَّـني إِذا عَلِـمْتَ الوَفـاةَ خَـيْراً لـي،
اللّهُـمَّ إِنِّـي أَسْـأَلُـكَ خَشْيَتَـكَ في الغَـيْبِ وَالشَّهـادَةِ،
وَأَسْـأَلُـكَ كَلِمَـةَ الحَـقِّ في الرِّضـا وَالغَضَـب،
وَأَسْـأَلُـكَ القَصْدَ في الغِنـى وَالفَقْـر،
أَسْـأَلُـكَ نَعـيماً لا يَنْفَـد،
وَأَسْـأَلُـكَ قُـرَّةَ عَيْـنٍ لا تَنْـقَطِعْ
وَأَسْـأَلُـكَ الرِّضـا بَعْـدَ القَضـاء،
وَأَسْـأَلُـكَ بًـرْدَ الْعَـيْشِ بَعْـدَ الْمَـوْت،
وَأَسْـأَلُـكَ لَـذَّةَ النَّظَـرِ إِلـى وَجْـهِكَ
وَالشَّـوْقَ إِلـى لِقـائِـك،
في غَـيرِ ضَـرّاءَ مُضِـرَّة، وَلا فِتْـنَةٍ مُضـلَّة،
اللّهُـمَّ زَيِّـنّا بِزينَـةِ الإيـمان،
وَاجْـعَلنا هُـداةً مُهْـتَدين', 'Allāhumma bi `ilmika ‘l-ghayb, wa qudratika `ala ‘l-khalq,
aḥyinī mā `alimta ‘l-ḥayāta khayran lī,
wa tawaffanī idhā  `alimta ‘l-wafāta khayran lī, 
Allāhumma innī as''aluka khash’yataka fil-ghaybi wash-shahādah, 
wa as''aluka kalimata ‘l-ḥaqqi fir-riḍā wa ‘l-ghaḍab, 
wa as''aluka ‘l-qaṣda fil-ghinā wa ‘l-faqr,
wa as''aluka na`īman lā yanfad, 
wa as''aluka qurrata `aynin lā tanqati`, 
wa as''alukar-riḍā ba`dal-qaḍā'', 
wa as''aluka barda ‘l-`ayshi ba`da ‘l-mawt, 
wa as''aluka ladh-dhatan-naẓari ilā wajhik,
wash-shawqa ilā liqā''ik, 
fī ghayri ḍarrā''a muḍirrah, wa lā fitnatin muḍillah,
Allāhumma zayyinnā bi zīnati ‘l-''īmān,
waj`alnā hudātan muhtadīn.', 'O Allah, by Your Knowledge of the unseen and by Your Power over creation, 
let me live if You know that life is good for me, 
and let me die if You know that death is good for me. 
O Allah, I ask You to grant me fear of You in private and in public. 
I ask you for the word of truth in times of contentment and anger. 
I ask You for moderation in wealth and in poverty. 
I ask you for blessings never ceasing and the coolness of my eye (i.e. pleasure) that never ends. 
I ask You for pleasure after Your Judgment
and I ask You for a life of coolness after death. 
I ask You for the delight of gazing upon Your Face,
and the joy of meeting You, 
without any harm and misleading trials befalling me.
O Allah, dress us with the beauty of Faith
and make us guides who are upon (correct) guidance.', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i 3/54, 55, Ahmad 4/364. See also Al-Albani, Sahih An-Nasa''i 1/281.', 'Sahih', '7ad9de7979f0e2a990d4c9b29b91aecbe5c1a099f9241e8c2bb3e0e7886dc7b8', 'اللهم بعلمك الغيب وقدرتك علي الخلق احيني ما علمت الحياه خيرا لي وتوفني اذا علمت الوفاه خيرا لي اللهم اني اسالك خشيتك في الغيب والشهاده واسالك كلمه الحق في الرضا والغضب واسالك القصد في الغني والفقر اسالك نعيما لا ينفد واسالك قره عين لا تنقطع واسالك الرضا بعد القضاء واسالك برد العيش بعد الموت واسالك لذه النظر الي وجهك والشوق الي لقايك في غير ضراء مضره ولا فتنه مضله اللهم زينا بزينه الايمان واجعلنا هداه مهتدين', 1, TRUE, 'published'),
  (63, 'hisn-63', 24, 'hisn-al-muslim', 63, 'اللّهُـمَّ إِنِّـي أَسْأَلُـكَ يا اللهُ
بِأَنَّـكَ الواحِـدُ الأَحَـد الصَّـمَدُ
الَّـذي لَـمْ يَلِـدْ وَلَمْ يولَدْ،
وَلَمْ يَكـنْ لَهُ كُـفُواً أَحَـد ،
أَنْ تَغْـفِرْ لي ذُنـوبي
إِنَّـكَ أَنْـتَ الغَفـورُ الرَّحِّـيم', 'Allāhumma innī as''aluka yā Allāh
bi''annaka ‘l-Wāḥidu ‘l-Aḥaduṣ-ṣamad, 
alladhī lam yalid wa lam yūlad, 
wa lam yakun lahu kufuwan aḥad, 
an taghfir lī dhunūbī, 
innaka anta ‘l-Ghafūrur-Raḥīm.', 'O Allah, I ask You. O Allah, You are the One, the Only, Self-Sufficient Master, Who was not begotten and begets not, and none is equal to Him. 
Forgive me my sins, surely you are Forgiving, Merciful.', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i 3/52, Ahmad 4/338. See also Al-Albani, Sahih An-Nasa''i 1/280 and 
Sifat Salatun-Nabi, pg. 204.', 'Sahih', 'cd77341897f5f54d714e0c0e898800c5d203b84e95edc7e669d2cb8177a99de3', 'اللهم اني اسالك يا الله بانك الواحد الاحد الصمد الذي لم يلد ولم يولد ولم يكن له كفوا احد ان تغفر لي ذنوبي انك انت الغفور الرحيم', 1, TRUE, 'published'),
  (64, 'hisn-64', 24, 'hisn-al-muslim', 64, 'اللّهُـمَّ إِنِّـي أَسْأَلُـكَ بِأَنَّ لَكَ الْحَـمْدُ
لا إِلـهَ إِلاّ أَنْـتَ وَحْـدَكَ لا شَـريكَ لَـكَ
المَنّـانُ يا بَديـعَ السَّمواتِ وَالأَرْضِ
يا ذا الجَلالِ وَالإِكْـرام يا حَـيُّ يا قَـيّومُ
إِنِّـي أَسْأَلُـكَ الجَنَّةَ وَأَعـوذُ بِـكَ مِنَ الـنّار', 'Allāhumma innī as''aluka bi''anna laka ‘l-ḥamd,
lā ilāha illā ant, waḥdaka lā sharīka lak, 
al-Mannān, yā Badī`as-samāwāti wa ‘l-arḍ
yā dha ‘l-Jalāli wa ‘l-''Ikrām, yā ḥayyu yā Qayyūm,
innī as''aluka ‘l-jannah, wa a`ūdhu bika minan-nār.', 'O Allah, I ask You, as You are the Owner of praise, 
there is none worthy of worship but You alone, You have no partner. 
You are the Giver of all good. O Creator of the heavens and the earth,
Owner of majesty and honor. O Living and Everlasting One, 
I ask you for Paradise, and I seek refuge in You from the fire.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, An-Nasa''i, Ibn Majah, At-Tirmidhi. See also Al-Albani, Sahih Ibn 
Majah 2/329.', 'Sahih', 'e7c1b06c1e45e9e581f72e32f092c0e200892e05b688f3af08093efb7be41f48', 'اللهم اني اسالك بان لك الحمد لا اله الا انت وحدك لا شريك لك المنان يا بديع السموات والارض يا ذا الجلال والاكرام يا حي يا قيوم اني اسالك الجنه واعوذ بك من النار', 1, TRUE, 'published'),
  (65, 'hisn-65', 24, 'hisn-al-muslim', 65, 'اللّهُـمَّ إِنِّـي أَسْأَلُـكَ
بِأَنَّـي أَشْـهَدُ أَنَّـكَ أنْـتَ اللهُ
لا إِلـهَ إِلاّ أَنْـت
الأَحَـدُ الصَّـمَدُ
الَّـذي لَـمْ يَلِـدْ وَلَمْ يولَـدْ
وَلَمْ يَكـنْ لَهُ كُـفُواً أَحَـد', 'Allāhumma innī as''aluka 
bi''annī ash-hadu annaka ant-Allāh 
lā ''ilāha ''illā ant,
Al-Aḥaduṣ-ṣamad
alladhī lam yalid wa lam yūlad 
wa lam yakun lahu kufuwan aḥad.', 'O Allah, I ask You, by the fact that I bear witness that You are Allah. 
There is none worthy of worship but You, 
the Only God, Independent of creation, 
Who was not begotten and begets not, 
and none is equal to Him.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 2/62, Ibn Majah 2/1267, At-Tirmidhi 5/515, Ahmad 5/360. See also 
Al-Albani, Sahih Ibn Majah 2/329 and Sahih At-Tirmidhi 3/163.', 'Sahih', 'bd5e2b81c7a8294ead4b8bb1acfce5983ea9809119d0c2b93496aefc04f30d0f', 'اللهم اني اسالك باني اشهد انك انت الله لا اله الا انت الاحد الصمد الذي لم يلد ولم يولد ولم يكن له كفوا احد', 1, TRUE, 'published'),
  (66, 'hisn-66', 25, 'hisn-al-muslim', 66, 'أَسْـتَغْفِرُ الله (ثَلاثاً)
اللّهُـمَّ أَنْـتَ السَّلامُ
وَمِـنْكَ السَّلام
تَبارَكْتَ يا ذا الجَـلالِ وَالإِكْـرام', 'Astaghfirullāh (three times) 
Allāhumma antas-salām, 
wa minkas-salām, 
tabārakta yā dhal-Jalāli wal-''Ikrām.', 'I seek the forgiveness of Allah (three times). 
O Allah, You are Peace and from You comes peace. 
Blessed are You, O Owner of majesty and honor.', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/414.', NULL, 'bf447d2aa0292fae01d1fc18daa7d2bd36ad81ece5da0e45c9a6aee54494d9bf', 'استغفر الله ثلاثا اللهم انت السلام ومنك السلام تباركت يا ذا الجلال والاكرام', 1, TRUE, 'published'),
  (67, 'hisn-67', 25, 'hisn-al-muslim', 67, 'لا إلهَ إلاّ اللّهُ
وحدَهُ لا شريكَ لهُ
لهُ المُـلْكُ ولهُ الحَمْد
وهوَ على كلّ شَيءٍ قَدير
اللّهُـمَّ لا مانِعَ لِما أَعْطَـيْت
وَلا مُعْطِـيَ لِما مَنَـعْت
وَلا يَنْفَـعُ ذا الجَـدِّ مِنْـكَ الجَـد', 'Lā ''ilāha ''illallāh, 
waḥdahu lā sharīka lah, 
lahu ‘l-mulku wa lahu ‘l-ḥamd,
wa huwa `alā kulli shay''in qadīr, 
Allāhumma lā māni`a limā ''a`tayt, 
wa lā mu`tiya limā mana`t, 
wa lā yanfa`u dhal-jaddi minkal-jadd.', 'None has the right to be worshipped but Allah alone, 
He has no partner, 
His is the dominion and His is the praise,
and He is Able to do all things. 
O Allah, there is none who can withhold what You give, 
and none may give what You have withheld,
and the might of the mighty person cannot benefit him against You.', NULL, 10, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/255, Muslim 1/414.', NULL, '96c51efbec72400a56257c389c2da976ad4bf2af56eee6dec72ca8f3c3d452d9', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير اللهم لا مانع لما اعطيت ولا معطي لما منعت ولا ينفع ذا الجد منك الجد', 1, TRUE, 'published'),
  (68, 'hisn-68', 25, 'hisn-al-muslim', 68, 'لا إلهَ إلاّ اللّه
وحدَهُ لا شريكَ لهُ
لهُ الملكُ ولهُ الحَمد
وهوَ على كلّ شيءٍ قدير
لا حَـوْلَ وَلا قـوَّةَ إِلاّ بِاللهِ
لا إلهَ إلاّ اللّـه
وَلا نَعْـبُـدُ إِلاّ إيّـاه
لَهُ النِّعْـمَةُ وَلَهُ الفَضْل
وَلَهُ الثَّـناءُ الحَـسَن
لا إلهَ إلاّ اللّهُ
مخْلِصـينَ لَـهُ الدِّينَ
وَلَوْ كَـرِهَ الكـافِرون', 'Lā ''ilāha ''illallāh, 
waḥdahu lā sharīka lah, 
lahul-mulku, wa lahul-ḥamd, 
wa huwa `alā kulli shay''in qadīr. 
Lā ḥawla wa lā quwwata ''illā billāh, 
lā ''ilāha ''illallāh, 
wa lā na`budu ''illā ''iyyāh,
lahun-ni`matu wa lahul-faḍl,
wa lahuth-thanā''ul-ḥasan, 
lā ''ilāha ''illallāh, 
mukhliṣīna lahud-dīn, 
wa law karihal-kāfirūn.', 'None has the right to be worshipped but Allah alone, 
He has no partner, 
His is the dominion and His is the praise
and He is Able to do all things. 
There is no power and no might except by Allah. 
None has the right to be worshipped but Allah, 
and we do not worship any other besides Him.
His is grace, and His is bounty,
and to Him belongs the most excellent praise. 
None has the right to be worshipped but Allah. 
(We are) sincere in making our religious devotion to Him, 
even though the disbelievers may dislike it.', NULL, 10, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/415.', NULL, '39809c74fb523761265cb40bc97613dffe8a40fdcdf0b9bfac0f29c5adac3dd1', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير لا حول ولا قوه الا بالله لا اله الا الله ولا نعبد الا اياه له النعمه وله الفضل وله الثناء الحسن لا اله الا الله مخلصين له الدين ولو كره الكافرون', 1, TRUE, 'published'),
  (69, 'hisn-69', 25, 'hisn-al-muslim', 69, 'سُـبْحانَ اللهِ
والحَمْـدُ لله
واللهُ أكْـبَر
(ثلاثاً وثلاثين)
لا إلهَ إلاّ اللّهُ
وَحْـدَهُ لا شريكَ لهُ
لهُ الملكُ ولهُ الحَمْد
وهُوَ على كُلّ شَيءٍ قَـدير', 'Subḥānallāh,
walḥamdu lillāh, 
wallāhu ''akbar,
(each said thirty-three times)
Lā ''ilāha ''illallāh
waḥdahu lā sharīka lahu, 
lahul-mulku wa lahul-ḥamd
wa huwā`lā kulli shay''in qadīr.', 'Glory is to Allah,
and praise is to Allah, 
and Allah is the Most Great. 
(each said thirty-three times)
None has the right to be worshiped but Allah alone, 
He has no partner, 
His is the dominion and His is the praise
and He is Able to do all things.', NULL, 33, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/418, Whoever says this after every prayer will be forgiven his 
sins even though they be as the foam of the sea.', NULL, 'e2b5f977a6c19850207523b7aab72cde4c9cbba85b87f61a06c0e3c5145e8405', 'سبحان الله والحمد لله والله اكبر ثلاثا وثلاثين لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير', 1, TRUE, 'published'),
  (70, 'hisn-70', 25, 'hisn-al-muslim', 70, 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ هُوَ اللَّهُ أَحَدٌ*
اللَّهُ الصَّمَدُ*
لَمْ يَلِدْ وَلَمْ يُولَدْ*
وَلَمْ يَكُن لَّهُ كُفُواً أَحَدٌ}
 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ*
مِن شَرِّ مَا خَلَقَ*
وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ*
وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ*
وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ}
بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ أَعُوذُ بِرَبِّ النَّاسِ*
مَلِكِ النَّاسِ*
إِلَهِ النَّاسِ*
مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ*
الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ*
مِنَ الْجِنَّةِ وَالنَّاسِ}
بَعْدَ كُلِّ صَلاَةٍ.', 'Bismillāhir-Raḥmānir-Raḥīm. 
Qul huwallāhu aḥad. 
Allāhuṣ-ṣamad. 
Lam yalid wa lam yūlad. 
Wa lam yakun lahu kufuwan aḥad.', 'Bismillāhir-Raḥmānir-Raḥīm. 
Qul a`ūdhu birabbil-falaq. 
Min sharri mā khalaq. 
Wa min sharri ghāsiqin idhā waqab. 
Wa min sharrin-naffāthāti fil-`uqad. 
Wa min sharri ḥāsidin idhā ḥasad.

Bismillāhir-Raḥmānir-Raḥīm. 
Qul a`ūdhu birabbin-nās. 
Malikin-nās. ''Ilāhin-nās. 
Min sharri ‘l-waswāsil-khannās. 
Alladhī yuwaswisu fī ṣudūrin-nās. 
Minal-jinnati wannās.

(Surahs 112 al-Ikhlas, 113 al-Falaq, and 114 an-Nas)
These Surahs should be recited in Arabic after each prayer. After the Maghrib and Fajr prayers, they should be recited three times each.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: He is Allah (the) One.
The Self-Sufficient Master, Whom all creatures need,
He begets not nor was He begotten,
and there is none equal to Him.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: I seek refuge with (Allah) the Lord of the daybreak,
from the evil of what He has created,
and from the evil of the darkening (night) as it comes with its darkness,
and from the evil of those who practice witchcraft when they blow in the knots,
and from the evil of the envier when he envies.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: I seek refuge with (Allah) the Lord of mankind,
the King of mankind,
the God of mankind,
from the evil of the whisperer who withdraws,
who whispers in the breasts of mankind,
of jinns and men.', NULL, 3, NULL, 112, '1-4', 'tirmidhi', NULL, 'Abu Dawud 2/86, An-Nasa''i 3/68. See also Al-Albani, Sahih At-Tirmidhi 2/8.', 'Sahih', '498231e7a91bb6a1fddad7d5124095a2516145a9781dc3acdb95bed65ab26657', 'بسم الله الرحمن الرحيم قل هو الله احد الله الصمد لم يلد ولم يولد ولم يكن له كفوا احد بسم الله الرحمن الرحيم قل اعوذ برب الفلق من شر ما خلق ومن شر غاسق اذا وقب ومن شر النفاثات في العقد ومن شر حاسد اذا حسد بسم الله الرحمن الرحيم قل اعوذ برب الناس ملك الناس اله الناس من شر الوسواس الخناس الذي يوسوس في صدور الناس من الجنه والناس بعد كل صلاه', 1, TRUE, 'published'),
  (71, 'hisn-71', 25, 'hisn-al-muslim', 71, '﴿اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ
لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ
لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ
مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ
يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ
وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء
وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ
وَلاَ يَؤُودُهُ حِفْظُهُمَا
وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾
عقب كل صلاة', 'Allāhu lā ilāha illā huwa ‘l-Ḥayyul-Qayyūm, 
lā ta''khudhuhu sinatun wa lā nawm, 
lahu mā fis-samāwāti wa mā fil-ardh, 
man dhal-ladhī yashfa`u `indahu illā bi''idhnih, 
ya`lamu mā bayna ''aydīhim wa mā khalfahum, 
wa lā yuḥītūna bishay''im-min `ilmihi illā bimā shā''a, 
wasi `a kursiyyuhus-samāwāti wal-ardh, 
wa lā ya''ūduhu hifẓuhumā, 
wa huwal-`Aliyyu ‘l-`Aẓīm.', 'Allah! There is none worthy of worship but He, the Ever-Living, the One Who sustains and protects all that exists.
Neither slumber nor sleep overtakes Him.
To Him belongs whatever is in the heavens and whatever is on the earth.
Who is he that can intercede with Him except with His Permission?
He knows what happens to them in this world, and what will happen to them in the Hereafter.
And they will never compass anything of His Knowledge except that which He wills.
His Throne extends over the heavens and the earth,
and He feels no fatigue in guarding and preserving them.
And He is the Most High, the Most Great. (Recite in Arabic after each prayer.)', NULL, 1, NULL, NULL, NULL, 'nasai', '100', 'An-Nasa''i, ''Amalul-Yawm wal-Laylah (Hadith no. 100), also Ibn As-Sunni (no. 
121). See also Al-Albani, Sahihul-Jami'' As-Saghir 5/339 and 
Silsilatul-Ahadith As-Sahihah 2/697 (no. 972).', 'Sahih', '5f142902d5812a0f9fa451c51f03efc2339512ea5e4893960c16e903b9364307', '﴿الله لا اله الا هو الحي القيوم لا تاخذه سنه ولا نوم له ما في السماوات وما في الارض من ذا الذي يشفع عنده الا باذنه يعلم ما بين ايديهم وما خلفهم ولا يحيطون بشيء من علمه الا بما شاء وسع كرسيه السماوات والارض ولا يووده حفظهما وهو العلي العظيم﴾ عقب كل صلاه', 1, TRUE, 'published'),
  (72, 'hisn-72', 25, 'hisn-al-muslim', 72, 'لاَ إِلَهَ إِلاَّ اللَّهُ
وَحْدَهُ لاَ شَرِيكَ لَهُ
لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ
يُحْيِي وَيُمِيتُ
وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ
(عَشْرَ مَرّاتٍ بَعْدَ صَلاةِ الْمَغْرِبِ وَالصُّبْحِ)', 'Lā ilāha illallāh
waḥdahu lā sharīka lah, 
lahu‘l-mulku wa lahu‘l-ḥamd 
yuḥyī wa yumīt
wa huwa `alā kulli shay''in qadīr.', 'None has the right to be worshipped but Allah alone, Who has no partner. 
His is the dominion and His is the praise. 
He brings life and He causes death, 
and He is Able to do all things.', NULL, 10, '(Recite ten times in Arabic after the Maghrib and Fajr prayers.)', NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/515, Ahmad 4/227. See its checking in Ibn Al-Qayyim 
Al-Jawziyyah''s Zddul-Ma''ad 1/300.', NULL, 'f2cd7302bdc041e5b01eff1696606fea653fe910e3d93936dd7d8f5947604824', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد يحيي ويميت وهو علي كل شيء قدير عشر مرات بعد صلاه المغرب والصبح', 1, TRUE, 'published'),
  (73, 'hisn-73', 25, 'hisn-al-muslim', 73, 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نافِعاً
وَرِزْقاً طَيِّباً وَعَمَلاً مُتَقَبَّلاً
(بَعْدَ السّلامِ مِنْ صَلاَةِ الفَجْرِ)', 'Allāhumma innī as''aluka `ilman nāfi`an, 
wa rizqan ṭayyiban, wa `amalam-mutaqabbala.', '"O Allah, I ask You for knowledge which is beneficial, 
and sustenance which is good, and deeds which are acceptable."', NULL, 1, '[to be said after giving salam for the Fajr prayer.]', NULL, NULL, 'ibn-majah', NULL, 'Ibn Majah and others. See Sahih Ibn Majah 1/152 and Majma'' Az-Zawa''id 10/111', 'Sahih', '8452a951888feabac7e4e49ffedb2a45a9a7d7443a5383288a4add084aec3029', 'اللهم اني اسالك علما نافعا ورزقا طيبا وعملا متقبلا بعد السلام من صلاه الفجر', 1, TRUE, 'published'),
  (74, 'hisn-74', 26, 'hisn-al-muslim', 74, 'قال جابر بن عبد الله رضي الله عنهما : كان رسول الله صلى الله عليه وسلم ، يُعلمنا الاستخارة في الأمور كلها كما يعلمُنا السورة من القرآن ، يقول : إذا هم أحدكم بالأمر فليركع ركعتين من غير الفريضة ، ثم ليقل:
"اللهم إني أستخيرك بعلمك ،
وأستقدرك بقدرتك ،
وأسألك من فضلك العظيم
فإنك تقدِرُ ولا أقدِرُ ،
وتعلم ولا أعلم ،
وأنت علام الغيوب ،
اللهم إن كنت تعلم أن هذا الأمر
- يسمي حاجته -
خير لي في ديني ومعاشي وعاقبة أمري
- أو قال : عاجله وآجله -
فاقدره لي ويسره لي ،
ثم بارك لي فيه ،
وإن كنت تعلم أن هذا الأمر
شر لي في ديني ومعاشي وعاقبة أمري
- أو قال : عاجله وآجله -
فاصرفه عني واصرفني عنه ،
واقدر لي الخير حيث كان ،
ثم ارضني به "
وما  ندم من استخار الخالق، وشاور المخلوقين المؤمنين وتثبَّت في أمره، فقد قال سبحانه ﴿وَشـاوِرْهُـم في الأمْـرِ فَـإِذا عَـزَمْـتَ فَتَوَكّـلْ عَلـى الله﴾', 'Jabir bin Abdullah (RA) said: The Prophet (ﷺ) used to teach us to seek Allah''s Counsel in all matters, as he used to teach us a Surah from the Qur''an. He would say: When anyone of you has an important matter to decide, let him pray two Rak''ahs other than the obligatory prayer, and then say:
Allāhumma innī astakhīruka bi `ilmik,
wa astaqdiruka biqudratik, 
wa as''aluka min faḍlika ‘l-`Aẓīm, 
fa''innaka taqdiru wa lā aqdir, 
wa ta`lamu wa lā a`lam, 
wa anta `allāmu ‘l-ghuyūb, 
Allāhumma in kunta ta`lamu anna hādha ‘l-amra - [then mention the thing to be decided]
Khayrun lī fī dīnī wa ma`āshī wa `āqibati amrī - [or say] `ājilihi wa ājilih - 
faqdurhu lī wa yassirhu lī 
thumma bārik lī fīh, 
wa in kunta ta`lamu anna hādha ‘l-amra
sharrun lī fī dīnī wa ma`āshī wa `āqibati ''amrī - [or say] `ājilihi wa ''ājilihi - 
faṣrifhu `annī waṣrifnī  `anh, 
waqdur liya ‘l-khayra ḥaythu kān, 
thumma arḍinī bih.', '"O Allah, I seek the counsel of Your Knowledge, 
and I seek the help of Your Omnipotence, 
and I beseech You for Your Magnificent Grace. 
Surely, You are Capable and I am not. 
You know and I know not, 
and You are the Knower of the unseen. 
O Allah, if You know that this matter [then mention the thing to be decided] 
is good for me in my religion and in my life and for my welfare in the life to come, - [or say: in this life and the afterlife] - 
then ordain it for me and make it easy for me, then bless me in it. 
And if You know that this matter is bad for me in my religion and in my life and for my welfare in the life to come, - [or say: in this life and the afterlife] - 
then distance it from me, and distance me from it, 
and ordain for me what is good wherever it may be, 
and help me to be content with it."

Whoever seeks the counsel of the Creator will not regret it and whoever seeks the advice of the believers will feel confident about his decisions, for Allah has said in the Qur''an:

"And consult them in the affair. Then when you have taken a decision, put your trust in Allah."', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/162. and Aal-''Imran 3:159.', NULL, 'd2dbc8c6940ac5b886748e0adca9751591a1718544f4790148d0db9ac546c090', 'قال جابر بن عبد الله رضي الله عنهما كان رسول الله صلي الله عليه وسلم يعلمنا الاستخاره في الامور كلها كما يعلمنا السوره من القران يقول اذا هم احدكم بالامر فليركع ركعتين من غير الفريضه ثم ليقل اللهم اني استخيرك بعلمك واستقدرك بقدرتك واسالك من فضلك العظيم فانك تقدر ولا اقدر وتعلم ولا اعلم وانت علام الغيوب اللهم ان كنت تعلم ان هذا الامر - يسمي حاجته - خير لي في ديني ومعاشي وعاقبه امري - او قال عاجله واجله - فاقدره لي ويسره لي ثم بارك لي فيه وان كنت تعلم ان هذا الامر شر لي في ديني ومعاشي وعاقبه امري - او قال عاجله واجله - فاصرفه عني واصرفني عنه واقدر لي الخير حيث كان ثم ارضني به وما ندم من استخار الخالق وشاور المخلوقين المومنين وتثبت في امره فقد قال سبحانه ﴿وشاورهم في الامر فاذا عزمت فتوكل علي الله﴾', 1, TRUE, 'published'),
  (75, 'hisn-75', 27, 'hisn-al-muslim', 75, 'الْحَمْدُ لِلَّهِ وَحْدَهُ،
وَالصَّلاَةُ وَالسَّلاَمُ عَلَى مَنْ لاَ نَبِيَّ بَعْدَهُ', 'Alḥamdulillahi waḥdah
waṣ-ṣalatu was-salam `alā man lā nabiyya ba`dah.', 'All praise is due to Allah alone, 
and peace and blessings be upon him after whom there is no other Prophet.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', '3667', 'Anas (RA) said that he heard the Prophet (ﷺ) say: "That I sit with people remembering Almighty Allah from the morning (Fajr) prayer until sunrise is more beloved to me than freeing four slaves from among the Children of Isma''il. That I sit with people remembering Allah from the afternoon (''Asr) 
prayer, until the sun sets, is more beloved to me than freeing four slaves from among the Children of Isma''il." This was reported by Abu Dawud (no. 3667). Al-Albani graded it good in Sahih Abu Dawud 2/698.', 'Sahih', '917a555776b3561cdb586bdd3044f05d67b8075e8165129603f58a84414923ac', 'الحمد لله وحده والصلاه والسلام علي من لا نبي بعده', 1, TRUE, 'published'),
  (76, 'hisn-76', 27, 'hisn-al-muslim', 76, '(أعوذ بالله من الشيطان الرجيم)
﴿اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ
لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ
لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ
مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ
يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ
وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء
وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ
وَلاَ يَؤُودُهُ حِفْظُهُمَا
وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾', '(A`ūdhu billāhi min ash-shaytāni ''r-rajīm)
Allāhu lā ilāha illā huwa ‘l-Ḥayyul-Qayyūm, 
lā ta''khudhuhu sinatun wa lā nawm, 
lahu mā fis-samāwāti wa māfil-arḍ, 
man dhal-ladhī yashfa`u `indahu illā bi''idhnih, 
ya`lamu mā bayna aydīhim wa mā khalfahum, 
wa lā yuḥīṭūna bishay''im-min `ilmihi illā bimā shā'', 
wasi`a kursiyyuhus-samāwāti wal-arḍ, 
wa lā ya''ūduhu hifẓuhumā, 
wa huwal-`Aliyyu‘l-`Aẓīm.', '(Ayat al-Kursi; Al-Qur''an 2:255)

Allah! There is none worthy of worship but He, the Ever-Living, the One Who sustains and protects all that exists. 
Neither slumber nor sleep overtakes Him. 
To Him belongs whatever is in the heavens and whatever is on the earth. 
Who is he that can intercede with Him except with His Permission? 
He knows what happens to them in this world, and what will happen to them in the Hereafter. 
And they will never encompass anything of His Knowledge except that which He wills.
His Throne extends over the heavens and the earth, 
and He feels no fatigue in guarding and preserving them. 
And He is the Most High, the Most Great.', NULL, 1, NULL, 2, '255', 'nasai', NULL, 'Whoever says this when he rises in the morning will be protected from jinns until he retires in the evening, and whoever says it when retiring in the evening will be protected from them until he rises in the morning. It was 
reported by Al-Hakim 1 / 562, Al-Albani graded it as authentic in 
Sahihut-Targhib wat-Tarhib 1/273, and traces it to An-Nasa''i and 
At-Tabarani. He says that At-Tabarani''s chain of transmission is reliable 
(Jayyid).', 'Sahih', '0fe457d68f642a80cee6851ee89c165c72250dcfb829a859bd9d9fa5ad0ac7f7', 'اعوذ بالله من الشيطان الرجيم ﴿الله لا اله الا هو الحي القيوم لا تاخذه سنه ولا نوم له ما في السماوات وما في الارض من ذا الذي يشفع عنده الا باذنه يعلم ما بين ايديهم وما خلفهم ولا يحيطون بشيء من علمه الا بما شاء وسع كرسيه السماوات والارض ولا يووده حفظهما وهو العلي العظيم﴾', 1, TRUE, 'published'),
  (77, 'hisn-77', 27, 'hisn-al-muslim', 77, 'بسم الله الرحمن الرحيم
{ قُلْ هُوَ اللَّهُ أَحَدٌ *
اللَّهُ الصَّمَدُ *
لَمْ يَلِدْ وَلَمْ يُولَدْ *
لَمْ يَكُن لَّهُ كُفُواً أَحَدٌ }
بسم الله الرحمن الرحيم
{ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ *
مِن شَرِّ مَا خَلَقَ *
وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ *
وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ *
وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ }
بسم الله الرحمن الرحيم
{ قُلْ أَعُوذُ بِرَبِّ النَّاسِ *
مَلِكِ النَّاسِ *
إِلَهِ النَّاسِ *
مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ *
الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ *
مِنَ الْجِنَّةِ وَالنَّاسِ }
(ثلاث مرات)', 'Bismillāhir-Raḥmānir-Raḥīm. 
Qul huwallāhu aḥad. 
Allāhuṣ-ṣamad. 
Lam yalid wa lam yūlad. 
Wa lam yakun lahu kufuwan aḥad.', 'Bismillāhir-Raḥmānir-Raḥīm. 
Qul a`ūdhu birabbil-falaq. 
Min sharri mā khalaq. 
Wa min sharri ghāsiqin idhā waqab. 
Wa min sharrin-naffāthāti fil-`uqad. 
Wa min sharri ḥāsidin idhā ḥasad.

Bismillāhir-Raḥmānir-Raḥīm. 
Qul a`ūdhu birabbin-nās. 
Malikin-nās. 
''Ilāhin-nās. 
Min sharri ‘l-waswāsil-khannās. 
Alladhī yuwaswisu fī ṣudūrin-nās. 
Minal-jinnati wannās.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: He is Allah (the) One. 
The Self-Sufficient Master, Whom all creatures need, 
He begets not nor was He begotten, 
and there is none equal to Him.

With the Name of Allah, the Most Gracious, the Most Merciful. 
Say: I seek refuge with (Allah) the Lord of the daybreak, 
from the evil of what He has created, 
and from the evil of the darkening (night) as it comes with its darkness, 
and from the evil of those who practice witchcraft when they blow in the knots, 
and from the evil of the envier when he envies.

With the Name of Allah, the Most Gracious, the Most Merciful. 
Say: I seek refuge with (Allah) the Lord of mankind, 
the King of mankind, 
the God of mankind, 
from the evil of the whisperer who withdraws, 
who whispers in the breasts of mankind, 
of jinns and men.', NULL, 3, '(Recite these three times each in Arabic).', 112, '1-4', 'tirmidhi', NULL, 'Al-Ikhlas 112:1-4, Al-Falaq 113:1-5, An-Nas 114:1-6.
Whoever recites these three times in the morning and in the evening, they will suffice him (as a protection) against everything. The Hadith was reported by Abu Dawud 4/322, and At-Tirmidhi 5/567. See Al-Albani''s Sahih At-Tirmidhi 3/182.', 'Sahih', '6eda5cadf200214dc36b626a2bb68c6fc765097e69bf88d5b5f15a8e154f75bc', 'بسم الله الرحمن الرحيم قل هو الله احد الله الصمد لم يلد ولم يولد لم يكن له كفوا احد بسم الله الرحمن الرحيم قل اعوذ برب الفلق من شر ما خلق ومن شر غاسق اذا وقب ومن شر النفاثات في العقد ومن شر حاسد اذا حسد بسم الله الرحمن الرحيم قل اعوذ برب الناس ملك الناس اله الناس من شر الوسواس الخناس الذي يوسوس في صدور الناس من الجنه والناس ثلاث مرات', 1, TRUE, 'published'),
  (78, 'hisn-78', 27, 'hisn-al-muslim', 78, 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ،
لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ،
لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ،
رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيرَ مَا بَعْدَهُ،
وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ،
رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ،
رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَـبْر.', 'Aṣbaḥnā wa aṣbaḥal-mulku lillāh, walḥamdu lillāh, 
lā ilāha illallāhu waḥdahu lā sharīka lah, 
lahul-mulku wa lahul-ḥamd, wa huwa `alā kulli shay''in Qadīr. 
Rabbi as''aluka khayra mā fī hādha ‘l-yawmi wa khayra mā ba`dahu 
wa a`ūdhu bika min sharri mā fī hātha ‘l-yawmi wa sharri mā ba`dahu, 
Rabbi a`ūdhu bika minal-kasali, wa sū''il-kibar,
Rabbi a`ūdhu bika min `adhābin fin-nāri wa `adhābin fil-qabr.', 'We have entered a new day 1 and with it all dominion is Allah''s. Praise is to Allah. 
None has the right to be worshipped but Allah alone, Who has no partner. 
To Allah belongs the dominion, and to Him is the praise and He is Able to do all things.
My Lord, I ask You for the goodness of this day and of the days that come after it,
and I seek refuge in You from the evil of this day and of the days that come after it.2
My Lord, I seek refuge in You from laziness and helpless old age. 
My Lord, I seek refuge in You from the punishment of Hell-fire, and from the punishment of the grave.3', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, '1 When you say this in the evening you should say Amsaynā wa amsal-mulku lillāh: "We have ended another day and with it, all dominion is Allah''s.
2 When you say this in the evening you should say: Rabbi as''aluka khayra mā fī hāthihil-laylati, wa khayra mā ba`dahā, wa a`ūthu bika min sharri mā fī hāthihil-laylati wa sharri mā ba`dahā: "I ask You for the good things of this night and of the nights that come after it and I seek refuge in You from the evil of this night and of the nights that come after it."
3 Muslim 4/2088.', 'Hasan', '4bf400ed78fe6d82aeba8575276ef5dc494898ada638a015d1a11377a1c308b0', 'اصبحنا واصبح الملك لله والحمد لله لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير رب اسالك خير ما في هذا اليوم وخير ما بعده واعوذ بك من شر ما في هذا اليوم وشر ما بعده رب اعوذ بك من الكسل وسوء الكبر رب اعوذ بك من عذاب في النار وعذاب في القبر', 1, TRUE, 'published'),
  (79, 'hisn-79', 27, 'hisn-al-muslim', 79, 'اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا
وَبِكَ نَحْـيا وَبِكَ نَمـوتُ
وَإِلَـيْكَ النِّـشور
وإذا أمسي فليقل :
اللهم بك أمسينا وبك أصبحنا
وبك نحيا وبك نموت
وإليك المصير', 'Allāhumma bika aṣbaḥnā, 
wa bika amsaynā, 
wa bika naḥyā, wa bika namūt, 
wa ilaykan-nushūr.', 'When you say this in the evening you should say: 
Allāhumma bika amsaynā wa bika aṣbaḥnā, 
wa bika naḥyā, wa bika namūt, 
wa ilaykal-maṣīr

O Allah, by You we enter the morning and by You we enter the evening,
by You we live and by You we die, 
and to You is the Final Return.

O Allah, You bring us the end of the day as You bring us its beginning, 
You bring us life and you bring us death,
and to You is our fate.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Sahih At-Tirmidhi 3/142.''', 'Sahih', '3d6ffbfa7e3c7bf275c9cc82c078bc840f1cf60fe3a1bc70595c3d4c0e0d6b0a', 'اللهم بك اصبحنا وبك امسينا وبك نحيا وبك نموت واليك النشور واذا امسي فليقل اللهم بك امسينا وبك اصبحنا وبك نحيا وبك نموت واليك المصير', 1, TRUE, 'published'),
  (80, 'hisn-80', 27, 'hisn-al-muslim', 80, 'اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ
خَلَقْتَنـي وَأَنا عَبْـدُك
وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت
أَعـوذُ بِكَ مِنْ شَـرِّ ما صَنَـعْت
أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ
وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي
فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ', 'Allāhumma anta Rabbī lā ilāha illā ant, 
khalaqtanī wa anā `abduk, 
wa anā `alā `ahdika wa wa`dika mastaṭa`t, 
a`ūdhu bika min sharri mā ṣana`t, 
abū''u laka bi ni`matika `alay, 
wa abū''u bidhanbī faghfir lī 
fa''innahu lā yaghfirudh-dhunūba illā ant.', 'O Allah, You are my Lord, there is none worthy of worship but You. 
You created me and I am your slave. 
I keep Your covenant, and my pledge to You so far as I am able. 
I seek refuge in You from the evil of what I have done. 
I admit to Your blessings upon me, 
and I admit to my misdeeds. Forgive me, 
for there is none who may forgive sins but You.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Whoever recites this with conviction in the evening and dies during that night shall enter Paradise, and whoever recites it with conviction in the morning and dies during that day shall enter Paradise, Al-Bukhari 7/150. 
Other reports are in An-Nasa''i and At-Tirmidhi.', NULL, 'aafbe0afbf8c92c3bf05c5f93de61f7b4acd93e5e33fb1483604f582ba213a43', 'اللهم انت ربي لا اله الا انت خلقتني وانا عبدك وانا علي عهدك ووعدك ما استطعت اعوذ بك من شر ما صنعت ابوء لك بنعمتك علي وابوء بذنبي فاغفر لي فانه لا يغفر الذنوب الا انت', 1, TRUE, 'published'),
  (81, 'hisn-81', 27, 'hisn-al-muslim', 81, 'اللّهُـمَّ إِنِّـي أَصْبَـحْتُ أَُشْـهِدُك ،
وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ،
وَمَلائِكَتِك ، وَجَمـيعَ خَلْـقِك ،
أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ
وَحْـدَكَ لا شَريكَ لَـك ،
وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك .
(أربع مرات حينَ يصْبِح أوْ يمسي)', 'Allāhumma innī aṣbaḥtu ush-hiduka 
wa ush-hidu ḥamalata `arshik, 
wa malā''ikataka wajamī`a khalqik, 
annaka antallāhu lā ilāha illā ant, 
waḥdaka lā sharīka lak, 
wa anna Muḥammadan `abduka wa rasūluk.', 'O Allah, I have entered a new morning 1 and call upon You and upon the bearers of Your Throne, 
upon Your angels and all creation 
to bear witness that surely You are Allah, there is none worthy of worship but You alone, You have no partners, 
and that Muhammad is Your slave and Your Messenger. 
(Recite four times in Arabic.) 2', NULL, 4, NULL, NULL, NULL, 'bukhari', NULL, '1 When you say this in the evening you should say, Allāhumma innī amsaytu. . . .: "O Allah, I have ended another day..."
2 "Allah will spare whoever says this four times in the morning or evening from the fire of Hell." Abu Dawud 4/317. It was also reported by Al-Bukhari in Al-''Adab Al-Mufrad, An-Nasa''i in ''Amalul-Yawm wal-Laylah and Ibn As-Sunni. Nasa''i''s and Abu Dawud''s chains of transmission are good 
(Hasan), Ibn Baz, p. 23.', 'Hasan', 'a48fc9e3781b6d8f21df0a1e26a2f304f63af17994a8ddc2d3bef2cf18d4d6f4', 'اللهم اني اصبحت اشهدك واشهد حمله عرشك وملايكتك وجميع خلقك انك انت الله لا اله الا انت وحدك لا شريك لك وان محمدا عبدك ورسولك اربع مرات حين يصبح او يمسي', 1, TRUE, 'published'),
  (82, 'hisn-82', 27, 'hisn-al-muslim', 82, 'اللّهُـمَّ ما أَصْبَـَحَ بي مِـنْ نِعْـمَةٍ
أَو بِأَحَـدٍ مِـنْ خَلْـقِك ،
فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ،
فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر', 'Allāhumma mā aṣbaha bī min ni`matin 
aw bi aḥadin min khalqik, 
fa minka waḥdaka lā sharīka lak, 
falaka ‘l-ḥamdu wa lakash-shukr.', 'O Allah, whatever blessing has been received by me or anyone of Your creation 1 
is from You alone, You have no partner. 
All praise is for you and thanks is to You. 2', NULL, 1, NULL, NULL, NULL, 'abu-dawud', '7', '1 When you say this in the evening, you should say: Allāhumma mā ''amsā bī...: "O Allah, as I... enter this evening..."
2 Whoever recites this in the morning, has completed his obligation to thank Allah for that day; and whoever says it in the evening, has completed his obligation for that night. Abu Dawud 4/318, An-Nasa''i ''Amalul-Yawm wal-Laylah (no. 7), Ibn As-Sunni (no. 41), Ibn Hibban (no. 2361). Its chain of transmission is good (Hasan), Ibn Baz, p. 24.', 'Hasan', '84d0115fc19e5a58581aafb194a302f138118241d77ba755ae94142350ec9332', 'اللهم ما اصبح بي من نعمه او باحد من خلقك فمنك وحدك لا شريك لك فلك الحمد ولك الشكر', 1, TRUE, 'published'),
  (83, 'hisn-83', 27, 'hisn-al-muslim', 83, 'اللّهُـمَّ عافِـني في بَدَنـي،
اللّهُـمَّ عافِـني في سَمْـعي،
اللّهُـمَّ عافِـني في بَصَـري،
لا إلهَ إلاّ اللّه أَنْـتَ.
اللّهُـمَّ إِنّـي أَعـوذُبِكَ مِنَ الْكُـفر، وَالفَـقْر،
وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر،
لا إلهَ إلاّ أَنْـتَ.
(ثلاث مرات)', 'Allāhumma `āfinī fī badanī, 
Allāhumma `āfinī fī sam`ī, 
Allāhumma `āfinī fī baṣarī, 
lā ilāha illā ant. 
Allāhumma innī a`ūdhu bika mina ‘l-kufri, wa ‘l-faqr, 
wa a`ūdhu bika min `adhābi ‘l-qabr, 
lā ilāha illā ant.', 'O Allah, make me healthy in my body.
O Allah, preserve for me my hearing.
O Allah, preserve for me my sight.
There is none worthy of worship but You. 
O Allah, I seek refuge in You from disbelief and poverty,
and I seek refuge in You from the punishment of the grave. 
There is none worthy of worship but You
(Recite three times in Arabic.)', NULL, 3, NULL, NULL, NULL, 'bukhari', '22', 'Abu Dawud 4/324, Ahmad 5/42, An-Nasa''i, ''Amalul-Yawm wal-Laylah (no. 22), 
Ibn As-Sunni (no. 69), Al-Bukhari Al-''Adab Al-Mufrad. Its chain of 
transmission is good (Hasan), Ibn Baz, p. 26.', 'Hasan', '668d01d738798f5a4da27f5b89461218544ddb3e62ef599f880859acf9ebb118', 'اللهم عافني في بدني اللهم عافني في سمعي اللهم عافني في بصري لا اله الا الله انت اللهم اني اعوذبك من الكفر والفقر واعوذ بك من عذاب القبر لا اله الا انت ثلاث مرات', 1, TRUE, 'published'),
  (84, 'hisn-84', 27, 'hisn-al-muslim', 84, 'حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ
وَهُوَ رَبُّ العَرْشِ العَظـيم.(سبع مرات)', 'Ḥasbiyallāhu lā ilāha illā huwa `alayhi tawakkalt,
wa huwa Rabbu ‘l-`Arshi ‘l-''Aẓīm.', 'Allah is sufficient for me. There is none worthy of worship but Him. 
I have placed my trust in Him, He is Lord of the Majestic Throne.
(Recite seven times in Arabic.)', NULL, 7, NULL, NULL, NULL, NULL, '71', 'Allah will grant whoever recites this seven times in the morning or evening 
whatever he desires from this world or the next, Ibn As-Sunni (no. 71), Abu 
Dawud 4/321. Both reports are attributed directly to the Prophet j§ 
(Marfu1). The chain of transmission is sound (Sahih). Ibn As-Sunni.', 'Sahih', '527df05fefa709489047fc30e285cc61fa749aed79cbb820476d4a59b6a64e3e', 'حسبي الله لا اله الا هو عليه توكلت وهو رب العرش العظيم سبع مرات', 1, TRUE, 'published'),
  (85, 'hisn-85', 27, 'hisn-al-muslim', 85, 'اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ
في الدُّنْـيا وَالآخِـرَة ،
اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ
في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ،
اللّهُـمَّ اسْتُـرْ عـوْراتي
وَآمِـنْ رَوْعاتـي ،
اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي
وَعَن يَمـيني وَعَن شِمـالي ،
وَمِن فَوْقـي ،
وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي', 'Allāhumma innī as''aluka ''l-`afwa wal-`āfiyah
fid-dunyā wal-ākhirah,
Allāhumma innī as''aluka ''l-`afwa wal-`āfiyah 
fī dīnī wa dunyāya, wa ahlī, wa mālī,
Allāhummastur `awrātī, 
wa āmin raw`ātī,
Allāhummaḥfaẓnī min bayni yadayya, wa min khalfī,
wa `an yamīnī, wa `an shimālī, 
wa min fawqī,
wa a`ūdhu bi`aẓamatika an ''ughtāla min taḥtī.', 'O Allah, I seek Your forgiveness and Your protection in this world and the next. 
O Allah, I seek Your forgiveness and Your protection in my religion, in my worldly affairs, in my family and in my wealth. 
O Allah, conceal my secrets and preserve me from anguish. 
O Allah, guard me from what is in front of me and behind me, 
from my left, and from my right, and from above me. 
I seek refuge in Your Greatness from being struck down from beneath me.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Sahih Ibn Majah 2/332 and Abu Dawud.', 'Sahih', 'f168f8bcd5cfb0f50071885cad998537d6e56a5d93938d2fdfa9cd0d4990b600', 'اللهم اني اسالك العفو والعافيه في الدنيا والاخره اللهم اني اسالك العفو والعافيه في ديني ودنياي واهلي ومالي اللهم استر عوراتي وامن روعاتي اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي واعوذ بعظمتك ان اغتال من تحتي', 1, TRUE, 'published'),
  (86, 'hisn-86', 27, 'hisn-al-muslim', 86, 'اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ
فاطِـرَ السّماواتِ وَالأرْضِ
رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ،
أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ،
أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي
وَمِن شَـرِّ الشَّيْـطانِ وَشِـرْكِه ،
وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً
أَوْ أَجُـرَّهُ إِلـى مُسْـلِم', 'Allāhumma `ālima ‘l-ghaybi wash-shahādah 
fātir as-samāwāti wa ‘l''arḍ,
Rabba kulli shay''in wa malīkah, 
ash-hadu an lā ilāha illā ant,
a`ūdhu bika min sharri nafsī, 
wa min sharrish-shayṭāni wa shirkih, 
wa an aqtarifa `alā nafsī sū''an, aw ajurrahu ilā Muslim.', 'O Allah, Knower of the unseen and the evident,
Maker of the heavens and the earth, 
Lord of everything and its Possessor, 
I bear witness that there is none worthy of worship but You. 
I seek refuge in You from the evil of my soul, 
and from the evil of Satan and his helpers.
(I seek refuge in You) from bringing evil upon my soul and from harming any Muslim.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Sahih At-Tirmidhi 3/142 and AbuDawud.', 'Sahih', 'ac26a11011e3edbb00fadb15f95af9bf91762044bc99563635502842b84cfd81', 'اللهم عالم الغيب والشهاده فاطر السماوات والارض رب كل شيء ومليكه اشهد ان لا اله الا انت اعوذ بك من شر نفسي ومن شر الشيطان وشركه وان اقترف علي نفسي سوءا او اجره الي مسلم', 1, TRUE, 'published'),
  (87, 'hisn-87', 27, 'hisn-al-muslim', 87, 'بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ
شَيءٌ في الأرْضِ وَلا في السّمـاءِ
وَهـوَ السّمـيعُ العَلـيم . (ثلاث مرات)', 'Bismillāhi ‘l-ladhī lā yaḍurru ma`a-smihi 
shay''un fil-''arḍi wa lā fis-samā'' 
wa huwas-Samī `ul-`Alīm.', 'In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, 
and He is the All-Hearing, the All-Knowing. (Recite three times in Arabic).', NULL, 3, NULL, NULL, NULL, 'tirmidhi', NULL, '"Whoever recites it three times in the morning will not be afflicted by any 
calamity before evening, and whoever recites it three times in the evening 
will not be overtaken by any calamity before morning." Abu Dawud 4/323, 
At-Tirmidhi 5/465, Ibn Majah 2/332, Ahmad. Ibn Majah''s chain of 
transmission is good (Hasan), Ibn Baz, p. 39.', 'Hasan', '76768e69d26919a37471b0661cf79dd550a647ad01a920472a628d5283465d91', 'بسم الله الذي لا يضر مع اسمه شيء في الارض ولا في السماء وهو السميع العليم ثلاث مرات', 1, TRUE, 'published'),
  (88, 'hisn-88', 27, 'hisn-al-muslim', 88, 'رَضيـتُ بِاللهِ رَبَّـاً
وَبِالإسْلامِ ديـناً
وَبِمُحَـمَّدٍ نَبِيّـاً .
(ثلاث مرات)', 'Raḍītu billāhi Rabba, 
wa bil-Islāmi dīna, 
wa bi-Muḥammadin (ṣallallāhu `alayhi wa sallama) nabiyya.', 'I am pleased with Allah as my Lord, 
with Islam as my religion, 
and with Muhammad (peace and blessings of Allah be upon him) as my Prophet. 
(Recite three times in Arabic.)', NULL, 3, NULL, NULL, NULL, 'tirmidhi', '68', '"Allah has promised that anyone who says this three times every morning or 
evening will be pleased on the Day of Resurrection." Ahmad 4/ 337, 
An-Nasa''i, ''Amalul-Yawm wal-Laylah p. 4, Ibn As-Sunni (no. 68), At-Tirmidhi 
5/465. Its chain of transmission is good (Hasan), Ibn Baz, p. 39.', 'Hasan', '7526dbf2e665365063b1f24758766f262b3d9eaa00d9437f795de41a6e038dd8', 'رضيت بالله ربا وبالاسلام دينا وبمحمد نبيا ثلاث مرات', 1, TRUE, 'published'),
  (89, 'hisn-89', 27, 'hisn-al-muslim', 89, 'يا حَـيُّ يا قَيّـومُ بِـرَحْمَـتِكِ أَسْتَـغـيث ،
أَصْلِـحْ لي شَـأْنـي كُلَّـه ،
وَلا تَكِلـني إِلى نَفْـسي طَـرْفَةَ عَـين', 'Yā Ḥayyu yā Qayyūmu biraḥmatika astaghīth 
aṣlih lī sha''nī kullah
wa lā takilnī ilā nafsī ṭarfata `ayn.', 'O Ever-Living One, O Eternal One, by Your mercy I call on You to set right all my affairs. 
Do not place me in charge of my soul even for the blinking of an eye (i.e. a moment).', NULL, 1, NULL, NULL, NULL, 'al-hakim', NULL, 'Its chain of transmission is sound (Sahih), Al-Hakim 1/545, see Albani, 
Sahihut-Targhib wat-Tarhib, 1/273.', 'Sahih', 'ebbd6ab2aad40f33c946b72902f868b5558569836f75f87be0fec3962f9843fd', 'يا حي يا قيوم برحمتك استغيث اصلح لي شاني كله ولا تكلني الي نفسي طرفه عين', 1, TRUE, 'published'),
  (90, 'hisn-90', 27, 'hisn-al-muslim', 90, 'أَصْبَـحْـنا وَأَصْبَـحْ المُـلكُ للهِ رَبِّ العـالَمـين ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ خَـيْرَ هـذا الـيَوْم ،
فَـتْحَهُ ، وَنَصْـرَهُ ، وَنـورَهُ وَبَـرَكَتَـهُ ، وَهُـداهُ ،
وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهِ وَشَـرِّ ما بَعْـدَه
وإذا أمسى قال:
أَمْسَيْـنا وَأَمْسـى المُـلكُ للهِ رَبِّ العـالَمـين ،
اللّهُـمَّ إِنِّـي أسْـأَلُـكَ خَـيْرَ هـذهِ اللَّـيْلَة ،
فَتْحَهـا ، وَنَصْـرَهـا ، وَنـورَهـا وَبَـرَكَتَـهـا ، وَهُـداهـا ،
وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهـاِ وَشَـرِّ ما بَعْـدَهـا', 'Aṣbaḥnā wa aṣbaḥal-mulku lillāhi Rabbi ‘l-a`lāmīn, 
Allāhumma innī as''aluka khayra hādha ‘l-yawm: 
Fat’ḥahu wa naṣrahu wa nūrahu, 
wa barakatahu, wa hudāh, 
wa a`ūdhu bika min sharri mā fīhi 
wa sharri mā ba`dah.', 'We have entered a new day and with it all the dominion which belongs to Allah, Lord of all that exists. 
O Allah, I ask You for the goodness of this day,2 
its victory, its help, its light, 
its blessings, and its guidance.
I seek refuge in You from the evil that is in it,
and from the evil that follows it.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, '1 For evening recitation, say here: Allāhumma innī as''aluka khayra 
hāthihil-laylah: "My Lord, I ask You for the good things of this night."
2 Abu Dawud 4/322. Its transmission chain is good (Hasan). See also Ibn 
Al-Qayyim, Zadul- Ma''ad 2/273.', 'Hasan', '0dc2938dbbb8386b02ade8d38af343332490baf693662e0375979eab2a147205', 'اصبحنا واصبح الملك لله رب العالمين اللهم اني اسالك خير هذا اليوم فتحه ونصره ونوره وبركته وهداه واعوذ بك من شر ما فيه وشر ما بعده واذا امسي قال امسينا وامسي الملك لله رب العالمين اللهم اني اسالك خير هذه الليله فتحها ونصرها ونورها وبركتها وهداها واعوذ بك من شر ما فيها وشر ما بعدها', 1, TRUE, 'published'),
  (91, 'hisn-91', 27, 'hisn-al-muslim', 91, 'أَصْـبَحْنا[أَمْسَـينا] علـى فِطْـرَةِ الإسْلام،
وَعَلـى كَلِـمَةِ الإخْـلاص،
وَعلـى دينِ نَبِـيِّنا مُحَـمَّدٍ
وَعَلـى مِلَّـةِ أبينـا إِبْـراهيـمَ
حَنيـفاً مُسْلِـماً
وَمـا كـانَ مِنَ المُشـرِكيـن', 'Aṣbahnā `alā fiṭrati ‘l-Islām, 
wa `alā kalimati ‘l-ikhlās, 
wa `alā dīni nabiyyinā Muḥammadin (ṣallallāhu `alayhi wa sallam), 
wa `alā millati abīnā Ibrāhīm, 
ḥanīfan Musliman 
wa mā kāna mina ‘l-mushrikīn.', 'We have entered a new day 1 upon the natural religion of Islam, 
the word of sincere devotion, 
the religion of our Prophet Muhammad (peace and blessings of Allah be upon him), 
and the faith of our father Ibrahim. 
He was upright (in worshipping Allah), and a Muslim. 
He was not of those who worship others besides Allah. 2', NULL, 1, NULL, NULL, NULL, 'tirmidhi', '34', '1 When you say this in the evening, you should say: ''Amsaynā `alā fiṭratil-Islām...: "We end this day..."
2 Ahmad 3/406-7, 5/123, An-Nasa''i, ''Amalul- Yawm wal-Laylah (no. 34), 
At-Tirmidhi 4/209.', NULL, '29e148c0530e7924262b5a1dd40700b1e3104944e29dcae0a461b35bc4876f55', 'اصبحنا امسينا علي فطره الاسلام وعلي كلمه الاخلاص وعلي دين نبينا محمد وعلي مله ابينا ابراهيم حنيفا مسلما وما كان من المشركين', 1, TRUE, 'published'),
  (92, 'hisn-92', 27, 'hisn-al-muslim', 92, 'سُبْحـانَ اللهِ وَبِحَمْـدِهِ . (مائة مرة)', 'Subḥānallāhi wa biḥamdih.', 'Glory is to Allah and praise is to Him. 
(Recite one hundred times in Arabic).', NULL, 100, NULL, NULL, NULL, 'bukhari', NULL, '"Whoever recites this one hundred times in the morning and in the evening 
will not be surpassed on the Day of Resurrection by anyone having done 
better than this except for someone who had recited it more. " Al-Bukhari 
4/2071.', NULL, '11c60e29851fdd492d3e9fe94c051a100f2a7fffdedb679952365a0ff317da4c', 'سبحان الله وبحمده مايه مره', 1, TRUE, 'published'),
  (93, 'hisn-93', 27, 'hisn-al-muslim', 93, 'لا إلهَ إلاّ اللّهُ وحْـدَهُ لا شَـريكَ لهُ،
لهُ المُـلْكُ ولهُ الحَمْـد،
وهُوَ على كُلّ شَيءٍ قَدير .
(عشر مرات أَوْ مرَّةً واحدةً عندَ الكَسَلِ)', 'Lā ilāha illallāhu waḥdahu lā sharīka lah, 
lahu ‘l-mulku walahu ‘l-ḥamd, 
wa huwa `alā kulli shay''in qadīr.', 'None has the right to be worshipped but Allah alone, Who has no partner. 
His is the dominion and His is the praise and He is Able to do all things. 
(Recite ten times 1 in Arabic or one time to ward off laziness.) 2', NULL, 10, NULL, NULL, NULL, 'abu-dawud', '24', '1Allah will write ten Hasanaat (rewards) for whoever recites this ten times 
in the morning, and forgive him ten misdeeds and give him the reward of 
freeing ten slaves and protect him from Satan. Whoever recites this ten 
times in the evening will get this same reward. An-Nasa''i, ''Amalul-Yawm 
wal-Laylah (no. 24). Its chain of transmission is sound (Sahih). Albani 
1/272. Abu Hurayrah «fe narrated that the Prophet j§ said: "Allah will 
write one hundred Hasanat for whoever says There is no God but Allah alone, 
He has no partner. To Allah is possession of everything, and to Him all 
praise is. He is Capable of all things'' ten times in the morning, and 
forgive him one hundred misdeeds. He will have the reward of freeing a 
slave and will be protected from Satan throughout the day unto dusk. 
Whoever says it in the evening will have the same reward." Ahmad 8/704, 
16/293. Its chain of transmission is good (Hasan), Ibn Baz, p. 44.
2 Whoever recites this in the morning, will have the reward of freeing a 
slave from the Children of Isma''il. Ten Hasanaat (rewards) will be written 
for him, and he will be forgiven ten misdeeds, raised up ten degrees, and 
be protected from Satan until evening. Whoever says it in the evening will 
have the same reward until morning. Abu Dawud 4/319, 3/957, Ahmad 4/ 60, 
Ibn Majah 2/331, Ibn Al-Qayyim Zadul-Ma''ad 2/388. Its chain of transmission 
is sound (Sahih). Al-Albani 1/270.', 'Sahih', '7e435eba2ac599b4d8d3aca67d72db9040aa6f92e93d8214460881296cb17121', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير عشر مرات او مره واحده عند الكسل', 1, TRUE, 'published'),
  (94, 'hisn-94', 27, 'hisn-al-muslim', 94, 'لا إلهَ إلاّ اللّهُ وحْـدَهُ لا شَـريكَ لهُ،
لهُ المُـلْكُ ولهُ الحَمْـد،
وهُوَ على كُلّ شَيءٍ قَدير .
(مائة مرة إذا أصبح)', 'Lā ilāha illallāhu waḥdahu lā sharīka lah, 
lahu ‘l-mulku walahu ‘l-ḥamd, 
wa huwa `alā kulli shay''in qadīr.', 'None has the right to be worshipped but Allah alone, Who has no partner. 
His is the dominion and His is the praise and He is Able to do all things. 
(Recite 100 times in Arabic upon rising in the morning).', NULL, 100, NULL, NULL, NULL, 'bukhari', NULL, 'Whoever recites this one hundred times a day will have the reward of 
freeing ten slaves. One hundred Hasanaat (rewards) will be written for him 
and one hundred misdeeds will be washed away. He will be shielded from 
Satan until the evening. No one will be able to present anything better 
than this except for someone who has recited more than this. Al-Bukhari 
4/95, Muslim 4/2071.', 'Hasan', 'd79e40a60a910cded6dfc8af18b45a7f8876c049824fbeaf8f154715aea2d90f', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير مايه مره اذا اصبح', 1, TRUE, 'published'),
  (95, 'hisn-95', 27, 'hisn-al-muslim', 95, 'سُبْحـانَ اللهِ وَبِحَمْـدِهِ
عَدَدَ خَلْـقِه ،
وَرِضـا نَفْسِـه ،
وَزِنَـةَ عَـرْشِـه ،
وَمِـدادَ كَلِمـاتِـه .
(ثلاث مرات إذا أصبح)', 'Subḥānallāhi wa biḥamdih: 
`adada khalqih, 
wa riḍā nafsih, 
wa zinata `arshih, 
wa midāda kalimātih.', 'Glory is to Allah and praise is to Him, 
by the multitude of His creation, 
by His Pleasure, 
by the weight of His Throne, 
and by the extent of His Words. 
(Recite three times in Arabic upon rising in the morning.)', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2090.', NULL, '1bf6f8d15f265a23652b18d4754bedd7e1cf980cd0c525ea5407de1b21481223', 'سبحان الله وبحمده عدد خلقه ورضا نفسه وزنه عرشه ومداد كلماته ثلاث مرات اذا اصبح', 1, TRUE, 'published'),
  (96, 'hisn-96', 27, 'hisn-al-muslim', 96, 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً،
وَرِزْقاً طَيِّباً،
وَعَمَلاً مُتَقَبَّلاً
(إذا أصبحَ)', 'Allāhumma innī as''aluka `ilman nāfi`a, 
wa rizqan ṭayyiba, 
wa `amalan mutaqabbala.', 'O Allah, I ask You for knowledge that is of benefit, 
a good provision, 
and deeds that will be accepted. 
(Recite in Arabic upon rising in the morning.)', NULL, 1, NULL, NULL, NULL, 'ibn-majah', '54', 'Ibn As-Sunni, no. 54, Ibn Majah no. 925. Its chain of transmission is good 
(Hasan), Ibn Al-Qayyim 2/375.', 'Hasan', '5e2e1399c2ac418621eb00605ec9dd78d4f135b6e7339ddf0e1c39efc5c412a2', 'اللهم اني اسالك علما نافعا ورزقا طيبا وعملا متقبلا اذا اصبح', 1, TRUE, 'published'),
  (97, 'hisn-97', 27, 'hisn-al-muslim', 97, 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ
(مِائَةَ مَرَّةٍ فِي الْيَوْمِ)', 'Astaghfirullāha wa atūbu ilayh.', 'I seek the forgiveness of Allah and repent to Him. (Recite one hundred times in Arabic during the day.)', NULL, 100, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/101, Muslim 4/2075.', NULL, '95a74c26b717ed1ec91c5fa8984b874811ce4470f4b45b7c04f0d996e94d2f58', 'استغفر الله واتوب اليه مايه مره في اليوم', 1, TRUE, 'published'),
  (98, 'hisn-98', 27, 'hisn-al-muslim', 98, 'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق
(ثلاث مرات إِذا أمسى)', 'A`ūdhu bikalimāti-llāhit-tāmmāti min sharri mā khalaq.', 'I seek refuge in the Perfect Words of Allah from the evil of what He has created. 
(Recite three times in Arabic in the evening.)', NULL, 3, NULL, NULL, NULL, 'tirmidhi', '590', 'Whoever recites this three times in the evening will be protected from 
insect stings, Ahmad 2/ 290, An-Nasa''i, ''Amalul-Yawm wal-Laylah no. 590, 
At-Tirmidhi 3/187, Ibn As-Sunni no. 68. According to Al-Albani, Ibn Majah''s 
(2/266) chain of transmission is sound (Sahih), and following Ibn Baz 45, 
At-Tirmidhi''s report is good (Hasan).', 'Sahih', 'a50753de941f37971cea65e3f48100a39f6d705b811c562618cc8a550479d740', 'اعوذ بكلمات الله التامات من شر ما خلق ثلاث مرات اذا امسي', 1, TRUE, 'published'),
  (99, 'hisn-99', 27, 'hisn-al-muslim', 99, 'اللَّهُمَّ صَلِّ وَ سَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ
(عشر مرات)', 'Allāhumma ṣalli wa sallim `alā nabiyyinā Muḥammad.', 'O Allah, we ask for your peace and blessings upon our Prophet Muhammad. 
(Recite ten times in Arabic.)', NULL, 10, NULL, NULL, NULL, NULL, NULL, 'The Prophet (ﷺ) said: "Who recites blessings upon me ten times in the 
morning and ten times in the evening will obtain my intercession on the Day 
of Resurrection." At-Tabarani reported this Hadith together with two chains 
of transmission. One of them is reliable (Jayyid). See Haythami''s 
Majma''uz-Zawa''id 10/120, and Al-Albani''s Sahihut-Targhib wat-Tarhib 1/273.', 'Sahih', '1342d8299f340d00b536b16207441e329d59b5a68a5606871f0da328a9913378', 'اللهم صل و سلم علي نبينا محمد عشر مرات', 1, TRUE, 'published'),
  (100, 'hisn-100', 28, 'hisn-al-muslim', 100, 'يَجْمَعُ كَفَّيْهِ ثُمَّ يَنْفُثُ فِيهِمَا فَيَقْرَأُ فِيهِمَا: بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ هُوَ اللَّهُ أَحَدٌ *
اللَّهُ الصَّمَدُ*
لَمْ يَلِدْ وَلَمْ يُولَدْ*
وَلَمْ يَكُن لَّهُ كُفُواً أَحَدٌ}.
بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ*
مِن شَرِّ مَا خَلَقَ*
وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ*
وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ*
وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ}.
بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
{قُلْ أَعُوذُ بِرَبِّ النَّاسِ*
مَلِكِ النَّاسِ*
إِلَهِ النَّاسِ*
مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ*
الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ*
مِنَ الْجِنَّةِ وَالنَّاسِ}
ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ يَبْدَأُ بِهِمَا عَلَى رَأْسِهِ وَوَجْهِهِ وَمَا أَقبَلَ مِنْ جَسَدِهِ (يفعلُ ذلك ثلاثَ مرَّاتٍ)', NULL, 'Bismillāhir-Raḥmānir-Raḥīm.
Qul huwallāhu aḥad.
Allāhuṣ-ṣamad.
Lam yalid wa lam yūlad.
Wa lam yakun lahu kufuwan aḥad.', NULL, 3, NULL, 112, '1-4', 'bukhari', NULL, 'Al-Ikhlas 112:1-4.

Bismillāhir-Raḥmānir-Raḥīm.
Qul a`ūdhu birabbil-falaq.
Min sharri mā khalaq.
Wa min sharri ghāsiqin idhā waqab.
Wa min sharrin-naffāthāti fil-`uqad.
Wa min sharri ḥāsidin idhā ḥasad.
Reference: Al-Falaq 113:1-5.

Bismillāhir-Raḥmānir-Raḥīm.
Qul a`ūdhu birabbin-nās.
Malikin-nās.
''Ilāhin-nās.
Min sharri ‘l-waswāsil-khannās.
Alladhī yuwaswisu fī ṣudūrin-nās.
Minal-jinnati wannās.
Reference: An-Nas 114:1-6

Hold the palms together, blow (with a little spittle) into them, and recite: 

"With the Name of Allah, the Most Gracious, the Most Merciful.
Say: He is Allah (the) One.
The Self-Sufficient Master, Whom all creatures need,
He begets not nor was He begotten,
and there is none equal to Him.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: I seek refuge with (Allah) the Lord of the daybreak,
from the evil of what He has created,
and from the evil of the darkening (night) as it comes with its darkness,
and from the evil of those who practice witchcraft when they blow in the knots,
and from the evil of the envier when he envies.

With the Name of Allah, the Most Gracious, the Most Merciful.
Say: I seek refuge with (Allah) the Lord of mankind,
the King of mankind,
the God of mankind,
from the evil of the whisperer who withdraws,
who whispers in the breasts of mankind,
of jinns and men."

(Then pass your hands over as much of your body as you can reach, beginning with the head and the face, then the entire front of your body. Do this three times.)

Reference:
Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 9/62, and Muslim 4/ 1723.', NULL, 'f8223b9dd90b468bc03cf60bac2dfe8c0dc2b998de107a14efa9421837f12b1a', 'يجمع كفيه ثم ينفث فيهما فيقرا فيهما بسم الله الرحمن الرحيم قل هو الله احد الله الصمد لم يلد ولم يولد ولم يكن له كفوا احد بسم الله الرحمن الرحيم قل اعوذ برب الفلق من شر ما خلق ومن شر غاسق اذا وقب ومن شر النفاثات في العقد ومن شر حاسد اذا حسد بسم الله الرحمن الرحيم قل اعوذ برب الناس ملك الناس اله الناس من شر الوسواس الخناس الذي يوسوس في صدور الناس من الجنه والناس ثم يمسح بهما ما استطاع من جسده يبدا بهما علي راسه ووجهه وما اقبل من جسده يفعل ذلك ثلاث مرات', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (101, 'hisn-101', 28, 'hisn-al-muslim', 101, '((اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ
لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ
لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ
مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ
يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ
وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء
وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالأَرْضَ
وَلاَ يَؤُودُهُ حِفْظُهُمَا
وَهُوَ الْعَلِيُّ الْعَظِيمُ))', 'Allāhu lā ilāha illā huwa ‘l-Ḥayyul-Qayyūm,
lā ta''khudhuhu sinatun wa lā nawm,
lahu mā fis-samāwāti wa māfil-ardh,
man dhal-ladhī yashfa`u `indahu illā bi''idhnih,
ya`lamu mā bayna aydīhim wa mā khalfahum,
wa lā yuḥītūna bishay''im-min `ilmihi illā bimā shā'',
wasi`a kursiyyuhus-samāwāti wal-ardh,
wa lā ya''ūduhu hifẓuhumā,
wa huwal-`Aliyyu‘l-`Aẓīm.', 'Allah! There is none worthy of worship but He, the Ever-Living, the One Who sustains and protects all that exists.
Neither slumber nor sleep overtakes Him.
To Him belongs whatever is in the heavens and whatever is on the earth.
Who is he that can intercede with Him except with His Permission?
He knows what happens to them in this world, and what will happen to them in the Hereafter.
And they will never encompass anything of His Knowledge except that which He wills.
His Throne extends over the heavens and the earth,
and He feels no fatigue in guarding and preserving them.
And He is the Most High, the Most Great.', NULL, 1, NULL, 2, '255', 'bukhari', NULL, 'Al-Baqarah 2:255. Whoever reads this when he lies down to sleep will have a 
guardian from Allah remain with him and Satan will not be able to come near 
him until he rises in the morning. See Al-Bukhari, cf. Al-Asqalani, 
Fathul-Bari 4/487.', NULL, 'c82112ffa03cfa9166d4b0dd5226c59724d497dc27f330648a6840b9a2fdeb8c', 'الله لا اله الا هو الحي القيوم لا تاخذه سنه ولا نوم له ما في السموات وما في الارض من ذا الذي يشفع عنده الا باذنه يعلم ما بين ايديهم وما خلفهم ولا يحيطون بشيء من علمه الا بما شاء وسع كرسيه السموات والارض ولا يووده حفظهما وهو العلي العظيم', 1, TRUE, 'published'),
  (102, 'hisn-102', 28, 'hisn-al-muslim', 102, '((ءامَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ
كُلٌّ ءامَنَ بِاللهِ وَمَلآئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ
لاَ نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ
وَقَالُواْ سَمِعْنَا وَأَطَعْنَا
غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ {285}
لاَ يُكَلِّفُ اللهُ نَفْسًا إِلاَّ وُسْعَهَا
لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ
رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا
رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا
رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ
وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ
أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ {286}))', 'Āmanar-Rasūlu bimā unzila ilaihi mir-Rabbihi wa ‘l-mu''minūn, 
kullun āmana billāhi wa malā''ikatihi wa kutubihi wa rusulih, 
lā nufarriqu bayna aḥadim-mir-rusulih, 
wa qālū sami`nā wa aṭa`nā,
ghufrānaka Rabbanā wa ilayka ‘l-maṣīr. 
Lā yukallifu ‘llāhu nafsan illā wus`ahā, 
lahā mā kasabat wa `alayhā mak-tasabat, 
Rabbanā lā tu''ākhidhnā in nasīnā aw akhta''nā, 
Rabbanā wa lā taḥmil `alaynā iṣran kamā ḥamaltahu `alal-ladhīna min qablinā, 
Rabbanā wa lā tuḥammilnā mā lā ṭāqata lanā bih, 
wa`fu `annā, waghfir lanā, warḥamnā, 
Anta mawlānā fanṣurnā `ala ‘l-qawmi ‘l-kāfirīn.', 'The Messenger believes in what has been sent down to him from his Lord, and so do the believers. 
Each one believes in Allah, His Angels, His Books, and His Messengers. 
They say: "We make no distinction between any of His Messengers," 
and they say: "We hear, and we obey. 
(We seek) Your Forgiveness, our Lord, and to You is the return." 
Allah burdens not a person beyond what he can bear. 
He gets rewarded for that (good) which he has earned, and he is punished for that (evil) which he has earned. 
Our Lord! Punish us not if we forget or fall into error. 
Our Lord! Lay not on us a burden like that which You did lay on those before us. 
Our Lord! Put not on us a burden greater than we have the strength to bear. 
Pardon us and grant us forgiveness. Have mercy on us. 
You are our Protector, and help us against the disbelieving people.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Baqarah 2:285-6. These two Verses will be sufficient for anyone who 
recites them at night before sleeping. Al-Bukhari, cf. Al-Asqalani, 
Fathul-Bari.9/94, Muslim 1/554.', NULL, '8ea159f40b4b618d299bc0e8a711deffadcaab2c8e5d2943259d63361bbfafee', 'ءامن الرسول بما انزل اليه من ربه والمومنون كل ءامن بالله وملايكته وكتبه ورسله لا نفرق بين احد من رسله وقالوا سمعنا واطعنا غفرانك ربنا واليك المصير 285 لا يكلف الله نفسا الا وسعها لها ما كسبت وعليها ما اكتسبت ربنا لا تواخذنا ان نسينا او اخطانا ربنا ولا تحمل علينا اصرا كما حملته علي الذين من قبلنا ربنا ولا تحملنا ما لا طاقه لنا به واعف عنا واغفر لنا وارحمنا انت مولانا فانصرنا علي القوم الكافرين 286', 1, TRUE, 'published'),
  (103, 'hisn-103', 28, 'hisn-al-muslim', 103, 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي،
وَبِكَ أَرْفَعُهُ،
فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا،
وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا
بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ', 'Bismika Rabbī waḍa`tu janbī, 
wa bika arfa`uh, 
fa in amsakta nafsī farḥamhā, 
wa in arsaltahā faḥfaẓhā 
bimā taḥfaẓu bihi `ibādakaṣ-ṣāliḥīn.', 'With Your Name1 my Lord, I lay myself down;
and with Your Name I rise. 
And if You take my soul, have mercy on it,
and if You send it back then 
protect it as You protect Your righteous slaves.2', NULL, 3, NULL, NULL, NULL, 'bukhari', NULL, '1 "If any of you rises from his bed and later returns to it, let him dust 
off his bed with his waist garment three times and mention the Name of 
Allah, for he does not know what may have entered the bed after him, and 
when he lies down he should say. . . ".
2 Al-Bukhari 1 1/ 126 and Muslim 4/2084.', NULL, '0720beed9b8557514674a090bd4b251201b7c849b4539fa0f475c9c9a59d85ed', 'باسمك ربي وضعت جنبي وبك ارفعه فان امسكت نفسي فارحمها وان ارسلتها فاحفظها بما تحفظ به عبادك الصالحين', 1, TRUE, 'published'),
  (104, 'hisn-104', 28, 'hisn-al-muslim', 104, 'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي
وَأَنْتَ تَوَفَّاهَا،
لَكَ مَمَاتُهَا وَمَحْياهَا،
إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا،
وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا.
اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ', 'Allāhumma innaka khalaqta nafsī
wa anta tawaffāhā, 
laka mamātuhā wa maḥyāhā, 
in aḥyaytahā faḥfaẓhā, 
wa in amattahā faghfir lahā.
Allāhumma innī as''aluka ‘l-`āfiyah.', 'O Allah, You have created my soul
and You take it back. 
Unto You is its death and its life. 
If You give it life then protect it, 
and if You cause it to die then forgive it.
O Allah, I ask You for strength.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2083 and Ahmad 2/79.', NULL, '8e98acbbf00143e6c690e73c14ebb2288432f9d821ee9eec5c1cd632d1e0e5f7', 'اللهم انك خلقت نفسي وانت توفاها لك مماتها ومحياها ان احييتها فاحفظها وان امتها فاغفر لها اللهم اني اسالك العافيه', 1, TRUE, 'published'),
  (105, 'hisn-105', 28, 'hisn-al-muslim', 105, 'اللّهُـمَّ قِنـي عَذابَـكَ يَـوْمَ تَبْـعَثُ عِبـادَك .', 'Allāhumma qinī `adhābaka yawma tab`athu `ibādak.', 'O Allah,1 save me from Your punishment on the Day that You resurrect Your slaves.2', NULL, 3, NULL, NULL, NULL, 'tirmidhi', NULL, '1 "When the Prophet (ﷺ) wanted to lie down to sleep, he used to place his 
right hand under his cheek and say..."
2 Abu Dawud 4/311. See also Al-Albani, Sahih At-Tirmidhi 3/143.', 'Sahih', '9e2465b3f1b81d08cc3982e79b1618510d2c7a447228defcd2e1844ebd07ce18', 'اللهم قني عذابك يوم تبعث عبادك', 1, TRUE, 'published'),
  (106, 'hisn-106', 28, 'hisn-al-muslim', 106, 'بِاسْـمِكَ اللّهُـمَّ أَمـوتُ وَأَحْـيا', 'Bismika Allāhumma amūtu wa aḥyā.', 'In Your Name, O Allah, I die and I live.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Here, dying and living are metaphors for sleep and wakefulness. This 
explains why the normal order of these words has been reversed in this 
Hadith. In other contexts the living is mentioned before dying. See Qur''an 
Al-Baqarah 2:258, Aal-''Imrdn 3:156, Al-A''raf 7:158 among many other 
examples, (trans.). See also Al-Asqalani, Fathul-Bari 11/113, Muslim 4/ 
2083.', NULL, '5932adb623b5ffff57f3ed2d3638c6ffcb22ed81d1e232dadce0f07c02542a65', 'باسمك اللهم اموت واحيا', 1, TRUE, 'published'),
  (107, 'hisn-107', 28, 'hisn-al-muslim', 107, 'سُبْحَانَ اللَّهِ (ثلاثاً وثلاثين)
وَالْحَمْدُ لِلَّهِ (ثلاثاً وثلاثين)
وَاللَّهُ أَكْبَرُ (أربعاً وثلاثينَ)', 'Subḥānallāh, 
Wa ‘l-ḥamdu lillāh, 
Wallāhu Akbar.', 'Glory is to Allah (thirty-three times in Arabic), 
Praise is to Allah (thirty-three times),
Allah is the Most Great (thirty-four times)', NULL, 33, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 7/71, Muslim 4/2091.', NULL, '191f2a93b9c458bfcf0ea531bb40bea8e9066eaaa4eae69bf239668c3e07b548', 'سبحان الله ثلاثا وثلاثين والحمد لله ثلاثا وثلاثين والله اكبر اربعا وثلاثين', 1, TRUE, 'published'),
  (108, 'hisn-108', 28, 'hisn-al-muslim', 108, 'اللّهُـمَّ رَبَّ السّمـواتِ السَّبْـعِ وَرَبَّ العَـرْشِ العَظـيم
رَبَّنـا وَرَبَّ كُـلِّ شَـيء
فالِـقَ الحَـبِّ وَالنَّـوى
وَمُـنَزِّلَ التَّـوْراةِ وَالإنْجـيل والفُـرْقان
أَعـوذُ بِـكَ مِن شَـرِّ كُـلِّ شَـيءٍ أَنْـتَ آخِـذٌ بِنـاصِـيَتِه
اللّهُـمَّ أَنْـتَ الأوَّلُ فَلَـيسَ قَبْـلَكَ شَيء
وَأَنْـتَ الآخِـرُ فَلَـيسَ بَعْـدَكَ شَيء
وَأَنْـتَ الظّـاهِـرُ فَلَـيْسَ فَـوْقَـكَ شَيء
وَأَنْـتَ الْبـاطِـنُ فَلَـيْسَ دونَـكَ شَيء
اقـْضِ عَنّـا الـدَّيْـنَ
وَأَغْـنِنـا مِنَ الفَـقْر', 'Allāhumma Rabbas-samāwātis-sab`i 
wa Rabba ‘l-`Arshi ‘l-`Aẓīm, 
Rabbanā wa Rabba kulli shay'', 
fāliqa ‘l-ḥabbi wan-nawā, 
wa munzilat-Tawrāti wal-''Injīli, wal-Furqān, 
a`ūdhu bika min sharri kulli shay''in 
anta ākhidhun bināṣiyatih. 
Allāhumma anta ‘l-awwalu falaysa qablaka shay'', 
wa antal-ākhiru falaysa ba`daka shay'', 
wa antaẓ-ẓāhiru falaysa fawqaka shay'', 
wa antal-bāṭinu falaysa dūnaka shay'', 
iqḍi `annad-dayn, 
wa aghninā mina ‘l-faqr.', 'O Allah! Lord of the seven heavens and Lord of the Magnificent Throne. 
Our Lord and the Lord of everything. Splitter of the grain and the date-stone,
Revealer of the Torah and the Injeel1 and the Furqan (the Qur''an),
I seek refuge in You from the evil of everything that You shall seize by the forelock.2 
O Allah You are the First and nothing has come before you, 
and You are the Last, and nothing may come after You. 
You are the Most High, nothing is above You
and You are the Most Near, and nothing is nearer than You.
Remove our debts from us
and enrich us against poverty. 3', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, '1 The Scripture that was revealed to ''Isa (Jesus).
2 See Qur''an Al-''Alaq 96:15, where seizure by the forelock preceeds being 
cast into Hell. (Translator)
3 Muslim 4/2084.', NULL, '6703b8a12e21366a7f1b21597839d6bb12ff5e12e2c0e97346f0c34ecb2a07cb', 'اللهم رب السموات السبع ورب العرش العظيم ربنا ورب كل شيء فالق الحب والنوي ومنزل التوراه والانجيل والفرقان اعوذ بك من شر كل شيء انت اخذ بناصيته اللهم انت الاول فليس قبلك شيء وانت الاخر فليس بعدك شيء وانت الظاهر فليس فوقك شيء وانت الباطن فليس دونك شيء اقض عنا الدين واغننا من الفقر', 1, TRUE, 'published'),
  (109, 'hisn-109', 28, 'hisn-al-muslim', 109, 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا،
وَكَفَانَا، وَآوَانَا،
فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ', 'Alḥamdu lillāhil-lathī ''aṭ`amanā wa saqānā, 
wa kafānā, wa ''āwānā,
fakam mimman lā kāfiya lahu wa lā mu''wī.', 'Praise is to Allah Who has provided us with food and with drink, sufficed us and gave us an abode,
for how many are there with no provision and no home.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2085.', NULL, '9e5d458a94df08bee5271deaa6d43f8d278aed8611dab1b1ec065931652cf34e', 'الحمد لله الذي اطعمنا وسقانا وكفانا واوانا فكم ممن لا كافي له ولا مووي', 1, TRUE, 'published'),
  (110, 'hisn-110', 28, 'hisn-al-muslim', 110, 'اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ
فاطِـرَ السّماواتِ وَالأرْضِ
رَبَّ كـلِّ شَـيءٍ وَمَليـكَه
أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت
أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي
وَمِن شَـرِّ الشَّيْـطانِ وَشِـرْكِه
وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً
أَوْ أَجُـرَّهُ إِلـى مُسْـلِم', 'Allāhumma `ālima ‘l-ghaybi wash-shahādah, 
fātiras-samāwāti wa ‘l-ardh,
Rabba kulli shay''in wa malīkah, 
ash-hadu an lā ilāha illā ant,
a`ūdhu bika min sharri nafsī, 
wa min sharrish-shayṭāni wa shirkih, 
wa an aqtarifa `alā nafsī sū''an, 
aw ajurrahu ilā Muslim.', 'O Allah, Knower of the unseen and the evident, 
Maker of the heavens and the earth, 
Lord of everything and its Master, 
I bear witness that there is none worthy of worship but You. 
I seek refuge in You from the evil of my 
soul,
and from the evil of Satan and his helpers.
(I seek refuge in You) from bringing evil upon my soul
and from harming any Muslim.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 4/317. See also Al-Albani, SahihAt-Tirmidhi 3/142.', 'Sahih', '8db9858768f31721c806ba4e8958b93605e4d6e44b6913e2ff84691308982567', 'اللهم عالم الغيب والشهاده فاطر السماوات والارض رب كل شيء ومليكه اشهد ان لا اله الا انت اعوذ بك من شر نفسي ومن شر الشيطان وشركه وان اقترف علي نفسي سوءا او اجره الي مسلم', 1, TRUE, 'published'),
  (111, 'hisn-111', 28, 'hisn-al-muslim', 111, 'يقرأ ((ألم * تنزيل)) السجدة،
و((تبارك الذي بيده الملك))', '--', 'Recite Surah 32 (As-Sajdah) and Surah 67 (Al-Mulk) in Arabic.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi, An-Nasa''i. See also Al-Albani, Sahihul-Jami '' As-Saghir 4/255', 'Sahih', '928e896dde2c0d300cd8b456e7680cfd10ee8f27cd77613acff77d9e7fd4f0ea', 'يقرا الم تنزيل السجده و تبارك الذي بيده الملك', 1, TRUE, 'published'),
  (112, 'hisn-112', 28, 'hisn-al-muslim', 112, 'اللّهُـمَّ أَسْـلَمْتُ نَفْـسي إِلَـيْكَ،
وَفَوَّضْـتُ أَمْـري إِلَـيْكَ،
وَوَجَّـهْتُ وَجْـهي إِلَـيْكَ،
وَأَلْـجَـاْتُ ظَهـري إِلَـيْكَ،
رَغْبَـةً وَرَهْـبَةً إِلَـيْكَ،
لا مَلْجَـأَ وَلا مَنْـجـا مِنْـكَ إِلاّ إِلَـيْكَ،
آمَنْـتُ بِكِتـابِكَ الّـذي أَنْزَلْـتَ
وَبِنَبِـيِّـكَ الّـذي أَرْسَلْـت', 'Allāhumma aslamtu nafsī ilayk, 
wa fawwaḍtu amrī ilayk, 
wa wajjahtu wajhī ilayk, 
wa alja''tu ẓahrī ilayk, 
raghbatan wa rahbatan ilayk, 
lā malja''a wa la manjā minka illā ilayk, 
āmantu bikitābika ‘l-ladhī anzalt, 
wa bi-nabiyyika ‘l-ladhī arsalt.', 'O Allah,1 I submit myself to You, 
entrust my affairs to You, 
turn my face to You, 
and lay myself down depending upon You,
hoping in You and fearing You. 
There is no refuge, and no escape, except to You.
I believe in Your Book (the Qur''an) that You revealed,
and the Prophet whom You sent.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, '1 "Before you go to bed perform ablutions as you would for prayer, then lie 
down on your right side and say. . . "
The Prophet (ﷺ) said: "Whoever says this and dies in his sleep, has died 
in a state of the natural monotheism (Fitrah)." Al-Bukhari, cf. 
Al-Asqalani, Fathul-Bari 11/113, Muslim 4/2081.', NULL, 'd782c05c4297994b5f0d0ff01f2192e4b22ee5236a9c488894c822be4ed229e1', 'اللهم اسلمت نفسي اليك وفوضت امري اليك ووجهت وجهي اليك والجات ظهري اليك رغبه ورهبه اليك لا ملجا ولا منجا منك الا اليك امنت بكتابك الذي انزلت وبنبيك الذي ارسلت', 1, TRUE, 'published'),
  (113, 'hisn-113', 29, 'hisn-al-muslim', 113, 'لا إِلـهَ إِلاّ اللهُ
الـواحِدُ القَهّـار
رَبُّ السَّـمواتِ وَالأرْضِ وَما بَيْـنَهـما
العَزيـزُ الغَـفّار', 'Lā ilāha illallāh
al-Wāḥidul-Qahhār, 
Rabbus-samāwāti wa ‘l-arḍi wa mā baynahuma 
al-`Azīzul-Ghaffār.', 'There is none worthy of worship but Allah, 
the One, the Victorious, 
Lord of the heavens and the earth and all that is between them, 
the All-Mighty, the All-Forgiving.', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'This is to be said if you turn over in bed during the night. Al-Hakim 
graded it authentic and Ath-Thahabi agreed 1/540. Also see An-Nasa''i, 
''Amalul-Yawm wal-Laylah, and Ibn As-Sunni. See also Al-Albani, 
Sahihul-Jami'' As-Saghir 4/ 213.', 'Sahih', '968f617c79de0c6bbde12a1eebe06114014803670606d49a5568bd2bbc724580', 'لا اله الا الله الواحد القهار رب السموات والارض وما بينهما العزيز الغفار', 1, TRUE, 'published'),
  (114, 'hisn-114', 30, 'hisn-al-muslim', 114, 'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ
مِن غَضَـبِهِ وَعِـقابِهِ وَشَـرِّ عِبـادِهِ
وَمِنْ هَمَـزاتِ الشَّـياطينِ وَأَنْ يَحْضـرون', 'A`ūdhu bikalimāti ‘llāhit-tāmmāti 
min ghaḍabihi wa `iqābihi wa sharri `ibādih,
wa min hamazātish-shayāṭīni wa an yaḥḍurūn.', 'I seek refuge in the Perfect Words of Allah
from His anger and His punishment,
from the evil of His slaves,
and from the taunts of devils and from their presence.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 4/12. See also Al-Albani, Sahih At- Tirmidhi 3/171', 'Sahih', 'b63c491d784f33674abf95c5fc886cf5d49da7c558ff82c28983139cd04ff994', 'اعوذ بكلمات الله التامات من غضبه وعقابه وشر عباده ومن همزات الشياطين وان يحضرون', 1, TRUE, 'published'),
  (115, 'hisn-115', 31, 'hisn-al-muslim', 115, 'يَنْفُثُ عَنْ يَسَارِهِ (ثلاثاً).
يَسْتَعِيذُ بِاللَّهِ مِنَ الشَّيطَانِ وَمِنْ شَرِّ مَا رَأَى (ثَلاَثَ مَرَّاتٍ).
لاَ يُحَدِّثْ بِهَا أَحَداً.
يَــتَحَوَّلُ عَنْ جَنْبِهِ الَّذِي كَانَ عَلَيْهِ.', 'Spit to your left (three times).1', 'Seek refuge in Allah from the Devil and from the evil of what you have seen 
(three times).2

Do not speak about it to anyone.3

Turn over on your other side.4', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, '1. Muslim 4/1 772.
2. Muslim 4/1 772, 3.
3. Muslim 4/1772.
4. Muslim 4/1773.', NULL, '84a3f34db497679f3a9b94ae2004713a4ffffe29d4d9bcb72be863848acb5f2c', 'ينفث عن يساره ثلاثا يستعيذ بالله من الشيطان ومن شر ما راي ثلاث مرات لا يحدث بها احدا يتحول عن جنبه الذي كان عليه', 1, TRUE, 'published'),
  (116, 'hisn-116', 31, 'hisn-al-muslim', 116, 'يقوم يصلي إن أراد ذلك.ويَقُومُ يُصَلِّي إِنْ أَرَادَ ذَلِكَ.', NULL, 'Get up and pray if you desire to do so.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/1773.', NULL, '02f6979fac1220066a639ea7db09376eec92b9b081918d2c15e0a612ea0ef349', 'يقوم يصلي ان اراد ذلك ويقوم يصلي ان اراد ذلك', 1, TRUE, 'published'),
  (117, 'hisn-117', 32, 'hisn-al-muslim', 117, 'اللّهُـمَّ اهْـدِنـي فـيمَنْ هَـدَيْـت،
وَعـافِنـي فـيمَنْ عافَـيْت،
وَتَوَلَّـني فـيمَنْ تَوَلَّـيْت،
وَبارِكْ لـي فـيما أَعْطَـيْت،
وَقِـني شَرَّ ما قَضَـيْت،
فَإِنَّـكَ تَقْـضي وَلا يُقْـضى عَلَـيْك ،
إِنَّـهُ لا يَـذِلُّ مَنْ والَـيْت،
[ وَلا يَعِـزُّ مَن عـادَيْت ]،
تَبـارَكْـتَ رَبَّـنا وَتَعـالَـيْت', 'Allāhumma’hdinī fī man hadayt, 
wa `āfinī fī man `āfayt, 
wa tawallanī fī man tawallayt, 
wa bārik lī fī mā a`atayt, 
wa qinī sharra mā qaḍayt, 
fa innaka taqḍī wa lā yuqḍā `alayk, 
innahu lā yadhillu man wālayt, 
[wa lā ya`izzu man `ādayt] , 
tabārakta Rabbanā wa ta`ālayt.', 'O Allah, guide me with those whom You have guided, 
and strengthen me with those whom You have given strength.
Take me to Your care with those whom You have taken to Your care.
Bless me in what You have given me.
Protect me from the evil You have ordained.
Surely, You command and are not commanded,
and none whom You have committed to Your care shall be humiliated
[and none whom You have taken as an enemy shall taste glory].
You are Blessed, Our Lord, and Exalted.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi, Ahmad, Ad-Darimi, Al-Hakim, 
and Al-Bayhaqi. See also Al-Albani, Sahih At-Tirmidhi 1/144, Sahih Ibn 
Majah 1/194, and ''Irwa''ul-GhaW. 2/ 172.', 'Sahih', 'e04ef0d03457f2d65af57f57a1d1d75b8d2c392b87615cda4933898c9dfea97f', 'اللهم اهدني فيمن هديت وعافني فيمن عافيت وتولني فيمن توليت وبارك لي فيما اعطيت وقني شر ما قضيت فانك تقضي ولا يقضي عليك انه لا يذل من واليت ولا يعز من عاديت تباركت ربنا وتعاليت', 1, TRUE, 'published'),
  (118, 'hisn-118', 32, 'hisn-al-muslim', 118, 'اللّهُـمَّ إِنِّـي أَعـوذُ بِرِضـاكَ مِنْ سَخَطِـك،
وَبِمُعـافاتِـكَ مِنْ عُقوبَـتِك،
وَأَعـوذُ بِكَ مِنْـك،
لا أُحْصـي ثَنـاءً عَلَـيْك،
أَنْـتَ كَمـا أَثْنَـيْتَ عَلـى نَفْسـِك', 'Allāhumma innī a`ūdhu biriḍāka min sakhaṭik, 
wa bimu`āfātika min `uqūbatik, 
wa a`ūdhu bika mink, 
lā uḥṣī thanā''an `alayk,
Anta kamā athnayta `alā nafsik.', 'O Allah, I seek refuge with Your Pleasure from Your anger. 
I seek refuge in Your forgiveness from Your punishment. 
I seek refuge in You from You. 
I cannot count Your praises, 
You are as You have praised Yourself.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, An-Nasa''i, At-Tirmidhi, Ahmad. See Al-Albani, Sahih 
At-Tirmidhi 3/180, Sahih Ibn Majah 1/194, and ''Irwa''ul-Ghalil. 2/ 175.', 'Sahih', '3499394ca787c96222b7a56fe472672af94d506df8cce86339280a6559c5c344', 'اللهم اني اعوذ برضاك من سخطك وبمعافاتك من عقوبتك واعوذ بك منك لا احصي ثناء عليك انت كما اثنيت علي نفسك', 1, TRUE, 'published'),
  (119, 'hisn-119', 32, 'hisn-al-muslim', 119, 'اللّهُـمَّ إِيّـاكَ نعْـبُدْ،
وَلَـكَ نُصَلّـي وَنَسْـجُد،
وَإِلَـيْكَ نَسْـعى وَنَحْـفِد،
نَـرْجو رَحْمَـتَك،
وَنَخْشـى عَـذابَك،
إِنَّ عَـذابَكَ بالكـافرين ملْحَـق.
اللّهُـمَّ إِنّا نَسْتَعـينُكَ
وَنَسْتَـغْفِرُك،
وَنُثْـنـي عَلَـيْك الخَـيْرَ،
وَلا نَكْـفُرُك،
وَنُـؤْمِنُ بِك،
وَنَخْـضَعُ لَكَ
وَنَخْـلَعُ مَنْ يَكْـفرُك', 'Allāhumma iyyāka na`bud, 
wa laka nuṣallī wa nasjud, 
wa ilayka nas`ā wa naḥfid, 
narjū raḥmatak, 
wa nakhshā `adhābak, 
inna `adhābaka bilkāfirīna mulḥaq. 
Allāhumma innā nasta`īnuk, 
wa nastaghfiruk, 
wa nuthnī `alaykal-khayr, 
wa lā nakfuruk, 
wa nu''minu bik, 
wa nakhḍa`u lak, 
wa nakhla`u man yakfuruk.', 'O Allah, You alone do we worship,
and to You we pray and bow down prostrate. 
To You we hasten to worship and to serve.
Our hope is for Your mercy,
and we fear Your punishment. 
Surely, Your punishment of the disbelievers is at hand. 
O Allah, we seek Your help and Your forgiveness, 
and we praise You beneficently. 
We do not deny You and we believe in You. 
We surrender to You 
and renounce whoever disbelieves in You.', NULL, 1, NULL, NULL, NULL, NULL, NULL, 'Al-Bayhaqi graded its chain authentic in As-Sunan Al-Kubra. Al-Albani said 
in ''Irwa''ul-GhaliL 2/170 that its chain is authentic as a statement of 
''Umar.', 'Sahih', '0cf0cff48548a01a2af82f3fafe8e4c4e29863c469d4b5e8f79640f438907e0a', 'اللهم اياك نعبد ولك نصلي ونسجد واليك نسعي ونحفد نرجو رحمتك ونخشي عذابك ان عذابك بالكافرين ملحق اللهم انا نستعينك ونستغفرك ونثني عليك الخير ولا نكفرك ونومن بك ونخضع لك ونخلع من يكفرك', 1, TRUE, 'published'),
  (120, 'hisn-120', 33, 'hisn-al-muslim', 120, '"سبحان الملك القدوس"
ثلاث مرات والثالثة يجهر بها ويمد بها صوته
"ربِّ الملائكةِ والرّوح"', 'Subḥāna ‘l-Maliki ‘l-Quddūs.
[Recite three times, and raise and extend the voice on the third time and say...]
Rabbi ‘l-Malā''ikati war-rūh.', 'Glory is to the King, the Holy.
[Recite three times in Arabic, and raise and extend the voice on the third time and say...]
Lord of the angels and the Spirit.', NULL, 3, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i 3/244, Ad-Daraqutni and others. The final addition is from 
Ad-Daraqutni''s version 2/ 31 and its chain of narration is authentic. See 
the checking of Zadul-Ma''ad by Shu''aib Al-Arna''ut and ''Abdul-Qadir 
Al-Arna''ut 1/337.', 'Sahih', 'ab59204ead21733621811b6ead2c32db01d50e2ed20abf76e26d2536aa61e61f', 'سبحان الملك القدوس ثلاث مرات والثالثه يجهر بها ويمد بها صوته رب الملايكه والروح', 1, TRUE, 'published'),
  (121, 'hisn-121', 34, 'hisn-al-muslim', 121, 'اللّهُـمَّ إِنِّي عَبْـدُكَ
ابْنُ عَبْـدِكَ
ابْنُ أَمَتِـكَ
نَاصِيَتِي بِيَـدِكَ
مَاضٍ فِيَّ حُكْمُكَ
عَدْلٌ فِيَّ قَضَاؤكَ
أَسْأَلُـكَ بِكُلِّ اسْمٍ هُوَ لَكَ
سَمَّـيْتَ بِهِ نَفْسَكَ
أِوْ أَنْزَلْتَـهُ فِي كِتَابِكَ
أَوْ عَلَّمْـتَهُ أَحَداً مِنْ خَلْقِـكَ
أَوِ اسْتَـأْثَرْتَ بِهِ فِي عِلْمِ الغَيْـبِ عِنْـدَكَ
أَنْ تَجْـعَلَ القُرْآنَ رَبِيـعَ قَلْبِـي
وَنورَ صَـدْرِي
وجَلَاءَ حُـزْنِي
وذَهَابَ هَمِّـي', 'Allāhumma innī `abduk, 
ibnu `abdik, 
ibnu amatik, 
nāsiyatī biyadik, 
māḍin fiyya ḥukmuk,
`adlun fiyya qaḍā''uk, 
as''aluka bikullis’min huwa lak, 
sammayta bihi nafsak, 
aw anzaltahu fī kitābik, 
aw `allamtahu aḥadan min khalqik, 
aw‘ista''tharta bihi fī `ilmil-ghaybi `indak,
an taj`ala ‘l-Qur''āna rabī`a qalbī, 
wa nūra ṣadrī, 
wa jalā''a ḥuznī, 
wa dhahāba hammī.', 'O Allah, I am Your slave,
and the son of Your male slave,
and the son of your female slave. 
My forehead is in Your Hand (i.e. you have control over me). 
Your Judgment upon me is assured,
and Your Decree concerning me is just. 
I ask You by every Name that You have named Yourself with, 
revealed in Your Book, 
taught any one of Your creation, 
or kept unto Yourself in the knowledge of the unseen that is with You, 
to make the Qur''an the spring of my heart,
and the light of my chest,
the banisher of my sadness,
and the reliever of my distress.', NULL, 1, NULL, NULL, NULL, 'ahmad', NULL, 'Ahmad 1/391, and Al-Albani graded it authentic.', 'Sahih', '2148929fbb21968184aa8f60181f55b9d3d44d51cf09cedc3c9b393c7d07203f', 'اللهم اني عبدك ابن عبدك ابن امتك ناصيتي بيدك ماض في حكمك عدل في قضاوك اسالك بكل اسم هو لك سميت به نفسك او انزلته في كتابك او علمته احدا من خلقك او استاثرت به في علم الغيب عندك ان تجعل القران ربيع قلبي ونور صدري وجلاء حزني وذهاب همي', 1, TRUE, 'published'),
  (122, 'hisn-122', 34, 'hisn-al-muslim', 122, 'اللّهُـمَّ إِنِّي أَعْوذُ بِكَ مِنَ
الهَـمِّ وَ الْحُـزْنِ،
والعًجْـزِ والكَسَلِ
والبُخْـلِ والجُـبْنِ،
وضَلْـعِ الـدَّيْنِ
وغَلَبَـةِ الرِّجال', 'Allāhumma ''innī ''a`ūdhu bika 
mina ‘l-ḥammi wa ‘l-ḥuzn, 
wa ‘l-`ajzi wa ‘l-kasal, 
wa ‘l-bukhli wa ‘l-jubn, 
wa ḍala`id-dayn, 
wa ghalabatir-rijāl.', 'O Allah, I seek refuge in you
from grief and sadness,
from weakness and from laziness,
from miserliness and from cowardice,
from being overcome by debt
and overpowered by men (i.e. others).', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/158. See also Al-Asqalani, Fathul-Bari 11/173.', NULL, '1672886a8015ae75e47346e9eb75c972aef2fa9eacf0231550e624ab2b18ac00', 'اللهم اني اعوذ بك من الهم و الحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبه الرجال', 1, TRUE, 'published'),
  (123, 'hisn-123', 35, 'hisn-al-muslim', 123, 'لَا إلَهَ إِلَّا اللَّهُ
الْعَظـيمُ الْحَلِـيمْ،
لَا إِلَهَ إِلَّا اللَّهُ
رَبُّ العَـرْشِ العَظِيـمِ،
لَا إِلَـهَ إِلَّا اللَّهْ
رَبُّ السَّمَـوّاتِ ورّبُّ الأَرْضِ
ورَبُّ العَرْشِ الكَـريم', 'Lā ilāha illallāh
al-`Aẓīmul-Ḥalīm, 
lā ilāha illallāh
Rabbu ‘l-`Arshi ‘l-''Aẓīm, 
lā ilāha illallāh
Rabbus-samāwāti wa Rabbu ‘l-arḍ 
wa Rabbu ‘l-`Arshi ‘l-Karīm.', 'There is none worthy of worship but Allah,
 the Mighty, the Forbearing. 
There is none worthy of worship but Allah,
Lord of the Magnificent Throne. 
There is none worthy of worship but Allah,
Lord of the heavens and Lord of the earth, 
and Lord of the Noble Throne.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 8/154, Muslim 4/2092', NULL, '0d67d802ea7199e03eea1451953b7a7ae14d1d009d503b98f257cfc37bace51d', 'لا اله الا الله العظيم الحليم لا اله الا الله رب العرش العظيم لا اله الا الله رب السموات ورب الارض ورب العرش الكريم', 1, TRUE, 'published'),
  (124, 'hisn-124', 35, 'hisn-al-muslim', 124, 'اللّهُـمَّ رَحْمَتَـكَ أَرْجـو
فَلا تَكِلـني إِلى نَفْـسي طَـرْفَةَ عَـيْن،
وَأَصْلِـحْ لي شَأْنـي كُلَّـه
لَا إِلَهَ إِلَّا أنْـت', 'Allāhumma raḥmataka arjū 
falā takilnī ilā nafsī ṭarfata `ayn, 
wa aṣliḥ lī sha''nī kullah, 
lā ilāha illā ant.', 'O Allah, I hope for Your mercy. 
Do not leave me to myself even for the blinking of an eye (i.e. a moment). 
Correct all of my affairs for me. 
There is none worthy of worship but You.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/324, Ahmad 5/42. Al-Albani graded it as good in Sahih Abu Dawud 
3/959.', 'Sahih', 'e8095e86a09102194759c01552ad92467e8301bd9b71e1324bfb9b69ff94bf4b', 'اللهم رحمتك ارجو فلا تكلني الي نفسي طرفه عين واصلح لي شاني كله لا اله الا انت', 1, TRUE, 'published'),
  (125, 'hisn-125', 35, 'hisn-al-muslim', 125, 'لَا إِلَهَ إِلَّا أنْـت سُـبْحانَكَ إِنِّي كُنْـتُ مِنَ الظّـالِميـن', 'Lā ilāha illā anta subḥānaka 
innī kuntu minaẓ-ẓālimīn.', 'There is none worthy of worship but You, glory is to You. 
Surely, I was among the wrongdoers.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/529. Al-Hakim declared it authentic and Ath-Thahabi agreed 
with him 1/ 505. See also Al-Albani, Sahih At-Tirmidhi 3/168.', 'Sahih', '206a811eda26390c83afaacd1e8384a57315e7d491da063d0b340f7d5b6db72c', 'لا اله الا انت سبحانك اني كنت من الظالمين', 1, TRUE, 'published'),
  (126, 'hisn-126', 35, 'hisn-al-muslim', 126, 'اللهُ اللهُ رَبِّي لا أُشْـرِكُ بِهِ شَيْـئاً', 'Allāh, Allāhu Rabbī lā ushriku bihi shay''a.', 'Allah, Allah is my Lord. I do not associate anything with Him.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/87. See also Al-Albani, Sahih Ibn Mdjah 2/335.', 'Sahih', '5ba895656ca0ad23877ede00345905694a893e0cffa43037890336b9c9f4cdad', 'الله الله ربي لا اشرك به شييا', 1, TRUE, 'published'),
  (127, 'hisn-127', 36, 'hisn-al-muslim', 127, 'اللّهُـمَّ إِنا نَجْـعَلُكَ في نُحـورِهِـم،
وَنَعـوذُ بِكَ مِنْ شُرورِهـمْ', 'Allāhumma innā naj`aluka fī nuḥūrihim 
wa na`ūdhu bika min shurūrihim.', 'O Allah, we ask You to restrain them by their necks,
and we seek refuge in You from their evil.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/89, and Al-Hakim graded it authentic and Ath-Thahabi agreed 
2/142.', 'Sahih', '56e3fd68a0ab3a6eda3accfe455c2ee166eceb1f2ca83827f83b54c0abd26a9b', 'اللهم انا نجعلك في نحورهم ونعوذ بك من شرورهم', 1, TRUE, 'published'),
  (128, 'hisn-128', 36, 'hisn-al-muslim', 128, 'اللّهُـمَّ أَنْتَ عَضُـدي، وَأَنْتَ نَصـيري،
بِكَ أَجـولُ وَبِكَ أَصـولُ وَبِكَ أُقـاتِل', 'Allāhumma anta `aḍudī, wa anta naṣīrī, 
bika ajūlu, wa bika aṣūlu, wa bika uqātil.', 'O Allah, You are my strength and You are my support. 
For Your sake, I go forth and for Your sake, I advance and for Your sake, I fight.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 3/42, At-Tirmidhi 5/572. See also Al-Albani, Sahih At-Tirmidhi 
3/183.', 'Sahih', '3a3d559d8564d7677414afadef64d45ba80e316c40a512ea802c28f4b61c609a', 'اللهم انت عضدي وانت نصيري بك اجول وبك اصول وبك اقاتل', 1, TRUE, 'published'),
  (129, 'hisn-129', 36, 'hisn-al-muslim', 129, 'حَسْبُـنا اللهُ وَنِعْـمَ الوَكـيل', 'Ḥasbunallāhu wa ni`mal-wakīl.', 'Allah is sufficient for us and the best of those on whom to depend.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, 5/172.', NULL, '4a56626b14eeb757099d0c62d41da5094a11827df24682a4a32e19e854245dfe', 'حسبنا الله ونعم الوكيل', 1, TRUE, 'published'),
  (130, 'hisn-130', 37, 'hisn-al-muslim', 130, 'اللَّهُمَّ ربَّ السَّمَوَاتِ السَّبْعِ،
وَرَبَّ الْعَرْشِ الْعَظِيمِ،
 كُنْ لِي جَاراً مِنْ فُلاَنِ بْنِ فُلاَنٍ،
وَأَحْزَابِهِ مِنْ خَلاَئِقِكَ،
أَنْ يَفْرُطَ عَلَيَّ أَحَدٌ مِنْهُمْ أَوْ يَطْغَى،
عَزَّ جَارُكَ،
وَجَلَّ ثَنَاؤُكَ،
وَلاَ إِلَهَ إِلاَّ أَنْتَ', 'Allāhumma Rabbas-samāwātis-sab`, 
wa Rabba ‘l-`Arshi ‘l-`Aẓīm, 
kun lī jāran min [here you mention the person''s name], 
wa aḥzābihi min khalā''iqik, 
an yafruṭa `alayya aḥadun minhum aw yaṭghā, 
`azza jāruk, 
wa jalla thanā''uk, 
wa lā ilāha illā ant.', 'O Allah, Lord of the seven heavens, 
Lord of the Magnificent Throne, 
be for me a support against [such and such a person] and his helpers from among your creatures, 
lest any of them abuse me or do me wrong.
Mighty is Your patronage,
and glorious are Your praises.
There is none worthy of worship but You.', NULL, 1, NULL, NULL, NULL, 'bukhari', '707', 'Al-Bukhari, Al-''Adab Al-Mufrad (no. 707). Al-Albani graded it authentic in 
Sahih Al-''Adab Al-Mufrad (no. 545).', 'Sahih', '9f8ce1958b8ca5a75d6473c46f62281e85a9e9a909d987e47f60fc5ec8360a1b', 'اللهم رب السموات السبع ورب العرش العظيم كن لي جارا من فلان بن فلان واحزابه من خلايقك ان يفرط علي احد منهم او يطغي عز جارك وجل ثناوك ولا اله الا انت', 1, TRUE, 'published'),
  (131, 'hisn-131', 37, 'hisn-al-muslim', 131, 'الله أكبر،
الله أعز من خلقه جميعاً ،
الله أعز مما أخاف وأحذر ،
أعوذ بالله الذي لا إله إلا هو ،
الممسك السموات السبع
أن يقعن على الأرض إلا بإذنه ،
من شر عبدك فلان ،
وجنوده وأتباعه وأشياعه ،
من الجن والأنس ،
اللهم كن لي جاراً من شرهم ،
جل ثناؤك وعز جارك ،
وتبارك اسمك ،
ولا إله غيرك
(ثلاث مرات)', 'Allāhu Akbar, 
Allāhu a`azzu min khalqihi jamī`a, 
Allāhu a`azzu mimmā akhāfu wa aḥdhar, 
a`ūdhu billāhi ‘l-ladhī lā ilāha illā hū,
almumsikis-samāwātis-sab`i  
an yaqa`na `ala ‘l-arḍi illā bi idhnih,
min sharri `abdika [name of the person], 
wa junūdihi wa atbā`ihi wa ashyā`ih, 
mina ‘l-jinni wa ‘l-ins, 
Allāhumma kun lī jāran min sharrihim,
jalla thanā''uk,
wa `azza jāruk,
wa tabāraka-smuk, 
wa lā ilāha ghayruk.', 'Allah is the Most Great, 
Mightier than all His creation. 
He is Mightier than what I fear and dread. 
I seek refuge in Allah, Who there is none worthy of worship but Him. 
He is the One Who holds the seven heavens from falling upon the earth except by His command. 
[I seek refuge in You Allah] from the evil of Your slave [name of the person], 
and his helpers, his followers, and his supporters from among the jinn and mankind.
O Allah, be my support against their evil.
Glorious are Your praises
and mighty is Your patronage.
Blessed is Your Name,
there is no true God but You.
(Recite three times in Arabic.)', NULL, 3, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, 5/172.', NULL, '61787652032caed244ded515585aa3f5c35c1374fc76b752edbfcdb3a4853df8', 'الله اكبر الله اعز من خلقه جميعا الله اعز مما اخاف واحذر اعوذ بالله الذي لا اله الا هو الممسك السموات السبع ان يقعن علي الارض الا باذنه من شر عبدك فلان وجنوده واتباعه واشياعه من الجن والانس اللهم كن لي جارا من شرهم جل ثناوك وعز جارك وتبارك اسمك ولا اله غيرك ثلاث مرات', 1, TRUE, 'published'),
  (132, 'hisn-132', 38, 'hisn-al-muslim', 132, 'اللَّهُمَّ مُنْزِلَ الْكِتَاب
سَرِيعَ الْحِسَاب
اهْزِم الأَحْزَاب
اللَّهُمَّ اهْزِمْهُمْ وَ زَلْزِلْهُم', 'Allāhumma munzila ‘l-kitāb, 
sarī`a ‘l-ḥisāb, 
ihzimi ‘l-aḥzāb, 
Allāhumma-hzimhum wa zalzilhum.', 'O Allah, Revealer of the Book, 
Swift to account, 
defeat the groups (of disbelievers). 
O Allah, defeat them and shake them.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 3/1362.', NULL, '08d1501a6eebf96ba7712d7c2ba386e1226a122e3a37e04c9951c36698a23181', 'اللهم منزل الكتاب سريع الحساب اهزم الاحزاب اللهم اهزمهم و زلزلهم', 1, TRUE, 'published'),
  (133, 'hisn-133', 39, 'hisn-al-muslim', 133, 'اللَّهُمَّ اكْفِنِيهِم بمَا شِئْت', 'Allāhummak-finīhim bimā shi''t.', 'O Allah, suffice (i.e. protect) me against them however You wish.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2300.', NULL, '18d152c0c7e89072eb273b06ea6c41c62d7c9762bae4edbfb9892d79223a587f', 'اللهم اكفنيهم بما شيت', 1, TRUE, 'published'),
  (134, 'hisn-134', 40, 'hisn-al-muslim', 134, 'يَسْتَعِيذُ بِاللَّهِ.
يَنْتَهِي عَمَّا شك فِيهِ.', 'A`ūdhu billāh', '(Say:) I seek refuge in Allah. 
(Then you should desist from doing what you are in doubt about.)', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/336, Muslim 1/120.', NULL, '3e3a44ca5bc63a1c2c30f4454ca886c71602faa48c1fadc984726b8f6e912741', 'يستعيذ بالله ينتهي عما شك فيه', 1, TRUE, 'published'),
  (135, 'hisn-135', 40, 'hisn-al-muslim', 135, 'يقول" آمنت بالله ورسله"', 'Āmantu billāhi wa Rusulih.', '(Say:) I believe in Allah and His Messengers.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim, 1/119-20.', NULL, '045321940d4673d8f74a7ab52da4b885a7bca07f082f2b108b78616f96c410a3', 'يقول امنت بالله ورسله', 1, TRUE, 'published'),
  (136, 'hisn-136', 40, 'hisn-al-muslim', 136, 'يقرأ قوله تعالى ((هُوَ الأوَّلُ، وَالآخِـرُ،
وَالظّـاهِـرُ، وَالْبـاطِـنُ،
 وَهُوَ بِكُلِّ شَيءٍ عَلـيم))', 'Huwa ‘l-Awwalu wa ‘l-Ākhir,
waẓ-Ẓāhiru wal-Bāṭin, 
wa huwa bikulli shay''in `Alīm.', '(Recite the Ayat) He is the First and the Last, 
the Most High and the Most Near. 
And He is the Knower of all things (in Arabic).', NULL, 1, NULL, 57, '3', 'abu-dawud', NULL, 'Al-Hadid 57:3, Abu Dawud 4/329. Al-Albani graded it good in SahihAbu Dawud, 
3/962.', 'Sahih', 'a30b1b663fbcecedfc52468a6271e2d4015f4b4e6be06d899f3f111e2cee200b', 'يقرا قوله تعالي هو الاول والاخر والظاهر والباطن وهو بكل شيء عليم', 1, TRUE, 'published'),
  (137, 'hisn-137', 41, 'hisn-al-muslim', 137, 'اللّهُـمَّ اكْفِـني بِحَلالِـكَ عَنْ حَـرامِـك،
وَأَغْنِـني بِفَضْـلِكِ عَمَّـنْ سِـواك', 'Allāhummak-finī biḥalālika `an ḥarāmik, 
wa ''aghninī bi faḍlika `amman siwāk.', 'O Allah, suffice me with what You have allowed instead of what You have forbidden, 
and make me independent of all others besides You.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/560. See also Al-Albani, Sahih At-Tirmidhi 3/180.', 'Sahih', 'af315c800345bfe95885edfcd207ab0f70b9e58c4a14d9991ba583d7723a0888', 'اللهم اكفني بحلالك عن حرامك واغنني بفضلك عمن سواك', 1, TRUE, 'published'),
  (138, 'hisn-138', 41, 'hisn-al-muslim', 138, 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ،
وَالْعَجْزِ وَالْكَسَلِ،
وَالْبُخْلِ وَالْجُبْنِ،
وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', 'Allāhumma innī a`ūdhu bika mina ‘l-ḥammi wa ‘l-ḥazan, 
wa ‘l-`ajzi wa ‘l-kasal,
wa ‘l-bukhli wa ‘l-jubn, 
wa ḍala`id-dayni wa ghalabatir-rijāl.', 'O Allah! I seek refuge with You from worry and grief,
from incapacity and laziness,
from cowardice and miserliness,
from being heavily in debt and from being overpowered by (other) men.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/158.', NULL, '32679db5683957e6a739fa39c4ff9b6386578549b5e027fd04d48e7ae0ce4247', 'اللهم اني اعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبه الرجال', 1, TRUE, 'published'),
  (139, 'hisn-139', 42, 'hisn-al-muslim', 139, 'أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ،
وَاتْفُلْ عَلَى يَسَارِكَ (ثلاثاً)', 'A`ūdhu billāhi minash-shayṭānir-rajīm.', '(Say:) I seek refuge in Allah from Satan the outcast 
(then blow with a little spittle to your left). 
(Do this three times reciting in Arabic.)', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/1729.', NULL, '93a5b0aa683c65a7b39b3db654f5658c6beaf555ac9c7131a7d6ba3881370ac7', 'اعوذ بالله من الشيطان الرجيم واتفل علي يسارك ثلاثا', 1, TRUE, 'published'),
  (140, 'hisn-140', 43, 'hisn-al-muslim', 140, 'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً،
وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً', 'Allāhumma lā saḥla illā ma ja`altahu saḥla 
wa anta taj`alu ‘l-ḥazna idhā shi''ta saḥla.', 'O Allah, there is no ease other than what You make easy. 
If You please You ease sorrow.', NULL, 1, NULL, NULL, NULL, NULL, '2427', 'Ibn Hibban in his Sahih (no. 2427), and Ibn As- Sunni (no. 351). Al-Hafidh 
(Ibn Hajar) said that this Hadith is authentic. It was also declared 
authentic by ''Abdul-Qadir Al-Arna''ut in his checking of An-Nawawi''s 
Kitabul-Athkarp. 106.', 'Sahih', 'ef333e5f3286b2834525be9fa3c3f0509605a157d265e7995cd991d6c3a95c39', 'اللهم لا سهل الا ما جعلته سهلا وانت تجعل الحزن اذا شيت سهلا', 1, TRUE, 'published'),
  (141, 'hisn-141', 44, 'hisn-al-muslim', 141, 'مَا مِنْ عَبْدٍ يُذنِبُ ذَنْباً فَيُحْسِنُ الطُّهُورَ، ثُمَّ يَقُومُ فَيُصَلِّي رَكْعَتَيْنِ، ثُمَّ يَسْتَغْفِرُ اللَّهَ إِلاَّ غَفَرَ اللَّهُ لَهُ', NULL, 'There is not any slave of Allah who commits a sin, then he perfects his purification and stands to pray two Rak''ahs of prayer, then seeks Allah''s forgiveness, except that Allah will forgive him.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 2/86, At-Tirmidhi 2/257. Al-Albani graded it authentic in Sahih 
Abu Dawud 1/283.', 'Sahih', '19456b1a10c7d69b08dfd7f6d321fab0d8fe99c1e489c1315a0e474975f10288', 'ما من عبد يذنب ذنبا فيحسن الطهور ثم يقوم فيصلي ركعتين ثم يستغفر الله الا غفر الله له', 1, TRUE, 'published'),
  (142, 'hisn-142', 45, 'hisn-al-muslim', 142, 'الاستعاذة بالله منه', 'A`ūdhu billāhi minash-shayṭānir-rajīm.', 'Seeking refuge with Allah against him (i.e. by saying I seek refuge in Allah from Satan the outcast).', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 1/206, At-Tirmidhi. See also Al-Albani, Sahih At-Tirmidhi 1/77, 
and Surat Al-Mu''minun, 23:98-9.', 'Sahih', '526f5c3a93a7ca18e2735ac8c59c96b249b4fd9d06e02c2710f60182fa1852de', 'الاستعاذه بالله منه', 1, TRUE, 'published'),
  (143, 'hisn-143', 45, 'hisn-al-muslim', 143, 'الْأَذَانُ', '--', 'The call to prayer - ''Athan.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Muslim 1/291, Al-Bukhari 1/151.', NULL, '9a20948a90dd8ea44e8eb7d619cbad029e376cf29484a37ae7c0406b78c41fb2', 'الاذان', 1, TRUE, 'published'),
  (144, 'hisn-144', 45, 'hisn-al-muslim', 144, 'الْأَذْكَارُ وَقِرَاءَةُ الْقُرْآنِ', '--', 'Saying words of Allah''s remembrance (Thikr) and recitation of the Qur''an.', NULL, 100, NULL, 2, '255', 'muslim', NULL, '"Do not turn your homes into graveyards, surely the Devil flees from the 
house in which Surat Al-Baqarah is read," Muslim 1/539. The Devil is also 
driven out by the invocations for morning and evening, those that are said 
before sleeping and upon waking up, those for entering and leaving the 
house, including those for entering and leaving the mosque, and by many 
other authentic invocations taught to us by the Prophet (ﷺ) such as the 
reading of ''Ayatul-Kursi, (Al-Baqarah 2:255), and the last two ''Ayat of 
Surat Al-Baqarah before going to sleep. Whoever says: "There is none worthy 
of worship but Allah alone, Who has no partner, His is the dominion and His 
is the praise, and he is Able to do all things," one hundred times, it will 
be a protection for him from the Devil throughout the day.''', 'Sahih', '71266ef2d9254176b05417016f10dd215cd46206568df585628569e7b8599313', 'الاذكار وقراءه القران', 1, TRUE, 'published'),
  (145, 'hisn-145', 46, 'hisn-al-muslim', 145, 'قَدَّرَ اللهُ وَما شـاءَ فَعَـل', 'Qaddarallāhu wa mā shā''a fa`al.', 'It is the Decree of Allah and He does whatever He wills.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, '"The strong believer is better and more dear to Allah than the weak 
believer, and in each of them there is good. Be vigilant for what is to 
your benefit and seek the help of Allah and do not falter. But when you are 
striken by some setback, do not say: ''If only I had done such and such,'' 
rather say: ''It is the Decree of Allah and He does whatever He wills.'' For 
verily the saying ''if (i.e. if only I had) begins the work of the Devil." 
Muslim 4/2052.', 'Hasan', '16bbb9d239167cd5ebd78b5f502429ed36436a9d2eb2a298dec48611c1abb85b', 'قدر الله وما شاء فعل', 1, TRUE, 'published'),
  (146, 'hisn-146', 47, 'hisn-al-muslim', 146, '(بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ،
وَشَكَرْتَ الْوَاهِبَ،
وَبَلَغَ أَشُدَّهُ،
وَرُزِقْتَ بِرَّهُ).

 وَيَرُدُّ عَلَيْهِ الْمُهَــــــنَّأُ فَيَقُولُ:
(بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ،
وَجَزَاكَ اللَّهُ خَيْراً،
وَرَزَقَكَ اللَّهُ مِثْلَهُ،
وَأَجْزَلَ ثَوَابَكَ).', 'Bārakallāhu laka fi ‘l-mawhūbi lak, 
wa shakarta ‘l-wāhib, 
wa balagha ashuddah, 
wa ruziqta birrah.', 'The reply of the person being congratulated is to say:

Bārakallahu laka wa bāraka `alayk, 
wa jazākallāhu khayra, 
wa razaqakallāhu mithlah, 
wa ajzala thawābak.

May Allah bless you with His gift to you, 
and may you (the new parent) give thanks,
may the child reach the maturity of years,
and may you be granted its righteousness.

The reply of the person being congratulated is to say:

May Allah bless you, and shower His blessings upon you, 
and may Allah reward you well
and bestow upon you its like 
and reward you abundantly', NULL, 1, NULL, NULL, NULL, NULL, NULL, 'An-Nawawi, Kitdbul-''Athkarp. 349, and Sahihul-''Athkar2/7l3 by Saleem 
Al-Hilali.', 'Sahih', '88f2b0cc09045ed9fe931d28aa6596b16fb4090c7e6afce81eea1fedfb8a987a', 'بارك الله لك في الموهوب لك وشكرت الواهب وبلغ اشده ورزقت بره ويرد عليه المهنا فيقول بارك الله لك وبارك عليك وجزاك الله خيرا ورزقك الله مثله واجزل ثوابك', 1, TRUE, 'published'),
  (147, 'hisn-147', 48, 'hisn-al-muslim', 147, 'كان رسول الله صلى الله عليه وسلم يعوذ الحسن والحسين
" أعيذكما بكلمات الله التامة ،
من كل شيطان وهامة ،
ومن كل عينِ لامة "', 'The Prophet (ﷺ) used to seek Allah''s protection for Al-Hasan and Al-Husain by saying:', 'U`īthukumā bikalimāti ‘llāhit-tāmmati 
min kulli shayṭānin wa hāmmah, 
wa min kulli `aynin lāmmah

I seek protection for you in the Perfect Words of Allah 
from every devil and every beast, 
and from every envious blameworthy eye.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari4/119.', NULL, '27226f5e3c1dd97c293648e35ce1d81b54ea1e2c4129e74be4940f4c867ceb41', 'كان رسول الله صلي الله عليه وسلم يعوذ الحسن والحسين اعيذكما بكلمات الله التامه من كل شيطان وهامه ومن كل عين لامه', 1, TRUE, 'published'),
  (148, 'hisn-148', 49, 'hisn-al-muslim', 148, 'لا بأْسَ طَهـورٌ إِنْ شـاءَ الله', 'Lā ba''sa ṭahūrun in shā Allāh.', 'Do not worry, it will be a purification (for you), Allah willing.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani Fathul-Bari 10/118.', NULL, 'a8f3971dec8b9a9fb3029179044633365fd6c6b44cc865eb5a9d554c806898ae', 'لا باس طهور ان شاء الله', 1, TRUE, 'published'),
  (149, 'hisn-149', 49, 'hisn-al-muslim', 149, 'أَسْـأَلُ اللهَ العَـظيـم، رَبَّ العَـرْشِ العَـظيـم أَنْ يَشْفـيك .
(سبع مرات)', 'As''alullāha ‘l-`Aẓīma Rabba ‘l-`Arshil-`Aẓīmi an yashfiyak.', 'I ask Almighty Allah, Lord of the Magnificent Throne, to make you well. 
(Recite seven times in Arabic .)', NULL, 7, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi, Abu Dawud. See also Al-Albani, Sahih At-Tirmidhi 2/210 and 
Sahihul-Jami'' As-Saghir 5/180.', 'Sahih', 'bb757eee46957bae4d8fb017a1ab1e745f7582a07b8e6b1742eec1d1eadb7715', 'اسال الله العظيم رب العرش العظيم ان يشفيك سبع مرات', 1, TRUE, 'published'),
  (150, 'hisn-150', 50, 'hisn-al-muslim', 150, 'قَالَ صلى الله عليه وسلم: (إِذَا عَادَ الرَّجُلُ أَخَاهُ الْمُسْلِمَ مَشَى فِي خِرَافَةِ الْجَنَّةِ حَتَّى يَجْلِسَ، فَإِذَا جَلَسَ غَمَرَتْهُ الرَّحْمَةُ، فَإِنْ كَانَ غُدْوَةً صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُمْسِيَ، وَإِنْ كَانَ مَسَاءً صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُصْبِحَ)', NULL, 'When a man goes to visit his sick Muslim brother, he walks along a path of Paradise until he sits, and when he sits he is cloaked in mercy. If he comes in the morning, seventy thousand angels pray for him until evening, and if he comes in the evening, seventy thousand angels pray for him until morning.', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e69ae401160b297acce5c5469db5f3010799d496c99fa5eedfbf9acec34a27b2', 'قال صلي الله عليه وسلم اذا عاد الرجل اخاه المسلم مشي في خرافه الجنه حتي يجلس فاذا جلس غمرته الرحمه فان كان غدوه صلي عليه سبعون الف ملك حتي يمسي وان كان مساء صلي عليه سبعون الف ملك حتي يصبح', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (151, 'hisn-151', 51, 'hisn-al-muslim', 151, 'أللّهُـمَّ اغْفِـرْ لي وَارْحَمْـني
وَأَلْحِقْـني بِالرَّفـيقِ الأّعْلـى', 'Allāhumma’ghfir lī warḥamnī 
wa alḥiqnī bir-rafīqi ‘l-''A`alā.', 'O Allah, forgive me and have mercy upon me, 
and join me with the highest companions (in Paradise).', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari7/10, Muslim 4/1893.', NULL, 'b9465ba490d4162d56224f0906554ffd74c4db7cdeab2fb1a9bfe028b1d142eb', 'اللهم اغفر لي وارحمني والحقني بالرفيق الاعلي', 1, TRUE, 'published'),
  (152, 'hisn-152', 51, 'hisn-al-muslim', 152, 'جعل النبي صلى الله عليه وسلم عند موته يدخل يديه في الماء فيمسح بهما وجههُ ويقول :
لا إله إلا الله إن للموت لسكرات', 'As he was dying, the Prophet (ﷺ) dipped his hands in water and wiped his face saying:', 'Lā ilāha illallāh
inna li ‘lmawti la’sakarāt.

There is none worthy of worship but Allah, 
surely death has agonies.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 8/144. The Hadith also mention him 
using the Siivak (tooth stick).', NULL, 'caa7cf1feadb7ea6b4f3f881e1e9fd66cc2eb28e38e0d74ff574aec7b05877f4', 'جعل النبي صلي الله عليه وسلم عند موته يدخل يديه في الماء فيمسح بهما وجهه ويقول لا اله الا الله ان للموت لسكرات', 1, TRUE, 'published'),
  (153, 'hisn-153', 51, 'hisn-al-muslim', 153, 'لا إلهَ إلاّ اللّهُ
وَاللّهُ أَكْبَـر،
لا إلهَ إلاّ اللّهُ وحْـدَهُ،
لا إلهَ إلاّ اللّهُ
وحْـدَهُ لا شَريكَ لهُ،
لا إلهَ إلاّ اللّهُ
لهُ المُلكُ ولهُ الحَمْد،
لا إلهَ إلاّ اللّهُ
وَلا حَـوْلَ وَلا قُـوَّةَ إِلاّ بِالله', 'Lā ilāha illallāh
wallāhu Akbar, 
lā ilāha illallāhu waḥdah,
lā ilāha illallāh
waḥdahu lā sharīka lah, 
lā ilāha illallāh
lahu ‘l-mulku wa lahu ‘l-ḥamd, 
lā ilāha illallāh
wa lā ḥawla wa lā quwwata illā billāh.', 'There is none worthy of worship but Allah, 
Allah is the Most Great. 
None has the right to be worshipped but Allah alone. 
None has the right to be worshipped but Allah alone, 
Who has no partner. 
There is none worthy of worship but Allah,
His is the dominion and His is the praise.
There is none worthy of worship but Allah,
there is no power and no might but by Allah.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi and Ibn Majah. See also Al-Albani, Sahih At-Tirmidhi 3/152 and 
Sahih Ibn Majah 2/317.', 'Sahih', 'e6252260404e3e6f5238000db8866faf01cd4d99ff8d747d6c7a50b12a7b8f23', 'لا اله الا الله والله اكبر لا اله الا الله وحده لا اله الا الله وحده لا شريك له لا اله الا الله له الملك وله الحمد لا اله الا الله ولا حول ولا قوه الا بالله', 1, TRUE, 'published'),
  (154, 'hisn-154', 52, 'hisn-al-muslim', 154, 'من كان آخر كلامه "لا إله إلا الله" دخل الجنة', 'Lā ilāha illallāh', 'Whoever dies with the last words (whose meaning is): "There is none worthy of worship but Allah" will enter Paradise.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 3/190. See also Al-Albani, Sahihul-Jami'' As-Saghir 5/432.', 'Sahih', 'c2f8c7d8b85d93832c5790547624e0745b78f8bda3a93c67ab6d05b80ab6e1e5', 'من كان اخر كلامه لا اله الا الله دخل الجنه', 1, TRUE, 'published'),
  (155, 'hisn-155', 53, 'hisn-al-muslim', 155, 'إِنّا للهِ وَإِنَا إِلَـيْهِ راجِعـون ،
اللهُـمِّ اْجُـرْني في مُصـيبَتي،
وَاخْلُـفْ لي خَيْـراً مِنْـها', 'Innā lillāhi wa innā ilayhi rāji`ūn, 
Allāhumma-jurni fī muṣībatī 
wa ''khluf lī khayran minhā.', 'We are from Allah and unto Him we return. 
O Allah take me out of my plight 
and bring to me after it something better.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/632.', NULL, '459c8f9e911eeba25c8a938bf22edb57888a80db418763d8d0d2b05ba0f68f8d', 'انا لله وانا اليه راجعون اللهم اجرني في مصيبتي واخلف لي خيرا منها', 1, TRUE, 'published'),
  (156, 'hisn-156', 54, 'hisn-al-muslim', 156, 'اللهُـمِّ اغْفِـرْ لِـفلان (باسـمه)
وَارْفَعْ دَرَجَتَـهُ في المَهْـدِييـن ،
وَاخْـلُفْـهُ في عَقِـبِهِ في الغابِـرين،
وَاغْفِـرْ لَنـا وَلَـهُ يا رَبَّ العـالَمـين،
وَافْسَـحْ لَهُ في قَبْـرِهِ وَنَـوِّرْ لَهُ فيه', 'Allāhumma’ghfir li (name of the person) 
warfa` darajatahu fi ‘l-mahdiyyīn,
wakhlufhu fī `aqibihi fi ‘l-ghābirīn, 
wagh’fir-lanā wa lahu yā Rabba ‘l-`ālamīn, 
wafsaḥ lahu fī qabrihi wa nawwir lahu fīh.', 'O Allah, forgive [name of the person]
and elevate his station among those who are guided. 
Send him along the path of those who came before, 
and forgive us and him, O Lord of the worlds.
Enlarge for him his grave, and shed light upon him in it.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/634.', NULL, '508389d645df2b6597a8032122d6f5a0d54a7d21621f96d6cdc000fd4bd0c6e6', 'اللهم اغفر لفلان باسمه وارفع درجته في المهديين واخلفه في عقبه في الغابرين واغفر لنا وله يا رب العالمين وافسح له في قبره ونور له فيه', 1, TRUE, 'published'),
  (157, 'hisn-157', 55, 'hisn-al-muslim', 157, 'اللهُـمِّ اغْفِـرْ لَهُ وَارْحَمْـه ،
وَعافِهِ وَاعْفُ عَنْـه ،
وَأَكْـرِمْ نُزُلَـه ،
وَوَسِّـعْ مُدْخَـلَه ،
وَاغْسِلْـهُ بِالْمـاءِ وَالثَّـلْجِ وَالْبَـرَدْ ،
وَنَقِّـهِ مِنَ الْخطـايا
كَما نَـقّيْتَ الـثَّوْبَ الأَبْيَـضَ مِنَ الدَّنَـسْ ،
وَأَبْـدِلْهُ داراً خَـيْراً مِنْ دارِه ،
وَأَهْلاً خَـيْراً مِنْ أَهْلِـه ،
وَزَوْجَـاً خَـيْراً مِنْ زَوْجِه ،
وَأَدْخِـلْهُ الْجَـنَّة ،
وَأَعِـذْهُ مِنْ عَذابِ القَـبْر [وَعَذابِ النّـار]', 'Allāhumma’ghfir lahu warḥamh, 
wa `āfihi, wa`fu `anh, 
wa akrim nuzulah, 
wa wassi` mudkhalah, 
wagh’silhu bi ‘lmā''i wath-thalji walbarad, 
wa naqqihi mina ‘l-khaṭāyā
kamā naqqaytath-thawba ‘l-abyaḍa minad-danas, 
wa abdilhu dāran khayran min dārih, 
wa ahlan khayran min ahlih, 
wa zawjan khayran min zawjih, 
wa adkhilhu ‘l-jannah, 
wa a`idhhu min `adhābi ‘l-qabri [wa `adhābin-nār].', 'O Allah, forgive him and have mercy on him, 
and give him strength and pardon him. 
Be generous to him, 
and cause his entrance to be wide, 
and wash him with water and snow and hail. 
Cleanse him of his transgressions 
as white cloth is cleansed of stains. 
Give him an abode better than his home, 
and a family better than his family, 
and a wife better than his wife. 
Take him into Paradise, 
and protect him from the punishment of the grave [and from the punishment of Hell-fire].', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/663.', NULL, '5154e241feea9e7ea634372d91a98f8efb13e35b468859494f969a5f9c6f70ee', 'اللهم اغفر له وارحمه وعافه واعف عنه واكرم نزله ووسع مدخله واغسله بالماء والثلج والبرد ونقه من الخطايا كما نقيت الثوب الابيض من الدنس وابدله دارا خيرا من داره واهلا خيرا من اهله وزوجا خيرا من زوجه وادخله الجنه واعذه من عذاب القبر وعذاب النار', 1, TRUE, 'published'),
  (158, 'hisn-158', 55, 'hisn-al-muslim', 158, 'اللهُـمِّ اغْفِـرْ لِحَيِّـنا وَمَيِّتِـنا،
وَشـاهِدِنا وَغائِبِـنا ،
وَصَغيـرِنا وَكَبيـرِنا ،
وَذَكَـرِنا وَأُنْثـانا .
اللهُـمِّ مَنْ أَحْيَيْـتَهُ مِنّا
فَأَحْيِـهِ عَلى الإِسْلام ،
وَمَنْ تَوَفَّـيْتَهُ مِنّا فَتَوَفَّـهُ عَلى الإِيـمان ،
اللهُـمِّ لا تَحْـرِمْنـا أَجْـرَه ،
وَلا تُضِـلَّنا بَعْـدَه', 'Allāhumma’ghfir liḥayyinā, wa mayyitinā, 
wa shāhidinā, wa ghā''ibinā,
wa ṣaghīrinā wa kabīrinā, 
wa dhakarinā wa unthānā. 
Allāhumma man aḥyaytahu minnā 
fa aḥyihi `ala ‘l-Islām, 
wa man tawaffaytahu minnā
fatawaffahu `alal-īmān, 
Allāhumma lā taḥrimnā ajrah
wa lā tuḍillanā ba`dah.', 'O Allah forgive our living and our dead, 
those who are with us and those who are absent, 
our young and our old, 
our menfolk and our womenfolk. 
O Allah, whomever you give life from among us 
give him life in Islam, 
and whomever you take away from us 
take him away in Faith. 
O Allah, do not forbid us their reward 
and do not send us astray after them.', NULL, 1, NULL, NULL, NULL, 'ibn-majah', NULL, 'Ibn Majah 1/480, Ahmad 2/368. See also Al-Albani, Sahih Ibn Majah 1/251.', 'Sahih', '621b8f886c2d683bcf4dcc5c4dd160a48b988129c8215c56a7c754e177a9fd8f', 'اللهم اغفر لحينا وميتنا وشاهدنا وغايبنا وصغيرنا وكبيرنا وذكرنا وانثانا اللهم من احييته منا فاحيه علي الاسلام ومن توفيته منا فتوفه علي الايمان اللهم لا تحرمنا اجره ولا تضلنا بعده', 1, TRUE, 'published'),
  (159, 'hisn-159', 55, 'hisn-al-muslim', 159, 'اللهُـمِّ إِنَّ فُلانَ بْنَ فُلانٍ في ذِمَّـتِك ،
وَحَبْـلِ جِـوارِك ،
فَقِـهِ مِنْ فِتْـنَةِ الْقَـبْرِ وَعَذابِ النّـار ،
وَأَنْتَ أَهْلُ الْوَفـاءِ وَالْـحَقِّ ،
فَاغْفِـرْ لَهُ وَارْحَمْـهُ ،
إِنَّكَ أَنْتَ الغَـفورُ الـرَّحيم', 'Allāhumma inna [name the person] fī dhimmatik, 
wa ḥabli jiwārik, 
faqihi min fitnati ‘l-qabri wa `adhābin-nār, 
wa anta ahlu ‘l-wafā''i wa ‘l-ḥaqq. 
Faghfir lahu warḥamh
innaka anta ‘l-Ghafūrur-Raḥīm.', 'O Allah, surely [name the person] is under Your protection,
and in the rope of Your security,
so save him from the trial of the grave and from the punishment of the Fire.
You fulfill promises and grant rights,
so forgive him and have mercy on him.
Surely You are Most Forgiving, Most Merciful.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Ibn Majah, Abu Dawud 3/211. See also Al Albani, Sahih Ibn Majah 1/251.', 'Sahih', '0a42107caac98aa9b6214fc2da61ca0a7bc575ad299602339ca8a852957cd7e2', 'اللهم ان فلان بن فلان في ذمتك وحبل جوارك فقه من فتنه القبر وعذاب النار وانت اهل الوفاء والحق فاغفر له وارحمه انك انت الغفور الرحيم', 1, TRUE, 'published'),
  (160, 'hisn-160', 55, 'hisn-al-muslim', 160, 'اللهُـمِّ عَبْـدُكَ وَابْنُ أَمَـتِك،
احْتـاجَ إِلى رَحْمَـتِك،
وَأَنْتَ غَنِـيٌّ عَنْ عَذابِـه،
إِنْ كانَ مُحْـسِناً فَزِدْ في حَسَـناتِه،
وَإِنْ كانَ مُسـيئاً فَتَـجاوَزْ عَنْـه', 'Allāhumma `abduka wabnu ''amatik 
iḥtāja ilā raḥmatik, 
wa anta ghaniyyun `an `adhābih, 
in kāna muḥsinan fazid fī ḥasanātih, 
wa in kāna musī''an fatajāwaz `anh.', 'O Allah, Your male slave and the child of Your female slave is in need of Your mercy, 
and You are not in need of his torment. 
If he was pious then increase his rewards
and if he was a transgressor then pardon him.', NULL, 1, NULL, NULL, NULL, 'al-hakim', NULL, 'Al-Hakim 1/359 who graded it authentic and Ath-Thahabi agreed with him. See 
also Al-Albani, Ahkamul-Jana''iz, p. 125.', 'Sahih', 'ac250f9d7ce25ea32f55057701f16639aabf585236495151f3f7579f61ce05da', 'اللهم عبدك وابن امتك احتاج الي رحمتك وانت غني عن عذابه ان كان محسنا فزد في حسناته وان كان مسييا فتجاوز عنه', 1, TRUE, 'published'),
  (161, 'hisn-161', 56, 'hisn-al-muslim', 161, '"اللهم أعذه من عذاب القبر "
وإن قال:
"اللهم اجعله فرطاً وذخراً لوالديه ،
وشفيعاً مجاباً .
اللهم ثقل به موازينها
وأعظم به أجورهما ،
وألحقهُ بصالح المؤمنين ،
واجعلهُ في كفالة إبراهيم ،
وقه برحمتك عذاب الجحيم ،
وأبدله داراً خيراً من داره ،
وأهلاً خيراً من أهله ،
اللهم اغفر لاسلافنا ، وأفراطنا ،
ومن سبقنا بالإيمان "
فحسن', 'Allāhumma a`idh’hu min `adhābi ‘l-qabr
[or say:]
Allāhumma ‘j`alhu faraṭan wa dhukhran liwālidayh, 
wa shafī`an mujāban.
Allāhumma thaqqil bihi mawāzīnahumā 
wa a`ẓim bihi ujūrahumā, 
wa alḥiqhu biṣāliḥi ‘l-mu''minīn, 
waj`alhu fī kafālati Ibrāhīm, 
wa qihi biraḥmatika `adhāba ‘l-jaḥīm, 
wa abdilhu dāran khayran min dārih, 
wa ahlan khayran min ahlih, 
Allāhumma’ghfir li aslāfinā wa afrāṭinā
wa man sabaqanā bil īmān.', 'O Allah, protect him from the torment of the grave. 
[It is also good to say:] 
O Allah, make him a precursor, a forerunner and a treasure for his parents and an answered intercessor. 
O Allah, make him weigh heavily in their scales (of good) and magnify their reward.
Make him join the righteous of the believers. 
Place him in the care of Ibrahim. 
Save him by Your mercy from the torment of Hell. 
Give him a home better than his home, 
and a family better than his family. 
O Allah, forgive those who have gone (i.e. passed away) before us, our children lost (by death), and those who have preceded us in Faith.', NULL, 1, NULL, NULL, NULL, NULL, NULL, 'Ibn Qudamah, Al-Mughni 3/416 and Ad-Duroosul-Muhimmah li-Aammatil-''Ummah, 
pg. 15, by Shaikh ''Abdul-''Aziz bin Baz.', NULL, 'c033c82b1993b7afb4167f9cfc1369bc1612a0bae404f60b48099df200456fea', 'اللهم اعذه من عذاب القبر وان قال اللهم اجعله فرطا وذخرا لوالديه وشفيعا مجابا اللهم ثقل به موازينها واعظم به اجورهما والحقه بصالح المومنين واجعله في كفاله ابراهيم وقه برحمتك عذاب الجحيم وابدله دارا خيرا من داره واهلا خيرا من اهله اللهم اغفر لاسلافنا وافراطنا ومن سبقنا بالايمان فحسن', 1, TRUE, 'published'),
  (162, 'hisn-162', 56, 'hisn-al-muslim', 162, 'اللهُـمِّ اجْعَلْـهُ لَنا فَرَطـاً، وَسَلَـفاً وَأَجْـراً', 'Allāhumma’j`alhu lanā faraṭan, wa salafan, wa ajra.', 'O Allah, make him for us a precursor, a forerunner and a cause of reward.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Hasan (Al-Basri) used to recite Surat Al-Fatihah for a child''s funeral and then say this. Al-Bukhari, Kitabul-Jana''iz, p. 65.', 'Hasan', '8447e7adfa80a96f93a3b51ac05808eef294132106026b7040652fb1867825f2', 'اللهم اجعله لنا فرطا وسلفا واجرا', 1, TRUE, 'published'),
  (163, 'hisn-163', 57, 'hisn-al-muslim', 163, '"إن لله ما أخذ
وله ما أعطى .
وكل شيء عنده بأجل مُسمى ...
فلتصبر ولتحتسب "

وإن قال :
"أعظم الله أجرك ،
وأحسن عزاءك
وغفر لميتك"
فحسن', 'Inna lillāhi mā akhadh, 
wa lahu mā a`tā, 
wa kullu shay''in `indahu bi ajalin musammā . . . 
faltaṣbir wa ‘l-taḥtasib .', '[Also good to say:] 
A`ẓamallāhu ajrak, 
wa ''aḥsana `azā''ak,
wa ghafara limayyitik.

Surely, Allah takes what is His, 
and what He gives is His, 
and to all things He has appointed a time... 
so have patience and be rewarded.1

May Allah magnify your reward, 
and make perfect your bereavement, 
and forgive your departed.2', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, '1 Al-Bukhari 2/80, Muslim 2/636.
2An-Nawawi, Kitabul-''Athkar, p. 126.', NULL, 'ab04003abb764f9a694ed3d4ac09d68a0016e5546b3d27e88173e28d8b8da069', 'ان لله ما اخذ وله ما اعطي وكل شيء عنده باجل مسمي فلتصبر ولتحتسب وان قال اعظم الله اجرك واحسن عزاءك وغفر لميتك فحسن', 1, TRUE, 'published'),
  (164, 'hisn-164', 58, 'hisn-al-muslim', 164, 'بِسْـمِ اللهِ
وَعَلـى سُـنَّةِ رَسـولِ الله', 'Bismillāh
wa `alā sunnati Rasūlillāh.', 'With the Name of Allah, 
and according to the Sunnah of the Messenger of Allah.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 3/314 with an authentic chain. Ahmad also recorded it with the 
wording: With the Name of Allah, and according to the religion of the 
Messenger of Allah. Its chain is also authentic.', 'Sahih', 'bd3d842a4c528a665be343f1285fdf6683065bbb7215211a509e49ac28e8b538', 'بسم الله وعلي سنه رسول الله', 1, TRUE, 'published'),
  (165, 'hisn-165', 59, 'hisn-al-muslim', 165, 'اللَّهُمَّ اغْفِرْ لَهُ
اللَّهُمَّ ثَبِّتْهُ', 'Allāhumma’ghfir lah
Allāhumma thabbit’h.', 'O Allah, forgive him. 
O Allah, strengthen him.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'The Prophet (ﷺ) used to stop after burying the dead and say to the 
people: "Ask Allah to forgive your brother and pray for him to be 
strengthened, for indeed he is now being questioned." Abu Dawud 3/315, and 
Al-Hakim 1/370 who graded it authentic and Ath-Thahabi agreed.', 'Sahih', '760e4e277be462585ff8fa4b36da22a2575ca8f21ff54e364fd36e337e81d3ca', 'اللهم اغفر له اللهم ثبته', 1, TRUE, 'published'),
  (166, 'hisn-166', 60, 'hisn-al-muslim', 166, 'السَّلامُ عَلَـيْكُمْ أَهْلَ الدِّيارِ مِنَ المؤْمِنيـنَ وَالْمُسْلِمين،
وَإِنّا إِنْ شاءَ اللهُ بِكُـمْ لاحِقـون،
نَسْـاَلُ اللهَ لنـا وَلَكُـمْ العـافِيَة', 'Assalāmu `alaykum ahlad-diyāri minal-mu''minīna wa ‘l-muslimīn, 
wa innā in shā'' Allāhu bikum lāḥiqūn 
nas''alullāha lanā wa lakumul-`āfiyah.', 'Peace be upon you, people of this abode, from among the believers and those who are Muslims, 
and we, by the Will of Allah, shall be joining you. 
[May Allah have mercy on the first of us and the last of us] 
I ask Allah to grant us and you well-being.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/671, Ibn Majah 1/494, the portion brackets is from Muslim 2/671.', NULL, 'dac161be0dbb0c86101ae5e58d49cec520da86b54b99893842cd673b5dae4107', 'السلام عليكم اهل الديار من المومنين والمسلمين وانا ان شاء الله بكم لاحقون نسال الله لنا ولكم العافيه', 1, TRUE, 'published'),
  (167, 'hisn-167', 61, 'hisn-al-muslim', 167, 'اللّهُـمَّ إِنَّـي أَسْـأَلُـكَ خَيْـرَها،
وَأَعـوذُ بِكَ مِنْ شَـرِّها', 'Allāhumma innī as''aluka khayrahā, 
wa a`ūdhu bika min sharrihā.', 'O Allah, I ask You for the good of it, 
and seek refuge in You against its evil.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/326, Ibn Majah 2/1228. See also Al-Albani, Sahih Ibn Majah 
2/305.', 'Sahih', '5a6e856dbc32a628fc6f494944722876efa4a09c83fbccff8f25b9d2ac9d3f7d', 'اللهم اني اسالك خيرها واعوذ بك من شرها', 1, TRUE, 'published'),
  (168, 'hisn-168', 61, 'hisn-al-muslim', 168, 'اللّهُـمَّ إِنَّـي أَسْـأَلُـكَ خَيْـرَها،
وَخَيْـرَ ما فيهـا،
وَخَيْـرَ ما اُرْسِلَـتْ بِه،
وَأَعـوذُ بِكَ مِنْ شَـرِّها،
وَشَـرِّ ما فيهـا،
وَشَـرِّ ما اُرْسِلَـتْ بِه', 'Allāhumma innī as''aluka khayrahā, 
wa khayra mā fīhā, 
wa khayra mā ursilat bih, 
wa a`ūdhu bika min sharrihā, 
wa sharri mā fīhā, 
wa sharri mā ursilat bih.', 'O Allah, I ask You for the good of it, 
for the good of what it contains,
and for the good of what is sent with it. 
I seek refuge in You from the evil of it,
from the evil of what it contains,
and from the evil that is sent with it.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Muslim 2/616, Al-Bukhari 4/76.', NULL, 'b3d94d1a70a50870d77dfd37664849efd6ca3bc4aedd66abc42b129d055bf8e7', 'اللهم اني اسالك خيرها وخير ما فيها وخير ما ارسلت به واعوذ بك من شرها وشر ما فيها وشر ما ارسلت به', 1, TRUE, 'published'),
  (169, 'hisn-169', 62, 'hisn-al-muslim', 169, 'سُبْـحانَ الّذي يُسَبِّـحُ الـرَّعْدُ بِحَمْـدِهِ،
وَالملائِكـةُ مِنْ خيـفَته', 'Subḥāna ‘l-ladhī yusabbiḥur-ra`du bi ḥamdihi 
wa ‘l-malā''ikatu min khīfatih.', 'Glory is to Him Whom thunder and angels glorify due to fear of Him.', NULL, 1, NULL, NULL, NULL, NULL, NULL, 'Whenever Abdullah bin Zubair (RA) would hear thunder, he would abandon all 
conversation and say this supplication. See Al-Muwatta'' 2/992. It was 
graded authentic by Al-Albani as a statement of Abdullah bin Zubayr only.', 'Sahih', 'c4f1841dae51533d409ecef4adc65f5af363572a20fb21a6b0262d47f14fb6c9', 'سبحان الذي يسبح الرعد بحمده والملايكه من خيفته', 1, TRUE, 'published'),
  (170, 'hisn-170', 63, 'hisn-al-muslim', 170, 'اللّهُمَّ اسْقِـنا غَيْـثاً مُغيـثاً مَريئاً مُريـعاً،
نافِعـاً غَيْـرَ ضار،
عاجِـلاً غَـيْرَ آجِل', 'Allāhumma ‘asqinā ghaythan mughīthan marī''an murī`a, 
nāfi`an ghayra ḍārr, 
`ājilan ghayra ājil.', 'O Allah, shower upon us abundant rain, beneficial not harmful, swiftly and not delayed.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 1/303. See also Al-Albani SahihAbu Dawud 1/216.', 'Sahih', '255adead453fd831e04b1b7e537d95f427f0d2c3cf03964b389459f7001bcafe', 'اللهم اسقنا غيثا مغيثا مرييا مريعا نافعا غير ضار عاجلا غير اجل', 1, TRUE, 'published'),
  (171, 'hisn-171', 63, 'hisn-al-muslim', 171, 'اللّهُمَّ أغِثْنـا،
اللّهُمَّ أغِثْنـا،
اللّهُمَّ أغِثْنـا', 'Allāhumma aghithnā, 
Allāhumma aghithnā, 
Allāhumma aghithnā.', 'O Allah, send us rain. 
O Allah, send us rain. 
O Allah, send us rain.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/224, Muslim 2/613.', NULL, '1ca86d71a652ac052052767b2c18620b5ec5401d707610c0800f7272ffc92b64', 'اللهم اغثنا اللهم اغثنا اللهم اغثنا', 1, TRUE, 'published'),
  (172, 'hisn-172', 63, 'hisn-al-muslim', 172, 'اللّهُمَّ اسْقِ عِبادَكَ وَبَهـائِمَك،
وَانْشُـرْ رَحْمَـتَكَ
وَأَحْيِي بَلَـدَكَ المَيِّـت', 'Allāhumma’sqi `ibādaka wa bahā''imak, 
wanshur raḥmatak, 
wa aḥyi baladaka ‘l-mayyit', 'O Allah, give water to Your slaves, and Your livestock, 
and spread Your mercy, 
and revive Your dead land.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 1/305. Al-Albani graded it good in Sahih Abu Dawud 1/218.', 'Sahih', '7fecd2879aa1030101d6539d6b7e9d9b2a9abd4e8f550ac21d3899ae517ffb69', 'اللهم اسق عبادك وبهايمك وانشر رحمتك واحيي بلدك الميت', 1, TRUE, 'published'),
  (173, 'hisn-173', 64, 'hisn-al-muslim', 173, 'اللّهُمَّ صَيِّـباً نافِـعاً', 'Allāhumma ṣayyiban nāfi`a.', 'O Allah, (bring) beneficial rain clouds.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 2/518.', NULL, '99f16319b675a3bdfbae88371509ee41beaf913dea84643f5ea9e18de9da18db', 'اللهم صيبا نافعا', 1, TRUE, 'published'),
  (174, 'hisn-174', 65, 'hisn-al-muslim', 174, 'مُطِـرْنا بِفَضْـلِ اللهِ وَرَحْمَـتِه', 'Muṭirnā bifaḍlillāhi wa raḥmatih.', 'We have been given rain by the grace and mercy of Allah.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/205, Muslim 1/83.', NULL, '06e56b4b0e9073116b89cbc58d58d871cb830758c815624d477ed8d5c599e84c', 'مطرنا بفضل الله ورحمته', 1, TRUE, 'published'),
  (175, 'hisn-175', 66, 'hisn-al-muslim', 175, 'اللّهُمَّ حَوالَيْنا وَلا عَلَيْـنا،
اللّهُمَّ عَلى الآكـامِ وَالظِّـراب،
وَبُطـونِ الأوْدِية، وَمَنـابِتِ الشَّجـر', 'Allāhumma ḥawālaynā wa lā `alaynā. 
Allāhumma `ala ‘l-ākāmi waẓ-ẓirāb, 
wa buṭūni ‘l-awdiyati, wa manābitish-shajar.', 'O Allah, let the rain fall around us and not upon us, 
O Allah, (let it fall) on the pastures, hills, valleys, and the roots of trees.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 1/224, Muslim 1/614', NULL, '8b24cde4abb60252baf386a73ab247fb0b898f2d3dc2eb524d2a812d8f29a4e5', 'اللهم حوالينا ولا علينا اللهم علي الاكام والظراب وبطون الاوديه ومنابت الشجر', 1, TRUE, 'published'),
  (176, 'hisn-176', 67, 'hisn-al-muslim', 176, 'اللهُ أَكْـبَر،
اللّهُمَّ أَهِلَّـهُ عَلَيْـنا بِالأمْـنِ وَالإيمـان،
والسَّلامَـةِ والإسْلام،
وَالتَّـوْفيـقِ لِما تُحِـبُّ رَبَّنـا وَتَـرْضـى،
رَبُّنـا وَرَبُّكَ الله', 'Allāhu Akbar, 
Allāhumma ahillahu `alayna bi ‘l-amni wa ‘l-īmān,
was-salāmati wa ‘l-''Islām, 
wat-tawfīqi limā tuḥibbu Rabbanā wa tarḍā, 
Rabbunā wa Rabbukallāh.', 'Allah is the Most Great. 
O Allah, bring us the new moon with security and Faith, 
with peace and in Islam, 
and in harmony with what our Lord loves and what pleases Him. 
Our Lord and your Lord is Allah.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/504, Ad-Darimi 1/336. See also Al-Albani, Sahih At-Tirmidhi 
3/157.', 'Sahih', '26e83be82baf35cb6ddcfcd216736a19ad05834410959dd9092f92b209640f32', 'الله اكبر اللهم اهله علينا بالامن والايمان والسلامه والاسلام والتوفيق لما تحب ربنا وترضي ربنا وربك الله', 1, TRUE, 'published'),
  (177, 'hisn-177', 68, 'hisn-al-muslim', 177, 'ذَهَـبَ الظَّمَـأُ،
وَابْتَلَّـتِ العُـروق،
وَثَبَـتَ الأجْـرُ إِنْ شـاءَ الله', 'Dhahabaẓ-ẓama'', 
wabtallati ‘l-`urūq, 
wa thabata ‘l-''ajru in shā Allāh.', 'The thirst is gone,
the veins are moistened, 
and the reward is confirmed, if Allah wills.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/306 and others. See also Al- Albani, Sahihul-Jami'' As-Saghir 
4/209.', 'Sahih', 'f9d882b0ef715474e47f39490e6e0ffb843ce21543b08d9e8d1e054bb1d623c2', 'ذهب الظما وابتلت العروق وثبت الاجر ان شاء الله', 1, TRUE, 'published'),
  (178, 'hisn-178', 68, 'hisn-al-muslim', 178, 'اللّهُـمَّ إِنَّـي أَسْـأَلُـكَ بِرَحْمَـتِكَ الّتي وَسِـعَت كُلَّ شيء،
أَنْ تَغْـفِرَ لي', 'Allāhumma innī as''aluka 
bi raḥmatika ‘l-latī wasi`at kulla shay'' 
an taghfira lī.', 'O Allah, I ask You by Your mercy, which encompasses all things, that You forgive me.', NULL, 1, NULL, NULL, NULL, 'ibn-majah', NULL, 'Ibn Majah 1/557 from a supplication of Abdullah bin ''Amr. Al-Hafidh graded 
it as good in his checking of An-Nawawi''s Kitabul-''Athkdr. See Sharhul- 
Athkar 4/342.', 'Hasan', '50d1d18c9275cfec5fda5d2f43c0b39c9c44049122320b0a6f5604797b9d0722', 'اللهم اني اسالك برحمتك التي وسعت كل شيء ان تغفر لي', 1, TRUE, 'published'),
  (179, 'hisn-179', 69, 'hisn-al-muslim', 179, 'إِذَا أَكَلَ أَحَدُكُمْ طَعَاماً فَلْيَقُلْ
بِسْمِ اللَّهِ،
فَإِنْ نَسِيَ فِي أَوَّلِهِ فَلْيَقُلْ
بسمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', 'When anyone of you begins eating, say:
Bismillāh.
And if you forget then when you remember, say:
Bismillāhi fī awwalihi wa ākhirih.', 'When anyone of you begins eating, say:

With the Name of Allah.

And if you forget then, when you remember, say:

With the Name of Allah, in the beginning, and in the end.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 3/347, At-Tirmidhi 4/288. See Al- Albani''s Sahih At-Tirmidhi 
2/167.', 'Sahih', 'db2ebc8d8a3e40197cdba77ceeb095869ba3e2dbb9ecd3b8de3f4d273127722c', 'اذا اكل احدكم طعاما فليقل بسم الله فان نسي في اوله فليقل بسم الله في اوله واخره', 1, TRUE, 'published'),
  (180, 'hisn-180', 69, 'hisn-al-muslim', 180, 'مَنْ أَطْعَمَهُ اللَّهُ الطَّعَامَ فَلْيَقُلْ:
"اللَّهُمَّ بَارِكْ لَنَا فِيهِ
وَأَطْعِمْنَا خَيْراً مِنْهُ"،
وَمَنْ سَقَاهُ اللَّهُ لَبَناً فَلْيَقُلْ
"اللَّهُمَّ بَارِكْ لَنَا فِيهِ
وَزِدْنَا مِنْهُ"', 'Whomever Allah has given food, should say:
Allāhumma bārik lanā fīhi,
wa aṭ`imnā khayran minh.', 'Whomever Allah has given milk to drink, should say :
Allāhumma bārik lanā fīhi,
wa zidnā minh.

Whomever Allah has given food, should say:

O Allah, bless us in it and provide us with better than it.

Whomever Allah has given milk to drink, should say :

O Allah, bless us in it and give us more of it.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/506. See also Al-Albani, Sahih At-Tirmidhi 3/158.', 'Sahih', 'ed887e6247090b700dd608b18188b0629bd8cb96086f1255822e9ce10fd68981', 'من اطعمه الله الطعام فليقل اللهم بارك لنا فيه واطعمنا خيرا منه ومن سقاه الله لبنا فليقل اللهم بارك لنا فيه وزدنا منه', 1, TRUE, 'published'),
  (181, 'hisn-181', 70, 'hisn-al-muslim', 181, 'الْحَمْـدُ للهِ الَّذي أَطْعَمَنـي هـذا
وَرَزَقَنـيهِ مِنْ غَـيْرِ حَوْلٍ مِنِّي وَلا قُوَّة', 'Alhamdu lillāhi ‘l-ladhī aṭ`amanī hādhā, 
wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah.', 'Praise is to Allah Who has given me this food, 
and sustained me with it though I was unable to do it and powerless.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi, Abu Dawud, and Ibn Majah. See also Al-Albani, Sahih 
At-Tirmidhi 3/159.', 'Sahih', '3a2653bddd388d4954c09060ed439887ed8f9f09b309481efce48c8dc2f14e1c', 'الحمد لله الذي اطعمني هذا ورزقنيه من غير حول مني ولا قوه', 1, TRUE, 'published'),
  (182, 'hisn-182', 70, 'hisn-al-muslim', 182, 'الْحَمْـدُ للهِ حَمْـداً كَثـيراً طَيِّـباً مُبـارَكاً فيه،
غَيْرَ مَكْفِيٍّ وَلا مُوَدَّعٍ وَلا مُسْتَغْـنىً عَنْـهُ رَبَّـنا', 'Alhamdu lillāhi ḥamdan kathīran tayyiban mubārakan fīh, 
ghayra makfiyyin wa lā muwadda`in, 
wa lā mustaghnan `anhu Rabbanā.', 'All praise is to Allah, praise in abundance, good and blessed. It cannot [be compensated for, nor can it] be left, nor can it be done without, our Lord.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 6/214, At-Tirmidhi 5/507.', NULL, 'a1c458379359cdc636b146943c7286896eca48d0fb63d67476939641c79ce2c2', 'الحمد لله حمدا كثيرا طيبا مباركا فيه غير مكفي ولا مودع ولا مستغني عنه ربنا', 1, TRUE, 'published'),
  (183, 'hisn-183', 71, 'hisn-al-muslim', 183, 'اللّهُـمَّ بارِكْ لَهُمْ فيما رَزَقْـتَهُم،
وَاغْفِـرْ لَهُـمْ وَارْحَمْهُمْ', 'Allāhumma bārik lahum fī mā razaqtahum, 
wagh’fir lahum warḥamhum.', 'O Allah, bless them in what You have provided for them, 
and forgive them and have mercy on them.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 3/1615.', NULL, '6e1ca65be3112bbce0f62c6b19550a8a6b8dea2a63b76107239cbef0070aa4e5', 'اللهم بارك لهم فيما رزقتهم واغفر لهم وارحمهم', 1, TRUE, 'published'),
  (184, 'hisn-184', 72, 'hisn-al-muslim', 184, 'اللّهُـمَّ أَطْعِمْ مَن أَطْعَمَني،
وَاسْقِ مَن سقاني', 'Allāhumma aṭ`im man aṭ`amanī 
wasqi man saqānī.', 'O Allah, feed the one who has fed me,
and give drink to the one who has given me drink.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 3/126.', NULL, 'addf86b26590620ff5464ab5a7d0cfc54073e0bd7b5c1eedfede38460f008bb6', 'اللهم اطعم من اطعمني واسق من سقاني', 1, TRUE, 'published'),
  (185, 'hisn-185', 73, 'hisn-al-muslim', 185, 'أَفْطَـرَ عِنْدَكُم الصّـائِمونَ
وَأَكَلَ طَعامَـكُمُ الأبْـرار،
وَصَلَّـتْ عَلَـيْكُمُ الملائِكَـة', 'Afṭara `indakumuṣ-ṣā''imūn, 
wa akala ṭa`āmakumu ‘l-''abrār, 
wa ṣallat `alaykumu ‘l-malā''ikah.', 'With you, those who are fasting have broken their fast, 
you have fed those who are righteous, 
and the angels recite their prayers upon you.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 3/367, Ibn Majah 1/556, An-Nasa''i, ''Amalul-Yawm wal-Laylah 296-8. 
Al-Albani graded it authentic in Sahih Abu Dawud 2/730.', 'Sahih', '20238f63f7fdd463ee4c403ed130772c1455f5f8a8e61fe4bde688efc143b649', 'افطر عندكم الصايمون واكل طعامكم الابرار وصلت عليكم الملايكه', 1, TRUE, 'published'),
  (186, 'hisn-186', 74, 'hisn-al-muslim', 186, '(إِذَا دُعِيَ أَحَدُكُمْ فَلْيُجِبْ، فَإِنْ كَانَ صَائِماً فَلْيُصَلِّ، وَإِنْ كَانَ مُفْطِراً فَلْيَطْعَمْ) ، وَمَعْنَى فَلْيُصَلِّ أَيْ فَلْيَدْعُ.', '--', 'When you are invited (to eat) then reply to the invitation. 
If you are fasting then invoke Allah''s blessings (on your host), 
and if you are not fasting then eat.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/1054.', NULL, 'ceb4ad48d43203888639547caeee72f90a7f097f72d11d6c788c82096eb6086f', 'اذا دعي احدكم فليجب فان كان صايما فليصل وان كان مفطرا فليطعم ومعني فليصل اي فليدع', 1, TRUE, 'published'),
  (187, 'hisn-187', 75, 'hisn-al-muslim', 187, 'إِنِّي صَائِمٌ،
إِنِّي صَائِمٌ', 'Innī  ṣā''im,
innī  ṣā''im.', 'I am fasting. 
I am fasting.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-BAri 4/103, Muslim 2/806.', NULL, 'f47de94da9c6dcd5262d4090a5bbe91521b17dfd9ea66ede68f640a9e58b3d5c', 'اني صايم اني صايم', 1, TRUE, 'published'),
  (188, 'hisn-188', 76, 'hisn-al-muslim', 188, 'اللّهُـمَّ بارِكْ لَنا في ثَمَـرِنا،
وَبارِكْ لَنا في مَدينَتِنـا،
وَبارِكْ لَنا في صاعِنـا،
وَبارِكْ لَنا في مُدِّنا', 'Allahumma bārik lanā fī thamarinā, 
wa bārik lanā fī madīnatinā 
wa bārik lanā fī  ṣā`inā, 
wa bārik lanā fī muddinā.', 'O Allah, bless us in our dates and bless us in our town, 
bless us in our Sa'' and in our Mudd.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/1000 (Sa'' and Mudd are both dry measures used for agricultural 
produce by the Arabs in the Prophet''s time. Of the two, the So.'' was the 
larger measure.) (Translator)', NULL, '5b125617d722475479fe20ef4918a3a58d3c632eb8e373167aeb4514e82e3c82', 'اللهم بارك لنا في ثمرنا وبارك لنا في مدينتنا وبارك لنا في صاعنا وبارك لنا في مدنا', 1, TRUE, 'published'),
  (189, 'hisn-189', 77, 'hisn-al-muslim', 189, 'إِذَا عَطَسَ أَحَدُكُم فَلْيَقُلِ (الْحَمْدُ لِلَّهِ)، وَلْيَقُلْ لَهُ أَخُوهُ أَوْ صَاحِبُهُ: (يَرْحَمُكَ اللَّهُ)، فَإِذَا قَالَ لَهُ: (يَرحَمُكَ اللَّهُ)، فَلْيَقُلْ: (يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ)', 'When you sneeze , then say :
Alḥamdulillāh', 'Your companion should say :
Yarḥamukallāh

When someone says Yarḥamukallāh to you then you should say:
Yahdīkumu ‘llāhu wa yuṣliḥu bālakum.

When you sneeze, then say:
All praises and thanks are to Allah.

Your companion should say:
May Allah have mercy upon you.

When someone says Yarḥamukallāh to you then you should say:
May Allah guide you and set your affairs in order.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/125.', NULL, 'df24c527e17e686082f4f1accd966167a5ea76aeaf586f038ccad8013c867c4a', 'اذا عطس احدكم فليقل الحمد لله وليقل له اخوه او صاحبه يرحمك الله فاذا قال له يرحمك الله فليقل يهديكم الله ويصلح بالكم', 1, TRUE, 'published'),
  (190, 'hisn-190', 78, 'hisn-al-muslim', 190, 'يَهْـديكُـمُ اللهُ وَيُصْـلِحُ بالَـكُم', 'Yahdīkumullāhu wa yuṣliḥu bālakum.', 'May Allah guide you and set your affairs in order', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/82, Ahmad 4/400, Abu Dawud 4/ 308. See also Al-Albani, Sahih 
At-Tirmidhi 2/354.', 'Sahih', '1e74734036e90d6bc4bc8629df6c4a92a7f116e1ee404dc52dc00b4ff751d840', 'يهديكم الله ويصلح بالكم', 1, TRUE, 'published'),
  (191, 'hisn-191', 79, 'hisn-al-muslim', 191, 'بارَكَ اللّهُ لَك،
وَبارَكَ عَلَـيْك،
وَجَمَعَ بَيْـنَكُما في خَـيْر', 'Bārakallāhu lak, 
wa bāraka `alayk, 
wa jama`a baynakumā fī khayr.', 'May Allah bless you,
and shower His blessings upon you, 
and join you together in goodness.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah and At-Tirmidhi. See also Al-Albani, Sahih At-Tirmidhi 
1/316.', 'Sahih', '68635263a6e5f18a04eb6d941292ddbaabd5f3f74d08e61181c2791a417172d8', 'بارك الله لك وبارك عليك وجمع بينكما في خير', 1, TRUE, 'published'),
  (192, 'hisn-192', 80, 'hisn-al-muslim', 192, 'إِذَا تَزَوَّجَ أَحَدُكُمُ امْرَأَةً، أَوْ إِذَا اشْتَرَى خَادِماً فَلْيَقُلْ:
(اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا،
وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ،
وَأَعُوذُ بِكَ مِنْ شَرِّهَا،
وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ)،
وَإِذَا اشْتَرَى بَعِيراً فَلْيَأْخُذْ بِذِرْوَةِ سَنَامِهِ وَلْيَقُلْ مِثْلَ ذَلِكَ.', 'When any of you marries a woman or purchases a maid-servant then let him say:
Allāhumma innī as''aluka khayrahā 
wa khayra mā jabaltahā `alayh,
wa a`ūdhu bika min sharrihā 
wa sharri mā jabaltahā `alayh.', 'When any of you marries a woman or purchases a maid-servant then let him say :

O Allah, I ask You for the goodness of her,
and the goodness upon which You have created her,
and I seek refuge in You from the evil of her, 
and from the evil upon which You have created her.

If you purchase a camel then take hold of the top of its hump and say the same.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/248 and Ibn Majah 1/617. See also Al-Albani, Sahih Ibn Majah 
1/324.', 'Sahih', 'f28d2f984a9037dd6ae49b87ee6fbd9cecd680b93ed797da1540f75daa152f92', 'اذا تزوج احدكم امراه او اذا اشتري خادما فليقل اللهم اني اسالك خيرها وخير ما جبلتها عليه واعوذ بك من شرها وشر ما جبلتها عليه واذا اشتري بعيرا فلياخذ بذروه سنامه وليقل مثل ذلك', 1, TRUE, 'published'),
  (193, 'hisn-193', 81, 'hisn-al-muslim', 193, 'بِسْمِ الله
اللّهُـمَّ جَنِّبْنا الشَّيْـطانَ،
وَجَنِّبِ الشَّـيْطانَ ما رَزَقْـتَنا', 'Bismillāh. 
Allāhumma jannibnash-Shayṭān, 
wa jannibish-Shayṭāna mā razaqtanā.', 'With the Name of Allah. 
O Allah, keep the Devil away from us, 
and keep the Devil away from that which You provide for us.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 6/141, Muslim 2/1028.', NULL, '226143ab19914302f89985cb8bd69b55486f4adf02a3e36d629b255eca7a0911', 'بسم الله اللهم جنبنا الشيطان وجنب الشيطان ما رزقتنا', 1, TRUE, 'published'),
  (194, 'hisn-194', 82, 'hisn-al-muslim', 194, 'أَعـوذُ بِاللهِ مِنَ الشَّيْـطانِ الرَّجيـم', 'A`ūdhu billāhi minash-Shayṭānir-rajīm.', 'I seek refuge in Allah from Satan the outcast.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/99, Muslim 4/2015.', NULL, 'f7ebedf6e17ba28b7454d8a3e62b40a1e8c15b1cc36a88086f1a83e6e05ecd75', 'اعوذ بالله من الشيطان الرجيم', 1, TRUE, 'published'),
  (195, 'hisn-195', 83, 'hisn-al-muslim', 195, 'الْحَمْـدُ للهِ الّذي عافاني مِمّا ابْتَـلاكَ بِهِ،
وَفَضَّلَـني عَلى كَثيـرٍ مِمَّنْ خَلَـقَ تَفْضـيلا', 'Alhamdu lillāhi ‘l-ladhī `āfānī mimmab-talāka bihi 
wa faḍḍalanī `alā kathīrin mimman khalaqa tafḍīlā.', 'Praise is to Allah Who has spared me what He has afflicted you with, 
and preferred me greatly above much of what He has created.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/493,4. See also Al-Albani, Sahih At-Tirmidhi 3/153.', 'Sahih', 'c0d787741247be8ca09c7d019203aa91e9d62bb3ee0fefe102a6b1ddaf38a3e4', 'الحمد لله الذي عافاني مما ابتلاك به وفضلني علي كثير ممن خلق تفضيلا', 1, TRUE, 'published'),
  (196, 'hisn-196', 84, 'hisn-al-muslim', 196, 'عن ابن عمر قال : كان يعد لرسول الله صلى الله عليه وسلم في المجلس الواحد مائة مرة من قبل أن يقوم
"رب اغفر لي
وتب علي
إنك أنت التواب الغفور"', 'Ibn Umar (ra) said: Allah''s Messenger (ﷺ) used to repeat in a single sitting:
Rabbigh’fir lī 
wa tub `alayy 
innaka antat-Tawwābu ‘l-Ghafūr.', 'Ibn Umar (ra) said: Allah''s Messenger (ﷺ) used to repeat in a single sitting:

My Lord, forgive me,
and accept my repentance, 
You are the Ever-Relenting, the All-Forgiving.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Sahih Ibn Majah 2/321. See also Al-Albani, Sahih At-Tirmidhi 3/153.', 'Sahih', '91998edb978e1a6237fc9c55fb9ac27754bd2519d30db5a5e90ddb940e213368', 'عن ابن عمر قال كان يعد لرسول الله صلي الله عليه وسلم في المجلس الواحد مايه مره من قبل ان يقوم رب اغفر لي وتب علي انك انت التواب الغفور', 1, TRUE, 'published'),
  (197, 'hisn-197', 85, 'hisn-al-muslim', 197, 'سُبْحـانَكَ اللّهُـمَّ وَبِحَمدِك،
أَشْهَـدُ أَنْ لا إِلهَ إِلاّ أَنْتَ
أَسْتَغْفِرُكَ وَأَتوبُ إِلَـيْك', 'Subhānaka Allāhumma wa biḥamdik, 
ash-hadu an lā ilāha illā ant,
astaghfiruka wa atību ilayk.', 'Glory is to You, O Allah, and praise is to You. 
I bear witness that there is none worthy of worship but You. 
I seek Your forgiveness and repent to You.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', '308', 'Abu Dawud, Ibn Majah, At-Tirmidhi and An-Nasa''i. See also Al-Albani, Sahih 
At-Tirmidhi 3/ 153. Aishah (RA) said: "Allah''s Messenger (ﷺ) did not sit 
in a gathering, and did not recite the Qur''an, and did not perform any 
prayer without concluding by saying ... (then she quoted the above)." This 
was reported by An-Nasa''i in ''Amalul-Yawm wal-Laylah (no.308), and Dr. 
Farooq Hamadah graded it authentic in his checking of the same book, p. 
273. See also Ahmad 6/77', 'Sahih', '63ac0d7774ced017c78a63e097eb59eab16aa01b18df165582d8edc7b614f3fd', 'سبحانك اللهم وبحمدك اشهد ان لا اله الا انت استغفرك واتوب اليك', 1, TRUE, 'published'),
  (198, 'hisn-198', 86, 'hisn-al-muslim', 198, 'وَلَكَ', 'Walaka', 'And you.', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'Ahmad 5/82, and An-Nasa''i in ''Amalul-Yawm wal-Laylah p. 218, with checking 
by Dr. Farooq Hamadah.', NULL, 'fe324bcd2c0c0f674b7c16fe7889c26055495c4932f50256fbda8e4bd1e398f8', 'ولك', 1, TRUE, 'published'),
  (199, 'hisn-199', 87, 'hisn-al-muslim', 199, 'جَزاكَ اللهُ خَـيْراً', 'Jazākallāhu khayra.', 'May Allah reward you with good.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', '2035', 'At-Tirmidhi (no. 2035). See also Al-Albani, Sahih At-Tirmidhi 2/200 and 
Sahihul-Jami'' (no. 6244).', 'Sahih', '64c35438ed60c622d02746f9a71628152b7b3970256a6e5e7cac56d8401ba12f', 'جزاك الله خيرا', 1, TRUE, 'published'),
  (200, 'hisn-200', 88, 'hisn-al-muslim', 200, '.(مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ) ، وَالْاسْتِعَاذَةُ بِاللَّهِ مِنْ فِتْنَتِهِ عَقِبَ التَّشَهُّدِ الْأَخِيرِ مِنْ كُلِّ صَلاَةٍ.', '--', 'Whoever memorizes ten ''Ayat (Verses) from the beginning of Surat Al-Kahf, will be protected from the False Messiah 1 
if he recites in every prayer after the final Tashahhud before ending the prayer, seeking the protection of Allah from the trials of the False Messiah.', NULL, 1, NULL, NULL, NULL, 'muslim', '55', '1 Muslim 1/555, another version mentions the last ten ''Ayat, Muslim 1/556.
2 See invocations no. 55 and 56 of this book.', NULL, '76402854517f5a44540048fae054fd0e38fe3248352267b96307777db04f30a3', 'من حفظ عشر ايات من اول سوره الكهف عصم من الدجال والاستعاذه بالله من فتنته عقب التشهد الاخير من كل صلاه', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (201, 'hisn-201', 89, 'hisn-al-muslim', 201, 'أَحَبَّـكَ الّذي أَحْبَبْـتَني لَه', 'Aḥabbaka ‘lladhī aḥbabtanī lah.', 'May He for Whose sake you love me, love you.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/333. Al-Albani graded it good in Sahih Abu Dawud 3/965.', 'Sahih', '7179fc6cc0b69e0f7c79860da5e3aee86775900d152474c6a80d90f37eb3b479', 'احبك الذي احببتني له', 1, TRUE, 'published'),
  (202, 'hisn-202', 90, 'hisn-al-muslim', 202, 'بارَكَ اللهُ لَكَ في أَهْلِكَ وَمالِك', 'Bārakallāhu laka fī ahlika wa mālik.', 'May Allah bless you in your family and your property.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-BAri 4/88.', NULL, '6ac0e3cfea1a3b33afc44979da37006d672829950dacff942ce8d016628d8209', 'بارك الله لك في اهلك ومالك', 1, TRUE, 'published'),
  (203, 'hisn-203', 91, 'hisn-al-muslim', 203, 'بارَكَ اللهُ لَكَ في أَهْلِكَ وَمالِك،
إِنَّما جَـزاءُ السَّلَفِ الْحَمْدُ والأَداء', 'Bārakallāhu laka fī ahlika wa mālik, 
innamā jazā''us-salafi ‘l-ḥamdu wa‘l-adā''.', 'May Allah bless you in your family and your wealth, 
surely the reward for a loan is praise and returning (what was borrowed).', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i, ''Amalul-Yawm wal-Laylahp. 300, Ibn Majah 2/809. See also 
Al-Albani, Sahih Ibn Majah2/55.', 'Sahih', '502de230c0655303db30b964a9c49db93b18e206f53f4907ae75ef17a23612f2', 'بارك الله لك في اهلك ومالك انما جزاء السلف الحمد والاداء', 1, TRUE, 'published'),
  (204, 'hisn-204', 92, 'hisn-al-muslim', 204, 'اللّهُـمَّ إِنّـي أَعـوذُبِكَ أَنْ أُشْـرِكَ بِكَ وَأَنا أَعْـلَمْ،
وَأَسْتَـغْفِرُكَ لِما لا أَعْـلَم', 'Allāhumma innī a`ūdhu bika an ushrika bika wa anā a`lam, 
wa astaghfiruka limā lā a`lam.', 'O Allah, I seek refuge in You lest I associate anything with You knowingly, 
and I seek Your forgiveness for what I know not.', NULL, 1, NULL, NULL, NULL, 'ahmad', NULL, 'Ahmad 4/403. See also Al-Albani, Sahihul-Jami'' As-Saghir 3/233 and 
Sahihut-Targhib wat- Tarhib 1/19.', 'Sahih', '15730b6fbfd91caa406c29486d156bc55f0eb953806a8ee7b5f96c445e2e729e', 'اللهم اني اعوذبك ان اشرك بك وانا اعلم واستغفرك لما لا اعلم', 1, TRUE, 'published'),
  (205, 'hisn-205', 93, 'hisn-al-muslim', 205, 'وَفيكَ بارَكَ الله', 'Wafīka bārakallāh.', 'And may Allah bless you.', NULL, 1, NULL, NULL, NULL, NULL, '278', 'Ibn As-Sunni, p. 138, (no. 278). See also Ibn Al-Qayyim, Al-Wdbil 
As-Sayyib, p. 304, with checking by Basheer Muhammad ?Uyoon.', NULL, 'a49e72bf9fc12304b37d23fb5caaee148d16f230f6d724a7ecf5f1bd5a67e2f6', 'وفيك بارك الله', 1, TRUE, 'published'),
  (206, 'hisn-206', 94, 'hisn-al-muslim', 206, 'اللّهُـمَّ لا طَيْـرَ إِلاّ طَيْـرُك،
وَلا خَـيْرَ إِلاّ خَـيْرُك،
وَلا إِلهَ غَيْـرُك', 'Allāhumma lā ṭayra illā ṭayruk, 
wa lā khayra illā khayruk, 
wa lā ilāha ghayruk.', 'O Allah there is no portent other than Your portent, 
no goodness other than Your goodness, 
and none worthy of worship other than You.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', '292', 'Ahmad 2/220, Ibn As-Sunni (no. 292). See also Al-Albani, 
Silsilatul-''Ahadlth As-Sahihah 3/54, (no. 1065). As for bodings of good, 
these used to please the Prophet (ﷺ) and so when he heard good words from 
someone, he used to say: "We have taken from you a good portent from your 
mouth," Abu Dawud, Ahmad. See also Al-Albani, Silsilatul-''Ahadith 
As-Sahihah 2/363, and it is with Abu Ash-Shaikh Al-Asfahani in 
''Akhlaqun-Nabiyy, pg. 270.', 'Sahih', '41c5bcbdd83234d5494b78f68c7c892dd85e5dadd881f556d88ca0b1bb89d24f', 'اللهم لا طير الا طيرك ولا خير الا خيرك ولا اله غيرك', 1, TRUE, 'published'),
  (207, 'hisn-207', 95, 'hisn-al-muslim', 207, 'بِسْـمِ اللهِ
وَالْحَمْـدُ لله،
﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ *
وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ﴾
الحَمْـدُ لله، الحَمْـدُ لله، الحَمْـدُ لله،
اللهُ أكْـبَر، اللهُ أكْـبَر، اللهُ أكْـبَر،
سُـبْحانَكَ اللّهُـمَّ إِنّي ظَلَـمْتُ نَفْسي
فَاغْـفِرْ لي،
فَإِنَّهُ لا يَغْفِـرُ الذُّنوبَ إِلاّ أَنْـت', 'Bismillāh, 
walḥamdulillāh. 
Subḥāna ‘lladhī sakhkhara lanā hādhā
wa mā kunnā lahu muqrinīn. 
Wa innā ilā Rabbinā lamunqalibūn. 
Alḥamdulillāh, alḥamdulillāh, alḥamdulillāh, 
Allāhu Akbar, Allāhu Akbar, Allāhu Akbar, 
Subḥānaka ‘llāhumma innī ẓalamtu nafsī, 
faghfir lī, 
fa innahu lā yaghfirudh-dhunūba illā ant.', 'With the Name of Allah. 
Praise is to Allah. 
Glory is to Him Who has provided this for us
though we could never have had it by our efforts. 
Surely, unto our Lord, we are returning.
Praise is to Allah. Praise is to Allah. Praise is to Allah. 
Allah is the Most Great. Allah is the Most 
Great. Allah is the Most Great. 
Glory is to You. O Allah, I have wronged my own soul. 
Forgive me, 
for surely none forgives sins but You.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 3/34, At-Tirmidhi 5/501. See also Al-Albani, Sahih 
At-Tirmidhi3/156.', 'Sahih', '426061d5af3cf96291fec145d7848dc6d9c229ddb06697efee51ebd978704709', 'بسم الله والحمد لله ﴿سبحان الذي سخر لنا هذا وما كنا له مقرنين وانا الي ربنا لمنقلبون﴾ الحمد لله الحمد لله الحمد لله الله اكبر الله اكبر الله اكبر سبحانك اللهم اني ظلمت نفسي فاغفر لي فانه لا يغفر الذنوب الا انت', 1, TRUE, 'published'),
  (208, 'hisn-208', 96, 'hisn-al-muslim', 208, '"اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ،
﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ *
وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ﴾
اللَّهُمَّ إِنّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى،
وَمِنَ الْعَمَلِ مَا تَرْضَى،
اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا
وَاطْوِ عَنَّا بُعْدَهُ،
اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ،
وَالْخَليفَةُ فِي الْأَهْلِ،
اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ،
وَكَآبَةِ الْمَنْظَرِ،
وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ"، وإذا رَجَعَ قَالَهُنَّ وَزَادَ فِيهِنَّ:
"آيِبُونَ، تائِبُونَ، عَابِدُونَ،
لِرَبِّنَا حَامِدُونَ".', 'Allāhu Akbar, Allāhu Akbar, Allāhu Akbar, 
Subḥāna ‘l-ladhi sakhkhara lanā hādhā 
wa mā kunnā lahu muqrinīn. 
Wa innā ilā Rabbinā lamunqalibūn. 
Allāhumma innā nas''aluka fī safarinā hādha ‘l-birra wat-taqwā, 
Wa mina ‘l-`amali mā tarḍā, 
Allāhumma hawwin `alaynā safaranā hādhā
waṭwi `annā bu`dah, 
Allāhumma antas-sāḥibu fis-safar, 
wa ‘l-khalīfatu fil-ahl, 
Allāhumma innī a`ūdhu bika min wa`thā''is-safar, 
wa ka''ābati ‘l-manẓar, 
wa sū''il-munqalabi fil-māli wa ‘l-ahl.', '(Upon returning recite the same again adding):
Ā’ibūna, tā''ibūna, `ābidūn, 
Li Rabbinā ḥāmidūn.

Allah is the Most Great. Allah is the Most Great. Allah is the Most Great. 
Glory is to Him Who has provided this for us
though we could never have had it by our efforts. 
Surely, unto our Lord we are returning. 
O Allah, we ask You on this our journey for goodness and piety, 
and for works that are pleasing to You. 
O Allah, lighten this journey for us
and make its distance easy for us. 
O Allah, You are our Companion on the road
and the One in Whose care we leave our family. 
O Allah, I seek refuge in You from this journey''s hardships,
and from the wicked sights in store 
and from finding our family and property in misfortune upon returning.

(Upon returning recite the same again adding :)

We return repentant to our Lord, worshipping our Lord,
and praising our Lord.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/978.', NULL, '1bdf25b6c3f6dbedd58f3fac3919d799176a58bb96c5cbc822bbaffe2158e9f9', 'الله اكبر الله اكبر الله اكبر ﴿سبحان الذي سخر لنا هذا وما كنا له مقرنين وانا الي ربنا لمنقلبون﴾ اللهم انا نسالك في سفرنا هذا البر والتقوي ومن العمل ما ترضي اللهم هون علينا سفرنا هذا واطو عنا بعده اللهم انت الصاحب في السفر والخليفه في الاهل اللهم اني اعوذ بك من وعثاء السفر وكابه المنظر وسوء المنقلب في المال والاهل واذا رجع قالهن وزاد فيهن ايبون تايبون عابدون لربنا حامدون', 1, TRUE, 'published'),
  (209, 'hisn-209', 97, 'hisn-al-muslim', 209, 'أللّـهُمَّ رَبَّ السَّـمواتِ السّـبْعِ وَما أَظْلَلَـن،
وَرَبَّ الأَراضيـنَ السّـبْعِ وَما أقْلَلْـن،
وَرَبَّ الشَّيـاطينِ وَما أَضْلَلْـن،
وَرَبَّ الرِّياحِ وَما ذَرَيْـن،
أَسْـأَلُـكَ خَيْـرَ هذهِ الْقَـرْيَةِ
وَخَيْـرَ أَهْلِـها،
وَخَيْـرَ ما فيها،
وَأَعـوذُ بِكَ مِنْ شَـرِّها
وَشَـرِّ أَهْلِـها،
وَشَـرِّ ما فيها', 'Allāhumma Rabbas-samāwātis-sab`i wa mā aẓlaln, 
Wa Rabba ‘l-arāḍīnas-sab`i wa mā aqlaln, 
wa Rabbash-shayāṭīni wa mā aḍlaln, 
wa Rabbar-riyāḥi wa mā dharayn. 
As''aluka khayra hādhihi ‘l-qaryah, 
wa khayra ahlihā, 
wa khayra māfīhā, 
wa a`ūdhu bika min sharrihā, 
wa sharri ahlihā, 
wa sharri mā fīhā.', 'O Allah, Lord of the seven heavens and all they overshadow,
Lord of the seven worlds and all they uphold, 
Lord of the devils and all they lead astray,
Lord of the winds and all they scatter. 
I ask You for the goodness of this town, 
and for the goodness of its people, 
and for the goodness it contains. 
I seek refuge in You from its evil, 
from the evil of its people, 
and from the evil it contains.', NULL, 1, NULL, NULL, NULL, 'nasai', '524', 'Al-Hakim who graded it authentic and Ath-Tfaahabi agreed 2/100, and Ibn 
As-Sunni (no. 524). Al-Hafidh graded it good in his checking of Al-''Athkdr 
5/154. Ibn Baz said in Tuhfatul-''Akhydr p. 37, that An-Nasa''i recorded it 
with a good chain of narration.', 'Sahih', 'e226e1e320a6bf1b2386538a27240e8d9f2a1aab5ffbaa29201566769e6bb771', 'اللهم رب السموات السبع وما اظللن ورب الاراضين السبع وما اقللن ورب الشياطين وما اضللن ورب الرياح وما ذرين اسالك خير هذه القريه وخير اهلها وخير ما فيها واعوذ بك من شرها وشر اهلها وشر ما فيها', 1, TRUE, 'published'),
  (210, 'hisn-210', 98, 'hisn-al-muslim', 210, 'لا إلهَ إلاّ اللّه
وحدَهُ لا شريكَ لهُ،
لهُ المُلْـكُ ولهُ الحَمْـد،
يُحْيـي وَيُميـتُ
وَهُوَ حَيٌّ لا يَمـوت،
بِيَـدِهِ الْخَـيْرُ
وَهوَ على كلّ شيءٍ قدير', 'Lā ilāha illallāh
waḥdahu lā sharīka lah, 
Lahu ‘l-mulku wa lahu ‘l-ḥamd, 
Yuḥyī wa yumīt, 
wa huwa ḥayyun lā yamūt,
Biyadihi ‘l-khayr, 
wa huwa `alā kulli shay''in Qadīr.', 'None has the right to be worshipped but Allah alone, 
Who has no partner.
His is the dominion and His is the praise. He brings life and He causes death, 
and He is living and does not die. 
In His Hand is all good, 
and He is Able to do all things.', NULL, 10, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/291, and Al-Hakim 1/538. Al-Albani graded it good in Sahih 
Ibn Majah 2/21 and Sahih At-Tirmidhi 3/152.', 'Sahih', 'd650602ee8e0c51ff22ddee926a90cb3a0697626f7fc6f0e6c8e7fe47eb932ac', 'لا اله الا الله وحده لا شريك له له الملك وله الحمد يحيي ويميت وهو حي لا يموت بيده الخير وهو علي كل شيء قدير', 1, TRUE, 'published'),
  (211, 'hisn-211', 99, 'hisn-al-muslim', 211, 'بِسْـمِ اللهِ', 'Bismillāh.', 'With the Name of Allah.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/296. Al-Albani graded it authentic in Sahih Abu Dawud 3/941.', 'Sahih', '6bcdd0aa8757896c71791ab7305cde4933b60b87b70cf421da7b0d81a610e629', 'بسم الله', 1, TRUE, 'published'),
  (212, 'hisn-212', 100, 'hisn-al-muslim', 212, 'أَسْتَـوْدِعُكُـمُ اللَّهَ الَّذي لا تَضـيعُ وَدائِعُـه', 'Astawdi`ukumu ‘llāha ‘l-ladhi lā taḍī`u wadā''i`uh.', 'I place you in the trust of Allah, whose trust is never misplaced.', NULL, 1, NULL, NULL, NULL, 'ibn-majah', NULL, 'Ahmad 2/403, Ibn Majah 2/943. See also Al-Albani, Sahih Ibn Majah 2/133.', 'Sahih', '649f790a13897d9f0ddfba8f5e94fc8eb5b6fceb85d6288dbf8d7320fc4a2e7a', 'استودعكم الله الذي لا تضيع ودايعه', 1, TRUE, 'published'),
  (213, 'hisn-213', 101, 'hisn-al-muslim', 213, 'أَسْتَـوْدِعُ اللَّهَ ديـنَكَ
وَأَمانَتَـكَ،
وَخَـواتيـمَ عَمَـلِك', 'Astawdi`ullāha dīnak, 
wa amānatak, 
wa khawātīma `amalik.', 'I leave your religion in the care of Allah, 
as well as your safety, 
and the last of your deeds.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Ahmad 2/7, At-Tirmidhi 5/499. See also Al-Albani, Sahih At-Tirmidhi 2/155.', 'Sahih', 'b6d442650e7db04612a56241496c889ac04b27b6c5bcd649f2e8cec8877a0bc9', 'استودع الله دينك وامانتك وخواتيم عملك', 1, TRUE, 'published'),
  (214, 'hisn-214', 101, 'hisn-al-muslim', 214, 'زَوَّدَكَ اللَّهُ التقْوى،
وَغَفَـرَذَنْـبَكَ،
وَيَسَّـرَ لَكَ الخَـيْرَ حَيْـثُما كُنْـت', 'Zawwadaka ‘llāhut-taqwā, 
wa ghafara dhanbak, 
wa yassara laka ‘l-khayra ḥaythu mā kunt.', 'May Allah give you piety as your provision, 
forgive your sins, 
and make goodness easy for you wherever you are.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi. See Al-Albani, Sahih At-Tirmidhi, 3/155.', 'Sahih', '17ed99896d25872e9d392338d7f954f86d4d0a6227a1a949fd05965ec616b12d', 'زودك الله التقوي وغفرذنبك ويسر لك الخير حيثما كنت', 1, TRUE, 'published'),
  (215, 'hisn-215', 102, 'hisn-al-muslim', 215, 'قَالَ جَابِرٌ رضي الله عنه:
(كُنَّا إِذَا صَعَدْنَا كَبَّرْنَا،
وَإِذَا نَزَلْنَا سَبَّحْنَا)', '--', 'Jabir (ra), said: Whenever we went up a hill we would say 
Allāhu Akbar (Allah is the Most Great) 
and when we descended we would say 
Subḥānallāh (Glory is to Allah).', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/135.', NULL, '57e5d07a3338e6de1242d7129573b43f81f41ad1d4600355cea1bbbb2c8aef61', 'قال جابر رضي الله عنه كنا اذا صعدنا كبرنا واذا نزلنا سبحنا', 1, TRUE, 'published'),
  (216, 'hisn-216', 103, 'hisn-al-muslim', 216, 'سَمِـعَ سـامِعٌ بِحَمْـدِ اللهِ وَحُسْـنِ بَلائِـهِ عَلَيْـنا.
رَبَّنـا صـاحِبْـنا وَأَفْـضِل عَلَيْـنا
عائِذاً باللهِ مِنَ النّـار', 'Sami`a sāmi`un biḥamdillāhi wa ḥusni balā''ihi `alaynā. 
Rabbanā ṣāḥibnā, wa afḍil `alaynā, 
`ā''idhan billāhi minan-nār.', 'He Who listens has heard that we praise Allah for the good things He gives us. 
Our Lord, be with us and bestow Your favor upon us. 
I seek the protection of Allah from the Fire.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2086, the meaning of sami`a sāmi`un (who listens has heard) is 
that ''a witness has witnessed our praise of Allah due to His blessings and 
favor upon us.'' It could also be read samma`a sāmi`un, in which case it 
means ''one who has heard this statement of mine will convey it to another 
and he will say it as well.'' This is due to the attention given to the 
Thikr (remembrance of Allah) and supplications made during the early 
morning hours. The meaning of his saying ''Our Lord, be with us and bestow 
Your favor upon us'' is: ''Our Lord, protect us and guard us. Bless us with 
Your numerous bounties, and avert from us every evil.'' See An-Nawawi, Sharh 
Sahih Muslim 17/39.', 'Sahih', '66fa89541ae8f77486b6d8fafc1f1ead653ea6403e63e670ff8e75f519c1295f', 'سمع سامع بحمد الله وحسن بلايه علينا ربنا صاحبنا وافضل علينا عايذا بالله من النار', 1, TRUE, 'published'),
  (217, 'hisn-217', 104, 'hisn-al-muslim', 217, 'أَعـوذُ بِكَلِـماتِ اللّهِ التّـامّاتِ مِنْ شَـرِّ ما خَلَـق', 'A`ūdhu bikalimāti ‘llāhit-tāmmāti min sharri mā khalaq.', 'I seek refuge in the Perfect Words of Allah from the evil of what He has created.', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2080.', NULL, '79a9b7495d5f80e588019969cf12d2d697708cec1e9334033331a727111ec6f2', 'اعوذ بكلمات الله التامات من شر ما خلق', 1, TRUE, 'published'),
  (218, 'hisn-218', 105, 'hisn-al-muslim', 218, 'يُكَبِّرُ عَلَى كُلِّ شَرَفٍ ثَلاَثَ تَكْبِيرَاتٍ ثُمَّ يَقُولُ:
لاَ إِلَهَ إِلاَّ اللَّهُ
وَحْدَهُ لاَ شَرِيكَ لَهُ،
لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ،
وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ،
آيِبُونَ، تَائِبُونَ، عَابِدُونَ،
لِرَبِّنا حَامِدُونَ،
صَدَقَ اللَّهُ وَعْدَهُ،
وَنَصَرَ عَبْدَهُ،
وَهَزَمَ الْأَحْزابَ وَحْدَهُ', 'From every elevated point say 
Allāhu Akbar (three times), 
and then recite:', 'Lā ilāha illallāh 
waḥdahu lā sharīka lah, 
lahu ‘l-mulku, walahu ‘l-ḥamd, 
wa Huwa `alā kulli shay''in Qadīr, 
ā''ibūna, tā''ibūna,`ābidūn, 
li Rabbinā ḥāmidūn, 
sadaqallāhu wa`dah, 
wa nasara `abdah,
wa hazama ‘l-''aḥzāba waḥdah.

From every elevated point say Allāhu Akbar (Allah is the Most Great) three times and then recite:

None has the right to be worshipped but Allah alone, 
Who has no partner. 
His is the dominion and His is the praise, and He is Able to do all things. 
We return repentant to our Lord, worshipping our Lord, 
and praising our Lord. 
He fulfilled His Promise, 
He aided His slave, 
and He alone defeated the Confederates.', NULL, 3, NULL, NULL, NULL, 'bukhari', NULL, 'Bukhari 7/163, Muslim 2/980. The Prophet (ﷺ) used to say this when 
returning from a campaign or from Hajj.', NULL, '4d593300f0733bc70bdc419066562c77395a9df1b5636cad5be4fd08b4b8068b', 'يكبر علي كل شرف ثلاث تكبيرات ثم يقول لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير ايبون تايبون عابدون لربنا حامدون صدق الله وعده ونصر عبده وهزم الاحزاب وحده', 1, TRUE, 'published'),
  (219, 'hisn-219', 106, 'hisn-al-muslim', 219, 'كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا أَتَاهُ الْأَمْرُ يَسُرُّهُ قَالَ: (الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ) وَإِذَا أَتَاهُ الْأَمْرُ يَكْرَهُهُ قَالَ: (الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ)', 'When something happened that pleased him, the Prophet (ﷺ) used to say:
Alḥamdu lillāhi ‘lladhi bi ni`matihi tatimmuṣ-ṣāliḥāt.
And if something happened that displeased him, he used to say:
Alḥamdu lillāhi `alā kulli ḥāl.', 'When something happened that pleased him, the Prophet (ﷺ) used to say:
Praise is to Allah Who by His blessings all good things are perfected.

And if something happened that displeased him, he used to say:
Praise is to Allah in all circumstances.', NULL, 1, NULL, NULL, NULL, 'al-hakim', NULL, 'Ibn As-Sunni, ''Amalul-Yawm wal-Laylah, and Al-Hakim who graded it authentic 
1/499. See also Al-Albani, Sahihul-Jami'' As-Saghir 4/201.', 'Sahih', 'f9f55c12b4729b2adc3228fc891ba679603e6be72c3ea1b63983148b535e8e26', 'كان النبي صلي الله عليه وسلم اذا اتاه الامر يسره قال الحمد لله الذي بنعمته تتم الصالحات واذا اتاه الامر يكرهه قال الحمد لله علي كل حال', 1, TRUE, 'published'),
  (220, 'hisn-220', 107, 'hisn-al-muslim', 220, 'قَالَ النَّبِيُّ صلى الله عليه وسلم: (مَنْ صَلَّى عَلَيَّ صَلاَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْراً)', '--', 'The Prophet (ﷺ) said: "Whoever prays for Allah''s blessings upon me once, will be blessed for it by Allah ten times."', NULL, 10, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/288.', NULL, '7955334410610a9855c65d41131f2352434cb51c91acd3d1ea79fbc2314a3bfd', 'قال النبي صلي الله عليه وسلم من صلي علي صلاه صلي الله عليه بها عشرا', 1, TRUE, 'published'),
  (221, 'hisn-221', 107, 'hisn-al-muslim', 221, 'وَقَالَ صلى الله عليه وسلم: (لاَ تَجْعَلُوا قَبْرِي عِيداً وَصَلُّوا عَلَيَّ؛ فَإِنَّ صَلاَتَكُم تَبْلُغُنِي حَيْثُ كُنْتُمْ)', '--', 'The Prophet (ﷺ) said: "Do not make my grave a place of ritual celebration, but pray for Allah''s blessings upon me, for your blessings reach me from wherever you are.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 2/218, Ahmad 2/367. Al-Albani graded it authentic in Sahih Abu 
Dawud 2/383.', 'Sahih', 'b043dd2416acf2e29cbab58e2a4bd3fe0261cf05bfbfceaa5e8dc5da7aee4548', 'وقال صلي الله عليه وسلم لا تجعلوا قبري عيدا وصلوا علي فان صلاتكم تبلغني حيث كنتم', 1, TRUE, 'published'),
  (222, 'hisn-222', 107, 'hisn-al-muslim', 222, 'وَقَالَ صلى الله عليه وسلم: (الْبَخِيلُ مَنْ ذُكِرْتُ عِنْدَهُ فَلَمْ يُصَلِّ عَلَيَّ)', '--', 'The Prophet (ﷺ) said: "The miser is the one in whose presence I am mentioned yet does not pray for Allah''s blessings upon me."', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/551 and others. See also Al-Albani, Sahih At-Tirmidhi 3/177 
and Sahihul-Jarai'' As-Saghir 3/25.', 'Sahih', 'a2ee80ec78d7ea7cf920175faaa450c70d83ca758130a9b1474b94c6a27c0691', 'وقال صلي الله عليه وسلم البخيل من ذكرت عنده فلم يصل علي', 1, TRUE, 'published'),
  (223, 'hisn-223', 107, 'hisn-al-muslim', 223, 'وَقَالَ صلى الله عليه وسلم:(إِنَّ لِلَّهِ مَلاَئِكَةً سَيَّاحِينَ فِي الْأَرْضِ يُبَلِّغُونِي مِنْ أُمَّتِي السَّلاَمَ)', '--', 'The Prophet (ﷺ) said: "Indeed Allah has angels who roam the earth and they convey to me the greetings (or prayers of peace) of my Ummah (nation)."', NULL, 1, NULL, NULL, NULL, 'nasai', NULL, 'An-Nasa''i, Al-Hakim 2/421. Al-Albani graded it authentic in Sahih An-Nasa''i 
1/274.', 'Sahih', '8f793a0218f4c040e3a5dbfcfd8008421d8d574323360b91efce2ab17c7fb8ec', 'وقال صلي الله عليه وسلم ان لله ملايكه سياحين في الارض يبلغوني من امتي السلام', 1, TRUE, 'published'),
  (224, 'hisn-224', 107, 'hisn-al-muslim', 224, 'وَقَالَ صلى الله عليه وسلم: (مَا مِنْ أَحَدٍ يُسَلِّمُ عَلَيَّ إِلاَّ رَدَّ اللَّهُ عَلَيَّ رُوحِيَ حَتَّى أَرُدَّ عَلَيْهِ السَّلاَمَ)', '--', 'The Prophet (ﷺ) said: "No one sends greetings (or prayers of peace) upon me but Allah returns my soul to me so that I may return his greetings."', NULL, 1, NULL, NULL, NULL, 'abu-dawud', '2041', 'Abu Dawud (no. 2041). Al-Albani graded it good in Sahih Abu Dawud 1/383.', 'Sahih', '1aa591a1f36618f4d3f265c7c865a6f12f92509aa98894a6e5950ac9ceb2f804', 'وقال صلي الله عليه وسلم ما من احد يسلم علي الا رد الله علي روحي حتي ارد عليه السلام', 1, TRUE, 'published'),
  (225, 'hisn-225', 108, 'hisn-al-muslim', 225, 'قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: (لاَ تَدْخُلُوا الْجَنَّةَ حَتَّى تُؤْمِنُوا، وَلاَ تُؤْمِنُوا حَتَّى تَحَابُّوا، أَوَلاَ أَدُلُّكُم عَلَى شَيْءٍ إِذَا فَعَلْتُمُوهُ تَحَابَبْتُم، أَفْشُوا السَّلاَمَ بَيْنَكُمْ)', '--', 'The Prophet (ﷺ) said: "You shall not enter Paradise until you believe, and you have not believed until you love one another. Shall I tell you of something you can do to make you love one another? Spread the greetings of Salam (peace) amongst yourselves (i.e. between each other).', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/74 and others.', NULL, '408a364b39d54e4702d5bd96cd29e6602b76f36f0e1a7b4d117b15ab2ec53248', 'قال رسول الله صلي الله عليه وسلم لا تدخلوا الجنه حتي تومنوا ولا تومنوا حتي تحابوا اولا ادلكم علي شيء اذا فعلتموه تحاببتم افشوا السلام بينكم', 1, TRUE, 'published'),
  (226, 'hisn-226', 108, 'hisn-al-muslim', 226, 'ثَلاَثٌ مَنْ جَمَعَهُنَّ فَقَدْ جَمَعَ الْإِيمَانَ: الْإِنْصَافُ مِنْ نَفْسِكَ، وَبَذْلُ السَّلاَمِ لِلْعَالَمِ، وَالْإِنْفَاقُ مِنَ الإِقْتَارِ', NULL, 'Three characteristics, whoever combines them, has completed his faith: to be just, to spread greetings to all people and to spend (charitably) out of the little you have.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 1/82 as a statement of the 
Companion ''Ammar (RA).', NULL, '2ec75710f5f40bdd520a95fa65e3d9ea3b4889e5c68c5b9915331e79ec01947b', 'ثلاث من جمعهن فقد جمع الايمان الانصاف من نفسك وبذل السلام للعالم والانفاق من الاقتار', 1, TRUE, 'published'),
  (227, 'hisn-227', 108, 'hisn-al-muslim', 227, 'وَعَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا: أنَّ رَجُلاً سَأَلَ النَّبِيَّ صلى الله عليه وسلم أيُّ الْإِسْلاَمِ خَيْرٌ قَالَ: (تُطْعِمُ الطَّعَامَ، وَتَقْرأُ السَّلاَمَ عَلَى مَنْ عَرَفْتَ وَمَنْ لَمْ تَعْرِفْ)', '--', '`Abdullah bin `Umar (RA) said: A man asked the Prophet (ﷺ), "What is the best act of Islam?" He said, "To feed others and to give greetings of Salam (peace) to those whom you know and to those whom you do not know. "', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 1/55, Muslim 1/65.', NULL, '0905f8ab1e32425dfffef20da6c14048fe8010199635013450fd2d961111b67f', 'وعن عبد الله بن عمر رضي الله عنهما ان رجلا سال النبي صلي الله عليه وسلم اي الاسلام خير قال تطعم الطعام وتقرا السلام علي من عرفت ومن لم تعرف', 1, TRUE, 'published'),
  (228, 'hisn-228', 109, 'hisn-al-muslim', 228, 'إذَا سَلَّمَ عَلَيْكُمْ أَهْلُ الْكِتَابِ فَقُولُوا: وَعَلَيْكُمْ', 'If one of the People of the Scripture (i.e. Christians and Jews) greets you, saying As-Salāmu `alaykum, then say (to him): Wa `alaykum.', 'If one of the People of the Scripture (i.e. Christians and Jews) greets you saying As-Salaamu `alaykum, then say (to him):

And upon you .', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/42, Muslim 4/1705.', NULL, '381525a7a3ee62946ad5bda8ddaf6c9823f6213a2f5481239a120e8a12198be6', 'اذا سلم عليكم اهل الكتاب فقولوا وعليكم', 1, TRUE, 'published'),
  (229, 'hisn-229', 110, 'hisn-al-muslim', 229, 'إِذَا سَمِعْتُمْ صِيَاحَ الدِّيَكَةِ فَاسْأَلُوا اللَّهَ مِنْ فَضْلِهِ؛ فَإِنَّهَا رَأَتْ مَلَكاً وَإِذَا سَمِعْتُمْ نَهِيقَ الْحِمَارِ فَتَعَوَّذُوا بِاللَّهِ مِنَ الشَّيطَانِ؛ فَإِنَّهُ رَأَى شَيْطَاناً', '--', 'When you hear the cock''s crow, ask Allah for His favor upon you for surely it has seen an angel. When you hear the bray of a donkey, seek refuge in Allah from Satan, for surely it has seen a devil.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/350, Muslim 4/2092.', NULL, '8c0290ff08245425c83f147557a55e8cfc4912fc0792d2eff582c4ae052780c3', 'اذا سمعتم صياح الديكه فاسالوا الله من فضله فانها رات ملكا واذا سمعتم نهيق الحمار فتعوذوا بالله من الشيطان فانه راي شيطانا', 1, TRUE, 'published'),
  (230, 'hisn-230', 111, 'hisn-al-muslim', 230, 'إِذَا سَمِعْتُمْ نُبَاحَ الْكِلاَبِ وَنَهِيقَ الْحَمِيرِ بِاللَّيْلِ فَتَعَوَّذُوا بِاللَّهِ مِنْهُنَّ؛ فَإِنَّهُنَّ يَرَيْنَ مَا لاَ تَرَوْنَ', NULL, 'When you hear a dog barking or a donkey braying in the night, then seek refuge in Allah from them, for surely they have seen what you see not.', NULL, 1, NULL, NULL, NULL, 'abu-dawud', NULL, 'Abu Dawud 4/327, Ahmad 3/306. Al-Albani graded it authentic in Sahih Abu 
Dawud 3/961.', 'Sahih', '871b50779522158b8bf874809e352b109b5beb906764aa7b60a4a3027002ca1b', 'اذا سمعتم نباح الكلاب ونهيق الحمير بالليل فتعوذوا بالله منهن فانهن يرين ما لا ترون', 1, TRUE, 'published'),
  (231, 'hisn-231', 112, 'hisn-al-muslim', 231, 'قال صلى الله عليه وسلم: "اللَّهُم فأيما مؤمن سببته فاجعل ذلك له قربة إليك يوم القيامة"', 'Allāhumma fa''ayyumā mu''minin sababtuhu 
faj`al dhālika lahu qurbatan ilayka yawma ‘l-qiyāmah.', 'O Allah, whomever of the believers I have abused, give him the reward of a sacrificial slaughter for it on the Day of Resurrection.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/171, Muslim 4/2007. The wording 
in Muslim''s report is: ''make it a purification for him and a source of 
mercy.', NULL, '3b4a1c6771aca2e8d8e509dde83944890f37e2ec91aa74aaabfded022fedddcb', 'قال صلي الله عليه وسلم اللهم فايما مومن سببته فاجعل ذلك له قربه اليك يوم القيامه', 1, TRUE, 'published'),
  (232, 'hisn-232', 113, 'hisn-al-muslim', 232, 'قال صلى الله عليه وسلم: "إِذَا كَانَ أَحَدُكُم مَادِحاً صَاحِبَهُ لاَ مَحَالَةَ فَلْيَقُلْ: أَحْسِبُ فُلاَناً وَاللَّهُ حَسِيبُهُ، وَلاَ أُزَكِّي عَلَى اللَّهِ أَحَداً، أَحْسِبُهُ – إِنْ كَانَ يَعْلَمُ ذَاكَ – كَذَا وَكَذَا"', 'If any of you praises his companion then let him say:
Aḥsibu fulānan wallāhu ḥasībuh
wa lā uzakkī  `alallāhi aḥada.', 'If any of you praises his companion then let him say:
I consider (such and such a person), and Allah is his Assessor, (meaning: and I cannot claim anyone to be pious before Allah) if you know of this (good character trait in the person) to be such and such (saying what he thinks is praiseworthy in that person).', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2296.', NULL, 'c1a4edc4f1992833e6cb39b5ab094d3e3ecdba4f1c726117e30ce2169cdfe990', 'قال صلي الله عليه وسلم اذا كان احدكم مادحا صاحبه لا محاله فليقل احسب فلانا والله حسيبه ولا ازكي علي الله احدا احسبه – ان كان يعلم ذاك – كذا وكذا', 1, TRUE, 'published'),
  (233, 'hisn-233', 114, 'hisn-al-muslim', 233, 'اللَّهُمَّ لاَ تُؤَاخِذْنِي بِمَا يَقُولُونَ
وَاغْفِرْ لِي مَا لاَ يَعْلَمُونَ
[وَاجْعَلْنِي خَيْرًا مِمَّا يَظُّنُّونَ]', 'Allāhumma lā tu''ākhidhnī bimā yaqūlūn, 
waghfir lī mā lā ya`lamūn
[waj`alnī khayran mimmā yaẓunnūn].', 'O Allah, do not call me to account for what they say
and forgive me for what they have no knowledge of 
[and make me better than they imagine].', NULL, 1, NULL, NULL, NULL, 'bukhari', '761', 'Al-Bukhari, Al-''Adabul-Mufrad no. 761. See Al-Albani, Sahih 
Al-''Adabul-Mufrad (no. 585). The portion between brackets if from 
Al-Bayhaqi, Shu''ab Al-Iman 4/228, and comes another account.', 'Sahih', 'eb349b0c23c0918769b9493f0818d7962d7d165ca0e5dbcd4b79af361a552c58', 'اللهم لا تواخذني بما يقولون واغفر لي ما لا يعلمون واجعلني خيرا مما يظنون', 1, TRUE, 'published'),
  (234, 'hisn-234', 115, 'hisn-al-muslim', 234, 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ،
لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ،
إِنَّ الْحَمْدَ والنِّعْمَة لَكَ والمُلْكُ،
لَا شَرِيكَ لَكَ', 'Labbayk-Allāhumma labbayk, 
labbayka lā sharīka laka labbayk,
inna ‘l-ḥamda, wanni`mata, laka wa ‘l-mulk, 
lā sharīka lak.', 'I am here at Your service, O Allah, I am here at Your service. 
I am here at Your service, You have no partner, I am here at Your service. 
Surely the praise, and blessings are Yours, and the dominion. 
You have no partner.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/408, Muslim 2/841.', NULL, 'cde73673612b7906a210f322441a416b4940883be46e9be0dc7bcfd49952a447', 'لبيك اللهم لبيك لبيك لا شريك لك لبيك ان الحمد والنعمه لك والملك لا شريك لك', 1, TRUE, 'published'),
  (235, 'hisn-235', 116, 'hisn-al-muslim', 235, 'طَافَ النَّبيُّ صلى الله عليه وسلم بِالْبَيْتِ عَلَى بَعِيرٍ كُلَّمَا أَتَى الرُّكْنَ أَشَارَ إِلَيْهِ بِشَيْءٍ عِنْدَهُ وَكَبَّرَ', '--', 'The Prophet (ﷺ) performed Tawaf riding a camel. Every time he passed the corner (containing the Black Stone), he would point to it with something that he was holding and say: Allāhu Akbar (Allah is the Most Great)!', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/476. See also 472. The 
''something'' that was referred to in this Hadith was a cane.', NULL, '59cc587e30ffebcf4d24d478d58093e74bf3a701dca972f1766b0862e8600fba', 'طاف النبي صلي الله عليه وسلم بالبيت علي بعير كلما اتي الركن اشار اليه بشيء عنده وكبر', 1, TRUE, 'published'),
  (236, 'hisn-236', 117, 'hisn-al-muslim', 236, '﴿رَبَّنَا آتِنَا في الدُّنْيَا حسَنَةً
وفي الآخِرَةِ حسَنةً
وقِنَا عذَابَ النَّارِ﴾', 'Rabbanā ātinā fid-dunyā ḥasanah 
wa fi ‘l-ākhirati ḥasanah 
wa qinā `adhāban-nār.', 'Our Lord, grant us the good things in this world,
and the good things in the next life,
and save us from the punishment of the Fire.', NULL, 1, NULL, 2, '201', 'abu-dawud', NULL, 'Abu Dawud 2/179, Ahmad 3/411, Al-Baghawi, Sharhus-Sunnah 7/128. Al-Albani 
graded it good in Sahih Abu Dawud 1/354. The Ayat is from Surat Al-Baqarah, 
2:201.', 'Sahih', '10a3bfec109a735ec2522f15a3122201925a86568ae0051461ac0e6b1efb00e5', '﴿ربنا اتنا في الدنيا حسنه وفي الاخره حسنه وقنا عذاب النار﴾', 1, TRUE, 'published'),
  (237, 'hisn-237', 118, 'hisn-al-muslim', 237, '(لَمَّا دَنَا النَّبِيُّ صلى الله عليه وسلم مِنَ الصَّفَا قَرَأَ: ﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَآئِرِ اللَّهِ﴾ "أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ" فَبَدَأَ بِالصَّفَا فَرَقِيَ عَلَيْهِ حَتَّى رَأَى الْبَيْتَ، فَاسْتَقْبَلَ الْقِبْلَةَ، فَوَحَّدَ اللَّهَ وَكبَّرَهُ وَقَالَ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ، ثُمَّ دَعَا بَيْنَ ذلكَ. قَالَ مِثْلَ هَذَا ثَلاَثَ مَرَّاتٍ) الْحَدِيثُ. وَفِيهِ: (فَفَعَلَ عَلَى الْمَرْوَةِ كَمَا فَعَلَ عَلَى الصَّفَا)', 'Whenever the Prophet (ﷺ) approached Mount Safa, he would recite:
Innaṣ-Ṣafā wa ‘l-Marwata min sha`ā''irillāh. 
Abda''u bimā bada''allāhu bih.
He began (his Sa`y) at Mount Safa climbing it, until he could see the House. He then faced the Qiblah repeating the words:
Lā ilāha illallāh, Allāhu Akbar
Then he said:
Lā ilāha ''illallāh
waḥdahu lā sharīka lah, 
Lahu ‘l-mulku wa lahu ‘l-ḥamd
wa Huwa `alā kulli shay''in Qadīr, 
lā ''ilāha illallāhu waḥdahu, 
anjaza wa`dahu, wa naṣara `abdahu, 
wa hazama ‘l ''aḥzāba waḥdah.
Then he would ask Allah for what he liked, repeating the same three times. He did at Mount Marwah as he did at Mount Safa.', 'Whenever the Prophet (ﷺ) approached Mount Safa, he would recite:

Surely Safa and Marwah are among the signs of Allah. I begin by that which Allah began.

He began (his Sa''y) at Mount Safa climbing it until he could see the House. He then faced the Qiblah repeating the words:

There is none worthy of worship but Allah, and Allah is the Most Great.

Then he said:

None has the right to be worshipped but Allah alone, Who has no partner, His is the dominion and His is the praise, and He is Able to do all things. None has the right to be worshipped but Allah alone, He fulfilled His Promise, He aided His slave, and He alone defeated Confederates.

Then he would ask Allah for what he liked, repeating the same thing like this three times. He did at Mount Marwah as he did at Mount Safa.', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/888.', NULL, '4106c0f84986815e9ac07c98fbd6890bf5922f53e35e03f29c1a9aba63adfcda', 'لما دنا النبي صلي الله عليه وسلم من الصفا قرا ﴿ان الصفا والمروه من شعاير الله﴾ ابدا بما بدا الله به فبدا بالصفا فرقي عليه حتي راي البيت فاستقبل القبله فوحد الله وكبره وقال لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير لا اله الا الله وحده انجز وعده ونصر عبده وهزم الاحزاب وحده ثم دعا بين ذلك قال مثل هذا ثلاث مرات الحديث وفيه ففعل علي المروه كما فعل علي الصفا', 1, TRUE, 'published'),
  (238, 'hisn-238', 119, 'hisn-al-muslim', 238, 'خير الدعاء دعاء يوم عرفة ، وخيرُ ما قلت أنا والنبيُّون من قبلي :
لا إله إلا الله وحدهُ
لا شريك لهُ ،
لهُ الملكُ ولهُ الحمدُ
وهو على كل شيء قدير.', 'The Prophet (ﷺ) said: The best invocation is that of the Day of Arafat, and the best that anyone can say is what I and the Prophets before me have said:', 'Lā ''ilāha ''illallāhu 
waḥdahu lā sharīka lahu, 
lahul-mulku wa lahul-ḥamdu 
wa huwa `alā kulli shay''in qadīr.

None has the right to be worshipped but Allah 
Alone, Who has no partner. 
His is the dominion and His is the praise,
and He is Able to do all things.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi. Al-Albani graded it good in Sahih At-Tirmidhi 3/184, and also 
Silsilatul-''Ahadith As-Sahihah 4/6.', 'Sahih', '03c82569b93b9ba49514bad520e75c4d86711c2280fded1a76e6166aaaf74b2e', 'خير الدعاء دعاء يوم عرفه وخير ما قلت انا والنبيون من قبلي لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير', 1, TRUE, 'published'),
  (239, 'hisn-239', 120, 'hisn-al-muslim', 239, 'رَكِبَ صلى الله عليه وسلم الْقَصْوَاءَ حَتَّى أَتَى الْمَشْعَرَ الْحَرَامَ فَاسْتَقْبَلَ الْقِبْلَةَ (فَدَعَاهُ، وَكَبَّرَهُ، وَهَللَّهُ، وَوَحَّدَهُ) فَلَمْ يَزَلْ وَاقِفاً حَتَّى أَسْفَرَ جِدَّاً فَدَفَعَ قَبْلَ أَنْ تَطْلُعَ الشَّمسُ.', NULL, '''He (ﷺ) rode Al-Qaswa until he reached Al-MashAAar Al-Haram, he then faced the qiblah, supplicated to Allah, and extoled His greatness and oneness. He stood until the sun shone but left before it rose.''', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 2/891.', NULL, 'f1864c48325d45ec35cb5e4e12d2d8ddacdc8de3d9fc3ddd380408a07f774a41', 'ركب صلي الله عليه وسلم القصواء حتي اتي المشعر الحرام فاستقبل القبله فدعاه وكبره وهلله ووحده فلم يزل واقفا حتي اسفر جدا فدفع قبل ان تطلع الشمس', 1, TRUE, 'published'),
  (240, 'hisn-240', 121, 'hisn-al-muslim', 240, 'يُكَبِّرُ كُلَّمَا رَمَى بِحَصَاةٍ عِنْدَ الْجِمَارِ الثَّلاَثِ، ثُمَّ يَتَقَدَّمُ، ويَقِفُ يَدْعُو مُسْتَقْبِلَ الْقِبلَةِ، رَافِعاً يَدَيْهِ بَعْدَ الْجَمْرَةِ الْأُولَى وَالثَّانِيَةِ. أَمَّا جَمْرَةُ الْعَقَبَةِ فَيَرْمِيهَا وَيُكَبِّرُ عِنْدَ كُلِّ حَصَاةٍ وَيَنْصَرِفُ وَلاَ يَقِفُ عِنْدَهَا', '--', 'The Prophet (ﷺ) said Allāhu Akbar (Allah is the Most Great) with each pebble he threw at the three pillars. Then he went forward, stood facing the Qiblah, and raised his hands and called upon Allah. That was after (stoning) the first and second pillars. As for the third, he stoned it and called out Allāhu Akbar with every pebble he threw, but when he was finished he left without standing at it (for supplications).', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/581, 3, 4, and Muslim', NULL, '500d00b74c6ed26d7eece009bd176e9edfc7ed1146fdcabf5d23eaf79d58eeb4', 'يكبر كلما رمي بحصاه عند الجمار الثلاث ثم يتقدم ويقف يدعو مستقبل القبله رافعا يديه بعد الجمره الاولي والثانيه اما جمره العقبه فيرميها ويكبر عند كل حصاه وينصرف ولا يقف عندها', 1, TRUE, 'published'),
  (241, 'hisn-241', 122, 'hisn-al-muslim', 241, 'سُـبْحانَ الله', 'Subḥānallāh!', '(Glory is to Allah).', NULL, 33, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 1/210, 390, 414 and Muslim 4/1857.', NULL, 'af589d79af8be485e83d8cd49f07959de9a03e8fe5e83f2acb693773c41e69f9', 'سبحان الله', 1, TRUE, 'published'),
  (242, 'hisn-242', 122, 'hisn-al-muslim', 242, 'اللهُ أَكْـبَر', 'Allāhu Akbar!', '(Allah is the Most Great)', NULL, 34, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 8/441. See also Al-Albani, Sahih 
At-Tirmidhi 2/103, 235, Ahmad 5/218.', 'Sahih', '21775fd19759677ff05de9cb7ff62a49afafe16e8a52e1e12cf4988b1c946119', 'الله اكبر', 1, TRUE, 'published'),
  (243, 'hisn-243', 123, 'hisn-al-muslim', 243, 'كَانَ النَّبيُّ صلى الله عليه وسلم إِذَا أَتَاهُ أَمْرٌ يَسُرُّهُ أَوْ يُسَرُّ بِهِ خَرَّ سَاجِداً شُكْراً لِلَّهِ تَبَارَكَ وَتَعَالَى', NULL, 'The Prophet (ﷺ), upon receiving news which pleased him or which caused pleasure, would prostrate in gratitude to Allah blessed and exalted.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud, Ibn Majah, At-Tirmidhi. See also Al-Albani, Sahih Ibn Majah 
1/233, and ''Irwa''ul-Ghalil 2/226.', 'Sahih', '5e8f7eeaedbf4ba1b94cbaddfddd813a49f7fc0ab8574b8effe781657b4a478a', 'كان النبي صلي الله عليه وسلم اذا اتاه امر يسره او يسر به خر ساجدا شكرا لله تبارك وتعالي', 1, TRUE, 'published'),
  (244, 'hisn-244', 124, 'hisn-al-muslim', 244, 'ضَعْ يَدَكَ عَلَى الَّذِي تَألَّمَ مِنْ جَسَدِكَ وَقُلْ:
"بِسْمِ اللَّهِ" ثَلاَثاً،
وَقُلْ سَبْعَ مَرَّاتٍ:
"أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ"', 'Put your hand on the place where you feel pain and say: 
Bismillāh (three times).
Then say seven times:
A`ūdhu billāhi wa qudratihi min sharri mā ajidu wa uḥādhir.', 'Put your hand on the place where you feel pain and say:
With the Name of Allah (three times).

Then say seven times:
I seek refuge in Allah and in His Power from the evil of what I find and of what I guard against.', NULL, 3, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/1728.', NULL, '59693a28b3e7077296acfbe1e3a4c6f0e1a929fb826ce1ecb999224e604fc3f8', 'ضع يدك علي الذي تالم من جسدك وقل بسم الله ثلاثا وقل سبع مرات اعوذ بالله وقدرته من شر ما اجد واحاذر', 1, TRUE, 'published'),
  (245, 'hisn-245', 125, 'hisn-al-muslim', 245, 'إِذَا رَأَى أَحَدُكُم مِنْ أَخِيهِ، أَوْ مِنْ نَفْسِهِ، أَوْ مِنْ مَالِهِ مَا يُعْجِبُهُ [فَلْيَدْعُ لَهُ بِالْبَرَكَةِ] فَإِنَّ الْعَيْنَ حَقٌّ', NULL, 'If you see something from your brother, yourself or wealth which you find impressing, then invoke blessings for it, for the evil eye is indeed true.', NULL, 1, NULL, NULL, NULL, 'ibn-majah', NULL, 'Ahmad 4/447, Ibn Majah, Malik. Al-Albani graded it authentic in 
Sahihul-Jami'' As-Saghir 1/212. Also see Al-Arna''ut''s checking of Ibn 
Al-Qayyim''s Zadul-Ma''ad 4/170.', 'Sahih', '2b13f0c6357fc066a9118659fda294a0b8f4e39ac29e8f33f1cdcb1755d133af', 'اذا راي احدكم من اخيه او من نفسه او من ماله ما يعجبه فليدع له بالبركه فان العين حق', 1, TRUE, 'published'),
  (246, 'hisn-246', 126, 'hisn-al-muslim', 246, 'لا إلهَ إلاّ اللّهُ', 'Lā ilāha illallāh!', 'There is none worthy of worship but Allah!', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 6/181, Muslim 4/2208.', NULL, '1f2100ba7f4ebce4c7fb137ee3820e95e5c3dcc9f17d4fdcba510fdf7f935bf5', 'لا اله الا الله', 1, TRUE, 'published'),
  (247, 'hisn-247', 127, 'hisn-al-muslim', 247, 'بِسْمِ اللَّهِ
وَاللَّهُ أَكْبَرُ
[اللَّهُمَّ مِنْكَ وَلَكَ]
اللَّهُمَّ تَقَبَّلْ مِنِّي', 'Bismillāh wallāhu Akbar 
[Allāhumma minka wa lak] 
Allāhumma taqabbal minnī.', 'With the Name of Allah,
Allah is the Most Great! 
[O Allah, from You and to You.] 
O Allah, accept it from me.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 3/ 1557, Al-Bayhaqi 9/287.', NULL, '180a01a99e1c50b50e3486a47dc7de332b32340260428da4bfce134222e2f9eb', 'بسم الله والله اكبر اللهم منك ولك اللهم تقبل مني', 1, TRUE, 'published'),
  (248, 'hisn-248', 128, 'hisn-al-muslim', 248, 'أَعُوذُ بكَلِمَاتِ اللهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ ولَا فَاجرٌ
مِنْ شّرِّ مَا خَلقَ،
وبَرَأَ وذَرَأَ،
ومِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ
وِمنْ شَرِّ مَا يَعْرُجُ فيهَا،
ومِن شَرِّ مَا ذَرَأَ في الأَرْضِ
ومِنْ شَرِّ مَا يَخْرُجُ مِنْهَا،
وِمنْ شَرِّ فِتَنِ اللَّيْلِ والنَّهارِ،
ومِنْ شَرِّ كُلِّ طارِقٍ
إِلَّا طَارِقاً يَطْرُقُ بخَيْرٍ
يَا رَحْمَنُ', 'A`ūdhu bikalimāti ‘llāhit-tāmmāti ‘llatī lā yujāwizuhunna barrun wa lā fājirun
min sharri mā khalaq, 
wa bara''a wa dhara'', 
wa min sharri mā yanzilu minas-samā'', 
wa min sharri mā ya`ruju fīhā, 
wa min sharri mā dhara''a fi ‘l-arḍ, 
wa min sharri ma yakhruju minhā, 
wa min sharri fitani ‘llayli wannahār, 
wa min sharri kulli ṭāriqin 
illā ṭāriqan yaṭruqu bikhayr 
yā Rahmān.', 'I seek refuge in the Perfect Words of Allah -which neither the upright nor the corrupt may overcome -
from the evil of what He created, 
of what He made, and of what He scattered,
from the evil of what descends from the 
heavens, 
and of what rises up to them, 
from the evil of what He scattered in the earth, 
and of what emerges from it, 
from the evil trials of night and day, 
and from the evil of every night visitor,
except the night visitor who comes with good. 
O Merciful One.', NULL, 1, NULL, NULL, NULL, 'ahmad', '637', 'Ahmad 3/419, with an authentic chain of narration, and Ibn As-Sunni (no. 
637). Al-Arna''ut, graded its chain authentic in his checking of Al-''Aqidah 
At-Tahawiyyah p. 133. See also Majma''uz-Zawa''id, 10/127.', 'Sahih', '221fbe5acd8633c64d9b051fa258f3092a679b36dafefae3ba323c3b62a1e0d7', 'اعوذ بكلمات الله التامات التي لا يجاوزهن بر ولا فاجر من شر ما خلق وبرا وذرا ومن شر ما ينزل من السماء ومن شر ما يعرج فيها ومن شر ما ذرا في الارض ومن شر ما يخرج منها ومن شر فتن الليل والنهار ومن شر كل طارق الا طارقا يطرق بخير يا رحمن', 1, TRUE, 'published'),
  (249, 'hisn-249', 129, 'hisn-al-muslim', 249, 'قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: "وَاللَّهِ إِنِّي لأَسْتَغفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةٍ"', '--', 'Allah''s Messenger (ﷺ) said: "By Allah, I seek the forgiveness of Allah, and repent to Him more than seventy times in a day.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/101.', NULL, '38313fc62f9cb02d633658d6801fd57037edaaeccf9738272ae9cf1ce9db9443', 'قال رسول الله صلي الله عليه وسلم والله اني لاستغفر الله واتوب اليه في اليوم اكثر من سبعين مره', 1, TRUE, 'published'),
  (250, 'hisn-250', 129, 'hisn-al-muslim', 250, 'وَقَالَ صلى الله عليه وسلم: (يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللَّهِ فَإِنِّي أَتُوبُ فِي الْيَوْمِ إِلَيْهِ مِائَةَ مَرَّةٍ)', '--', 'Allah''s Messenger (ﷺ) said: "O people, repent to Allah, for I verily repent to Him one hundred times a day.', NULL, 100, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2076.', NULL, 'a0d88d2dc38d1ad47c486aa085c1a4766da21f810b8c4efa78bdeefcbbe9a6d2', 'وقال صلي الله عليه وسلم يا ايها الناس توبوا الي الله فاني اتوب في اليوم اليه مايه مره', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES
  (251, 'hisn-251', 129, 'hisn-al-muslim', 251, 'وَقَالَ صلى الله عليه وسلم: مَنْ قَالَ (أَسْتَغْفِرُ اللَّهَ الْعَظيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ القَيّوُمُ وَأَتُوبُ إِلَيهِ)، غَفَرَ اللَّهُ لَهُ وَإِنْ كَانَ فَرَّ مِنَ الزَّحْفِ.', 'Allah''s Messenger (ﷺ) said: Whoever says:
Astaghfirullāha ‘l-''Aẓīm
alladhi lā ilāha illā huwa ‘l-ḥayyul-Qayyūm 
wa atūbu ilayh.', 'Allah''s Messenger (ﷺ) said: Whoever says:

I seek the forgiveness of Allah the Mighty, Whom there is none worthy of worship except Him, the Living, the Eternal, 
and I repent to Him, 
Allah will forgive him even if he has deserted the army''s ranks.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'Abu Dawud 2/85, At-Tirmidhi 5/569, and Al-Hakim who declared it authentic 
and Ath-Thahabi agreed with him 1/511. Al-Albani graded it authentic in 
Sahih At-Tirmidhi 3/182. See also Jami''ul-''Usool li-''Ahdaith Ar-Rasool 4/ 
389-90 checked by Al-Arna''ut.', 'Sahih', '319004e841f7b44a7e373814c20feaa0449fcc3e8388528c44f31180f4caf18a', 'وقال صلي الله عليه وسلم من قال استغفر الله العظيم الذي لا اله الا هو الحي القيوم واتوب اليه غفر الله له وان كان فر من الزحف', 1, TRUE, 'published'),
  (252, 'hisn-252', 129, 'hisn-al-muslim', 252, 'وَقَالَ صلى الله عليه وسلم: أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الآخِرِ فَإِنِ اسْتَطَعْتَ أَنْ تَكُونَ مِمَّنْ يَذْكُرُ اللَّهَ فِي تِلْكَ السَّاعَةِ فَكُنْ', '--', 'Allah''s Messenger (ﷺ) said: "The closest that the Lord comes to the slave is in the last portion of the night. So, if you are able to be among those who remember Allah in this hour, then be among them."', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi, An-Nasa''i 1/279 and Al-Hakim. See also Al-Albani, Sahih 
At-Tirmidhi 3/183, and Jdmi''ul-''Usool with Al-Arna''ut''s checking 4/144.', 'Sahih', '9c86e19063d0b2c90f490012afba09a0c4284f62ff31c1ab299b5f6203bbf114', 'وقال صلي الله عليه وسلم اقرب ما يكون الرب من العبد في جوف الليل الاخر فان استطعت ان تكون ممن يذكر الله في تلك الساعه فكن', 1, TRUE, 'published'),
  (253, 'hisn-253', 129, 'hisn-al-muslim', 253, '.وَقَالَ صلى الله عليه وسلم: أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكثِرُوا الدُّعَاءَ.', '--', 'Allah''s Messenger (ﷺ) said: "The closest that the slave comes to his Lord is when he is prostrating, so invoke Allah much (in prostration)."', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 1/350.', NULL, 'b253eedd200b86a329c76ac85bc65e67120bf91e8b3b6fcb362b0321fbba55f8', 'وقال صلي الله عليه وسلم اقرب ما يكون العبد من ربه وهو ساجد فاكثروا الدعاء', 1, TRUE, 'published'),
  (254, 'hisn-254', 129, 'hisn-al-muslim', 254, '.وَقَالَ صلى الله عليه وسلم: إِنَّهُ لَيُغَانُ عَلَى قَلْبِي وَإِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ.', '--', 'Allah''s Messenger (ﷺ) said: "It is a heavy thing for my heart if I do not seek Allah''s forgiveness a hundred times a day."', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2075. Ibn ''Athir explains that the Prophet (ﷺ) was always 
vigilant in his remembrance and drawing near to Allah, and if he forgot to 
do any of what he normally did from time to time, or it slipped his mind, 
he felt as if he had wronged himself and so he would begin to seek the 
forgiveness of Allah. See Jami''ul-''Usool 4/386.', NULL, '04ee98f8c75b9f5940c2a03f11eff2dba99f0ee89e288b64b96cfe05c4055210', 'وقال صلي الله عليه وسلم انه ليغان علي قلبي واني لاستغفر الله في اليوم مايه مره', 1, TRUE, 'published'),
  (255, 'hisn-255', 130, 'hisn-al-muslim', 255, 'قَالَ صلى الله عليه وسلم: مَنْ قَالَ (سُبْحَانَ اللَّهِ وَبِحَمْدِهِ) فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْر.', 'Allah''s Messenger (ﷺ) said: Whoever says:
Subḥānallāhi wa biḥamdihi.
one hundred times a day, will have his sins forgiven even if they are like the foam of the sea.', 'Allah''s Messenger (ﷺ) said: Whoever says:

Glorified is Allah and praised is He.

one hundred times a day, will have his sins forgiven even if they are like the foam of the sea.', NULL, 100, NULL, NULL, NULL, 'bukhari', '91', 'Al-Bukhari 7/168, Muslim 4/2071, see also invocation no. 91 of this book.', NULL, 'b6690db9d93442e49f3ae73ff2804ea46c16f676f48f0a19458cf42cf637368b', 'قال صلي الله عليه وسلم من قال سبحان الله وبحمده في يوم مايه مره حطت خطاياه ولو كانت مثل زبد البحر', 1, TRUE, 'published'),
  (256, 'hisn-256', 130, 'hisn-al-muslim', 256, 'وَقَالَ صلى الله عليه وسلم: مَنْ قَالَ (لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ) عَشْرَ مِرَارٍ، كَانَ كَمَنْ أَعْتَقَ أَرْبَعَةَ أَنْفُسٍ مِنْ وَلَدِ إِسْمَاعِيلَ', 'Allah''s Messenger (ﷺ) said: Whoever says:
Lā ilāha illallāh
waḥdahu lā sharīka lah, 
lahu ‘l-mulku wa lahu ‘l-ḥamd 
wa huwa `alā kulli shay''in Qadīr.
ten times, will have the reward for freeing four slaves from the Children of Isma''il.', 'Allah''s Messenger (ﷺ) said: Whoever says:

None has the right to be worshipped but Allah alone, Who has no partner. 
His is the dominion and His is the praise, and He is Able to do all things.

ten times, will have the reward for freeing four slaves from the Children of Isma''il.', NULL, 10, NULL, NULL, NULL, 'bukhari', '93', 'Al-Bukhari 7/67, Muslim 4/2071, see also invocation no. 93 of this book.', NULL, '50402e44fe1d0636d2416aa4b857378fd22a98e3e52beebd8ff269413191625f', 'وقال صلي الله عليه وسلم من قال لا اله الا الله وحده لا شريك له له الملك وله الحمد وهو علي كل شيء قدير عشر مرار كان كمن اعتق اربعه انفس من ولد اسماعيل', 1, TRUE, 'published'),
  (257, 'hisn-257', 130, 'hisn-al-muslim', 257, 'وَقَالَ صلى الله عليه وسلم: كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: (سُبْحَانَ اللَّهِ وَبِحَمْدِهِ)، (سُبْحانَ اللَّهِ الْعَظِيمِ)', 'Allah''s Messenger (ﷺ) said: Two words are light on the tongue, weigh heavily in the balance, and are loved by the Most Merciful One:
Subḥānallāhi wa biḥamdih, 
Subḥānallāhi ‘l-`Aẓīm.', 'Allah''s Messenger (ﷺ) said: Two words are light on the tongue, weigh heavily in the balance, and are loved by the Most Merciful One:

Glorified is Allah and praised is He, Glorified is Allah the Most Great.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari 7/168, Muslim 4/2072.', NULL, 'a1567d3f2d491c210fe0f679876ee1cce177758949bb9f7557a0ec5ba4d486d8', 'وقال صلي الله عليه وسلم كلمتان خفيفتان علي اللسان ثقيلتان في الميزان حبيبتان الي الرحمن سبحان الله وبحمده سبحان الله العظيم', 1, TRUE, 'published'),
  (258, 'hisn-258', 130, 'hisn-al-muslim', 258, 'وَقَالَ صلى الله عليه وسلم: لَأَنْ أَقُولَ (سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ)، أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمسُ.', 'Allah''s Messenger (ﷺ) said: For me to say:
Subḥānallāh, 
walḥamdu lillāh, 
wa lā ilāha illallāh, 
wallāhu ''Akbar 
is dearer to me than all that the sun rises upon (i.e. the whole world).', 'Allah''s Messenger (ﷺ) said: For me to say:

Glory is to Allah, 
and praise is to Allah, 
and there is none worthy of worship but Allah,
and Allah is the Most Great.

is dearer to me than all that the sun rises upon (i.e. the whole world).', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2072.', NULL, '32f323295e3ab2e0bd949064cfb906f5f18f04c83aa6341f1956270a27bd4a70', 'وقال صلي الله عليه وسلم لان اقول سبحان الله والحمد لله ولا اله الا الله والله اكبر احب الي مما طلعت عليه الشمس', 1, TRUE, 'published'),
  (259, 'hisn-259', 130, 'hisn-al-muslim', 259, 'وَقَالَ صلى الله عليه وسلم: أَيَعْجِزُ أَحَدُكُم أَنْ يَكْسِبَ كُلَّ يَوْمٍ أَلْفَ حَسَنَةٍ؟ فَسَأَلَهُ سَائِلٌ مِنْ جُلَسَائِهِ كَيْفَ يَكْسِبُ أَحَدُنَا أَلْفَ حَسَنَةٍ؟ قَالَ: يُسَبِّحُ مِائَةَ تَسْبِيحَةٍ، فَيُكتَبُ لَهُ أَلْفُ حَسَنَةٍ أَوْ يُحَطُّ عَنْهُ أَلْفُ خَطِيئَةٍ.', '--', 'Allah''s Messenger (ﷺ) said:

"Is anyone of you incapable of earning one thousand Hasanah (rewards) in a day?" 
Someone from his gathering asked, "How can anyone of us earn a thousand Hasanah?" 
He said, "Glorify Allah a hundred times and a thousand Hasanah will be written for you, or a thousand sins will be wiped away."', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2073.', NULL, 'a8ad0c6d176fda4ca712d9595f1f4817ad6aa338515c3d33358798797555c21e', 'وقال صلي الله عليه وسلم ايعجز احدكم ان يكسب كل يوم الف حسنه فساله سايل من جلسايه كيف يكسب احدنا الف حسنه قال يسبح مايه تسبيحه فيكتب له الف حسنه او يحط عنه الف خطييه', 1, TRUE, 'published'),
  (260, 'hisn-260', 130, 'hisn-al-muslim', 260, 'مَنْ قَالَ (سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ) غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ', 'Whoever says:
Subḥānallāhi ‘l-''Aẓīmi wa biḥamdih
will have a date palm planted for him in Paradise.', 'Whoever says:

Glorified is Allah the Most Great and praised is He.

will have a date palm planted for him in Paradise.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/511, and Al-Hakim who graded it authentic and Ath-Thahabi 
agreed 1/501. See also Al-Albani, Sahihul-Jami'' As-Saghir 5/531 and Sahih 
At-Tirmidhi3/160.', 'Sahih', '1dd909051a50266ef0cc25297bdb7a70c0e6457c22c945468a54b4684ea146dd', 'من قال سبحان الله العظيم وبحمده غرست له نخله في الجنه', 1, TRUE, 'published'),
  (261, 'hisn-261', 130, 'hisn-al-muslim', 261, 'وَقَالَ صلى الله عليه وسلم: يَا عَبْدَ اللَّهِ بْنَ قَيْسٍ أَلاَ أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ؟ فَقُلْتُ: بَلَى يَا رَسُولَ اللَّهِ، قَالَ: قُلْ (لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ).', 'Allah''s Messenger (ﷺ) said: "O Abdullah bin Qais, should I not point you to one of the treasures of Paradise?" 
I said, "Yes, O Messenger of Allah." 
So he told me to say:
Lā ḥawla wa lā quwwata ''illā billāh.', 'Allah''s Messenger (ﷺ) said: "O Abdullah bin Qais, should I not point you to one of the treasures of Paradise?" 
I said, "Yes, O Messenger of Allah." 
So he told me to say:
There is no power and no might except by Allah.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/213, Muslim 4/2076.', NULL, '3ed6585473c9baea20dd7b69d4008a514fffb7a83fee3ca2ae01fa49ccce2c1f', 'وقال صلي الله عليه وسلم يا عبد الله بن قيس الا ادلك علي كنز من كنوز الجنه فقلت بلي يا رسول الله قال قل لا حول ولا قوه الا بالله', 1, TRUE, 'published'),
  (262, 'hisn-262', 130, 'hisn-al-muslim', 262, 'وَقَالَ صلى الله عليه وسلم: أَحَبُّ الْكَلاَمِ إِلَى اللَّهِ أَرْبَعٌ: (سُبْحَانَ اللَّهِ)، وَ(الْحَمْدُ لِلَّهِ)، وَ(لاَ إِلَهَ إِلاَّ اللَّهُ)، وَ(اللَّهُ أَكْبَرُ)، لاَ يَضُرُّكَ بِأَيِّهِنَّ بَدَأتَ', 'Allah''s Messenger (ﷺ) said: The most beloved words to Allah are four:
Subḥānallāh
Walḥamdu lillāh.
Wa lā ilāha illallāh
Wallāhu Akbar.', 'Allah''s Messenger (ﷺ) said: The most beloved words to Allah are four:

Glorified is Allah, 
and
The praise is for Allah, 
and
There is none worthy of worship but Allah, 
and
Allah is the Most Great.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 3/1685.', NULL, 'cd94332a014944e7def1bd4cc97c3f448ed57ce890a28aeb416d3e924d56e1e2', 'وقال صلي الله عليه وسلم احب الكلام الي الله اربع سبحان الله و الحمد لله و لا اله الا الله و الله اكبر لا يضرك بايهن بدات', 1, TRUE, 'published'),
  (263, 'hisn-263', 130, 'hisn-al-muslim', 263, 'جَاءَ أَعْرَابِيٌّ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقَالَ: عَلِّمْنِي كَلاماً أَقُولُهُ: قَالَ: قُلْ (لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، اللَّهُ أَكْبَرُ كَبِيراً، وَالْحَمْدُ لِلَّهِ كَثِيراً، سُبْحَانَ اللَّهِ رَبِّ العَالَمِينَ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَزِيزِ الْحَكِيمِ). قَالَ: فَهَؤُلاَءِ لِرَبِّي، فَمَا لِي؟ قَالَ: قُلْ (اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي).', 'A desert Arab came to Allah''s Messenger (ﷺ) and said, "Teach me a word 
that I can say. " The Prophet told him to say:
Lā ilāha illallāh
waḥdahu lā sharīka lah, 
Allāhu Akbaru kabīra, 
walḥamdu lillāhi kathīra, 
Subḥānallāhi Rabbil-`ālamīn, 
Lā ḥawla wa lā quwwata illā billāhi ‘l-`Azīzil-Hakīm.', 'He said, "That is for my Lord, but what about me?" The Prophet (ﷺ) told 
him to say:
Allāhummaghfir lī, warḥamnī, waḥdinī warzuqnī.

A desert Arab came to Allah''s Messenger (ﷺ) and said, "Teach me a word that I can say. " The Prophet told him to say:

There is none worthy of worship but Allah, Who has no partner, 
Allah is the Great, the Most Great, 
and praise is to Allah in abundance, 
glory is to Allah, Lord of the worlds. 
There is no power and no might but by Allah the Mighty, the Wise.

He said, "That is for my Lord, but what about me?" The Prophet (ﷺ) told him to say:

O Allah forgive me, and have mercy on me and guide me, and provide for me.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2072, Abu Dawud reports the same Hadith with the addition: and 
when the Arab left, the Prophet (ﷺ) said: "He has filled his hands with 
goodness." 1/220.', 'Hasan', '59b88e4823d0dd0cd649adb859e5005d2a66d7762725247bc205e99af7f1ff3f', 'جاء اعرابي الي رسول الله صلي الله عليه وسلم فقال علمني كلاما اقوله قال قل لا اله الا الله وحده لا شريك له الله اكبر كبيرا والحمد لله كثيرا سبحان الله رب العالمين لا حول ولا قوه الا بالله العزيز الحكيم قال فهولاء لربي فما لي قال قل اللهم اغفر لي وارحمني واهدني وارزقني', 1, TRUE, 'published'),
  (264, 'hisn-264', 130, 'hisn-al-muslim', 264, 'كَانَ الرَّجُلُ إِذَا أَسْلَمَ عَلَّمَهُ النَّبيُّ صلى الله عليه وسلم الصَّلاَةَ ثُمَّ أَمَرَهُ أَنْ يَدْعُوَ بِهَؤُلاَءِ الْكَلِمَاتِ: (اللَّهُمَّ اغْفِرِ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي وَارْزُقْنِي)', 'Whenever anyone accepted Islam, the Prophet (ﷺ) used to teach him how to 
pray then he would instruct him to invoke Allah with the following words:
Allāhummaghfir lī, warḥamnī, waḥdinī, wa `āfinī warzuqnī.', 'Whenever anyone accepted Islam, the Prophet (ﷺ) used to teach him how to pray then he would instruct him to invoke Allah with the following words:

O Allah forgive me, and have mercy on me and guide me and give me good health and provide for me.', NULL, 1, NULL, NULL, NULL, 'muslim', NULL, 'Muslim 4/2073, and in one of Muslim''s reports there is the addition: ''For 
these words combine [the goodness of] this world and the next.''', 'Hasan', '70f7931ff51cfe912f30653321ed566b753b7beabcc1174b625515dd70096f33', 'كان الرجل اذا اسلم علمه النبي صلي الله عليه وسلم الصلاه ثم امره ان يدعو بهولاء الكلمات اللهم اغفر لي وارحمني واهدني وعافني وارزقني', 1, TRUE, 'published'),
  (265, 'hisn-265', 130, 'hisn-al-muslim', 265, 'إِنَّ أَفْضَلَ الدُّعَاءِ (الْحَمْدُ لِلَّهِ)، وَأَفْضَلَ الذِّكْرِ (لاَ إِلَهَ إِلاَّ اللَّهُ)', 'The most excellent invocation is:
Alḥamdulillāh', 'and the most excellent words of remembrance are:
Lā ilāha illallāh.

The most excellent invocation is:

Praise is for Allah.

and the most excellent words of remembrance are:

There is none worthy of worship but Allah.', NULL, 1, NULL, NULL, NULL, 'tirmidhi', NULL, 'At-Tirmidhi 5/462, Ibn Majah 2/1249, and Al-Hakim who graded it authentic 
and Ath-Tbahabi agreed 1/503. See Al-Albani, Sahihul-Jami'' As-Saghir 1/362.', 'Sahih', '9d56683a334acb64491e15f67d20a55dcdbda6ea1a33dd40cd405be6ad11466f', 'ان افضل الدعاء الحمد لله وافضل الذكر لا اله الا الله', 1, TRUE, 'published'),
  (266, 'hisn-266', 130, 'hisn-al-muslim', 266, 'الباقيات الصالحات : (سبحان الله) و(الحمد لله )، و(لا إله إلا الله)، و(الله أكبر) ،و (لا حول ولا قوة إلا بالله).', 'The good deeds which endure are:
Subḥānallāh.
Walḥamdu lillāh.
Wa lā ilāha illallāh
Wallāhu Akbar
Wa lā ḥawla wa lā quwwata illā billāh.', 'The good deeds which endure are:

Glorified is Allah, 
and
The praise is for Allah, 
and
There is none worthy of worship but Allah,
and
Allah is the Most Great,
and
There is no power and no might except by Allah.', NULL, 1, NULL, NULL, NULL, 'ahmad', '513', 'Ahmad (no. 513) (Ahmad Shakir, ed.) and its chain of narration is 
authentic. See Majma''uz-Zawa''id 1/297. Ibn Hajar mentions it in 
Bulughul-Maram saying that Ibn Hibban and Al-Hakim considered it authentic.', 'Sahih', '6bb43777062fc4b8ac5bf9e9bdc8cd37fedaaabbb97d7819f41c3172e12c3ef4', 'الباقيات الصالحات سبحان الله و الحمد لله و لا اله الا الله و الله اكبر و لا حول ولا قوه الا بالله', 1, TRUE, 'published'),
  (267, 'hisn-267', 131, 'hisn-al-muslim', 267, 'عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رضي الله عنهما قَالَ: رَأَيْتُ النَّبيَّ صلى الله عليه وسلم يَعْقِدُ التَّسْبِيحَ بِيَمِينِهِ.', NULL, 'Abdullah bin ''Amr (RA) said: "I saw the Prophet (ﷺ) counting the 
glorification of his Lord on his right hand."', NULL, 1, NULL, NULL, NULL, 'tirmidhi', '4865', 'Abu Dawud with a different wording 2/81, and At-Tirmidhi 5/521. See also 
Al-Albani, Sahihul-Jami''As-Saghir 4/271 (no. 4865).', 'Sahih', 'c7aef563044f779dd15b7450509c70f9710e3739371b60ff2d8ee6de5bf828a8', 'عن عبد الله بن عمرو رضي الله عنهما قال رايت النبي صلي الله عليه وسلم يعقد التسبيح بيمينه', 1, TRUE, 'published'),
  (268, 'hisn-268', 132, 'hisn-al-muslim', 268, 'إِذَا كَانَ جُنْحُ اللَّيْلِ – أَوْ أَمْسَيْتُم – فَـكُفُّوا صِبْيانَـكُم، فَإِنَّ الشَّيَاطِينَ تَنْتَشِرُ حِينَئِذٍ، فَإِذَا ذَهَبَ سَاعَةٌ مِنَ اللَّيلِ فَخَلُّوهُمْ، وَأَغْلِقُوا الأَبْوَابَ وَاذْكُرُوا اسْمَ اللَّهِ؛ فَإِنَّ الشَّيطَانَ لاَ يَفْتَحُ بَاباً مُغلَقاً، وَأَوْكُوا قِرَبَكُمْ، وَاذْكُرُوا اسْمَ اللَّهِ، وَخَمِّرُوا آنِيَتَكُم، وَاذْكُرُوا اسْمَ اللَّهِ، وَلَوْ أَنْ تَعْرُضُوا عَلَيْهَا شَيْئاً، وَأَطْفِئُوا مَصَابِيحَكُمْ.', NULL, 'When night falls, restrain your children (from going out) because at such time the devils spread about. After a period of time has passed, let them be. Shut your doors and mention Allah’s name, for verily the devil does not open a shut door, tie up your water-skins and mention Allah’s name, cover your vessels with anything and mention Allah’s name and put out your lamps.', NULL, 1, NULL, NULL, NULL, 'bukhari', NULL, 'Al-Bukhari with Al-Fath 10/88 and Muslim 3/1595.', NULL, '717c37a4c7cab94f8ec06e2ef3d595f3d7b648e0abe9a226906598f82db2a88f', 'اذا كان جنح الليل – او امسيتم – فكفوا صبيانكم فان الشياطين تنتشر حينيذ فاذا ذهب ساعه من الليل فخلوهم واغلقوا الابواب واذكروا اسم الله فان الشيطان لا يفتح بابا مغلقا واوكوا قربكم واذكروا اسم الله وخمروا انيتكم واذكروا اسم الله ولو ان تعرضوا عليها شييا واطفيوا مصابيحكم', 1, TRUE, 'published')
ON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();

-- Reset primary key sequences
SELECT setval('public.dua_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.dua_categories));
SELECT setval('public.duas_adhkar_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.duas_adhkar));

COMMIT;
