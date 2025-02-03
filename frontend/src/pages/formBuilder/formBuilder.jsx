import React, { useState, useContext, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createForm, getFormByUrl, updateForm } from "../../api/formApi";
import { createFormField, deleteFormField } from "../../api/formFieldApi";
import { createFormFieldOption } from "../../api/formFieldOptionApi";
import "./formBuilder.css";
import { FormContext } from "../../context/form-context";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faCheck,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { set } from "@cloudinary/url-gen/actions/variable";

export const FormBuilder = () => {
  const { token, logError, logSuccess, userId } = useContext(FormContext);

  const formType = ["Form", "Quiz"];
  const { "*": editPath } = useParams();

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
  const [successMessage, setSuccessMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [selectedType, setSelectedType] = useState(formType[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [existingQuestionIds, setExistingQuestionIds] = useState([]); // State to store existing question IDs
  const [savedNewQuestions, setSavedNewQuestions] = useState([]); // State to store new questions
  const [loading, setLoading] = useState(true);
  const [pageAvailable, setPageAvailable] = useState(true);
  const [isEditPage, setIsEditPage] = useState(false);
  const [formId, setFormId] = useState(null); // State to store the form ID
  const [removableQuestionList, setRemovableQuestionList] = useState([]); // State to store the deleted question IDs
  const [disableSaveButton, setDisableSaveButton] = useState(false); // State to disable the save button
  const [imageUrl, setImageUrl] = useState(null); // State to store the image URL
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

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
  }, [editPath]);

  function mapApiToFormField(apiObject) {
    const questionIds = []; // Array to store question IDs

    const mappedForm = apiObject.formFields.map((field) => {
      // Push the field ID into the questionIds array
      questionIds.push(field.id);

      // Find the index of the option with isCorrect true for radiobox
      const selectedRadioIndex =
        field.fieldType === "radiobox"
          ? field.options?.findIndex((option) => option.isCorrect)
          : null;

      const mappedField = {
        question: field.label || "Untitled Question",
        type: field.fieldType || "textbox", 
        options:
          field.fieldType === "textbox"
            ? field.options?.[0]?.optionValue || ""
            : field.options?.map((option) => option.optionValue) || [], 
        selectedRadio: selectedRadioIndex, 
        selectedCheckboxes:
          field.fieldType === "checkbox"
            ? Array(field.options?.length)
                .fill(false)
                .map((_, index) => field.options[index]?.isCorrect || false)
            : [],
        required: field.required || false, 
        imageUrl: field.imageUrl || "", 
      };

      setExistingQuestionIds(questionIds); 
      return mappedField;
    });
    return mappedForm;
  }

  const getForm = async () => {
    console.log("editPath:", editPath);
    console.log("location.pathname:", location.pathname);
    if (editPath === undefined && location.pathname !== `${import.meta.env.VITE_API_BASE_URL}/formBuilder`) {
      return;
    }
    console.log("Fetching form data...");
    setIsEditPage(false); // Reset the edit page flag
    setFormId(null); // Reset the form ID
    if(location.pathname === `${import.meta.env.VITE_API_BASE_URL}/formBuilder`) {
      setSelectedType("Form"); // Set the form type
      setFormDescription("My description"); // Set the form description
      setFormTitle("My title"); // Set the form title
      setFormId(null); // Set the form ID
      setSavedQuestions([]); // Reset the saved questions
      
      setPageAvailable(true);
      setLoading(false);
      return;
    }
    try {
      const response = await getFormByUrl(token, editPath);

      console.log("userId:", userId);
      console.log("response.data.userId:", response.data.userId);
      if (userId !== response.data.userId) setPageAvailable(false);
      setSelectedType(response.data.type); // Set the form type
      setFormDescription(response.data.description); // Set the form description
      setFormTitle(response.data.title); // Set the form title
      setFormId(response.data.id); // Set the form ID
      setSavedQuestions(mapApiToFormField(response.data)); // Save the fetched form data
      setRemovableQuestionList([]); // Reset the removable question list

      setIsEditPage(true); // Set the edit page flag
      setPageAvailable(true);
    } catch (err) {
      console.error("Error fetching form!!!:", err);
      setPageAvailable(false);
    }
    setLoading(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type); // Update the selected type
    setIsDropdownOpen(false); // Close the dropdown
    console.log("Selected Type:", type);
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
        setRadioLabels([...radioLabels, ""]);
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
          "",
        ]);
      }
      if (checkboxes.length === 0) initCheckboxOptions();
    }
  };

  const handleRemoveInput = (type) => {
    if (type === "radiobox" && radioboxes.length > 1) {
      const newRadioboxes = radioboxes.slice(0, -1);
      const newRadioLabels = radioLabels.slice(0, -1);
  
      // If the selectedRadio corresponds to the deleted option, set it to null
      if (selectedRadio >= newRadioboxes.length) {
        setSelectedRadio(null);
      }
  
      setRadioboxes(newRadioboxes);
      setRadioLabels(newRadioLabels);
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
      logError(
        "Please fill in the question and the chosen answer options.",
        setErrorMessage
      );
      return;
    }

    const localImageUrl = imageUrl;

    if (isEditPage) {
      setSavedNewQuestions([
        ...savedNewQuestions,
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
          required,
          imageUrl: localImageUrl === null ? "" : imageUrl,
        },
      ]);
    }

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
    inputRef.current.focus();
  };


  const handleDeleteQuestion = async (index) => {
    // Get the ID of the question to be deleted from the existing question IDs array
    const deletedQuestion = existingQuestionIds[index];
    
    // Calculate the index for the new question list (adjusted for the offset created by the length of existing questions)
    const deleteNewQuestionIndex = index - existingQuestionIds.length;
    
    // Create a new list of saved questions excluding the question at the specified index
    const updatedQuestions = savedQuestions.filter((_, i) => i !== index);
  
    // Create a new list of existing question IDs excluding the deleted question's ID
    const updatedExistingQuestionIds = existingQuestionIds.filter((_, i) => i !== index);
    
    // Create a new list of saved new questions, excluding the question at the adjusted index
    const updatedSavedNewQuestions = savedNewQuestions.filter((_, i) => i !== deleteNewQuestionIndex);

    // If the deleted question ID is defined, proceed with database deletion
    if (deletedQuestion !== undefined) {      
      // Add the deleted question ID to the removable question list
      setRemovableQuestionList([...removableQuestionList, deletedQuestion]);
    }
  
    // Update the state with the modified lists
    setExistingQuestionIds(updatedExistingQuestionIds);
    setSavedNewQuestions(updatedSavedNewQuestions);
    setSavedQuestions(updatedQuestions);
  };
  
  const handleSaveForm = async () => {
    setDisableSaveButton(true);
    setTimeout(() => setDisableSaveButton(false), 3000);
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

    removableQuestionList.forEach(async (questionId) => {
      console.log("Deleting question with ID:", questionId);
      await deleteFormField(token, questionId);
    });

    // Call the createForm function to save the form with the title and description
    const response =
      formId === null
        ? await createForm(token, formTitle, formDescription, selectedType)
        : await updateForm(
            token,
            formId,
            formTitle,
            formDescription,
            selectedType
          );

    const savedData = isEditPage ? savedNewQuestions : savedQuestions;

    // Extract the form ID from the response
    const id = response.data.id;
    const url = response.data.url;

    const formFieldResponses = [];

    for (const savedQuestion of savedData) {
      const formFieldResponse = await createFormField(
        token,
        savedQuestion.question,
        savedQuestion.type,
        savedQuestion.required,
        id,
        savedQuestion.imageUrl
      );
    
      formFieldResponses.push(formFieldResponse);
    }

    // Iterate over form field responses and save options/answers
    for (let i = formFieldResponses.length - 1; i >= 0; i--) {
      const formFieldResponse = formFieldResponses[i];
      if (
        formFieldResponse.success &&
        formFieldResponse.data &&
        formFieldResponse.data.id
      ) {
        const formFieldId = formFieldResponse.data.id;
        const savedQuestion = savedData[i];

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
    console.log("isEditPage:", isEditPage);
    if(isEditPage)
    {
      getForm();
      setSavedNewQuestions([]);
    }else{
      navigate(`${import.meta.env.VITE_API_BASE_URL}/edit/${url}`);
    }

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
      setRadioLabels([...radioLabels, ""]);
    } else {
      logError("Maximum 4 radio options allowed.", setErrorMessage); 
    }
  };

  const initRadioOptions = () => {
    setRadioboxes(["", "", "", ""]);
    setRadioLabels(["", "", "", ""]);
  };

  const handleAddCheckboxOption = () => {
    if (checkboxes.length < 4) {
      setCheckboxes([...checkboxes, false]);
      setCheckboxLabels([...checkboxLabels, ""]);
    } else {
      logError("Maximum 4 checkbox options allowed.", setErrorMessage); 
    }
  };

  const initCheckboxOptions = () => {
    setCheckboxLabels(["", "", "", ""]);
    setCheckboxes([false, false, false, false]); // Select the first checkbox option
  };

  const handleKeyDownTitle = (e) => {
    if (e.key === "Enter") {
      toggleEditTitle();
    }
  };

  const handleKeyDownDescription = (e) => {
    if (e.key === "Enter") {
      toggleEditDescription();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (pageAvailable === false) {
    return (
      <div className="error-container">
        <h2>Page is not available</h2>
      </div>
    );
  }

  return (
    <div>
    {/* Your normal form builder or other content */}
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
                onKeyDown={handleKeyDownTitle}
              />

              <button
                className="edit-icon-button"
                onClick={toggleEditTitle}
              >
                <FontAwesomeIcon icon={faCheck} className="edit" />
              </button>
            </div>
          ) : (
            <div className="form-title-container">
              <div className="form-title">{formTitle}</div>
              <button
                className="edit-icon-button"
                onClick={toggleEditTitle}
              >
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
                onKeyDown={handleKeyDownDescription}
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
                {saved.imageUrl && (
                  <div className="image-preview">
                    <img
                      src={saved.imageUrl}
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
                <p className="question-answer-text">
                  {" "}
                  Answer: {saved.options}
                </p>
              )}
              {saved.type === "radiobox" && (
                <div>
                  {saved.options.map((option, idx) => (
                    <div key={idx}>
                      <input
                        type="radio"
                        disabled
                        checked={
                          saved.selectedRadio === idx &&
                          selectedType === "Quiz"
                        }
                        style={{ marginLeft: "90px" }}
                      />
                      <span className="question-answer-radio">
                        {option}
                      </span>
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
                  <div
                    key={index}
                    className="input-container-check-radio"
                  >
                    <input
                      type="radio"
                      checked={selectedRadio === index}
                      onChange={() => handleRadioChange(index)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={radioLabels[index]}
                      onChange={(e) =>
                        handleLabelChange(
                          "radiobox",
                          index,
                          e.target.value
                        )
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
                  <div
                    key={index}
                    className="input-container-check-radio"
                  >
                    <input
                      type="checkbox"
                      checked={checkboxes[index]}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <input
                      type="text"
                      value={checkboxLabels[index]}
                      onChange={(e) =>
                        handleLabelChange(
                          "checkbox",
                          index,
                          e.target.value
                        )
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
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>

      <div className="save-buttons-form-container">
        <div className="save-buttons-form">
          <button
            onClick={handleSaveForm} disabled={disableSaveButton}
            className="save-buttons-form-button"
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
