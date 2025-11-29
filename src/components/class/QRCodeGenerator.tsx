'use client';

import React, { useRef, useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  inviteLink: string;
  className?: string;
  size?: number;
  showDownload?: boolean;
  showCopy?: boolean;
  showSizeControl?: boolean;
}

export function QRCodeGenerator({
  inviteLink,
  className = '',
  size: initialSize = 200,
  showDownload = true,
  showCopy = true,
  showSizeControl = true,
}: QRCodeGeneratorProps) {
  const [size, setSize] = useState(initialSize);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const svgRef = useRef<any>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    if (!svgRef.current) return;

    try {
      // Convert SVG to canvas
      const svg = svgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Create image from SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);
        
        // Download as PNG
        const link = document.createElement('a');
        link.download = 'class-invite-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Downloaded!",
          description: "QR code downloaded successfully",
        });
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">QR Code</CardTitle>
        {showSizeControl && (
          <div className="space-y-2">
            <Label htmlFor="qr-size">Size: {size}px</Label>
            <Input
              id="qr-size"
              type="range"
              min="100"
              max="400"
              step="10"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white dark:bg-gray-100 rounded-lg border">
          <div>
            <QRCodeSVG
              ref={svgRef}
              value={inviteLink}
              size={size}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          {showCopy && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
          )}
          
          {showDownload && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadQR}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR
            </Button>
          )}
        </div>

        {/* Link Display */}
        <div className="space-y-2">
          <Label>Invite Link:</Label>
          <div className="p-2 bg-gray-50 rounded border text-sm font-mono break-all">
            {inviteLink}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
