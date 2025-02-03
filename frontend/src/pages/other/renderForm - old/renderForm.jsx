import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './renderForm.css';
import { getFormByUrl } from '../../api/formApi';

export const RenderForm = () => {
  const location = useLocation();
  const path = location.pathname.slice(1);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  const [answers, setAnswers] = useState([]); // Store user answers
  const [formErrors, setFormErrors] = useState([]); // Track missing answers for validation
  const [submitted, setSubmitted] = useState(false); // Track submission state

  const getForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getFormByUrl(token, path);
      setForm(response); // Save the fetched form data
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(err.message || "Error fetching form");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    getForm();
  }, [path]);

  const handleAnswerChange = (questionId, value, isCheckbox = false) => {
    console.log("Handling answer change:", questionId, value, isCheckbox);  // Add logging for debugging
    
    if (isCheckbox) {
      // Handle checkbox selection (multiple values allowed)
      setAnswers(prevAnswers => {
        const updatedAnswers = [...prevAnswers];  // Shallow copy of the previous answers
        console.log("updatedAnswers:", updatedAnswers);
      
        const answerIndex = updatedAnswers.findIndex(answer => answer.questionId === questionId);
      
        if (answerIndex > -1) {
          const currentValue = updatedAnswers[answerIndex].value;
          console.log("currentValue:", currentValue);
          console.log("value:", value);
          console.log("includes:", currentValue.includes(value));
      
          if (currentValue.includes(value)) {
            // If the value exists, remove it
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex],  // Copy the current answer object
              value: currentValue.filter(val => val !== value)  // Create a new array with the updated values
            };
          } else {
            // If the value doesn't exist, add it
            updatedAnswers[answerIndex] = {
              ...updatedAnswers[answerIndex],  // Copy the current answer object
              value: [...currentValue, value]  // Create a new array with the updated values
            };
          }
        } else {
          // If no existing answer for the question, add a new entry
          updatedAnswers.push({ questionId, value: [value] });
        }
      
        console.log("Updated answers before return", updatedAnswers);
        return updatedAnswers;
      });
      
    } else {
      // Handle single-value input (textbox, radio)
      setAnswers(prevAnswers => {
        const updatedAnswers = [...prevAnswers];
        const answerIndex = updatedAnswers.findIndex(answer => answer.questionId === questionId);
        if (answerIndex > -1) {
          updatedAnswers[answerIndex].value = value;
        } else {
          updatedAnswers.push({ questionId, value });
        }
        console.log("Updated answers for non-checkbox:", updatedAnswers);  // Log the updated answers
        return updatedAnswers;
      });
    }
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required answers
    const errors = form?.formFields
      .filter(q => q.required && !answers.find(a => a.questionId === q.id))
      .map(q => q.id);

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]); // Clear errors if valid
    setSubmitted(true);
    console.log('Form submitted:', answers); // Process the answers (e.g., send to API)
    // Optionally, reset form or redirect user after submission
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Show an error message
  }

  return (
    <div className='render-form'>
      <h1>{form?.title || "Form Title"}</h1>
      <p>{form?.description || "Form Description"}</p>
      <form onSubmit={handleSubmit}>
        {form?.formFields?.map((field) => (
          <div key={field.id} className="question">
            <label>{field.label}{field.required && "*"}</label>

            {/* Textbox */}
            {field.fieldType === "textbox" && (
              <input
                type="text"
                value={answers.find(a => a.questionId === field.id)?.value || ''}
                onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                required={field.required}
              />
            )}

            {/* Checkbox */}
            {field.fieldType === "checkbox" && (
            <div>
                {field.options.map(option => (
                <label key={option.id}>
                    <input
                    type="checkbox"
                    value={option.optionValue}
                    checked={answers.find(a => a.questionId === field.id)?.value.includes(option.optionValue)}
                    onChange={() => handleAnswerChange(field.id, option.optionValue, true)}
                    required={field.required}
                    />
                    {option.optionValue}
                </label>
                ))}
            </div>
            )}

            {/* Radio */}
            {field.fieldType === "radiobox" && (
              <div>
                {field.options.map(option => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name={`question-${field.id}`}
                      value={option.optionValue}
                      checked={answers.find(a => a.questionId === field.id)?.value === option.optionValue}
                      onChange={() => handleAnswerChange(field.id, option.optionValue)}
                      required={field.required}
                    />
                    {option.optionValue}
                  </label>
                ))}
              </div>
            )}

            {/* Validation error */}
            {formErrors.includes(field.id) && <p className="error-text">This field is required.</p>}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>

      {/* Show success message after submission */}
      {submitted && <div className="success-message">Form submitted successfully!</div>}
    </div>
  );
};
