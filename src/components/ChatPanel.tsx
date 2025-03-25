
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  text: string;
  isSystem?: boolean;
}

interface ChatPanelProps {
  isDemo?: boolean;
}

const ChatPanel = ({ isDemo = false }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate random demo messages
  useEffect(() => {
    if (isDemo) {
      const demoMessages: Message[] = [
        { id: 1, user: 'System', text: 'Welcome to the battle chat!', isSystem: true },
        { id: 2, user: 'FireEmoji88', text: '🔥 Let the roasting begin! 🔥' },
        { id: 3, user: 'LaughingGull42', text: 'RoastMaster99 is gonna get destroyed lol' },
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
          'these two are hilarious',
          'someone call the fire department 🚒',
          'I can\'t breathe 😂😂',
          'that\'s gotta hurt'
        ];
        
        const newDemoMessage: Message = {
          id: Date.now(),
          user: demoUsers[Math.floor(Math.random() * demoUsers.length)],
          text: demoTexts[Math.floor(Math.random() * demoTexts.length)]
        };
        
        setMessages(prev => [...prev, newDemoMessage]);
      }, 3500);
      
      return () => clearInterval(interval);
    } else {
      // Set initial message for non-demo mode
      setMessages([
        { id: 1, user: 'System', text: 'Welcome to the battle chat!', isSystem: true },
        { id: 2, user: 'System', text: 'Be respectful and enjoy the show!', isSystem: true }
      ]);
    }
  }, [isDemo]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        user: 'You',
        text: newMessage.trim()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
      <div className="p-3 border-b border-white/20">
        <h3 className="font-medium">Live Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px]">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-start gap-2">
              <span className={`font-medium text-sm ${message.isSystem ? 'text-roast-orange' : message.user === 'You' ? 'text-roast-red' : ''}`}>
                {message.user}:
              </span>
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/20 flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="text-sm"
        />
        <Button type="submit" size="icon" variant="ghost" className="rounded-full">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
