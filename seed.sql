-- Seed AI Tools
INSERT OR IGNORE INTO ai_tools (id, name, slug, description, category, website) VALUES
(1, 'ChatGPT', 'chatgpt', 'Conversational AI, code assistance, and content generation model by OpenAI.', 'General Assistant', 'https://chatgpt.com'),
(2, 'Microsoft Copilot', 'microsoft-copilot', 'Enterprise AI assistant integrated across Microsoft 365, Windows, and GitHub.', 'Productivity', 'https://copilot.microsoft.com'),
(3, 'Claude', 'claude', 'Advanced AI assistant focused on deep reasoning, coding, and analysis by Anthropic.', 'General Assistant', 'https://claude.ai'),
(4, 'Adobe Firefly', 'adobe-firefly', 'Generative AI model family for visual creative content and image editing by Adobe.', 'Design & Creative', 'https://firefly.adobe.com'),
(5, 'Midjourney', 'midjourney', 'Generative AI tool for producing high-quality imagery from natural language prompts.', 'Design & Creative', 'https://midjourney.com'),
(6, 'GitHub Copilot', 'github-copilot', 'AI pair programmer providing inline code completions and developer support.', 'Development', 'https://github.com/features/copilot'),
(7, 'Siemens Industrial Copilot', 'siemens-industrial-copilot', 'AI assistant tailored for industrial manufacturing, PLC programming, and automation.', 'Industrial Automation', 'https://www.siemens.com'),
(8, 'Brainomix e-Stroke', 'brainomix-estroke', 'Medical imaging AI software for rapid stroke diagnosis and decision support.', 'Healthcare AI', 'https://www.brainomix.com');

-- Seed BBC Entity & Revisions
INSERT OR IGNORE INTO entities (id, slug, name, type, industry, country, current_revision_id, created_at, updated_at) VALUES
(1, 'bbc', 'BBC', 'organisation', 'Media & Broadcasting', 'United Kingdom', 3, '2026-08-05T10:00:00Z', '2026-08-10T14:30:00Z');

