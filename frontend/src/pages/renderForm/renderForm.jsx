import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { getFormByUrl } from "../../services/api/formApi";
import { getFormResponseByFormId } from "../../services/api/formResponseApi";
import { createFormResponse } from "../../services/api/formResponseApi";
import { createFieldResponse } from "../../services/api/fieldResponseApi";
import { createFormFieldOptionByUserAnswer } from "../../services/api/formFieldOptionApi";
import { FormContext } from "../../context/form-context";
import { Question } from "../../components/pages/renderForm/question/question";
import { ScoreDisplay } from "../../components/pages/renderForm/scoreDisplay/scoreDisplay";
import { PageNotAvailable } from "../pageNotAvailable/pageNotAvailable";
import Pagination from "../../components/pagination/pagination";
import "./renderForm.css";

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  
  useEffect(() => {
    getForm();
  }, [editPath]);

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

  const paginateQuestions = (questions, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    return questions.slice(startIndex, startIndex + perPage);
  };

  const displayedQuestions = form?.formFields
    ? paginateQuestions(form.formFields, currentPage, questionsPerPage)
    : [];

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
      console.log("form id form responses:", form.id);
      const formResponse = await createFormResponse(token, form.id);
      console.log("Form response created:", formResponse);
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
  
  if (loading) return <div>Loading...</div>;

  return (
    hasUserResponse === false ?
    (
      <div>
        <PageNotAvailable />
      </div>
    ) : (
      <div className="full-form-render-container">
        <div className="title-desc-container">
          <h1>{form?.title || "Form Title"}</h1>
          <h2>{form?.description || "Form Description"}</h2>
        </div>

        {userResponse && form.type === "Quiz" && (
          <ScoreDisplay score={calculateUserScore()} maxScore={form?.formFields.length || 0} />
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
            pageCount={Math.ceil(form?.formFields.length / questionsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected + 1)}
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

        <div className="bottom-container">  </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

      </div>
    )
  );
};

