import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { CommunityIssue, Comment, TimelineEvent, IssueStatus, IssueSeverity, IssueCategory } from './src/types.js';

dotenv.config();

// Initialize the Express app
const app = express();
const PORT = 3000;

// Enable JSON payloads up to 10MB (for handling base64 uploaded images)
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      genAI = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log('Gemini client initialized successfully.');
    } else {
      console.warn('GEMINI_API_KEY is not configured or uses placeholder value. AI features will run with fallback mock generators.');
    }
  }
  return genAI;
}

// In-Memory Database for Community Issues
let issues: CommunityIssue[] = [
  {
    id: 'issue-1',
    title: 'Major Road Cave-in & Pothole',
    category: 'Roads & Sidewalks',
    description: 'A deep sinkhole has developed near the main zebra crossing. It is highly hazardous for oncoming cyclists and vehicles, especially after heavy rains when it fills up with water.',
    severity: 'critical',
    x: 35,
    y: 45,
    reportedBy: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'Verifying',
    upvotes: 42,
    verifications: 15,
    flags: 0,
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    aiCategorized: true,
    aiDepartment: 'Department of Public Works',
    aiPlan: '1. Place safety barriers and warning cones immediately. 2. Dispatch a surveying engineer to assess structural sub-base failure. 3. Backfill and apply hot-mix asphalt patching.',
    comments: [
      {
        id: 'c-1',
        user: 'Robert Chen',
        text: 'Blew out my tire on this yesterday evening! It is extremely dangerous at night because the streetlights nearby are dim.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c-2',
        user: 'Elena Rostova',
        text: 'I reported this on my morning walk. Thanks Sarah for adding details. Upvoted for immediate action!',
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        status: 'Reported',
        message: 'Issue reported to the public portal by Sarah Jenkins.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Sarah Jenkins'
      },
      {
        status: 'Verifying',
        message: 'Community Verification threshold reached. Validated by 15 local residents.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'System'
      }
    ]
  },
  {
    id: 'issue-2',
    title: 'Burst Water Pipe Flooding Alley',
    category: 'Water & Sanitation',
    description: 'Freshwater is gushing from an underground pipe fracture near Broadway. The entire alleyway is flooded, causing erosion and blocking resident garage entries.',
    severity: 'high',
    x: 22,
    y: 68,
    reportedBy: 'Marcus Vance',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'In Progress',
    upvotes: 28,
    verifications: 8,
    flags: 0,
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=800&q=80',
    aiCategorized: true,
    aiDepartment: 'Water & Sanitation Division',
    aiPlan: '1. Shut off local control valve V-12 to stop immediate water flow. 2. Excavate the pavement above the leakage point. 3. Replace the cracked 4-inch ductile iron pipe section.',
    comments: [
      {
        id: 'c-3',
        user: 'Clara Oswald',
        text: 'Water pressure in our block has dropped significantly. Glad to see the repair team is on-site.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        status: 'Reported',
        message: 'Issue reported to the public portal by Marcus Vance.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        author: 'Marcus Vance'
      },
      {
        status: 'Scheduled',
        message: 'Repair ticket generated. Assigned to Water Utility Emergency Crew 3B.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: 'Municipal Dispatch'
      },
      {
        status: 'In Progress',
        message: 'Water Crew 3B arrived at location. Excavatior dispatched to access pipeline.',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
        author: 'Crew Chief Davis'
      }
    ]
  },
  {
    id: 'issue-3',
    title: 'Flickering and Damaged Streetlights',
    category: 'Public Lighting',
    description: 'Three consecutive streetlights are completely out or flickering violently on Oakhaven Park pathway, creating pitch-black areas that feel highly unsafe for joggers.',
    severity: 'medium',
    x: 65,
    y: 28,
    reportedBy: 'David Kim',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Scheduled',
    upvotes: 18,
    verifications: 6,
    flags: 0,
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    aiCategorized: true,
    aiDepartment: 'Municipal Utilities Dept (Power & Lighting)',
    aiPlan: '1. Diagnose photo sensor and ballast failures. 2. Dispatch bucket truck team. 3. Upgrade bulbs to energy-efficient, long-lasting smart LED heads.',
    comments: [],
    timeline: [
      {
        status: 'Reported',
        message: 'Issue reported by David Kim.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'David Kim'
      },
      {
        status: 'Scheduled',
        message: 'Scheduled for LED replacement and ballast inspection on Friday utility run.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        author: 'Grid Operations'
      }
    ]
  },
  {
    id: 'issue-4',
    title: 'Overflowing Recycling Bins at Plaza',
    category: 'Waste Management',
    description: 'The communal plastics and glass recycling bins behind the local community center are completely overflowing. Wind is blowing loose bottles into the neighboring green belt.',
    severity: 'low',
    x: 82,
    y: 55,
    reportedBy: 'Aisha Rahman',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: 'Reported',
    upvotes: 12,
    verifications: 3,
    flags: 0,
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    aiCategorized: true,
    aiDepartment: 'Environmental Health & Waste Dept',
    aiPlan: '1. Alert standard waste route driver for urgent off-schedule pickup. 2. Clean loose debris in surrounding park zone. 3. Log bin utilization metrics to consider upgrading capacity.',
    comments: [],
    timeline: [
      {
        status: 'Reported',
        message: 'Issue reported by Aisha Rahman.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: 'Aisha Rahman'
      }
    ]
  },
  {
    id: 'issue-5',
    title: 'Broken Swing and Exposed Screws in Park',
    category: 'Parks & Public Spaces',
    description: 'The toddler swing chain is broken, and there are sharp metal screws sticking out from the wooden support bracket. Extremely risky for children playing in the park.',
    severity: 'high',
    x: 68,
    y: 33,
    reportedBy: 'Emily Thomas',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: 'Resolved',
    upvotes: 35,
    verifications: 12,
    flags: 0,
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
    aiCategorized: true,
    aiDepartment: 'Parks and Recreation Services',
    aiPlan: '1. Secure swing chains with temporary warning tape. 2. Remove rusted hardware and sand rough wooden beams. 3. Install new commercial-grade rubber safety seats and galvanized steel chains.',
    comments: [
      {
        id: 'c-4',
        user: 'Emily Thomas',
        text: 'The parks department came by this morning and fixed it! New swing is amazing and completely safe.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        status: 'Reported',
        message: 'Issue reported by Emily Thomas.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Emily Thomas'
      },
      {
        status: 'Scheduled',
        message: 'Assigned to Park Maintenance Team A.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Parks Dept Office'
      },
      {
        status: 'In Progress',
        message: 'Maintenance crew on site replacing swing chains and fixing screws.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Crew Chief Lopez'
      },
      {
        status: 'Resolved',
        message: 'Replaced broken swing with new double-braid nylon and soft-seat hardware. Screws trimmed and sanded.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Parks Inspector Ramirez'
      }
    ]
  }
];

