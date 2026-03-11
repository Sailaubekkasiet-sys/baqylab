'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { useI18n } from './I18nProvider';

interface UploadButtonProps {
    onClientUploadComplete: (res: { url: string }[]) => void;
    onUploadError: (error: Error) => void;
    // Ignored in custom implementation to match UploadThing signature
    endpoint?: string;
}

export function UploadButton({ onClientUploadComplete, onUploadError }: UploadButtonProps) {
    const [uploading, setUploading] = useState(false);
    const { t } = useI18n();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const blob = await res.json();
            onClientUploadComplete([{ url: blob.url }]);
        } catch (error: any) {
            onUploadError(error);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="relative inline-block">
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <Button type="button" disabled={uploading} variant="secondary">
                {uploading ? (t('common.loading') || 'Uploading...') : (t('class.uploadFile') || 'Upload File')}
            </Button>
        </div>
    );
}