INSERT OR IGNORE INTO entity_revisions (id, entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES
(1, 1, 1, NULL, '{"name":"BBC","type":"organisation","industry":"Media & Broadcasting","country":"United Kingdom","description":"BBC uses AI in areas such as research and content production documented by publicly available sources.","ai_uses":["Research","Content Production"],"ai_tools":["ChatGPT"],"sources":[{"title":"BBC Media Centre: AI Principles","url":"https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles"}]}', 'Initial entry created', 'Anonymous Contributor #1042', '2026-08-05T10:00:00Z'),
(2, 1, 2, 1, '{"name":"BBC","type":"organisation","industry":"Media & Broadcasting","country":"United Kingdom","description":"BBC uses AI in areas such as research, content production and productivity tools across teams.","ai_uses":["Research","Content Production","Productivity"],"ai_tools":["ChatGPT","Microsoft Copilot"],"sources":[{"title":"BBC Media Centre: AI Principles","url":"https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles"},{"title":"BBC Tech Blog: Microsoft Copilot Pilot","url":"https://www.bbc.co.uk/rd/blog/copilot-enterprise"}]}', 'Added Microsoft Copilot tools', 'Anonymous Contributor #3391', '2026-08-08T11:20:00Z'),
(3, 1, 3, 2, '{"name":"BBC","type":"organisation","industry":"Media & Broadcasting","country":"United Kingdom","description":"BBC uses AI in areas such as accessibility, research, content production, translation and visual asset workflows documented by publicly available sources.","ai_uses":["Accessibility","Research","Content Production","Translation"],"ai_tools":["Microsoft Copilot","Adobe Firefly","ChatGPT"],"sources":[{"title":"BBC Media Centre: AI Principles","url":"https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles"},{"title":"BBC R&D: Exploring Generative AI for Accessibility","url":"https://www.bbc.co.uk/rd/projects/ai-accessibility"},{"title":"Adobe & BBC: Creative Cloud AI Integration","url":"https://news.adobe.com/bbc-firefly-workflows"}]}', 'Added accessibility and translation AI uses with Adobe Firefly', 'Anonymous Contributor #9021', '2026-08-10T14:30:00Z');

-- Seed Siemens Entity & Revision
INSERT OR IGNORE INTO entities (id, slug, name, type, industry, country, current_revision_id, created_at, updated_at) VALUES
(2, 'siemens', 'Siemens', 'company', 'Industrial Automation', 'Germany', 4, '2026-08-06T09:15:00Z', '2026-08-09T16:45:00Z');

INSERT OR IGNORE INTO entity_revisions (id, entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES
(4, 2, 1, NULL, '{"name":"Siemens","type":"company","industry":"Industrial Automation","country":"Germany","description":"Siemens collaborates with AI vendors to deploy generative AI assistants in smart manufacturing plants to accelerate code generation for programmable logic controllers (PLCs).","ai_uses":["Industrial Automation","Predictive Maintenance","Code Automation"],"ai_tools":["Siemens Industrial Copilot","Microsoft Copilot"],"sources":[{"title":"Siemens Press Release: Generative AI in Manufacturing","url":"https://press.siemens.com/global/en/pressrelease/siemens-and-microsoft-drive-generative-ai-adoption"}]}', 'Created Siemens entry detailing Industrial Copilot deployment', 'Anonymous Contributor #5821', '2026-08-06T09:15:00Z');

-- Seed NHS Entity & Revision
INSERT OR IGNORE INTO entities (id, slug, name, type, industry, country, current_revision_id, created_at, updated_at) VALUES
(3, 'nhs', 'NHS (National Health Service)', 'government', 'Healthcare', 'United Kingdom', 5, '2026-08-04T14:00:00Z', '2026-08-10T11:10:00Z');

INSERT OR IGNORE INTO entity_revisions (id, entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES
(5, 3, 1, NULL, '{"name":"NHS (National Health Service)","type":"government","industry":"Healthcare","country":"United Kingdom","description":"The NHS uses AI diagnostic software across hospitals in England to speed up brain scan analysis for stroke victims and assist radiologists.","ai_uses":["Medical Imaging","Diagnostic Assistance","Patient Triage"],"ai_tools":["Brainomix e-Stroke"],"sources":[{"title":"NHS England: AI stroke imaging technology rollout","url":"https://www.england.nhs.uk/2023/12/ai-stroke-imaging-tech"}]}', 'Created NHS entry with stroke diagnostic AI tools', 'Anonymous Contributor #7712', '2026-08-04T14:00:00Z');

-- Seed Duolingo
INSERT OR IGNORE INTO entities (id, slug, name, type, industry, country, current_revision_id, created_at, updated_at) VALUES
(4, 'duolingo', 'Duolingo', 'company', 'Education & EdTech', 'United States', 6, '2026-08-03T08:30:00Z', '2026-08-07T13:20:00Z');

INSERT OR IGNORE INTO entity_revisions (id, entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES
(6, 4, 1, NULL, '{"name":"Duolingo","type":"company","industry":"Education & EdTech","country":"United States","description":"Duolingo utilizes OpenAI models for Duolingo Max features including Explain My Answer and conversational AI roleplay for language learners.","ai_uses":["Language Learning","Conversational AI","Automated Content Generation"],"ai_tools":["ChatGPT"],"sources":[{"title":"Duolingo Blog: Introducing Duolingo Max","url":"https://blog.duolingo.com/duolingo-max"}]}', 'Added Duolingo Max AI features with GPT-4', 'Anonymous Contributor #1940', '2026-08-03T08:30:00Z');

-- Seed Klarna
INSERT OR IGNORE INTO entities (id, slug, name, type, industry, country, current_revision_id, created_at, updated_at) VALUES
(5, 'klarna', 'Klarna', 'company', 'Fintech & Payments', 'Sweden', 7, '2026-08-02T12:00:00Z', '2026-08-08T15:00:00Z');

INSERT OR IGNORE INTO entity_revisions (id, entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES
(7, 5, 1, NULL, '{"name":"Klarna","type":"company","industry":"Fintech & Payments","country":"Sweden","description":"Klarna deployed an AI customer service assistant powered by OpenAI that handles two-thirds of customer service chats across 23 countries.","ai_uses":["Customer Support","Marketing Assets","Translation"],"ai_tools":["ChatGPT","Midjourney"],"sources":[{"title":"Klarna Press: AI Assistant handles 2/3 of customer chats","url":"https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats"}]}', 'Added Klarna customer service AI assistant details', 'Anonymous Contributor #8841', '2026-08-02T12:00:00Z');