// --- API ROUTES ---

// 1. Get all issues
app.get('/api/issues', (req, res) => {
  res.json(issues);
});

// 2. Report a new issue (with optional Gemini AI automatic analysis)
app.post('/api/issues', async (req, res) => {
  const { title, description, category, severity, x, y, reportedBy, imageUrl, requestAiAnalysis } = req.body;

  if (!title || !description || x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Title, description, and location (x, y) are required.' });
  }

  const newId = `issue-${Date.now()}`;
  let finalCategory: IssueCategory = category || 'Roads & Sidewalks';
  let finalSeverity: IssueSeverity = severity || 'medium';
  let aiDepartment = 'General Municipal Works';
  let aiPlan = '1. Log ticket in municipal dispatch. 2. Assign inspection team to review physical site. 3. Formulate resolution steps based on inspection reports.';
  let isAiAnalyzed = false;

  const client = getGeminiClient();

  if (requestAiAnalysis && client) {
    try {
      console.log(`Analyzing issue with Gemini AI: "${title}"`);
      // Build parts for multimodal or text-only analysis
      const parts: any[] = [];
      
      const systemInstruction = `You are the AI Integration System for "Community Hero", a hyperlocal citizen problem solver app. 
Analyze the citizen's report and classify it into one of these exact categories: 
['Roads & Sidewalks', 'Water & Sanitation', 'Waste Management', 'Public Lighting', 'Parks & Public Spaces'].

Output a strictly valid JSON object matching the following structure:
{
  "category": "Roads & Sidewalks",
  "severity": "medium", 
  "aiDepartment": "Department of Public Works",
  "aiPlan": "1. Step one details. 2. Step two details. 3. Step three details."
}

Ensure "severity" is one of: ['low', 'medium', 'high', 'critical'].
Suggest the most suitable real local municipal department in "aiDepartment".
Include 3 very specific, actionable steps to address this exact hazard in "aiPlan".`;

      let promptText = `Citizen Issue Report:
Title: "${title}"
Description: "${description}"
User Selection Category suggestion: "${finalCategory}"
User Selection Severity suggestion: "${finalSeverity}"`;

      parts.push({ text: promptText });

      if (imageUrl && imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
          promptText += `\nAn image has been attached to this report. Please analyze the image to confirm the actual physical hazard and refine category/severity.`;
        }
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: parts,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { 
                type: Type.STRING, 
                description: 'Must be exactly one of: Roads & Sidewalks, Water & Sanitation, Waste Management, Public Lighting, Parks & Public Spaces' 
              },
              severity: { 
                type: Type.STRING, 
                description: 'Must be exactly one of: low, medium, high, critical' 
              },
              aiDepartment: { 
                type: Type.STRING, 
                description: 'Name of the responsible local municipal department' 
              },
              aiPlan: { 
                type: Type.STRING, 
                description: 'Exactly 3 sequential numbered action steps' 
              }
            },
            required: ['category', 'severity', 'aiDepartment', 'aiPlan']
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const aiResult = JSON.parse(responseText.trim());
        if (aiResult.category) finalCategory = aiResult.category;
        if (aiResult.severity) finalSeverity = aiResult.severity;
        if (aiResult.aiDepartment) aiDepartment = aiResult.aiDepartment;
        if (aiResult.aiPlan) aiPlan = aiResult.aiPlan;
        isAiAnalyzed = true;
        console.log('Gemini AI Analysis Result:', aiResult);
      }
    } catch (err) {
      console.error('Failed to perform Gemini AI analysis, using fallbacks.', err);
    }
  } else if (requestAiAnalysis) {
    // If requestAiAnalysis is true but client is not available, we generate a mock smart response
    isAiAnalyzed = true;
    if (title.toLowerCase().includes('water') || description.toLowerCase().includes('leak') || description.toLowerCase().includes('flood')) {
      finalCategory = 'Water & Sanitation';
      finalSeverity = 'high';
      aiDepartment = 'Water & Sanitation Division';
      aiPlan = '1. Locate leak source and isolate nearby main valves. 2. Excavate repair zone to expose pipe. 3. Replace sleeve seal or pipeline segment.';
    } else if (title.toLowerCase().includes('pothole') || title.toLowerCase().includes('sidewalk') || title.toLowerCase().includes('road')) {
      finalCategory = 'Roads & Sidewalks';
      finalSeverity = 'medium';
      aiDepartment = 'Department of Public Works';
      aiPlan = '1. Clean debris from road hazard area. 2. Pour and compact industrial cold-patch or hot asphalt. 3. Roll smooth and test for level alignment.';
    } else if (title.toLowerCase().includes('light') || title.toLowerCase().includes('bulb') || title.toLowerCase().includes('dark')) {
      finalCategory = 'Public Lighting';
      finalSeverity = 'medium';
      aiDepartment = 'Municipal Utilities (Electrical Dept)';
      aiPlan = '1. Check pole breaker and central light sensor circuit. 2. Inspect lighting harness from bucket lift. 3. Upgrade ballast and install smart-sensor LED bulb.';
    } else if (title.toLowerCase().includes('trash') || title.toLowerCase().includes('garbage') || title.toLowerCase().includes('waste')) {
      finalCategory = 'Waste Management';
      finalSeverity = 'low';
      aiDepartment = 'Sanitation & Solid Waste Division';
      aiPlan = '1. Dispatch waste collection vehicle to clear overflowing container. 2. Conduct mechanical wash and sanitization of plaza floors. 3. Set up schedule warning notices for improper dumping.';
    } else {
      aiDepartment = 'Parks & Public Infrastructure Office';
      aiPlan = `1. Log community complaint in regional ledger. 2. Alert field dispatcher for inspection route. 3. Perform maintenance routine within standard 72-hour window.`;
    }
  }

  const newIssue: CommunityIssue = {
    id: newId,
    title,
    category: finalCategory,
    description,
    severity: finalSeverity,
    x,
    y,
    reportedBy: reportedBy || 'Anonymous Resident',
    createdAt: new Date().toISOString(),
    status: 'Reported',
    upvotes: 1,
    verifications: 0,
    flags: 0,
    imageUrl: imageUrl || undefined,
    aiCategorized: isAiAnalyzed,
    aiDepartment,
    aiPlan,
    comments: [],
    timeline: [
      {
        status: 'Reported',
        message: isAiAnalyzed 
          ? `Issue submitted. Auto-analyzed by Community Hero AI and routed to: "${aiDepartment}".`
          : `Issue submitted to Evergreen Valley public system.`,
        timestamp: new Date().toISOString(),
        author: reportedBy || 'Anonymous Resident'
      }
    ]
  };

  issues.unshift(newIssue);
  res.status(201).json(newIssue);
});

