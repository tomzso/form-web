import React, { useState, useContext, useRef, useEffect } from "react";
import {  useParams  } from 'react-router-dom';
import { createForm, getFormByUrl } from "../../api/formApi";
import { createFormField } from "../../api/formFieldApi";
import { createFormFieldOption } from "../../api/formFieldOptionApi";
import "./formBuilder.css";
import { FormContext } from "../../context/form-context";

import { FontAwesomeIcon,  } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faCheck,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

export const FormBuilder = () => {
  const { token, logError, logSuccess } = useContext(FormContext);

  const formType = ["Form", "Quiz"];
  const { '*': editPath } = useParams();
  const [questionImages, setQuestionImages] = useState([]);
  const [textboxes, setTextboxes] = useState([""]);
  const [radioboxes, setRadioboxes] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [radioLabels, setRadioLabels] = useState([]);
  const [checkboxLabels, setCheckboxLabels] = useState([]);
  const [activeInputType, setActiveInputType] = useState(null);
  const [question, setQuestion] = useState("");
  const [textboxInput, setTextboxInput] = useState("");
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [formTitle, setFormTitle] = useState("My title");
  const [formDescription, setFormDescription] = useState("My description");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [required, setRequired] = useState(false); // New state for the required checkbox
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const [selectedType, setSelectedType] = useState(formType[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedForm, setSavedForm] = useState(null); // State to store the fetched form data

  const [imageUrl, setImageUrl] = useState(null); // State to store the image URL
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "duhzdcpmt",
        uploadPreset: "vrl3wgym",
        multiple: false, // Disable the "Upload More" button
        mime_types: [
          { extensions: ["jpg", "jpeg", "png", "gif", "webp"] }, // Only image file types
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Upload Widget Error:", error); // Log any errors
        }
        if (result.event === "success") {
          // If the upload is successful, update the image URL in state
          const uploadedImageUrl = result.info.secure_url;
          console.log("Uploaded Image Data:", result.info); // Log the result
          setImageUrl(uploadedImageUrl); // Set the image URL in state
        }
      }
    );
  }, []);

  useEffect(() => {
    getForm();
  }, [editPath])



  function mapApiToForm(apiObject) {
    return apiObject.formFields.map((field) => {
      // Find the index of the option with isCorrect true for radiobox
      const selectedRadioIndex = 
        field.fieldType === "radiobox" 
          ? field.options?.findIndex(option => option.isCorrect) 
          : null;
  
      const mappedField = {
        question: field.label || "Untitled Question",
        type: field.fieldType || "textbox", // Default to textbox if type is missing
        options: field.fieldType === "textbox" 
          ? (field.options?.[0]?.optionValue || "")
          : (field.options?.map(option => option.optionValue) || []), // Map options or provide default
        selectedRadio: selectedRadioIndex, // Use the computed index
        selectedCheckboxes: field.fieldType === "checkbox" 
          ? Array(field.options?.length)
              .fill(false)
              .map((_, index) => field.options[index]?.isCorrect || false)
          : [],
        required: field.required || false, // Default to false if not provided
        imageUrl: field.imageUrl || "", // Provide empty string if image URL is not available
      };
  
      return mappedField;
    });
  }
  
  const getForm = async () => {
    try {
      const response = await getFormByUrl(token, editPath);
      setSavedQuestions(mapApiToForm(response.data)); // Save the fetched form data
  
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(err.message || "Error fetching form");
      setHasUserResponse(false); // Assume no response if an error occurs
    } 
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type); // Update the selected type
    setIsDropdownOpen(false); // Close the dropdown
  };

  const handleAddTextbox = () => {
    setTextboxes([""]);
    setRadioboxes([]);
    setCheckboxes([]);
    setRadioLabels([]);
    setCheckboxLabels([]);
    setActiveInputType("textbox");
  };

  const handleAddInput = (type, isFromButton = false) => {
    if (type === "radiobox") {
      setActiveInputType("radiobox");
      setTextboxes([]);
      setCheckboxes([]);
      setCheckboxLabels([]);
      if (
        radioboxes.length < 4 &&
        radioboxes.length > 0 &&
        (!isFromButton || radioboxes.length === 0)
      ) {
        setRadioboxes([...radioboxes, ""]);
        setRadioLabels([...radioLabels, `Option ${radioboxes.length + 1}`]);
      }
      if (radioboxes.length === 0) initRadioOptions();
    } else if (type === "checkbox") {
      setActiveInputType("checkbox");
      setTextboxes([]);
      setRadioboxes([]);
      setRadioLabels([]);
      if (
        checkboxes.length < 4 &&
        checkboxes.length > 0 &&
        (!isFromButton || checkboxes.length === 0)
      ) {
        setCheckboxes([...checkboxes, false]);
        setCheckboxLabels([
          ...checkboxLabels,
          `Option ${checkboxes.length + 1}`,
        ]);
      }
      if (checkboxes.length === 0) initCheckboxOptions();
    }
  };

  const handleRemoveInput = (type) => {
    if (type === "radiobox" && radioboxes.length > 1) {
      setRadioboxes(radioboxes.slice(0, -1));
      setRadioLabels(radioLabels.slice(0, -1));
    }
    if (type === "checkbox" && checkboxes.length > 1) {
      setCheckboxes(checkboxes.slice(0, -1));
      setCheckboxLabels(checkboxLabels.slice(0, -1));
    }
  };

  const handleCheckboxChange = (index) => {
    const updatedCheckboxes = [...checkboxes];
    updatedCheckboxes[index] = !updatedCheckboxes[index];
    setCheckboxes(updatedCheckboxes);
  };

  const handleRadioChange = (index) => {
    setSelectedRadio(index);
  };

  const handleLabelChange = (type, index, value) => {
    if (type === "radiobox") {
      const updatedRadioLabels = [...radioLabels];
      updatedRadioLabels[index] = value;
      setRadioLabels(updatedRadioLabels);
    } else if (type === "checkbox") {
      const updatedCheckboxLabels = [...checkboxLabels];
      updatedCheckboxLabels[index] = value;
      setCheckboxLabels(updatedCheckboxLabels);
    }
  };

  const handleTextboxInputChange = (event) => {
    setTextboxInput(event.target.value);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  useEffect(() => {
    console.log(savedQuestions);
  }, [savedQuestions]);

  const handleSaveQuestion = () => {
    const isInputFilled = () => {
      if (activeInputType === "textbox") {
        return question && (textboxInput || selectedType == "Form");
      }

      if (activeInputType === "radiobox") {
        if (selectedRadio === null && selectedType == "Quiz") {
          logError(
            "Please select an option for the radio buttons.",
            setErrorMessage
          );
          return false;
        }
        return radioLabels.every((label) => label) && question;
      }
      if (activeInputType === "checkbox") {
        if (
          !checkboxes.some((checkbox) => checkbox) &&
          selectedType == "Quiz"
        ) {
          logError(
            "Please select at least one checkbox option.",
            setErrorMessage
          );
          return false;
        }
        return checkboxLabels.every((label) => label) && question;
      }
      return false;
    };

    if (!isInputFilled()) {
      logError("Please fill in the question and the chosen answer options.", setErrorMessage);
      return;
    }



    const localImageUrl = imageUrl;
    setSavedQuestions([
      ...savedQuestions,
      {
        question,
        type: activeInputType,
        options:
          activeInputType === "textbox"
            ? textboxInput
            : activeInputType === "radiobox"
            ? radioLabels
            : checkboxLabels,
        selectedRadio: selectedRadio,
        selectedCheckboxes: checkboxes,
        required, // Add required status to saved question
        imageUrl: localImageUrl === null ? "" : imageUrl, 
      },
    ]);

    setQuestion("");
    setTextboxes([""]);
    setTextboxInput("");
    setRadioboxes([]);
    setCheckboxes([]);
    setRadioLabels([]);
    setCheckboxLabels([]);
    setSelectedRadio(null);
    setActiveInputType(null);
    setRequired(false); // Reset the required checkbox
    setImageUrl(null);
  };

  const handleSaveForm = async () => {

    // Ensure token exists
    if (!token) {
      logError("Please log in to save the form.", setErrorMessage);
      return;
    }

    // Check if form title is empty
    if (!formTitle.trim()) {
      logError("Form title cannot be empty", setErrorMessage);
      return;
    }

    // Call the createForm function to save the form with the title and description
    const response = await createForm(
      token,
      formTitle,
      formDescription,
      selectedType
    );

    // Extract the form ID from the response
    const formId = response.data.id;
   

    // Prepare the questions to be saved
    const questionsToSave = savedQuestions.map((savedQuestion) => {
      return createFormField(
        token,
        savedQuestion.question,
        savedQuestion.type,
        savedQuestion.required,
        formId,
        savedQuestion.imageUrl,
      );
    });

    // Wait for all form fields to be created
    const formFieldResponses = await Promise.all(questionsToSave);

    // Iterate over form field responses and save options/answers
    for (let i = formFieldResponses.length - 1; i >= 0; i--) {
      const formFieldResponse = formFieldResponses[i];
      if (
        formFieldResponse.success &&
        formFieldResponse.data &&
        formFieldResponse.data.id
      ) {
        const formFieldId = formFieldResponse.data.id;
        const savedQuestion = savedQuestions[i];

        // Post options/answers for the question
        const optionsToSave = [];
        if (
          savedQuestion.type === "radiobox" ||
          savedQuestion.type === "checkbox"
        ) {
          savedQuestion.options.forEach((option, index) => {
            const isCorrect =
              savedQuestion.type === "radiobox"
                ? index === savedQuestion.selectedRadio
                : savedQuestion.selectedCheckboxes[index];
            optionsToSave.push(
              createFormFieldOption(token, option, isCorrect, formFieldId)
            );
          });
        } else if (savedQuestion.type === "textbox") {
          // For textboxes, save the single input as an "option" for consistency
          optionsToSave.push(
            createFormFieldOption(
              token,
              savedQuestion.options,
              true,
              formFieldId
            )
          );
        }

        // Wait for all options to be saved
        const optionResponses = await Promise.all(optionsToSave);

        // Log results of saving options
        optionResponses.forEach((optionResponse, index) => {
          if (optionResponse.success) {
            console.log(`Option saved:`, savedQuestion.options[index]);
          } else {
            console.error(
              `Failed to save option at index ${index}. Response:`,
              optionResponse
            );
          }
        });
      } else {
        console.error(
          `Failed to save question at index ${i}. Response:`,
          formFieldResponse
        );
      }
    }

    // Filter successful question responses
    const successResponses = formFieldResponses.filter(
      (response) => response.success
    );

    if (successResponses.length === formFieldResponses.length) {
      logSuccess("Form saved successfully!", setSuccessMessage);
    } else {
      logError("Error saving form, please try again.", setErrorMessage);
    }
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = savedQuestions.filter((_, i) => i !== index);
    setSavedQuestions(updatedQuestions);
  };

  const handleFormTitleChange = (event) => {
    setFormTitle(event.target.value);
  };

  const handleFormDescriptionChange = (event) => {
    setFormDescription(event.target.value);
  };

  const toggleEditTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const toggleEditDescription = () => {
    setIsEditingDescription(!isEditingDescription);
  };

  const handleAddRadioOption = () => {
    if (radioboxes.length < 4) {
      setRadioboxes([...radioboxes, ""]);
      setRadioLabels([...radioLabels, `Option ${radioboxes.length + 1}`]);
    } else {
      logError("Maximum 4 radio options allowed.", setErrorMessage); // Clear error message if success
    }
  };

  const initRadioOptions = () => {
    setRadioboxes(["", "", "", ""]);
    setRadioLabels(["Option 1", "Option 2", "Option 3", "Option 4"]);
    //setSelectedRadio(0); // Select the first radio option
  };

  const handleAddCheckboxOption = () => {
    if (checkboxes.length < 4) {
      setCheckboxes([...checkboxes, false]);
      setCheckboxLabels([...checkboxLabels, `Option ${checkboxes.length + 1}`]);
    } else {
      logError("Maximum 4 checkbox options allowed.", setErrorMessage); // Clear error message if success
    }
  };

  const initCheckboxOptions = () => {
    setCheckboxLabels(["Option 1", "Option 2", "Option 3", "Option 4"]);
    setCheckboxes([false, false, false, false]); // Select the first checkbox option
  };

  return (
    <div>
      {/* Container for centering content */}
      <div className="dropdown-button-container">
        {/* Dropdown Component */}
        <div className="dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="dropdown-button"
          >
            {selectedType}
          </button>

          {isDropdownOpen && (
            <ul className="dropdown-list">
              {formType.map((type, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleTypeSelect(type)}
                >
                  {type}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="form-builder-container">
        <div
          style={{
            marginBottom: "1rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {isEditingTitle ? (
            <div className="form-title-container">
              <input
                type="text"
                value={formTitle}
                onChange={handleFormTitleChange}
                placeholder="Enter form title"
                className="form-title-input"
                style={{ marginRight: "0.5rem", width: "60%" }}
              />

              <button className="edit-icon-button" onClick={toggleEditTitle}>
                <FontAwesomeIcon icon={faCheck} className="edit" />
              </button>
            </div>
          ) : (
            <div className="form-title-container">
              <div className="form-title">{formTitle}</div>
              <button className="edit-icon-button" onClick={toggleEditTitle}>
                <FontAwesomeIcon icon={faPenToSquare} className="edit" />
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: "1rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {isEditingDescription ? (
            <div className="form-title-container">
              <input
                type="text"
                value={formDescription}
                onChange={handleFormDescriptionChange}
                placeholder="Enter form title"
                className="form-title-input"
                style={{ marginRight: "0.5rem", width: "60%" }}
              />
              <button
                className="edit-icon-button"
                onClick={toggleEditDescription}
              >
                <FontAwesomeIcon icon={faCheck} className="edit" />
              </button>
            </div>
          ) : (
            <div className="form-title-container">
              <div className="form-desc">{formDescription}</div>
              <button
                className="edit-icon-button"
                onClick={toggleEditDescription}
              >
                <FontAwesomeIcon icon={faPenToSquare} className="edit" />
              </button>
            </div>
          )}
        </div>

        {/* Render saved questions */}
        <div className="content-wrapper">
          {savedQuestions.map((saved, index) => (
            <div key={index} className="question-container">
            
            <div className="upload-container">
              {saved.imageUrl  && (
                <div className="image-preview">
                  <img
                    src={saved.imageUrl }
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
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <div className="question-title">{saved.question}</div>
                <button
                  className="delete-icon-button"
                  onClick={() => handleDeleteQuestion(index)}
                >
                  <FontAwesomeIcon icon={faTrash} className="edit" />
                </button>
              </div>
              {saved.type === "textbox" && (
                <p className="question-answer-text"> Answer: {saved.options}</p>
              )}
              {saved.type === "radiobox" && (
                <div>
                  {saved.options.map((option, idx) => (
                    <div key={idx}>
                      <input
                        type="radio"
                        disabled
                        checked={
                          saved.selectedRadio === idx && selectedType === "Quiz"
                        }
                        style={{ marginLeft: "90px" }}
                      />
                      <span className="question-answer-radio">{option}</span>
                    </div>
                  ))}
                </div>
              )}
              {saved.type === "checkbox" && (
                <div>
                  {saved.options.map((option, idx) => (
                    <div key={idx}>
                      <input
                        type="checkbox"
                        disabled
                        checked={
                          saved.selectedCheckboxes[idx] &&
                          selectedType === "Quiz"
                        }
                        style={{ marginLeft: "90px" }}
                      />
                      <span className="question-answer">{option}</span>
                    </div>
                  ))}
                </div>
              )}
              {saved.required && (
                <div className="parent-required-text ">
                  <p className="required-text">
                    This question is required to answer.
                  </p>
                </div>
              )}
            </div>
          ))}

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
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      marginTop: "20px",
                    }}
                  />
                </div>
              )}
              <button className="upload-icon-button" onClick={() => widgetRef.current.open()}>
                <FontAwesomeIcon icon={faImage} className="upload" />
              </button>

            </div>
            <input
              type="text"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Type your next question..."
            />
            {question && <p>Your question: "{question}"</p>}
          </div>

          {/* Required checkbox for the question */}
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
            {/* Input type buttons */}
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

            {/* Render inputs based on type */}
            {activeInputType === "textbox" && (
              <div>
                <input
                  type="text"
                  value={textboxInput}
                  onChange={handleTextboxInputChange}
                  placeholder="Enter textbox answer"
                />
              </div>
            )}
            {activeInputType === "radiobox" && (
              <div>
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
                  <button
                    className="green-button"
                    onClick={() => handleAddRadioOption()}
                  >
                    +
                  </button>
                  <button
                    className="red-button"
                    onClick={() => handleRemoveInput("radiobox")}
                  >
                    -
                  </button>
                </div>
              </div>
            )}

            {activeInputType === "checkbox" && (
              <div>
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
                  <button
                    className="green-button"
                    onClick={() => handleAddCheckboxOption()}
                  >
                    +
                  </button>
                  <button
                    className="red-button"
                    onClick={() => handleRemoveInput("checkbox")}
                  >
                    -
                  </button>
                </div>
              </div>
            )}
            <div className="save-buttons-question">
              <button onClick={handleSaveQuestion}>Save Question</button>
            </div>
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      </div>

      <div className="save-buttons-form-container">
        <div className="save-buttons-form">
          <button onClick={handleSaveForm} className="save-buttons-form-button">
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
};
