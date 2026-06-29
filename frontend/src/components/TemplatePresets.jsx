import React from 'react';

export default function TemplatePresets({ onUseTemplate }) {
  const presets = [
    {
      id: 1,
      name: "Clean Reader Opinion",
      category: "Positive",
      article_title: "Telangana government distributes free tablets to students",
      comment_text: "This is an excellent initiative. Education technology can really help rural students. I hope the quality of the tablets is good and teachers receive proper training too.",
      likelyVerdict: "ALLOW",
      dotColor: "#10B981"
    },
    {
      id: 2,
      name: "Constructive Criticism",
      category: "Constructive",
      article_title: "New metro rail extension announced for Secunderabad",
      comment_text: "The article should have mentioned the cost and how it is being funded. Infrastructure projects like this need more financial transparency.",
      likelyVerdict: "ALLOW",
      dotColor: "#10B981"
    },
    {
      id: 3,
      name: "Borderline Political",
      category: "Borderline",
      article_title: "CM attends groundbreaking ceremony for new IT park",
      comment_text: "Every government announces IT parks before elections. Nothing ever gets completed on time. The people of Telangana deserve better accountability.",
      likelyVerdict: "NEEDS_REVIEW",
      dotColor: "#F59E0B"
    },
    {
      id: 4,
      name: "Abusive Comment",
      category: "Abusive",
      article_title: "Opposition holds dharna against new land policy",
      comment_text: "These opposition leaders are absolute idiots. They have no constructive ideas. Just useless troublemakers wasting everyone's time.",
      likelyVerdict: "REJECT",
      dotColor: "#EF4444"
    },
    {
      id: 5,
      name: "Defamatory",
      category: "Defamation",
      article_title: "Municipality tenders awarded for road construction",
      comment_text: "Everyone knows the municipal commissioner accepts bribes from contractors. This tender was clearly fixed. He should be arrested immediately.",
      likelyVerdict: "REJECT",
      dotColor: "#EF4444"
    },
    {
      id: 6,
      name: "Hate Speech",
      category: "Hate Speech",
      article_title: "Religious festival celebrated across Hyderabad",
      comment_text: "Supporters of Party X are all anti-nationals and traitors. These people should never be trusted. They are destroying Telangana's culture.",
      likelyVerdict: "REJECT",
      dotColor: "#EF4444"
    },
    {
      id: 7,
      name: "Green Transit Feedback",
      category: "Constructive",
      article_title: "Telangana RTC introduces 50 new electric buses in Hyderabad",
      comment_text: "Excellent move to promote green transport! However, they should prioritize routes leading to the IT corridor like Gachibowli and Hitech City where traffic congestion is at its peak.",
      likelyVerdict: "ALLOW",
      dotColor: "#10B981"
    },
    {
      id: 8,
      name: "Weavers Support Praise",
      category: "Positive",
      article_title: "Telangana launches direct financial assistance for handloom weavers",
      comment_text: "Our traditional weavers have been suffering for years due to cheaper powerloom competition. This direct assistance will help them buy raw materials and keep their craft alive. Kudos to the government!",
      likelyVerdict: "ALLOW",
      dotColor: "#10B981"
    },
    {
      id: 9,
      name: "Civic Policy Discontent",
      category: "Borderline",
      article_title: "Municipal administration initiates cleanup drive for Musi River",
      comment_text: "We have heard about Musi cleanup projects for the last 15 years under multiple governments, but nothing changes. Hundreds of crores are allocated, but where is the money going? We need audit transparency.",
      likelyVerdict: "NEEDS_REVIEW",
      dotColor: "#F59E0B"
    },
    {
      id: 10,
      name: "Hostile Governance Abuse",
      category: "Abusive",
      article_title: "New government administrative complex inaugurated in Warangal",
      comment_text: "What a colossal waste of taxpayer funds! These ministers are corrupt thieves who only care about building luxury palaces for themselves while the general public suffers in garbage-filled streets. Absolute clowns.",
      likelyVerdict: "REJECT",
      dotColor: "#EF4444"
    },
    {
      id: 11,
      name: "Commercial Promotion",
      category: "Spam",
      article_title: "Hyderabad real estate sees 15% growth in Q1",
      comment_text: "Looking for affordable plots in Shadnagar? Best rates and high returns guaranteed! Contact Srinivas at 9876543210 for brochure and site visits today!",
      likelyVerdict: "REJECT",
      dotColor: "#EF4444"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--ink)', fontWeight: 700, marginBottom: '4px' }}>
          Moderation Templates
        </h1>
        <p className="page-subtitle">One-click sample comments for testing</p>
      </div>

      <div className="divider" />

      {/* Grid */}
      <div className="templates-grid">
        {presets.map((preset) => {
          let categoryBg = 'var(--allow-badge)';
          let categoryText = 'var(--allow-text)';
          if (preset.likelyVerdict === 'NEEDS_REVIEW') {
            categoryBg = 'var(--review-badge)';
            categoryText = 'var(--review-text)';
          } else if (preset.likelyVerdict === 'REJECT') {
            categoryBg = 'var(--reject-badge)';
            categoryText = 'var(--reject-text)';
          }

          // Truncate comment preview (3 lines)
          const truncatedComment = preset.comment_text.length > 130
            ? preset.comment_text.substring(0, 130) + '...'
            : preset.comment_text;

          return (
            <div
              key={preset.id}
              className="card hover-lift"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                minHeight: '220px'
              }}
            >
              {/* Top Meta info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                    {preset.name}
                  </h3>
                  
                  <span
                    className="badge-pill"
                    style={{
                      backgroundColor: categoryBg,
                      color: categoryText,
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {preset.category}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Article Context:
                </p>
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '8px' }}>
                  "{preset.article_title}"
                </p>
                
                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  "{truncatedComment}"
                </p>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                {/* Likely verdict indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: preset.dotColor
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
                    Likely: {preset.likelyVerdict}
                  </span>
                </div>

                <button
                  onClick={() => onUseTemplate({
                    article_title: preset.article_title,
                    reader_name: preset.category === 'Positive' ? 'Suresh Reddy' : preset.category === 'Constructive' ? 'Reader' : 'Anonymous',
                    comment_text: preset.comment_text
                  })}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--sidebar-active-border)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  Use Template →
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
