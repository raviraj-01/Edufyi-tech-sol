import re, pathlib

f = pathlib.Path('frontend/index.html')
html = f.read_text(encoding='utf-8')

# 1. About section: add divider before, eyebrow animate, shimmer title, stagger grid
html = html.replace(
    '    <!-- About Section -->\n    <section',
    '    <!-- About Section -->\n    <div class="section-divider"><div class="section-divider-line"></div></div>\n    <section'
)
html = html.replace(
    '<span class="section-eyebrow">About UpFound</span>',
    '<span class="section-eyebrow section-eyebrow-animate">About UpFound</span>'
)
html = html.replace(
    '<h2 class="section-title" id="about-title">Built for Early Stage Builders</h2>',
    '<h2 class="section-title" id="about-title" data-shimmer>Built for Early Stage Builders</h2>'
)
html = html.replace(
    '<div class="about-grid">',
    '<div class="about-grid" data-stagger data-stagger-delay="120">'
)
# Second about card gets stagger-item right reveal
html = html.replace(
    '<div class="about-card glass">\n          <h3>Ecosystem',
    '<div class="about-card glass" data-stagger-item data-reveal-from="right">\n          <h3>Ecosystem'
)

# 2. Services section: divider before, shimmer, stagger
html = html.replace(
    '    <!-- Services Section -->\n    <section',
    '    <!-- Services Section -->\n    <div class="section-divider"><div class="section-divider-line"></div></div>\n    <section'
)
html = html.replace(
    '<span class="section-eyebrow">What We Offer</span>',
    '<span class="section-eyebrow section-eyebrow-animate">What We Offer</span>'
)
html = html.replace(
    '<h2 class="section-title" id="services-title">Comprehensive Startup Support</h2>',
    '<h2 class="section-title" id="services-title" data-shimmer>Comprehensive Startup Support</h2>'
)
html = html.replace(
    '<div class="services-grid">',
    '<div class="services-grid" data-stagger data-stagger-delay="110">'
)
html = re.sub(r'<div class="service-card glass">', '<div class="service-card glass" data-stagger-item data-reveal-from="scale">', html)

# 3. Solution section: divider before, shimmer, stagger
html = html.replace(
    '    <!-- Solution Section -->\n    <section',
    '    <!-- Solution Section -->\n    <div class="section-divider"><div class="section-divider-line"></div></div>\n    <section'
)
html = html.replace(
    '<span class="section-eyebrow">Our Process</span>',
    '<span class="section-eyebrow section-eyebrow-animate">Our Process</span>'
)
html = html.replace(
    '<h2 class="section-title" id="solution-title">From Application to Funding</h2>',
    '<h2 class="section-title" id="solution-title" data-shimmer>From Application to Funding</h2>'
)
html = html.replace(
    '<div class="steps-grid">',
    '<div class="steps-grid" data-stagger data-stagger-delay="130">'
)
html = re.sub(r'<div class="step-card glass">', '<div class="step-card glass" data-stagger-item>', html)

# 4. Pricing section: divider before, shimmer
html = html.replace(
    '    <!-- Pricing Section -->',
    '    <!-- Pricing Section -->\n    <div class="section-divider"><div class="section-divider-line"></div></div>'
)
html = html.replace(
    '<span class="section-eyebrow">Investment Tiers</span>',
    '<span class="section-eyebrow section-eyebrow-animate">Investment Tiers</span>'
)
html = html.replace(
    '<h2 class="section-title" id="pricing-title">Choose Your Path</h2>',
    '<h2 class="section-title" id="pricing-title" data-shimmer>Choose Your Path</h2>'
)

# 5. FAQ section: divider before
html = html.replace(
    '    <!-- FAQ Section -->',
    '    <!-- FAQ Section -->\n    <div class="section-divider"><div class="section-divider-line"></div></div>'
)

f.write_text(html, encoding='utf-8')
print('Done. Changes applied successfully.')
