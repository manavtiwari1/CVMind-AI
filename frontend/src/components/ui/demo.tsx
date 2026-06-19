'use client';

import * as React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu-1';
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Alert Dialog',
    href: '#',
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description: 'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]" style={{ display: 'grid', gridTemplateColumns: '0.75fr 1fr', gap: '0.5rem', listStyle: 'none', padding: '1rem' }}>
              <li className="row-span-3" style={{ gridRow: 'span 3' }}>
                <NavigationMenuLink
                  render={
                    <a
                      className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                      href="/"
                      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', textDecoration: 'none' }}
                    />
                  }
                >
                  <div className="mt-4 mb-2 text-lg font-medium" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>ReUI</div>
                  <p className="text-muted-foreground text-sm leading-tight" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Beautifully designed components built with Tailwind CSS.
                  </p>
                </NavigationMenuLink>
              </li>
              <ListItem href="#" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="#" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="#" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '500px', listStyle: 'none', padding: '1rem' }}>
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink render={<a href="#" className={navigationMenuTriggerStyle()} style={{ display: 'inline-flex', textDecoration: 'none', color: 'var(--text-primary)' }} />}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4" style={{ width: '300px', listStyle: 'none', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)' }} />}>
                  <div className="font-medium" style={{ fontWeight: 600 }}>Components</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Browse all components in the library.</div>
                </NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)', marginTop: '0.5rem' }} />}>
                  <div className="font-medium" style={{ fontWeight: 600 }}>Documentation</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Learn how to use the library.</div>
                </NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)', marginTop: '0.5rem' }} />}>
                  <div className="font-medium" style={{ fontWeight: 600 }}>Blog</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Read our latest blog posts.</div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4" style={{ width: '200px', listStyle: 'none', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'block', padding: '0.25rem 0' }} />}>Components</NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'block', padding: '0.25rem 0' }} />}>Documentation</NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'block', padding: '0.25rem 0' }} />}>Blocks</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4" style={{ width: '200px', listStyle: 'none', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <NavigationMenuLink render={<a href="#" className="flex-row items-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }} />}>
                  <CircleHelpIcon size={16} />
                  Backlog
                </NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" className="flex-row items-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }} />}>
                  <CircleIcon size={16} />
                  To Do
                </NavigationMenuLink>
                <NavigationMenuLink render={<a href="#" className="flex-row items-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }} />}>
                  <CircleCheckIcon size={16} />
                  Done
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuPositioner>
        <NavigationMenuPopup />
      </NavigationMenuPositioner>
    </NavigationMenu>
  );
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink render={<a href={href} style={{ textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '0.25rem', color: 'var(--text-primary)' }} />}>
        <div className="text-sm leading-none font-medium" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{title}</div>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{children}</p>
      </NavigationMenuLink>
    </li>
  );
}
