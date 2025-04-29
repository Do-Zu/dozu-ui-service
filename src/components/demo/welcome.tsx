'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, Book, Code, FileText, GitFork, Server } from 'lucide-react';

import axios from '@/api/axios';
import { Button } from '../ui/button';
import useFetch from '@/hooks/useFetch';

interface ApiResponse {
  data: any[];
  project: {
    name: string;
    version: string;
    description: string;
  };
  architecture: {
    pattern: string;
    features: string[];
  };
  development: {
    setup: string;
    commands: {
      dev: string;
      build: string;
      start: string;
      lint: string;
      typecheck: string;
    };
  };
  apiGuide: {
    folderStructure: Record<string, string>;
    routingGuide: string;
    errorHandling: string;
    responseFormat: string;
    securityBestPractices: string[];
    exampleEndpoint: {
      path: string;
      method: string;
      controller: string;
      service: string;
      repository: string;
    };
  };
  deploymentOptions: {
    vercel: string;
    docker: string;
    traditional: string;
  };
  documentation: {
    swagger: string;
    readme: string;
  };
}

const WelcomeDemo: React.FC = () => {
  // const [apiData, setApiData] = useState<ApiResponse | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get('/demo');
  //     console.log('Data fetched successfully:', response.data);
  //     setApiData(response.data?.data);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setError('Failed to load developer guide');
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const param = '/demo';
  const { data: apiData, error, loading, refetch } = useFetch<ApiResponse>(param);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Error Loading Developer Guide</h2>
        <p>{error}</p>
        <button
          onClick={() => refetch()}
          className="rounded-md bg-primary px-4 py-2 text-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!apiData) return null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">{apiData?.project?.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{apiData?.project?.description}</p>
        <Badge variant="outline" className="mt-2">
          {apiData.project?.version}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="api">API Guide</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Overview
              </CardTitle>
              <CardDescription>Get familiar with the DOZU API Service project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">About</h3>
                <p>{apiData.project.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Documentation</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Book className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">API Documentation</h4>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {apiData.documentation.swagger}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      <h4 className="font-medium">README</h4>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {apiData.documentation.readme}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitFork className="h-5 w-5" />
                Architecture
              </CardTitle>
              <CardDescription>Pattern: {apiData.architecture.pattern}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="mb-4 text-xl font-semibold">Features</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {apiData.architecture.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Development
              </CardTitle>
              <CardDescription>Setup and commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Setup</h3>
                <CodeBlock language="bash" code={apiData.development.setup} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Commands</h3>
                <div className="rounded-md border">
                  <div className="grid divide-y">
                    {Object.entries(apiData.development.commands).map(([cmd, desc], i) => (
                      <div key={i} className="flex items-start p-3">
                        <div className="flex w-28 shrink-0 items-center">
                          <span className="rounded bg-secondary px-2 py-1 text-sm font-mono">
                            npm run {cmd}
                          </span>
                        </div>
                        <span className="ml-4">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Guide Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="folder-structure">
                  <AccordionTrigger>Folder Structure</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {Object.entries(apiData.apiGuide.folderStructure).map(([folder, desc], i) => (
                        <div key={i} className="rounded-md border p-3">
                          <div className="font-mono text-sm font-semibold text-primary">
                            {folder}/
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="routing">
                  <AccordionTrigger>Routing Guide</AccordionTrigger>
                  <AccordionContent>
                    <p>{apiData.apiGuide.routingGuide}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="error-handling">
                  <AccordionTrigger>Error Handling</AccordionTrigger>
                  <AccordionContent>
                    <p>{apiData.apiGuide.errorHandling}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="response">
                  <AccordionTrigger>Response Format</AccordionTrigger>
                  <AccordionContent>
                    <p>{apiData.apiGuide.responseFormat}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security">
                  <AccordionTrigger>Security Best Practices</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 list-disc space-y-1">
                      {apiData.apiGuide.securityBestPractices.map((practice, i) => (
                        <li key={i}>{practice}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Endpoint
              </CardTitle>
              <CardDescription>
                {apiData.apiGuide.exampleEndpoint.path} ({apiData.apiGuide.exampleEndpoint.method})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-md border p-3">
                  <div className="font-medium">Controller</div>
                  <code className="block mt-1 text-sm">
                    {apiData.apiGuide.exampleEndpoint.controller}
                  </code>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-medium">Service</div>
                  <code className="block mt-1 text-sm">
                    {apiData.apiGuide.exampleEndpoint.service}
                  </code>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-medium">Repository</div>
                  <code className="block mt-1 text-sm">
                    {apiData.apiGuide.exampleEndpoint.repository}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Deployment Options
              </CardTitle>
              <CardDescription>Different ways to deploy the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Vercel</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{apiData.deploymentOptions.vercel}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Docker</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{apiData.deploymentOptions.docker}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Traditional</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{apiData.deploymentOptions.traditional}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Button
        className="mt-t4"
        onClick={async () => {
          const rs = await axios.post('/demo', { action: 'access' });
          if (rs.status === 200) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        Access
      </Button>
    </div>
  );
};

const Check: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  return (
    <div className="rounded-md bg-muted p-4">
      <pre className="text-sm">
        <code>{code}</code>
        <div>{language}</div>
      </pre>
    </div>
  );
};

export default WelcomeDemo;
