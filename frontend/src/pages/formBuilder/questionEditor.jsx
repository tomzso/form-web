import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const QuestionEditor = ({
  imageUrl,
  widgetRef,
  inputRef,
  question,
  handleQuestionChange,
  required,
  setRequired,
  handleAddTextbox,
  handleAddInput,
  activeInputType,
  textboxInput,
  handleTextboxInputChange,
  radioboxes,
  selectedRadio,
  handleRadioChange,
  radioLabels,
  handleLabelChange,
  handleAddRadioOption,
  handleRemoveInput,
  checkboxes,
  handleCheckboxChange,
  checkboxLabels,
  handleAddCheckboxOption,
  handleSaveQuestion,
  successMessage,
  errorMessage,
}) => {
  return (
    <>
      {/* Question input */}
      <div className="add-question-title">
        <h3>Add more question below:</h3>
      </div>

      <div className="question-container">
        <div className="upload-container">
          {imageUrl && (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt="Uploaded"
              />
            </div>
          )}
          <button
            className="upload-icon-button"
            onClick={() => widgetRef.current.open()}
          >
            <FontAwesomeIcon icon={faImage} className="upload" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={handleQuestionChange}
          placeholder="Type your next question..."
        />
        {question && <p>Your question: "{question}"</p>}
      </div>

      <div className="required-checkbox-container">
        <label className="required-checkbox-label">
          <input
            type="checkbox"
            checked={required}
            onChange={() => setRequired(!required)}
          />
          This question is required
        </label>
      </div>

      <div className="question-container">
        <div className="button-container">
          <button className="green-button" onClick={handleAddTextbox}>
            Textbox
          </button>
          <button
            className="green-button"
            onClick={() => handleAddInput("radiobox", true)}
          >
            Radio Buttons
          </button>
          <button
            className="green-button"
            onClick={() => handleAddInput("checkbox", true)}
          >
            Checkbox
          </button>
        </div>

        {activeInputType === "textbox" && (
          <input
            type="text"
            value={textboxInput}
            onChange={handleTextboxInputChange}
            placeholder="Enter textbox answer"
          />
        )}

        {activeInputType === "radiobox" && (
          <>
            {radioboxes.map((_, index) => (
              <div key={index} className="input-container-check-radio">
                <input
                  type="radio"
                  checked={selectedRadio === index}
                  onChange={() => handleRadioChange(index)}
                />
                <input
                  type="text"
                  value={radioLabels[index]}
                  onChange={(e) =>
                    handleLabelChange("radiobox", index, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="input-width"
                />
              </div>
            ))}
            <div className="add-remove-buttons-container">
              <button className="green-button" onClick={handleAddRadioOption}>
                +
              </button>
              <button
                className="red-button"
                onClick={() => handleRemoveInput("radiobox")}
              >
                -
              </button>
            </div>
          </>
        )}

        {activeInputType === "checkbox" && (
          <>
            {checkboxes.map((_, index) => (
              <div key={index} className="input-container-check-radio">
                <input
                  type="checkbox"
                  checked={checkboxes[index]}
                  onChange={() => handleCheckboxChange(index)}
                />
                <input
                  type="text"
                  value={checkboxLabels[index]}
                  onChange={(e) =>
                    handleLabelChange("checkbox", index, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="input-width"
                />
              </div>
            ))}
            <div className="add-remove-buttons-container">
              <button className="green-button" onClick={handleAddCheckboxOption}>
                +
              </button>
              <button
                className="red-button"
                onClick={() => handleRemoveInput("checkbox")}
              >
                -
              </button>
            </div>
          </>
        )}

        <div className="save-buttons-question">
          <button onClick={handleSaveQuestion}>Save Question</button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </>
  );
};

export default QuestionEditor;
