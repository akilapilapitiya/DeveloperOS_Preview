import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, FolderKanban, UserCircle, Menu, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '../context/auth.context';

const BACKEND_URL = 'http://localhost:8081';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
];

const SidebarContent = ({ pathname }: { pathname: string }) => {
  const { backendProfile } = useAuth();
  const username = backendProfile?.username;
  const avatarSrc =
    (backendProfile?.avatarPath ? `${BACKEND_URL}/api/v1/files/avatars/${backendProfile.avatarPath}` : null) ||
    backendProfile?.githubAvatarUrl || null;

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo Area */}
      <div className="flex h-14 items-center border-b border-border px-4 lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs">
            OS
          </span>
          <span className="hidden lg:block text-foreground">Developer OS</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 lg:px-4 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${
                  isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="p-4 border-t border-border space-y-1">
        {/* Public profile — primary nav item */}
        <Link
          to={username ? `/u/${username}` : '/profile'}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${
            pathname.startsWith('/u/') ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="me" className="h-4 w-4 rounded-full object-cover shrink-0" />
          ) : (
            <UserCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="hidden lg:block truncate">
            {username ? `@${username}` : 'Profile'}
          </span>
        </Link>


      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex lg:w-64 transition-all">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16 lg:pl-64">
        
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 sm:max-w-xs">
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
             <div className="ml-auto flex-1 sm:grow-0"></div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>

      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default DashboardLayout;