// 3. Community upvote or verify or flag an issue
app.post('/api/issues/:id/vote', (req, res) => {
  const { id } = req.params;
  const { voteType, user } = req.body; // voteType: 'upvote' | 'verify' | 'flag'

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const userName = user || 'A Neighbor';

  if (voteType === 'upvote') {
    issue.upvotes += 1;
  } else if (voteType === 'verify') {
    issue.verifications += 1;
    
    // Add verification event to timeline if it crosses a community threshold (e.g., 5, 10, 20)
    if (issue.verifications === 5 || issue.verifications === 10 || issue.verifications === 1) {
      issue.timeline.push({
        status: issue.status,
        message: `Issue verified by community members (${issue.verifications} residents confirmed).`,
        timestamp: new Date().toISOString(),
        author: 'Community Hub'
      });
    }

    // Automatically change status from Reported to Verifying if it has multiple community confirmations
    if (issue.status === 'Reported' && issue.verifications >= 3) {
      issue.status = 'Verifying';
      issue.timeline.push({
        status: 'Verifying',
        message: 'Community validation threshold achieved. Transitioned to official verification queue.',
        timestamp: new Date().toISOString(),
        author: 'System Audit'
      });
    }
  } else if (voteType === 'flag') {
    issue.flags += 1;
  } else {
    return res.status(400).json({ error: 'Invalid voteType. Choose upvote, verify, or flag.' });
  }

  res.json(issue);
});

