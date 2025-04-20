'use client';

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/stores/hooks';
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

const WebsiteView: React.FC = () => {
  const { inputUrl } = useAppSelector((state) => state.contentExtraction);
  const [iframeError, setIframeError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [loading, setLoading] = useState(false);

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url);
      return domain.hostname;
    } catch (e) {
      return url;
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleUseProxy = () => {
    setLoading(true);
    setUseProxy(true);
  };

  const proxyUrl = `/api/website-proxy?url=${encodeURIComponent(inputUrl)}`;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-lg mb-2">Source Website</h3>
        <p className="text-gray-800">
          <a
            href={inputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            {extractDomain(inputUrl)} <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
      <Separator />
      <div className="aspect-video">
        {!iframeError ? (
          <iframe
            className="w-full h-full rounded-md border"
            src={inputUrl}
            title="Website Content"
            sandbox="allow-same-origin allow-scripts"
            onError={handleIframeError}
          ></iframe>
        ) : useProxy ? (
          <div className="relative w-full h-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-70 z-10">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            <iframe
              className="w-full h-full rounded-md border"
              src={proxyUrl}
              title="Proxied Website Content"
              sandbox="allow-same-origin allow-scripts"
              onLoad={() => setLoading(false)}
            ></iframe>
          </div>
        ) : (
          <div className="w-full h-full rounded-md border flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Website cannot be displayed directly</h3>
            <p className="text-gray-600 mb-4">
              This website has security settings that prevent it from being displayed in an iframe.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUseProxy}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Use Proxy View <RefreshCw className="h-4 w-4" />
              </button>
              <a
                href={inputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Open Website <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteView;
