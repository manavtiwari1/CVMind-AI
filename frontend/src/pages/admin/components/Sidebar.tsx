import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  BrainCircuit, ChevronRight, LayoutDashboard,
  BarChart3, Users, Cpu, CreditCard, HeadphonesIcon,
  FileBarChart, Server, Settings, FileText,
  Linkedin, Mic, Briefcase, Globe, Zap, Map,
  LogIn, Shield, Database, Flag, Mail,
  TrendingUp, MessageSquare, Download, UserCheck, UserX, Trash2,
  Repeat, Undo2, BadgePercent, Receipt, Bug, Lightbulb, Activity,
  HardDrive, ClipboardList, Lock, Palette, Building2
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
  setCurrentPage: (p: string) => void;
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  section: string;
  activeSection: string;
  setActiveSection: (s: string) => void;
  indent?: boolean;
}

function NavItem({ icon, label, section, activeSection, setActiveSection, indent }: NavItemProps) {
  const isActive = activeSection === section;
  return (
    <button
      className={indent ? `sidebar-sub-item${isActive ? ' active' : ''}` : `sidebar-nav-item${isActive ? ' active' : ''}`}
      onClick={() => setActiveSection(section)}
    >
      {icon}
      {label}
    </button>
  );
}

interface GroupProps {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  hasActive: boolean;
}

