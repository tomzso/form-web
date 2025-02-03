import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './renderForm.css';
import { getFormByUrl } from '../../api/formApi';
import { getFormResponseByFormId } from '../../api/formResponseApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormContext } from "../../context/form-context";
import {createFormResponse} from '../../api/formResponseApi';
import {createFieldResponse} from '../../api/fieldResponseApi';

export const RenderForm = () => {
  const {
    token,
    logError,
    logSuccess
  } = useContext(FormContext);

  const location = useLocation();
  const path = location.pathname.slice(1);

  const [form, setForm] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [hasUserResponse, setHasUserResponse] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  const [answers, setAnswers] = useState([]); // Store user answers
  const [formErrors, setFormErrors] = useState([]); // Track missing answers for validation
  const [submitted, setSubmitted] = useState(false); // Track submission state
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const questionsPerPage = 5; // Number of questions to display per page

  const getForm = async () => {
    try {
      const response = await getFormByUrl(token, path);
      setForm(response.data); // Save the fetched form data
  
      try {
        // Fetch form response and set hasResponse
        const formResponse = await getFormResponseByFormId(token, response.data.id);
        setUserResponse(formResponse.data);
      } catch (err) {
        console.error("Error fetching form response:", err);
        setError(err.message || "Error fetching form response");
        setHasUserResponse(false); // Assume no response if an error occurs
      }
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(err.message || "Error fetching form");
      setHasUserResponse(false); // Assume no response if an error occurs
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };
  

  useEffect(() => {
    console.log('Answers:', answers);
    console.log('HasResponse:', hasUserResponse);
    console.log('UserResponse:', userResponse);
  }, [answers,hasUserResponse, userResponse]);

  useEffect(() => {
    getForm();
  }, [path]);

  const handleSaveResponse = async () => {
    // Validate required questions before saving
    const errors = form?.formFields
      .filter(q => q.required && !answers.find(a => a.questionId === q.id))
      .map(q => q.id);
  
    if (errors.length > 0) {
      // Update form errors and alert the user
      setFormErrors(errors);
      logError("Please fill out all required fields before submitting.",setErrorMessage);

      return; // Exit the function early if validation fails
    }
  
    try {
      // Step 1: Save the overall form response
      const formResponse = await createFormResponse(token, form.id);
      const responseId = formResponse.data.id;
  
      // Step 2: Iterate over answers and save field responses
      for (const answer of answers) {
        const { questionId, value } = answer;
  
        // Check if the answer is for a checkbox question (array of values)
        if (Array.isArray(value)) {
          // Save each selected value for the checkbox
          for (const selectedValue of value) {
            await createFieldResponse(token, responseId, questionId, selectedValue);
          }
        } else {
          // Save single value answers (e.g., textbox, radio)
          await createFieldResponse(token, responseId, questionId, value);
        }
      }
  
      logSuccess("Form responses saved successfully!",setSuccessMessage);
      console.log("Form responses saved successfully!");
    } catch (error) {
      console.error("Error saving responses:", error);
   
      logError("Error saving responses!",setErrorMessage);
    }
  };
  
  


  const handleAnswerChange = (questionId, value, isCheckbox = false) => {
    if (isCheckbox) {
      setAnswers(prevAnswers => {
        const updatedAnswers = [...prevAnswers];
        const answerIndex = updatedAnswers.findIndex(answer => answer.questionId === questionId);
        if (answerIndex > -1) {
          const currentValue = updatedAnswers[answerIndex].value;
          if (currentValue.includes(value)) {
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex],
              value: currentValue.filter(val => val !== value)
            };
          } else {
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex],
              value: [...currentValue, value]
            };
          }
        } else {
          updatedAnswers.push({ questionId, value: [value] });
        }
        return updatedAnswers;
      });
    } else {
      setAnswers(prevAnswers => {
        const updatedAnswers = [...prevAnswers];
        const answerIndex = updatedAnswers.findIndex(answer => answer.questionId === questionId);
        if (answerIndex > -1) {
          updatedAnswers[answerIndex].value = value;
        } else {
          updatedAnswers.push({ questionId, value });
        }
        return updatedAnswers;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = form?.formFields
      .filter(q => q.required && !answers.find(a => a.questionId === q.id))
      .map(q => q.id);

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setSubmitted(true);
    console.log('Form submitted:', answers);
  };

  // Paginate questions
  const paginateQuestions = (questions, currentPage, questionsPerPage) => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return questions.slice(startIndex, startIndex + questionsPerPage);
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(form?.formFields.length / questionsPerPage)) {
      setCurrentPage(prevPage => {
        const newPage = prevPage + 1;
        window.scrollTo(0, 20000); // Scroll to the top
        return newPage;
      });
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => {
        const newPage = prevPage - 1;
        window.scrollTo(0, 0); // Scroll to the top
        return newPage;
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const displayedQuestions = form?.formFields ? paginateQuestions(form.formFields, currentPage, questionsPerPage) : [];
  const calculateQuestionNumber = (index) => (currentPage - 1) * questionsPerPage + index + 1;

  // Add logic to check if userResponse exists, then render the answers
  const renderUserAnswers = (field) => {
    // Find all responses for the current field
    const userAnswers = userResponse?.fieldResponses?.filter(
      (response) => response.fieldId === field.id
    );
  
    if (field.fieldType === "checkbox") {
      // Collect all selected values for the checkbox field
      return userAnswers ? userAnswers.map((response) => response.value) : [];
    }
  
    if (userAnswers?.length > 0) {
      // For other field types, return the first value
      return userAnswers[0].value || '';
    }
  
    return ''; // Default for no responses
  };
  
  
  
  
  const renderCorrectAnswer = (field) => {
    if (field.options && field.options.length > 0) {
      // Filter options where isCorrect is true
      const correctOptions = field.options.filter(option => option.isCorrect);
      
      // Return their optionValue joined as a string
      return correctOptions.map(option => option.optionValue).join(', ');
    }
    
    return null; // Return null if no options or none are correct
  };
  


return (
  <div>
    <div className='title-desc-container'>
      <h1>{form?.title || "Form Title"}</h1>
      <h2>{form?.description || "Form Description"}</h2>
    </div>

    <div className='render-form'>
      <form onSubmit={handleSubmit}>
        <div className="content-wrapper">
          {displayedQuestions.map((field, index) => (
            <div key={field.id} className="question-container">

            < div className="upload-container">
              {field.imageUrl  && (
                <div className="image-preview">
                  <img
                    src={field.imageUrl }
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
                  <span className="question-number">{calculateQuestionNumber(index)}.</span>
                  {field.label}
                  {field.required && <span className="required-star">*</span>}
                </div>
              </div>

              {/* Textbox */}
              {field.fieldType === "textbox" && (
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={userResponse ? renderUserAnswers(field) : answers.find(a => a.fieldId === field.id)?.value || ''}
                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                    required={field.required}
                    className="input-field"
                    disabled={userResponse} // Disable if userResponse exists
                  />
                </div>
              )}
            {/* Checkbox */}
            {field.fieldType === "checkbox" && (
            <div className="checkbox-wrapper">
              {field.options.map(option => {
                const isChecked = renderUserAnswers(field).includes(option.optionValue);
                const isCorrect = option.isCorrect;

                return (
                  <label
                    key={option.id}
                    className="checkbox-label"
                    style={{
                      color: isChecked && form.type ==="Quiz" ? (isCorrect ? 'blue' : 'red') : 'inherit',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={option.optionValue}
                      checked={renderUserAnswers(field).includes(option.optionValue)}
                      onChange={() => handleAnswerChange(field.id, option.optionValue, true)}
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
                {field.options.map(option => {
                  const isSelected = renderUserAnswers(field) === option.optionValue;
                  const isCorrect = option.isCorrect;

                  return (
                    <label
                      key={option.id}
                      className="radio-label"
                      style={{
                        color: isSelected && form.type ==="Quiz" ? (isCorrect ? 'blue' : 'red') : 'inherit',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${field.id}`}
                        value={option.optionValue}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(field.id, option.optionValue)}
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
                {form.type === "Form" && userResponse != null && <span>Answer: {renderCorrectAnswer(field)}</span>}
              </div>

              {field.required && (
                <div className="parent-required-text ">
                  <p className="required-text">This question is required to answer.</p>
                </div>
              )}

              {/* Validation error */}
              {formErrors.includes(field.id) && <p className="error-text">This field is required.</p>}
            </div>
          ))}
        </div>
      </form>
    </div>

    <div className="pagination-buttons">
      <button type="button" onClick={handleBack} disabled={currentPage === 1}>Back</button>
      <button type="button" onClick={handleNext} disabled={currentPage === Math.ceil(form?.formFields.length / questionsPerPage)}>Next</button>
    </div>

    {!userResponse && (
      <div className="submit-button-container">
        <button className="submit-button" onClick={handleSaveResponse}>Submit</button>
      </div>
    )}

    {successMessage && (
      <div className="success-message">{successMessage}</div>
    )}
    {errorMessage && <div className="error-message">{errorMessage}</div>}
  </div>
);


};
