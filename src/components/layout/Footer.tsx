'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterProps {
  version?: string;
  links?: FooterLink[];
}

const defaultLinks: FooterLink[] = [
  { title: 'Documentation', href: '/docs' },
  { title: 'Support', href: '/support' },
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
];

export function Footer({ version = '1.0.0', links = defaultLinks }: FooterProps) {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link
              href="https://geetorus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Geetorus CampusOS
            </Link>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Quick Links */}
          <nav className="flex items-center gap-4">
            {links.map((link, index) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {link.title}
                  {link.external && <ExternalLink className="h-3 w-3" />}
                </Link>
                {index < links.length - 1 && (
                  <Separator orientation="vertical" className="h-4" />
                )}
              </React.Fragment>
            ))}
          </nav>

          <Separator orientation="vertical" className="h-4" />

          {/* Version */}
          <div className="text-sm text-muted-foreground">
            v{version}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden gap-3">
          {/* Branding */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link
              href="https://geetorus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Geetorus CampusOS
            </Link>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </div>

          <Separator />

          {/* Quick Links - Mobile */}
          <nav className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {link.title}
                {link.external && <ExternalLink className="h-3 w-3" />}
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Version - Mobile */}
          <div className="text-center text-xs text-muted-foreground">
            Version {version}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Geetorus Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
