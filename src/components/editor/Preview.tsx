/* eslint-disable @next/next/no-img-element */
"use client";

import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MarkdownIt = require("markdown-it");

interface NewsPreviewProps {
  title: string;
  content: string;
  mainImage: string;
}

export function NewsPreview({ title, content, mainImage }: NewsPreviewProps) {
  const md = new MarkdownIt();
  const parsedContent = md.render(content);
  return (
    <div className="max-w-4xl flex-1">
      <Card>
        <CardHeader className="space-y-4">
          {mainImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={mainImage || "/placeholder.svg"}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString()}</span>
              <Badge variant="secondary">Preview</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {title || "Untitled Article"}
            </h1>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{
              __html: parsedContent || "<p>No content yet...</p>",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
