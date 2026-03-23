import { useNavigate } from 'react-router-dom'
import { Icon } from '../layouts/icons.jsx'

export default function PageHeader({
  title,
  description,
  backTo = '/',
  backLabel = 'Back',
  actions,
}) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(backTo)
  }

  return (
    <div className="pageHeader">
      <div className="pageHeaderIntro">
        <button className="btn pageBackBtn" type="button" onClick={handleBack}>
          <Icon name="arrowLeft" />
          {backLabel}
        </button>
        <div>
          <h1>{title}</h1>
          {description ? <p className="muted pageHeaderDescription">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="pageHeaderActions">{actions}</div> : null}
    </div>
  )
}
