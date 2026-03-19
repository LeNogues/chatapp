import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import InviteModal from "./InviteModal";

export default function ChatRoom({ room, currentUser, onBack }) {
  const messages = useQuery(api.messages.getMessages, { roomId: room._id }) ?? [];
  const members = useQuery(api.rooms.getRoomMembers, { roomId: room._id }) ?? [];
  const sendMessage = useMutation(api.messages.sendMessage);
  const leaveRoom = useMutation(api.rooms.leaveRoom);

  const [input, setInput] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ roomId: room._id, content: input });
    setInput("");
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  // Grouper les messages par date
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString();
    if (date !== lastDate) {
      grouped.push({ type: "date", label: formatDate(msg.createdAt) });
      lastDate = date;
    }
    grouped.push({ type: "msg", msg });
  }

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="btn-back-mobile" onClick={onBack} title="Retour">‹</button>
          <span className="chat-room-hash">#</span>
          <span className="chat-room-title">{room.name}</span>
          <span className="chat-member-count">{members.length} membre{members.length > 1 ? "s" : ""}</span>
        </div>
        <div className="chat-header-right">
          <button className="btn-secondary" onClick={() => setShowInvite(true)}>
            + Inviter
          </button>
          <button className="btn-danger-sm" onClick={() => leaveRoom({ roomId: room._id })} title="Quitter la room">
            Quitter
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {grouped.length === 0 && (
          <div className="messages-empty">
            Aucun message — soyez le premier à écrire !
          </div>
        )}
        {grouped.map((item, i) =>
          item.type === "date" ? (
            <div key={i} className="date-separator">
              <span>{item.label}</span>
            </div>
          ) : (
            <MessageBubble
              key={item.msg._id}
              msg={item.msg}
              isMe={item.msg.userId === currentUser?._id}
              time={formatTime(item.msg.createdAt)}
            />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="chat-input"
          type="text"
          placeholder={`Écrire dans #${room.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button className="chat-send-btn" type="submit" disabled={!input.trim()}>
          Envoyer
        </button>
      </form>

      {showInvite && (
        <InviteModal room={room} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}

function MessageBubble({ msg, isMe, time }) {
  return (
    <div className={`message-row${isMe ? " me" : ""}`}>
      {!isMe && (
        <div className="message-avatar">{msg.displayName[0]?.toUpperCase()}</div>
      )}
      <div className="message-content">
        {!isMe && <div className="message-author">{msg.displayName}</div>}
        <div className="message-bubble">
          <span className="message-text">{msg.content}</span>
          <span className="message-time">{time}</span>
        </div>
      </div>
    </div>
  );
}
