import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreHorizontal, Pin } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const getRelativeTime = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

const rowStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 12px',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--pulse-border)',
  cursor: 'pointer',
  textAlign: 'left',
}

const HistoryRow = ({ entry, onLoad }) => {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [isRenaming,  setIsRenaming]  = useState(false)
  const [renameValue, setRenameValue] = useState(entry.title)
  const [hovered,     setHovered]     = useState(false)
  const menuRef = useRef(null)

  const renameChatEntry  = useAppStore((s) => s.renameChatEntry)
  const pinChatEntry     = useAppStore((s) => s.pinChatEntry)
  const deleteChatEntry  = useAppStore((s) => s.deleteChatEntry)

  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed) renameChatEntry(entry.id, trimmed)
    else setRenameValue(entry.title)
    setIsRenaming(false)
  }

  const handleMenuAction = (action, e) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (action === 'rename') {
      setRenameValue(entry.title)
      setIsRenaming(true)
    } else if (action === 'pin') {
      pinChatEntry(entry.id)
    } else if (action === 'delete') {
      deleteChatEntry(entry.id)
    }
  }

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ background: hovered ? 'var(--pulse-surface-raised)' : 'transparent' }}
      transition={{ duration: 0.2 }}
      style={rowStyle}
    >
      {/* Pin icon badge */}
      {entry.pinned && (
        <Pin size={9} color="var(--pulse-accent-blue)" style={{ flexShrink: 0 }} />
      )}

      {/* Title / rename input */}
      <div
        style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => !isRenaming && onLoad(entry)}
      >
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            maxLength={80}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setRenameValue(entry.title); setIsRenaming(false) }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--pulse-surface-raised)',
              border: '1px solid var(--pulse-accent-blue)',
              outline: 'none',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: 'var(--pulse-text-primary)',
              padding: '2px 4px',
              letterSpacing: '0.04em',
            }}
          />
        ) : (
          <>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: 'var(--pulse-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
              }}
            >
              {entry.title}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: 'var(--pulse-text-dim)',
                letterSpacing: '0.06em',
                marginTop: 2,
              }}
            >
              {getRelativeTime(entry.timestamp)}
            </div>
          </>
        )}
      </div>

      {/* Three-dot menu button — appears on hover */}
      <AnimatePresence>
        {hovered && !isRenaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'relative', flexShrink: 0 }}
            ref={menuRef}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
              aria-label="Conversation options"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                color: 'var(--pulse-text-dim)',
              }}
            >
              <MoreHorizontal size={13} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    zIndex: 20,
                    background: 'var(--pulse-surface-raised)',
                    border: '1px solid var(--pulse-border)',
                    minWidth: 120,
                  }}
                >
                  {[
                    { id: 'rename', label: 'RENAME' },
                    { id: 'pin',    label: entry.pinned ? 'UNPIN' : 'PIN' },
                    { id: 'delete', label: 'DELETE', danger: true },
                  ].map(({ id, label, danger }) => (
                    <button
                      key={id}
                      onClick={(e) => handleMenuAction(id, e)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '7px 12px',
                        background: 'none',
                        border: 'none',
                        borderBottom: id !== 'delete' ? '1px solid var(--pulse-border)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: danger ? '#EF4444' : 'var(--pulse-text-primary)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const ChatHistory = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const chatHistory   = useAppStore((s) => s.chatHistory)
  const setActiveChat = useAppStore((s) => s.setActiveChat)
  const setAiResponse = useAppStore((s) => s.setAiResponse)

  const loadConversation = (entry) => {
    setActiveChat(entry.messages)
    const lastAssistant = [...entry.messages].reverse().find((m) => m.role === 'assistant')
    if (lastAssistant) {
      setAiResponse({
        answer:     lastAssistant.content,
        confidence: lastAssistant.confidence ?? 50,
        citations:  lastAssistant.citations  ?? [],
        followUps:  lastAssistant.followUps  ?? [],
      })
    }
    onClose()
  }

  const query   = searchQuery.toLowerCase()
  const pinned  = chatHistory.filter((e) => e.pinned && (!query || e.title.toLowerCase().includes(query)))
  const unpinned = chatHistory.filter((e) => !e.pinned && (!query || e.title.toLowerCase().includes(query)))
  const displayed = [...pinned, ...unpinned]

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } }}
      exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--pulse-surface)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          borderBottom: '1px solid var(--pulse-border)',
          flexShrink: 0,
          gap: 8,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back to conversation"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-dim)', padding: 0, display: 'flex',
          }}
        >
          <ArrowLeft size={13} />
        </button>
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
          }}
        >
          CHAT HISTORY
        </span>
        {/* spacer to center the title */}
        <span style={{ width: 13 }} />
      </div>

      {/* Search bar */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--pulse-border)',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          aria-label="Search chat history"
          style={{
            width: '100%',
            background: 'var(--pulse-surface-raised)',
            border: '1px solid var(--pulse-border)',
            outline: 'none',
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'var(--pulse-text-primary)',
            padding: '6px 10px',
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayed.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: 'var(--pulse-text-dim)',
              textAlign: 'center',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {searchQuery ? 'NO RESULTS' : 'NO CHAT HISTORY'}
          </div>
        ) : (
          displayed.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} onLoad={loadConversation} />
          ))
        )}
      </div>
    </motion.div>
  )
}

export default ChatHistory
