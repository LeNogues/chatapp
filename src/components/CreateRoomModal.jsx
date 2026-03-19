import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function CreateRoomModal({ onClose }) {
  const createRoom = useMutation(api.rooms.createRoom);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createRoom({ name: name.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer une room</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Nom de la room</label>
            <input
              type="text"
              placeholder="ex: général, gaming, musique..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={32}
            />
          </div>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? "..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
