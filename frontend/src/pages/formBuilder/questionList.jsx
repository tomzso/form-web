import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const QuestionList = ({ questions, formType, onDelete }) => {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="content-wrapper">
            {questions.map((q, index) => (
                <div key={index} className="question-container">
                    {/* Image Preview */}
                    {q.imageUrl && (
                        <div className="upload-container">
                            <div className="image-preview">
                                <img
                                    src={q.imageUrl}
                                    alt="Question Illustration"
                                />
                            </div>
                        </div>
                    )}

                    {/* Question Text and Delete */}
                    <div className="question-header">

                        <button
                            className="delete-icon-button"
                            onClick={() => onDelete(index)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="edit" />
                        </button>
                        <div className="question-title">{q.question}</div>
                    </div>

                    {/* Question Options */}
                    {q.type === "textbox" && (
                        <p className="question-answer-text">Answer: {q.options}</p>
                    )}

                    {q.type === "radiobox" && (
                        <div>
                            {q.options.map((option, idx) => (
                                <div key={idx}>
                                    <input
                                        type="radio"
                                        disabled
                                        checked={q.selectedRadio === idx && formType === "Quiz"}
                                        style={{ marginLeft: "90px" }}
                                    />
                                    <span className="question-answer-radio">{option}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {q.type === "checkbox" && (
                        <div>
                            {q.options.map((option, idx) => (
                                <div key={idx}>
                                    <input
                                        type="checkbox"
                                        disabled
                                        checked={q.selectedCheckboxes?.[idx] && formType === "Quiz"}
                                        style={{ marginLeft: "90px" }}
                                    />
                                    <span className="question-answer">{option}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Required Notice */}
                    {q.required && (
                        <div className="parent-required-text">
                            <p className="required-text">This question is required to answer.</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default QuestionList;
