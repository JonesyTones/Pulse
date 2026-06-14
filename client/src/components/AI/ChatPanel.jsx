import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, History, PlusCircle, Send, Loader2, MessageSquare } from 'lucide-react'
import DOMPurify from 'dompurify'
import useAppStore from '../../store/appStore.js'
import useAIQuery from '../../hooks/useAIQuery.js'
import CollapsibleSection from './CollapsibleSection.jsx'
import ChatHistory from './ChatHistory.jsx'

const MAX_LENGTH = 500

const getRelativeTime = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

// Shared rotated label used in both collapsed tab states
const CollapsedTabLabel = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transform: 'rotate(90deg)',
      transformOrigin: 'center',
      whiteSpace: 'nowrap',
    }}
  >
    <MessageSquare size={12} color="var(--pulse-text-secondary)" aria-hidden />
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--pulse-text-secondary)',
      }}
    >
      CHAT
    </span>
  </div>
)

const ChatPanel = () => {
  const [inputValue,  setInputValue]  = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const scrollRef = useRef(null)

  const isAIPanelOpen      = useAppStore((s) => s.isAIPanelOpen)
  const isChatPanelOpen    = useAppStore((s) => s.isChatPanelOpen)
  const setIsChatPanelOpen = useAppStore((s) => s.setIsChatPanelOpen)
  const activeChat         = useAppStore((s) => s.activeChat)
  const aiResponse       = useAppStore((s) => s.aiResponse)
  const setAiResponse    = useAppStore((s) => s.setAiResponse)
  const addChatToHistory = useAppStore((s) => s.addChatToHistory)

  const { submit, isLoading } = useAIQuery()

  const messages = Array.isArray(activeChat) ? activeChat : []
  const title    = messages.find((m) => m.role === 'user')?.content?.slice(0, 30) || 'PULSE INTELLIGENCE'

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isCollapsed])

  const handleNewChat = () => {
    addChatToHistory()
    setAiResponse(null)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const clean = DOMPurify.sanitize(inputValue).trim()
    if (!clean || isLoading) return
    submit(clean)
    setInputValue('')
  }

  const handleChipClick = (query) => submit(query)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  const followUps = aiResponse?.followUps ?? []

  // Full panel shows only when a conversation is active AND not manually minimized
  const showFullPanel = isChatPanelOpen && !isCollapsed

  // STATE 1: AIPanel open — tab on left edge of AIPanel, near bottom
  const tabStateOneStyle = {
    position: 'fixed',
    right: 440,
    bottom: 0,
    width: 32,
    height: 120,
    background: 'var(--pulse-surface)',
    borderLeft: '1px solid var(--pulse-border)',
    borderTop: '1px solid var(--pulse-border)',
    borderBottom: 'none',
    borderRight: 'none',
    borderRadius: '4px 0 0 0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70,
    padding: 0,
    overflow: 'hidden',
  }

  // STATE 2: CollapsedAIPanel showing — tab stacks directly below it on right edge
  // CollapsedAIPanel: top: 50%, height: 160px, transform: translateY(-50%)
  // Its visual bottom edge is at calc(50% + 80px)
  const tabStateTwoStyle = {
    position: 'fixed',
    right: 0,
    top: 'calc(50% + 160px + 8px)',
    width: 32,
    height: 120,
    background: 'var(--pulse-surface)',
    borderLeft: '1px solid var(--pulse-border)',
    borderTop: '1px solid var(--pulse-border)',
    borderBottom: '1px solid var(--pulse-border)',
    borderRight: 'none',
    borderRadius: '4px 0 0 4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 0,
    overflow: 'hidden',
  }

  return (
    /*
     * initial={false} — tab renders immediately on page load with no entrance animation.
     * mode="wait" — tab exits before full panel enters (and vice versa).
     */
    <AnimatePresence initial={false} mode="wait">
      {showFullPanel ? (
          /* ── Full chat panel ── */
          <motion.div
            key="chat-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              height: showHistory ? '75vh' : 320,
              transition: { type: 'spring', damping: 30, stiffness: 300 },
            }}
            exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
            style={{
              position: 'fixed',
              bottom: 0,
              right: 440,
              width: 'min(520px, calc(100vw - 440px - 16px))',
              background: 'var(--pulse-surface)',
              border: '1px solid var(--pulse-border)',
              borderBottom: 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 10px',
                height: 40,
                borderBottom: '1px solid var(--pulse-border)',
                flexShrink: 0,
              }}
            >
              {/* Title — click to minimize to tab */}
              <button
                onClick={() => setIsCollapsed(true)}
                aria-label="Minimize chat panel"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--pulse-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {title}
                </span>
                <ChevronDown size={12} style={{ color: 'var(--pulse-text-dim)', flexShrink: 0 }} />
              </button>

              {/* History button */}
              <button
                onClick={() => setShowHistory(true)}
                aria-label="Chat history"
                title="Chat history"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', color: 'var(--pulse-text-dim)', padding: 4,
                  opacity: 0.6, transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
              >
                <History size={13} />
              </button>

              {/* New Chat button */}
              <button
                onClick={handleNewChat}
                aria-label="Start new chat"
                title="New chat"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', color: 'var(--pulse-text-dim)', padding: 4,
                  opacity: 0.6, transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
              >
                <PlusCircle size={13} />
              </button>

              {/* Minimize to tab — does NOT close the panel */}
              <button
                onClick={() => setIsCollapsed(true)}
                aria-label="Minimize chat panel"
                title="Minimize"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', color: 'var(--pulse-text-dim)', padding: 4,
                  opacity: 0.5, transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Conversation area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: 'var(--pulse-text-dim)',
                    textAlign: 'center',
                    paddingTop: 16,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  ASK PULSE A QUESTION TO BEGIN
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '6px 10px',
                      background: msg.isError
                        ? 'rgba(239,68,68,0.1)'
                        : msg.role === 'user'
                          ? 'rgba(59,130,246,0.15)'
                          : 'var(--pulse-surface-raised)',
                      border: `1px solid ${msg.isError ? '#EF4444' : msg.role === 'user' ? '#3B82F6' : 'var(--pulse-border)'}`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        color: msg.isError ? '#EF4444' : 'var(--pulse-text-primary)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {msg.content}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 8,
                        color: 'var(--pulse-text-dim)',
                        marginTop: 3,
                        marginBottom: 0,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {getRelativeTime(msg.timestamp)}
                      {msg.role === 'assistant' && msg.confidence != null && !msg.isError && (
                        <span style={{ marginLeft: 6 }}>{msg.confidence}% CONFIDENCE</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '6px 10px',
                      background: 'var(--pulse-surface-raised)',
                      border: '1px solid var(--pulse-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Loader2 size={10} color="var(--pulse-accent-blue)" className="animate-spin" />
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        color: 'var(--pulse-text-dim)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ANALYZING...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested queries */}
            {followUps.length > 0 && (
              <div style={{ borderTop: '1px solid var(--pulse-border)', flexShrink: 0 }}>
                <CollapsibleSection title="SUGGESTED QUERIES" defaultOpen={true}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {followUps.map((q, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ background: 'var(--pulse-surface-raised)', borderColor: '#3B82F6', color: 'var(--pulse-text-primary)' }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleChipClick(q)}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          background: 'var(--pulse-surface)',
                          border: 'none',
                          borderBottom: i < followUps.length - 1 ? '1px solid var(--pulse-border)' : 'none',
                          cursor: isLoading ? 'default' : 'pointer',
                          textAlign: 'left',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 9,
                          color: 'var(--pulse-text-dim)',
                          letterSpacing: '0.04em',
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderTop: '1px solid var(--pulse-border)',
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, MAX_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder="FOLLOW UP..."
                disabled={isLoading}
                aria-label="Follow-up question"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: 'var(--pulse-text-primary)',
                }}
              />
              <motion.button
                type="submit"
                aria-label="Send follow-up"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--pulse-border)',
                  padding: '4px 8px',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--pulse-text-secondary)',
                  opacity: inputValue.trim() && !isLoading ? 1 : 0.4,
                  flexShrink: 0,
                }}
                whileHover={inputValue.trim() && !isLoading ? { background: '#3B82F6', color: '#ffffff', borderColor: '#3B82F6' } : {}}
                whileTap={inputValue.trim() && !isLoading ? { scale: 0.95 } : {}}
                transition={{ duration: 0.2 }}
              >
                {isLoading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Send size={11} />
                }
              </motion.button>
            </form>

            {/* ChatHistory absolute overlay */}
            <AnimatePresence>
              {showHistory && (
                <ChatHistory key="chat-history" onClose={() => setShowHistory(false)} />
              )}
            </AnimatePresence>
          </motion.div>
      ) : (
        /* ── Collapsed tab (two positional states based on isAIPanelOpen) ── */
        <motion.button
          key="chat-tab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          whileHover={{ borderColor: 'var(--pulse-accent-blue)' }}
          onClick={() => { setIsChatPanelOpen(true); setIsCollapsed(false) }}
          aria-label="Expand chat panel"
          style={isAIPanelOpen ? tabStateOneStyle : tabStateTwoStyle}
        >
          <CollapsedTabLabel />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ChatPanel
