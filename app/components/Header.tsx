import Image from 'next/image';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2">
          <Image 
            src="/assets/ai-icon.png"
            alt="Bohurupi Search"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold text-lg tracking-tight">
            Bohurupi Search
          </span>
        </div>
      </div>
    </header>
  );
}; 