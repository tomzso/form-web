import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faTrashCan, faPen, faCopy } from "@fortawesome/free-solid-svg-icons";
import "./formCard.css";

const FormCard = ({ form, onEdit, onStats, onDelete, onCopyUrl }) => (
  <div className="form-card">
    <p className="form-title2">{form.title}</p>
    <p className="form-description">{form.description}</p>
    <p className="form-date">Created: {new Date(form.createdAt).toLocaleDateString()}</p>
    <p className="form-type">Type: {form.type}</p>
    <div className="form-url">
      Url: <strong>{form.url}</strong>
      <button
        className="copy-button"
        onClick={() => onCopyUrl(form.url)}
        title="Copy URL"
      >
        <FontAwesomeIcon icon={faCopy} />
      </button>
    </div>
    <div className="form-actions">
      <button className="action-button edit-button" onClick={() => onEdit(form.url)}>
        <FontAwesomeIcon icon={faPen} />
      </button>
      <button className="action-button stats-button" onClick={() => onStats(form.url)}>
        <FontAwesomeIcon icon={faChartPie} />
      </button>
      <button className="action-button deleting-button" onClick={onDelete}>
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    </div>
  </div>
);

export default FormCard;
