import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/Sidebar";
import ChatRoom from "./components/ChatRoom";
import WelcomeScreen from "./components/WelcomeScreen";
import "./styles/global.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getMe);
  const [selectedRoom, setSelectedRoom] = useState(null);

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
