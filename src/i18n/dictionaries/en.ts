// The canonical dictionary — every other locale is typed against this
// file's shape (see dictionary.ts), so a missing or misspelled key in uz.ts
// or ru.ts is a build-time TypeScript error, not a silently blank string.
const en = {
  meta: {
    title: "Foydami — which Telegram ads bring subscribers who stay",
    description:
      "Track every Telegram channel campaign back to the ad that earned it. Retention, churn and cost per retained subscriber — not just raw join counts.",
  },

  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "edit",
    dash: "—",
    connectAnotherChannel: "+ Connect another channel",
    myAccountFallback: "My Account",
    campaignStatus: {
      active: "active",
      paused: "paused",
      archived: "archived",
    },
  },

  languageSwitcher: {
    label: "Language",
  },

  landing: {
    nav: { signIn: "Sign in", getStarted: "Get started" },
    hero: {
      badge: "For Telegram channel owners & agencies",
      titleLead: "Know which ads bring subscribers who",
      titleHighlight: "actually stay",
      subtitle:
        "Telegram tells you a thousand people joined. It won't tell you that eight hundred left within a week, or which ad they came from. Foydami traces every join back to the campaign that earned it, then follows whether those people stick around.",
      ctaPrimary: "Start tracking free",
      ctaHint: "Connect a channel in two steps — no code.",
    },
    problem: {
      title: "Subscriber counts hide the expensive truth",
      body: "Two ads deliver 500 subscribers each for the same price. Six weeks later one has 400 left and the other has 90. On raw numbers they looked identical.",
    },
    features: [
      {
        title: "Real attribution, not guesswork",
        body: "Every campaign gets its own generated Telegram invite link. When someone joins through it, that join belongs to that ad — no UTM guessing, no asking the channel owner to count for you.",
      },
      {
        title: "Retention over 1, 7, 30 and 90 days",
        body: "See how many of an ad's subscribers are still there a week and a month later — and the churn rate that raw join counts quietly hide.",
      },
      {
        title: "Cost per subscriber who stayed",
        body: "Enter what the ad cost and get CAC alongside cost per retained subscriber. The second number is the one that decides whether to buy again.",
      },
    ],
    placement: {
      badge: "Built for how Telegram ads are actually sold",
      title: "Was the top slot worth the premium?",
      body1:
        'You buy "1/24" — an hour pinned at the top, then a day in the feed. You pay extra for that first hour. Foydami splits joins across the top slot, the rest of the feed window, and after the post came down.',
      body2:
        "If most joins arrive in the first hour, the premium earned its price. If they trickle in later, you were paying for something the feed gave you anyway.",
    },
    howItWorks: {
      title: "Running in a few minutes",
      steps: [
        {
          title: "Add the bot to your channel",
          body: "Message the bot, then add it as an admin. It confirms the moment it's connected and starts recording joins and leaves.",
        },
        {
          title: "Create a campaign",
          body: "Name the placement and enter what it cost. Foydami generates a dedicated Telegram invite link — share that instead of your public link.",
        },
        {
          title: "Watch who stays",
          body: "Joins are attributed automatically. Retention, churn and cost per retained subscriber build up as time passes.",
        },
      ],
      limitationLabel: "One honest limitation:",
      limitationBody:
        "tracking starts when the bot becomes an admin. Telegram gives no way to recover a channel's history, so the sooner it's connected, the sooner the numbers mean something.",
    },
    cta: {
      title: "Stop paying twice for subscribers who leave",
      body: "Connect a channel and your next campaign will tell you whether it was worth buying again.",
      button: "Start tracking free",
    },
    footer: {
      tagline: "Foydami — Telegram campaign ROI tracking.",
    },
    preview: {
      welcomeBack: "Welcome back",
      sampleName: "islam",
      activeSubscribers: "Active subscribers",
      joined30: "Joined (30d)",
      left30: "Left (30d)",
      netGrowth30: "Net growth (30d)",
      growthLast30: "Growth — last 30 days",
      sevenDayRetention: "7-day retention",
      joinsRetained: "324 of 438 joins retained",
      urlBar: "foydami.app/dashboard",
    },
    placementPreview: {
      channelName: "Crypto Uzbekistan",
      dateRange: "18 Aug 14:00 → 19 Aug 14:00",
      topSlot: "Top slot (first 1h)",
      restOfFeed: "Rest of feed window",
      afterWindow: "After window closed",
      capturedInTopSlot: "Captured in top slot",
      stillSubscribed: "Still subscribed",
      costPerWindowJoin: "Cost per window join",
    },
  },

  login: {
    subtitle: "Sign in to your account.",
    continueWithTelegram: "Continue with Telegram",
    orContinueWithEmail: "or continue with email",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signUp: "Sign up",
  },

  loginTelegram: {
    subtitle: "Sign in with Telegram — no email needed.",
    step1Title: "1. Message our bot",
    step1Body: "It'll say hello and give you a sign-in code.",
    openTelegram: "Open Telegram & message @{botUsername}",
    step2Title: "2. Enter the code here",
    codePlaceholder: "8F4-K29",
    verifyButton: "Verify & continue",
    useEmailInstead: "← Use email instead",
  },

  onboarding: {
    titleFirst: "Connect your channel",
    titleAnother: "Connect another channel",
    subtitle: "Two quick steps so we know which Telegram channel is yours.",
    alreadyConnected: "Already connected:",
    backToDashboard: "← Back to dashboard",
    step1Title: "1. Message the bot to link your account",
    openTelegram: "Open Telegram & message @{botUsername}",
    step2Title: "2. Add the bot as admin to your channel",
    step2Body:
      "Channel settings → Administrators → Add Admin → @{botUsername}. We'll detect it automatically once both steps are done.",
    checkNow: "I've done both — check now",
    channelDetected: "Channel detected!",
    nameItLabel: "Name it something recognizable",
    confirmButton: "Confirm & continue",
  },

  dashboard: {
    welcomeBack: "Welcome back",
    guestFallback: "there",
    subtitle: "Which sources produce subscribers who stay, not just subscribers who join.",
    switchChannelNote:
      "Working with another channel? Switch which one is active from Profile. Content correlation, alerts, and agency views come in later phases, per the build order.",
  },

  dashboardBody: {
    failedToLoad: "Failed to load data: {error}",
    rightNow: "{channel}, right now",
    liveTotalsNote: "Live totals from Telegram — includes members from before tracking started.",
    totalMembers: "Total members",
    trackedJoinsAllTime: "Tracked joins (all-time)",
    activeCampaigns: "Active campaigns",
    botStatus: "Bot status",
    showing: "Showing {period}",
    activeSubscribers: "Active subscribers",
    joinedPeriod: "Joined ({period})",
    leftPeriod: "Left ({period})",
    netGrowthPeriod: "Net growth ({period})",
    growth: "Growth — {period}",
    sevenDayRetention: "7-day retention",
    joinsRetained: "{retained} of {eligible} joins retained",
    notEnoughJoins: "Not enough joins old enough to measure yet",
    campaignLinks: "Campaign links",
    campaignLinksNote: "Only these can attribute a join — a public channel link cannot.",
    fullMetrics: "Full metrics →",
  },

  periods: {
    today: "Today",
    yesterday: "Yesterday",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
  },

  campaignLinksTable: {
    campaign: "Campaign",
    inviteLink: "Invite link",
    joined: "Joined",
    active: "Active",
    status: "Status",
    noLinksYet: "No campaign links yet — create one on the Stats page to start attributing joins.",
  },

  placementFields: {
    postGoesLive: "Post goes live",
    topSlot: "Top slot",
    inFeed: "In feed",
    topOptions: {
      "15": "15 min",
      "30": "30 min",
      "60": "1 hour",
      "120": "2 hours",
      "180": "3 hours",
      "360": "6 hours",
      "720": "12 hours",
      "1440": "24 hours",
    },
    feedOptions: {
      "6": "6 hours",
      "12": "12 hours",
      "24": "24 hours",
      "48": "48 hours",
      "72": "3 days",
      "168": "1 week",
    },
  },

  placementPerformance: {
    empty:
      'No campaigns have a placement window set yet. Add one when creating or editing a campaign to see how a "1 hour top / 24 hour feed" buy actually performed.',
    running: "running",
    topSlotFirst: "Top slot (first {duration})",
    restOfFeed: "Rest of feed window",
    afterWindow: "After window closed",
    joinsInPaidWindow: "Joins in paid window",
    capturedInTopSlot: "Captured in top slot",
    stillSubscribed: "Still subscribed",
    costPerWindowJoin: "Cost per window join",
  },

  stats: {
    title: "Stats",
    subtitle: "{channel} — campaign performance, ranked by retention.",
    spendEfficiency: "Spend efficiency",
    spendEfficiencyNote: "Blended across campaigns that have an ad cost set.",
    totalAdSpend: "Total ad spend",
    cac: "CAC",
    perSubscriberAcquired: "per subscriber acquired",
    costPerRetained: "Cost per retained",
    perSubscriberStillHere: "per subscriber still here",
    costPerClick: "Cost per click",
    trackedClicksN: "{count} tracked clicks",
    noTrackedLinksYet: "no tracked links yet",
    paidVsOrganicJoins: "Paid vs organic joins",
    table: {
      campaign: "Campaign",
      source: "Source",
      adCost: "Ad cost",
      clicks: "Clicks",
      clickToJoin: "Click→Join",
      joined: "Joined",
      active: "Active",
      churn: "Churn",
      cac: "CAC",
      cpc: "CPC",
      costPerRet: "Cost/ret.",
      d1: "1d",
      d7: "7d",
      d30: "30d",
      d90: "90d",
      quality: "Quality",
      actions: "Actions",
    },
    quality: {
      high: "High",
      medium: "Medium",
      low: "Low",
      unknown: "—",
    },
    sourceOptions: {
      paid_ad: "Paid ad",
      influencer: "Influencer",
      organic: "Organic",
      cross_promo: "Cross-promo",
      other: "Other",
    },
    editForm: {
      campaignName: "Campaign name",
      source: "Source",
      adCost: "Ad cost",
      notSet: "not set",
      turnOnClickTracking: "Turn on click tracking",
      save: "Save",
      cancel: "Cancel",
    },
    row: {
      edit: "edit",
      pause: "pause",
      activate: "activate",
      archive: "archive",
    },
    noCampaignsYet: "No campaigns yet.",
    organicJoinsNote: "+ {count} organic joins with no invite link attached.",
    retentionNote:
      "Retention columns show the % of joins still subscribed after that many days, with the number of joins old enough to count in parentheses. CAC = ad cost ÷ joined.",
    placementPerformance: "Placement performance",
    placementPerformanceNote: "How joins landed across the paid window — was the top slot worth its premium?",
    newCampaign: "New campaign",
    newForm: {
      name: "Name",
      source: "Source",
      adCostOptional: "Ad cost (optional)",
      trackClicks: "Track clicks + subs on this link",
      submit: "Create + generate invite link",
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Bot connections and tracking setup for this account.",
    trackingStoppedOne: "Tracking has stopped for {channel}.",
    trackingStoppedMany: "Tracking has stopped for {count} channels.",
    trackingStoppedSuffix: "Re-add the bot as an admin to resume.",
    connectedChannels: "Connected channels",
    connectedChannelsNote:
      "Which channel the app is currently reporting on is chosen from the switcher in the sidebar.",
    botStatusLabel: {
      active: "active",
      removed: "removed",
      error: "error",
    },
    botStatusHint: {
      active: "Receiving join and leave events.",
      removed: "The bot is no longer an admin — tracking has stopped.",
      error: "Something went wrong with this connection.",
    },
    reconnect: "Reconnect",
    chatId: "Chat ID",
    trackingSince: "Tracking since",
    invitePermission: {
      title: "Can't create invite links yet.",
      body: 'The bot is an admin here, but wasn\'t given the "Invite Users via Link" right. Open this channel\'s Administrators list in Telegram, edit the bot\'s permissions, and turn that on — campaign creation will fail until it\'s enabled.',
    },
    howTrackingWorks: "How tracking works",
    howTrackingWorksList: [
      "Joins are only attributed to a campaign when someone uses that campaign's generated invite link. Joins from search or your public channel link count as organic.",
      "Tracking starts the moment the bot becomes an admin — history from before that can't be recovered.",
      'Retention shows "—" until joins are old enough for that window to have fully elapsed.',
    ],
  },

  profile: {
    title: "Profile",
    subtitle: "How you appear inside Foydami.",
    displayName: "Display name",
    photo: "Photo (PNG, JPEG, or WebP, under 5MB)",
    save: "Save",
    signedInWith: "Signed in with",
    signedInWithTelegram: "Telegram ({identity})",
    signedInWithEmail: "Email ({identity})",
    telegramNote: "Your Telegram account is tied to your login and can't be changed here.",
    emailNote: "Your email is tied to your login and can't be changed here.",
    signOut: "Sign out",
  },

  sidebar: {
    menu: "Menu",
    dashboard: "Dashboard",
    stats: "Stats",
    settings: "Settings",
    admin: "Admin",
    viewProfile: "View profile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    tracking: "Tracking",
    onlyOneChannel: "Only one channel connected.",
    connectAnother: "+ Connect another channel",
  },

  copyLinkButton: {
    copy: "Copy",
    copied: "Copied",
  },

  admin: {
    title: "Admin",
    subtitle: "Platform-wide usage across every account on Foydami.",
    tiles: {
      accounts: "Accounts",
      accountsHint: "+{count} in 7d",
      active7d: "Active (7d)",
      active7dHint: "signed in recently",
      channelsTracked: "Channels tracked",
      eventsIngested: "Events ingested",
      eventsIngestedHint: "joins + leaves, all time",
    },
    funnel: {
      title: "Activation funnel",
      subtitle: "Where accounts stop. Each step is a share of total signups.",
      signedUp: "Signed up",
      connectedChannel: "Connected a channel",
      createdCampaign: "Created a campaign",
      gotAttributedJoin: "Got an attributed join",
      footnote:
        "The last step is the one that proves the product worked — someone joined through a campaign link and got attributed.",
    },
    signups30d: "Signups — last 30 days",
    accountsTable: {
      title: "Accounts",
      subtitle:
        "Click an account with a connected channel to see their dashboard — the same growth, retention and campaign view they see themselves.",
      account: "Account",
      signedUp: "Signed up",
      lastSeen: "Last seen",
      channels: "Channels",
      campaigns: "Campaigns",
      joins: "Joins",
      attributed: "Attributed",
      lastEvent: "Last event",
      stage: "Stage",
      adminBadge: "admin",
      broken: "({count} broken)",
      noAccountsYet: "No accounts yet.",
    },
    stage: {
      signed_up: "Signed up",
      connected: "Connected channel",
      campaigning: "Running campaigns",
      attributing: "Getting attributed joins",
    },
    relativeTime: {
      never: "never",
      justNow: "just now",
      minutesAgo: "{n}m ago",
      hoursAgo: "{n}h ago",
      daysAgo: "{n}d ago",
    },
    accountPage: {
      backLink: "← Admin",
      viewingAsAdmin: "viewing as admin",
      accountFallback: "Account",
    },
  },

  errors: {
    linkInvalid: "This link is no longer valid.",
    campaign: {
      missingFields: "Missing or invalid campaign fields",
      channelNotFound: "Channel not found",
      nameEmpty: "Campaign name cannot be empty",
      invalidAdCost: "Ad cost must be a positive number",
    },
    profile: {
      badImageType: "Use a PNG, JPEG, or WebP image",
      imageTooLarge: "Image must be under 5MB",
    },
    telegramLogin: {
      invalidCode: "That code is invalid or has expired. Send /start login to the bot again.",
      generic: "Something went wrong signing you in. Please try again.",
    },
    auth: {
      confirmationExpired:
        "That confirmation link has expired or was already used. Sign in below, or sign up again to get a new one.",
      confirmationIncomplete: "That confirmation link is incomplete. Try signing in, or sign up again.",
      invalidCredentials: "Incorrect email or password.",
    },
    telegramApi: {
      noInvitePermission:
        'The bot doesn\'t have permission to create invite links for this channel. Open the channel\'s Administrators list, edit the bot\'s rights, and turn on "Invite Users via Link" — then try again.',
      chatNotFound: "This channel isn't reachable anymore — the bot may have been removed. Reconnect it from Settings.",
      rejected: "Telegram rejected this: {description}",
      unknown: "Something went wrong talking to Telegram. Try again in a moment.",
    },
  },

  signUpConfirmation: "Check your email — click the confirmation link and you'll be signed straight in.",
};

export default en;

// Deliberately NOT `typeof en` off an `as const` object — that would infer
// every value as its exact English string literal, which would then force
// uz.ts/ru.ts to contain the *same English text* to type-check. Widening
// every leaf to `string` (recursively, arrays included) keeps the one thing
// that actually matters: every locale must have the same set of keys.
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
