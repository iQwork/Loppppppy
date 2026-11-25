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

export const STUDIO_SPECS_PART1: Record<string, TopicStudioSpec> = {
  'p1-t1': {
    topicId: 'p1-t1',
    imgSrc: '/src/assets/images/atlas_cyst_classification_1795586341414.jpg',
    imgAlt: 'Anatomical classification map of odontogenic and non-odontogenic oral cysts',
    duration: 8,
    scenarios: [
      {
        label: '1. خريطة الالتهابية (2) vs التطورية (7)',
        activePart: 'inflam',
        focus: {cx: 0.54, cy: 0.52, scale: 1.15},
        duration: 8,
        seeIq:
          'قدامك بالمقطع التشريحي للوجه والفكين توزيع الأكياس سنية المنشأ (9 أنواع): الكيس الالتهابي حول الذروة العلوية أو التفرع السفلي، والتطوري مثل التاجي حول ضرس العقل المطمور والمتعدد بالراموس.',
        whyIq:
          'الأكياس الالتهابية بس نوعين (Radicular + Residual و Inflammatory collateral) وتطلع بسبب نخر عصب أو جيب لثوي، بينما السبعة التطورية تنشأ من بقايا تكون السن بدون عدوى أولية.',
        tipIq: 'Odontogenic = 2 Inflammatory (Radicular & Collateral) + 7 Developmental.',
      },
      {
        label: '2. المنطقة القاطعة والأنف (غير سنية المنشأ 6)',
        activePart: 'nonodon',
        focus: {cx: 0.41, cy: 0.36, scale: 1.52},
        duration: 8,
        seeIq:
          'اللقطة تقرّب عالمنطقة القاطعة والفك العلوي حيث يظهر مثال لأكياس الفئة الثانية غير سنية المنشأ (كيس القناة القاطعة بالحنك الأمامي فوق القواطع)، وتشمل هذه الفئة أيضاً الأنفي الشفوي وتحت اللسان والرقبة.',
        whyIq:
          'الأكياس الستة غير سنية المنشأ أصلها بقايا قنوات جنينية أو التئام شقوق وجهية، ما إلها علاقة بظهارة السن، وميزتها تطلع بمواقع تشريحية ثابتة بعيداً عن لب الأسنان.',
        tipIq:
          'Non-odontogenic (6) = Incisive canal, Nasolabial, Sublingual dermoid, Thyroglossal, Branchial, Foregut.',
      },
    ],
    parts: [
      {
        key: 'inflam',
        en: 'Inflammatory Odontogenic (2)',
        ar: 'الأكياس الالتهابية (2)',
        posPct: [0.495, 0.625],
        iq: 'فقط نوعين: الكيس الجذري (والمتبقي بعد القلع) والالتهابي الجانبي يم عنق وتفرع الضرس.',
        clinical: 'I.A Inflammatory (Radicular + Collateral)',
      },
      {
        key: 'dev',
        en: 'Developmental Odontogenic (7)',
        ar: 'الأكياس التطورية (7)',
        posPct: [0.675, 0.49],
        iq: 'تضم التاجي والبزوغ والـ OKC والـ OOC واللثوي الجانبي/العنقودي والغدي والمتكلس واللثوية.',
        clinical: 'I.B Developmental (Dentigerous, OKC, OOC, ...)',
      },
      {
        key: 'nonodon',
        en: 'Non-Odontogenic Cysts (6)',
        ar: 'الأكياس غير سنية المنشأ (6)',
        posPct: [0.385, 0.255],
        iq: 'ستة أنواع: القناة القاطعة، الأنفي الشفوي، الجلداني تحت اللسان، الدرقي، الغلصمي، والمعي الأمامي.',
        clinical: 'II. Non-Odontogenic (6 anatomical sites)',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const infPt = {x: w * 0.495, y: h * 0.625};
      const devCrown = {x: w * 0.595, y: h * 0.635};
      const devRamus = {x: w * 0.675, y: h * 0.49};
      const nonOd = {x: w * 0.385, y: h * 0.255};

      if (st.scIdx === 0) {
        drawShockRings(ctx, infPt, t, {color: '#E11D48', maxRadius: 26, rings: 3, speed: 0.32});
        drawFlowTrack(ctx, [infPt, devCrown, devRamus], t, {
          colorStart: '#E11D48',
          colorEnd: '#0D9488',
          width: 3,
          pulseSpeed: 0.36,
          arrowEnd: true,
        });
        drawOrbitPath(ctx, devRamus, 24, 30, t, {color: '#0D9488', speed: 0.9});
      } else {
        drawShockRings(ctx, nonOd, t, {color: '#D97706', maxRadius: 28, rings: 3, speed: 0.3});
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.31, y: h * 0.33},
            nonOd,
            {x: w * 0.46, y: h * 0.72},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#0284C7', width: 3, pulseSpeed: 0.34, arrowEnd: true},
        );
      }
      drawSteadyBadge(ctx, w * 0.50, h * 0.88, '9 Odontogenic | 6 Non-Odontogenic', '#0D9488');
    },
  },

  'p1-t2': {
    topicId: 'p1-t2',
    imgSrc: '/src/assets/images/atlas_cyst_radiography_1795586337593.jpg',
    imgAlt: 'Aspiration of straw-colored cystic fluid and well-defined unilocular radiograph',
    duration: 8,
    scenarios: [
      {
        label: '1. سحب السائل بالإبرة (Aspiration) ولون القش',
        activePart: 'aspirate',
        focus: {cx: 0.31, cy: 0.44, scale: 1.48},
        duration: 8,
        seeIq:
          'السرنجة داخلة لتجويف الكيس بعد تآكل الصفيحة القشرية وجاي تسحب سائل أصفر بلون القش يلمع ببلورات الكوليسترول.',
        whyIq:
          'بالأكياس الما ملتهبة السائل يكون صافي أصفر بلمعة كوليسترول؛ وإذا دخل التهاب ثانوي ينعكر ويصير قيح (Pus) أو قيح دموي.',
        tipIq: 'Uninfected aspirate = straw-colored + cholesterol shimmer · Infected = pus.',
      },
      {
        label: '2. التمدد والتموّج (Fluctuation) والظل الشعاعي',
        activePart: 'xray',
        focus: {cx: 0.68, cy: 0.54, scale: 1.35},
        duration: 8,
        seeIq:
          'عالأشعة تشوف تجويف أسود شفاف (Radiolucent) محاط بحافة بيضة كثيفة من العظم التفاعلي (Dense reactive rim) على شكل حجرة واحدة (Unilocular).',
        whyIq:
          'أغلب الأكياس أحادية الحجرة وما تأذي الأعصاب، لكن لازم كل نسيج مستأصل يندز للـ Pathologic exam خوفاً من تحول أميلوبلاستي أو خبيث.',
        tipIq: 'Always submit excised tissue for histology · Unilocular vs multilocular (OKC/ameloblastoma).',
      },
    ],
    parts: [
      {
        key: 'aspirate',
        en: 'Straw-Colored Aspirate (Cholesterol)',
        ar: 'سحب السائل بلون القش والكوليسترول',
        posPct: [0.405, 0.24],
        iq: 'سائل أصفر قشي يلمع بالضوء بسبب بلورات الكوليسترول ويفقد هالصفة لو التهب وصار قيح.',
        clinical: 'Aspiration in large thinned cysts',
      },
      {
        key: 'cortical',
        en: 'Thinned Cortex & Fluctuation Zone',
        ar: 'تآكل القشرة والتموّج بالجس',
        posPct: [0.235, 0.58],
        iq: 'يبدأ صلب ثم توسع الوجه، ومن يخترق القشرة العظمية يعطي Fluctuation عند الجس.',
        clinical: 'Firmness -> Asymmetry -> Fluctuation',
      },
      {
        key: 'xray',
        en: 'Dense Reactive Rim & Radiolucent Center',
        ar: 'حافة عظم تفاعلية ومركز شفاف',
        posPct: [0.735, 0.60],
        iq: 'صورة أشعة كلاسيكية: مركز أسود محاط بحلقة عظم كثيفة (غالباً Unilocular).',
        clinical: 'Submit all tissue to pathology',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const tip = {x: w * 0.235, y: h * 0.58};
      const barrel = {x: w * 0.405, y: h * 0.23};
      const xrayCenter = {x: w * 0.735, y: h * 0.60};

      // Smooth aspiration flow from cyst lumen up needle into syringe barrel
      drawFlowTrack(ctx, [tip, barrel], t, {
        colorStart: '#C9A24D',
        colorEnd: '#F59E0B',
        width: 3.2,
        pulseSpeed: 0.45,
        arrowEnd: true,
      });

      if (st.scIdx === 0) {
        drawShockRings(ctx, tip, t, {color: '#D97706', maxRadius: 28, rings: 3, speed: 0.3});
      } else {
        drawOrbitPath(ctx, xrayCenter, w * 0.055, h * 0.095, t, {
          color: '#38BDF8',
          speed: 0.85,
          dashed: true,
        });
        drawMeasureBand(
          ctx,
          {x: w * 0.68, y: h * 0.73},
          {x: w * 0.80, y: h * 0.73},
          {label: 'Unilocular Corticated', color: '#38BDF8'},
        );
      }
    },
  },

  'p2-t1': {
    topicId: 'p2-t1',
    imgSrc: '/src/assets/images/atlas_radicular_cyst_1795586339665.jpg',
    imgAlt: 'Radicular cyst at non-vital apex, orthograde + MTA apicectomy preservation, and residual cyst',
    duration: 8,
    scenarios: [
      {
        label: '1. الكيس الجذري على ذروة سن مسوس غير حي',
        activePart: 'tooth',
        focus: {cx: 0.23, cy: 0.48, scale: 1.38},
        duration: 8,
        seeIq:
          'على يسار اللقطة ضرس مسوس ولبه الأسود ميت (Non-vital)، وتحت ذروة جذره كيس جذري مزرق كاعد يتوسع من صلب لقرمشة قشر البيض (Eggshell) لمتموج طري.',
        whyIq:
          'أشيع كيس بالفكين (بعمر 20–60، ذكور 3:2، فك علوي >3 أضعاف)، وما يحتاج خزعة إلا لو شفنا تآكل جذور أو حدود مو واضحة.',
        tipIq: 'Non-vital tooth + Maxilla >3x + Eggshell crackling -> soft bluish fluctuant.',
      },
      {
        label: '2. حفظ السن (Orthograde + MTA) vs المتبقي',
        activePart: 'treat',
        focus: {cx: 0.64, cy: 0.56, scale: 1.38},
        duration: 8,
        seeIq:
          'على يسار اللقطة حفظنا السن بحشوة جذر تقليدية (Orthograde) وقطع ذروة مع سداد MTA أخضر؛ وعلى يمينها بقى كيس متبقي (Residual cyst) بعد قلع سن قديم.',
        whyIq:
          'هدفنا المحافظة عالسن دائماً إذا ينحفظ، بينما ترك الكيس بلا إزالة بعد القلع يولّد Residual cyst ينمو ببطء عند كبار السن.',
        tipIq: 'Preserve tooth: Orthograde root filling + Apicectomy & MTA retrograde seal.',
      },
    ],
    parts: [
      {
        key: 'tooth',
        en: 'Non-Vital Carious Pulp (Etiology)',
        ar: 'تسوس ولب ميت بالسن المسبب',
        posPct: [0.27, 0.34],
        iq: 'التهاب اللب وموته يحفز بقايا مالاسيز عند الذروة لتكوين الكيس الجذري.',
        clinical: 'Maxilla >3x | Age 20-60y | M:F 3:2',
      },
      {
        key: 'cyst',
        en: 'Periapical Radicular Cyst',
        ar: 'الكيس الجذري على الذروة',
        posPct: [0.22, 0.72],
        iq: 'يتدرج من صلب إلى Eggshell crackling ثم انتفاخ أزرق طري ومتموج.',
        clinical: 'No biopsy unless root resorption / ill-defined',
      },
      {
        key: 'treat',
        en: 'Orthograde Fill + Apicectomy & MTA',
        ar: 'حشوة الجذر + قطع الذروة بالـ MTA',
        posPct: [0.475, 0.715],
        iq: 'علاج عصب قبل الجراحة مع قطع الذروة وحشوة MTA رجعية لحفظ السن.',
        clinical: 'Standard tooth-saving protocol',
      },
      {
        key: 'residual',
        en: 'Residual Radicular Cyst',
        ar: 'الكيس الجذري المتبقي بعد القلع',
        posPct: [0.78, 0.56],
        iq: 'يستمر بالعظم كآفة صامتة بطيئة النمو لدى كبار السن بعد قلع السن المسبب.',
        clinical: 'Slow expansion in older edentulous ridge',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const pulp = {x: w * 0.27, y: h * 0.36};
      const apexCyst = {x: w * 0.22, y: h * 0.72};
      const mtaApex = {x: w * 0.475, y: h * 0.715};
      const resCyst = {x: w * 0.78, y: h * 0.56};

      if (st.scIdx === 0) {
        drawFlowTrack(ctx, [pulp, {x: w * 0.26, y: h * 0.56}, apexCyst], t, {
          colorStart: '#E11D48',
          colorEnd: '#0284C7',
          width: 3,
          pulseSpeed: 0.4,
          arrowEnd: true,
        });
        drawShockRings(ctx, apexCyst, t, {color: '#38BDF8', maxRadius: 34, rings: 3, speed: 0.26});
      } else {
        drawFlowTrack(
          ctx,
          [{x: w * 0.48, y: h * 0.36}, mtaApex],
          t,
          {colorStart: '#EC4899', colorEnd: '#059669', width: 3.2, pulseSpeed: 0.42, arrowEnd: true},
        );
        drawOrbitPath(ctx, mtaApex, 14, 14, t, {color: '#10B981', speed: 1.0});
        drawShockRings(ctx, resCyst, t, {color: '#D97706', maxRadius: 28, rings: 2, speed: 0.24});
      }
    },
  },

  'p2-t2': {
    topicId: 'p2-t2',
    imgSrc: '/src/assets/images/atlas_collateral_dentigerous_1795586469036.jpg',
    imgAlt: 'Inflammatory collateral furcation cyst on vital molar vs dentigerous cyst attached at CEJ',
    duration: 8,
    scenarios: [
      {
        label: '1. الكيس الالتهابي الجانبي (السن حي + ميلان الجذور)',
        activePart: 'collat',
        focus: {cx: 0.26, cy: 0.48, scale: 1.48},
        duration: 8,
        seeIq:
          'باللوحة اليسرى ضرس سفلي بزغ ولبّه أحمر حي (Vital!) مع التهاب جيب لثوي (Pericoronitis)، وعلى جانبه الأيمن بالمنطقة العنقية كيس أزرق يدفع الجذور للسان والتاج للخد.',
        whyIq:
          'انتبه لمصيدة الامتحان: عكس الكيس الجذري، هنا السن حي تماماً ونحفظ السن بالعيادة وقت ما نستأصل الكيس.',
        tipIq: 'Inflammatory collateral: VITAL molar + Pericoronitis + tips roots lingually & crown buccally.',
      },
      {
        label: '2. الكيس التاجي (التصاق الجدار بالـ CEJ)',
        activePart: 'cej',
        focus: {cx: 0.74, cy: 0.48, scale: 1.48},
        duration: 8,
        seeIq:
          'باللوحة اليمنى الكيس التاجي (Dentigerous) مغلف تاج ضرس مطمور وملتصق بدقة عند خط المينا والملاط (CEJ) بينما الجذور خارج الكيس.',
        whyIq:
          'يتكون بتوسع الـ Follicle وانفصال ظهارة المينا المختزلة عن سطح المينا فيمنع السن من البزوغ.',
        tipIq: 'Dentigerous = follicle expansion (reduced enamel epithelium) attached cleanly at CEJ.',
      },
    ],
    parts: [
      {
        key: 'collat',
        en: 'Inflammatory Collateral (Vital Molar)',
        ar: 'الكيس الجانبي (على ضرس حي)',
        posPct: [0.345, 0.46],
        iq: 'يطلع بالمنطقة الشدقية/العنقية لضرس سفلي حي مع Pericoronitis، ونعالج مع الحفاظ على السن.',
        clinical: 'Tips roots lingually & crown buccally',
      },
      {
        key: 'dent',
        en: 'Dentigerous Sac Enclosing Crown',
        ar: 'الكيس التاجي حول التاج المنطمر',
        posPct: [0.735, 0.33],
        iq: 'توسع الجراب حول تاج سن غير بازغ من انفصال ظهارة المينا المختزلة.',
        clinical: 'Prevents normal tooth eruption',
      },
      {
        key: 'cej',
        en: 'CEJ Attachment Collar',
        ar: 'خط الالتصاق عند الـ CEJ',
        posPct: [0.735, 0.465],
        iq: 'الحد الفاصل بين المينا والجذر حيث تلتصق بطانة الكيس التاجي بدقة تشخيصية.',
        clinical: 'Diagnostic attachment landmark',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        const pocket = {x: w * 0.38, y: h * 0.25};
        const cyst = {x: w * 0.345, y: h * 0.46};
        drawFlowTrack(ctx, [pocket, cyst], t, {
          colorStart: '#E11D48',
          colorEnd: '#0284C7',
          width: 3,
          pulseSpeed: 0.42,
          arrowEnd: true,
        });
        // Steady root-tipping clinical angle reference
        drawAngleArc(ctx, {x: w * 0.25, y: h * 0.45}, 42, Math.PI * 0.5, Math.PI * 0.62, 'Lingual Tip', '#14B8A6');
      } else {
        const crownCenter = {x: w * 0.735, y: h * 0.33};
        drawOrbitPath(ctx, crownCenter, w * 0.095, h * 0.145, t, {color: '#0D9488', speed: 0.85});
        drawMeasureBand(
          ctx,
          {x: w * 0.64, y: h * 0.465},
          {x: w * 0.83, y: h * 0.465},
          {label: 'CEJ Attachment Line', color: '#D97706'},
        );
      }
    },
  },

  'p3-t1': {
    topicId: 'p3-t1',
    imgSrc: '/src/assets/images/atlas_dentigerous_eruption_1795586348410.jpg',
    imgAlt: 'Large dentigerous cyst with pseudoloculation and dark-blue superficial eruption cyst',
    duration: 8,
    scenarios: [
      {
        label: '1. التاجي: إزاحة الضرس وخدعة Pseudoloculation',
        activePart: 'pseudo',
        focus: {cx: 0.26, cy: 0.52, scale: 1.4},
        duration: 8,
        seeIq:
          'باللوحة اليسرى كيس تاجي كبير دافع ضرس العقل السفلي لحافة الفك، والحواجز العظمية جواه تنطي شكل خداع كأنه متعدد الحجرات (Pseudoloculation).',
        whyIq:
          'بالحقيقة الكيس التاجي دائماً Unilocular! ويصيب ثلثين الحالات بـ lower 3rd molars بعمر 10–30 وذكور >2x، وللناب العلوي نسوي Marsupialization حتى يبزغ.',
        tipIq: 'Always unilocular (pseudoloculation = bony ridges) + Always Biopsy (rule out OKC/ameloblastoma).',
      },
      {
        label: '2. كيس البزوغ الأزرق الداكن بالأطفال (Eruption Cyst)',
        activePart: 'erupt',
        focus: {cx: 0.72, cy: 0.50, scale: 1.42},
        duration: 8,
        seeIq:
          'باللوحة اليمنى عاللثة فوك سن جاي يبزغ تشوف انتفاخ أزرق داكن (Dark blue) بسبب تجمع دم بعد رض الأكل أو العض.',
        whyIq:
          'هذا مجرد كيس تاجي سطحي بالأنسجة الرخوة بالأطفال؛ بالعادة ينفجر تلقائياً أثناء المضغ وما يحتاج غير شق سقفه إذا كبر جداً.',
        tipIq: 'Eruption cyst = superficial dentigerous cyst in children · trauma -> dark blue · bursts spontaneously.',
      },
    ],
    parts: [
      {
        key: 'pseudo',
        en: 'Bony Ridges (Pseudoloculation)',
        ar: 'حواجز عظمية خداعة (Pseudoloculation)',
        posPct: [0.20, 0.49],
        iq: 'تراكب العظم الداخلي يوهمك إنه متعدد الحجرات لكنه دائماً أحادي الحجرة، ولازم Biopsy لاستبعاد OKC.',
        clinical: 'Always unilocular in true structure',
      },
      {
        key: 'displaced',
        en: 'Displaced Lower 3rd Molar (2/3 Cases)',
        ar: 'إزاحة ضرس العقل السفلي لحافة الفك',
        posPct: [0.29, 0.66],
        iq: 'ثلثي الحالات بضرس العقل السفلي ويزاح لحافة الفك أو الراموس. الناب العلوي قد يبزغ بـ Marsupialisation.',
        clinical: 'Age 10-30y | Males >2x',
      },
      {
        key: 'erupt',
        en: 'Dark-Blue Eruption Cyst',
        ar: 'كيس البزوغ الأزرق الداكن',
        posPct: [0.70, 0.45],
        iq: 'تجمع دم بسبب العض والرض يلون القبة بالأزرق الغامق وغالباً ينفجر لوحده.',
        clinical: 'Excise/incise roof only if very large',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, {x: w * 0.21, y: h * 0.49}, w * 0.065, h * 0.125, t, {
          color: '#0D9488',
          dashed: true,
          speed: 0.75,
        });
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.21, y: h * 0.46},
            {x: w * 0.29, y: h * 0.66},
          ],
          t,
          {colorStart: '#38BDF8', colorEnd: '#D97706', width: 3, pulseSpeed: 0.36, arrowEnd: true},
        );
      } else {
        const dome = {x: w * 0.70, y: h * 0.45};
        drawShockRings(ctx, dome, t, {color: '#38BDF8', maxRadius: 34, rings: 3, speed: 0.3});
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.70, y: h * 0.60},
            {x: w * 0.70, y: h * 0.36},
          ],
          t,
          {colorStart: '#10B981', colorEnd: '#38BDF8', width: 3, pulseSpeed: 0.35, arrowEnd: true},
        );
      }
    },
  },

  'p3-t2': {
    topicId: 'p3-t2',
    imgSrc: '/src/assets/images/atlas_keratocyst_mandible_1795586340528.jpg',
    imgAlt: 'Mandibular odontogenic keratocyst containing bright white keratin with intact roots and IDC',
    duration: 8,
    scenarios: [
      {
        label: '1. الكيراتين الأبيض الناصع والراموس المسنن (≥50%)',
        activePart: 'keratin',
        focus: {cx: 0.43, cy: 0.54, scale: 1.38},
        duration: 8,
        seeIq:
          'جوا الكيس المتقرن بالجزء الخلفي والراموس (≥50% من الحالات) شوف مادة بيضة ناصعة (Bright white keratin) — دير بالك تظنها جراحة (Pus)!',
        whyIq:
          'أشيع كيس متقرن بعمر 20–30، وأغلب حالاته متعددة الحجرات بحواف مسننة أو مدورة (Scalloped margin) داخل الراموس.',
        tipIq: 'Keratin is BRIGHT WHITE (NOT pus) · ≥50% in posterior body & lower ramus · Scalloped.',
      },
      {
        label: '2. سلامة جذور الأضراس والقناة السنية السفلية',
        activePart: 'canal',
        focus: {cx: 0.57, cy: 0.64, scale: 1.42},
        duration: 8,
        seeIq:
          'لاحظ إن جذور الضرس الخلفي يم الكيس والقناة السنية السفلية الصفراء جواه ضلت سليمة تماماً بلا تآكل (No resorption) وبإزاحة كلش قليلة.',
        whyIq:
          'الـ OKC ينمو بالطول جوا النخاع (أمامي-خلفي) بدل ما يضغط عرضياً أو ياكل الجذور والقناة، وهاي صفة تميزه عن الأورام.',
        tipIq: 'Radiography: Minimal displacement and NO resorption of teeth or inferior dental canal.',
      },
    ],
    parts: [
      {
        key: 'keratin',
        en: 'Bright White Keratin Lumen (Not Pus)',
        ar: 'كيراتين أبيض ساطع (مو قيح)',
        posPct: [0.44, 0.56],
        iq: 'بالعملية يطلع كيراتين أبيض يشبه الجبن الأبيض، يشخصه الطبيب ولازم ما ينحسب التهاب.',
        clinical: 'Diagnostic lumen content',
      },
      {
        key: 'scallop',
        en: 'Scalloped Posterior Body / Ramus (≥50%)',
        ar: 'حواف مسننة بالراموس الخلفي (≥50%)',
        posPct: [0.39, 0.45],
        iq: 'نص الحالات فأكثر تطلع بالخلف والراموس بحواف Scalloped واضحة.',
        clinical: 'Peak age 20-30y | Multilocular',
      },
      {
        key: 'canal',
        en: 'Intact Molar Roots & Dental Canal',
        ar: 'سلامة الجذور والقناة السنية السفلية',
        posPct: [0.55, 0.725],
        iq: 'لا يصير تآكل بالجذور ولا بالقناة السنية السفلية والإزاحة قليلة.',
        clinical: 'No resorption of teeth/IDC',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const ker = {x: w * 0.44, y: h * 0.56};
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, ker, w * 0.085, h * 0.125, t, {
          color: '#38BDF8',
          dashed: true,
          speed: 0.8,
        });
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.40, y: h * 0.34},
            ker,
            {x: w * 0.49, y: h * 0.62},
          ],
          t,
          {colorStart: '#38BDF8', colorEnd: '#0D9488', width: 2.8, pulseSpeed: 0.35},
        );
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.33, y: h * 0.48},
            {x: w * 0.42, y: h * 0.68},
            {x: w * 0.62, y: h * 0.76},
            {x: w * 0.74, y: h * 0.73},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 3.2, pulseSpeed: 0.38, arrowEnd: true},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.57, y: h * 0.69},
          {x: w * 0.68, y: h * 0.69},
          {label: '0 Resorption', color: '#10B981'},
        );
      }
    },
  },

  'p4-t1': {
    topicId: 'p4-t1',
    imgSrc: '/src/assets/images/atlas_keratocyst_treatment_1795586341083.jpg',
    imgAlt: 'OKC Carnoy solution cauterization vs marsupialization epithelial conversion',
    duration: 8,
    scenarios: [
      {
        label: '1. محلول كارنوي (Carnoy’s 1–2 ملم) ومنع رجوع الـ 40 سنة',
        activePart: 'carnoy',
        focus: {cx: 0.25, cy: 0.53, scale: 1.42},
        duration: 8,
        seeIq:
          'باللوحة اليسرى الكيس المسنن يتعالج بمحلول Carnoy’s الكاوي (فرشاة العنبر) اللي يثبت ويموت البقايا لعمق 1 إلى 2 ملم بعد الاستئصال.',
        whyIq:
          'الاستئصال البسيط يرجع >50% حتى بعد 40 سنة بسبب بقايا dental lamina ورقة البطانة؛ كارنوي يقلل الرجوع للنصف.',
        tipIq: 'Simple enucleation >50% recur · Carnoy’s solution (1–2 mm depth) halves recurrence.',
      },
      {
        label: '2. التفتيح (Marsupialization) وتبديل الظهارة + قاعدة الجمجمة',
        activePart: 'marsup',
        focus: {cx: 0.73, cy: 0.51, scale: 1.42},
        duration: 8,
        seeIq:
          'باللوحة اليمنى بعد التفتيح، ظهارة الفم الوردية تدخل وتبدل البطانة المتقرنة الرقيقة إلى ظهارة غير متقرنة أثخن وأقوى فينشال بسهولة والأسنان المائلة تستقيم.',
        whyIq:
          'تقلل المراضة وتحفظ الأسنان؛ لكن بالفك العلوي الخلفي نكون أشرس (حتى Resection) حتى لا يمتد لقاعدة الجمجمة.',
        tipIq: 'Marsupialization -> non-keratinising squamous · Posterior maxilla -> skull base risk.',
      },
    ],
    parts: [
      {
        key: 'carnoy',
        en: 'Carnoy’s Solution (1–2 mm / Halves Recurrence)',
        ar: 'محلول كارنوي الكاوي (عمق 1–2 ملم)',
        posPct: [0.21, 0.56],
        iq: 'مزيج فريك كلوريد بكحول + كلوروفورم + خليك يثبت الجدار قبل أو بعد الشيل لعمق 1–2 ملم.',
        clinical: 'Halves >50% recurrence rate',
      },
      {
        key: 'lamina',
        en: 'Dental Lamina Rests (40y Risk)',
        ar: 'بقايا صفيحة الأسنان (حتى 40 سنة)',
        posPct: [0.31, 0.49],
        iq: 'بقايا مجهرية ممكن تسبب رجوع الكيس حتى بعد أربعين سنة.',
        clinical: 'Lifelong radiographic follow-up',
      },
      {
        key: 'marsup',
        en: 'Non-Keratinising Lining Conversion',
        ar: 'استبدال البطانة بظهارة غير متقرنة',
        posPct: [0.70, 0.51],
        iq: 'هجرة ظهارة الفم تحول الجدار لسميك وأسهل استئصالاً وتخلي الأسنان المائلة تستقيم.',
        clinical: 'Less morbidity | Resection in skull-base risk',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.14, y: h * 0.72},
            {x: w * 0.21, y: h * 0.56},
            {x: w * 0.30, y: h * 0.59},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#F59E0B', width: 3.2, pulseSpeed: 0.4, arrowEnd: true},
        );
        drawMeasureBand(
          ctx,
          {x: w * 0.20, y: h * 0.69},
          {x: w * 0.33, y: h * 0.69},
          {label: '1-2 mm Depth', color: '#D97706'},
        );
      } else {
        const cav = {x: w * 0.70, y: h * 0.51};
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.76, y: h * 0.38},
            {x: w * 0.74, y: h * 0.51},
            {x: w * 0.67, y: h * 0.55},
          ],
          t,
          {colorStart: '#10B981', colorEnd: '#0D9488', width: 3.2, pulseSpeed: 0.36, arrowEnd: true},
        );
        drawOrbitPath(ctx, cav, w * 0.06, h * 0.11, t, {color: '#10B981', speed: 0.9});
      }
    },
  },

  'p4-t2': {
    topicId: 'p4-t2',
    imgSrc: '/src/assets/images/atlas_gorlin_triad_1795586345857.jpg',
    imgAlt: 'Gorlin-Goltz syndrome triad: multiple OKCs, multiple basal cell carcinomas, and bifid rib',
    duration: 8,
    scenarios: [
      {
        label: '1. الأكياس المتعددة بالفكين + سرطانات الجلد القاعدية',
        activePart: 'okc',
        focus: {cx: 0.34, cy: 0.48, scale: 1.25},
        duration: 8,
        seeIq:
          'باللوحة اليسرى تشوف المريض عنده عدة أكياس OKC بالفكين العلوي والسفلي، وبجلد الوجه عقيدات متعددة من سرطان الخلايا القاعدية (Multiple BCCs).',
        whyIq:
          'متلازمة غورلين هي صفة وراثية سائدة (Autosomal dominant) وأهم علامة تشوفها كطبيب أسنان هو طفل عنده OKC أو شخص عنده أكثر من OKC.',
        tipIq: 'Multiple OKCs OR OKC in a child -> suspect Gorlin–Goltz syndrome immediately.',
      },
      {
        label: '2. التشوهات الهيكلية بالقفص الصدري (Bifid Ribs)',
        activePart: 'skel',
        focus: {cx: 0.73, cy: 0.54, scale: 1.38},
        duration: 8,
        seeIq:
          'باللوحة اليمنى بالقفص الصدري واضح تفرع الضلع لشوكتين (Bifid rib) وهو الركن الثالث بالثالوث الوراثي للمتلازمة.',
        whyIq:
          'المتلازمة تشمل تشوهات هيكلية (أضلاع متفرعة، تكلس المنجل المخي، قوس جبهة عريض) وتترافق أحياناً مع شق الشفة والحنك.',
        tipIq: 'Gorlin Triad (Autosomal Dominant) = Multiple BCCs + Multiple OKCs + Skeletal anomalies (Bifid rib).',
      },
    ],
    parts: [
      {
        key: 'bcc',
        en: 'Multiple Basal Cell Carcinomas',
        ar: 'سرطانات خلايا قاعدية متعددة',
        posPct: [0.415, 0.23],
        iq: 'عقيدات جلدية متعددة بالوجه والرقبة تزيد بالشمس وتمثل الضلع الأول من الثالوث.',
        clinical: 'Triad component 1 (Autosomal dominant)',
      },
      {
        key: 'okc',
        en: 'Multiple OKCs in Maxilla & Mandible',
        ar: 'أكياس OKC متعددة بالفكين',
        posPct: [0.305, 0.725],
        iq: 'أكياس متقرنة متعددة تتصرف مثل الفردي وتظهر مبكراً بالطفولة.',
        clinical: 'Triad component 2',
      },
      {
        key: 'skel',
        en: 'Skeletal Anomalies (Bifid Rib)',
        ar: 'تشوهات هيكلية (ضلع متفرع)',
        posPct: [0.76, 0.55],
        iq: 'الضلع المتشعب (Forked / Bifid rib) وتكلسات الجمجمة كضلع ثالث للثالوث.',
        clinical: 'Triad component 3',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      const okcLow = {x: w * 0.305, y: h * 0.725};
      const okcMax = {x: w * 0.39, y: h * 0.62};
      const bccTop = {x: w * 0.415, y: h * 0.23};
      const rib = {x: w * 0.76, y: h * 0.55};

      if (st.scIdx === 0) {
        drawShockRings(ctx, okcLow, t, {color: '#E11D48', maxRadius: 24, rings: 2, speed: 0.3});
        drawShockRings(ctx, okcMax, t, {color: '#E11D48', maxRadius: 20, rings: 2, speed: 0.3});
        drawFlowTrack(ctx, [bccTop, {x: w * 0.43, y: h * 0.45}, okcMax, okcLow], t, {
          colorStart: '#38BDF8',
          colorEnd: '#E11D48',
          width: 2.8,
          pulseSpeed: 0.32,
          arrowEnd: true,
        });
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.66, y: h * 0.51},
            {x: w * 0.76, y: h * 0.55},
            {x: w * 0.84, y: h * 0.59},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#F59E0B', width: 3.2, pulseSpeed: 0.38, arrowEnd: true},
        );
        drawAngleArc(ctx, {x: w * 0.74, y: h * 0.54}, 30, -0.35, 0.45, 'Bifid Fork', '#D97706');
      }
    },
  },

  'p5-t1': {
    topicId: 'p5-t1',
    imgSrc: '/src/assets/images/atlas_palmar_orthokeratinised_1795586347160.jpg',
    imgAlt: 'Palmar pits of Gorlin syndrome (1-2 mm) and orthokeratinised odontogenic cyst around 3rd molar',
    duration: 8,
    scenarios: [
      {
        label: '1. النقاط الراحية بغورلين (≥3 نقاط بقطر 1–2 ملم)',
        activePart: 'pits',
        focus: {cx: 0.28, cy: 0.52, scale: 1.4},
        duration: 8,
        seeIq:
          'باللوحة اليسرى بكف الإيد شوف تقعرات نقطية صغيرة 1–2 ملم صايرة حمراء أو غامقة (Palmar pits)، وعددهم هنا 5 نقاط.',
        whyIq:
          'سببها نقص كيراتين موضعي باليدين والقدمين، ووجود 3 نقاط فأكثر يعتبر علامة تشخيصية (Diagnostic feature) لغورلين.',
        tipIq: 'Palmar/plantar pits (1–2 mm, focal keratin lack): ≥3 pits = diagnostic of Gorlin.',
      },
      {
        label: '2. الكيس مستقيم التقرن (OOC) يشبه التاجي ويشفى بالاستئصال',
        activePart: 'ooc',
        focus: {cx: 0.74, cy: 0.54, scale: 1.4},
        duration: 8,
        seeIq:
          'باللوحة اليمنى كيس الـ OOC محاوط تاج ضرس عقل سفلي كأنه Dentigerous cyst! لكن بطانته مستقيمة التقرن ولا يرجع.',
        whyIq:
          'عكس الـ OKC، الـ OOC نشاطه التكاثري أضعف، ماله أي علاقة بغورلين، ونسبة رجوعه قليلة ويشفى بالـ Enucleation.',
        tipIq: 'OOC = lower proliferative activity · NO Gorlin link · Mimics dentigerous · Enucleation is curative.',
      },
    ],
    parts: [
      {
        key: 'pits',
        en: '≥3 Palmar Pits (1–2 mm Focal Lack)',
        ar: 'النقاط الراحية (≥3 نقاط · 1–2 ملم)',
        posPct: [0.29, 0.50],
        iq: 'تقعرات نقطية 1–2 ملم براحة اليد وأخمص القدم تشخص متلازمة غورلين لو كانت 3 فأكثر.',
        clinical: 'Diagnostic for Gorlin–Goltz',
      },
      {
        key: 'ooc',
        en: 'Orthokeratinised Cyst (OOC)',
        ar: 'الكيس مستقيم التقرن (OOC)',
        posPct: [0.75, 0.51],
        iq: 'يحاكي الكيس التاجي شعاعياً حول ضرس العقل، غير مرتبط بغورلين، والاستئصال شافٍ.',
        clinical: 'Enucleation is curative',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        const pits = [
          {x: w * 0.27, y: h * 0.48},
          {x: w * 0.30, y: h * 0.42},
          {x: w * 0.32, y: h * 0.47},
          {x: w * 0.31, y: h * 0.56},
          {x: w * 0.27, y: h * 0.61},
        ];
        pits.forEach((p) => {
          drawShockRings(ctx, p, t, {color: '#E11D48', maxRadius: 14, rings: 2, speed: 0.35});
        });
        drawMeasureBand(
          ctx,
          {x: w * 0.25, y: h * 0.69},
          {x: w * 0.34, y: h * 0.69},
          {label: '5 Pits (1-2 mm)', color: '#E11D48'},
        );
      } else {
        const ooc = {x: w * 0.75, y: h * 0.51};
        drawOrbitPath(ctx, ooc, w * 0.08, h * 0.14, t, {color: '#10B981', speed: 0.9});
        drawSteadyBadge(ctx, ooc.x, h * 0.74, 'Curative Enucleation (No Gorlin)', '#10B981');
      }
    },
  },

  'p5-t2': {
    topicId: 'p5-t2',
    imgSrc: '/src/assets/images/atlas_lateral_botryoid_1795586343261.jpg',
    imgAlt: 'Mandibular arch showing lateral periodontal cyst, botryoid odontogenic cyst, and glandular odontogenic cyst',
    duration: 8,
    scenarios: [
      {
        label: '1. اللثوي الجانبي (سن حي >3/4) vs العنقودي (Botryoid)',
        activePart: 'lateral',
        focus: {cx: 0.46, cy: 0.58, scale: 1.3},
        duration: 8,
        seeIq:
          'على يسار الشاشة يم جذر الضرس الحي كيس لثوي جانبي أحادي (Lateral periodontal)؛ وبمقدمة الفك تحت القواطع شكل عنقودي متعدد الحجرات يشبه عنقود العنب (Botryoid).',
        whyIq:
          'اللثوي الجانبي (>3/4 بمنطقة الناب/الضاحك السفلي) ينشال ونبقي السن الحي، بينما العنقودي فوك 50 سنة يرجع ويشبه OKC بالأشعة.',
        tipIq: 'Lateral = >3/4 lower canine/premolar (vital tooth) · Botryoid = multilocular >50y & recurs.',
      },
      {
        label: '2. الكيس السني الغدي (Sialo-odontogenic) ورجوع 1/3',
        activePart: 'gland',
        focus: {cx: 0.76, cy: 0.58, scale: 1.48},
        duration: 8,
        seeIq:
          'على يمين الشاشة كدام الأضراس كيس كبير متعدد الفصوص يوسع الفك ويزيح وياكل الجذور — هذا الكيس الغدي (Glandular/Sialo-odontogenic).',
        whyIq:
          'ثلث الحالات (1/3) ترجع بعد الاستئصال البسيط، وبسبب تشابهه مع OKC أحياناً يتعالج أشرس بالصدفة فما يرجع.',
        tipIq: 'Glandular (sialo-odontogenic): mandible anterior to molars · ~1/3 recur after enucleation.',
      },
    ],
    parts: [
      {
        key: 'lateral',
        en: 'Lateral Periodontal (Mid-Root / Vital)',
        ar: 'اللثوي الجانبي (منتصف جذر سن حي)',
        posPct: [0.32, 0.57],
        iq: 'من بقايا مالاسيز، >3/4 بالناب والضاحك السفلي، ينشال مع حفظ السن الحي.',
        clinical: 'Unilocular <1 cm | Vital tooth',
      },
      {
        key: 'botryoid',
        en: 'Botryoid Variant (Grape-like >50y)',
        ar: 'النوع العنقودي (متعدد >50 سنة)',
        posPct: [0.56, 0.69],
        iq: 'متعدد الحجرات بمقدمة الفك السفلي بعمر >50 سنة يرجع ويشبه OKC بالأشعة.',
        clinical: 'Multilocular recurrence risk',
      },
      {
        key: 'gland',
        en: 'Glandular / Sialo-odontogenic (1/3 Recur)',
        ar: 'الكيس الغدي (نسبة رجوع 1/3)',
        posPct: [0.77, 0.58],
        iq: 'في منتصف العمر كدام الأضراس السفلى، يوسع العظم ويرجع بثلث الحالات بالاستئصال البسيط.',
        clinical: '1/3 recurrence rate',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, {x: w * 0.32, y: h * 0.57}, 18, 22, t, {color: '#0284C7', speed: 1.0});
        drawOrbitPath(ctx, {x: w * 0.56, y: h * 0.69}, 34, 30, t, {
          color: '#7C3AED',
          dashed: true,
          speed: 0.75,
        });
      } else {
        const gland = {x: w * 0.77, y: h * 0.58};
        drawShockRings(ctx, gland, t, {color: '#E11D48', maxRadius: 42, rings: 3, speed: 0.28});
        drawFlowTrack(
          ctx,
          [gland, {x: w * 0.77, y: h * 0.45}],
          t,
          {colorStart: '#E11D48', colorEnd: '#D97706', width: 3, pulseSpeed: 0.35, arrowEnd: true},
        );
      }
    },
  },

  'p6-t1': {
    topicId: 'p6-t1',
    imgSrc: '/src/assets/images/atlas_calcifying_gingival_1795586465746.jpg',
    imgAlt: 'Calcifying odontogenic cyst with calcification flecks and odontomes vs newborn Bohn nodules and Epstein pearls',
    duration: 8,
    scenarios: [
      {
        label: '1. الكيس المتكلس (تكلسات + 10% Odontomes)',
        activePart: 'coc',
        focus: {cx: 0.24, cy: 0.53, scale: 1.4},
        duration: 8,
        seeIq:
          'باللوحة اليسرى كيس متكلس بالفك يحتوي على بقع تكلس بيضة (Flecks of calcification) وسنين صغيرين (Odontomes في 10% من الحالات).',
        whyIq:
          'لازم نفرقه نسيجياً عن Solid odontogenic tumour لأن الورم الصلب يرجع، بينما هذا الكيس ما يرجع بعد الاستئصال.',
        tipIq: 'Calcifying cyst: flecks of calcification + 10% odontomes · NO recurrence (unlike solid tumour).',
      },
      {
        label: '2. أكياس الرضع (Bohn عالحافة vs Epstein بالحنك)',
        activePart: 'bohn',
        focus: {cx: 0.76, cy: 0.50, scale: 1.4},
        duration: 8,
        seeIq:
          'باللوحة اليمنى بحنك الرضيع: حبات بيضة عالحافة السنخية (Bohn’s nodules بـ 80% من المواليد من Rests of Serres)، وكرّات دقيقة عالخط الوسطي (Epstein’s pearls).',
        whyIq:
          'تختفي تلقائياً (Bohn بأيام و Epstein بأسابيع/أشهر)؛ أما كيس اللثة بالبالغين فيطلع بعد الـ 40 <1 سم بالناب والضاحك السفلي.',
        tipIq: 'Bohn = alveolar ridge (80%, Serres, ≤2mm, days) · Epstein = midpalatine raphe (weeks) · Adult = >40y <1cm.',
      },
    ],
    parts: [
      {
        key: 'coc',
        en: 'Calcifying Cyst (Flecks & 10% Odontomes)',
        ar: 'المتكلس (تكلسات + 10% أودونتوما)',
        posPct: [0.22, 0.52],
        iq: 'يحوي بقع تكلس وشبيهات أسنان بـ 10%، ولا يرجع عكس الورم السني الصلب.',
        clinical: 'Differentiate from solid tumour',
      },
      {
        key: 'bohn',
        en: 'Bohn’s Nodules (80% Alveolar Ridge)',
        ar: 'عقد بون (80% عالحافة السنخية)',
        posPct: [0.64, 0.30],
        iq: 'حبيبات ≤2 ملم من بقايا سيريز عالحافة السنخية عند 80% من المواليد وتروح بأيام.',
        clinical: 'Resolves spontaneously (no Tx)',
      },
      {
        key: 'epstein',
        en: 'Epstein’s Pearls (Midpalatine Raphe)',
        ar: 'لآلئ إبشتاين (خط منتصف الحنك)',
        posPct: [0.75, 0.50],
        iq: 'ميكروكيراتين كريمي على خط منتصف الحنك يزول تلقائياً بأسابيع لشهور.',
        clinical: 'Midpalatine raphe vs Adult >40y (<1 cm)',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        drawOrbitPath(ctx, {x: w * 0.22, y: h * 0.52}, w * 0.085, h * 0.16, t, {
          color: '#0D9488',
          speed: 0.8,
        });
        drawShockRings(ctx, {x: w * 0.19, y: h * 0.61}, t, {
          color: '#D97706',
          maxRadius: 20,
          rings: 2,
          speed: 0.3,
        });
      } else {
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.63, y: h * 0.30},
            {x: w * 0.60, y: h * 0.48},
            {x: w * 0.58, y: h * 0.66},
          ],
          t,
          {colorStart: '#D97706', colorEnd: '#10B981', width: 2.8, pulseSpeed: 0.35},
        );
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.75, y: h * 0.38},
            {x: w * 0.75, y: h * 0.62},
          ],
          t,
          {colorStart: '#38BDF8', colorEnd: '#0D9488', width: 2.8, pulseSpeed: 0.35},
        );
      }
    },
  },

  'p6-t2': {
    topicId: 'p6-t2',
    imgSrc: '/src/assets/images/atlas_nasopalatine_nasolabial_1795586346176.jpg',
    imgAlt: 'Heart-shaped nasopalatine duct cyst diverging central roots vs extraosseous nasolabial cyst',
    duration: 8,
    scenarios: [
      {
        label: '1. كيس القناة القاطعة (5% · شكل القلب وتباعد الجذور)',
        activePart: 'incisive',
        focus: {cx: 0.24, cy: 0.50, scale: 1.42},
        duration: 8,
        seeIq:
          'باللوحة اليسرى كيس القناة القاطعة (أشيع كيس غير سني 5%): صاير على شكل قلب بسبب تراكب الشوكة الأنفية الأمامية ودافع جذور القواطع بعيد عن بعض.',
        whyIq:
          'الأسنان تظل حية تماماً (عكس الجذري!) والمريض أحياناً يشكو من طعم وإفراز مالح (Salty discharge).',
        tipIq: 'Nasopalatine (~5% | commonest non-odontogenic): heart-shaped + central apices pushed apart + salty discharge.',
      },
      {
        label: '2. الكيس الأنفي الشفوي (خارج العظم بالشفة العليا)',
        activePart: 'nasolab',
        focus: {cx: 0.73, cy: 0.52, scale: 1.42},
        duration: 8,
        seeIq:
          'باللوحة اليمنى الكيس الأنفي الشفوي كاعد بالأنسجة الرخوة برة العظم جوا الطية الأنفية الشفوية فدافع الشفة العليا ومشوّه فتحه المنخر.',
        whyIq:
          'أشيع بالإناث وأصله من الطرف السفلي للقناة الدمعية الأنفية وممكن يجي بالجهتين، وينشال بعملية من داخل الـ Labial sulcus.',
        tipIq: 'Nasolabial: outside bone deep to nasolabial fold · females > males · intraoral labial sulcus excision.',
      },
    ],
    parts: [
      {
        key: 'incisive',
        en: 'Nasopalatine Duct Cyst (Heart-Shaped / 5%)',
        ar: 'كيس القناة القاطعة (شكل قلب · 5%)',
        posPct: [0.24, 0.48],
        iq: 'تراكب الشوكة الأنفية الأمامية ينطي شكل القلب مع إفرازات مالحة وحيوية الأسنان.',
        clinical: 'Commonest non-odontogenic cyst',
      },
      {
        key: 'apices',
        en: 'Diverged Vital Central Incisor Apices',
        ar: 'تباعد ذروات القواطع المركزية الحية',
        posPct: [0.18, 0.58],
        iq: 'يدفع ذروتي القاطعين بعيد عن بعض مع بقاء التاج مقترب والأسنان حية.',
        clinical: 'Differentiates from radicular cyst',
      },
      {
        key: 'nasolab',
        en: 'Extraosseous Nasolabial Cyst',
        ar: 'الكيس الأنفي الشفوي (خارج العظم)',
        posPct: [0.78, 0.54],
        iq: 'يرفع جناح الأنف والشفة العليا جوا الطية الأنفية الشفوية؛ يُستأصل عبر Labial sulcus.',
        clinical: 'Nasolacrimal duct origin | Females > Males',
      },
    ],
    drawOverlay: (ctx, w, h, t, st) => {
      if (st.scIdx === 0) {
        // Steady root divergence arrows
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.24, y: h * 0.54},
            {x: w * 0.16, y: h * 0.62},
          ],
          t,
          {colorStart: '#0D9488', colorEnd: '#D97706', width: 2.8, pulseSpeed: 0.4, arrowEnd: true},
        );
        drawFlowTrack(
          ctx,
          [
            {x: w * 0.24, y: h * 0.54},
            {x: w * 0.32, y: h * 0.62},
          ],
          t,
          {colorStart: '#0D9488', colorEnd: '#D97706', width: 2.8, pulseSpeed: 0.4, arrowEnd: true},
        );
        drawAngleArc(ctx, {x: w * 0.24, y: h * 0.35}, 26, Math.PI * 0.22, Math.PI * 0.78, 'Spine V', '#38BDF8');
      } else {
        const nl = {x: w * 0.78, y: h * 0.54};
        drawShockRings(ctx, nl, t, {color: '#D97706', maxRadius: 32, rings: 3, speed: 0.28});
        drawFlowTrack(
          ctx,
          [nl, {x: w * 0.65, y: h * 0.44}],
          t,
          {colorStart: '#D97706', colorEnd: '#E11D48', width: 3, pulseSpeed: 0.36, arrowEnd: true},
        );
      }
    },
  },
};
