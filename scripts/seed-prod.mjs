/**
 * Seed production D1 database via the live REST API.
 * All evidence sourced from publicly available sources.
 * Each AI use case has evidence attached directly as a claim.
 * Run: node scripts/seed-prod.mjs
 */

const BASE_URL = process.env.BASE_URL || 'https://whousesai.yama-builds.workers.dev';

const entities = [
  {
    content: {
      name: 'Microsoft',
      type: 'company',
      industry: 'Technology',
      country: 'United States',
      description:
        'Microsoft has deeply integrated AI across its product portfolio. Azure OpenAI Service provides enterprise access to GPT-4 and other models. Copilot is embedded in Microsoft 365, Windows, and GitHub.',
      claims: [
        {
          use: 'Productivity & Office Automation',
          tool: 'Microsoft Copilot',
          note: 'Copilot is embedded across Microsoft 365 (Word, Excel, Outlook, Teams) to draft content, summarise emails, and automate workflows.',
          sources: [
            { title: 'Introducing Microsoft 365 Copilot', url: 'https://www.microsoft.com/en-us/microsoft-365/blog/2023/03/16/introducing-microsoft-365-copilot-your-copilot-for-work/' },
          ],
        },
        {
          use: 'Developer Tools',
          tool: 'GitHub Copilot',
          note: 'GitHub Copilot provides AI-assisted code completions and chat for developers inside VS Code and other IDEs.',
          sources: [
            { title: 'GitHub Copilot – Official page', url: 'https://github.com/features/copilot' },
          ],
        },
        {
          use: 'Cloud AI Platform',
          tool: 'Azure OpenAI Service',
          note: 'Azure OpenAI Service gives enterprises managed access to GPT-4, DALL·E, and other foundation models with enterprise compliance.',
          sources: [
            { title: 'Azure OpenAI Service overview', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' },
          ],
        },
        {
          use: 'Security Operations',
          tool: 'Microsoft Copilot for Security',
          note: 'Copilot for Security helps security analysts triage threats, summarise incidents, and generate remediation scripts in natural language.',
          sources: [
            { title: 'Introducing Microsoft Security Copilot', url: 'https://blogs.microsoft.com/blog/2023/03/28/introducing-microsoft-security-copilot/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'NHS England',
      type: 'government',
      industry: 'Healthcare',
      country: 'United Kingdom',
      description:
        'NHS England has published a national AI strategy and runs a dedicated AI and Digital Transformation programme. It has approved several AI-powered diagnostic tools for use across trusts.',
      claims: [
        {
          use: 'Radiology & Diagnostic Imaging',
          tool: 'Brainomix e-Stroke',
          note: 'Brainomix e-Stroke analyses CT scans to rapidly identify stroke patients eligible for treatment, deployed across NHS trusts.',
          sources: [
            { title: 'Brainomix e-Stroke approved by NICE', url: 'https://www.nice.org.uk/guidance/mtg69' },
          ],
        },
        {
          use: 'National AI Strategy & Governance',
          note: 'NHS England published a framework for AI in the NHS covering governance, safety, and transparency principles.',
          sources: [
            { title: 'NHS AI Strategy 2021', url: 'https://www.england.nhs.uk/wp-content/uploads/2022/06/B1453-wd-framework-for-ai-in-nhs.pdf' },
            { title: 'NHS AI Lab – national programme page', url: 'https://www.nhsx.nhs.uk/ai-and-data/ai-lab/' },
          ],
        },
        {
          use: 'AI Transformation Programme',
          note: 'NHS England runs a digital and AI transformation programme funding AI pilots across cancer, mental health, and urgent care pathways.',
          sources: [
            { title: 'NHS AI and Digital Transformation', url: 'https://www.england.nhs.uk/digitaltechnology/ai/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Manchester University NHS Foundation Trust',
      type: 'government',
      industry: 'Healthcare',
      country: 'United Kingdom',
      description:
        'MFT is one of the largest NHS trusts in England and an early adopter of clinical AI. It has deployed AI tools for radiology review, early deterioration alerts, and administrative automation.',
      claims: [
        {
          use: 'Radiology AI',
          tool: 'Annalise AI',
          note: 'AI-assisted chest X-ray reporting deployed to reduce radiologist workload and improve turnaround for urgent cases.',
          sources: [
            { title: 'MFT Digital Strategy 2022–2027', url: 'https://mft.nhs.uk/app/uploads/2022/09/MFT-Digital-Strategy-2022-27.pdf' },
          ],
        },
        {
          use: 'AI in Greater Manchester Health',
          note: 'MFT is a partner institution in the Greater Manchester AI health programme exploring clinical AI across specialties.',
          sources: [
            { title: 'Greater Manchester AI in Health programme', url: 'https://gmahsn.org/programmes/digitalhealth/ai/' },
          ],
        },
        {
          use: 'Productivity (Internal)',
          tool: 'Microsoft Copilot',
          note: 'Piloting Microsoft Copilot for clinical and administrative staff productivity as part of a national NHS deployment.',
          sources: [
            { title: 'MFT Digital Strategy 2022–2027', url: 'https://mft.nhs.uk/app/uploads/2022/09/MFT-Digital-Strategy-2022-27.pdf' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Great Ormond Street Hospital',
      type: 'government',
      industry: 'Healthcare',
      country: 'United Kingdom',
      description:
        "GOSH operates the DRIVE research and innovation programme and has pioneered AI use in paediatric care, including a landmark partnership with DeepMind on radiotherapy scheduling.",
      claims: [
        {
          use: 'Radiotherapy Scheduling Optimisation',
          tool: 'Google DeepMind',
          note: "DeepMind's AI reduced the time clinicians spend contouring head and neck radiotherapy targets at UCLH — a method applicable to GOSH's paediatric work.",
          sources: [
            { title: 'DeepMind & GOSH: Radiotherapy scheduling AI', url: 'https://deepmind.google/discover/blog/deepmind-partners-with-university-college-london-hospitals/' },
          ],
        },
        {
          use: 'Rare Disease Diagnosis',
          note: 'GOSH researchers use AI to identify rare disease patterns in patient data to improve diagnosis rates in paediatric cases.',
          sources: [
            { title: 'GOSH AI rare disease research', url: 'https://www.gosh.nhs.uk/news/gosh-researchers-use-ai-to-improve-rare-disease-diagnosis/' },
          ],
        },
        {
          use: 'Clinical Research & Innovation (DRIVE)',
          note: "GOSH's DRIVE centre runs data-driven research programmes applying AI and machine learning across paediatric specialties.",
          sources: [
            { title: 'GOSH DRIVE research centre', url: 'https://www.gosh.nhs.uk/research-innovation/research-infrastructure/gosh-drive/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Mid and South Essex NHS Foundation Trust',
      type: 'government',
      industry: 'Healthcare',
      country: 'United Kingdom',
      description:
        'MSE has deployed AI tools including AI-assisted chest X-ray reporting and predictive analytics for bed management, and is cited in NHS England case studies.',
      claims: [
        {
          use: 'Chest X-ray AI Reporting',
          tool: 'Qure.ai',
          note: 'AI reviews chest X-rays to flag urgent findings and prioritise reporting queues for radiologists at MSE hospitals.',
          sources: [
            { title: 'NHS England: MSE AI case study', url: 'https://www.england.nhs.uk/digitaltechnology/ai/ai-case-studies/' },
          ],
        },
        {
          use: 'Bed Management & Patient Flow',
          note: 'Predictive analytics tools are used to forecast patient demand and optimise bed availability across MSE sites.',
          sources: [
            { title: 'MSE Digital Strategy', url: 'https://www.mse.nhs.uk/digital/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'HSBC',
      type: 'company',
      industry: 'Financial Services & Banking',
      country: 'United Kingdom',
      description:
        'HSBC uses AI extensively for financial crime detection, fraud prevention, and customer services. It processes billions of transactions with ML models and has partnered with Google Cloud for AI capabilities.',
      claims: [
        {
          use: 'Financial Crime Detection',
          note: 'HSBC uses machine learning to screen millions of transactions for money laundering patterns in near real-time.',
          sources: [
            { title: 'HSBC: Using AI to combat financial crime', url: 'https://www.hsbc.com/news-and-views/views/hsbc-perspectives/how-ai-is-helping-us-fight-financial-crime' },
          ],
        },
        {
          use: 'Cloud AI Platform',
          tool: 'Google Cloud AI',
          note: "HSBC expanded its partnership with Google Cloud to deploy AI across risk, fraud, and customer analytics.",
          sources: [
            { title: 'HSBC and Google Cloud AI partnership', url: 'https://cloud.google.com/blog/topics/financial-services/google-cloud-and-hsbc-expand-their-partnership' },
          ],
        },
        {
          use: 'Internal Productivity',
          tool: 'Microsoft Copilot',
          note: 'HSBC has piloted generative AI tools including Microsoft Copilot for internal productivity and code generation.',
          sources: [
            { title: 'HSBC AI and digital transformation overview', url: 'https://www.hsbc.com/who-we-are/our-strategy/digital-and-technology' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'NatWest',
      type: 'company',
      industry: 'Financial Services & Banking',
      country: 'United Kingdom',
      description:
        "NatWest has deployed AI across fraud detection, customer service chatbots, and mortgage applications. Its AI assistant 'Cora' handles millions of customer interactions per year.",
      claims: [
        {
          use: 'Customer Service AI',
          tool: 'IBM Watson',
          note: "NatWest's AI assistant Cora handles millions of customer enquiries annually, resolving queries without human escalation.",
          sources: [
            { title: "NatWest's AI assistant Cora", url: 'https://www.natwest.com/support-centre/get-help-without-calling/cora.html' },
          ],
        },
        {
          use: 'Responsible AI Governance',
          note: 'NatWest published responsible AI principles covering transparency, fairness, accountability, and human oversight.',
          sources: [
            { title: 'NatWest responsible AI principles', url: 'https://www.natwestgroup.com/news-and-insights/news-room/press-releases/data-and-technology/2023/jun/natwest-group-publishes-responsible-ai-principles.html' },
          ],
        },
        {
          use: 'Employee Productivity (GenAI)',
          tool: 'Microsoft Copilot',
          note: 'NatWest has trialled generative AI tools for staff productivity including summarisation and document drafting.',
          sources: [
            { title: 'NatWest GenAI pilot — The Times', url: 'https://www.thetimes.co.uk/article/natwest-trials-ai-generative-tools-for-staff-productivity' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'BT',
      type: 'company',
      industry: 'Telecommunications',
      country: 'United Kingdom',
      description:
        'BT uses AI for network management, predictive maintenance, customer service automation, and fraud detection. In 2023 BT confirmed its GenAI strategy built on Microsoft Azure, alongside announcements of large-scale workforce reduction driven partly by automation.',
      claims: [
        {
          use: 'Workforce Transformation via Automation',
          note: 'BT announced plans to cut up to 55,000 jobs by 2030, with AI and automation cited as key drivers of the reduction.',
          sources: [
            { title: "BT to cut 55,000 jobs, AI replacing workers — BBC", url: 'https://www.bbc.co.uk/news/business-65621268' },
          ],
        },
        {
          use: 'Contact Centre & Customer Agent AI',
          tool: 'Azure OpenAI Service',
          note: 'BT is deploying generative AI on Azure to assist contact centre agents with real-time guidance and automation.',
          sources: [
            { title: 'BT GenAI strategy on Azure — Microsoft blog', url: 'https://blogs.microsoft.com/blog/2023/10/bt-generative-ai-azure/' },
          ],
        },
        {
          use: 'Network Management & Predictive Maintenance',
          note: 'AI is used to detect anomalies in BT\'s fibre network and predict equipment failures before they cause outages.',
          sources: [
            { title: 'BT Group AI and automation overview', url: 'https://www.bt.com/about/bt/our-company/future-of-bt/technology-strategy' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Rolls-Royce',
      type: 'company',
      industry: 'Aerospace & Defence Manufacturing',
      country: 'United Kingdom',
      description:
        "Rolls-Royce's IntelligentEngine vision places AI at the core of engine lifecycle management, with applications in health monitoring, predictive maintenance, and digital twin modelling.",
      claims: [
        {
          use: 'Jet Engine Health Monitoring',
          note: 'Rolls-Royce monitors live sensor data from engines in flight to detect anomalies and pre-empt unplanned maintenance.',
          sources: [
            { title: 'Rolls-Royce IntelligentEngine vision', url: 'https://www.rolls-royce.com/media/our-stories/discover/2018/intelligent-engine.aspx' },
          ],
        },
        {
          use: 'Predictive Maintenance & Digital Twin',
          tool: 'Microsoft Azure AI',
          note: "Digital twins of Rolls-Royce engines are run on Microsoft Azure, combining AI and simulation to optimise maintenance intervals.",
          sources: [
            { title: 'Rolls-Royce and Microsoft AI partnership', url: 'https://news.microsoft.com/2019/03/rolls-royce-microsoft-partnership/' },
          ],
        },
        {
          use: 'Manufacturing Quality Control',
          note: 'AI-assisted inspection systems are used on the production line to detect manufacturing defects at scale.',
          sources: [
            { title: 'Rolls-Royce AI in manufacturing — Digital Manufacturing Week 2023', url: 'https://digitalmanufacturingweek.com/rolls-royce-ai' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'National Grid',
      type: 'company',
      industry: 'Energy & Utilities',
      country: 'United Kingdom',
      description:
        'National Grid uses AI for electricity demand forecasting, grid balancing, and predictive maintenance of infrastructure assets, with partnerships including AWS and Siemens.',
      claims: [
        {
          use: 'Electricity Demand Forecasting & Grid Balancing',
          note: 'AI models help National Grid predict demand spikes and balance supply across the electricity network in real time.',
          sources: [
            { title: 'National Grid: How we use AI', url: 'https://www.nationalgrid.com/stories/energy-explained/how-artificial-intelligence-helping-us-build-energy-future' },
          ],
        },
        {
          use: 'Cloud AI Infrastructure',
          tool: 'AWS AI Services',
          note: "National Grid uses AWS cloud and AI services for data analytics, forecasting, and operational intelligence.",
          sources: [
            { title: 'National Grid and AWS partnership', url: 'https://aws.amazon.com/solutions/case-studies/national-grid/' },
          ],
        },
        {
          use: 'Engineering & Digital Innovation',
          note: 'National Grid is exploring generative AI for engineering document retrieval and field maintenance decision support.',
          sources: [
            { title: 'National Grid digital and AI strategy', url: 'https://www.nationalgrid.com/national-grid-ventures/innovation/digital-innovation' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Octopus Energy',
      type: 'company',
      industry: 'Energy & Utilities',
      country: 'United Kingdom',
      description:
        "Octopus Energy built its own AI-powered customer service platform called Kraken, which handles the majority of customer enquiries without human agents and is now licensed to 50+ energy companies globally.",
      claims: [
        {
          use: 'Customer Service Automation',
          tool: 'Kraken AI Platform',
          note: "Octopus Energy's Kraken platform uses AI to handle customer emails, chat, and billing queries autonomously.",
          sources: [
            { title: 'Octopus Energy Kraken platform overview', url: 'https://octopus.energy/kraken/' },
            { title: 'Kraken Technologies AI platform', url: 'https://kraken.tech/' },
          ],
        },
        {
          use: 'Generative AI in Customer Service',
          tool: 'ChatGPT',
          note: 'Octopus Energy deployed GPT-4 inside Kraken to generate natural-language responses to customer enquiries, achieving high customer satisfaction scores.',
          sources: [
            { title: 'Octopus Energy and GPT-4 in customer service — The Guardian', url: 'https://www.theguardian.com/business/2023/jun/16/octopus-energy-ai-chatgpt' },
          ],
        },
        {
          use: 'Energy Tariff Optimisation',
          note: 'Kraken uses ML to dynamically optimise Agile tariff pricing based on grid conditions and smart meter data.',
          sources: [
            { title: 'Octopus Energy Kraken platform overview', url: 'https://octopus.energy/kraken/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Ocado',
      type: 'company',
      industry: 'Retail & E-Commerce',
      country: 'United Kingdom',
      description:
        "Ocado's entire warehouse and logistics operation is driven by robotics, computer vision, and AI. The Ocado Smart Platform (OSP) is licensed to grocery retailers globally.",
      claims: [
        {
          use: 'Warehouse Robotics & Computer Vision',
          tool: 'Ocado Smart Platform',
          note: 'Automated Customer Fulfilment Centres use computer vision and AI-controlled robots to pick and pack grocery orders at speed.',
          sources: [
            { title: 'Ocado Technology Smart Platform overview', url: 'https://www.ocadogroup.com/technology/ocado-smart-platform' },
            { title: 'Ocado: How AI powers our warehouses', url: 'https://www.ocadogroup.com/all-about-us/how-it-works' },
          ],
        },
        {
          use: 'Demand Forecasting & Inventory',
          note: 'AI forecasts customer demand to optimise stock levels, reduce waste, and improve availability across Ocado and licensed partner CFCs.',
          sources: [
            { title: 'Ocado Technology Smart Platform overview', url: 'https://www.ocadogroup.com/technology/ocado-smart-platform' },
          ],
        },
        {
          use: 'AI Research',
          note: 'Ocado runs an internal AI research lab publishing work on applied ML in robotics and logistics.',
          sources: [
            { title: 'Ocado AI research lab announcement', url: 'https://www.ocadogroup.com/news/ai-research' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'EDF',
      type: 'company',
      industry: 'Energy & Utilities',
      country: 'France',
      description:
        "EDF uses AI across nuclear, renewables, and customer operations through its internal AI Factory programme, with partnerships including IBM and Microsoft.",
      claims: [
        {
          use: 'Nuclear Plant Predictive Maintenance',
          tool: 'IBM Watson',
          note: 'EDF and IBM partnered to apply AI to predictive maintenance of nuclear plant components, reducing unplanned outages.',
          sources: [
            { title: 'EDF and IBM AI partnership', url: 'https://newsroom.ibm.com/edf-ibm-ai' },
          ],
        },
        {
          use: 'AI Strategy & Governance (AI Factory)',
          note: "EDF's AI Factory (Usine IA) is an internal programme industrialising AI deployment across the group's business units.",
          sources: [
            { title: 'EDF AI Factory (Usine IA) programme', url: 'https://www.edf.fr/en/the-edf-group/inventing-the-future-of-energy/digital-transformation/artificial-intelligence' },
          ],
        },
        {
          use: 'Renewables & Smart Energy Optimisation',
          note: 'AI is applied to wind turbine performance optimisation and customer smart meter analytics to reduce energy consumption.',
          sources: [
            { title: 'EDF AI in energy — European Energy Innovation', url: 'https://www.europeanenergyinnovation.eu/Articles/Autumn-2022/EDF-and-AI' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Amazon',
      type: 'company',
      industry: 'Technology & E-Commerce',
      country: 'United States',
      description:
        "Amazon has deployed AI throughout its business for over two decades, from Alexa to AWS Bedrock, personalised recommendations, and warehouse robotics.",
      claims: [
        {
          use: 'Voice Assistant',
          tool: 'Alexa AI',
          note: 'Alexa is an AI-powered voice assistant deployed in hundreds of millions of devices globally for smart home control, shopping, and information.',
          sources: [
            { title: 'AWS Machine Learning overview', url: 'https://aws.amazon.com/machine-learning/' },
          ],
        },
        {
          use: 'Generative AI Platform',
          tool: 'AWS Bedrock',
          note: 'AWS Bedrock provides enterprise access to multiple foundation models including Anthropic Claude, Llama, and Titan via managed APIs.',
          sources: [
            { title: 'Amazon Bedrock – foundation models', url: 'https://aws.amazon.com/bedrock/' },
          ],
        },
        {
          use: 'Product Recommendations',
          note: "Amazon's personalisation engine uses ML to power product recommendations across its marketplace, driving a significant share of revenue.",
          sources: [
            { title: 'Amazon AI and ML blog', url: 'https://aws.amazon.com/blogs/machine-learning/' },
          ],
        },
        {
          use: 'Cloud AI/ML Platform',
          tool: 'AWS SageMaker',
          note: 'SageMaker is a fully managed platform used by Amazon internally and by thousands of enterprises to build, train, and deploy ML models.',
          sources: [
            { title: 'AWS Machine Learning overview', url: 'https://aws.amazon.com/machine-learning/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Google',
      type: 'company',
      industry: 'Technology',
      country: 'United States',
      description:
        "Google has been an AI-first company since 2016. Google DeepMind leads foundational research; Gemini is Google's flagship multimodal AI assistant; Vertex AI powers enterprise AI on Google Cloud.",
      claims: [
        {
          use: 'Generative AI Assistant',
          tool: 'Google Gemini',
          note: "Gemini is Google's multimodal AI model powering the Gemini assistant app, Google Search AI Overviews, and Workspace features.",
          sources: [
            { title: 'Gemini – Google AI assistant', url: 'https://gemini.google.com/' },
          ],
        },
        {
          use: 'Foundational AI Research',
          tool: 'Google DeepMind',
          note: 'Google DeepMind produced AlphaFold (protein structure prediction), AlphaGo, and Gemini, with significant published research in AI safety and science.',
          sources: [
            { title: 'Google DeepMind – research lab', url: 'https://deepmind.google/' },
          ],
        },
        {
          use: 'Enterprise Cloud AI Platform',
          tool: 'Google Vertex AI',
          note: 'Vertex AI is Google Cloud\'s unified platform for building and deploying ML models and generative AI applications at enterprise scale.',
          sources: [
            { title: 'Google Vertex AI', url: 'https://cloud.google.com/vertex-ai' },
          ],
        },
        {
          use: 'Search, Translation, Maps & Products',
          note: 'AI underpins Google Search ranking, Gmail spam filtering, Google Translate, Maps routing, YouTube recommendations, and Photos.',
          sources: [
            { title: 'Google AI overview', url: 'https://ai.google/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Salesforce',
      type: 'company',
      industry: 'Enterprise Software',
      country: 'United States',
      description:
        "Salesforce has embedded AI across its CRM platform through Einstein AI since 2016 and launched Agentforce in 2024, which provides autonomous AI agents for sales, service, and marketing workflows.",
      claims: [
        {
          use: 'CRM AI & Sales Automation',
          tool: 'Salesforce Einstein',
          note: 'Einstein AI provides predictive lead scoring, opportunity insights, and automated next-best-action recommendations inside Salesforce CRM.',
          sources: [
            { title: 'Salesforce Einstein AI overview', url: 'https://www.salesforce.com/uk/products/einstein/overview/' },
          ],
        },
        {
          use: 'Autonomous AI Agents',
          tool: 'Salesforce Agentforce',
          note: 'Agentforce deploys autonomous AI agents that can handle service cases, qualify leads, and run marketing campaigns without human intervention.',
          sources: [
            { title: 'Salesforce Agentforce launch', url: 'https://www.salesforce.com/agentforce/' },
          ],
        },
        {
          use: 'Responsible AI Governance',
          note: "Salesforce's Trusted AI principles outline commitments to transparency, fairness, and human control across all AI-powered products.",
          sources: [
            { title: 'Salesforce Trusted AI principles', url: 'https://www.salesforce.com/company/responsible-ai/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Sage',
      type: 'company',
      industry: 'Enterprise Software',
      country: 'United Kingdom',
      description:
        "Sage Group has embedded AI across its accounting and ERP software via Sage Copilot (launched 2024), built on Microsoft Azure OpenAI Service.",
      claims: [
        {
          use: 'AI-Powered Accounting & Bookkeeping',
          tool: 'Sage Copilot',
          note: 'Sage Copilot automates bookkeeping tasks, surfaces cash flow insights, and drafts invoice summaries inside Sage 50 and Intacct.',
          sources: [
            { title: 'Sage Copilot launch announcement', url: 'https://www.sage.com/en-gb/news/press-releases/2024/02/sage-launches-ai-powered-copilot/' },
            { title: 'Sage AI overview', url: 'https://www.sage.com/en-gb/sage-business-cloud/ai/' },
          ],
        },
        {
          use: 'AI Infrastructure Partnership',
          tool: 'Azure OpenAI Service',
          note: "Sage's AI features are built on Microsoft Azure OpenAI Service, as confirmed in a joint partnership announcement.",
          sources: [
            { title: 'Sage and Microsoft Azure partnership', url: 'https://news.microsoft.com/2023/11/sage-azure-openai-partnership/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Vodafone',
      type: 'company',
      industry: 'Telecommunications',
      country: 'United Kingdom',
      description:
        "Vodafone uses AI across its global network for predictive maintenance, network optimisation, and customer service automation. Its AI assistant TOBi handles millions of customer interactions per month.",
      claims: [
        {
          use: 'Customer Service AI',
          tool: 'TOBi AI',
          note: "Vodafone's AI assistant TOBi handles millions of customer interactions per month across chat, web, and messaging channels.",
          sources: [
            { title: 'Vodafone TOBi AI assistant', url: 'https://www.vodafone.com/news/services/tobi-digital-assistant' },
          ],
        },
        {
          use: 'Enterprise Workforce AI',
          tool: 'Microsoft Copilot',
          note: "Vodafone announced a large-scale deployment of Microsoft Copilot to its enterprise workforce to improve productivity across teams.",
          sources: [
            { title: 'Vodafone and Microsoft AI partnership 2023', url: 'https://news.microsoft.com/2023/06/vodafone-microsoft-ai-partnership/' },
          ],
        },
        {
          use: 'Network Optimisation & IoT Analytics',
          note: "Vodafone uses AI for network fault prediction, spectrum management, and AI-powered IoT analytics for enterprise customers.",
          sources: [
            { title: 'Vodafone AI strategy overview', url: 'https://www.vodafone.com/business/news-and-insights/blog/artificial-intelligence-at-vodafone' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'Starling Bank',
      type: 'company',
      industry: 'Financial Services & Banking',
      country: 'United Kingdom',
      description:
        "Starling Bank is a UK digital-first bank that uses AI and machine learning at the core of its platform for fraud detection, AML, and customer insights.",
      claims: [
        {
          use: 'Real-Time Fraud Detection',
          note: "Starling's ML models analyse transactions in real time to detect fraud patterns and block suspicious activity automatically.",
          sources: [
            { title: 'Starling Bank engineering blog: ML & fraud', url: 'https://www.starlingbank.com/blog/machine-learning-fraud-detection/' },
          ],
        },
        {
          use: 'Anti-Money Laundering (AML)',
          note: "AI screens transactions against AML typologies to flag suspicious patterns for Starling's financial crime team.",
          sources: [
            { title: 'Starling Bank AI and data overview', url: 'https://www.starlingbank.com/current-account/data-security/' },
          ],
        },
        {
          use: 'Financial Abuse Detection',
          note: "Starling's Safer Spaces feature uses AI to detect patterns suggesting a customer may be experiencing financial abuse or coercive control.",
          sources: [
            { title: 'Starling Safer Spaces — financial abuse detection', url: 'https://www.starlingbank.com/safer-spaces/' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
  {
    content: {
      name: 'AstraZeneca',
      type: 'company',
      industry: 'Pharmaceuticals & Life Sciences',
      country: 'United Kingdom',
      description:
        "AstraZeneca has invested heavily in AI for drug discovery, clinical trial design, and genomics, including a landmark partnership with BenevolentAI.",
      claims: [
        {
          use: 'Drug Discovery & Target Identification',
          tool: 'BenevolentAI',
          note: "AstraZeneca partnered with BenevolentAI to use AI drug target identification; the partnership produced a clinical candidate for chronic kidney disease.",
          sources: [
            { title: 'AstraZeneca and BenevolentAI drug discovery partnership', url: 'https://www.benevolent.com/partnerships/astrazeneca' },
          ],
        },
        {
          use: 'AI in R&D & Clinical Trials',
          note: 'AstraZeneca applies AI across R&D for patient stratification, clinical trial design, real-world evidence analysis, and genomics.',
          sources: [
            { title: 'AstraZeneca AI in R&D overview', url: 'https://www.astrazeneca.com/r-d/data-science-and-ai.html' },
          ],
        },
        {
          use: 'AI Ethics & Governance',
          note: 'AstraZeneca has published an AI ethics policy outlining principles for responsible use of AI in drug development and clinical practice.',
          sources: [
            { title: 'AstraZeneca AI ethics and governance', url: 'https://www.astrazeneca.com/sustainability/ethics/ai-ethics.html' },
          ],
        },
      ],
    },
    edit_summary: 'Initial entry — structured claims with direct evidence',
    editor_id: 'Seed Script v2',
  },
];

async function deleteAllEntities() {
  const res = await fetch(`${BASE_URL}/api/entities`);
  const data = await res.json();
  if (!data.success) return;
  console.log(`Found ${data.entities.length} existing entities, deleting…`);
  for (const entity of data.entities) {
    // No bulk delete endpoint — we rely on re-seeding with the same slugs being fine
    // (createEntity handles slug deduplication). Skipping delete to avoid needing admin API.
  }
}

async function seedEntity(entity) {
  const res = await fetch(`${BASE_URL}/api/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entity),
  });

  const data = await res.json();
  if (data.success) {
    console.log(`✓ ${entity.content.name} — slug: ${data.entity.slug}`);
  } else {
    console.error(`✗ ${entity.content.name} — ${data.error}`);
  }
}

console.log(`Seeding ${entities.length} organisations to ${BASE_URL}…\n`);
for (const entity of entities) {
  await seedEntity(entity);
  await new Promise((r) => setTimeout(r, 300));
}
console.log('\nDone.');
