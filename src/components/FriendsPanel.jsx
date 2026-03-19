import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function FriendsPanel({ onClose }) {
  const friends = useQuery(api.friends.getMyFriends) ?? [];
  const pending = useQuery(api.friends.getPendingRequests) ?? [];
  const sendRequest = useMutation(api.friends.sendRequest);
  const respondRequest = useMutation(api.friends.respondRequest);
  const searchUser = useQuery(
    api.users.searchByEmail,
    { email: "" } // placeholder — on fait la vraie recherche via state
  );

  const [tab, setTab] = useState("friends"); // "friends" | "add" | "requests"
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pour la recherche on utilise useQuery dynamiquement
  const searchResultQuery = useQuery(
    api.users.searchByEmail,
    tab === "add" && searchEmail.includes("@") ? { email: searchEmail } : "skip"
  );

  const handleSendRequest = async () => {
    if (!searchResultQuery) return;
    setError("");
    setSuccess("");
    try {
      await sendRequest({ toId: searchResultQuery._id });
      setSuccess("Demande envoyée !");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👥 Amis</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="friends-tabs">
          <button className={tab === "friends" ? "ftab active" : "ftab"} onClick={() => setTab("friends")}>
            Amis ({friends.length})
          </button>
          <button className={tab === "requests" ? "ftab active" : "ftab"} onClick={() => setTab("requests")}>
            Demandes {pending.length > 0 && <span className="badge">{pending.length}</span>}
          </button>
          <button className={tab === "add" ? "ftab active" : "ftab"} onClick={() => setTab("add")}>
            + Ajouter
          </button>
        </div>

        <div className="modal-body">
          {/* Onglet amis */}
          {tab === "friends" && (
            <>
              {friends.length === 0 && <div className="modal-empty">Aucun ami pour l'instant.</div>}
              {friends.map((f) => (
                <div key={f._id} className="friend-row">
                  <div className="friend-avatar online">{f.displayName[0]?.toUpperCase()}</div>
                  <div className="friend-info">
                    <span className="friend-name">{f.displayName}</span>
                    <span className="friend-email">{f.email}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Onglet demandes en attente */}
          {tab === "requests" && (
            <>
              {pending.length === 0 && <div className="modal-empty">Aucune demande en attente.</div>}
              {pending.map((req) => (
                <div key={req.requestId} className="friend-row">
                  <div className="friend-avatar">{req.displayName[0]?.toUpperCase()}</div>
                  <div className="friend-info">
                    <span className="friend-name">{req.displayName}</span>
                    <span className="friend-email">{req.email}</span>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => respondRequest({ requestId: req.requestId, accept: true })}
                    >
                      ✓
                    </button>
                    <button
                      className="btn-danger-sm"
                      onClick={() => respondRequest({ requestId: req.requestId, accept: false })}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Onglet ajouter un ami */}
          {tab === "add" && (
            <div className="add-friend-form">
              <label>Rechercher par email</label>
              <input
                type="email"
                placeholder="ami@email.com"
                value={searchEmail}
                onChange={(e) => { setSearchEmail(e.target.value); setError(""); setSuccess(""); }}
                autoFocus
              />
              {searchEmail.includes("@") && searchResultQuery === null && (
                <div className="modal-empty">Aucun utilisateur trouvé.</div>
              )}
              {searchResultQuery && (
                <div className="friend-row search-result">
                  <div className="friend-avatar">{searchResultQuery.displayName[0]?.toUpperCase()}</div>
                  <div className="friend-info">
                    <span className="friend-name">{searchResultQuery.displayName}</span>
                    <span className="friend-email">{searchResultQuery.email}</span>
                  </div>
                  <button className="btn-primary btn-sm" onClick={handleSendRequest}>
                    Ajouter
                  </button>
                </div>
              )}
              {error && <div className="modal-error">{error}</div>}
              {success && <div className="modal-success">{success}</div>}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
