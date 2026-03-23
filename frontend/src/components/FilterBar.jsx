import { useState } from 'react'
import { Icon } from '../layouts/icons.jsx'

export default function FilterBar({ 
  onFilterChange, 
  filters = {}, 
  options = {}, 
  sortFields = [],
  currentSort = { field: 'created_at', order: 'desc' }
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value })
  }

  const handleSort = (field) => {
    const order = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc'
    onFilterChange({ ...filters, sortField: field, sortOrder: order })
  }

  return (
    <div className="filterBar stack">
      <div className="row">
        <button className="btn secondary small" onClick={() => setIsOpen(!isOpen)}>
          <Icon name="filter" /> Filters {Object.values(filters).filter(v => v && v !== 'all').length > 0 && '(Active)'}
        </button>

        <div className="sortOptions row gap10">
           <span className="muted small">Sort by:</span>
           {sortFields.map(f => (
             <button 
               key={f.key} 
               className={`btn small ${currentSort.field === f.key ? 'secondary' : 'ghost'}`}
               onClick={() => handleSort(f.key)}
             >
               {f.label} 
               {currentSort.field === f.key && (
                 <span style={{ marginLeft: 4 }}>
                   {currentSort.order === 'asc' ? '↑' : '↓'}
                 </span>
               )}
             </button>
           ))}
        </div>
      </div>

      {isOpen && (
        <div className="card filterGrid">
           {Object.keys(options).map(key => (
             <div key={key} className="field">
                <label className="capitalize">{key.replace('_', ' ')}</label>
                <select 
                  className="input small" 
                  value={filters[key] || ''} 
                  onChange={(e) => handleChange(key, e.target.value)}
                >
                  <option value="">All</option>
                  {options[key].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
             </div>
           ))}
           <button className="btn small" onClick={() => onFilterChange({ sortField: 'created_at', sortOrder: 'desc' })}>
              Reset
           </button>
        </div>
      )}

      <style>{`
        .filterBar { margin-bottom: 16px; }
        .filterGrid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
           gap: 16px;
           padding: 16px;
           margin-top: 8px;
           background: var(--card-bg);
           border-radius: 8px;
           border: 1px solid var(--border);
        }
        .small-gap { gap: 8px; }
        .capitalize { text-transform: capitalize; }
        .linkBtn.active { color: var(--primary); font-weight: bold; }
      `}</style>
    </div>
  )
}
