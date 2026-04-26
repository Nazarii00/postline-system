import { useState, useMemo } from 'react';
import { mockBranches } from '../../data/mockBranches';
import { BranchesHeader } from '../../components/branches/BranchesHeader';
import { BranchSidebar } from '../../components/branches/BranchSidebar';
import { BranchesMap } from '../../components/branches/BranchesMap';

const BranchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Використовуємо useMemo, щоб уникнути зайвих фільтрацій при ререндерах
  const filteredBranches = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return mockBranches;

    return mockBranches.filter(b => 
      b.address.toLowerCase().includes(query) || 
      b.number.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 w-full px-4 md:px-8 py-8 md:py-12 flex flex-col flex-1 min-h-[800px] h-[calc(100vh-120px)] space-y-8">
        
        <BranchesHeader />

        <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <BranchSidebar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            branches={filteredBranches}
          />
          
          <BranchesMap />
          
        </div>
      </section>
    </main>
  );
};

export default BranchesPage;