import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const DescriptionEditor = ({
  description,
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
            value={description}
            onChange={onChange}
            placeholder="Enter form description"
            className="form-title-input"
            onKeyDown={onKeyDown}
          />
          <button className="edit-icon-button" onClick={onToggleEdit}>
            <FontAwesomeIcon icon={faCheck} className="edit" />
          </button>
        </>
      ) : (
        <>
          <div className="form-desc">{description}</div>
          <button className="edit-icon-button" onClick={onToggleEdit}>
            <FontAwesomeIcon icon={faPenToSquare} className="edit" />
          </button>
        </>
      )}
    </div>
  );
};

export default DescriptionEditor;
