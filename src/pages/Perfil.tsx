import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Perfil.css';

export default function Perfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    async function loadProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user!.id)
        .single();
      
      if (!error && data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setMessage(null);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString()
      });
      
    setSubmitting(false);
    
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' });
      // The Layout component will react to changes next time it mounts, 
      // but we could also use a Context or force reload if needed.
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 2MB.' });
      return;
    }
    
    setUploadingAvatar(true);
    setMessage(null);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) {
      setMessage({ type: 'error', text: 'Erro ao fazer upload da imagem.' });
      setUploadingAvatar(false);
      return;
    }
    
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    setAvatarUrl(data.publicUrl);
    setUploadingAvatar(false);
  }

  if (loading) {
    return <div className="page-content"><p>Carregando perfil...</p></div>;
  }

  return (
    <div className="page-content perfil-page">
      <h1 className="detalhe-title">Meu Perfil</h1>
      <p className="detalhe-meta" style={{ marginBottom: '2rem' }}>Atualize seus dados e sua foto de exibição.</p>
      
      {message && (
        <div className={`perfil-message perfil-message--${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="perfil-form">
        <div className="perfil-avatar-section">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="perfil-avatar-preview" />
          ) : (
            <div className="perfil-avatar-placeholder">
              {(fullName || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="perfil-avatar-actions">
            <label className="perfil-upload-btn">
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp, image/gif" 
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
            <span className="perfil-upload-hint">JPG, PNG, GIF ou WEBP (Max 2MB)</span>
          </div>
        </div>
        
        <div className="perfil-field">
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            value={user?.email || ''} 
            disabled 
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          />
        </div>
        
        <div className="perfil-field">
          <label htmlFor="nomeCompleto">Nome Completo</label>
          <input 
            id="nomeCompleto" 
            type="text" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            placeholder="Ex: João da Silva"
          />
        </div>
        
        <div className="perfil-actions">
          <button type="submit" className="perfil-btn-save" disabled={submitting || uploadingAvatar}>
            {submitting ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
