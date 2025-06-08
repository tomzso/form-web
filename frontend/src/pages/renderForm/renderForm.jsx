import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { getFormByUrl } from "../../api/formApi";
import { getFormResponseByFormId } from "../../api/formResponseApi";
import { createFormResponse } from "../../api/formResponseApi";
import { createFieldResponse } from "../../api/fieldResponseApi";
import { createFormFieldOptionByUserAnswer } from "../../api/formFieldOptionApi";
import { FormContext } from "../../context/form-context";

import Question from "./question";
import Pagination from "./pagination";
import ScoreDisplay from "./scoreDisplay";
import {
  calculateUserScore,
} from "./answerRenderer";

import "./renderForm.css";

const questionsPerPage = 5;

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

  // Fetch form & user response
  const getForm = async () => {
    try {
      const response = await getFormByUrl(token, editPath);
      setForm(response.data);
      setHasForm(true);

      try {
        const formResponse = await getFormResponseByFormId(token, response.data.id);
        setUserResponse(formResponse.data);
        setHasUserResponse(true);
      } catch {
        setError(null);
        setHasUserResponse(false);
      }
    } catch (err) {
      setError(err.message || "Error fetching form");
      setHasUserResponse(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalViewport = document.querySelector("meta[name=viewport]");
    const originalContent = originalViewport?.getAttribute("content");

    originalViewport?.setAttribute("content", "width=device-width, initial-scale=0.5");

    return () => {
      // Reset to original on page unmount
      if (originalViewport && originalContent) {
        originalViewport.setAttribute("content", originalContent);
      } else {
        originalViewport?.setAttribute("content", "width=device-width, initial-scale=1");
      }
    };
  }, []);

  useEffect(() => {
    getForm();
  }, [editPath]);

  const paginateQuestions = (questions, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    return questions.slice(startIndex, startIndex + perPage);
  };

  const displayedQuestions = form?.formFields
    ? paginateQuestions(form.formFields, currentPage, questionsPerPage)
    : [];

  const calculateQuestionNumber = (index) => (currentPage - 1) * questionsPerPage + index + 1;

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

        return updatedAnswers; 
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

        return updatedAnswers; 
      });
    }
  };

  const handleSaveResponse = async () => {
    const errors = form?.formFields
      .filter((q) => q.required && !answers.find((a) => a.questionId === q.id)?.value?.length)
      .map((q) => q.id);

    if (errors.length > 0) {
      setFormErrors(errors);
      logError("Please fill out all required fields before submitting.", setErrorMessage);
      return;
    }

    try {
      const formResponse = await createFormResponse(token, form.id);
      const responseId = formResponse.data.id;

      for (const answer of answers) {
        const { questionId, value } = answer;
        const field = form.formFields.find((f) => f.id === questionId);

        if (field.fieldType === "textbox") {
          try {
            await createFormFieldOptionByUserAnswer(token, value.trim(), false, questionId);
          } catch (e) {
            console.error("Error saving field option:", e);
          }
          await createFieldResponse(token, responseId, questionId, value);
        } else if (field.fieldType === "radiobox") {
          await createFieldResponse(token, responseId, questionId, value);
        } else if (field.fieldType === "checkbox") {
          for (const val of value) {
            await createFieldResponse(token, responseId, questionId, val);
          }
        }
      }

      setDisableSave(true);
      logSuccess("Form responses saved successfully!", setSuccessMessage);
      getForm();
    } catch (err) {
      console.error(err);
      logError("Error saving responses!", setErrorMessage);
    }
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(form?.formFields.length / questionsPerPage)) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
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


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error2-container"><h2>Page is not available</h2></div>;

  return (
    <div>
      <div className="title-desc-container">
        <h1>{form?.title || "Form Title"}</h1>
        <h2>{form?.description || "Form Description"}</h2>
      </div>

      {userResponse && form.type === "Quiz" && (
        <ScoreDisplay score={calculateUserScore(form, userResponse)} maxScore={form?.formFields.length || 0} />
      )}

      {displayedQuestions.map((field, index) => (
        <div key={field.id} className="center-question">
          <Question
            field={field}
            index={index}
            currentPage={currentPage}
            questionsPerPage={questionsPerPage}
            answers={answers}
            form={form}
            userResponse={userResponse}
            formErrors={formErrors}
            handleAnswerChange={handleAnswerChange}
            renderUserAnswers={renderUserAnswers}
            renderCorrectAnswer={renderCorrectAnswer}
          />
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        maxPage={Math.ceil(form?.formFields.length / questionsPerPage)}
        onNext={handleNext}
        onBack={handleBack}
      />

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

      <div className="bottom-container">

      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

