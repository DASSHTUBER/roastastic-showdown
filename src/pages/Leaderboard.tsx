
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Trophy, Medal, Star, ArrowUpDown, Candy } from 'lucide-react';

// Mock data for leaderboard
const mockLeaderboardData = [
  { id: 1, name: 'SugarMaster99', points: 350, wins: 70, losses: 30, avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'CandyCrusher42', points: 325, wins: 65, losses: 35, avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 3, name: 'SweetKing', points: 310, wins: 62, losses: 38, avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 4, name: 'CandyQueen', points: 280, wins: 56, losses: 44, avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg' },
  { id: 5, name: 'LollipopNinja', points: 265, wins: 53, losses: 47, avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { id: 6, name: 'GummyMaster', points: 240, wins: 48, losses: 52, avatarUrl: 'https://randomuser.me/api/portraits/women/24.jpg' },
  { id: 7, name: 'SweetnessGuru', points: 225, wins: 45, losses: 55, avatarUrl: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { id: 8, name: 'CandySpeaker', points: 210, wins: 42, losses: 58, avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg' },
  { id: 9, name: 'SugarHero', points: 195, wins: 39, losses: 61, avatarUrl: 'https://randomuser.me/api/portraits/men/36.jpg' },
  { id: 10, name: 'TreatMaster', points: 180, wins: 36, losses: 64, avatarUrl: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { id: 11, name: 'CandyKing', points: 170, wins: 34, losses: 66, avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 12, name: 'SweetQueen', points: 160, wins: 32, losses: 68, avatarUrl: 'https://randomuser.me/api/portraits/women/30.jpg' },
  { id: 13, name: 'TreatMaven', points: 150, wins: 30, losses: 70, avatarUrl: 'https://randomuser.me/api/portraits/men/29.jpg' },
  { id: 14, name: 'SugarMonster', points: 145, wins: 29, losses: 71, avatarUrl: 'https://randomuser.me/api/portraits/women/42.jpg' },
  { id: 15, name: 'CandyJester', points: 140, wins: 28, losses: 72, avatarUrl: 'https://randomuser.me/api/portraits/men/61.jpg' },
];

type SortField = 'points' | 'wins' | 'losses';
type SortDirection = 'asc' | 'desc';

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const itemsPerPage = 10;
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const filteredData = mockLeaderboardData
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    });
  
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      
      {/* Floating Candy Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            <div 
              className="w-6 h-6 md:w-10 md:h-10 rounded-full opacity-60"
              style={{
                backgroundColor: [
                  '#FF8ABC', '#A066D3', '#48C4E0',
                  '#7ED957', '#FFD53F', '#FF9838'
                ][i % 6]
              }}
            />
          </div>
        ))}
      </div>
      
      <section className="pt-28 pb-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white candy-shadow">
              Sweet Battle <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="mt-4 text-candy-purple max-w-2xl mx-auto">
              See who reigns supreme in the art of sweet roasting. Each round win earns 5 Candy Points. Can you climb to the sugary top?
            </p>
          </div>
          
          {/* Top 3 Winners Highlight */}
          <div className="hidden md:flex justify-center gap-6 mb-12">
            {filteredData.slice(1, 2).map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-candy-blue">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-candy-blue text-white">{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-candy-blue rounded-full p-1 w-8 h-8 flex items-center justify-center">
                    <Medal className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-lg text-candy-bright-pink">{user.name}</h3>
                <p className="text-candy-purple">{user.points} candy points</p>
                <span className="text-sm mt-1 bg-candy-blue/20 px-2 py-0.5 rounded-full text-candy-blue">2nd Place</span>
              </div>
            ))}
            
            {filteredData.slice(0, 1).map((user) => (
              <div key={user.id} className="flex flex-col items-center transform scale-110">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-candy-bright-pink">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-candy-bright-pink text-white">{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-candy-red to-candy-bright-pink rounded-full p-1 w-10 h-10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-xl text-candy-bright-pink candy-shadow">{user.name}</h3>
                <p className="text-white font-medium">{user.points} candy points</p>
                <span className="text-sm mt-1 bg-candy-bright-pink/20 text-candy-bright-pink px-2 py-0.5 rounded-full">Sweet Champion</span>
              </div>
            ))}
            
            {filteredData.slice(2, 3).map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-candy-yellow">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-candy-yellow text-white">{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-candy-yellow rounded-full p-1 w-8 h-8 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-lg text-candy-bright-pink">{user.name}</h3>
                <p className="text-candy-purple">{user.points} candy points</p>
                <span className="text-sm mt-1 bg-candy-yellow/20 px-2 py-0.5 rounded-full text-candy-yellow">3rd Place</span>
              </div>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-candy-purple" />
            <Input
              placeholder="Search sweet players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-candy-bright-pink/30 focus:border-candy-bright-pink text-candy-purple bg-white/80"
            />
          </div>
          
          {/* Leaderboard Table */}
          <div className="candy-panel rounded-xl overflow-hidden border-2 border-white/30">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 bg-white/10">
                  <TableHead className="w-12 text-white font-bold">Rank</TableHead>
                  <TableHead className="text-white font-bold">Player</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-candy-green text-white font-bold"
                    onClick={() => handleSort('points')}
                  >
                    Candy Points
                    {sortField === 'points' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-candy-green text-white font-bold"
                    onClick={() => handleSort('wins')}
                  >
                    Wins
                    {sortField === 'wins' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-candy-green text-white font-bold"
                    onClick={() => handleSort('losses')}
                  >
                    Losses
                    {sortField === 'losses' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead className="text-white font-bold">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user, index) => {
                  const globalRank = filteredData.findIndex(u => u.id === user.id) + 1;
                  const winRate = user.wins / (user.wins + user.losses) * 100;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-white/10 border-white/10 group transition-all">
                      <TableCell className="font-medium text-white relative">
                        {globalRank === 1 ? (
                          <span className="inline-flex items-center justify-center bg-gradient-to-r from-candy-red to-candy-bright-pink text-white w-8 h-8 rounded-full shadow-candy">
                            <Candy className="w-4 h-4 animate-candy-spin" />
                          </span>
                        ) : globalRank === 2 ? (
                          <span className="inline-flex items-center justify-center bg-candy-blue text-white w-6 h-6 rounded-full">2</span>
                        ) : globalRank === 3 ? (
                          <span className="inline-flex items-center justify-center bg-candy-yellow text-white w-6 h-6 rounded-full">3</span>
                        ) : (
                          <span className="text-white/80">{globalRank}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-white/30 group-hover:border-candy-bright-pink transition-colors">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-candy-purple text-white">{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-candy-yellow">{user.points}</TableCell>
                      <TableCell className="text-candy-green">{user.wins}</TableCell>
                      <TableCell className="text-candy-red">{user.losses}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-24 h-4 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-candy-green to-candy-blue rounded-full" 
                              style={{width: `${winRate}%`}}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-white">{winRate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-candy-purple hover:text-candy-bright-pink hover:bg-candy-bright-pink/10`}
                    />
                  </PaginationItem>
                  
                  {Array.from({length: totalPages}).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={currentPage === i + 1 ? 'bg-candy-bright-pink text-white' : 'text-candy-purple hover:text-candy-bright-pink hover:bg-candy-bright-pink/10'}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-candy-purple hover:text-candy-bright-pink hover:bg-candy-bright-pink/10`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 text-candy-purple/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-candy-bright-pink font-bold text-xl candy-shadow">
                RoastBattle<span className="text-candy-blue">!</span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Terms</a>
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Privacy</a>
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
