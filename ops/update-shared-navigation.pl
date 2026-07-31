#!/usr/bin/env perl
use strict;
use warnings;
use File::Find;

my $nav = <<'HTML';
<nav class="nav-links" id="navLinks"><a href="/">Home</a><div class="nav-group"><a href="/services">Solutions</a><div class="nav-dropdown"><a href="/solution-assessment">Choose the right path<span>Assess one defined problem before implementation</span></a><a href="/solutions/ai-strategy-readiness">Prioritize AI opportunities<span>Score value, feasibility and risk</span></a><a href="/45-day-ai-pilot">Prove one workflow<span>Run a bounded pilot before scale</span></a><a href="/solutions/secure-ai-cloud-platform">Build a secure AI foundation<span>Establish cloud, identity and operations controls</span></a><a href="/solutions/cloud-modernization-ai-readiness">Modernize the platform<span>Prepare applications, data and delivery systems</span></a></div></div><div class="nav-group"><a href="/industries">Industry Workflows</a><div class="nav-dropdown"><a href="/industries/manufacturing-ai">Manufacturing and assets<span>Maintenance, quality and plant intelligence</span></a><a href="/industries/bfsi-compliance-intelligence">BFSI and compliance<span>KYC, fraud, audit and risk workflows</span></a><a href="/industries/healthcare-ai">Healthcare operations<span>Secure, human-reviewed workflows</span></a><a href="/industries/legal-document-intelligence">Legal and document work<span>Contracts, clauses and obligations</span></a><a href="/industries">Explore all workflows<span>Retail, logistics, HR and more</span></a></div></div><a href="/how-we-deliver">How We Deliver</a><div class="nav-group"><a href="/proof-assets">Proof &amp; Blueprints</a><div class="nav-dropdown"><a href="/proof-assets/sample-solution-assessment">Sample assessment output<span>Representative decision package using a synthetic scenario</span></a><a href="/proof-assets">Proof asset library<span>Blueprints, scorecards and delivery frameworks</span></a><a href="/proof-assets/secure-ai-landing-zone-blueprint">AI landing zone blueprint<span>Identity, network, observability and cost</span></a><a href="/proof-assets/responsible-ai-governance-checklist">AI governance checklist<span>Controls for models, prompts and agents</span></a></div></div><a href="/about">About</a><a href="/contact" class="btn btn-primary nav-cta">Discuss Your Problem</a></nav>
HTML
chomp $nav;

my $footer = <<'HTML';
<div class="footer-links"><a href="/services">Solutions</a><a href="/industries">Industry Workflows</a><a href="/how-we-deliver">How We Deliver</a><a href="/solution-assessment">Solution Assessment</a><a href="/ai-readiness-assessment">AI Readiness</a><a href="/45-day-ai-pilot">45-Day Pilot</a><a href="/proof-assets/sample-solution-assessment">Sample Assessment</a><a href="/proof-assets">Proof &amp; Blueprints</a><a href="/pricing">Engagement Models</a><a href="/about">About</a><a href="/contact">Contact</a></div>
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
