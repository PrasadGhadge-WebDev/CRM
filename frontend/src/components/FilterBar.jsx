import { useState } from 'react'
import { Icon } from '../layouts/icons.jsx'

export default function FilterBar({
  onFilterChange,
  filters = {},
  options = {},
  sortFields = [],
  resetSort = { field: 'created_at', order: 'desc' },
  currentSort = { field: 'created_at', order: 'desc' },
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value })
  }

  const handleSort = (field) => {
    const order = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc'
    onFilterChange({ ...filters, sortField: field, sortOrder: order })
  }

  const handleReset = () => {
    const nextFilters = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'page') {
        nextFilters[key] = 1
        return
      }

      if (key === 'limit') {
        nextFilters[key] = value || 20
        return
      }

      if (key === 'sortField') {
        nextFilters[key] = resetSort.field
        return
      }

      if (key === 'sortOrder') {
        nextFilters[key] = resetSort.order
        return
      }

      nextFilters[key] = typeof value === 'number' ? 0 : ''
    })

    onFilterChange(nextFilters)
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (!value || value === 'all') return false
    return !['page', 'limit', 'sortField', 'sortOrder'].includes(key)
  }).length

  return (
    <div className="filterBar stack">
      <div className="filterBarHeader">
        <button className="btn secondary small filterBarToggle" onClick={() => setIsOpen(!isOpen)}>
          <Icon name="filter" /> Filters {activeFilterCount > 0 && '(Active)'}
        </button>

        <div className="filterBarSorts">
          <span className="muted small">Sort by:</span>
          {sortFields.map((field) => (
            <button
              key={field.key}
              className={`btn small filterSortBtn ${currentSort.field === field.key ? 'secondary' : 'ghost'}`}
              onClick={() => handleSort(field.key)}
            >
              {field.label}
              {currentSort.field === field.key && (
                <span style={{ marginLeft: 4 }}>
                  {currentSort.order === 'asc' ? '^' : 'v'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="card filterGrid">
          {Object.keys(options).map((key) => (
            <div key={key} className="field">
              <label className="capitalize">{key.replace('_', ' ')}</label>
              <select
                className="input small"
                value={filters[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option value="">All</option>
                {options[key].map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button className="btn small filterBarReset" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}

      <style>{`
        .filterBar { margin-bottom: 16px; }
        .filterBarHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .filterBarToggle {
          min-width: 142px;
          min-height: 38px;
        }
        .filterBarSorts {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 8px;
          flex: 1;
        }
        .filterSortBtn {
          min-height: 38px;
        }
        .filterGrid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(180px, 220px));
           gap: 16px;
           padding: 16px;
           margin-top: 8px;
           justify-content: start;
           background: var(--bg-elevated);
           border-radius: 8px;
           border: 1px solid var(--border);
        }
        .field {
          display: grid;
          gap: 8px;
        }
        .field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .filterBarReset {
          align-self: end;
          justify-self: start;
          min-width: 140px;
          min-height: 40px;
        }
        .small-gap { gap: 8px; }
        .capitalize { text-transform: capitalize; }
        .linkBtn.active { color: var(--primary); font-weight: bold; }
        @media (max-width: 760px) {
          .filterBarHeader {
            align-items: stretch;
          }
          .filterBarSorts {
            justify-content: flex-start;
          }
          .filterBarToggle {
            width: fit-content;
          }
          .filterGrid {
            grid-template-columns: 1fr;
          }
          .filterBarReset {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
