-- Seed file: Predefined interests for Paixao
-- Categories: kink, activity, social, lifestyle

INSERT INTO public.interests (name, category, description) VALUES

-- =============================================================================
-- KINK (20 entries)
-- =============================================================================
('Bondage', 'kink', 'Restraint play including rope, cuffs, and ties'),
('Role-Play', 'kink', 'Acting out fantasies and scenarios with partners'),
('Sensory Play', 'kink', 'Stimulation through blindfolds, feathers, ice, wax, and textures'),
('Impact Play', 'kink', 'Spanking, flogging, paddling, and other forms of consensual impact'),
('Dominance', 'kink', 'Taking the lead, giving commands, and controlling scenes'),
('Submission', 'kink', 'Yielding control, following commands, and serving a partner'),
('Switching', 'kink', 'Alternating between dominant and submissive roles'),
('Power Exchange', 'kink', 'Structured D/s dynamics and authority transfer'),
('Edging', 'kink', 'Prolonged arousal and orgasm control techniques'),
('Sensation Play', 'kink', 'Exploring pleasure and pain thresholds through varied stimulation'),
('Rope Bondage (Shibari)', 'kink', 'Japanese-inspired decorative and functional rope tying'),
('Pet Play', 'kink', 'Adopting animal personas within a power dynamic'),
('Leather', 'kink', 'Leather culture, gear, and associated protocols'),
('Latex / Rubber', 'kink', 'Wearing and appreciating latex and rubber garments'),
('Foot Fetish', 'kink', 'Appreciation and worship of feet'),
('Wax Play', 'kink', 'Dripping warm wax on the body for sensation'),
('Electro Play', 'kink', 'Using low-current electrical devices for stimulation'),
('Breath Play Awareness', 'kink', 'Understanding and discussing breath restriction (education-focused)'),
('Praise Kink', 'kink', 'Arousal through verbal affirmation and compliments'),
('Degradation', 'kink', 'Consensual humiliation and verbal degradation play'),

-- =============================================================================
-- ACTIVITY (12 entries)
-- =============================================================================
('Dancing', 'activity', 'Sensual or social dancing including salsa, bachata, and freestyle'),
('Massage', 'activity', 'Sensual and erotic massage techniques'),
('Tantric Practice', 'activity', 'Tantra-inspired breathwork, energy exchange, and slow intimacy'),
('Body Painting', 'activity', 'Artistic expression using the body as a canvas'),
('Photography', 'activity', 'Boudoir, artistic nude, and erotic photography'),
('Yoga', 'activity', 'Partner yoga, nude yoga, and flexibility practice'),
('Meditation', 'activity', 'Guided meditation, breathwork, and mindfulness'),
('Pole Dancing', 'activity', 'Pole fitness and sensual movement'),
('Burlesque', 'activity', 'The art of tease, striptease performance, and appreciation'),
('Cooking Together', 'activity', 'Aphrodisiac cooking, intimate dinners, and food play'),
('Hot Tub / Spa', 'activity', 'Socializing and connecting in spa and hot-tub settings'),
('Game Nights', 'activity', 'Adult card games, truth-or-dare, and icebreaker activities'),

-- =============================================================================
-- SOCIAL (10 entries)
-- =============================================================================
('Deep Conversation', 'social', 'Meaningful discussions about intimacy, desire, and connection'),
('Voyeurism', 'social', 'Consensual enjoyment of watching others'),
('Exhibitionism', 'social', 'Consensual enjoyment of being watched'),
('Group Socializing', 'social', 'Meeting and mingling in group settings'),
('Mentorship', 'social', 'Teaching or learning from experienced community members'),
('Munches', 'social', 'Casual, non-play social gatherings for the kink community'),
('Speed Dating', 'social', 'Structured quick-connection events'),
('Workshops', 'social', 'Educational sessions on techniques, safety, and exploration'),
('After-Party Socializing', 'social', 'Late-night casual hangouts after events'),
('Online Chat', 'social', 'Virtual flirting, sexting, and digital connection'),

-- =============================================================================
-- LIFESTYLE (10 entries)
-- =============================================================================
('Polyamory', 'lifestyle', 'Ethical non-monogamy with multiple romantic relationships'),
('Swinging', 'lifestyle', 'Partner swapping and couple-based sexual exploration'),
('Open Relationship', 'lifestyle', 'Committed partnerships with freedom to explore outside'),
('Monogamish', 'lifestyle', 'Mostly monogamous with occasional agreed-upon flexibility'),
('Relationship Anarchy', 'lifestyle', 'Rejecting hierarchical relationship structures'),
('Hotwifing / Cuckold', 'lifestyle', 'Consensual dynamics involving a partner engaging with others'),
('FLR (Female-Led Relationship)', 'lifestyle', 'Relationships where the female partner leads decision-making'),
('24/7 Dynamic', 'lifestyle', 'Full-time power exchange lifestyle'),
('Nudism / Naturism', 'lifestyle', 'Social nudity and body-positive living'),
('Ethical Hedonism', 'lifestyle', 'Pursuing pleasure responsibly and with full consent')

ON CONFLICT (name) DO NOTHING;
