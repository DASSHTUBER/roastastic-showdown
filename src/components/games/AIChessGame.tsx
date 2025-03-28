
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckSquare, Dice, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

interface ChessPiece {
  type: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  color: 'white' | 'black';
  position: string;
}

interface AIChessGameProps {
  onBack: () => void;
}

const AIChessGame = ({ onBack }: AIChessGameProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playersTurn, setPlayersTurn] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [pieces, setPieces] = useState<ChessPiece[]>([]);
  const [gameMessage, setGameMessage] = useState('Start the game to play against AI');
  const [aiThinking, setAiThinking] = useState(false);
  
  // Initialize chess board
  useEffect(() => {
    if (gameStarted) {
      const initialPieces: ChessPiece[] = [
        // White pieces (player)
        { type: 'rook', color: 'white', position: 'a1' },
        { type: 'knight', color: 'white', position: 'b1' },
        { type: 'bishop', color: 'white', position: 'c1' },
        { type: 'queen', color: 'white', position: 'd1' },
        { type: 'king', color: 'white', position: 'e1' },
        { type: 'bishop', color: 'white', position: 'f1' },
        { type: 'knight', color: 'white', position: 'g1' },
        { type: 'rook', color: 'white', position: 'h1' },
        ...Array(8).fill(null).map((_, i) => ({ 
          type: 'pawn' as const, 
          color: 'white' as const, 
          position: `${String.fromCharCode(97 + i)}2` 
        })),
        
        // Black pieces (AI)
        { type: 'rook', color: 'black', position: 'a8' },
        { type: 'knight', color: 'black', position: 'b8' },
        { type: 'bishop', color: 'black', position: 'c8' },
        { type: 'queen', color: 'black', position: 'd8' },
        { type: 'king', color: 'black', position: 'e8' },
        { type: 'bishop', color: 'black', position: 'f8' },
        { type: 'knight', color: 'black', position: 'g8' },
        { type: 'rook', color: 'black', position: 'h8' },
        ...Array(8).fill(null).map((_, i) => ({ 
          type: 'pawn' as const, 
          color: 'black' as const, 
          position: `${String.fromCharCode(97 + i)}7` 
        })),
      ];
      
      setPieces(initialPieces);
      setGameMessage("Your turn! Click on a piece to move.");
    }
  }, [gameStarted]);
  
  // AI move logic
  useEffect(() => {
    if (gameStarted && !playersTurn && !aiThinking) {
      setAiThinking(true);
      setGameMessage("AI is thinking...");
      
      // Simulate AI thinking time
      const thinkingTime = Math.floor(Math.random() * 1000) + 500;
      
      setTimeout(() => {
        // Simple AI: randomly select a piece and make a random legal move
        const aiPieces = pieces.filter(piece => piece.color === 'black');
        
        if (aiPieces.length > 0) {
          const randomPieceIndex = Math.floor(Math.random() * aiPieces.length);
          const randomPiece = aiPieces[randomPieceIndex];
          
          // Generate a "random" move (simplified)
          const currentPos = randomPiece.position;
          const file = currentPos.charCodeAt(0);
          const rank = parseInt(currentPos[1]);
          
          // For pawns, move forward
          let newPos;
          if (randomPiece.type === 'pawn') {
            newPos = `${currentPos[0]}${rank - 1}`;
          } else {
            // For other pieces, move randomly by 1 square in any direction
            const newFile = Math.max(97, Math.min(104, file + Math.floor(Math.random() * 3) - 1));
            const newRank = Math.max(1, Math.min(8, rank + Math.floor(Math.random() * 3) - 1));
            newPos = `${String.fromCharCode(newFile)}${newRank}`;
          }
          
          // Check if new position is occupied by another black piece
          const pieceAtNewPos = pieces.find(p => p.position === newPos);
          if (!pieceAtNewPos || pieceAtNewPos.color === 'white') {
            // If it's a white piece, "capture" it
            let newPieces = pieces.filter(p => p.position !== newPos);
            
            // Update the moved piece position
            newPieces = newPieces.map(p => 
              p.position === currentPos ? { ...p, position: newPos } : p
            );
            
            setPieces(newPieces);
            
            const captureMessage = pieceAtNewPos && pieceAtNewPos.color === 'white' 
              ? `AI captured your ${pieceAtNewPos.type}!` 
              : "AI moved.";
            
            toast("AI Roastmaster says:", {
              description: generateRandomRoast(),
              icon: "♟️",
            });
            
            setGameMessage(`${captureMessage} Your turn now.`);
          } else {
            // If move is invalid, try again (simplification)
            setGameMessage("AI is recalculating...");
            setTimeout(() => setAiThinking(false), 300);
            return;
          }
        }
        
        setAiThinking(false);
        setPlayersTurn(true);
      }, thinkingTime);
    }
  }, [gameStarted, playersTurn, aiThinking, pieces]);
  
  const generateRandomRoast = () => {
    const roasts = [
      "That move was so bad, even my CPU is embarrassed for you.",
      "Is that your strategy or did you just sneeze on the keyboard?",
      "I've seen better moves from a broken mouse.",
      "My algorithm was designed in the 80s and I'm still outplaying you.",
      "Are you playing chess or just randomly clicking?",
      "That move is like your social life - non-existent.",
      "I'm an AI and even I feel sorry for you.",
      "Did you learn chess from a cereal box tutorial?",
      "Your opening is weaker than gas station coffee.",
      "Your pieces are running away from your strategy."
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  };
  
  const handleSquareClick = (position: string) => {
    if (!gameStarted || !playersTurn || aiThinking) return;
    
    const pieceAtPosition = pieces.find(p => p.position === position);
    
    // If a piece is already selected
    if (selectedPiece) {
      const selectedPieceObj = pieces.find(p => p.position === selectedPiece);
      
      // If clicking on another own piece, select that piece instead
      if (pieceAtPosition && pieceAtPosition.color === 'white') {
        setSelectedPiece(position);
        // Simple possible moves generation (not actual chess rules)
        generatePossibleMoves(position);
        return;
      }
      
      // Check if the move is in possible moves (simplified)
      if (possibleMoves.includes(position)) {
        // Move the piece
        let newPieces = pieces.filter(p => p.position !== position); // Remove captured piece if any
        
        // Update the moved piece position
        newPieces = newPieces.map(p => 
          p.position === selectedPiece ? { ...p, position } : p
        );
        
        setPieces(newPieces);
        setSelectedPiece(null);
        setPossibleMoves([]);
        setPlayersTurn(false);
        
        const captureMessage = pieceAtPosition 
          ? `You captured opponent's ${pieceAtPosition.type}!` 
          : "Piece moved.";
        
        setGameMessage(`${captureMessage} Waiting for AI's move...`);
      } else {
        // Invalid move
        setGameMessage("Invalid move! Try again.");
      }
    } else if (pieceAtPosition && pieceAtPosition.color === 'white') {
      // Select the piece
      setSelectedPiece(position);
      generatePossibleMoves(position);
    }
  };
  
  const generatePossibleMoves = (position: string) => {
    const piece = pieces.find(p => p.position === position);
    if (!piece) return;
    
    const file = position.charCodeAt(0); // ASCII code for the file (a-h)
    const rank = parseInt(position[1]); // 1-8
    const moves: string[] = [];
    
    // Simplified move generation (not real chess rules)
    switch (piece.type) {
      case 'pawn':
        // Move forward one square
        const forwardPos = `${position[0]}${rank + 1}`;
        if (!pieces.some(p => p.position === forwardPos)) {
          moves.push(forwardPos);
        }
        
        // Capture diagonally
        const captureLeft = `${String.fromCharCode(file - 1)}${rank + 1}`;
        const captureRight = `${String.fromCharCode(file + 1)}${rank + 1}`;
        
        const pieceLeft = pieces.find(p => p.position === captureLeft);
        const pieceRight = pieces.find(p => p.position === captureRight);
        
        if (pieceLeft && pieceLeft.color === 'black') moves.push(captureLeft);
        if (pieceRight && pieceRight.color === 'black') moves.push(captureRight);
        break;
        
      case 'knight':
        // Knight's L-shaped moves
        const knightMoves = [
          { fileOffset: 1, rankOffset: 2 },
          { fileOffset: 2, rankOffset: 1 },
          { fileOffset: 2, rankOffset: -1 },
          { fileOffset: 1, rankOffset: -2 },
          { fileOffset: -1, rankOffset: -2 },
          { fileOffset: -2, rankOffset: -1 },
          { fileOffset: -2, rankOffset: 1 },
          { fileOffset: -1, rankOffset: 2 }
        ];
        
        knightMoves.forEach(move => {
          const newFile = file + move.fileOffset;
          const newRank = rank + move.rankOffset;
          
          if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
            const newPos = `${String.fromCharCode(newFile)}${newRank}`;
            const pieceAtNewPos = pieces.find(p => p.position === newPos);
            
            if (!pieceAtNewPos || pieceAtNewPos.color === 'black') {
              moves.push(newPos);
            }
          }
        });
        break;
        
      // Simplified movement for other pieces (not real chess rules)
      default:
        // Allow one square movement in any direction for simplicity
        for (let f = -1; f <= 1; f++) {
          for (let r = -1; r <= 1; r++) {
            if (f === 0 && r === 0) continue;
            
            const newFile = file + f;
            const newRank = rank + r;
            
            if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
              const newPos = `${String.fromCharCode(newFile)}${newRank}`;
              const pieceAtNewPos = pieces.find(p => p.position === newPos);
              
              if (!pieceAtNewPos || pieceAtNewPos.color === 'black') {
                moves.push(newPos);
              }
            }
          }
        }
        break;
    }
    
    setPossibleMoves(moves);
  };
  
  const renderPiece = (piece: ChessPiece) => {
    const piecesSymbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };
    
    return piecesSymbols[piece.color][piece.type];
  };

  return (
    <div className="flex flex-col items-center p-4 animate-scale-in">
      <div className="flex justify-between items-center w-full mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tournaments
        </Button>
        
        <h2 className="text-xl font-bold text-white">AI Chess Game</h2>
        
        {!gameStarted ? (
          <Button 
            onClick={() => setGameStarted(true)} 
            className="gartic-accent-button"
          >
            Start Game
          </Button>
        ) : (
          <div className="bg-[#4a2264]/80 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-white">
              {playersTurn ? "Your Turn" : "AI's Turn"}
            </span>
          </div>
        )}
      </div>
      
      {/* Game message */}
      <div className="bg-[#4a2264]/80 px-4 py-2 rounded-lg mb-6 w-full">
        <p className="text-center text-white">{gameMessage}</p>
      </div>
      
      {/* Chess board */}
      <div className="w-full max-w-md aspect-square bg-[#3d1b53] rounded-lg p-2 mb-6">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {Array(8).fill(null).map((_, rankIndex) => (
            Array(8).fill(null).map((_, fileIndex) => {
              const rank = 8 - rankIndex; // Convert to chess rank (8..1)
              const file = String.fromCharCode(97 + fileIndex); // Convert to chess file (a..h)
              const position = `${file}${rank}`;
              const isBlackSquare = (fileIndex + rankIndex) % 2 === 1;
              const piece = pieces.find(p => p.position === position);
              const isSelected = position === selectedPiece;
              const isPossibleMove = possibleMoves.includes(position);
              
              return (
                <div 
                  key={position}
                  className={`
                    flex items-center justify-center relative
                    ${isBlackSquare ? 'bg-[#6d3b84]' : 'bg-[#8e4ca9]'}
                    ${isSelected ? 'ring-2 ring-[#00E1A0] ring-inset' : ''}
                    ${isPossibleMove ? 'ring-2 ring-[#00E1A0]/50 ring-inset' : ''}
                  `}
                  onClick={() => handleSquareClick(position)}
                >
                  {piece && (
                    <div className={`text-3xl ${piece.color === 'white' ? 'text-white' : 'text-black'}`}>
                      {renderPiece(piece)}
                    </div>
                  )}
                  
                  {isPossibleMove && !piece && (
                    <div className="absolute w-3 h-3 rounded-full bg-[#00E1A0]/50"></div>
                  )}
                  
                  {/* Coordinates (only on the edges) */}
                  {fileIndex === 0 && (
                    <div className="absolute left-1 top-1 text-xs text-white/50">
                      {rank}
                    </div>
                  )}
                  {rankIndex === 7 && (
                    <div className="absolute right-1 bottom-1 text-xs text-white/50">
                      {file}
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="flex justify-center space-x-4">
        <Button
          disabled={!gameStarted}
          onClick={() => {
            setGameStarted(false);
            setSelectedPiece(null);
            setPossibleMoves([]);
            setPlayersTurn(true);
            setGameMessage('Start the game to play against AI');
          }}
          variant="outline"
          className="text-white border-white/20"
        >
          Reset Game
        </Button>
      </div>
    </div>
  );
};

export default AIChessGame;