function SidebarGroup({ label, icon, children, defaultOpen, hasActive }: GroupProps) {
  const [open, setOpen] = useState(defaultOpen || hasActive);
  return (
    <div className="sidebar-group">
      <button className="sidebar-group-trigger" onClick={() => setOpen(o => !o)}>
        <span className="sidebar-group-trigger-left">
          {icon}
          {label}
        </span>
        <ChevronRight size={12} className={`sidebar-group-chevron${open ? ' open' : ''}`} />
      </button>
      <div className={`sidebar-group-items${open ? ' open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

const AI_SECTIONS = ['ai-resume-analyzer','ai-auto-fix','ai-tailors','ai-preps','ai-linkedin','ai-linkedin-bio','ai-linkedin-outreach','ai-skill-gap','ai-elevator-pitch','ai-career-roadmap','ai-portfolio','ai-voice-prep','ai-job-finder'];
const ANALYTICS_SECTIONS = ['analytics-resume','analytics-users','analytics-ai','analytics-revenue','analytics-job-finder','analytics-linkedin'];
const USER_SECTIONS = ['users-all','users-waitlist','users-premium','users-suspended','users-deleted','users-whitelist','users-sessions'];
const PAYMENTS_SECTIONS = ['payments-transactions','payments-revenue','payments-subscriptions','payments-refunds','payments-coupons','payments-invoices'];
const SUPPORT_SECTIONS = ['support-leads','support-feedback','support-bugs','support-features'];
const REPORTS_SECTIONS = ['reports-export'];
const SYSTEM_SECTIONS = ['system-database','system-api','system-queue','system-storage','system-flags','system-audit','system-sessions'];
const SETTINGS_SECTIONS = ['settings-general','settings-security','settings-access','settings-branding','settings-api','settings-email'];

export default function Sidebar({ activeSection, setActiveSection, setCurrentPage }: SidebarProps) {
  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => setCurrentPage('home')} title="Back to main site">
        <div className="sidebar-logo-ring">
          <BrainCircuit size={17} />
        </div>
        <span className="sidebar-brand-name">
          CVMind <span className="sidebar-brand-accent">AI</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Dashboard */}
        <NavItem
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          section="dashboard"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <div className="sidebar-divider" />

        {/* Analytics */}
        <SidebarGroup
          label="Analytics"
          icon={<BarChart3 size={11} />}
          defaultOpen={false}
          hasActive={ANALYTICS_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<FileText size={13} />} label="Resume Analytics" section="analytics-resume" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Users size={13} />} label="User Analytics" section="analytics-users" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Cpu size={13} />} label="AI Analytics" section="analytics-ai" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<TrendingUp size={13} />} label="Revenue Analytics" section="analytics-revenue" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Briefcase size={13} />} label="Job Finder Analytics" section="analytics-job-finder" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Linkedin size={13} />} label="LinkedIn Analytics" section="analytics-linkedin" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* User Management */}
        <SidebarGroup
          label="User Management"
          icon={<Users size={11} />}
          defaultOpen={false}
          hasActive={USER_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<Users size={13} />} label="All Users" section="users-all" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Mail size={13} />} label="Waitlist" section="users-waitlist" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<UserCheck size={13} />} label="Premium Users" section="users-premium" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<UserX size={13} />} label="Suspended Users" section="users-suspended" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Trash2 size={13} />} label="Deleted Users" section="users-deleted" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Shield size={13} />} label="Access Manager" section="users-whitelist" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<LogIn size={13} />} label="Login Sessions" section="users-sessions" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* AI Activity */}
        <SidebarGroup
          label="AI Activity"
          icon={<Cpu size={11} />}
          defaultOpen={false}
          hasActive={AI_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<FileText size={13} />} label="Resume Analyzer" section="ai-resume-analyzer" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Zap size={13} />} label="Resume Auto Fix" section="ai-auto-fix" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<FileText size={13} />} label="Resume Tailoring" section="ai-tailors" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<BrainCircuit size={13} />} label="SmartPrep" section="ai-preps" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Linkedin size={13} />} label="LinkedIn Audit" section="ai-linkedin" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Linkedin size={13} />} label="LinkedIn Bio" section="ai-linkedin-bio" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Linkedin size={13} />} label="LinkedIn Outreach" section="ai-linkedin-outreach" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<BarChart3 size={13} />} label="Skill Gap" section="ai-skill-gap" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Mic size={13} />} label="Elevator Pitch" section="ai-elevator-pitch" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Map size={13} />} label="Career Roadmap" section="ai-career-roadmap" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Globe size={13} />} label="Portfolio Generator" section="ai-portfolio" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Mic size={13} />} label="Voice Practice" section="ai-voice-prep" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Briefcase size={13} />} label="Job Finder" section="ai-job-finder" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* Payments */}
        <SidebarGroup
          label="Payments"
          icon={<CreditCard size={11} />}
          defaultOpen={false}
          hasActive={PAYMENTS_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<CreditCard size={13} />} label="Transactions" section="payments-transactions" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<TrendingUp size={13} />} label="Revenue Summary" section="payments-revenue" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Repeat size={13} />} label="Subscriptions" section="payments-subscriptions" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Undo2 size={13} />} label="Refunds" section="payments-refunds" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<BadgePercent size={13} />} label="Coupons" section="payments-coupons" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Receipt size={13} />} label="Invoices" section="payments-invoices" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup
          label="Support"
          icon={<HeadphonesIcon size={11} />}
          defaultOpen={false}
          hasActive={SUPPORT_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<Mail size={13} />} label="Contact Leads" section="support-leads" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<MessageSquare size={13} />} label="Feedback" section="support-feedback" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Bug size={13} />} label="Bug Reports" section="support-bugs" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Lightbulb size={13} />} label="Feature Requests" section="support-features" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup
          label="Reports"
          icon={<FileBarChart size={11} />}
          defaultOpen={false}
          hasActive={REPORTS_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<Download size={13} />} label="Export Center" section="reports-export" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* System */}
        <SidebarGroup
          label="System"
          icon={<Server size={11} />}
          defaultOpen={false}
          hasActive={SYSTEM_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<Database size={13} />} label="Database Health" section="system-database" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Activity size={13} />} label="API Health" section="system-api" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Server size={13} />} label="Queue Status" section="system-queue" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<HardDrive size={13} />} label="Storage" section="system-storage" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Flag size={13} />} label="Feature Flags" section="system-flags" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<ClipboardList size={13} />} label="Audit Logs" section="system-audit" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<LogIn size={13} />} label="Login Sessions" section="system-sessions" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup
          label="Settings"
          icon={<Settings size={11} />}
          defaultOpen={false}
          hasActive={SETTINGS_SECTIONS.includes(activeSection)}
        >
          <NavItem icon={<Building2 size={13} />} label="General" section="settings-general" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Lock size={13} />} label="Security" section="settings-security" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Shield size={13} />} label="Access Control" section="settings-access" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Palette size={13} />} label="Branding" section="settings-branding" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Settings size={13} />} label="API Config" section="settings-api" activeSection={activeSection} setActiveSection={setActiveSection} indent />
          <NavItem icon={<Mail size={13} />} label="Email Settings" section="settings-email" activeSection={activeSection} setActiveSection={setActiveSection} indent />
        </SidebarGroup>
      </nav>

      {/* User badge */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">A</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Administrator</div>
          <div className="sidebar-user-role">
            <span className="sidebar-online-dot" />
            Active Session
          </div>
        </div>
      </div>
    </aside>
  );
}
