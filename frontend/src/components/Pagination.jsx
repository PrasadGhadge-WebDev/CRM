export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const showAll = String(limit).toLowerCase() === 'all'
  const numericLimit = Number(limit) || 0
  const totalPages = showAll ? 1 : Math.ceil(total / numericLimit)
  
  return (
    <div className="pagination row">
      <div className="paginationGroup row small-gap">
        <button 
          className="btn secondary small" 
          onClick={() => onPageChange(page - 1)}
          disabled={showAll || page <= 1}
        >
          Previous
        </button>

        <div className="pageInfo muted small">
          Page {page} of {Math.max(1, totalPages)} ({total} total)
        </div>

        <button 
          className="btn secondary small" 
          onClick={() => onPageChange(page + 1)}
          disabled={showAll || page >= totalPages}
        >
          Next
        </button>
      </div>

      {onLimitChange && (
        <div className="limitGroup row small-gap">
          <span className="muted small">Show:</span>
          <select 
            className="input small" 
            style={{ width: 'auto', padding: '2px 8px' }}
            value={limit}
            onChange={(e) => {
              const nextValue = e.target.value
              onLimitChange(nextValue === 'all' ? 'all' : Number(nextValue))
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="all">All</option>
          </select>
        </div>
      )}

      <style>{`
        .pagination {
          margin-top: 24px;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
        }
        .paginationGroup {
          align-items: center;
          gap: 16px;
        }
        .limitGroup {
          align-items: center;
        }
        .pageInfo {
          font-weight: 500;
          min-width: 120px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
