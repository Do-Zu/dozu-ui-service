import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BookOpen,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Filter,
  FileText,
  HelpCircle,
  Lightbulb,
  Brain,
  BarChart,
} from 'lucide-react';

interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'flashcards' | 'notes' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  relevance: number;
  tags: string[];
  imageUrl?: string;
  matchedLearningStyle?: string;
  completionRate?: number;
}

interface SuggestContentProps {
  recommendations?: ContentRecommendation[];
  onSelectContent?: (contentId: string) => void;
  onFilterChange?: (filter: string) => void;
}

const SuggestContent: React.FC<SuggestContentProps> = ({
  recommendations = [
    {
      id: '1',
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into closures, prototypes, and asynchronous patterns in JavaScript.',
      type: 'flashcards',
      difficulty: 'advanced',
      estimatedTime: '3 hours',
      popularity: 92,
      relevance: 95,
      tags: ['JavaScript', 'Web Development', 'Programming'],
      imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
      matchedLearningStyle: 'visual',
      completionRate: 87,
    },
    {
      id: '2',
      title: 'CSS Grid Mastery',
      description: 'Master complex layouts with CSS Grid and responsive design techniques.',
      type: 'notes',
      difficulty: 'intermediate',
      estimatedTime: '2 hours',
      popularity: 88,
      relevance: 90,
      tags: ['CSS', 'Web Design', 'Responsive'],
      imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80',
      matchedLearningStyle: 'reading',
      completionRate: 92,
    },
    {
      id: '3',
      title: 'React Hooks in Depth',
      description:
        'Comprehensive guide to all React hooks with practical examples and best practices.',
      type: 'quiz',
      difficulty: 'intermediate',
      estimatedTime: '4 hours',
      popularity: 95,
      relevance: 98,
      tags: ['React', 'JavaScript', 'Web Development'],
      imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80',
      matchedLearningStyle: 'logical',
      completionRate: 95,
    },
    {
      id: '4',
      title: 'TypeScript Fundamentals',
      description: 'Essential TypeScript concepts for building type-safe applications.',
      type: 'flashcards',
      difficulty: 'beginner',
      estimatedTime: '2.5 hours',
      popularity: 85,
      relevance: 92,
      tags: ['TypeScript', 'JavaScript', 'Programming'],
      imageUrl: 'https://images.unsplash.com/photo-1613490900233-141c5560d75d?w=800&q=80',
      matchedLearningStyle: 'visual',
      completionRate: 89,
    },
    {
      id: '5',
      title: 'UI/UX Design Principles',
      description:
        'Learn fundamental design principles to create intuitive and beautiful user interfaces.',
      type: 'notes',
      difficulty: 'beginner',
      estimatedTime: '3 hours',
      popularity: 82,
      relevance: 85,
      tags: ['Design', 'UI/UX', 'Web Design'],
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      matchedLearningStyle: 'visual',
      completionRate: 78,
    },
    {
      id: '6',
      title: 'Node.js API Development',
      description: 'Build robust and scalable APIs with Node.js, Express, and MongoDB.',
      type: 'quiz',
      difficulty: 'advanced',
      estimatedTime: '5 hours',
      popularity: 90,
      relevance: 88,
      tags: ['Node.js', 'Backend', 'API'],
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      matchedLearningStyle: 'kinesthetic',
      completionRate: 91,
    },
  ],
  onSelectContent = () => {},
  onFilterChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [learningStyleFilter, setLearningStyleFilter] = useState<string>('all');

  const filteredRecommendations = recommendations
    .filter((item) => {
      // Filter by content type
      if (
        activeTab !== 'all' &&
        item.type !== activeTab &&
        !(activeTab === 'quizzes' && item.type === 'quiz')
      ) {
        return false;
      }

      // Filter by learning style
      if (learningStyleFilter !== 'all' && item.matchedLearningStyle !== learningStyleFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'relevance') return b.relevance - a.relevance;
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'completion') return b.completionRate! - a.completionRate!;
      if (sortBy === 'time-asc') {
        return parseInt(a.estimatedTime) - parseInt(b.estimatedTime);
      }
      if (sortBy === 'time-desc') {
        return parseInt(b.estimatedTime) - parseInt(a.estimatedTime);
      }
      return 0;
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-[#e9ecef] text-[#495057]';
      case 'intermediate':
        return 'bg-[#e9ecef] text-[#495057]';
      case 'advanced':
        return 'bg-[#e9ecef] text-[#495057]';
      default:
        return 'bg-[#e9ecef] text-[#495057]';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcards':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'notes':
        return <FileText className="h-4 w-4 text-[#495057]" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-[#495057]" />;
      default:
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'auditory':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'reading':
        return <FileText className="h-4 w-4 text-[#495057]" />;
      case 'kinesthetic':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'logical':
        return <Lightbulb className="h-4 w-4 text-[#495057]" />;
      default:
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 bg-white rounded-xl border border-[#dee2e6] shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#212529]">
            Personalized Learning Recommendations
          </h2>
          <p className="text-[#6c757d]">
            Next topics tailored to your learning style and experience
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500 h-4 w-4" />
            <span className="text-sm text-gray-600">Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-[#ced4da] rounded-md text-[#495057] text-sm bg-white"
          >
            <option value="relevance">Relevance</option>
            <option value="popularity">Popularity</option>
            <option value="completion">Completion Rate</option>
            <option value="time-asc">Time (Shortest First)</option>
            <option value="time-desc">Time (Longest First)</option>
          </select>
        </div>
      </div>

      <div className="mb-6 p-4 bg-[#f8f9fa] rounded-lg border border-[#dee2e6]">
        <h3 className="text-lg font-medium text-[#343a40] mb-2">Learning Style Preferences</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={learningStyleFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setLearningStyleFilter('all')}
            className={learningStyleFilter === 'all' ? 'bg-[#343a40]' : ''}
            size="sm"
          >
            All Styles
          </Button>
          <Button
            variant={learningStyleFilter === 'visual' ? 'default' : 'outline'}
            onClick={() => setLearningStyleFilter('visual')}
            className={learningStyleFilter === 'visual' ? 'bg-[#343a40]' : ''}
            size="sm"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Visual
          </Button>
          <Button
            variant={learningStyleFilter === 'reading' ? 'default' : 'outline'}
            onClick={() => setLearningStyleFilter('reading')}
            className={learningStyleFilter === 'reading' ? 'bg-[#343a40]' : ''}
            size="sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            Reading/Writing
          </Button>
          <Button
            variant={learningStyleFilter === 'logical' ? 'default' : 'outline'}
            onClick={() => setLearningStyleFilter('logical')}
            className={learningStyleFilter === 'logical' ? 'bg-[#343a40]' : ''}
            size="sm"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Logical
          </Button>
          <Button
            variant={learningStyleFilter === 'kinesthetic' ? 'default' : 'outline'}
            onClick={() => setLearningStyleFilter('kinesthetic')}
            className={learningStyleFilter === 'kinesthetic' ? 'bg-[#343a40]' : ''}
            size="sm"
          >
            <Brain className="mr-2 h-4 w-4" />
            Kinesthetic
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full md:w-auto bg-gray-200">
          <TabsTrigger value="all" className="flex-1 md:flex-none">
            All Content
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex-1 md:flex-none">
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1 md:flex-none">
            Notes
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex-1 md:flex-none">
            Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} onSelect={onSelectContent} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="flashcards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} onSelect={onSelectContent} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} onSelect={onSelectContent} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="quizzes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} onSelect={onSelectContent} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12 bg-[#f8f9fa] rounded-lg border border-[#dee2e6]">
          <BookOpen className="h-12 w-12 text-[#adb5bd] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#343a40] mb-2">
            No matching recommendations found
          </h3>
          <p className="text-[#6c757d] max-w-md mx-auto mb-4">
            Try adjusting your learning style filter or content type to see more recommendations.
          </p>
          <Button
            onClick={() => {
              setLearningStyleFilter('all');
              setActiveTab('all');
            }}
            className="bg-[#343a40] hover:bg-[#212529]"
          >
            Reset Filters
          </Button>
        </div>
      )}

      <div className="mt-8 p-4 bg-[#f8f9fa] rounded-lg border border-[#dee2e6]">
        <h3 className="text-lg font-medium text-[#343a40] mb-2">Your Learning Journey</h3>
        <p className="text-[#495057] mb-4">
          These recommendations are based on your learning history, preferences, and learning style.
          We analyze your completed content, progress patterns, and preferred learning methods to
          suggest the most effective next topics for your journey.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Brain className="h-5 w-5 text-[#495057] mt-0.5" />
            <div>
              <h4 className="font-medium text-[#343a40]">Learning Style Match</h4>
              <p className="text-sm text-[#6c757d]">
                Content formats that align with your preferred learning methods
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BarChart className="h-5 w-5 text-[#495057] mt-0.5" />
            <div>
              <h4 className="font-medium text-[#343a40]">Experience-Based</h4>
              <p className="text-sm text-[#6c757d]">
                Topics that build on your current knowledge and past performance
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-[#495057] mt-0.5" />
            <div>
              <h4 className="font-medium text-[#343a40]">Proven Methods</h4>
              <p className="text-sm text-[#6c757d]">
                Learning approaches with high completion rates for your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  item: ContentRecommendation;
  onSelect: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-[#e9ecef] text-[#495057]';
      case 'intermediate':
        return 'bg-[#e9ecef] text-[#495057]';
      case 'advanced':
        return 'bg-[#e9ecef] text-[#495057]';
      default:
        return 'bg-[#e9ecef] text-[#495057]';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcards':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'notes':
        return <FileText className="h-4 w-4 text-[#495057]" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-[#495057]" />;
      default:
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'auditory':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'reading':
        return <FileText className="h-4 w-4 text-[#495057]" />;
      case 'kinesthetic':
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
      case 'logical':
        return <Lightbulb className="h-4 w-4 text-[#495057]" />;
      default:
        return <BookOpen className="h-4 w-4 text-[#495057]" />;
    }
  };

  return (
    <Card className="overflow-hidden border border-[#dee2e6] hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col">
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: item.imageUrl
            ? `url(${item.imageUrl})`
            : 'linear-gradient(to right, #e9ecef, #dee2e6)',
        }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="secondary"
            className={`${getDifficultyColor(item.difficulty)} font-normal capitalize`}
          >
            {item.difficulty}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-[#f8f9fa] text-[#6c757d] border-[#dee2e6] font-normal flex items-center gap-1"
            >
              {getContentTypeIcon(item.type)}
              <span className="capitalize">{item.type}</span>
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg font-medium text-[#212529] mt-2">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-[#6c757d] text-sm mb-4 line-clamp-3">{item.description}</p>
        <div className="flex items-center text-[#6c757d] text-sm mb-3">
          <Clock className="h-4 w-4 mr-1" />
          <span>{item.estimatedTime}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-[#f8f9fa] text-[#6c757d] border-[#dee2e6] font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[#6c757d] mb-3">
          <div className="flex flex-col">
            <span>Relevance</span>
            <div className="w-full bg-[#e9ecef] h-1.5 rounded-full mt-1">
              <div
                className="bg-[#343a40] h-1.5 rounded-full"
                style={{ width: `${item.relevance}%` }}
              ></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span>Completion Rate</span>
            <div className="w-full bg-[#e9ecef] h-1.5 rounded-full mt-1">
              <div
                className="bg-[#343a40] h-1.5 rounded-full"
                style={{ width: `${item.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        {item.matchedLearningStyle && (
          <div className="flex items-center text-xs text-[#6c757d] mb-3 bg-[#f8f9fa] p-2 rounded-md">
            {getLearningStyleIcon(item.matchedLearningStyle)}
            <span className="ml-2">Matches your {item.matchedLearningStyle} learning style</span>
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button
          onClick={() => onSelect(item.id)}
          className="w-full bg-[#343a40] hover:bg-[#212529] text-white"
        >
          Start Learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default SuggestContent;
