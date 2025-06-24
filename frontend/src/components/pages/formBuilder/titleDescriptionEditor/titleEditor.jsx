import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import "./titleDescriptionEditor.css";

export const TitleEditor = ({
  title,
  isEditing,
  onChange,
  onToggleEdit,
  onKeyDown,
}) => {
  return (
    <div className="form-title-container">
      {isEditing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={onChange}
            placeholder="Enter form title"
            className="form-title-input"
            onKeyDown={onKeyDown}
          />
          <button className="edit-icon-button" onClick={onToggleEdit}>
            <FontAwesomeIcon icon={faCheck} className="edit" />
          </button>
        </>
      ) : (
        <>
          <div className="form-title">{title}</div>
          <button className="edit-icon-button" onClick={onToggleEdit}>
            <FontAwesomeIcon icon={faPenToSquare} className="edit" />
          </button>
        </>
      )}
    </div>
  );
};


