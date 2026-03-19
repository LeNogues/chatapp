import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import CreateRoomModal from "./CreateRoomModal";
import FriendsPanel from "./FriendsPanel";

export default function Sidebar({ selectedRoom, onSelectRoom, currentUser }) {
  const { signOut } = useAuthActions();
  const rooms = useQuery(api.rooms.getMyRooms) ?? [];
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  return (
    <div className="sidebar">
      {/* Header utilisateur */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="user-avatar">{(currentUser?.displayName?.[0] ?? "?").toUpperCase()}</div>
          <span className="user-name">{currentUser?.displayName ?? "..."}</span>
        </div>
        <button className="btn-icon" title="Déconnexion" onClick={() => signOut()}>⏻</button>
      </div>

      {/* Boutons d'action */}
      <div className="sidebar-actions">
        <button className="sidebar-btn" onClick={() => { setShowFriends(true); setShowCreateRoom(false); }}>
          👥 Amis
        </button>
        <button className="sidebar-btn" onClick={() => { setShowCreateRoom(true); setShowFriends(false); }}>
          + Créer une room
        </button>
      </div>

      {/* Liste des rooms */}
      <div className="sidebar-section-title">Mes rooms</div>
      <div className="room-list">
        {rooms.length === 0 && (
          <div className="room-empty">Aucune room — créez-en une !</div>
        )}
        {rooms.map((room) => (
          <div
            key={room._id}
            className={`room-item${selectedRoom?._id === room._id ? " active" : ""}`}
            onClick={() => { onSelectRoom(room); setShowFriends(false); setShowCreateRoom(false); }}
          >
            <span className="room-hash">#</span>
            <span className="room-name">{room.name}</span>
          </div>
        ))}
      </div>

      {/* Modals / Panels */}
      {showCreateRoom && (
        <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
      )}
      {showFriends && (
        <FriendsPanel onClose={() => setShowFriends(false)} />
      )}
    </div>
  );
}
