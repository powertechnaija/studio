
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  List, 
  Bot, 
  Settings, 
  Home,
  PanelLeft,
  Warehouse // Added icon for Pens
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/livestock', label: 'Livestock', icon: List },
  { href: '/pens', label: 'Pens', icon: Warehouse }, // Added Pens navigation item
  { href: '/ai-insights', label: 'AI Insights', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary-foreground mb-4 px-4">
    <Home className="h-7 w-7" />
    <span>StockWise</span>
  </Link>
);

const NavLink = ({ item, isMobile }: { item: typeof navItems[0], isMobile?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)); // Make parent active for sub-routes

  const linkContent = (
    <>
      <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")} />
      <span className={cn(isMobile ? "" : "group-data-[collapsible=icon]:hidden")}>{item.label}</span>
    </>
  );

  const linkClasses = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all group",
    isActive 
      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );

  if (isMobile) {
    return (
      <Link href={item.href} className={linkClasses}>
        {linkContent}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={item.href} className={linkClasses}>
         {linkContent}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5} className="group-data-[collapsible=icon]:block hidden">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
};


const DesktopSidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-sidebar sm:flex">
      <nav className="flex flex-col gap-2 p-4 sm:py-5">
        <Logo />
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
};

const MobileSheet = () => {
  return (
     <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
          <nav className="grid gap-3 p-4 text-lg font-medium">
            <Logo />
            {navItems.map((item) => (
               <NavLink key={item.href} item={item} isMobile={true} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {!isMobile && <DesktopSidebar />}
      <div className={cn("flex flex-col", !isMobile && "sm:pl-64")}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          {isMobile && <MobileSheet />}
           <h1 className="text-xl font-semibold ml-2 sm:ml-0">StockWise</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