// 4. Add comment to an issue
app.post('/api/issues/:id/comments', (req, res) => {
  const { id } = req.params;
  const { user, text } = req.body;

  if (!user || !text) {
    return res.status(400).json({ error: 'User name and comment text are required.' });
  }

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    user,
    text,
    createdAt: new Date().toISOString()
  };

  issue.comments.push(newComment);
  res.status(201).json(issue);
});

// 5. Update status or resolve an issue
app.post('/api/issues/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { status, message, author, imageUrl } = req.body; // status: new status e.g., 'Scheduled', 'In Progress', 'Resolved'

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const actorName = author || 'Municipal Officer';
  issue.status = status as IssueStatus;

  const newEvent: TimelineEvent = {
    status: status as IssueStatus,
    message: message || `Status updated to ${status} by ${actorName}`,
    timestamp: new Date().toISOString(),
    author: actorName,
    imageUrl: imageUrl || undefined
  };

  issue.timeline.push(newEvent);

  res.json(issue);
});

// 6. Predict trends and insights from active dataset using Gemini AI
app.get('/api/ai/insights', async (req, res) => {
  const client = getGeminiClient();
  
  const activeIssues = issues.filter(i => i.status !== 'Resolved');
  const resolvedIssues = issues.filter(i => i.status === 'Resolved');
  
  // Format summary dataset to supply to Gemini AI
  const issueSummaries = activeIssues.map(i => ({
    title: i.title,
    category: i.category,
    severity: i.severity,
    location: `Grid(${i.x}, ${i.y})`,
    status: i.status,
    reportedDaysAgo: Math.round((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  }));

  const systemInstruction = `You are "Hero AI Warden", the predictive urban monitoring artificial intelligence of Evergreen Valley District.
Your task is to analyze the active community-reported hazard datasets and output predictive insights and alerts to assist town administrators.

You MUST return a strictly valid JSON object matching the following structure:
{
  "summary": "Professional concise overview of the town infrastructure health...",
  "alerts": [
    {
      "id": "alert-unique-1",
      "type": "warning", // choose from: warning, critical, success, info
      "title": "Water Main Concern",
      "desc": "Analysis explanation..."
    }
  ],
  "recommendations": [
    "Specific administrative action step 1",
    "Specific citizen engagement program 2"
  ]
}

- Be detailed and specific to the actual categories reported (Roads, Water, Lighting, Waste, Parks).
- If there are spatial clusters (e.g. coordinates close to each other), point them out.
- Ensure recommendations are constructive, helpful, and localized.`;

  const promptText = `Current Active Community Issues:
${JSON.stringify(issueSummaries, null, 2)}

Completed/Resolved Issues Count: ${resolvedIssues.length}

Analyze the data, look for clusters, categoric trends, and severity alerts, and render the predictive report in JSON.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING }
                  },
                  required: ['id', 'type', 'title', 'desc']
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['summary', 'alerts', 'recommendations']
          }
        }
      });

      if (response.text) {
        return res.json(JSON.parse(response.text.trim()));
      }
    } catch (err) {
      console.error('Failed to generate predictive AI insights, fallback used.', err);
    }
  }

  // Fallback high-quality report if Gemini is not initialized or fails
  const mockInsights = {
    summary: `Evergreen Valley District displays high community participation with ${issues.length} total logged complaints, maintaining a 20% resolution rate. Active issues reveal major infrastructural stress in Roads & Sidewalks (Maple Ave area) and Water Pipelines (Broadway Close), while municipal lighting programs are progressing on track.`,
    alerts: [
      {
        id: 'mock-alert-1',
        type: 'critical',
        title: 'Utility Ingress Flooding Cluster',
        desc: 'Broadway Close (Grid x=22, y=68) reports a pressurized water pipe breach. Soil stabilization risks exist if excavation does not complete within 12 hours.'
      },
      {
        id: 'mock-alert-2',
        type: 'warning',
        title: 'Seasonal Thermal Pothole Risk',
        desc: 'Road hazards near Zebra crossings are accelerating due to heavy rain. Public Works should pre-emptively survey Sector 3 for sub-base cracking.'
      },
      {
        id: 'mock-alert-3',
        type: 'info',
        title: 'Dark Zone Pathway Threat',
        desc: 'Flickering lights on Central Park Jogging Trail have prompted 18 citizen upvotes. Safety concerns are elevated during sunset hours (18:00 - 21:00).'
      }
    ],
    recommendations: [
      'Deploy the "Aqua Sentinel" emergency crew to completely seal Broadway utility corridors immediately.',
      'Initiate a Saturday "Bright Trails Volunteer Walk" to assist elderly park joggers while streetlights are scheduled for LED retrofit.',
      'Provide citizen upvote badges in waste management to coordinate localized garbage bins over-emptying.'
    ]
  };

  res.json(mockInsights);
});


// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Community Hero Server] Live on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
