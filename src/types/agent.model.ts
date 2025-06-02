/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  twitterConnected: boolean;
  twitterAccount: string;
  farcasterConnected: boolean;
  farcasterAccount: string | null;
  evmEnabled: boolean;
  solanaEnabled: boolean;
  email: string;
  token?: {
    name: string;
    symbol: string;
    address: string;
    poolAddress?: string;
    txHash: string;
    chain?: string;
    value?: number;
  };
  balance?: number;
  stats?: {
    followers: number;
    posts: number;
    engagement: number;
  };
  elizaVersion?: string;
  status?: string;
  deployedAt: any;
  createdAt: any;
  creatorAddress: string[] | string | null;
  endpoint?: string;
  agentId?: string;
  connectedWith?: [
    {
      app: string;
      imageUrl?: string;
      username: string;
      displayname: string;
    }
  ];
  capabilities?: string[];
  owner?: string;
  farcasterClient?: {
    creator_fid?: number;
    display_name: string;
    username: string;
    pfp_url: string;
    status: string;
    signer_approval_url: string;
    fid: number;
    active: boolean;
  };
  twitterClient?: {
    username: string;
    display_name: string;
    profileImageUrl: string;
    expired: boolean;
    creatorUsername: string;
  };
  telegramClient?: {
    status: string;
    botInfo?: {
      username: string;
      first_name?: string;
    };
    webhook?: {
      enabled: boolean;
      url?: string;
    };
    menuButton?: {
      type: string;
      text?: string;
      web_app_url?: string;
    };
  };
  telegramOwner?: {
    telegramUserId: string;
    username?: string;
    name?: string;
    photoUrl?: string;
    authTime?: string;
    lastLogin?: string;
  };
  scheduledCasts?: ScheduledCast[];
  scheduledTweets?: TwitterAutomation[];
  twitterCreator?: string;
  a0xVersion?: string;
  life: {
    expirationTime: string;
  };
  agentWallet: {
    walletAddress: string;
  };
  providers?: string[];
  actions?: string[];
  githubMetrics: any;
  urlAnalysis: GrantUrlAnalysis[];
  knowledge?: {
    url: string;
    type: string;
    status: string;
    data?: any;
    isDynamic?: boolean;
    lastUpdated?: string;
  }[];
}

