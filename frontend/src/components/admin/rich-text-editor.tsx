"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
  Eye,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write agreement terms and body...",
  minHeight = "min-h-[220px]",
  className,
}: RichTextEditorProps) {
  const [viewSource, setViewSource] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isInternalChange = React.useRef(false);

  // Sync value to contentEditable div when external value changes
  React.useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertHtml = (html: string) => {
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const addTable = () => {
    const tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin: 12px 0;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Milestone / Deliverable</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Target Timeline</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Milestone 1 — Initial Setup & Prototype</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Week 1</td>
            <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">40% Advance</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Milestone 2 — Final Deployment & Handover</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Week 3</td>
            <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">60% Balance</td>
          </tr>
        </tbody>
      </table>
    `;
    insertHtml(tableHtml);
  };

  const addLink = () => {
    const url = prompt("Enter Link URL:", "https://");
    if (url) {
      exec("createLink", url);
    }
  };

  return (
    <div className={cn("rounded-lg border bg-background shadow-sm", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1.5 text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-4 w-[1px] bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("formatBlock", "h2")}
          title="Heading 2"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("formatBlock", "h3")}
          title="Heading 3"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("formatBlock", "p")}
          title="Paragraph"
        >
          <Heading3 className="h-4 w-4 text-xs font-bold" />
        </Button>

        <div className="mx-1 h-4 w-[1px] bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("formatBlock", "blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-4 w-[1px] bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addTable}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("insertHorizontalRule")}
          title="Divider Line"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addLink}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant={viewSource ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
            onClick={() => setViewSource((s) => !s)}
          >
            {viewSource ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Visual
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5" /> HTML
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      {viewSource ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("font-mono text-xs border-0 rounded-t-none focus-visible:ring-0", minHeight)}
          placeholder="HTML Source code..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none overflow-y-auto leading-relaxed",
            minHeight
          )}
          style={{ minHeight: "220px" }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}
