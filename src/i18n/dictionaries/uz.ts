import type { Dictionary } from "./en";

const uz: Dictionary = {
  meta: {
    title: "Foydami — qaysi Telegram reklamalari qoladigan obunachi keltiradi",
    description:
      "Har bir Telegram kanal kampaniyasini aynan qaysi reklama olib kelganini kuzating. Ushlab qolish, chiqib ketish va ushlab qolingan obunachi narxi — shunchaki qo'shilganlar soni emas.",
  },

  common: {
    save: "Saqlash",
    cancel: "Bekor qilish",
    edit: "tahrirlash",
    dash: "—",
    connectAnotherChannel: "+ Yana bir kanal ulash",
    myAccountFallback: "Mening hisobim",
    campaignStatus: {
      active: "faol",
      paused: "to'xtatilgan",
      archived: "arxivlangan",
    },
  },

  languageSwitcher: {
    label: "Til",
  },

  landing: {
    nav: { signIn: "Kirish", getStarted: "Boshlash" },
    hero: {
      badge: "Telegram kanal egalari va agentliklar uchun",
      titleLead: "Qaysi reklamalar",
      titleHighlight: "chindan qoladigan obunachi",
      subtitle:
        'Telegram sizga ming kishi qo\'shildi deydi. Lekin ulardan sakkiz yuztasi bir hafta ichida chiqib ketganini yoki qaysi reklamadan kelganini aytmaydi. Foydami har bir qo\'shilishni uni keltirgan kampaniyaga bog\'lab, keyin o\'sha odamlar qolyaptimi yo\'qmi — shuni kuzatadi.',
      ctaPrimary: "Bepul kuzatishni boshlash",
      ctaHint: "Kanalni ikki bosqichda ulang — kod yozish shart emas.",
    },
    problem: {
      title: "Obunachilar soni qimmatga tushadigan haqiqatni yashiradi",
      body: "Ikkita reklama bir xil narxga 500 tadan obunachi keltiradi. Olti haftadan so'ng birida 400 tasi qolgan, ikkinchisida — bor-yo'g'i 90 tasi. Xom raqamlarda ular bir xil ko'rinardi.",
    },
    features: [
      {
        title: "Taxmin emas, aniq bog'lanish",
        body: "Har bir kampaniya uchun alohida Telegram taklif havolasi yaratiladi. Kimdir shu havola orqali qo'shilsa, bu qo'shilish aynan o'sha reklamaga tegishli bo'ladi — UTM bilan taxmin qilish yo'q, kanal egasidan qo'lda sanashni so'rash yo'q.",
      },
      {
        title: "1, 7, 30 va 90 kunlik ushlab qolish ko'rsatkichi",
        body: "Reklama orqali kelgan obunachilardan qanchasi bir haftadan, bir oydan keyin ham qolganini ko'ring — va xom qo'shilish raqamlari yashirib turadigan chiqib ketish darajasini ham.",
      },
      {
        title: "Qolgan har bir obunachining narxi",
        body: "Reklamaga sarflangan summani kiriting va CAC bilan bir qatorda ushlab qolingan obunachi narxini ham oling. Aynan ikkinchi raqam yana sotib olish kerakmi-yo'qmi, shuni hal qiladi.",
      },
    ],
    placement: {
      badge: "Telegram reklamalari haqiqatda qanday sotilishiga moslab qurilgan",
      title: "Yuqori joy o'zining ustama narxiga arzidimi?",
      body1:
        'Siz "1/24" sotib olasiz — bir soat tepada mahkamlangan, keyin bir kun lentada. O\'sha birinchi soat uchun qo\'shimcha to\'laysiz. Foydami qo\'shilishlarni yuqori joy, qolgan lenta vaqti va post olib tashlangandan keyingi qismga bo\'lib beradi.',
      body2:
        "Agar qo'shilishlarning ko'pi birinchi soatda kelsa — ustama narx o'zini oqlagan. Agar ular keyinroq, ozgina-ozgina kelsa — siz lenta baribir bergan narsa uchun ortiqcha to'lagan bo'lasiz.",
    },
    howItWorks: {
      title: "Bir necha daqiqada ishga tushadi",
      steps: [
        {
          title: "Botni kanalingizga qo'shing",
          body: "Botga yozing, so'ng uni administrator qilib qo'shing. U ulangan zahoti tasdiqlaydi va qo'shilish-chiqishlarni yozib borishni boshlaydi.",
        },
        {
          title: "Kampaniya yarating",
          body: "Joylashuvga nom bering va uning narxini kiriting. Foydami maxsus Telegram taklif havolasini yaratadi — ochiq havola o'rniga shuni ulashing.",
        },
        {
          title: "Kim qolayotganini kuzating",
          body: "Qo'shilishlar avtomatik bog'lanadi. Vaqt o'tishi bilan ushlab qolish, chiqib ketish darajasi va ushlab qolingan obunachi narxi shakllanib boradi.",
        },
      ],
      limitationLabel: "Bitta halol cheklov:",
      limitationBody:
        "kuzatish bot administrator bo'lgan paytdan boshlanadi. Telegram kanalning oldingi tarixini tiklashning iloji bermaydi, shuning uchun qanchalik tez ulansa, raqamlar shunchalik tez ma'noga ega bo'ladi.",
    },
    cta: {
      title: "Chiqib ketadigan obunachilar uchun ikki marta to'lashni bas qiling",
      body: "Kanalni ulang — keyingi kampaniyangiz uni yana sotib olishga arziydimi-yo'qmi, shuni aytib beradi.",
      button: "Bepul kuzatishni boshlash",
    },
    footer: {
      tagline: "Foydami — Telegram kampaniyalari samaradorligini kuzatish.",
    },
    preview: {
      welcomeBack: "Xush kelibsiz",
      sampleName: "islom",
      activeSubscribers: "Faol obunachilar",
      joined30: "Qo'shildi (30 kun)",
      left30: "Chiqib ketdi (30 kun)",
      netGrowth30: "Sof o'sish (30 kun)",
      growthLast30: "O'sish — so'nggi 30 kun",
      sevenDayRetention: "7 kunlik ushlab qolish",
      joinsRetained: "438 tadan 324 tasi qolgan",
      urlBar: "foydami.app/dashboard",
    },
    placementPreview: {
      channelName: "Crypto Uzbekistan",
      dateRange: "18-avg 14:00 → 19-avg 14:00",
      topSlot: "Yuqori joy (birinchi 1 soat)",
      restOfFeed: "Lentaning qolgan qismi",
      afterWindow: "Vaqt tugagandan keyin",
      capturedInTopSlot: "Yuqori joyda qo'lga kiritildi",
      stillSubscribed: "Hozir ham obuna",
      costPerWindowJoin: "Vaqt oralig'idagi qo'shilish narxi",
    },
  },

  login: {
    subtitle: "Hisobingizga kiring.",
    continueWithTelegram: "Telegram orqali davom etish",
    orContinueWithEmail: "yoki email orqali davom eting",
    email: "Email",
    password: "Parol",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
  },

  loginTelegram: {
    subtitle: "Telegram orqali kiring — email shart emas.",
    step1Title: "1. Botimizga yozing",
    step1Body: "U salom beradi va kirish kodini beradi.",
    openTelegram: "Telegram-ni oching va @{botUsername} ga yozing",
    step2Title: "2. Kodni shu yerga kiriting",
    codePlaceholder: "8F4-K29",
    verifyButton: "Tasdiqlash va davom etish",
    useEmailInstead: "← Buning o'rniga email ishlatish",
  },

  onboarding: {
    titleFirst: "Kanalingizni ulang",
    titleAnother: "Yana bir kanal ulash",
    subtitle: "Qaysi Telegram kanali sizniki ekanini bilishimiz uchun ikkita qisqa qadam.",
    alreadyConnected: "Allaqachon ulangan:",
    backToDashboard: "← Boshqaruv paneliga qaytish",
    step1Title: "1. Hisobingizni bog'lash uchun botga yozing",
    openTelegram: "Telegram-ni oching va @{botUsername} ga yozing",
    step2Title: "2. Botni kanalingizga administrator qilib qo'shing",
    step2Body:
      "Kanal sozlamalari → Administratorlar → Administrator qo'shish → @{botUsername}. Ikkala qadam bajarilgach, buni avtomatik aniqlaymiz.",
    checkNow: "Ikkalasini ham bajardim — hozir tekshirish",
    channelDetected: "Kanal aniqlandi!",
    nameItLabel: "Uni tanib olsa bo'ladigan nom bilan ataang",
    confirmButton: "Tasdiqlash va davom etish",
  },

  dashboard: {
    welcomeBack: "Xush kelibsiz",
    guestFallback: "mehmon",
    subtitle: "Qaysi manbalar shunchaki qo'shiladigan emas, balki qoladigan obunachi keltirishini ko'ring.",
    switchChannelNote:
      "Boshqa kanal bilan ishlayapsizmi? Qaysi kanal faol ekanini Profil bo'limidan almashtiring. Kontent bog'lanishi, ogohlantirishlar va agentlik ko'rinishlari keyingi bosqichlarda, qurish tartibiga ko'ra qo'shiladi.",
  },

  dashboardBody: {
    failedToLoad: "Ma'lumotlarni yuklab bo'lmadi: {error}",
    rightNow: "{channel}, hozirgi holat",
    liveTotalsNote: "Telegramdan olingan jonli raqamlar — kuzatish boshlanishidan oldingi a'zolarni ham o'z ichiga oladi.",
    totalMembers: "Jami a'zolar",
    trackedJoinsAllTime: "Kuzatilgan qo'shilishlar (butun davr)",
    activeCampaigns: "Faol kampaniyalar",
    botStatus: "Bot holati",
    showing: "Ko'rsatilmoqda: {period}",
    activeSubscribers: "Faol obunachilar",
    joinedPeriod: "Qo'shildi ({period})",
    leftPeriod: "Chiqib ketdi ({period})",
    netGrowthPeriod: "Sof o'sish ({period})",
    growth: "O'sish — {period}",
    sevenDayRetention: "7 kunlik ushlab qolish",
    joinsRetained: "{eligible} tadan {retained} tasi qolgan",
    notEnoughJoins: "O'lchash uchun yetarlicha eski qo'shilishlar hali yo'q",
    campaignLinks: "Kampaniya havolalari",
    campaignLinksNote: "Faqat shular qo'shilishni bog'lay oladi — kanalning ochiq havolasi bunday qila olmaydi.",
    fullMetrics: "To'liq ko'rsatkichlar →",
  },

  periods: {
    today: "Bugun",
    yesterday: "Kecha",
    "7d": "So'nggi 7 kun",
    "30d": "So'nggi 30 kun",
  },

  campaignLinksTable: {
    campaign: "Kampaniya",
    inviteLink: "Taklif havolasi",
    joined: "Qo'shildi",
    active: "Faol",
    status: "Holat",
    noLinksYet: "Hali kampaniya havolalari yo'q — qo'shilishlarni bog'lashni boshlash uchun Statistika sahifasida birini yarating.",
  },

  placementFields: {
    postGoesLive: "Post chiqadigan vaqt",
    topSlot: "Yuqori joy",
    inFeed: "Lentada",
    topOptions: {
      "15": "15 daqiqa",
      "30": "30 daqiqa",
      "60": "1 soat",
      "120": "2 soat",
      "180": "3 soat",
      "360": "6 soat",
      "720": "12 soat",
      "1440": "24 soat",
    },
    feedOptions: {
      "6": "6 soat",
      "12": "12 soat",
      "24": "24 soat",
      "48": "48 soat",
      "72": "3 kun",
      "168": "1 hafta",
    },
  },

  placementPerformance: {
    empty:
      'Hali birorta kampaniyada vaqt oralig\'i (placement window) sozlanmagan. Kampaniya yaratish yoki tahrirlashda buni qo\'shsangiz, "1 soat yuqorida / 24 soat lentada" xaridi qanday natija berganini ko\'rasiz.',
    running: "davom etmoqda",
    topSlotFirst: "Yuqori joy (birinchi {duration})",
    restOfFeed: "Lentaning qolgan qismi",
    afterWindow: "Vaqt tugagandan keyin",
    joinsInPaidWindow: "Pullik vaqt oralig'idagi qo'shilishlar",
    capturedInTopSlot: "Yuqori joyda qo'lga kiritildi",
    stillSubscribed: "Hozir ham obuna",
    costPerWindowJoin: "Vaqt oralig'idagi qo'shilish narxi",
  },

  stats: {
    title: "Statistika",
    subtitle: "{channel} — ushlab qolish bo'yicha saralangan kampaniya natijalari.",
    spendEfficiency: "Xarajat samaradorligi",
    spendEfficiencyNote: "Narxi kiritilgan kampaniyalar bo'yicha o'rtacha ko'rsatkich.",
    totalAdSpend: "Jami reklama xarajati",
    cac: "CAC",
    perSubscriberAcquired: "jalb qilingan obunachi uchun",
    costPerRetained: "Ushlab qolingan narxi",
    perSubscriberStillHere: "hozir ham qolgan obunachi uchun",
    costPerClick: "Bosish narxi",
    trackedClicksN: "{count} ta kuzatilgan bosish",
    noTrackedLinksYet: "hali kuzatiluvchi havola yo'q",
    paidVsOrganicJoins: "Pullik / organik qo'shilishlar",
    table: {
      campaign: "Kampaniya",
      source: "Manba",
      adCost: "Reklama narxi",
      clicks: "Bosishlar",
      clickToJoin: "Bosish→Qo'shilish",
      joined: "Qo'shildi",
      active: "Faol",
      churn: "Chiqib ketish",
      cac: "CAC",
      cpc: "CPC",
      costPerRet: "Ushlab qolish narxi",
      d1: "1 kun",
      d7: "7 kun",
      d30: "30 kun",
      d90: "90 kun",
      quality: "Sifat",
      actions: "Amallar",
    },
    quality: {
      high: "Yuqori",
      medium: "O'rtacha",
      low: "Past",
      unknown: "—",
    },
    sourceOptions: {
      paid_ad: "Pullik reklama",
      influencer: "Bloger",
      organic: "Organik",
      cross_promo: "O'zaro reklama",
      other: "Boshqa",
    },
    editForm: {
      campaignName: "Kampaniya nomi",
      source: "Manba",
      adCost: "Reklama narxi",
      notSet: "kiritilmagan",
      turnOnClickTracking: "Bosishlarni kuzatishni yoqish",
      save: "Saqlash",
      cancel: "Bekor qilish",
    },
    row: {
      edit: "tahrirlash",
      pause: "to'xtatish",
      activate: "faollashtirish",
      archive: "arxivlash",
    },
    noCampaignsYet: "Hali kampaniyalar yo'q.",
    organicJoinsNote: "+ {count} ta taklif havolasisiz organik qo'shilish.",
    retentionNote:
      "Ushlab qolish ustunlari qancha kun o'tgach ham obuna bo'lib qolganlar foizini ko'rsatadi, qavs ichida esa sanash uchun yetarlicha eskirgan qo'shilishlar soni beriladi. CAC = reklama narxi ÷ qo'shilganlar.",
    placementPerformance: "Joylashuv samaradorligi",
    placementPerformanceNote: "Pullik vaqt oralig'ida qo'shilishlar qanday taqsimlangan — yuqori joy o'z ustama narxiga arzidimi?",
    newCampaign: "Yangi kampaniya",
    newForm: {
      name: "Nomi",
      source: "Manba",
      adCostOptional: "Reklama narxi (ixtiyoriy)",
      trackClicks: "Bu havolada bosish va obunalarni kuzatish",
      submit: "Yaratish va taklif havolasini olish",
    },
  },

  settings: {
    title: "Sozlamalar",
    subtitle: "Ushbu hisob uchun bot ulanishlari va kuzatish sozlamalari.",
    trackingStoppedOne: "{channel} uchun kuzatish to'xtadi.",
    trackingStoppedMany: "{count} ta kanal uchun kuzatish to'xtadi.",
    trackingStoppedSuffix: "Davom ettirish uchun botni qayta administrator qilib qo'shing.",
    connectedChannels: "Ulangan kanallar",
    connectedChannelsNote: "Ilova hozir qaysi kanal bo'yicha hisobot berayotgani yon paneldagi almashtirgichdan tanlanadi.",
    botStatusLabel: {
      active: "faol",
      removed: "olib tashlangan",
      error: "xato",
    },
    botStatusHint: {
      active: "Qo'shilish va chiqish hodisalarini qabul qilyapti.",
      removed: "Bot endi administrator emas — kuzatish to'xtadi.",
      error: "Ushbu ulanishda muammo yuz berdi.",
    },
    reconnect: "Qayta ulash",
    chatId: "Chat ID",
    trackingSince: "Kuzatish boshlangan sana",
    invitePermission: {
      title: "Taklif havolalarini hali yarata olmaydi.",
      body: 'Bot bu yerda administrator, lekin unga "Invite Users via Link" huquqi berilmagan. Telegramda ushbu kanalning Administratorlar ro\'yxatini oching, botning huquqlarini tahrirlang va shuni yoqing — u yoqilmaguncha kampaniya yaratish ishlamaydi.',
    },
    howTrackingWorks: "Kuzatish qanday ishlaydi",
    howTrackingWorksList: [
      "Qo'shilish faqat kimdir o'sha kampaniyaning taklif havolasidan foydalanganda kampaniyaga bog'lanadi. Qidiruv yoki kanalning ochiq havolasi orqali qo'shilishlar organik hisoblanadi.",
      "Kuzatish bot administrator bo'lgan zahoti boshlanadi — undan oldingi tarixni tiklab bo'lmaydi.",
      'Qo\'shilishlar shu davr to\'liq o\'tguncha ushlab qolish "—" deb ko\'rsatiladi.',
    ],
  },

  profile: {
    title: "Profil",
    subtitle: "Foydami ichida qanday ko'rinishingiz.",
    displayName: "Ko'rinadigan ism",
    photo: "Rasm (PNG, JPEG yoki WebP, 5MB dan kichik)",
    save: "Saqlash",
    signedInWith: "Kirish usuli",
    signedInWithTelegram: "Telegram ({identity})",
    signedInWithEmail: "Email ({identity})",
    telegramNote: "Telegram hisobingiz kirishingizga bog'langan va bu yerda o'zgartirib bo'lmaydi.",
    emailNote: "Emailingiz kirishingizga bog'langan va bu yerda o'zgartirib bo'lmaydi.",
    signOut: "Chiqish",
  },

  sidebar: {
    menu: "Menyu",
    dashboard: "Dashboard",
    stats: "Statistika",
    settings: "Sozlamalar",
    admin: "Admin",
    viewProfile: "Profilni ko'rish",
    openMenu: "Menyuni ochish",
    closeMenu: "Menyuni yopish",
    tracking: "Kuzatilmoqda",
    onlyOneChannel: "Faqat bitta kanal ulangan.",
    connectAnother: "+ Yana bir kanal ulash",
  },

  copyLinkButton: {
    copy: "Nusxalash",
    copied: "Nusxalandi",
  },

  admin: {
    title: "Admin",
    subtitle: "Foydami-dagi barcha hisoblar bo'yicha platforma ko'lamidagi foydalanish.",
    tiles: {
      accounts: "Hisoblar",
      accountsHint: "+{count} so'nggi 7 kunda",
      active7d: "Faol (7 kun)",
      active7dHint: "yaqinda tizimga kirgan",
      channelsTracked: "Kuzatilayotgan kanallar",
      eventsIngested: "Qayd etilgan hodisalar",
      eventsIngestedHint: "qo'shilish + chiqish, butun davr",
    },
    funnel: {
      title: "Faollashuv voronkasi",
      subtitle: "Hisoblar qayerda to'xtab qolayapti. Har bir bosqich umumiy ro'yxatdan o'tganlarning ulushi.",
      signedUp: "Ro'yxatdan o'tdi",
      connectedChannel: "Kanal ulandi",
      createdCampaign: "Kampaniya yaratdi",
      gotAttributedJoin: "Bog'langan qo'shilish oldi",
      footnote: "Oxirgi bosqich mahsulot haqiqatan ishlaganini isbotlaydi — kimdir kampaniya havolasi orqali qo'shilib, bog'landi.",
    },
    signups30d: "Ro'yxatdan o'tishlar — so'nggi 30 kun",
    accountsTable: {
      title: "Hisoblar",
      subtitle: "Ulangan kanali bor hisobni bosing — ular o'ziga ko'rinadigan xuddi shu o'sish, ushlab qolish va kampaniya ko'rinishini ko'rasiz.",
      account: "Hisob",
      signedUp: "Ro'yxatdan o'tgan",
      lastSeen: "So'nggi faollik",
      channels: "Kanallar",
      campaigns: "Kampaniyalar",
      joins: "Qo'shilishlar",
      attributed: "Bog'langan",
      lastEvent: "So'nggi hodisa",
      stage: "Bosqich",
      adminBadge: "admin",
      broken: "({count} buzilgan)",
      noAccountsYet: "Hali hisoblar yo'q.",
    },
    stage: {
      signed_up: "Ro'yxatdan o'tdi",
      connected: "Kanal ulandi",
      campaigning: "Kampaniya yuritmoqda",
      attributing: "Bog'langan qo'shilishlar olmoqda",
    },
    relativeTime: {
      never: "hech qachon",
      justNow: "hozirgina",
      minutesAgo: "{n} daq. oldin",
      hoursAgo: "{n} soat oldin",
      daysAgo: "{n} kun oldin",
    },
    accountPage: {
      backLink: "← Admin",
      viewingAsAdmin: "admin sifatida ko'rilmoqda",
      accountFallback: "Hisob",
    },
  },

  errors: {
    linkInvalid: "Bu havola endi amal qilmaydi.",
    campaign: {
      missingFields: "Kampaniya maydonlari to'ldirilmagan yoki noto'g'ri",
      channelNotFound: "Kanal topilmadi",
      nameEmpty: "Kampaniya nomi bo'sh bo'lishi mumkin emas",
      invalidAdCost: "Reklama narxi musbat son bo'lishi kerak",
    },
    profile: {
      badImageType: "PNG, JPEG yoki WebP formatidagi rasmdan foydalaning",
      imageTooLarge: "Rasm hajmi 5MB dan kichik bo'lishi kerak",
    },
    telegramLogin: {
      invalidCode: "Bu kod noto'g'ri yoki muddati o'tgan. Botga qaytadan /start login yuboring.",
      generic: "Tizimga kirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
    },
    auth: {
      confirmationExpired: "Ushbu tasdiqlash havolasining muddati o'tgan yoki allaqachon ishlatilgan. Quyida kiring yoki yangi havola olish uchun qaytadan ro'yxatdan o'ting.",
      confirmationIncomplete: "Ushbu tasdiqlash havolasi to'liq emas. Kirishga yoki qaytadan ro'yxatdan o'tishga urinib ko'ring.",
      invalidCredentials: "Email yoki parol noto'g'ri.",
    },
    telegramApi: {
      noInvitePermission: 'Botda ushbu kanal uchun taklif havolalari yaratish huquqi yo\'q. Kanalning Administratorlar ro\'yxatini oching, botning huquqlarini tahrirlang va "Invite Users via Link" ni yoqing — so\'ng qaytadan urinib ko\'ring.',
      chatNotFound: "Bu kanalga endi ulanib bo'lmayapti — bot olib tashlangan bo'lishi mumkin. Sozlamalardan qayta ulang.",
      rejected: "Telegram buni rad etdi: {description}",
      unknown: "Telegram bilan bog'lanishda xatolik yuz berdi. Bir ozdan so'ng qaytadan urinib ko'ring.",
    },
  },

  signUpConfirmation: "Emailingizni tekshiring — tasdiqlash havolasini bosing va to'g'ridan-to'g'ri tizimga kirasiz.",
};

export default uz;
