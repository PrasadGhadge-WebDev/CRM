export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / (Number(limit) || 1)))
  const clampedPage = Math.min(totalPages, Math.max(1, Number(page) || 1))

  const start = total ? (clampedPage - 1) * limit + 1 : 0
  const end = total ? Math.min(total, clampedPage * limit) : 0

  return (
    <div className="pager">
      <div className="pagerLeft muted">
        {total ? (
          <>
            Showing {start}
            {'\u2013'}
            {end} of {total}
          </>
        ) : (
          <>No results</>
        )}
      </div>

      <div className="pagerRight">
        <select
          className="input pagerLimit"
          value={String(limit)}
          onChange={(e) => onLimitChange?.(Number(e.target.value) || 20)}
          aria-label="Rows per page"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>

        <button className="btn" onClick={() => onPageChange?.(clampedPage - 1)} disabled={clampedPage <= 1}>
          Prev
        </button>
        <div className="pagerInfo muted">
          Page {clampedPage} / {totalPages}
        </div>
        <button
          className="btn"
          onClick={() => onPageChange?.(clampedPage + 1)}
          disabled={clampedPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

