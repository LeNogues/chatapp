import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/Sidebar";
import ChatRoom from "./components/ChatRoom";
import WelcomeScreen from "./components/WelcomeScreen";
import "./styles/global.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getMe);
  const setDisplayName = useMutation(api.users.setDisplayName);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Applique le displayName en attente apres que l'auth soit completement etablie
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = sessionStorage.getItem("pendingDisplayName");
    if (pending) {
      sessionStorage.removeItem("pendingDisplayName");
      setDisplayName({ displayName: pending }).catch(console.error);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        currentUser={currentUser}
      />
      <main className="chat-main">
        {selectedRoom ? (
          <ChatRoom
            key={selectedRoom._id}
            room={selectedRoom}
            currentUser={currentUser}
          />
        ) : (
          <WelcomeScreen />
        )}
      </main>
    </div>
  );
}
