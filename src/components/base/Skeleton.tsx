// 스켈레톤 로딩 컴포넌트들

// 기본 스켈레톤 블록
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
  );
}

// 프로필 카드 스켈레톤
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
      <div className="aspect-[3/4] bg-slate-200 animate-pulse"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-5 w-12 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// 매칭 탭 그리드 스켈레톤
export function MatchingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 py-4">
      {[...Array(4)].map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 커뮤니티 게시글 스켈레톤
export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// 커뮤니티 리스트 스켈레톤
export function CommunityListSkeleton() {
  return (
    <div className="space-y-3 px-4">
      {[...Array(5)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

// 채팅 리스트 스켈레톤
export function ChatListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-40 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

// 프로필 페이지 스켈레톤
export function ProfilePageSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-[2rem] p-8 shadow-lg">
        <div className="text-center">
          <div className="w-28 h-28 rounded-full bg-slate-200 animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-24 bg-slate-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto mb-6 animate-pulse"></div>
          <div className="h-12 w-full bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
      
      {/* 매칭 현황 */}
      <div className="bg-white rounded-[2rem] p-6 shadow-lg">
        <div className="h-6 w-24 bg-slate-200 rounded mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
