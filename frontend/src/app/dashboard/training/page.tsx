'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';

type ContentType = 'all' | 'stories' | 'posts' | 'reels' | 'videos' | 'shorts' | 'tweets';
type Platform = 'all' | 'instagram' | 'tiktok' | 'youtube' | 'twitter';

interface TrainingTip {
  id: string;
  title: string;
  description: string;
  contentTypes: ContentType[];
  platforms: Platform[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'high' | 'medium' | 'low';
  tips: string[];
  doList: string[];
  dontList: string[];
  example?: string;
}

const trainingData: TrainingTip[] = [
  // STORIES
  {
    id: 'stories-basics',
    title: 'Mastering Stories for Sales',
    description: 'Stories are the most powerful tool for direct engagement. With 24-hour visibility, they create urgency and personal connection.',
    contentTypes: ['stories'],
    platforms: ['instagram', 'tiktok'],
    difficulty: 'beginner',
    impact: 'high',
    tips: [
      'Post stories consistently - 5-7 per day keeps you on top of feeds',
      'Use the first 3 seconds to hook viewers - start with action or text',
      'Add interactive elements: polls, questions, quizzes',
      'Use location tags and hashtags in stories for discovery',
      'Create story highlights to keep best content accessible'
    ],
    doList: [
      'Show your face and be authentic',
      'Use captions - 60% watch without sound',
      'Add swipe-up links or link stickers',
      'Post at peak hours (9-11 AM, 7-9 PM)',
      'Reply to all DMs from story engagement'
    ],
    dontList: [
      'Post blurry or dark content',
      'Use too much text on one slide',
      'Ignore story replies - they boost algorithm',
      'Post only promotional content',
      'Use copyrighted music without checking'
    ],
    example: 'Start with a hook like "Want to know my secret for saving money on luxury?" then show the product naturally in your lifestyle.'
  },
  {
    id: 'stories-advanced',
    title: 'Advanced Story Selling Techniques',
    description: 'Take your story game to the next level with these proven conversion strategies.',
    contentTypes: ['stories'],
    platforms: ['instagram', 'tiktok'],
    difficulty: 'advanced',
    impact: 'high',
    tips: [
      'Use the 3-story arc: Problem > Solution > Call to Action',
      'Create FOMO with countdown stickers for limited offers',
      'Share customer testimonials and reviews in stories',
      'Use "Close Friends" for exclusive deals',
      'A/B test different CTAs to see what converts best'
    ],
    doList: [
      'Track story analytics weekly',
      'Create story templates for consistency',
      'Use branded AR filters',
      'Collaborate with other influencers for takeovers',
      'Save and repost best-performing stories'
    ],
    dontList: [
      'Hard sell in every story',
      'Ignore the story completion rate metric',
      'Skip the warmup content before promotion',
      'Forget to mention your referral link/code',
      'Post identical content across platforms'
    ]
  },

  // POSTS
  {
    id: 'posts-instagram',
    title: 'Creating High-Converting Instagram Posts',
    description: 'Feed posts are your portfolio. They build trust and show your brand identity to potential customers.',
    contentTypes: ['posts'],
    platforms: ['instagram'],
    difficulty: 'beginner',
    impact: 'medium',
    tips: [
      'Use carousel posts - they get 3x more engagement than single images',
      'First image is crucial - make it scroll-stopping',
      'Write captions that tell stories, not just describe',
      'Use 20-30 relevant hashtags in comments',
      'Post consistently at the same times each week'
    ],
    doList: [
      'Use high-quality, well-lit photos',
      'Show the product in real-life context',
      'Include a clear CTA in every caption',
      'Engage with comments within first hour',
      'Use Instagram Shopping tags when possible'
    ],
    dontList: [
      'Use stock photos - authenticity wins',
      'Write generic captions like "Link in bio"',
      'Ignore comment questions',
      'Post and ghost - engage!',
      'Over-edit photos to look unrealistic'
    ],
    example: 'Carousel idea: Slide 1 - "3 reasons I switched to [Brand]", Slides 2-4 - Each reason with photo, Slide 5 - Results/testimonial, Slide 6 - How to get it (your link)'
  },
  {
    id: 'posts-twitter',
    title: 'Twitter Posts That Drive Action',
    description: 'Twitter is about conversations and hot takes. Use it to build authority and drive traffic.',
    contentTypes: ['posts', 'tweets'],
    platforms: ['twitter'],
    difficulty: 'intermediate',
    impact: 'medium',
    tips: [
      'Use threads for detailed product reviews',
      'Quote tweet relevant discussions to add value',
      'Pin your best-performing promotional tweet',
      'Use Twitter Spaces to discuss products live',
      'Engage with brand accounts for visibility'
    ],
    doList: [
      'Tweet 3-5 times per day minimum',
      'Use images/videos - they get 150% more retweets',
      'Join trending conversations naturally',
      'Build a thread strategy for long-form content',
      'Use Twitter Analytics to find best posting times'
    ],
    dontList: [
      'Only post promotional content',
      'Ignore replies and mentions',
      'Use too many hashtags (1-2 max)',
      'Tweet without proofreading',
      'Buy followers or engagement'
    ]
  },

  // REELS
  {
    id: 'reels-basics',
    title: 'Instagram Reels Masterclass',
    description: 'Reels are the fastest way to grow and reach new audiences. Master the algorithm with these tips.',
    contentTypes: ['reels'],
    platforms: ['instagram'],
    difficulty: 'beginner',
    impact: 'high',
    tips: [
      'Hook viewers in first 0.5 seconds - start mid-action',
      'Optimal length is 7-15 seconds for maximum completion rate',
      'Use trending audio - check Reels tab for popular sounds',
      'Add text overlays for silent viewers',
      'End with a loop point for repeat views'
    ],
    doList: [
      'Post Reels at least 4-5 times per week',
      'Use 3-5 relevant hashtags',
      'Write engaging captions with hooks',
      'Share Reels to your story',
      'Respond to comments quickly to boost reach'
    ],
    dontList: [
      'Use TikTok watermarks on Instagram',
      'Create low-quality vertical video',
      'Ignore trending formats and sounds',
      'Post without a clear message or CTA',
      'Give up if first Reels dont perform'
    ],
    example: 'Format that works: "POV: You just discovered [product] and your life changed" - show transformation or reaction'
  },
  {
    id: 'reels-advanced',
    title: 'Viral Reels Formula',
    description: 'Learn the exact formula that makes Reels go viral and drive massive referral traffic.',
    contentTypes: ['reels'],
    platforms: ['instagram'],
    difficulty: 'advanced',
    impact: 'high',
    tips: [
      'Study viral Reels in your niche - what patterns do you see?',
      'Create "save-worthy" content - tutorials, tips, lists',
      'Use pattern interrupts every 2-3 seconds',
      'Collaborate with creators for duets and stitches',
      'Batch create content - film 5-10 Reels in one session'
    ],
    doList: [
      'Track watch time and completion rate',
      'Test different hooks on same content',
      'Repurpose top performers with slight changes',
      'Build content pillars: educational, entertaining, promotional',
      'Use calls-to-action that encourage saves and shares'
    ],
    dontList: [
      'Copy others exactly - add your twist',
      'Neglect audio quality',
      'Post random times - consistency matters',
      'Ignore analytics feedback',
      'Promote too early in the video'
    ]
  },

  // TIKTOK VIDEOS
  {
    id: 'tiktok-basics',
    title: 'TikTok Success Blueprint',
    description: 'TikTok is the king of organic reach. Even new accounts can go viral with the right strategy.',
    contentTypes: ['videos'],
    platforms: ['tiktok'],
    difficulty: 'beginner',
    impact: 'high',
    tips: [
      'Post 1-3 times daily for best results',
      'Use trending sounds within 24-48 hours of trending',
      'Film in native TikTok app for best quality boost',
      'Duet and stitch popular videos in your niche',
      'Use TikTok-specific features: green screen, effects, filters'
    ],
    doList: [
      'Jump on trends quickly - timing is everything',
      'Be authentic and show personality',
      'Use the "For You" page for research daily',
      'Engage with comments - especially first hour',
      'Create series content to keep viewers coming back'
    ],
    dontList: [
      'Cross-post from other platforms with watermarks',
      'Ignore TikTok trends for your own ideas only',
      'Post without hashtags',
      'Be overly polished - raw performs better',
      'Delete videos that dont perform immediately'
    ],
    example: 'Trending format: "Things in my [category] that are worth the hype" - list items while showing each briefly'
  },
  {
    id: 'tiktok-selling',
    title: 'TikTok Affiliate Marketing Mastery',
    description: 'Turn views into sales with proven TikTok selling techniques that dont feel salesy.',
    contentTypes: ['videos'],
    platforms: ['tiktok'],
    difficulty: 'intermediate',
    impact: 'high',
    tips: [
      'Use the "review" format - honest opinions build trust',
      'Create "GRWM" (Get Ready With Me) featuring products',
      'Show before/after or transformation content',
      'Use TikTok Shop if available in your region',
      'Pin promotional videos to your profile'
    ],
    doList: [
      'Add link in bio and mention it naturally',
      'Create a linktree with all your affiliate links',
      'Use discount codes in video overlays',
      'Reply to comments with video responses',
      'Build anticipation with "part 2" content'
    ],
    dontList: [
      'Start with "BUY THIS" - warm them up first',
      'Fake enthusiasm - viewers can tell',
      'Ignore negative comments - address them',
      'Over-promise on results',
      'Forget to disclose partnerships when required'
    ]
  },

  // YOUTUBE SHORTS
  {
    id: 'shorts-basics',
    title: 'YouTube Shorts for Beginners',
    description: 'YouTube Shorts is the fastest-growing format. Build subscribers and drive traffic from a different audience.',
    contentTypes: ['shorts'],
    platforms: ['youtube'],
    difficulty: 'beginner',
    impact: 'high',
    tips: [
      'Optimal length is 30-45 seconds',
      'Start with movement or action - never a static shot',
      'Use YouTube Shorts camera for best algorithm boost',
      'Add #Shorts in title or description',
      'Repurpose TikToks/Reels but remove watermarks'
    ],
    doList: [
      'Post consistently - daily if possible',
      'Use trending music from YouTube library',
      'Create content that loops well',
      'Include text on screen for silent viewers',
      'Link to longer videos in comments'
    ],
    dontList: [
      'Upload horizontal video as Short',
      'Ignore YouTube SEO in title/description',
      'Post copyrighted music',
      'Create Shorts unrelated to your main content',
      'Neglect your community tab'
    ],
    example: 'Quick tip format: "1 thing you didnt know about [product]" - deliver value in under 30 seconds'
  },
  {
    id: 'shorts-monetization',
    title: 'Monetizing YouTube Shorts',
    description: 'Turn Shorts views into revenue streams and long-term subscribers.',
    contentTypes: ['shorts'],
    platforms: ['youtube'],
    difficulty: 'advanced',
    impact: 'high',
    tips: [
      'Use Shorts to funnel viewers to long-form content',
      'Create teaser Shorts for full product reviews',
      'Build email list through Shorts CTAs',
      'Cross-promote your affiliate links strategically',
      'Collaborate with other Shorts creators'
    ],
    doList: [
      'Mention your referral code verbally in video',
      'Add links to description (they work on Shorts!)',
      'Use community posts to share links',
      'Create playlists of related Shorts',
      'Analyze which Shorts drive the most traffic'
    ],
    dontList: [
      'Only create Shorts - mix with long-form',
      'Forget to engage with Shorts comments',
      'Ignore Shorts analytics',
      'Make every Short promotional',
      'Copy viral Shorts exactly without adding value'
    ]
  },

  // LONG-FORM VIDEO
  {
    id: 'video-youtube',
    title: 'Long-Form YouTube Video Strategy',
    description: 'YouTube videos have the longest shelf life. Create evergreen content that sells for years.',
    contentTypes: ['videos'],
    platforms: ['youtube'],
    difficulty: 'intermediate',
    impact: 'high',
    tips: [
      'Ideal length is 8-15 minutes for monetization and watch time',
      'Invest in good audio - its more important than video quality',
      'Create compelling thumbnails - test different versions',
      'Use chapters/timestamps for better UX and SEO',
      'Optimize for search with keyword research'
    ],
    doList: [
      'Hook viewers in first 30 seconds with preview of value',
      'Include affiliate links in description with timestamps',
      'Add pinned comment with main CTA',
      'Create end screens to other videos',
      'Upload consistently on a schedule'
    ],
    dontList: [
      'Ramble - get to the point',
      'Skip the intro hook',
      'Ignore thumbnail importance',
      'Forget to ask for subscribe/like',
      'Upload without proper tags and description'
    ],
    example: 'Video structure: Hook (30s) > Intro (30s) > Main Content with product integration > Summary > CTA'
  },

  // GENERAL TIPS
  {
    id: 'general-conversion',
    title: 'Universal Conversion Strategies',
    description: 'These principles work across all platforms and content types.',
    contentTypes: ['all'],
    platforms: ['all'],
    difficulty: 'intermediate',
    impact: 'high',
    tips: [
      'Build trust before selling - give value first',
      'Use social proof: testimonials, reviews, results',
      'Create urgency without being fake',
      'Make it easy: clear CTAs, working links',
      'Follow up: remind audience about offers'
    ],
    doList: [
      'Track your conversion metrics weekly',
      'A/B test different approaches',
      'Engage with your community authentically',
      'Share your genuine experience with products',
      'Respond to DMs about products promptly'
    ],
    dontList: [
      'Promote products you dont believe in',
      'Use pushy sales tactics',
      'Ignore analytics and data',
      'Copy competitors exactly',
      'Give up too early on strategies'
    ]
  },
  {
    id: 'general-algorithm',
    title: 'Understanding Social Media Algorithms',
    description: 'Every platform rewards certain behaviors. Learn how to work with algorithms, not against them.',
    contentTypes: ['all'],
    platforms: ['all'],
    difficulty: 'advanced',
    impact: 'high',
    tips: [
      'Engagement in first hour is critical - be online when you post',
      'Saves and shares are weighted highest',
      'Watch time/completion rate determines reach',
      'Consistency trains the algorithm to show your content',
      'Native features are always boosted over third-party tools'
    ],
    doList: [
      'Post at your specific optimal times (check analytics)',
      'Encourage saves with "save this for later" CTAs',
      'Create content that makes people want to share',
      'Use all platform features: stories, lives, posts, reels',
      'Engage with others before and after posting'
    ],
    dontList: [
      'Use engagement pods or fake engagement',
      'Delete content that performs poorly',
      'Post and immediately leave the app',
      'Use banned hashtags unknowingly',
      'Ignore shadowban warning signs'
    ]
  }
];

const contentTypeLabels: Record<ContentType, string> = {
  all: 'All Content',
  stories: 'Stories',
  posts: 'Posts',
  reels: 'Reels',
  videos: 'Videos',
  shorts: 'YouTube Shorts',
  tweets: 'Tweets'
};

const platformLabels: Record<Platform, string> = {
  all: 'All Platforms',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'Twitter/X'
};

const platformIcons: Record<Platform, JSX.Element> = {
  all: <span>All</span>,
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
};

export default function TrainingPage() {
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const filteredTips = trainingData.filter(tip => {
    const contentMatch = selectedContentType === 'all' || tip.contentTypes.includes(selectedContentType) || tip.contentTypes.includes('all');
    const platformMatch = selectedPlatform === 'all' || tip.platforms.includes(selectedPlatform) || tip.platforms.includes('all');
    return contentMatch && platformMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-purple-100 text-purple-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Social Media Sales Training</h1>
              <p className="text-blue-100 mt-1">Master the art of selling through social media</p>
            </div>
          </div>
          <p className="text-blue-100 max-w-3xl">
            Complete guide to increasing your sales and conversions through different content types and platforms.
            Learn proven strategies used by top influencers to maximize their earnings.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{trainingData.length}</p>
              <p className="text-sm text-gray-600">Training Modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">6</p>
              <p className="text-sm text-gray-600">Content Types</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">4</p>
              <p className="text-sm text-gray-600">Platforms Covered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">100+</p>
              <p className="text-sm text-gray-600">Pro Tips</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Filter Training Content</h3>

            {/* Content Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedContentType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedContentType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {contentTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(platformLabels) as Platform[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedPlatform === platform
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform !== 'all' && platformIcons[platform]}
                    {platformLabels[platform]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Content */}
        <div className="space-y-6">
          {filteredTips.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No training content matches your filters. Try adjusting your selection.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTips.map((tip) => (
              <Card key={tip.id} className="overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                          {tip.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(tip.impact)}`}>
                          {tip.impact} impact
                        </span>
                      </div>
                      <p className="text-gray-600">{tip.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tip.platforms.filter(p => p !== 'all').map((platform) => (
                          <span key={platform} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            {platformIcons[platform]}
                            {platformLabels[platform]}
                          </span>
                        ))}
                        {tip.contentTypes.filter(c => c !== 'all').map((contentType) => (
                          <span key={contentType} className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-600">
                            {contentTypeLabels[contentType]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${expandedTip === tip.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedTip === tip.id && (
                  <div className="border-t bg-gray-50 p-6">
                    {/* Key Tips */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Key Tips
                      </h4>
                      <ul className="space-y-2">
                        {tip.tips.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Do and Don't */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-50 rounded-xl p-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Do This
                        </h4>
                        <ul className="space-y-2">
                          {tip.doList.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-green-700 text-sm">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 rounded-xl p-4">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Avoid This
                        </h4>
                        <ul className="space-y-2">
                          {tip.dontList.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Example */}
                    {tip.example && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          Example in Action
                        </h4>
                        <p className="text-blue-700">{tip.example}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Back to Safira */}
        <div className="mt-8 text-center">
          <Link href="/dashboard/safira">
            <Button variant="outline" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Safira Program
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
