import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function InviteModal({ room, onClose }) {
  const friends = useQuery(api.friends.getMyFriends) ?? [];
  const members = useQuery(api.rooms.getRoomMembers, { roomId: room._id }) ?? [];
  const inviteFriend = useMutation(api.rooms.inviteFriendToRoom);
  const [error, setError] = useState("");
  const [invited, setInvited] = useState([]);

  const memberIds = new Set(members.map((m) => m._id));

  const handleInvite = async (friendId) => {
    setError("");
    try {
      await inviteFriend({ roomId: room._id, friendId });
      setInvited((prev) => [...prev, friendId]);
    } catch (err) {
      setError(err.message);
    }
  };

  const availableFriends = friends.filter((f) => !memberIds.has(f._id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Inviter dans #{room.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {availableFriends.length === 0 && (
            <div className="modal-empty">
              Tous vos amis sont déjà dans cette room, ou vous n'avez pas encore d'amis.
            </div>
          )}
          {availableFriends.map((friend) => (
            <div key={friend._id} className="friend-row">
              <div className="friend-avatar">{friend.displayName[0]?.toUpperCase()}</div>
              <div className="friend-info">
                <span className="friend-name">{friend.displayName}</span>
                <span className="friend-email">{friend.email}</span>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={() => handleInvite(friend._id)}
                disabled={invited.includes(friend._id)}
              >
                {invited.includes(friend._id) ? "✓ Invité" : "Inviter"}
              </button>
            </div>
          ))}
          {error && <div className="modal-error">{error}</div>}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
