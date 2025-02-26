import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { gameStore } from '../../stores/gameStore';

const Room: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roomId = parseInt(id || '0', 10);

  useEffect(() => {
    // Initial room load
    const loadRoom = async () => {
      if (!roomId) return;
      
      try {
        await gameStore.getRoom(parseInt(roomId, 10));
      } catch (error) {
        console.error('Failed to load room:', error);
        navigate('/');
      }
    };
    
    loadRoom();
    
    // Set up polling interval to check for room updates
    const intervalId = setInterval(() => {
      if (roomId) {
        gameStore.getRoom(parseInt(roomId, 10))
          .catch(error => {
            console.error('Failed to update room:', error);
            // If room no longer exists, redirect to home
            if (error.message?.includes('not found')) {
              navigate('/');
            }
          });
      }
    }, 3000); // Poll every 3 seconds
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [roomId, navigate]);

  // Poll for empty rooms every 3 seconds


  const currentRoom = gameStore.currentRoom;
  if (!currentRoom) return null;

  const isMyTurn = gameStore.isMyTurn;
  const myHand = gameStore.myHand;
  const opponentHand = gameStore.opponentHand;
  const isAttackingMode = currentRoom.unbittenCards.length === 0;

  const handleMakeMove = (card: string) => {
    gameStore.makeMove(card);
  };

  const handleFinishMove = () => {
    gameStore.finishMove();
  };

  if (gameStore.isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!gameStore.currentRoom) {
    return <div className="flex justify-center items-center h-screen">Room not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Game Room #{currentRoom.id}</h1>
          <div>
            <span className="mr-4">Trump: {currentRoom.trump}</span>
            <button 
              onClick={() => gameStore.leaveRoom().then(result => result?.success && navigate('/'))}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Game status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="text-lg">
            {isMyTurn ? "It's your turn" : "Waiting for opponent's move"}
          </p>
          <p>
            {currentRoom.finished ? "Game is finished" : "Game in progress"}
          </p>
        </div>

        {/* Game status section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Game Status</h2>
          <div className="p-4 bg-gray-100 rounded">
            <p className="mb-2">
              <span className="font-semibold">Room ID:</span> {currentRoom.id}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Current Turn:</span>{' '}
              {isMyTurn ? (
                <span className="text-green-600 font-bold">Your Turn</span>
              ) : (
                <span className="text-red-600">Opponent's Turn</span>
              )}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Game Mode:</span>{' '}
              {isMyTurn ? (
                isAttackingMode ? (
                  <span className="text-blue-600">You are attacking</span>
                ) : (
                  <span className="text-orange-600">You are defending</span>
                )
              ) : (
                isAttackingMode ? (
                  <span className="text-orange-600">Opponent is attacking</span>
                ) : (
                  <span className="text-blue-600">Opponent is defending</span>
                )
              )}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Cards in deck:</span> {currentRoom.remainingCards.length}
            </p>
          </div>
        </div>

        {/* Trump suit */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Trump Suit</h2>
          <div className="p-4 bg-yellow-100 rounded">
            <span className="text-2xl font-bold">{currentRoom.trump}</span>
          </div>
        </div>

        {/* Table cards */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cards on table</h2>
          <div className="flex flex-wrap gap-2 p-4 bg-green-100 min-h-20 rounded">
            {currentRoom.tableCards.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-2 w-full">
                  {currentRoom.tableCards.map((card, index) => (
                    <div 
                      key={index} 
                      className={`card-display p-2 rounded shadow ${
                        currentRoom.unbittenCards.includes(card) ? 'bg-red-200' : 'bg-green-200'
                      }`}
                    >
                      {card}
                      {currentRoom.unbittenCards.includes(card) && 
                        <span className="ml-1 text-xs">(Unbitten)</span>
                      }
                    </div>
                  ))}
                </div>
                {isMyTurn && (
                  <div className="w-full mt-2">
                    <button 
                      onClick={handleFinishMove}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      {currentRoom.unbittenCards.length > 0 ? "Take Cards" : "Finish Move"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No cards on table</p>
            )}
          </div>
        </div>

        {/* Opponent's hand (number of cards only) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Opponent's hand</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: opponentHand.length }).map((_, index) => (
              <div key={index} className="card-back w-10 h-16 bg-blue-500 rounded"></div>
            ))}
          </div>
        </div>

        {/* My hand */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">My Hand</h2>
          <div className="flex flex-wrap gap-2 p-4 bg-blue-100 rounded">
            {myHand.length > 0 ? (
              myHand.map((card, index) => (
                <button
                  key={index}
                  onClick={() => isMyTurn && handleMakeMove(card)}
                  disabled={!isMyTurn}
                  className={`card-display p-2 rounded shadow transition-transform ${
                    isMyTurn ? 'hover:bg-blue-200 hover:-translate-y-1 cursor-pointer' : 'opacity-70'
                  }`}
                  title={isMyTurn ? (isAttackingMode ? 'Play this card' : 'Beat with this card') : 'Not your turn'}
                >
                  {card}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No cards in hand</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Room;
