
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  text: string;
  isSystem?: boolean;
  isRoast?: boolean;
}

interface ChatPanelProps {
  isDemo?: boolean;
  opponentName?: string;
}

const ChatPanel = ({ isDemo = false, opponentName = "RoastMaster99" }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  // Random roast button phrases
  const roastPhrases = [
    "That's what she said!",
    "Your face is like a 404 error - not found!",
    "You're so slow, Internet Explorer feels bad for you!",
    "Your jokes are like NFTs - expensive but worthless!",
    "I've seen better moves in a chess match with pigeons!",
    "Your comeback is loading... still loading... error!",
    "Your roast game is weaker than hotel WiFi!",
    "Your style reminds me of Internet Explorer - outdated!",
    "You're like that spinning wheel on a Mac - pretty but useless!"
  ];
  
  // Generate random demo messages
  useEffect(() => {
    if (isDemo) {
      const demoMessages: Message[] = [
        { id: 1, user: 'System', text: 'Welcome to the battle chat!', isSystem: true },
        { id: 2, user: 'FireEmoji88', text: '🔥 Let the roasting begin! 🔥' },
        { id: 3, user: 'LaughingGull42', text: `${opponentName} is gonna get destroyed lol` },
        { id: 4, user: 'BattleFan23', text: 'my money is on JokeSlayer this time' },
        { id: 5, user: 'ComedyQueen', text: '😂😂😂' },
      ];
      
      setMessages(demoMessages);
      
      // Add more messages periodically
      const interval = setInterval(() => {
        const demoUsers = ['FireEmoji88', 'LaughingGull42', 'BattleFan23', 'ComedyQueen', 'RoastLover', 'CrispyJokes', 'BurnMaster'];
        const demoTexts = [
          'omg that was brutal 💀',
          'LMAOOO',
          '🔥🔥🔥',
          'that joke was mid tbh',
          'savage!!!',
          'who else is watching from school? 👀',
          'oh snap! didn\'t see that coming',
          `these two are hilarious`,
          'someone call the fire department 🚒',
          'I can\'t breathe 😂😂',
          'that\'s gotta hurt'
        ];
        
        // Add a random roast every 3-4 messages for variety
        const isRoast = Math.random() > 0.75;
        
        const newDemoMessage: Message = {
          id: Date.now(),
          user: demoUsers[Math.floor(Math.random() * demoUsers.length)],
          text: isRoast ? `@${opponentName} ${roastPhrases[Math.floor(Math.random() * roastPhrases.length)]}` : 
                 demoTexts[Math.floor(Math.random() * demoTexts.length)],
          isRoast
        };
        
        setMessages(prev => [...prev, newDemoMessage]);
        setHasUnreadMessages(true);
      }, 3500);
      
      return () => clearInterval(interval);
    } else {
      // Set initial message for non-demo mode
      setMessages([
        { id: 1, user: 'System', text: 'Welcome to the battle chat!', isSystem: true },
        { id: 2, user: 'System', text: 'Be respectful and enjoy the show!', isSystem: true }
      ]);
    }
  }, [isDemo, opponentName]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasUnreadMessages(false);
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        user: 'You',
        text: newMessage.trim(),
        isRoast: newMessage.includes(opponentName) || newMessage.includes('roast')
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
    }
  };
  
  const sendQuickRoast = () => {
    const randomRoast = roastPhrases[Math.floor(Math.random() * roastPhrases.length)];
    const roastMessage: Message = {
      id: Date.now(),
      user: 'You',
      text: `@${opponentName} ${randomRoast}`,
      isRoast: true
    };
    
    setMessages(prev => [...prev, roastMessage]);
  };
  
  return (
    <div className="h-full flex flex-col bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:border-white/30">
      <div className="p-3 border-b border-white/20 flex justify-between items-center">
        <h3 className="font-medium text-white flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-[#00E1A0]" />
          Live Chat {hasUnreadMessages && <span className="ml-2 w-2 h-2 bg-[#FF5757] rounded-full animate-pulse"></span>}
        </h3>
        <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
          {messages.length - 2} messages
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px] scrollbar-hidden">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col animate-fade-in ${message.isRoast ? 'scale-105 transition-transform' : ''}`}>
            <div className="flex items-start gap-2">
              <span className={`font-medium text-sm ${
                message.isSystem ? 'text-roast-orange' : 
                message.user === 'You' ? 'text-roast-red' : 
                message.isRoast ? 'text-[#00E1A0]' : 'text-white'
              }`}>
                {message.user}:
              </span>
              <span className={`text-sm ${
                message.isSystem ? 'text-white/80' : 
                message.isRoast ? 'text-white font-medium' : 'text-white/90'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-white/20">
        <div className="mb-2">
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-full px-3"
            onClick={sendQuickRoast}
          >
            <Smile className="h-3 w-3 mr-1" /> Quick Roast
          </Button>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="text-sm bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-[#00E1A0]"
          />
          <Button type="submit" size="icon" variant="ghost" className="rounded-full text-[#00E1A0] hover:bg-[#00E1A0]/10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
