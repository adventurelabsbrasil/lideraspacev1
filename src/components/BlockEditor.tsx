import './BlockEditor.css';

export type Block = {
  id: string;
  type: 'heading' | 'text' | 'link' | 'video' | 'task' | 'subpage';
  content: string;
  url?: string;
};

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
};

export default function BlockEditor({ blocks, onChange }: Props) {
  const addBlock = (type: Block['type']) => {
    onChange([...blocks, { id: Date.now().toString() + Math.random(), type, content: '' }]);
  };

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="block-editor">
      {blocks.length === 0 && <p className="block-editor-empty">Nenhum bloco adicionado. Comece adicionando um bloco abaixo.</p>}
      
      {blocks.map((block, i) => (
        <div key={block.id} className="block-item">
          <div className="block-controls">
            <span className="block-type-label">
              {block.type === 'heading' && '📌 Título'}
              {block.type === 'text' && '📝 Texto'}
              {block.type === 'link' && '🔗 Link Externo'}
              {block.type === 'video' && '🎬 Player de Vídeo'}
              {block.type === 'task' && '✅ Bloco de Tarefa'}
              {block.type === 'subpage' && '📄 Nova Subpágina'}
            </span>
            <button type="button" className="block-remove-btn" onClick={() => removeBlock(i)} aria-label="Remover bloco">×</button>
          </div>
          
          <div className="block-content">
            {block.type === 'heading' && (
              <input 
                type="text" 
                className="block-input block-heading" 
                placeholder="Digite o título..." 
                value={block.content} 
                onChange={e => updateBlock(i, { content: e.target.value })} 
              />
            )}
            
            {block.type === 'text' && (
              <textarea 
                className="block-input block-textarea" 
                placeholder="Digite seu texto..." 
                value={block.content} 
                onChange={e => updateBlock(i, { content: e.target.value })} 
              />
            )}

            {block.type === 'link' && (
              <div className="block-row">
                <input type="text" className="block-input" placeholder="Rótulo do link..." value={block.content} onChange={e => updateBlock(i, { content: e.target.value })} />
                <input type="url" className="block-input" placeholder="https://..." value={block.url || ''} onChange={e => updateBlock(i, { url: e.target.value })} />
              </div>
            )}

            {block.type === 'video' && (
              <input type="url" className="block-input" placeholder="URL do YouTube..." value={block.url || ''} onChange={e => updateBlock(i, { url: e.target.value })} />
            )}

            {block.type === 'task' && (
              <div className="block-row">
                <input type="checkbox" disabled className="block-checkbox" />
                <input type="text" className="block-input" placeholder="Descrição da tarefa..." value={block.content} onChange={e => updateBlock(i, { content: e.target.value })} />
              </div>
            )}
            
            {block.type === 'subpage' && (
              <div className="block-row">
                <input type="text" className="block-input" placeholder="Nome da subpágina..." value={block.content} onChange={e => updateBlock(i, { content: e.target.value })} />
                <input type="url" className="block-input" placeholder="Link da página (opcional)..." value={block.url || ''} onChange={e => updateBlock(i, { url: e.target.value })} />
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div className="block-adder">
        <span className="block-adder-label">+ Adicionar bloco:</span>
        <div className="block-adder-buttons">
          <button type="button" onClick={() => addBlock('heading')}>Título</button>
          <button type="button" onClick={() => addBlock('text')}>Texto Simples</button>
          <button type="button" onClick={() => addBlock('link')}>Link</button>
          <button type="button" onClick={() => addBlock('video')}>Vídeo</button>
          <button type="button" onClick={() => addBlock('task')}>Tarefa</button>
          <button type="button" onClick={() => addBlock('subpage')}>Subpágina</button>
        </div>
      </div>
    </div>
  );
}