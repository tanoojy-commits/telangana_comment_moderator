CREATE DATABASE IF NOT EXISTS telangana_moderation;
USE telangana_moderation;

-- Table: moderation_record
CREATE TABLE IF NOT EXISTS moderation_record (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_title TEXT NOT NULL,
    reader_name VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,
    prompt_version VARCHAR(20) DEFAULT 'v4',
    ai_response JSON NOT NULL,
    moderation_verdict ENUM('APPROVED', 'FLAGGED', 'REJECTED', 'REVIEW_NEEDED') NOT NULL,
    flag_categories JSON NOT NULL,
    confidence_score FLOAT NOT NULL,
    response_time_ms INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES moderation_record(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: template
CREATE TABLE IF NOT EXISTS template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    article_title TEXT NOT NULL,
    sample_comment TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Templates
INSERT INTO template (name, article_title, sample_comment, category) VALUES
(
    'BRS Political Rally Comment',
    'KTR addresses massive public meeting in Warangal, attacks Congress policies',
    'KTR spoke very well today. The developments in Warangal during the BRS rule were visible to everyone. The current Congress government has completely failed to deliver on its promises. Telangana needs visionary leadership back!',
    'Politics'
),
(
    'Cricket Match Trolling',
    'Sunrisers Hyderabad face Royal Challengers Bengaluru in must-win IPL clash at Uppal',
    'SRH is the worst team ever and their captain is a useless idiot. These players are fixing matches for money. I hope they lose all their matches and get kicked out of the tournament. Bunch of absolute losers!',
    'Sports'
),
(
    'Defamatory Business Comment',
    'Real Estate Boom in Hyderabad: IT Corridor expands towards Kollur and Tellapur',
    'Do not buy any apartments from XYZ Builders in Kollur. They are running a scam, using low quality steel, and bribes to get permissions. The owners are fraud and will run away with your hard-earned money just like they did in Gachibowli!',
    'Business'
),
(
    'Constructive Criticism',
    'GHMC takes up road repair works in Hyderabad after monsoon damage',
    'While the repairs are welcome, GHMC should focus on quality control. The road laid near Jubilee Hills checkpost last month is already peeling off. We need proper drainage alongside roads, otherwise this is just a waste of taxpayer money.',
    'General'
),
(
    'Spam Link Comment',
    'Telangana TSPSC Group 1 Exam results announced: Check details here',
    'Hey guys! I found an amazing way to make 50,000 Rupees a day sitting at home in Hyderabad! Just click here: http://get-rich-quick-scam.com/telangana and start earning today. 100% verified, no skills needed!',
    'Spam'
);

-- Insert Mock Moderation Records for past 14 days to populate charts beautifully
-- We will insert records with dates calculated relative to NOW() so they are always current.
INSERT INTO moderation_record (id, article_title, reader_name, comment_text, prompt_version, ai_response, moderation_verdict, flag_categories, confidence_score, response_time_ms, created_at) VALUES
(
    1,
    'Telangana Budget: Finance Minister Bhatti Vikramarka presents Rs 2.75 lakh crore budget',
    'Srinivas Rao',
    'Good budget, focusing on agriculture and free electricity schemes. Hope implementation is transparent.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.95, "flag_categories": [], "severity": "LOW", "summary": "The comment is a supportive opinion on the state budget. It contains no offensive or defamatory content.", "specific_issues": [], "recommendation": "Approve for immediate publication.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.95,
    420,
    DATE_SUB(NOW(), INTERVAL 13 DAY)
),
(
    2,
    'Telangana Budget: Finance Minister Bhatti Vikramarka presents Rs 2.75 lakh crore budget',
    'Ramesh K.',
    'This budget is complete garbage. These ministers are corrupt criminals stealing public money!',
    'v4',
    '{"verdict": "REJECTED", "confidence_score": 0.88, "flag_categories": ["abusive", "defamatory"], "severity": "HIGH", "summary": "The comment contains abusive generalizations and defamatory allegations of criminality against public officials without evidence.", "specific_issues": ["corrupt criminals stealing public money"], "recommendation": "Reject due to abusive language and defamatory claims.", "safe_to_publish": false, "suggested_edit": null}',
    'REJECTED',
    '["abusive", "defamatory"]',
    0.88,
    510,
    DATE_SUB(NOW(), INTERVAL 12 DAY)
),
(
    3,
    'Hyderabad Metro Phase 2: Detailed Project Report submitted to Government',
    'Anjali Sharma',
    'Excellent news! Connecting Gachibowli to RGIA airport will save so much travel time for techies.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.98, "flag_categories": [], "severity": "LOW", "summary": "Constructive comment expressing positive views on public transport expansion. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.98,
    380,
    DATE_SUB(NOW(), INTERVAL 11 DAY)
),
(
    4,
    'Heavy Rains in Hyderabad: Holiday declared for schools tomorrow',
    'Concerned Parent',
    'Thank you GHMC and government. The water logging near Khairatabad is dangerous for kids.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.97, "flag_categories": [], "severity": "LOW", "summary": "Comment expresses appreciation for safety precautions. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.97,
    390,
    DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
    5,
    'Congress vs BRS: Word of war erupts over Rythu Bharosa farm investment support',
    'Venkat M.',
    'Congress party members are all idiots who do not know anything about agriculture. BRS was 100 times better.',
    'v4',
    '{"verdict": "FLAGGED", "confidence_score": 0.82, "flag_categories": ["abusive", "politically_inflammatory"], "severity": "MEDIUM", "summary": "Comment contains mild insults targeting a political party. Suggest editing to remove the term \\"idiots\\".", "specific_issues": ["idiots who do not know anything"], "recommendation": "Approve with suggested edit or flag for moderation review.", "safe_to_publish": false, "suggested_edit": "Congress party members need to understand agriculture better. BRS was much better in implementation."}',
    'FLAGGED',
    '["abusive", "politically_inflammatory"]',
    0.82,
    490,
    DATE_SUB(NOW(), INTERVAL 9 DAY)
),
(
    6,
    'Singareni Collieries announces massive recruitment drive for 1200 posts',
    'Job Seeker',
    'They will sell all these jobs to people who pay bribes of 10 lakhs. No hope for genuine students.',
    'v4',
    '{"verdict": "REVIEW_NEEDED", "confidence_score": 0.75, "flag_categories": ["defamatory"], "severity": "MEDIUM", "summary": "The comment alleges systematic bribery and corruption in recruitment. This raises legal and defamatory risks for the newspaper.", "specific_issues": ["sell all these jobs to people who pay bribes"], "recommendation": "Hold for editorial review. Alleges corruption without evidence.", "safe_to_publish": false, "suggested_edit": null}',
    'REVIEW_NEEDED',
    '["defamatory"]',
    0.75,
    460,
    DATE_SUB(NOW(), INTERVAL 8 DAY)
),
(
    7,
    'Hyderabad real estate prices soar: Gachibowli crosses Rs 12,000 per sq ft',
    'Investor_99',
    'Invest in cryptocurrency instead of real estate! Click here to triple your money in 2 days: bit.ly/easy-crypto-hyderabad',
    'v4',
    '{"verdict": "REJECTED", "confidence_score": 0.99, "flag_categories": ["spam"], "severity": "CRITICAL", "summary": "The comment is a spam link promoting crypto-scams. Not relevant to the article.", "specific_issues": ["spam cryptocurrency link"], "recommendation": "Reject and blacklist user IP if possible.", "safe_to_publish": false, "suggested_edit": null}',
    'REJECTED',
    '["spam"]',
    0.99,
    410,
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    8,
    'TSRTC to add 500 new electric buses to Hyderabad fleet by year-end',
    'Daily Commuter',
    'Great step towards reducing pollution. RTC drivers also need training on safe driving in city traffic.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.96, "flag_categories": [], "severity": "LOW", "summary": "Constructive criticism and appreciation of public transport modernization. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.96,
    400,
    DATE_SUB(NOW(), INTERVAL 6 DAY)
),
(
    9,
    'Osmania University students protest over hostel facilities and food quality',
    'OU Alumnus',
    'Sad to see the state of OU. It was once the pride of Telangana. Government should release funds immediately.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.95, "flag_categories": [], "severity": "LOW", "summary": "Constructive comment urging government support for student welfare. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.95,
    370,
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
    10,
    'Controversy over new movie teaser: Police complaint filed in Hyderabad',
    'Movie Buff',
    'These filmmakers are targeting our religion. We will burn down the theatres if they release this movie!',
    'v4',
    '{"verdict": "REJECTED", "confidence_score": 0.94, "flag_categories": ["politically_inflammatory", "legal_risk"], "severity": "CRITICAL", "summary": "The comment incites violence and vandalism (burning down theatres) over religious sentiments.", "specific_issues": ["burn down the theatres"], "recommendation": "Reject immediately and log user details. High risk.", "safe_to_publish": false, "suggested_edit": null}',
    'REJECTED',
    '["politically_inflammatory", "legal_risk"]',
    0.94,
    550,
    DATE_SUB(NOW(), INTERVAL 4 DAY)
),
(
    11,
    'Telangana DGP warns against fake news circulating on WhatsApp',
    'Satish Kumar',
    'Good warning. People should verify news on portals like Telangana Today before sharing blindly.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.98, "flag_categories": [], "severity": "LOW", "summary": "Supportive and helpful comment endorsing responsible media consumption. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.98,
    390,
    DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
    12,
    'Telangana DGP warns against fake news circulating on WhatsApp',
    'Anil Kumar',
    'The police chief himself is a liar, working under the orders of ruling politicians to suppress opposition!',
    'v4',
    '{"verdict": "FLAGGED", "confidence_score": 0.85, "flag_categories": ["defamatory", "politically_inflammatory"], "severity": "HIGH", "summary": "Comment contains defamatory claims against the Director General of Police, accusing them of bias and corruption.", "specific_issues": ["police chief himself is a liar"], "recommendation": "Reject or edit to tone down defamatory accusation before publishing.", "safe_to_publish": false, "suggested_edit": "There is a perception that police actions are sometimes politically motivated."}',
    'FLAGGED',
    '["defamatory", "politically_inflammatory"]',
    0.85,
    490,
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    13,
    'Slight rise in Covid-19 cases in Hyderabad; Health Department issues advisory',
    'Healer S.',
    'Do not believe this fake Covid news. It is a conspiracy by pharma companies to sell vaccines. Drink neem juice daily to cure all diseases.',
    'v4',
    '{"verdict": "REVIEW_NEEDED", "confidence_score": 0.81, "flag_categories": ["misinformation"], "severity": "MEDIUM", "summary": "Comment contains medical misinformation, dismissing Covid-19 as a conspiracy and suggesting unverified home remedies.", "specific_issues": ["fake Covid news", "conspiracy by pharma companies", "neem juice daily to cure all diseases"], "recommendation": "Hold for review. Disseminates potentially harmful medical misinformation.", "safe_to_publish": false, "suggested_edit": null}',
    'REVIEW_NEEDED',
    '["misinformation"]',
    0.81,
    520,
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
(
    14,
    'Hyderabad Metro Phase 2: Detailed Project Report submitted to Government',
    'Nagesh Goud',
    'Laying routes through old city is very important. Hope MIM and Congress do not play politics here.',
    'v4',
    '{"verdict": "APPROVED", "confidence_score": 0.90, "flag_categories": [], "severity": "LOW", "summary": "Expresses standard opinion on infrastructure priority and concerns about political interference. Safe to publish.", "specific_issues": [], "recommendation": "Approve.", "safe_to_publish": true, "suggested_edit": null}',
    'APPROVED',
    '[]',
    0.90,
    410,
    NOW()
);

-- Insert Mock Feedback
INSERT INTO feedback (record_id, rating, comment, created_at) VALUES
(1, 5, 'Highly accurate moderation. Captures context well.', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(2, 4, 'Correct decision, though the response time was slightly high.', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 5, 'Perfectly approved.', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(5, 4, 'Suggested edit is a bit formal, but usable.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(7, 5, 'Standard spam blocked successfully.', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(8, 5, 'Perfect categorization.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, 5, 'Critical safety issue identified immediately.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(12, 3, 'Decent detection but suggested edit completely changes the meaning.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(13, 4, 'Misinformation flagged correctly.', DATE_SUB(NOW(), INTERVAL 1 DAY));
