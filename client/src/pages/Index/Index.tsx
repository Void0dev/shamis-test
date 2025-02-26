import { Page } from "@/components/Page";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "@/stores/authStore";
import { gameStore } from "@/stores/gameStore";

export default observer(function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has an active room when authenticated
    const checkRoom = async () => {
      if (authStore.isAuthenticated) {
        setLoading(true);
        const roomStatus = await gameStore.checkActiveRoom();
        setLoading(false);

        // If user has an active room, redirect to it
        if (roomStatus?.hasRoom && roomStatus.roomId) {
          navigate(`/room/${roomStatus.roomId}`);
        } else {
          // If no active room, load empty rooms
          gameStore.getEmptyRooms();
        }
      }
    };

    checkRoom();
  }, [authStore.isAuthenticated, navigate]);

  // Poll for empty rooms every 3 seconds
  useEffect(() => {
    let intervalId: number;

    if (authStore.isAuthenticated && !gameStore.hasActiveRoom) {
      // Initial fetch
      gameStore.getEmptyRooms();

      // Set up polling
      intervalId = window.setInterval(() => {
        if (!gameStore.isLoading) {
          gameStore.getEmptyRooms();
        }
      }, 3000);
    }

    // Clean up interval on unmount or when user joins a room
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authStore.isAuthenticated, gameStore.hasActiveRoom]);

    
  const handleCreateRoom = async () => {
    setLoading(true);
    const room = await gameStore.createRoom();
    setLoading(false);

    if (room) {
      navigate(`/room/${room.id}`);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    setLoading(true);
    const room = await gameStore.joinRoom(roomId);
    setLoading(false);

    if (room) {
      navigate(`/room/${room.id}`);
    }
  };

  return (
    <Page back={false} className="relative pt-6">
      {authStore.isAuthenticated ? (
        <div className="container mx-auto p-4">
          <div className="rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Card Game</h1>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Create a New Room</h2>
                  <button
                    onClick={handleCreateRoom}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Create Room
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Join Existing Room</h2>
                  {gameStore.emptyRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gameStore.emptyRooms.map(room => (
                        <div key={room.id} className="border rounded p-4 hover:bg-gray-50">
                          <p className="mb-2">Room #{room.id}</p>
                          <p className="mb-2">Trump: {room.trump}</p>
                          <button
                            onClick={() => handleJoinRoom(room.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No empty rooms available</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          Loading...
        </div>
      )}
    </Page>
  );
});
