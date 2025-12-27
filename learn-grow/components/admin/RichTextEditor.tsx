"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: placeholder || "Write content..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose max-w-none min-h-[300px] p-4 border rounded-md" },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleStrike().run()}>Strike</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullets</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>Numbered</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().setTextAlign("left").run()}>Left</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().setTextAlign("center").run()}>Center</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().setTextAlign("right").run()}>Right</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className="btn btn-sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
