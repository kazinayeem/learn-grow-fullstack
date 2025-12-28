"use client";
import React, { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
} from "lexical";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";

type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph mb-2",
  quote: "editor-quote border-l-4 border-gray-400 pl-4 italic",
  heading: {
    h1: "editor-heading-h1 text-4xl font-bold",
    h2: "editor-heading-h2 text-3xl font-bold",
    h3: "editor-heading-h3 text-2xl font-bold",
    h4: "editor-heading-h4 text-xl font-bold",
    h5: "editor-heading-h5 text-lg font-bold",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol list-decimal ml-6",
    ul: "editor-list-ul list-disc ml-6",
    listitem: "editor-listitem",
  },
  link: "editor-link text-blue-600 underline",
  text: {
    bold: "editor-text-bold font-bold",
    italic: "editor-text-italic italic",
    underline: "editor-text-underline underline",
    strikethrough: "editor-text-strikethrough line-through",
    code: "editor-text-code bg-gray-100 px-1 py-0.5 rounded font-mono text-sm",
  },
  code: "editor-code bg-gray-900 text-gray-100 p-4 rounded block font-mono text-sm",
};

const LowPriority = 1;

function Divider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [fontSize, setFontSize] = useState("15");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const type = parentList ? parentList.getTag() : element.getTag();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        setBlockType(type);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();
          element.replace($createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();
          element.replace($createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();
          element.replace($createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();
          element.replace($createCodeNode());
        }
      });
    }
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      <select
        className="px-2 py-1.5 border rounded bg-white text-sm hover:bg-gray-50"
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "paragraph") formatParagraph();
          else if (value === "h1") formatHeading("h1");
          else if (value === "h2") formatHeading("h2");
          else if (value === "h3") formatHeading("h3");
          else if (value === "quote") formatQuote();
          else if (value === "code") formatCode();
        }}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
        <option value="code">Code Block</option>
      </select>

      <Divider />

      <select className="px-2 py-1.5 border rounded bg-white text-sm hover:bg-gray-50" defaultValue="Arial">
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
      </select>

      <Divider />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="px-2 py-1 border rounded-l bg-white hover:bg-gray-100 text-sm font-bold"
          onClick={() => setFontSize((prev) => String(Math.max(8, parseInt(prev) - 1)))}
        >
          -
        </button>
        <span className="px-3 py-1 border-t border-b bg-white text-sm min-w-[45px] text-center">
          {fontSize}
        </span>
        <button
          type="button"
          className="px-2 py-1 border rounded-r bg-white hover:bg-gray-100 text-sm font-bold"
          onClick={() => setFontSize((prev) => String(Math.min(72, parseInt(prev) + 1)))}
        >
          +
        </button>
      </div>

      <Divider />

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isBold ? "bg-gray-200" : "bg-white"
        }`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isItalic ? "bg-gray-200" : "bg-white"
        }`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isUnderline ? "bg-gray-200" : "bg-white"
        }`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isStrikethrough ? "bg-gray-200" : "bg-white"
        }`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isCode ? "bg-gray-200" : "bg-white"
        }`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        title="Code"
      >
        {"</>"}
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          isLink ? "bg-gray-200" : "bg-white"
        }`}
        onClick={insertLink}
        title="Insert Link"
      >
        🔗
      </button>

      <Divider />

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          blockType === "ul" ? "bg-gray-200" : "bg-white"
        }`}
        onClick={formatBulletList}
        title="Bullet List"
      >
        ⦿
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 border rounded hover:bg-gray-100 ${
          blockType === "ol" ? "bg-gray-200" : "bg-white"
        }`}
        onClick={formatNumberedList}
        title="Numbered List"
      >
        1.
      </button>

      <Divider />

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        title="Align Left"
      >
        ⬅
      </button>

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        title="Align Center"
      >
        ↔
      </button>

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        title="Align Right"
      >
        ➡
      </button>

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
        title="Justify"
      >
        ⬌
      </button>

      <Divider />

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      <button
        type="button"
        className="px-2.5 py-1 border rounded bg-white hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Redo (Ctrl+Y)"
      >
        ↷
      </button>
    </div>
  );
}

// Plugin to load initial HTML content when value changes
function LoadContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (html && isFirstRender) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
      setIsFirstRender(false);
    }
  }, [html, editor, isFirstRender]);

  return null;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter some text...",
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "RichEditor",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
    ],
    theme,
    onError(error: Error) {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-lg bg-white overflow-hidden">
        <ToolbarPlugin />
        <div className="relative bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 focus:outline-none prose prose-sm max-w-none"
                style={{ minHeight: "300px" }}
                aria-placeholder={placeholder}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <AutoFocusPlugin />
      <LoadContentPlugin html={value} />
      <OnChangePlugin
        onChange={(editorState, editor) => {
          editor.update(() => {
            editorState.read(() => {
              const html = $generateHtmlFromNodes(editor);
              onChange?.(html);
            });
          });
        }}
      />
    </LexicalComposer>
  );
}
