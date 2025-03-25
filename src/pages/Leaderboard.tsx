
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Trophy, Medal, Star, ArrowUpDown } from 'lucide-react';

// Mock data for leaderboard
const mockLeaderboardData = [
  { id: 1, name: 'RoastMaster99', points: 350, wins: 70, losses: 30, avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'JokeSlayer42', points: 325, wins: 65, losses: 35, avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 3, name: 'ComedyKing', points: 310, wins: 62, losses: 38, avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 4, name: 'LaughQueen', points: 280, wins: 56, losses: 44, avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg' },
  { id: 5, name: 'WittyNinja', points: 265, wins: 53, losses: 47, avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { id: 6, name: 'PunMaster', points: 240, wins: 48, losses: 52, avatarUrl: 'https://randomuser.me/api/portraits/women/24.jpg' },
  { id: 7, name: 'GiggleGuru', points: 225, wins: 45, losses: 55, avatarUrl: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { id: 8, name: 'SassySpeaker', points: 210, wins: 42, losses: 58, avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg' },
  { id: 9, name: 'HumorHero', points: 195, wins: 39, losses: 61, avatarUrl: 'https://randomuser.me/api/portraits/men/36.jpg' },
  { id: 10, name: 'BurnMaster', points: 180, wins: 36, losses: 64, avatarUrl: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { id: 11, name: 'InsultKing', points: 170, wins: 34, losses: 66, avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 12, name: 'QuipQueen', points: 160, wins: 32, losses: 68, avatarUrl: 'https://randomuser.me/api/portraits/women/30.jpg' },
  { id: 13, name: 'MockeryMaven', points: 150, wins: 30, losses: 70, avatarUrl: 'https://randomuser.me/api/portraits/men/29.jpg' },
  { id: 14, name: 'TeaseMonster', points: 145, wins: 29, losses: 71, avatarUrl: 'https://randomuser.me/api/portraits/women/42.jpg' },
  { id: 15, name: 'JesterJokes', points: 140, wins: 28, losses: 72, avatarUrl: 'https://randomuser.me/api/portraits/men/61.jpg' },
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
    <div className="min-h-screen w-full bg-background text-foreground">
      <Navbar />
      
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold">
              Roast Battle <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="mt-4 text-roast-light-gray max-w-2xl mx-auto">
              See who reigns supreme in the art of roasting. Each round win earns 5 Roast Points. Can you climb to the top?
            </p>
          </div>
          
          {/* Top 3 Winners Highlight */}
          <div className="hidden md:flex justify-center gap-6 mb-12">
            {filteredData.slice(1, 2).map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-silver">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-silver rounded-full p-1 w-8 h-8 flex items-center justify-center">
                    <Medal className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-lg">{user.name}</h3>
                <p className="text-roast-light-gray">{user.points} points</p>
                <span className="text-sm mt-1 bg-silver/10 px-2 py-0.5 rounded-full">2nd Place</span>
              </div>
            ))}
            
            {filteredData.slice(0, 1).map((user) => (
              <div key={user.id} className="flex flex-col items-center transform scale-110">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-roast-orange">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-roast-red to-roast-orange rounded-full p-1 w-10 h-10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-xl">{user.name}</h3>
                <p className="text-white font-medium">{user.points} points</p>
                <span className="text-sm mt-1 bg-roast-orange/20 text-roast-orange px-2 py-0.5 rounded-full">Champion</span>
              </div>
            ))}
            
            {filteredData.slice(2, 3).map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-amber-600">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 rounded-full p-1 w-8 h-8 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-lg">{user.name}</h3>
                <p className="text-roast-light-gray">{user.points} points</p>
                <span className="text-sm mt-1 bg-amber-600/10 px-2 py-0.5 rounded-full">3rd Place</span>
              </div>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Leaderboard Table */}
          <div className="glass-light rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('points')}
                  >
                    Points
                    {sortField === 'points' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('wins')}
                  >
                    Wins
                    {sortField === 'wins' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('losses')}
                  >
                    Losses
                    {sortField === 'losses' && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user, index) => {
                  const globalRank = filteredData.findIndex(u => u.id === user.id) + 1;
                  const winRate = user.wins / (user.wins + user.losses) * 100;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-white/5">
                      <TableCell className="font-medium">
                        {globalRank === 1 ? (
                          <span className="inline-flex items-center justify-center bg-gradient-to-r from-roast-red to-roast-orange text-white w-6 h-6 rounded-full">1</span>
                        ) : globalRank === 2 ? (
                          <span className="inline-flex items-center justify-center bg-silver text-white w-6 h-6 rounded-full">2</span>
                        ) : globalRank === 3 ? (
                          <span className="inline-flex items-center justify-center bg-amber-700 text-white w-6 h-6 rounded-full">3</span>
                        ) : (
                          globalRank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{user.points}</TableCell>
                      <TableCell className="text-green-500">{user.wins}</TableCell>
                      <TableCell className="text-roast-red">{user.losses}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{width: `${winRate}%`}}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm">{winRate.toFixed(0)}%</span>
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
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({length: totalPages}).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
