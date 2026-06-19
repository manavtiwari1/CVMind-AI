import { PricingCard } from "../components/ui/dark-gradient-pricing"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import "./Pricing.css"

interface PricingProps {
  setCurrentPage: (page: string) => void
}

export default function Pricing({ setCurrentPage }: PricingProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      tier: "Free",
      price: "$0/mo",
      bestFor: "Ideal for individuals starting their job search",
      CTA: "Get Started Free",
      benefits: [
        { text: "Resume Builder", checked: true },
        { text: "Resume Checker", checked: true },
        { text: "Interview Prep AI", checked: true },
        { text: "Profile PDF Audit", checked: true },
        { text: "Bio & Banner Generator", checked: true },
        { text: "Outreach & DM Writer", checked: true },
        { text: "Limited AI Tokens (20/mo)", checked: true },
        { text: "Portfolio Generator", checked: false },
        { text: "Resume Tailor", checked: false },
        { text: "Voice Practice AI", checked: false },
        { text: "AI Job Finder", checked: false },
        { text: "Skills Gap & Courses", checked: false },
        { text: "Elevator Pitch Builder", checked: false },
        { text: "Career Roadmaps", checked: false },
      ],
      targetPage: "resume-builder",
    },
    {
      tier: "Pro",
      price: "$200/mo",
      bestFor: "Power pack for serious professionals aiming for top roles",
      CTA: "Upgrade to Pro",
      benefits: [
        { text: "Resume Builder", checked: true },
        { text: "Resume Checker", checked: true },
        { text: "Portfolio Generator", checked: true },
        { text: "Resume Tailor", checked: true },
        { text: "Interview Prep AI", checked: true },
        { text: "Voice Practice AI", checked: true },
        { text: "AI Job Finder", checked: true },
        { text: "Profile PDF Audit", checked: true },
        { text: "Bio & Banner Generator", checked: true },
        { text: "Outreach & DM Writer", checked: true },
        { text: "Skills Gap & Courses", checked: true },
        { text: "Elevator Pitch Builder", checked: true },
        { text: "Career Roadmaps", checked: true },
        { text: "Unlimited AI Tokens", checked: true },
      ],
      targetPage: "dashboard",
    },
    {
      tier: "Enterprise",
      price: "Contact Us",
      bestFor: "Tailored for universities, bootcamps, and recruitment agencies",
      CTA: "Contact Sales",
      benefits: [
        { text: "Everything in Pro version", checked: true },
        { text: "Unlimited Team Workspaces", checked: true },
        { text: "Custom AI Model Training", checked: true },
        { text: "Recruiter Dashboard", checked: true },
        { text: "SSO & Custom Security", checked: true },
        { text: "API Access & Integrations", checked: true },
        { text: "Dedicated Success Manager", checked: true },
        { text: "Unlimited AI Tokens", checked: true },
        { text: "White-labeled Portfolios", checked: true },
        { text: "Volume Candidate Analytics", checked: true },
      ],
      targetPage: "contact",
    },
  ];

  const faqs = [
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, absolutely. You can cancel your subscription at any time from your account settings. You will retain access to your plan until the end of your billing cycle."
    },
    {
      q: "What are AI Tokens and how do they work?",
      a: "AI Tokens are used to power our generative features, such as bullet point rewriting, cover letter writing, LinkedIn outreach generation, and portfolio generation. Free accounts get 20 tokens per month, while Pro accounts get unlimited tokens."
    },
    {
      q: "Do you offer discounts for universities or teams?",
      a: "Yes, we offer substantial volume discounts for universities, bootcamps, and career centers. Please choose our Enterprise option and contact sales for details."
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, your payments are processed securely via Stripe. We do not store your credit card information on our servers, and all transaction data is fully encrypted."
    }
  ];

  return (
    <div className="pricing-wrapper animate-fade-in-up">
      {/* Header */}
      <section className="pricing-hero">
        <div className="pricing-badge-wrapper">
          <span className="pricing-pulse-dot" />
          <span className="pricing-launch-date">Simple Pricing</span>
        </div>
        <h1 className="pricing-title">Find the plan that fits your career</h1>
        <p className="pricing-subtitle">
          Whether you are polishing your first CV or scaling a team of recruiters, CVMind AI has a layout tailored to you.
        </p>
      </section>

      {/* Grid container */}
      <div className="pricing-grid-container">
        <div className="pricing-grid">
          {plans.map((plan, idx) => (
            <PricingCard
              key={idx}
              tier={plan.tier}
              price={plan.price}
              bestFor={plan.bestFor}
              CTA={plan.CTA}
              benefits={plan.benefits}
              onClick={() => setCurrentPage(plan.targetPage)}
              className={plan.tier === "Pro" ? "pricing-pro-card" : ""}
            />
          ))}
        </div>
      </div>

      {/* Trust banner */}
      <section className="pricing-trust-section">
        <div className="pricing-trust-inner">
          <div className="pricing-trust-item">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
          <div className="pricing-trust-item">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span>No hidden fees, cancel anytime</span>
          </div>
          <div className="pricing-trust-item">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span>Over 50,000+ resumes optimized</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pricing-faq-section">
        <div className="pricing-faq-inner">
          <h2 className="pricing-faq-title">Pricing Frequently Asked Questions</h2>
          <p className="pricing-faq-sub">Clear answers to help you pick the right plan.</p>
          <div className="pricing-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`pricing-faq-item${activeFaq === i ? ' open' : ''}`}>
                <button className="pricing-faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="pricing-faq-chevron">{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && (
                  <div className="pricing-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
