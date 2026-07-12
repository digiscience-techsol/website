#!/usr/bin/env perl
use strict;
use warnings;
use File::Find;

my $nav = <<'HTML';
<nav class="nav-links" id="navLinks"><a href="/">Home</a><div class="nav-group"><a href="/services">Services</a><div class="nav-dropdown"><a href="/solutions/ai-strategy-readiness">AI Strategy &amp; Readiness<span>Prioritize opportunities and build the roadmap</span></a><a href="/solutions/industry-ai-transformation">Industry AI Transformation<span>Build outcome-led AI workflows</span></a><a href="/45-day-ai-pilot">45-Day AI Pilot<span>Prove one use case before scale</span></a><a href="/solutions/secure-ai-cloud-platform">Secure AI Cloud Platform<span>Establish the production foundation</span></a><a href="/solutions/responsible-ai-governance">Responsible AI Governance<span>Control model and agent risk</span></a><a href="/solutions/ai-ready-devops">AI-Ready DevOps<span>Industrialize MLOps and LLMOps</span></a><a href="/solutions/cloud-modernization-ai-readiness">Cloud Modernization<span>Prepare applications, data and platforms for AI</span></a></div></div><div class="nav-group"><a href="/industries">Industries</a><div class="nav-dropdown"><a href="/industries/manufacturing-ai">Manufacturing AI<span>Maintenance, quality and plant intelligence</span></a><a href="/industries/bfsi-compliance-intelligence">BFSI Intelligence<span>Compliance, KYC, fraud and audit</span></a><a href="/industries/healthcare-ai">Healthcare AI<span>Secure, human-reviewed operations workflows</span></a><a href="/industries/legal-document-intelligence">Legal Document Intelligence<span>Contracts, clauses and obligations</span></a><a href="/industries">All industries<span>Retail, logistics, HR and public sector</span></a></div></div><div class="nav-group"><a href="/how-we-deliver">How We Deliver</a><div class="nav-dropdown"><a href="/ai-readiness-assessment">AI Readiness Assessment<span>Score value, feasibility and risk</span></a><a href="/45-day-ai-pilot">45-Day Pilot<span>Build, validate and decide</span></a><a href="/customer-onboarding">Production Scale-Up<span>Move from proof to governed operations</span></a><a href="/pricing">Engagement Models<span>Choose the right commercial starting point</span></a></div></div><div class="nav-group"><a href="/proof-assets">Resources</a><div class="nav-dropdown"><a href="/proof-assets">Architectures &amp; Insights<span>Blueprints, playbooks and solution briefs</span></a><a href="/proof-assets/secure-ai-landing-zone-blueprint">AI Landing Zone Blueprint<span>Identity, network, observability and cost</span></a><a href="/proof-assets/responsible-ai-governance-checklist">AI Governance Playbook<span>Controls for models, prompts and agents</span></a></div></div><a href="/about">About</a><a href="/contact" class="btn btn-primary nav-cta">Book AI Strategy Call</a></nav>
HTML
chomp $nav;

my $footer = <<'HTML';
<div class="footer-links"><a href="/services">Services</a><a href="/industries">Industries</a><a href="/how-we-deliver">How We Deliver</a><a href="/ai-readiness-assessment">AI Readiness</a><a href="/45-day-ai-pilot">45-Day Pilot</a><a href="/proof-assets">Resources</a><a href="/pricing">Engagement Models</a><a href="/about">About</a><a href="/contact">Contact</a></div>
HTML
chomp $footer;

my @files;
find(
  {
    wanted => sub {
      return if $File::Find::dir =~ m{(?:^|/)ops(?:/|$)};
      push @files, $File::Find::name if -f $_ && $_ =~ /\.html$/;
    },
    no_chdir => 1,
  },
  '.'
);

for my $file (@files) {
  open my $in, '<', $file or die "Cannot read $file: $!";
  local $/;
  my $content = <$in>;
  close $in;

  my $changed = 0;
  $changed += ($content =~ s{<nav class="nav-links" id="navLinks">.*?</nav>}{$nav}sg);
  $changed += ($content =~ s{<div class="footer-links">.*?</div>}{$footer}sg);
  next unless $changed;

  open my $out, '>', $file or die "Cannot write $file: $!";
  print {$out} $content;
  close $out;
}

print "Updated shared navigation in " . scalar(@files) . " public HTML files.\n";