export interface ScheduledCast {
  id?: string;
  agentId: string;
  instruction: string;
  scheduleTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  recurringPattern?: string;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  lastPublishedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  isProcessing?: boolean;
  lastProcessingStarted?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Base interface for all Twitter automations
export interface TwitterAutomationBase {
  id: string;
  agentId: string;
  active: boolean;
  type: "schedule" | "mention" | "target";
  content: string;
  instruction: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Schedule-specific automation
export interface ScheduleAutomation extends TwitterAutomationBase {
  type: "schedule";
  schedule: {
    promptTemplate: string;
    instruction?: string;
    nextRun: {
      _seconds: number;
      _nanoseconds: number;
    };
    recurringPattern: string;
  };
}

// Mention/Keywords-specific automation
export interface MentionAutomation extends TwitterAutomationBase {
  type: "mention";
  mention: {
    topics: string[];
    promptTemplate?: string;
    instruction?: string;
  };
}

// Target/Accounts-specific automation
export interface TargetAutomation extends TwitterAutomationBase {
  type: "target";
  target: {
    users: string[];
    promptTemplate?: string;
    instruction?: string;
    repliedTweets?: string[];
  };
}

// Union type for all Twitter automations
export type TwitterAutomation =
  | ScheduleAutomation
  | MentionAutomation
  | TargetAutomation;

// Legacy interfaces - kept for backward compatibility
export interface ScheduledTwitterPost {
  schedule: {
    recurringPattern: string;
    promptTemplate: string;
    instruction?: string;
    nextRun: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
  agentId: string;
  active: boolean;
  id: string;
  type: string;
}

export interface TwitterKeywordResponse {
  id: string;
  agentId: string;
  keywords: string;
  instruction?: string;
  active: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface TwitterAccountResponse {
  id: string;
  agentId: string;
  accounts: string;
  instruction?: string;
  active: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface AgentSettings {
  actions: string[];
  providers: string[];
}

export interface AgentPersonality {
  personality: {
    system: string;
    profile: {
      summary: string;
      main_role: string;
      core_traits: string[];
      expertise: string[];
    };
    behavior: {
      engagement: {
        agreement: string;
        disagreement: string;
        questions: string;
      };
      boundaries: {
        never: string[];
        avoid: string[];
      };
      triggers: {
        negative: string[];
        passionate: string[];
        positive: string[];
      };
    };
    content: {
      expertise_signals: string[];
      topics: {
        subject: string;
        stance: string;
        confidence: string;
      }[];
      values: string[];
      interests: string[];
    };
    language_style: {
      signature_elements: {
        emojis: string[];
        slang: string[];
        phrases: string[];
      };
      tone: {
        variations: string[];
        primary: string;
      };
      patterns: {
        closings: string[];
        transitions: string[];
        openings: string[];
      };
    };
  };
}

export interface AgentPersonalityConfig
  extends Partial<AgentPersonalityElizaFormat> {
  system: string;
  bio: string[];
  lore: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  knowledge: string[];
  topics: string[];
  messageExamples: Array<Array<MessageExample>>;
  postExamples: string[];
  adjectives: string[];
}

export interface MessageExample {
  _conversationId: number;
  _messageIndex: number;
  content: { text: string };
  user: string;
}

export interface AgentPersonalityElizaFormat {
  name: string;
  modelProvider: string;
  adjectives: string[];
  system: string;
  bio: string[];
  clients: string[];
  knowledge: string[];
  lore: string[];
  messageExamples: Array<Array<MessageExample>>;
  postExamples: string[];
  settings: {
    [key: string]: string;
  }[];
  source: {
    type: string;
    username?: string;
  };
  status: string;
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  topics: string[];
}

export type AgentType = "userAgent" | "psicologist" | "wealth-manager";

export enum PersonalityBuildActionTrigger {
  GET_CURRENT_PERSONALITY = "get_current_personality",
  GET_TEMPLATES_PERSONALITIES = "get_templates_personalities",
  ENTER_BIO = "enter_bio",
  ENTER_KNOWLEDGE = "enter_knowledge",
  ENTER_LORE = "enter_lore",
  ENTER_MESSAGE_EXAMPLES = "enter_message_examples",
  ENTER_POST_EXAMPLES = "enter_post_examples",
  ENTER_STYLE = "enter_style",
  ENTER_TOPICS = "enter_topics",
  ENTER_ADJECTIVES = "enter_adjectives",
  NO_ACTION_NEEDED = "no_action_needed",
}

export enum OnboarderActionTrigger {
  CONNECT_TWITTER = "connect_twitter",
  SET_TWITTER_TARGETS = "set_twitter_targets",
  INDICATE_NAVIGATION_TO_CHAT_WITH_AGENT = "indicate_navigation_to_chat_with_agent",
  SCHEDULE_POST = "schedule_post",
  LOG_OUT = "log_out",
}

export interface ConversationByPlatform {
  farcaster: Conversation[];
  twitter: Conversation[];
  telegram: Conversation[];
}

export interface Conversation {
  id: string;
  platform: "farcaster" | "twitter" | "telegram";
  agentId: string;
  userId: string;
  lastMessageAt: string;
  messages: {
    interaction_id: string;
    agent_id: string;
    user_id: string;
    llm_model: string;
    user_message: string;
    action: string;
    client: string;
    llm_response: {
      reasoning: string;
      action: string;
      message: string;
    };
    started_at: {
      value: string;
    };
    metadata_from_client: any;
    like?: boolean;
    directFeedback?: string;
  }[];
  rating?: number;
  feedback?: string;
}

export type GrantStatus = "pending" | "approved" | "denied" | "paid";

// "urlAnalysis": [
// 		{
// 			"normalizedUrl": "https://a0x.co",
// 			"userId": "920112",
// 			"videoAnalysis": {
// 				"source": "https://www.youtube.com/watch?v=0EmennQ9Oe4",
// 				"error": null,
// 				"type": "url",
// 				"analysis": {
// 					"summary": "The demo showcases a platform for creating and managing AI agents, with a focus on automating social media interactions, specifically on Twitter (now X). It demonstrates connecting an agent to a Twitter account, scheduling posts, and configuring responses based on keywords and targeted accounts.",
// 					"keyFeaturesShown": [
// 						"AI Agent Creation and Management Dashboard",
// 						"Connecting AI Agents to Twitter (via cookies)",
// 						"Scheduling Tweets",
// 						"Configuring AI Agent responses to keywords on Twitter",
// 						"Configuring AI Agent responses to tweets from specific accounts on Twitter",
// 						"Basic AI Agent Profile and Knowledge Base settings",
// 						"Mention of Farcaster integration"
// 					],
// 					"questionsRaised": [
// 						"The demo mentions 'tokenized AI agents with crypto abilities' and 'ONCHAIN DATA'. Could you describe the specific blockchain functionalities currently implemented or planned for the AI agents and the role of tokens within the ecosystem?",
// 						"The Twitter connection method using cookies seems technically risky and dependent on Twitter's internal structure. Are there plans to integrate using official Twitter/X APIs for improved security and reliability, especially considering potential platform policy changes?"
// 					],
// 					"aiIntegration": "AI is integrated by powering the agents' ability to generate responses and potentially schedule posts based on user configurations (keywords, accounts, instructions) and the agent's defined personality and knowledge base. The 'Engagement with content' feature (marked 'Soon') suggests future AI capabilities for more complex interactions.",
// 					"completenessLevel": "MVP",
// 					"overallImpression": "The demo presents a functional AI agent platform capable of automating social media tasks on Twitter. The core automation features are clearly demonstrated. While the project hints at web3 integration, the current demo lacks a clear demonstration of how blockchain technology is actively used in the user-facing features, and the Twitter connection method is a significant technical hurdle and potential point of failure.",
// 					"grantsRelevance": "The demo effectively presents the core AI-powered social media automation functionality. The mention of 'tokenized AI agents with crypto abilities' and 'ONCHAIN DATA' suggests potential web3 integration, which is relevant for grants. However, the minimal demonstration of actual blockchain functionality and the reliance on a precarious Twitter connection method via cookies might raise concerns for some grant committees regarding the maturity and sustainability of the web3 aspects and the integration approach.",
// 					"uxFeedback": "The dashboard UI appears clean and functional for managing agents and setting up automation rules. However, the method demonstrated for connecting the Twitter account, which involves manually extracting and pasting browser cookies, is highly technical, potentially insecure, and not user-friendly for a general audience. Clear instructions are provided for this complex step.",
// 					"web3Relevance": "The project mentions 'tokenized AI agents with crypto abilities' and 'ONCHAIN DATA' in the agent's knowledge base settings, indicating an intended web3 layer. Wallet connection is visible in the header. However, the core demonstrated features (social media automation) do not inherently leverage blockchain functionality like smart contracts, token transfers, or decentralized data storage in the user flow shown. The web3 relevance appears to be primarily conceptual or planned at this stage, with limited concrete demonstration."
// 				},
// 				"status": "completed",
// 				"timestamp": "2025-05-14T22:44:11.377Z"
// 			},
// 			"lastUpdated": "2025-05-14T22:44:29.658Z",
// 			"searchableFields": {
// 				"type": "url_and_or_video_analysis",
// 				"url": "https://a0x.co",
// 				"timestamp": "2025-05-14T22:44:29.658Z"
// 			},
// 			"urlAnalysis": {
// 				"screenshotUrl": "https://storage.googleapis.com/a0x-mirror-storage/agents-screenshots/71f6f657-6800-0892-875f-f26e8c213756/screenshot_1747262656836_https___a0x_co.png",
// 				"pageType": "landing_page",
// 				"crucialQuestions": [
// 					"Given the claim of scaling \"any operation\" with \"unique\" AI agents, what specific operational challenges do your agents demonstrably solve better than existing solutions, and what is the technical foundation for their purported \"uniqueness\" and \"availability everywhere\"?",
// 					"Without specific use cases or pricing, it is unclear who the target customer is or how the business model works. Can you detail your initial target market segment, your planned go-to-market strategy, and the specific monetization model for these agents?"
// 				],
// 				"uiEvaluation": null,
// 				"visitedPages": [],
// 				"analysis": {
// 					"feedback": "Based on the summary, the landing page clearly states its offering: unique AI-powered agents for scaling operations. However, it lacks crucial information such as pricing, specific use cases or examples of operations that can be scaled, and business details beyond the name 'A0X'. The absence of clear calls to action and persuasive elements like testimonials or case studies makes it difficult for a visitor to understand the practical application, trust the service, or take the next step. Adding these elements would significantly improve clarity, build trust, and guide visitors towards conversion.",
// 					"summary": "The website describes A0X, a service offering unique AI-powered agents designed to scale any operation. These agents are available everywhere and are supported by underlying infrastructure processes like loading, monitoring, training, and data connection.",
// 					"detectedPageType": "landing_page",
// 					"ctaEffectiveness": "The provided summary does not mention any specific calls to action. Without visible CTAs, potential users may not know how to learn more, request a demo, or sign up, significantly hindering conversion.",
// 					"relevanceScore": 0.6,
// 					"targetAudience": "Businesses or individuals looking to scale their operations using advanced AI technology, likely those with technical understanding or complex processes.",
// 					"keyTakeaways": [
// 						"Offers unique AI-powered agents",
// 						"Aims to scale any operation",
// 						"Agents are available everywhere",
// 						"Involves AI agent infrastructure, monitoring, training, and data connection",
// 						"No pricing information found",
// 						"Minimal business information found"
// 					],
// 					"valueProposition": "Scale any operation using unique AI-powered agents available everywhere.",
// 					"persuasionElements": []
// 				},
// 				"status": "completed",
// 				"timestamp": "2025-05-14T22:44:29.658Z"
// 			},
// 			"url": "https://a0x.co"
// 		}
// 	]

// Interfaz base con propiedades comunes
export interface BaseGrant {
  id: string;
  status: GrantStatus;
  timestamp: string;
  grantAmountInUSDC: number;
  walletAddress?: string | null;
  walletAddresses?: string[] | null;
}

export interface Contributor {
  name: string;
  role: string;
  walletAddress: string;
}

export interface QualityReasoning {
  parameter: string;
  reasoning: string;
}

// Updated quality assessment structure based on the provided data

export interface QualityAssessment {
  architectureScore: {
    score: number;
    reasoning: string;
  };
  codeReviewRatio: number;
  securityScore: {
    score: number;
    reasoning: string;
  };
  qualityStrictnessLevel: number;
  activityScore: {
    score: number;
    reasoning: string;
  };
  web3Score: {
    score: number;
    reasoning: string;
  };
  analyzedFiles: {
    name: string;
    size: number;
    analysis: {
      path: string;
      isWeb3Related: boolean;
      quality: number;
      reasoning: string;
    };
  }[];
  codeQuality: {
    reasoning: string;
    score: number;
  };
  documentationQuality: {
    score: number;
    reasoning: string;
  };
  detectedLibraries: string[];
  detectedNetworks: {
    name: string;
    chainId: string | null;
    confidence: string;
  }[];
}

export interface RepositoryMetrics {
  forks: number;
  stars: number;
  languages: {
    name: string;
    bytes: number;
    percentage: number;
  }[];
  isFork: boolean;
  createdAt: string;
  name: string;
  fullName?: string;
  owner: string;
  description: string;
  descriptionFromAnalysis?: string;
  isPrivate: boolean;
  size: number;
  license: string;
  defaultBranch: string;
  updatedAt: string;
  watchers: number;
  openIssues: number;
  summaryAnalysis: string;
  activity: {
    commits: number;
    lastActiveAt: string;
    totalContributions: number;
    issuesResolved: number;
    pullRequestsOpened: number;
    pullRequestsMerged: number;
    issuesOpened: number;
    contributionsByMonth: Record<string, number>;
    commitsByLanguage: Record<string, number>;
  };
  contributors: {
    totalContributors: number;
    topContributors: {
      username: string;
      contributions: number;
      url: string;
      avatarUrl: string;
      percent: number;
    }[];
  };
  quality: QualityAssessment;
}

export interface VideoAnalysis {
  source: string;
  error: string | null;
  type: string;
  analysis: {
    summary: string;
    keyFeaturesShown: string[];
    questionsRaised: string[];
    aiIntegration: string;
    completenessLevel: string;
    overallImpression: string;
    grantsRelevance: string;
    uxFeedback: string;
  };
}

export interface UrlAnalysis {
  screenshotUrl: string;
  pageType: string;
  crucialQuestions: string[];
  uiEvaluation: any;
  visitedPages: string[];
  analysis: {
    feedback: string;
    summary: string;
    detectedPageType: string;
    ctaEffectiveness: string;
    relevanceScore: number;
    targetAudience: string;
    keyTakeaways: string[];
    valueProposition: string;
    persuasionElements: string[];
  };
}

export interface GrantUrlAnalysis extends BaseGrant {
  normalizedUrl: string;
  userId: string;
  videoAnalysis: VideoAnalysis;
  lastUpdated: string;
  searchableFields: any;
  urlAnalysis: UrlAnalysis;
  url: string;
}

export interface Grant extends BaseGrant {
  projectName: string;
  type: string;
  metrics: {
    repository: RepositoryMetrics;
  };
  walletAddresses: string[] | null;
  website: string | null;
  walletAddressFromFarcaster: string | null;
  request?: {
    metadataFromClient?: any;
    userMessage?: string | null;
  };
}

export interface ParsedMessage {
  originalMessage: string;
  conversationTopics: string[];
  participantSummaries: Record<string, string>;
}

export interface ParsedConversationContext {
  userMessage: string;
  conversationSummary: string;
  newInsights: string;
  discussionTopics: string[];
  conversationPhase: string;
  conversationTone: string;
  userStance: string;
  potentialQuestions: string[];
  recommendedResponses: string[];
  responseState: string;
  responseStateReason: string;
  patternDetected: string;
  responseHistory: string;
  recentResponseDecisions: string[];
  responseDecision: string;
  recentCommands: string[];
  currentCommand: string;
}
