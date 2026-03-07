import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './ImageUrlOrUpload.css';

const BUCKET = 'programas';
const BANNER_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const FAVICON_MAX_BYTES = 256 * 1024;     // 256 KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Variant = 'banner' | 'favicon';

type Props = {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  variant?: Variant;
  /** When set, show upload option. pathPrefix e.g. 'banners', contextId e.g. program id */
  uploadContext?: { pathPrefix: string; contextId: string };
};

export default function ImageUrlOrUpload({
  value,
  onChange,
  label,
  placeholder = 'https://...',
  variant = 'banner',
  uploadContext,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxBytes = variant === 'banner' ? BANNER_MAX_BYTES : FAVICON_MAX_BYTES;
  const canUpload = Boolean(uploadContext?.contextId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadContext) return;
    setUploadError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Formato inválido. Use JPEG, PNG, WebP ou GIF.');
      return;
    }
    if (file.size > maxBytes) {
      setUploadError(
        variant === 'banner'
          ? 'Arquivo muito grande. Máximo 2 MB.'
          : 'Arquivo muito grande. Máximo 256 KB.'
      );
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${uploadContext.pathPrefix}/${uploadContext.contextId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    setUploading(false);
    e.target.value = '';
    if (error) {
      setUploadError(error.message || 'Erro no upload.');
      return;
    }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    onChange(urlData.publicUrl);
  }

  return (
    <div className="image-url-upload">
      <label className="image-url-upload-label">{label}</label>
      <div className="image-url-upload-row">
        <input
          type="url"
          className="image-url-upload-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              className="image-url-upload-file-input"
              aria-label="Enviar arquivo"
            />
            <button
              type="button"
              className="btn btn--secondary image-url-upload-btn"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando…' : 'Enviar arquivo'}
            </button>
          </>
        )}
      </div>
      {uploadContext && !canUpload && (
        <p className="image-url-upload-hint">Salve o item primeiro para poder enviar um arquivo.</p>
      )}
      {uploadError && <p className="image-url-upload-error" role="alert">{uploadError}</p>}
      {value && (
        <div className="image-url-upload-preview">
          <img src={value} alt="" />
        </div>
      )}
    </div>
  );
}
