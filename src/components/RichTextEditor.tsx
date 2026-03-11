'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useI18n } from '@/components/I18nProvider';

// Dynamically import ReactQuill to prevent SSR "document is not defined" issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');
        return function ForwardedQuill(props: any) {
            return <RQ {...props} />;
        };
    },
    {
        ssr: false,
        loading: () => (
            <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg min-h-[400px] flex items-center justify-center text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-800/50">
                Загрузка редактора...
            </div>
        ),
    }
);

interface RichTextEditorProps {
    content: string;
    onChange: (val: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const { t } = useI18n();

    // Memoize the modules so Quill doesn't re-render and lose focus
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: '1' }, { header: '2' }, { font: [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                ['link', 'image', 'video'],
                ['code-block'],
                ['clean'], // remove formatting button
            ],
            clipboard: {
                matchVisual: false, // Prevents weird whitespace on paste
            },
        }),
        []
    );

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'code-block'
    ];

    return (
        <div className="quill-wrapper">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={t('lecture.contentPlaceholder')}
            />

            <style jsx global>{`
                .quill-wrapper .quill {
                    display: flex;
                    flex-direction: column;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    background-color: #ffffff;
                    border: 1px solid #e4e4e7; /* zinc-200 */
                    overflow: hidden;
                }
                .dark .quill-wrapper .quill {
                    background-color: #1e1e1e;
                    border-color: #3f3f46; /* zinc-700 */
                }

                /* Toolbar Styling */
                .quill-wrapper .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e4e4e7;
                    background-color: #fafafa;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    padding: 0.5rem;
                }
                .dark .quill-wrapper .ql-toolbar.ql-snow {
                    border-bottom-color: #3f3f46;
                    background-color: #27272a; /* zinc-800 */
                }

                /* Editor Content Area Styling */
                .quill-wrapper .ql-container.ql-snow {
                    border: none;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 15px;
                }
                .quill-wrapper .ql-editor {
                    min-height: 400px;
                    max-height: 600px;
                    padding: 1rem;
                }
                .dark .quill-wrapper .ql-editor {
                    color: #e4e4e7; /* zinc-200 */
                }
                .quill-wrapper .ql-editor.ql-blank::before {
                    color: #a1a1aa; /* zinc-400 */
                    font-style: normal;
                }
                .dark .quill-wrapper .ql-editor.ql-blank::before {
                    color: #71717a; /* zinc-500 */
                }

                /* Toolbar Controls Styling */
                .dark .quill-wrapper .ql-snow .ql-stroke {
                    stroke: #a1a1aa;
                }
                .dark .quill-wrapper .ql-snow .ql-fill,
                .dark .quill-wrapper .ql-snow .ql-stroke.ql-fill {
                    fill: #a1a1aa;
                }
                .dark .quill-wrapper .ql-snow .ql-picker {
                    color: #a1a1aa;
                }
                .dark .quill-wrapper .ql-snow .ql-picker-options {
                    background-color: #27272a;
                    border-color: #3f3f46;
                }

                /* Active/Hover states */
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar button:focus .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar button:focus .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
                    stroke: #6366f1; /* indigo-500 */
                }
                
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button:hover .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button:focus .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button:focus .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button.ql-active .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
                    fill: #6366f1; /* indigo-500 */
                }
                
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item:hover,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item:hover,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-item.ql-selected,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label:hover,
                .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active,
                .quill-wrapper .ql-snow .ql-toolbar .ql-picker-label.ql-active {
                    color: #6366f1; /* indigo-500 */
                }

                /* Focus rings */
                .quill-wrapper .quill:focus-within {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
                }

                /* Content Styling Overrides */
                .quill-wrapper .ql-editor h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.5em; }
                .quill-wrapper .ql-editor h2 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; }
                .quill-wrapper .ql-editor p { margin-bottom: 1em; }
                .quill-wrapper .ql-editor blockquote {
                    border-left: 4px solid #6366f1;
                    padding-left: 1rem;
                    color: #71717a; /* zinc-500 */
                    font-style: italic;
                }
                .dark .quill-wrapper .ql-editor blockquote {
                    color: #a1a1aa; /* zinc-400 */
                }
                .quill-wrapper .ql-editor pre.ql-syntax {
                    background-color: #1e1e2e;
                    color: #cdd6f4;
                    padding: 1rem;
                    border-radius: 0.375rem;
                }
                .quill-wrapper .ql-editor a {
                    color: #6366f1; /* indigo-500 */
                }
            `}</style>
        </div>
    );
}
