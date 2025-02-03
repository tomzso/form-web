import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import "./renderForm.css";
import { getFormByUrl } from "../../api/formApi";
import { getFormResponseByFormId } from "../../api/formResponseApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FormContext } from "../../context/form-context";
import { createFormResponse } from "../../api/formResponseApi";
import { createFieldResponse } from "../../api/fieldResponseApi";
import { createFormFieldOptionByUserAnswer } from "../../api/formFieldOptionApi";

export const RenderForm = () => {
  const { token, logError, logSuccess } = useContext(FormContext);
  const { "*": editPath } = useParams();
  const [form, setForm] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [hasUserResponse, setHasUserResponse] = useState(false);
  const [hasForm, setHasForm] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [answers, setAnswers] = useState([]); 
  const [formErrors, setFormErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [successMessage, setSuccessMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [disableSave, setDisableSave] = useState(false); 
  const questionsPerPage = 5; 

  const getForm = async () => {
    try {
      const response = await getFormByUrl(token, editPath);
      setForm(response.data); 
      console.log("Form:", response.data);
      setHasForm(true);

      try {
        // Fetch form response and set hasResponse
        const formResponse = await getFormResponseByFormId(
          token,
          response.data.id
        );
        setUserResponse(formResponse.data);
        setHasUserResponse(true);
      } catch (err) {
        console.error("Error fetching form response:", err);
        setError(err.message || "Error fetching form response");
        setHasUserResponse(false);
      }
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(err.message || "Error fetching form");
      setHasUserResponse(false); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    console.log("Answers:", answers);
    console.log("HasResponse:", hasUserResponse);
    console.log("UserResponse:", userResponse);
  }, [answers, hasUserResponse, userResponse]);

  useEffect(() => {
    getForm();
  }, [editPath]);

  const handleSaveResponse = async () => {
    // Validate required questions before saving
    const errors = form?.formFields
      .filter(
        (q) =>
          q.required &&
          !answers.find((a) => a.questionId === q.id)?.value?.length
      ) // Check if value is empty or missing
      .map((q) => q.id);

    if (errors.length > 0) {
      // Update form errors and alert the user
      setFormErrors(errors);
      logError(
        "Please fill out all required fields before submitting.",
        setErrorMessage
      );
      return; // Exit the function early if validation fails
    }

    try {
      // Save the overall form response
      const formResponse = await createFormResponse(token, form.id);
      const responseId = formResponse.data.id;

      // Iterate over answers and save field responses
      for (const answer of answers) {
        const { questionId, value } = answer;
        const field = form.formFields.find((field) => field.id === questionId); // Find the field for the answer

        // Check if the field is a textbox (single value)
        if (field.fieldType === "textbox") {
          try {
            // Save the textbox value
            const optionVal = value.trim();
            await createFormFieldOptionByUserAnswer(
              token,
              optionVal,
              false,
              questionId
            );
          } catch (error) {
            console.error("createFormFieldOptionByUserAnswer:", error);
          }
          // Save single value for textbox
          await createFieldResponse(token, responseId, questionId, value);
        }

        // Check if the field is a radio button (single value selection)
        else if (field.fieldType === "radiobox") {
          // Save the selected radio button value
          await createFieldResponse(token, responseId, questionId, value);
        }

        // Check if the field is a checkbox (multiple values)
        else if (field.fieldType === "checkbox") {
          // Save each selected value for the checkbox
          for (const selectedValue of value) {
            await createFieldResponse(
              token,
              responseId,
              questionId,
              selectedValue
            );
          }
        }
      }

      setDisableSave(true); // Disable the save button after successful submission
      logSuccess("Form responses saved successfully!", setSuccessMessage);

      getForm(); // Refresh the form after saving responses
    } catch (error) {
      console.error("Error saving responses:", error);
      logError("Error saving responses!", setErrorMessage);
    }
  };

  const handleAnswerChange = (questionId, value, isCheckbox = false) => {
    if (isCheckbox) {
      // Handle checkbox answers (multiple selections allowed)
      setAnswers((prevAnswers) => {
        // Create a shallow copy of the previous answers array
        const updatedAnswers = [...prevAnswers];
        
        // Find the index of the answer for the specific question
        const answerIndex = updatedAnswers.findIndex(
          (answer) => answer.questionId === questionId
        );
        
        if (answerIndex > -1) {
          // If an answer already exists for this question
          const currentValue = updatedAnswers[answerIndex].value; // Get the current values (array)
  
          if (currentValue.includes(value)) {
            // If the selected value already exists, remove it from the array
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex], // Copy the existing answer object
              value: currentValue.filter((val) => val !== value), // Filter out the selected value
            };
          } else {
            // If the selected value does not exist, add it to the array
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex], // Copy the existing answer object
              value: [...currentValue, value], // Append the new value
            };
          }
        } else {
          // If no answer exists for this question, create a new one with the selected value
          updatedAnswers.push({ questionId, value: [value] });
        }
  
        return updatedAnswers; // Return the updated answers array
      });
    } else {
      // Handle other input types (single selection or text input)
      setAnswers((prevAnswers) => {
        // Create a shallow copy of the previous answers array
        const updatedAnswers = [...prevAnswers];
        
        // Find the index of the answer for the specific question
        const answerIndex = updatedAnswers.findIndex(
          (answer) => answer.questionId === questionId
        );
  
        if (answerIndex > -1) {
          // If an answer already exists for this question, update its value
          updatedAnswers[answerIndex].value = value;
        } else {
          // If no answer exists for this question, create a new one
          updatedAnswers.push({ questionId, value });
        }
  
        return updatedAnswers; // Return the updated answers array
      });
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = form?.formFields
      .filter((q) => q.required && !answers.find((a) => a.questionId === q.id))
      .map((q) => q.id);

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setSubmitted(true);
    console.log("Form submitted:", answers);
  };

  // Paginate questions
  const paginateQuestions = (questions, currentPage, questionsPerPage) => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return questions.slice(startIndex, startIndex + questionsPerPage);
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(form?.formFields.length / questionsPerPage)) {
      setCurrentPage((prevPage) => {
        const newPage = prevPage + 1;
        window.scrollTo(0, 20000); // Scroll to the top
        return newPage;
      });
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => {
        const newPage = prevPage - 1;
        window.scrollTo(0, 0); // Scroll to the top
        return newPage;
      });
    }
  };

  const displayedQuestions = form?.formFields
    ? paginateQuestions(form.formFields, currentPage, questionsPerPage)
    : [];
  const calculateQuestionNumber = (index) =>
    (currentPage - 1) * questionsPerPage + index + 1;

  // Add logic to check if userResponse exists, then render the answers
  const renderUserAnswers = (field) => {
    const userAnswers = userResponse?.fieldResponses?.filter(
      (response) => response.fieldId === field.id
    );

    if (field.fieldType === "checkbox") {
      return userAnswers ? userAnswers.map((response) => response.value) : [];
    }

    return userAnswers?.length > 0 ? userAnswers[0].value || "" : "";
  };

  const renderCorrectAnswer = (field) => {
    if (field.options && field.options.length > 0) {
      // Filter options where isCorrect is true
      const correctOptions = field.options.filter((option) => option.isCorrect);

      // Return their optionValue joined as a string
      return correctOptions.map((option) => option.optionValue).join(", ");
    }

    return null; // Return null if no options or none are correct
  };

  const calculateUserScore = () => {
    let score = 0;

    if (!form || !userResponse) return score;

    for (const field of form.formFields) {
      const userAnswer = renderUserAnswers(field); // Get the user's answer for the current field

      if (field.fieldType === "textbox" || field.fieldType === "radiobox") {
        // Textbox or radiobox: 1 point for correct answer
        const correctOption = field.options?.find((option) => option.isCorrect);
        if (
          correctOption &&
          userAnswer?.trim().toLowerCase() ===
          correctOption.optionValue.trim().toLowerCase()
        ) {
          score += 1;
        }
      } else if (field.fieldType === "checkbox") {
        // Checkbox: (1 / number of correct options) for each correct selection
        const correctOptions =
          field.options?.filter((option) => option.isCorrect) || [];
        const userSelectedCorrectOptions = correctOptions.filter((option) =>
          userAnswer.includes(option.optionValue)
        );

        if (correctOptions.length > 0) {
          // Add score for correct selections
          score += userSelectedCorrectOptions.length / correctOptions.length;
        }

        // Handle incorrect selections
        const incorrectOptions =
          field.options?.filter((option) => !option.isCorrect) || [];
        const userSelectedIncorrectOptions = incorrectOptions.filter((option) =>
          userAnswer.includes(option.optionValue)
        );

        if (incorrectOptions.length > 0) {
          // The penalty is based on the total number of choices (including both correct and incorrect options)
          const totalChoices = field.options.length;

          // Reduce score for incorrect selections
          const penalty = -userSelectedIncorrectOptions.length / totalChoices;
          score += penalty;
        }
      }
    }

    // Ensure score doesn't go below 0
    return Math.max(score, 0);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error2-container">
        <h2>Page is not available</h2>
      </div>
    );
  }


  return (
    <div>
      <div className="title-desc-container">
        <h1>{form?.title || "Form Title"}</h1>
        <h2>{form?.description || "Form Description"}</h2>
      </div>
      {userResponse && form.type === "Quiz" && (
        <div className="score-container">
          <h3>
            Your Score: {calculateUserScore()} out of{" "}
            {form?.formFields?.length || 0}
          </h3>
        </div>
      )}

      <div className="render-form">
        <form onSubmit={handleSubmit}>
          <div className="content-wrapper">
            {displayedQuestions.map((field, index) => (
              <div key={field.id} className="question-container">
                <div className="upload-container">
                  {field.imageUrl && (
                    <div className="image-preview">
                      <img
                        src={field.imageUrl}
                        alt=""
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          marginTop: "20px",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="question-title-wrapper">
                  <div className="question-title">
                    <span className="question-number">
                      {calculateQuestionNumber(index)}.
                    </span>
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
                          : answers.find((a) => a.questionId === field.id)
                            ?.value || ""
                      }
                      onChange={(e) =>
                        handleAnswerChange(field.id, e.target.value)
                      }
                      required={field.required}
                      className="input-field"
                      disabled={userResponse} // Disable if userResponse exists
                    />
                  </div>
                )}
                {/* Checkbox */}
                {field.fieldType === "checkbox" && (
                  <div className="checkbox-wrapper">
                    {field.options.map((option) => {
                      const isChecked = renderUserAnswers(field).includes(
                        option.optionValue
                      );
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
                                ? renderUserAnswers(field).includes(
                                  option.optionValue
                                )
                                : answers
                                  .find((a) => a.questionId === field.id)
                                  ?.value.includes(option.optionValue)
                            }
                            onChange={() =>
                              handleAnswerChange(
                                field.id,
                                option.optionValue,
                                true
                              )
                            }
                            required={field.required}
                            className="checkbox-input"
                            disabled={userResponse} // Disable if userResponse exists
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
                      const isSelected =
                        renderUserAnswers(field) === option.optionValue;
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
                            onChange={() =>
                              handleAnswerChange(field.id, option.optionValue)
                            }
                            required={field.required}
                            className="radio-input"
                            disabled={userResponse} // Disable if userResponse exists
                          />
                          {option.optionValue}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Render Correct Answer */}
                <div className="correct-answer-container">
                  {form.type === "Quiz" && userResponse != null && (
                    <span>Correct answer: {renderCorrectAnswer(field)}</span>
                  )}
                </div>

                {field.required && (
                  <div className="parent-required-text ">
                    <p className="required-text">
                      This question is required to answer.
                    </p>
                  </div>
                )}

                {/* Validation error */}
                {formErrors.includes(field.id) && (
                  <p className="error-text">This field is required.</p>
                )}
              </div>
            ))}
          </div>
        </form>
      </div>

      <div className="pagination-buttons">
        <button type="button" onClick={handleBack} disabled={currentPage === 1}>
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={
            currentPage ===
            Math.ceil(form?.formFields.length / questionsPerPage)
          }
        >
          Next
        </button>
      </div>

      {!userResponse && (
        <div className="submit-button-container">
          <button
            className="submit-button"
            onClick={handleSaveResponse}
            disabled={disableSave}
          >
            Submit
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};
