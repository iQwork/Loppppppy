import type {TopicStudioSpec} from '../types/academy';
import {
  drawAngleArc,
  drawFlowTrack,
  drawMeasureBand,
  drawOrbitPath,
  drawShockRings,
  drawSprayStream,
  drawSteadyBadge,
} from '../utils/canvasHelpers';

export const STUDIO_SPECS_PART2: Record<string, TopicStudioSpec> = {
  'p7-t1': {
    topicId: 'p7-t1',
    imgSrc: '/src/assets/images/atlas_neck_cysts_1795586347534.jpg',
    imgAlt: 'Neck and floor of mouth cysts: sublingual dermoid, thyroglossal duct cyst, and branchial cyst',
    duration: 8,
    scenarios: [
      {
        label: '1. كيس القناة الدرقية (يصعد بالبلع) والغلصمي (SCM)',
        activePart: 'thyro',
        focus: {cx: 0.54, cy: 0.50, scale: 1.38},
        duration: 8,
        seeIq:
          'بالوسط جوا العظم اللامي (Hyoid) تشوف كيس الـ Thyroglossal يصعد وينزل بحركة البلع على طول القناة الدرقية؛ ويم الحافة الأمامية لعضلة الـ Sternomastoid كاعد الـ Branchial cyst.',
        whyIq:
          'بسبب اتصال القناة بالعظم اللامي يصعد الكيس بالبلع ولازم نشيل وياه جسم العظم اللامي (Body of hyoid) حتى ما يرجع؛ والـ Branchial يجي من القوس الغلصمي الثاني.',
        tipIq: 'Thyroglossal = rises on swallowing + excise body of hyoid · Branchial = 2nd arch anterior to SCM.',
      },
      {
        label: '2. الجلداني تحت اللسان (Dermoid) فوك الـ Mylohyoid',
        activePart: 'dermoid',
        focus: {cx: 0.44, cy: 0.34, scale: 1.55},
        duration: 8,
        seeIq:
          'التركيز هنا عالكيس الجلداني (Sublingual dermoid) بالمنتصف فوك عضلة الـ Mylohyoid والعظم اللامي: بيه غدد دهنية وعرقية وشعر (Skin adnexae) وأعمق وأصلب وبلا زرقة الـ Ranula.',
        whyIq:
          'إذا الكيس ما حوى ملحقات جلدية نسميه Epidermoid cyst، وممكن نلقى تحت اللسان حالة نادرة اسمها Foregut cyst.',
        tipIq: 'Dermoid = above hyoid/mylohyoid · skin adnexae (else epidermoid) · deeper/firmer & NO blue color vs ranula.',
      },
    ],
    parts: [
      {
        key: 'dermoid',
        en: 'Sublingual Dermoid (Above Mylohyoid)',
        ar: 'الجلداني تحت اللسان (فوك Mylohyoid)',
        posPct: [0.435, 0.345],
        iq: 'بمنتصف قاع الفم فوك اللامي والـ Mylohyoid مع ملحقات جلدية وأصلب من الـ Ranula بلا زرقة.',
        clinical: '2nd-3rd decade | vs Epidermoid / Foregut',
      },
      {
        key: 'thyro',
        en: 'Thyroglossal Duct Cyst (Moves on Swallow)',
        ar: 'كيس القناة الدرقية (يصعد بالبلع)',
        posPct: [0.48, 0.55],
        getPosPct: (t, st) => [
          0.48,
          st.scIdx === 0 ? 0.55 - 0.032 * (0.5 - 0.5 * Math.cos(t * 1.4)) : 0.55,
        ],
        iq: 'أشيع كيس بالرقبة يصعد عند البلع ويا اللسان واللامي، ويُستأصل مع جسم العظم اللامي.',
        clinical: 'Excise tract + body of hyoid bone',
      },
      {
        key: 'branchial',
        en: 'Branchial Cyst (2nd Arch anterior to SCM)',
        ar: 'الكيس الغلصمي (قدام عضلة SCM)',
        posPct: [0.60, 0.44],
        iq: 'من القوس الغلصمي الثاني عند الحافة الأمامية لعضلة القصية الترقوية جوا زاوية الفك.',
        clinical: 'Embryonic weeks 2-6 | Presents up to 40y',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.48, y: h * 0.62},
            {x: w * 0.48, y: h * 0.44},
          ],
          t,
          {colorStart: '#E11D48', colorEnd: '#D97706', width: 3.2, pulseSpeed: 0.35, reciprocate: true, arrowEnd: true},
        );
        drawOrbitPath(ctx, {x: w * 0.60, y: h * 0.44}, 22, 30, t, {color: '#38BDF8', speed: 0.85});
      } else {
        drawOrbitPath(ctx, {x: w * 0.435, y: h * 0.345}, 28, 19, t, {color: '#D97706', speed: 0.9});
        drawMeasureBand(
          ctx,
          {x: w * 0.38, y: h * 0.42},
          {x: w * 0.51, y: h * 0.42},
          {label: 'Above Mylohyoid', color: '#10B981'},
        );
      }
    },
  },

  'p7-t2': {
    topicId: 'p7-t2',
    imgSrc: '/src/assets/images/atlas_enucleation_stripping_1795586408410.jpg',
    imgAlt: 'One-piece surgical enucleation stripping cyst sac cleanly from dense reactive bone rim',
    duration: 8,
    scenarios: [
      {
        label: '1. الحافة العظمية الكثيفة (Condensing Osteitis) والمرونة',
        activePart: 'rim',
        focus: {cx: 0.38, cy: 0.50, scale: 1.32},
        duration: 8,
        seeIq:
          'شوف تعريف الكيس بالصورة: جيب مبطن بظهارة مليان سائل محاط بحلقة عظمية تفاعلية كثيفة (Condensing osteitis)؛ وبالجس بعد ترقق العظم يعطي ارتداد مرن (Rebound resiliency).',
        whyIq:
          'نعالج الأكياس بأربع طرق أساسية: Enucleation و Marsupialization و Staged combination و Enucleation with curettage.',
        tipIq: 'Cyst reactive rim = Condensing osteitis · Thin cortex = Rebound resiliency -> Fluctuance.',
      },
      {
        label: '2. تقشير الـ Enucleation قطعة واحدة مثل السمحاق',
        activePart: 'sac',
        focus: {cx: 0.45, cy: 0.54, scale: 1.48},
        duration: 8,
        seeIq:
          'الأداة الجراحية كاعدة تفصل جدار الكيس السليم عن العظم وتقشره قطعة واحدة بدون تمزق مثل تقشير الـ Periosteum عن العظم.',
        whyIq:
          'عدم تمزق الكيس وتفتته (No fragmentation) يمنع بقاء خلايا ظهارية داخل التجويف وبذلك يقلل احتمالية الرجوع.',
        tipIq: 'Enucleation = total removal without rupture (like stripping periosteum) in ONE piece.',
      },
    ],
    parts: [
      {
        key: 'rim',
        en: 'Condensing Osteitis Reactive Rim',
        ar: 'حافة العظم التفاعلي الكثيف',
        posPct: [0.39, 0.28],
        iq: 'حلقة عظمية كثيفة تتكون كاستجابة دفاعية حول الكيس وتظهر بالأشعة كإطار أبيض.',
        clinical: 'Radiopaque periphery around cyst',
      },
      {
        key: 'sac',
        en: 'Intact Cyst Sac (One-Piece Strip)',
        ar: 'كيس كامل مقشر بلا تمزق',
        posPct: [0.38, 0.52],
        iq: 'الـ Enucleation يشيل الكيس كله قطعة واحدة دون تفتيت مثل تقشير الـ Periosteum.',
        clinical: 'Minimizes recurrence risk',
      },
      {
        key: 'nerve',
        en: 'Preserved Neurovascular Bundle',
        ar: 'الحزمة العصبية الوعائية المحمية',
        posPct: [0.29, 0.78],
        iq: 'سلامة العصب والدم أسفل الجدار القاعدي أثناء التقشير الدقيق.',
        clinical: 'One of 4 surgical methods',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const center = {x: w * 0.40, y: h * 0.51};
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, center, w * 0.11, h * 0.21, t, {color: '#D97706', speed: 0.75});
        drawShockRings(ctx, center, t, {color: '#38BDF8', maxRadius: 48, rings: 3, speed: 0.25});
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.46, y: h * 0.36},
            {x: w * 0.51, y: h * 0.54},
            {x: w * 0.41, y: h * 0.70},
          ],
          t,
          {colorStart: '#0D9488', colorEnd: '#10B981', width: 3.4, pulseSpeed: 0.38, arrowEnd: true},
        );
        drawSteadyBadge(ctx, w * 0.55, h * 0.72, 'Strip Intact (Periosteum Plane)', '#10B981');
      }
    },
  },

  'p8-t1': {
    topicId: 'p8-t1',
    imgSrc: '/src/assets/images/atlas_enucleation_curette_1795586406504.jpg',
    imgAlt: 'Surgical curette with concave face toward bone and convex back stripping cyst above IAN',
    duration: 8,
    scenarios: [
      {
        label: '1. اتجاه الـ Curette الصحيح (المقعر للعظم والمحدب للكيس)',
        activePart: 'curette',
        focus: {cx: 0.50, cy: 0.50, scale: 1.42},
        duration: 8,
        seeIq:
          'شوف وضع الكيريت المنحنية بدقة: وجهها المقعر (Concave) يباوع لجدار العظم، وظهرها المحدب (Convex) يدفع ويقشر الكيس بلا ثقبه حتى نحافظ عالضغط الداخلي.',
        whyIq:
          'ثقب الكيس يفرغ السائل وينكمش الجدار فيتفتت؛ أما حفظ الضغط بالكيريت الكبيرة وحفظ شريط قمة السنخ (Alveolar crest) فيطلع الكيس سليم.',
        tipIq: 'Concave face ALWAYS toward bone · Convex edge strips cyst · Keep alveolar crest intact.',
      },
      {
        label: '2. حماية العصب المزاح وامتلاء العظم (6–12 شهر / شاش 2–3 أيام)',
        activePart: 'nerve',
        focus: {cx: 0.48, cy: 0.62, scale: 1.5},
        duration: 8,
        seeIq:
          'تحت الكيس تشوف العصب السنخي السفلي مزاح لجهة وحدة من التجويف؛ وبعد الخياطة المحكمة يمتلي العظم خلال 6–12 شهر.',
        whyIq:
          'لو تفككت الخياطة الأولية نغسل بـ saline ونحشي شاش مضاد حيوي نبدله كل 2–3 أيام لحد ظهور الـ Granulation tissue بعمر 3–4 أيام.',
        tipIq: 'Bone fill = 6–12 months · Wound breakdown = irrigate saline + gauze q2–3d -> granulation 3–4d.',
      },
    ],
    parts: [
      {
        key: 'crest',
        en: 'Intact Alveolar Crest & Labial Flap',
        ar: 'حفظ قمة السنخ والشريحة الشفوية',
        posPct: [0.625, 0.50],
        iq: 'تترك قمة السنخ سليمة لتأمين ارتفاع عظم جيد بعد الإغلاق الأولي المحكم.',
        clinical: 'Check root devitalization post-op',
      },
      {
        key: 'curette',
        en: 'Spoon Curette (Concave -> Bone)',
        ar: 'الكيريت (المقعر للعظم والمحدب للكيس)',
        posPct: [0.51, 0.56],
        iq: 'نستخدم أكبر كيريت رفيعة: الوجه المقعر للعظم والظهر المحدب لتقشير الكيس وحفظ ضغطه.',
        clinical: 'Prevents cyst perforation',
      },
      {
        key: 'nerve',
        en: 'Pushed-Aside IAN Bundle',
        ar: 'العصب السفلي المزاح بالقعر',
        posPct: [0.495, 0.68],
        iq: 'الأعصاب والأوعية تنزاح لجانب التجويف فتتجنبها برفق ولا نقطع تروية الجذور.',
        clinical: 'Bone fill 6-12m | Gauze q2-3d if open',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.62, y: h * 0.52},
            {x: w * 0.50, y: h * 0.56},
            {x: w * 0.40, y: h * 0.45},
          ],
          t,
          {colorStart: '#0284C7', colorEnd: '#0D9488', width: 3.4, pulseSpeed: 0.4, arrowEnd: true},
        );
        drawAngleArc(ctx, {x: w * 0.51, y: h * 0.56}, 36, Math.PI * 0.85, Math.PI * 1.15, '15-20°', '#D97706');
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.34, y: h * 0.50},
            {x: w * 0.43, y: h * 0.64},
            {x: w * 0.64, y: h * 0.74},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3.2, pulseSpeed: 0.36, arrowEnd: true},
        );
        drawSteadyBadge(ctx, w * 0.50, h * 0.85, 'Bone Fill: 6-12m | Breakdown: q2-3d', '#0D9488');
      }
    },
  },

  'p8-t2': {
    topicId: 'p8-t2',
    imgSrc: '/src/assets/images/atlas_marsupialization_decompression_1795586406810.jpg',
    imgAlt: 'Marsupialization Partsch window decompression with fluid drainage and concentric new bone',
    duration: 8,
    scenarios: [
      {
        label: '1. نافذة Partsch وتصريف الضغط الداخلي (Decompression)',
        activePart: 'window',
        focus: {cx: 0.57, cy: 0.46, scale: 1.48},
        duration: 8,
        seeIq:
          'أول ما نفتح نافذة جراحية بقطر واسع بالسقف يتصل الكيس بتجويف الفم ويطلع السائل لبرة فينزل الضغط الداخلي فوراً (Decompression).',
        whyIq:
          'تمدد الكيس يعتمد على الضغط التناضحي الداخلي؛ وبفتح الشباك (عملية Partsch) يوقف التوسع العظمي دون الحاجة لشيل البطانة كلها دفعة وحدة.',
        tipIq: 'Marsupialization = Decompression = Partsch operation -> immediate drop in intracystic pressure.',
      },
      {
        label: '2. انكماش الكيس وتكون عظم جديد مركزياً',
        activePart: 'bonefill',
        focus: {cx: 0.47, cy: 0.56, scale: 1.38},
        duration: 8,
        seeIq:
          'شوف الحلقات العظمية الجديدة (الترابيكولا المتمركزة) كاعدة تبني من المحيط للداخل كل ما ينكمش الكيس ويصغر قطره.',
        whyIq:
          'تُستعمل إما كعلاج وحيد بحالات مختارة أو كخطوة تمهيدية حتى يبني عظم يحمي الأعصاب ويسهل الاستئصال لاحقاً.',
        tipIq: 'Decompression promotes progressive shrinkage of cyst + centripetal bone fill.',
      },
    ],
    parts: [
      {
        key: 'window',
        en: 'Surgical Partsch Window & Drainage',
        ar: 'نافذة Partsch وخروج السائل',
        posPct: [0.57, 0.40],
        iq: 'القطعة الوحيدة المستأصلة هي نافذة الاتصال بين تجويف الكيس والفم لتصفير الضغط.',
        clinical: 'Marsupialization / Decompression',
      },
      {
        key: 'cyst',
        en: 'Decompressed Shrinking Cyst',
        ar: 'تجويف الكيس المنكمش',
        posPct: [0.49, 0.57],
        iq: 'بانخفاض الضغط التناضحي يتوقف توسع الجدار ويبدأ حجمه بالتقلص شهراً بعد شهر.',
        clinical: 'Reduces cavity volume safely',
      },
      {
        key: 'bonefill',
        en: 'Centripetal New Bone Apposition',
        ar: 'العظم الجديد من المحيط للداخل',
        posPct: [0.36, 0.56],
        iq: 'نمو ترابيكولا عظمية جديدة يدفع قاع التجويف بعيداً عن القناة السنية السفلية.',
        clinical: 'Sole or preliminary therapy',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.49, y: h * 0.57},
            {x: w * 0.57, y: h * 0.41},
            {x: w * 0.60, y: h * 0.66},
          ],
          t,
          {colorStart: '#38BDF8', colorEnd: '#0D9488', width: 3.4, pulseSpeed: 0.44, arrowEnd: true},
        );
        drawSprayStream(
          ctx,
          {x: w * 0.58, y: h * 0.44},
          {x: w * 0.60, y: h * 0.68},
          t,
          {colorCore: '#38BDF8', colorMist: '#BAE6FD', spreadPx: 7, count: 10, speed: 0.55},
        );
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.33, y: h * 0.56},
            {x: w * 0.43, y: h * 0.56},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3, pulseSpeed: 0.35, arrowEnd: true},
        );
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.65, y: h * 0.58},
            {x: w * 0.55, y: h * 0.58},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3, pulseSpeed: 0.35, arrowEnd: true},
        );
      }
    },
  },

  'p9-t1': {
    topicId: 'p9-t1',
    imgSrc: '/src/assets/images/atlas_marsupialization_window_1795586408247.jpg',
    imgAlt: 'Creating >=1 cm marsupialization osseous window using surgical bur and bone rongeurs protecting IAN and tooth',
    duration: 8,
    scenarios: [
      {
        label: '1. الدواعي الخمسة: حماية العصب وبزوغ السن ومنع الكسر',
        activePart: 'vital',
        focus: {cx: 0.44, cy: 0.60, scale: 1.44},
        duration: 8,
        seeIq:
          'هنا كيس كبير ملامس مباشرة للعصب السفلي وسن منطمر وعظم الفك رقيق: لو استأصلناه فوراً نضرب العصب أو ينكسر الفك أو نخسر السن.',
        whyIq:
          'الدواعي الخمس للتفتيح: 1 أذية أنسجة حيوية، 2 صعوبة الوصول، 3 مساعدة بزوغ سن، 4 حالة صحية حرجة، 5 خطر كسر الفك بالكبيرة.',
        tipIq: 'Disadvantages: 1- Pathologic tissue left in situ  2- Daily syringe irrigation inconvenience for months.',
      },
      {
        label: '2. فتح نافذة ≥1 سم بالـ Bur و الـ Rongeurs بعد السحب',
        activePart: 'win',
        focus: {cx: 0.61, cy: 0.45, scale: 1.48},
        duration: 8,
        seeIq:
          'بعد الـ Aspiration بالإبرة نفتح نافذة دائرية/بيضوية 1 سم فأكثر، ولو العظم ثخين نشيله بحذر بالـ Burr والـ Rongeurs وندز قطعة البطانة للفحص النسيجي.',
        whyIq:
          'إذا الشباك كان أصغر من 1 سم راح تلحم اللثة وتسده بسرعة ويرجع يتجمع الضغط؛ والمريض يلتزم يغسل بالسرنجة يومياً لأشهر.',
        tipIq: 'Technique: Aspirate -> Window ≥1 cm (burrs & rongeurs for thick bone) -> submit window tissue.',
      },
    ],
    parts: [
      {
        key: 'vital',
        en: 'Protected IAN & Unerupted Tooth',
        ar: 'حماية العصب والسن المنطمر',
        posPct: [0.44, 0.725],
        iq: 'تمنع أذية الأعصاب وتساعد بزوغ السن المنطمر وتمنع كسر الفك بالأكياس الضخمة.',
        clinical: '5 Indications of Marsupialization',
      },
      {
        key: 'win',
        en: '≥1 cm Window (Bur & Rongeurs)',
        ar: 'نافذة ≥1 سم (بالـ Bur والـ Rongeurs)',
        posPct: [0.57, 0.47],
        iq: 'شباك 1 سم أو أكبر؛ نرفع العظم الثخين بـ Burrs و Rongeurs ونبعث الغطاء للمختبر.',
        clinical: 'Avoid premature closure',
      },
      {
        key: 'irrig',
        en: 'Syringe Irrigation (Months)',
        ar: 'غسل السرنجة اليومي (عدة أشهر)',
        posPct: [0.55, 0.36],
        iq: 'العيب الرئيسي للمريض: ضرورة الغسل بالسرنجة عدة مرات يومياً لأشهر لمنع تجمع الطعام.',
        clinical: 'Disadvantage #2',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.28, y: h * 0.73},
            {x: w * 0.47, y: h * 0.74},
            {x: w * 0.64, y: h * 0.56},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3.2, pulseSpeed: 0.36, arrowEnd: true},
        );
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.50, y: h * 0.58},
            {x: w * 0.50, y: h * 0.42},
          ],
          t,
          {colorStart: '#38BDF8', colorEnd: '#0D9488', width: 3, pulseSpeed: 0.34, arrowEnd: true},
        );
      } else {
        const win = {x: w * 0.56, y: h * 0.48};
        drawOrbitPath(ctx, win, 30, 30, t, {color: '#0D9488', speed: 0.9});
        drawMeasureBand(
          ctx,
          {x: w * 0.52, y: h * 0.58},
          {x: w * 0.60, y: h * 0.58},
          {label: '>= 1 cm', color: '#D97706'},
        );
      }
    },
  },

  'p9-t2': {
    topicId: 'p9-t2',
    imgSrc: '/src/assets/images/atlas_marsupialization_packing_1795586406176.jpg',
    imgAlt: 'Marsupialization cavity visual inspection for ulceration, suturing perimeter, and medicated gauze packing',
    duration: 8,
    scenarios: [
      {
        label: '1. معاينة الجدار: بؤرة التقرح أو التسمك (إنذار ورمي)',
        activePart: 'ulcer',
        focus: {cx: 0.44, cy: 0.44, scale: 1.52},
        duration: 8,
        seeIq:
          'أول ما نفرغ السائل ونباوع بالعين داخل التجويف: لو شفنا بقعة حمرة متقرحة أو سميكة بالجدار الخلفي لازم ندق جرس الإنذار!',
        whyIq:
          'الـ Ulceration أو الـ Thickening ينبه لاحتمال Dysplastic أو Neoplastic changes؛ فلازم فوراً نعمل Enucleation كامل أو Incisional biopsy للمنطقة المشبوهة.',
        tipIq: 'Ulceration or thickening -> rule out dysplasia/neoplasia -> enucleation OR incisional biopsy.',
      },
      {
        label: '2. الخياطة للمخاطية vs شاش البنزوين (10–14 يوم)',
        activePart: 'pack',
        focus: {cx: 0.45, cy: 0.50, scale: 1.38},
        duration: 8,
        seeIq:
          'إذا البطانة ثخينة نخيط حافتها مباشرة للثة الفم (الخيط الأسود فوك)؛ وإذا رقيقة نحشي شاش مشبع بـ Tincture of benzoin أو مرهم مضاد جوا التجويف.',
        whyIq:
          'نترك الشاش 10 إلى 14 يوم حتى ما تلحم اللثة وتسد الشباك، وبحلول الأسبوعين تكون البطانة التحمت تماماً بمخاطية الفم.',
        tipIq: 'Suture if thick lining · Else benzoin/antibiotic strip gauze 10–14 days (heals to oral mucosa by 2 wks).',
      },
    ],
    parts: [
      {
        key: 'ulcer',
        en: 'Ulceration / Thickening Red Flag',
        ar: 'بقعة التقرح أو التسمك المشبوهة',
        posPct: [0.43, 0.44],
        iq: 'علامة إنذار سريرية: تدل على احتمال تغير سرطاني أو خلل تنسج وتتطلب استئصال أو Incisional biopsy.',
        clinical: 'Mandatory visual check of wall',
      },
      {
        key: 'suture',
        en: 'Perimeter Sutured to Oral Mucosa',
        ar: 'خياطة الجدار بمخاطية الفم',
        posPct: [0.44, 0.30],
        iq: 'ممكنة إذا كانت بطانة الكيس ثخينة كفاية والوصول الجراحي يسمح بذلك.',
        clinical: 'Maintains permanent stoma',
      },
      {
        key: 'pack',
        en: 'Tincture of Benzoin Gauze (10–14 Days)',
        ar: 'شاش البنزوين / المضاد (10–14 يوم)',
        posPct: [0.47, 0.65],
        iq: 'يُترك 10–14 يوماً لمنع التئام اللثة وسد الفتحة؛ والالتئام الكامل بالمخاطية يتم بأسبوعين.',
        clinical: 'Heals to oral mucosa by 2 weeks',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawShockRings(ctx, {x: w * 0.43, y: h * 0.44}, t, {
          color: '#E11D48',
          maxRadius: 34,
          rings: 3,
          speed: 0.32,
        });
        drawSteadyBadge(ctx, w * 0.43, h * 0.54, 'Biopsy / Enucleate Suspicious Area', '#E11D48');
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.35, y: h * 0.34},
            {x: w * 0.44, y: h * 0.29},
            {x: w * 0.54, y: h * 0.34},
          ],
          t,
          {colorStart: '#10B981', colorEnd: '#0D9488', width: 3, pulseSpeed: 0.38},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.36, y: h * 0.72},
          {x: w * 0.56, y: h * 0.72},
          {label: 'Pack 10-14 Days', color: '#D97706'},
        );
      }
    },
  },

  'p10-t1': {
    topicId: 'p10-t1',
    imgSrc: '/src/assets/images/atlas_maxillary_unroofing_1795586465484.jpg',
    imgAlt: 'Coronal maxilla showing second unroofing into maxillary sinus with watertight sutured oral mucosa below',
    duration: 8,
    scenarios: [
      {
        label: '1. الفتحة الثانية للجيب الفكي وهجرة الظهارة التنفسية',
        activePart: 'antrum',
        focus: {cx: 0.55, cy: 0.35, scale: 1.44},
        duration: 8,
        seeIq:
          'بالفك العلوي الكيس كبير واصل للجيب الفكي (Maxillary sinus): بعد ما نكمل الشغل نفتح فتحة سقف ثانية واسعة للأعلى للجيب الفكي أو الأنف.',
        whyIq:
          'تهاجر ظهارة الجيب التنفسية (Respiratory epithelium) لداخل الكيس وتبطنه؛ وبنفس الوقت نسد فتحة الفم تحت بخياطة محكمة حتى ما يصير ناسور.',
        tipIq: 'Maxillary routes: into oral cavity OR second unroofing into antrum/nasal + close oral opening.',
      },
      {
        label: '2. إغلاق الفم المحكم + الاستثناءان النادران للعلاج الوحيد',
        activePart: 'oral',
        focus: {cx: 0.49, cy: 0.62, scale: 1.42},
        duration: 8,
        seeIq:
          'جوا بالفم تشوف الخيط الأسود مسكر الشق الفموي بالكامل. نادراً جداً نكتفي بالـ Marsupialization وحدها بدون مرحلة ثانية.',
        whyIq:
          'الاستثناءان بس: 1- Dentigerous cyst بعد بزوغ السن وما ضل كيس متبقي، 2- وجود Concomitant medical problem تمنع جراحة ثانية.',
        tipIq: '2 Sole-therapy exceptions: (1) Dentigerous cyst after eruption (2) Concomitant medical problem.',
      },
    ],
    parts: [
      {
        key: 'antrum',
        en: 'Second Unroofing into Maxillary Sinus',
        ar: 'الفتحة الثانية للجيب الفكي وهجرة الظهارة',
        posPct: [0.58, 0.25],
        iq: 'تسمح بهجرة الـ Respiratory epithelium من الجيب أو الأنف لتبطين التجويف.',
        clinical: 'Continuous with sinus/nasal lining',
      },
      {
        key: 'cyst',
        en: 'Maxillary Cyst Cavity',
        ar: 'تجويف الكيس العلوي المتصل',
        posPct: [0.61, 0.45],
        iq: 'تتجفف وتتنفس عبر الجيب/الأنف وتتعافى دون حاجة لبقاء الشباك الفموي مفتوحاً.',
        clinical: 'Alternative to oral-cavity window',
      },
      {
        key: 'oral',
        en: 'Watertight Closed Oral Opening',
        ar: 'إغلاق الفتحة الفموية تماماً',
        posPct: [0.50, 0.70],
        iq: 'يُخاط الشق الفموي بإحكام بعد التأكد من التصريف عبر الجيب؛ والالتئام يحافظ عالتواصل مع الأنف.',
        clinical: 'Only 2 sole-therapy exceptions',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.61, y: h * 0.46},
            {x: w * 0.59, y: h * 0.27},
            {x: w * 0.51, y: h * 0.14},
          ],
          t,
          {colorStart: '#0D9488', colorEnd: '#38BDF8', width: 3.4, pulseSpeed: 0.42, arrowEnd: true},
        );
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.55, y: h * 0.14},
            {x: w * 0.58, y: h * 0.30},
          ],
          t,
          {colorStart: '#10B981', colorEnd: '#0D9488', width: 2.6, pulseSpeed: 0.32, dashed: true, arrowEnd: true},
        );
      } else {
        drawMeasureBand(
          ctx,
          {x: w * 0.30, y: h * 0.71},
          {x: w * 0.69, y: h * 0.71},
          {label: 'Oral Incision Closed Tightly', color: '#10B981'},
        );
      }
    },
  },

  'p10-t2': {
    topicId: 'p10-t2',
    imgSrc: '/src/assets/images/atlas_staged_enucleation_1795586406906.jpg',
    imgAlt: 'Staged secondary enucleation showing thickened cyst wall and regenerated bone bridge over IAN',
    duration: 8,
    scenarios: [
      {
        label: '1. تسمك بطانة الكيس (Thickened Lining) ودواعي المرحلة الثانية',
        activePart: 'lining',
        focus: {cx: 0.34, cy: 0.45, scale: 1.52},
        duration: 8,
        seeIq:
          'بعد أشهر من التفتيح توقف الكيس عن التصغر أكثر: شوف جداره اللي صار سميك وقوي (Thickened cystic lining) فتقشيره صار هواية أسهل.',
        whyIq:
          'دواعيها 3: 1 الكيس ما انقفل بالكامل، 2 صعوبة التنظيف عالمريض، 3 رغبة الطبيب بفحص كامل الآفة نسيجياً لكشف أي Occult pathology.',
        tipIq: 'Staged benefit: Thickened cystic lining makes secondary enucleation much easier + full histology.',
      },
      {
        label: '2. التوقيت الذهبي: جسر عظمي يحمي العصب ويمنع الكسر',
        activePart: 'bridge',
        focus: {cx: 0.48, cy: 0.62, scale: 1.48},
        duration: 8,
        seeIq:
          'متى ندخل للعملية الثانية بالضبط؟ بس يتكون الجسر العظمي الأبيض هذا فوك العصب الأصفر ويمتلي الفك بعظم قوي!',
        whyIq:
          'الشرطان هما: تغطية العظم للتراكيب الحيوية المجاورة (تمنع أذيتها) + امتلاء عظمي كافي ينطي قوة للفك تمنع الكسر أثناء الـ Enucleation.',
        tipIq: 'Timing criteria: (1) Bone covers vital structures + (2) Adequate bone fill prevents jaw fracture.',
      },
    ],
    parts: [
      {
        key: 'lining',
        en: 'Thickened Fibrous Cyst Lining',
        ar: 'البطانة الثخينة سهلة التقشير',
        posPct: [0.285, 0.45],
        iq: 'سماكة الجدار المكتسبة بعد التفتيح تسمح بتقشيره كاملاً بلا تمزق وإرساله كله للمختبر.',
        clinical: 'Advantage of Staged Combination',
      },
      {
        key: 'bridge',
        en: 'New Bone Bridge Over IAN',
        ar: 'الجسر العظمي فوق العصب السفلي',
        posPct: [0.51, 0.61],
        iq: 'علامة التوقيت الصحيح: يغطي التراكيب الحيوية ويحمي الفك السفلي من الكسر عند الاستئصال.',
        clinical: 'Mandible strength criterion',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, {x: w * 0.34, y: h * 0.45}, w * 0.08, h * 0.13, t, {
          color: '#10B981',
          speed: 0.9,
        });
        drawMeasureBand(
          ctx,
          {x: w * 0.25, y: h * 0.46},
          {x: w * 0.28, y: h * 0.46},
          {label: 'Thick Wall', color: '#10B981'},
        );
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.38, y: h * 0.64},
            {x: w * 0.51, y: h * 0.69},
            {x: w * 0.64, y: h * 0.72},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3.2, pulseSpeed: 0.36, arrowEnd: true},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.41, y: h * 0.60},
          {x: w * 0.61, y: h * 0.60},
          {label: 'Protective Bone Bridge', color: '#38BDF8'},
        );
      }
    },
  },

  'p11-t1': {
    topicId: 'p11-t1',
    imgSrc: '/src/assets/images/atlas_peripheral_curettage_1795586467420.jpg',
    imgAlt: 'Post-marsupialization peripheral curettage removing 1-2 mm bone containing OKC daughter cysts beside IAN',
    duration: 8,
    scenarios: [
      {
        label: '1. الشق البيضوي حول الشباك + كحت 1–2 ملم للـ Daughter Cysts',
        activePart: 'daughter',
        focus: {cx: 0.48, cy: 0.52, scale: 1.42},
        duration: 8,
        seeIq:
          'شوف الكيسات البنوية الصغيرة (Daughter/satellite cysts) الحمرة بالمحيط: بالـ Sharp curette مع غسل السلاين المعقم نكحت طبقة 1 إلى 2 ملم حول التجويف كله.',
        whyIq:
          'بالـ OKC أو الكيس الراجع لازم شق بيضوي يطوق الشباك لحد العظم السليم لإزالة الـ Epithelial bridge، ثم كحت 1–2 ملم لإزالة الخلايا البنوية والبطانة المتفتتة.',
        tipIq: 'Elliptical incision encircles window down to sound bone · Curettage 1–2 mm for OKC & recurrent cysts.',
      },
      {
        label: '2. الخطران على التروية: لب الأسنان المجاورة والعصب السفلي',
        activePart: 'risk',
        focus: {cx: 0.44, cy: 0.64, scale: 1.52},
        duration: 8,
        seeIq:
          'انتبه للموقع الحرج تحت الكيريت: ذروات جذور الأضراس عاليسار والحزمة العصبية الوعائية الصفراء بالقعر كلش قريبة من حد الكحت.',
        whyIq:
          'مساوئ الكحت الاثنين بالامتحان: 1 قد يقطع تروية لب الأسنان (Strip dental pulps)، 2 قد يأذي الحزم العصبية الوعائية المجاورة.',
        tipIq: '2 Disadvantages: (1) Strips dental pulps of neurovascular supply  (2) Damages neurovascular bundles.',
      },
    ],
    parts: [
      {
        key: 'curette',
        en: 'Sharp Curette + Saline Irrigation (1–2 mm)',
        ar: 'الكيريت الحادة وغسل السلاين (1–2 ملم)',
        posPct: [0.54, 0.59],
        iq: 'شطف مستمر بـ sterile irrigation أثناء كحت 1–2 ملم لإزالة البقايا وتقليل الرجوع.',
        clinical: 'Post-marsupialization elliptical incision',
      },
      {
        key: 'daughter',
        en: 'Satellite / Daughter Cysts (OKC)',
        ar: 'الأكياس البنوية الصغيرة (Daughter cysts)',
        posPct: [0.43, 0.67],
        iq: 'سبب رجوع الـ OKC العالي إلى جانب بطانته الرقيقة، تستوجب كحت 1–2 ملم محيطياً.',
        clinical: 'Indication #1: OKC | #2: Recurrent cyst',
      },
      {
        key: 'risk',
        en: 'Dental Pulp & IAN Bundle Hazard',
        ar: 'خطر قطع تروية اللب وأذية العصب',
        posPct: [0.58, 0.67],
        iq: 'حذر شديد قرب الجذور والقناة حتى ما ينقطع دم الأعصاب والأوعية.',
        clinical: 'Extreme care near vital structures',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawSprayStream(
          ctx,
          {x: w * 0.60, y: h * 0.34},
          {x: w * 0.48, y: h * 0.57},
          t,
          {colorCore: '#38BDF8', colorMist: '#E0F2FE', spreadPx: 8, count: 12, speed: 0.65},
        );
        drawShockRings(ctx, {x: w * 0.43, y: h * 0.67}, t, {
          color: '#E11D48',
          maxRadius: 22,
          rings: 2,
          speed: 0.32,
        });
        drawMeasureBand(
          ctx,
          {x: w * 0.42, y: h * 0.35},
          {x: w * 0.56, y: h * 0.35},
          {label: '1-2 mm Curettage', color: '#0D9488'},
        );
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.34, y: h * 0.65},
            {x: w * 0.54, y: h * 0.72},
            {x: w * 0.72, y: h * 0.56},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#E11D48', width: 3.2, pulseSpeed: 0.36, arrowEnd: true},
        );
        drawSteadyBadge(ctx, w * 0.48, h * 0.84, 'Protect Pulp Supply & IAN Bundle', '#E11D48');
      }
    },
  },

  'p11-t2': {
    topicId: 'p11-t2',
    imgSrc: '/src/assets/images/atlas_ostectomy_cryotherapy_1795586467580.jpg',
    imgAlt: 'Peripheral ostectomy using methylene blue dye and carbide bur vs liquid nitrogen cryoprobe',
    duration: 8,
    scenarios: [
      {
        label: '1. كحت الصبغة الزرقاء (Methylene Blue + Carbide Bur)',
        activePart: 'blue',
        focus: {cx: 0.25, cy: 0.50, scale: 1.44},
        duration: 8,
        seeIq:
          'باللوحة اليسرى جدار التجويف مصبوغ بأزرق الميثيلين، والـ Carbide bur كاعد يبرد طبقة 1–2 ملم إضافية لحد ما يطلع عظم أبيض نظيف خالٍ من أي صبغة.',
        whyIq:
          'صبغة Methylene blue دليل بصري مضمون حتى نتأكد إزالتنا متساوية وما تركنا بقع تحوي خلايا أو Daughter cysts ورا الجدار.',
        tipIq: 'Peripheral ostectomy: 1–2 mm with carbide bur aided by methylene blue until dye is gone.',
      },
      {
        label: '2. رش النيتروجين السائل (Cryotherapy) لمنع قص الفك',
        activePart: 'cryo',
        focus: {cx: 0.74, cy: 0.52, scale: 1.44},
        duration: 8,
        seeIq:
          'باللوحة اليمنى مسبار الـ Cryotherapy داخل التجويف ينشر هالة تجميد بالنيتروجين السائل على الجدار المتبقي.',
        whyIq:
          'تطبيق الـ Liquid nitrogen بعد الـ Enucleation بالأكياس كثيرة الرجوع يقلل نسب الرجوع ويقلل حاجتنا إننا نقص الفك (Resection).',
        tipIq: 'Cryotherapy (Liquid N2) in high-recurrence cysts reduces recurrence & reduces need for resection.',
      },
    ],
    parts: [
      {
        key: 'blue',
        en: 'Methylene Blue + Carbide Bur (1–2 mm)',
        ar: 'صبغة الميثيلين والـ Carbide Bur',
        posPct: [0.22, 0.48],
        iq: 'نصبغ التجويف ونبرد بالـ Carbide bur بـ 1–2 ملم إضافية حتى يختفي اللون الأزرق تماماً.',
        clinical: 'Consistent complete peripheral removal',
      },
      {
        key: 'clean',
        en: 'Cleared Unstained Bone Margin',
        ar: 'العظم النظيف بعد زوال الصبغة',
        posPct: [0.25, 0.67],
        iq: 'اختفاء الصبغة يعني أزلنا الطبقة المقصودة بالتساوي من كل جدران التجويف.',
        clinical: 'Until dye is gone',
      },
      {
        key: 'cryo',
        en: 'Liquid Nitrogen Cryoprobe',
        ar: 'مسبار النيتروجين السائل (Cryotherapy)',
        posPct: [0.74, 0.56],
        iq: 'يجمد البقايا المجهرية بعد الاستئصال فيقلل الرجوع والحاجة لـ Resection.',
        clinical: 'For high recurrence cysts',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.25, y: h * 0.54},
            {x: w * 0.21, y: h * 0.62},
            {x: w * 0.27, y: h * 0.68},
          ],
          t,
          {colorStart: '#0284C7', colorEnd: '#10B981', width: 3.2, pulseSpeed: 0.42, arrowEnd: true},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.14, y: h * 0.74},
          {x: w * 0.30, y: h * 0.74},
          {label: 'Until Dye Gone (1-2 mm)', color: '#0284C7'},
        );
      } else {
        const tip = {x: w * 0.74, y: h * 0.56};
        drawSprayStream(ctx, {x: w * 0.77, y: h * 0.46}, tip, t, {
          colorCore: '#38BDF8',
          colorMist: '#E0F2FE',
          spreadPx: 14,
          count: 14,
          speed: 0.6,
        });
        drawShockRings(ctx, tip, t, {color: '#38BDF8', maxRadius: 38, rings: 3, speed: 0.28});
      }
    },
  },

  'p12-t1': {
    topicId: 'p12-t1',
    imgSrc: '/src/assets/images/atlas_cryotherapy_protection_1795586352198.jpg',
    imgAlt: 'Cryotherapy probe in bone cavity showing 1.5 mm freeze depth, metal soft-tissue retractor shield, and inferior border',
    duration: 8,
    scenarios: [
      {
        label: '1. عمق التجميد (1.5 ملم) بدرع عزل الأنسجة الرخوة',
        activePart: 'depth',
        focus: {cx: 0.48, cy: 0.56, scale: 1.44},
        duration: 8,
        seeIq:
          'شوف الجدار الجليدي الشاحب حول المسبار: النيتروجين السائل يقتل الخلايا لعمق 1.5 ملم فقط؛ والمبعد المعدني فوق يحمي اللثة واللسان.',
        whyIq:
          'رقم التجميد 1.5 mm (مو 1–2 mm!) وأي تسرب عارض للنيتروجين يسبب تجميد ونخر الأنسجة الرخوة (Tissue necrosis).',
        tipIq: 'Cryotherapy cell death depth = up to 1.5 mm · Carefully protect soft tissue from tissue necrosis.',
      },
      {
        label: '2. خطر كسر الفك السفلي (Mandibular Fracture Risk)',
        activePart: 'frac',
        focus: {cx: 0.48, cy: 0.68, scale: 1.42},
        duration: 8,
        seeIq:
          'لاحظ رقة الحافة السفلية للعظم جوا نطاق التبريد: التجميد القوي يضعف القشرة العظمية المتبقية.',
        whyIq:
          'بالإضافة لنخر الأنسجة الرخوة، يعتبر كسر الفك السفلي (Fracture of the mandible) مضاعفة معروفة لهذه التقنية.',
        tipIq: '2 Cryotherapy hazards: (1) Inadvertent soft tissue freezing & necrosis  (2) Fracture of the mandible.',
      },
    ],
    parts: [
      {
        key: 'depth',
        en: '1.5 mm Freeze Cell-Death Zone',
        ar: 'نطاق موت الخلايا (لعمق 1.5 ملم)',
        posPct: [0.48, 0.67],
        iq: 'يميت النيتروجين السائل الخلايا داخل العظم لعمق يصل إلى 1.5 ملم.',
        clinical: 'Up to 1.5 mm (vs 1-2 mm Ostectomy)',
      },
      {
        key: 'shield',
        en: 'Soft Tissue Protection Shield',
        ar: 'درع حماية اللثة واللسان من النخر',
        posPct: [0.54, 0.42],
        iq: 'حماية إلزامية للأنسجة الرخوة لمنع التجميد العارض والـ Tissue necrosis.',
        clinical: 'Prevent inadvertent freezing',
      },
      {
        key: 'frac',
        en: 'Thinned Inferior Mandible (Fracture Risk)',
        ar: 'خطر كسر الفك السفلي',
        posPct: [0.49, 0.80],
        iq: 'إضعاف العظم الرقيق يجعل كسر الفك السفلي خطراً معروفاً بعد التجميد.',
        clinical: 'Known complication of cryotherapy',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const tip = {x: w * 0.51, y: h * 0.64};
      if (st.scIdx === 0) {
        drawShockRings(ctx, tip, t, {color: '#38BDF8', maxRadius: 42, rings: 3, speed: 0.25});
        drawMeasureBand(
          ctx,
          {x: w * 0.39, y: h * 0.68},
          {x: w * 0.47, y: h * 0.68},
          {label: '<= 1.5 mm', color: '#38BDF8'},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.41, y: h * 0.39},
          {x: w * 0.65, y: h * 0.47},
          {label: 'Tissue Shield', color: '#10B981'},
        );
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.40, y: h * 0.78},
            {x: w * 0.49, y: h * 0.80},
            {x: w * 0.59, y: h * 0.81},
          ],
          t,
          {colorStart: '#E11D48', colorEnd: '#D97706', width: 3.2, pulseSpeed: 0.36},
        );
        drawSteadyBadge(ctx, w * 0.49, h * 0.88, 'Fracture Risk at Thinned Cortex', '#E11D48');
      }
    },
  },

  'p12-t2': {
    topicId: 'p12-t2',
    imgSrc: '/src/assets/images/atlas_carnoy_fluorouracil_1795586470190.jpg',
    imgAlt: 'Chemical treatment of OKC cavity with topical 5-FU gel, Carnoy solution pledget, and DNA/RNA inhibition inset',
    duration: 8,
    scenarios: [
      {
        label: '1. تطبيق محلول Carnoy’s الكاوي + حماية العصب السفلي',
        activePart: 'carnoy',
        focus: {cx: 0.56, cy: 0.56, scale: 1.4},
        duration: 8,
        seeIq:
          'على يمين الشاشة شاش مشبع بمحلول Carnoy’s الكاوي يطلي جدار الـ OKC بحذر بينما العصب السنخي السفلي الأصفر محفوظ جواه.',
        whyIq:
          'محلول كارنوي (فريك كلوريد + كحول + كلوروفورم + خليك) يقتل بقايا الظهارة بعمق 1–2 ملم ويقلل نسبة الرجوع للنصف.',
        tipIq: 'Chemical treatment: Carnoy’s solution (halves recurrence) alongside 1-2 mm wall fixation.',
      },
      {
        label: '2. دواء 5-Fluorouracil الموضعي وتثبيط الـ DNA/RNA',
        activePart: 'fivefu',
        focus: {cx: 0.58, cy: 0.38, scale: 1.32},
        duration: 8,
        seeIq:
          'على يسار الشاشة عود المسح يحط مرهم 5-Fluorouracil البنفسجي على حواف الـ Keratocyst؛ وبالعدسة المكبرة أعلى اليمين يثبط تصنيع الـ DNA والـ RNA.',
        whyIq:
          'الـ 5-FU هو Cytotoxic chemotherapy drug حديث الاستخدام بالـ Keratocysts يوقف انقسام الخلايا السرطانية والمتقرنة بفعالية عالية.',
        tipIq: 'Topical 5-FU = cytotoxic chemotherapy drug inhibiting DNA & RNA synthesis (used recently for Keratocysts).',
      },
    ],
    parts: [
      {
        key: 'fivefu',
        en: 'Topical 5-Fluorouracil (5-FU)',
        ar: 'مرهم 5-Fluorouracil الموضعي',
        posPct: [0.355, 0.415],
        iq: 'علاج كيميائي سام للخلايا (Cytotoxic) استُخدم حديثاً للـ Keratocysts.',
        clinical: 'Applied topically on OKC walls',
      },
      {
        key: 'dna',
        en: 'DNA & RNA Synthesis Inhibition',
        ar: 'تثبيط تصنيع الـ DNA والـ RNA',
        posPct: [0.845, 0.285],
        iq: 'آلية عمل الـ 5-FU داخل النواة بتوقيف تصنيع الأحماض النووية وتكاثر الخلايا.',
        clinical: 'Mechanism of Topical 5-FU',
      },
      {
        key: 'carnoy',
        en: 'Carnoy’s Solution Pledget',
        ar: 'محلول كارنوي الكيميائي الكاوي',
        posPct: [0.665, 0.66],
        iq: 'المذكور مسبقاً لتثبيت وقتل البقايا الظهارية على جدران العظم مع الحذر قرب العصب.',
        clinical: 'Chemical treatment (with IAN sparing)',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.665, y: h * 0.66},
            {x: w * 0.54, y: h * 0.57},
            {x: w * 0.45, y: h * 0.44},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#F59E0B', width: 3.2, pulseSpeed: 0.4, arrowEnd: true},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.50, y: h * 0.72},
          {x: w * 0.64, y: h * 0.72},
          {label: 'Protect Yellow IAN', color: '#10B981'},
        );
      } else {
        const swab = {x: w * 0.355, y: h * 0.415};
        const inset = {x: w * 0.845, y: h * 0.285};
        drawOrbitPath(ctx, {x: w * 0.36, y: h * 0.48}, w * 0.08, h * 0.14, t, {
          color: '#7C3AED',
          speed: 0.85,
        });
        drawFlowTrack(ctx, [swab, {x: w * 0.60, y: h * 0.28}, inset], t, {
          colorStart: '#7C3AED',
          colorEnd: '#38BDF8',
          width: 3,
          pulseSpeed: 0.38,
          arrowEnd: true,
        });
        drawShockRings(ctx, inset, t, {color: '#7C3AED', maxRadius: 48, rings: 2, speed: 0.25});
      }
    },
  },
};
