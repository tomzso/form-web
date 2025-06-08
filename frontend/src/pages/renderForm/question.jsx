import React from "react";

const QuestionRenderer = ({
  field,
  index,
  currentPage,
  questionsPerPage,
  answers,
  form,
  userResponse,
  formErrors,
  handleAnswerChange,
  renderUserAnswers,
  renderCorrectAnswer,
}) => {
  const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;

  return (
    <div key={field.id} className="question-container">
      <div className="upload-container">
        {field.imageUrl && (
          <div className="image-preview">
            <img
              src={field.imageUrl}
              alt=""
            />
          </div>
        )}
      </div>

      <div className="question-title-wrapper">
        <div className="question-title">
          <span className="question-number">{questionNumber}.</span>
          {field.label}
          {field.required && <span className="required-star">*</span>}
        </div>
      </div>

      {/* Textbox */}
      {field.fieldType === "textbox" && (
        <div className="input-wrapper">
          <input
            type="text"
            value={
              userResponse
                ? renderUserAnswers(field)
                : answers.find((a) => a.questionId === field.id)?.value || ""
            }
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            required={field.required}
            className="input-field"
            disabled={userResponse}
          />
        </div>
      )}

      {/* Checkbox */}
      {field.fieldType === "checkbox" && (
        <div className="checkbox-wrapper">
          {field.options.map((option) => {
            const isChecked = renderUserAnswers(field).includes(option.optionValue);
            const isCorrect = option.isCorrect;

            return (
              <label
                key={option.id}
                className="checkbox-label"
                style={{
                  color:
                    isChecked && form.type === "Quiz"
                      ? isCorrect
                        ? "green"
                        : "red"
                      : "inherit",
                }}
              >
                <input
                  type="checkbox"
                  value={option.optionValue}
                  checked={
                    userResponse
                      ? renderUserAnswers(field).includes(option.optionValue)
                      : answers
                          .find((a) => a.questionId === field.id)
                          ?.value.includes(option.optionValue)
                  }
                  onChange={() =>
                    handleAnswerChange(field.id, option.optionValue, true)
                  }
                  required={field.required}
                  className="checkbox-input"
                  disabled={userResponse}
                />
                {option.optionValue}
              </label>
            );
          })}
        </div>
      )}

      {/* Radio */}
      {field.fieldType === "radiobox" && (
        <div className="radio-wrapper">
          {field.options.map((option) => {
            const isSelected = renderUserAnswers(field) === option.optionValue;
            const isCorrect = option.isCorrect;

            return (
              <label
                key={option.id}
                className="radio-label"
                style={{
                  color:
                    isSelected && form.type === "Quiz"
                      ? isCorrect
                        ? "green"
                        : "red"
                      : "inherit",
                }}
              >
                <input
                  type="radio"
                  name={`question-${field.id}`}
                  value={option.optionValue}
                  checked={
                    userResponse
                      ? isSelected
                      : answers.find((a) => a.questionId === field.id)
                          ?.value === option.optionValue
                  }
                  onChange={() => handleAnswerChange(field.id, option.optionValue)}
                  required={field.required}
                  className="radio-input"
                  disabled={userResponse}
                />
                {option.optionValue}
              </label>
            );
          })}
        </div>
      )}

      {/* Correct answer display */}
      <div className="correct-answer-container">
        {form.type === "Quiz" && userResponse != null && (
          <span>Correct answer: {renderCorrectAnswer(field)}</span>
        )}
      </div>

      {field.required && (
        <div className="parent-required-text">
          <p className="required-text">This question is required to answer.</p>
        </div>
      )}

      {formErrors.includes(field.id) && (
        <p className="error-text">This field is required.</p>
      )}
    </div>
  );
};

export default QuestionRenderer;
