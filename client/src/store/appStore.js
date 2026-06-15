import { create } from 'zustand'

const useAppStore = create((set) => ({
  // Data
  trendData: [],
  lastUpdated: null,
  activeRegion: null,
  trendSnapshots: [],           // [{ timestamp: ISO8601, data: [...] }] max 288

  // Source controls
  activeSources: ['google', 'youtube', 'reddit', 'gdelt', 'twitter', 'tiktok', 'instagram'],
  dataSourceArcs: {
    google:    true,
    youtube:   true,
    reddit:    false,
    gdelt:     false,
    twitter:   false,
    tiktok:    false,
    instagram: false,
  },
  dataDensity: 50,

  // Time
  timeRange: '24h',
  scrubberProgress: 100,        // 0–100, 100 = LIVE
  scrubberRange: '24h',         // '1h' | '6h' | '12h' | '24h'

  // Map
  mapStyle: 'dark',
  is3DMode: false,
  compassHeading: 0,
  compassTilt: 0,
  activeGranularity: 'country',

  // Search + Tags
  searchHistory: [],
  activeTags: [],               // [{ id, type, label, color, saved, active }]

  // AI Panel
  isAIPanelOpen: false,
  aiResponse: null,

  // Pin Detail
  isPinDetailOpen: false,
  activePinDetail: null,

  // Saved Articles
  savedArticles: [],            // [{ ...data, savedAt: ISO8601 }]

  // Chat
  isChatPanelOpen: false,
  activeChat: null,
  chatHistory: [],

  // App loading
  isAppLoading: true,
  loadingMessage: 'PULSING...',

  // Map interaction
  selectedPin: null,
  openPanel: null,              // 'dataSources' | 'mapStyle' | 'compass' | null

  // Setters — Data
  setTrendData: (data) => set({ trendData: data }),
  setLastUpdated: (ts) => set({ lastUpdated: ts }),
  setActiveRegion: (region) => set({ activeRegion: region }),
  setTrendSnapshots: (snapshots) => set({ trendSnapshots: snapshots }),
  addTrendSnapshot: (snapshot) =>
    set((state) => ({
      trendSnapshots: [...state.trendSnapshots.slice(-287), snapshot],
    })),

  // Setters — Source Controls
  setActiveSources: (sources) => set({ activeSources: sources }),
  setDataSourceArcs: (arcs) => set({ dataSourceArcs: arcs }),
  setDataDensity: (density) => set({ dataDensity: density }),

  // Setters — Time
  setTimeRange: (range) => set({ timeRange: range }),
  setScrubberProgress: (progress) => set({ scrubberProgress: progress }),
  setScrubberRange: (range) => set({ scrubberRange: range }),

  // Setters — Map
  setMapStyle: (style) => set({ mapStyle: style }),
  setIs3DMode: (val) => set({ is3DMode: val }),
  setCompassHeading: (heading) => set({ compassHeading: heading }),
  setCompassTilt: (tilt) => set({ compassTilt: tilt }),
  setActiveGranularity: (g) => set({ activeGranularity: g }),

  // Setters — Search + Tags
  setSearchHistory: (history) => set({ searchHistory: history }),
  setActiveTags: (tags) => set({ activeTags: tags }),
  addActiveTag: (tag) =>
    set((state) => ({
      activeTags: state.activeTags.some((t) => t.label === tag.label)
        ? state.activeTags
        : [...state.activeTags, tag],
    })),
  removeActiveTag: (id) =>
    set((state) => ({
      activeTags: state.activeTags.filter((t) => t.id !== id),
    })),
  updateActiveTag: (id, updates) =>
    set((state) => ({
      activeTags: state.activeTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  // Setters — AI Panel
  setIsAIPanelOpen: (val) => set({ isAIPanelOpen: val }),
  setAiResponse: (response) => set({ aiResponse: response }),

  // Setters — Pin Detail
  setIsPinDetailOpen: (val) => set({ isPinDetailOpen: val }),
  setActivePinDetail: (pin) => set({ activePinDetail: pin }),

  // Setters — Saved Articles
  setSavedArticles: (articles) => set({ savedArticles: articles }),
  addSavedArticle: (article) =>
    set((state) => ({
      savedArticles: state.savedArticles.some((a) => a.id === article.id)
        ? state.savedArticles
        : [...state.savedArticles, { ...article, savedAt: new Date().toISOString() }],
    })),
  removeSavedArticle: (id) =>
    set((state) => ({
      savedArticles: state.savedArticles.filter((a) => a.id !== id),
    })),

  // Setters — Chat
  setIsChatPanelOpen: (val) => set({ isChatPanelOpen: val }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setChatHistory: (history) => set({ chatHistory: history }),
  addMessageToActiveChat: (message) =>
    set((state) => ({
      activeChat: Array.isArray(state.activeChat)
        ? [...state.activeChat, message]
        : [message],
    })),
  addChatToHistory: () =>
    set((state) => {
      if (!Array.isArray(state.activeChat) || state.activeChat.length === 0) return {}
      const firstUser = state.activeChat.find((m) => m.role === 'user')
      const title = firstUser?.content?.slice(0, 60) || 'Conversation'
      const entry = {
        id: Date.now().toString(),
        title,
        messages: state.activeChat,
        timestamp: new Date().toISOString(),
        pinned: false,
      }
      return {
        chatHistory: [entry, ...state.chatHistory],
        activeChat: [],
      }
    }),
  renameChatEntry: (id, title) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((e) => e.id === id ? { ...e, title } : e),
    })),
  pinChatEntry: (id) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((e) => e.id === id ? { ...e, pinned: !e.pinned } : e),
    })),
  deleteChatEntry: (id) =>
    set((state) => ({
      chatHistory: state.chatHistory.filter((e) => e.id !== id),
    })),

  // Setters — Map Interaction
  setSelectedPin: (pin) => set({ selectedPin: pin }),
  setOpenPanel: (panel) => set({ openPanel: panel }),

  // Setters — App Loading
  setIsAppLoading: (val) => set({ isAppLoading: val }),
  setLoadingMessage: (msg) => set({ loadingMessage: msg }),
}))

export default useAppStore
