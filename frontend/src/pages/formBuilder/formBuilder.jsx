import React, { useState, useContext, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createForm, getFormByUrl, updateForm } from "../../services/api/formApi";
import { createFormField, deleteFormField } from "../../services/api/formFieldApi";
import { createFormFieldOption } from "../../services/api/formFieldOptionApi";
import { createOptionsRequest } from "../../services/api/gemini";
import { FormContext } from "../../context/form-context";
import { Dropdown } from "../../components/pages/formBuilder/dropdown/dropdown";
import { DescriptionEditor} from "../../components/pages/formBuilder/titleDescriptionEditor/descriptionEditor";
import { TitleEditor } from "../../components/pages/formBuilder/titleDescriptionEditor/titleEditor";
import { QuestionList } from "./../../components/pages/formBuilder/question/questionList";
import { QuestionEditor } from "./../../components/pages/formBuilder/question/questionEditor";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp
} from "@fortawesome/free-solid-svg-icons";

import { PageNotAvailable } from "../pageNotAvailable/pageNotAvailable";
import "./formBuilder.css";

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
  const [activeOptionType, setActiveOptionType] = useState(null);
  const [question, setQuestion] = useState("");
  const [textboxInput, setTextboxInput] = useState("");
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [formTitle, setFormTitle] = useState("My title");
  const [formDescription, setFormDescription] = useState("My description");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [required, setRequired] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFormType, setSelectedFormType] = useState(formType[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [existingQuestionIds, setExistingQuestionIds] = useState([]);
  const [savedNewQuestions, setSavedNewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageAvailable, setPageAvailable] = useState(true);
  const [isEditPage, setIsEditPage] = useState(false);
  const [formId, setFormId] = useState(null);
  const [removableQuestionList, setRemovableQuestionList] = useState([]);
  const [disableSaveButton, setDisableSaveButton] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { imageUrl, widgetRef, clearImage } = useCloudinaryUpload();

  // Fetch form data when modifying an existing form
  useEffect(() => {
    getForm();
  }, [editPath]);

  const mapApiToFormField = (apiObject) => {
    const questionIds = [];

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
    if (location.pathname === `${import.meta.env.VITE_API_BASE_URL}/formBuilder`) {
      setSelectedFormType("Form");
      setFormDescription("My description");
      setFormTitle("My title");
      setFormId(null);
      setSavedQuestions([]); // Reset the saved questions

      setPageAvailable(true);
      setLoading(false);
      return;
    }
    try {
      const response = await getFormByUrl(token, editPath);

      if (userId !== response.data.userId) setPageAvailable(false);
      setSelectedFormType(response.data.type);
      setFormDescription(response.data.description);
      setFormTitle(response.data.title);
      setFormId(response.data.id);
      setSavedQuestions(mapApiToFormField(response.data));
      setRemovableQuestionList([]);

      setIsEditPage(true);
      setPageAvailable(true);
    } catch (err) {
      console.error("Error fetching form!!!:", err);
      setPageAvailable(false);
    }
    setLoading(false);
  };

  const handleAddTextbox = () => {
    setTextboxes([""]);
    setRadioboxes([]);
    setCheckboxes([]);
    setRadioLabels([]);
    setCheckboxLabels([]);
    setActiveOptionType("textbox");
  };

  const handleAddInput = (type, isFromButton = false) => {
    if (type === "radiobox") {
      setActiveOptionType("radiobox");
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
      setActiveOptionType("checkbox");
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


  const handleSaveQuestion = () => {

    const isInputFilled = () => {
      if (activeOptionType === "textbox") {
        return question && (textboxInput || selectedFormType == "Form");
      }

      if (activeOptionType === "radiobox") {
        if (selectedRadio === null && selectedFormType == "Quiz") {
          logError(
            "Please select an option for the radio buttons.",
            setErrorMessage
          );
          return false;
        }
        return radioLabels.every((label) => label) && question;
      }
      if (activeOptionType === "checkbox") {
        if (
          !checkboxes.some((checkbox) => checkbox) &&
          selectedFormType == "Quiz"
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
          type: activeOptionType,
          options:
            activeOptionType === "textbox"
              ? textboxInput
              : activeOptionType === "radiobox"
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
        type: activeOptionType,
        options:
          activeOptionType === "textbox"
            ? textboxInput
            : activeOptionType === "radiobox"
              ? radioLabels
              : checkboxLabels,
        selectedRadio: selectedRadio,
        selectedCheckboxes: checkboxes,
        required, 
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
    setActiveOptionType(null);
    setRequired(false); 
    clearImage(null);
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
        ? await createForm(token, formTitle, formDescription, selectedFormType)
        : await updateForm(
          token,
          formId,
          formTitle,
          formDescription,
          selectedFormType
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
    if (isEditPage) {
      getForm();
      setSavedNewQuestions([]);
    } else {
      navigate(`${import.meta.env.VITE_API_BASE_URL}/edit/${url}`);
    }

  };

const handleGetPrompt = async () => {
  console.log("datas:", imageUrl, activeOptionType, question, token);

  if (question.trim() === "") {
    logError("Please start typing the question", setErrorMessage);
    return;
  }

  if (activeOptionType === null || question.trim() === "") {
    logError("Please select an option type", setErrorMessage);
    return;
  }

  try {
    const result = await createOptionsRequest(
      token,
      imageUrl ?? "",
      activeOptionType,
      question
    );
    console.log("Prompt result:", result);

    if (isValidPromptResult(result)) {
      const json = JSON.parse(result.data);
      if (activeOptionType === "radiobox") {
        const options = json.map((item) => item.option);
        const isTrue = json.map((item) => item.isTrue);
        setRadioboxes(options);
        setRadioLabels(options);
        const correctIndex = isTrue.findIndex(val => val === true);
        setSelectedRadio(correctIndex !== -1 ? correctIndex : null);
      } else if (activeOptionType === "checkbox") {
        const options = json.map((item) => item.option);
        const isTrue = json.map((item) => item.isTrue);
        setCheckboxLabels(options);
        setCheckboxes(isTrue);
      } else if (activeOptionType === "textbox") {
        setTextboxInput(json[0].option);
        console.log("Textbox input set to:", result);
      }
      if(activeOptionType === "radiobox" || activeOptionType === "checkbox" || activeOptionType === "textbox") {
        logSuccess("Options set successfully.", setSuccessMessage);
      }
    } else {
      console.error("Prompt result is not valid:", result);
      logError("Prompt result is not valid.", setErrorMessage);
    }
  } catch (err) {
    console.error("Failed to fetch options from Gemini:", err);
    logError("Failed to generate options from prompt.", setErrorMessage);
  }
};

  const isValidPromptResult = (result) => {
    // Format 1: single object with 'option' key
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return true;
    }

    // Format 2: array of 4 objects with 'option' and 'isTrue'
    if (Array.isArray(result) && result.length === 4) {
      return true;
    }

    return false;
  }

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
    setCheckboxes([false, false, false, false]); 
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
      <PageNotAvailable/>
    );
  }

  return (
    <div>
      <div className="full-form-builder-container">
        <Dropdown
          selectedFormType={selectedFormType}
          isDropdownOpen={isDropdownOpen}
          formType={formType}
          toggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
          handleTypeSelect={(type) => {
            setSelectedFormType(type);
            setIsDropdownOpen(false);
          }}
        />

        <div className="form-builder-container">
          <div className="form-title-description">
            <TitleEditor
              title={formTitle}
              isEditing={isEditingTitle}
              onChange={handleFormTitleChange}
              onToggleEdit={toggleEditTitle}
              onKeyDown={handleKeyDownTitle}
            />
          </div>

          <div className="form-title-description">
            <DescriptionEditor
              description={formDescription}
              isEditing={isEditingDescription}
              onChange={handleFormDescriptionChange}
              onToggleEdit={toggleEditDescription}
              onKeyDown={handleKeyDownDescription}
            />
          </div>

          <div className="content-wrapper">
            <QuestionList
              questions={savedQuestions}
              formType={selectedFormType}
              onDelete={handleDeleteQuestion}
            />

            <QuestionEditor
              imageUrl={imageUrl}
              widgetRef={widgetRef}
              inputRef={inputRef}
              question={question}
              handleQuestionChange={handleQuestionChange}
              required={required}
              setRequired={setRequired}
              handleAddTextbox={handleAddTextbox}
              handleAddInput={handleAddInput}
              activeOptionType={activeOptionType}
              textboxInput={textboxInput}
              handleTextboxInputChange={handleTextboxInputChange}
              radioboxes={radioboxes}
              selectedRadio={selectedRadio}
              handleRadioChange={handleRadioChange}
              radioLabels={radioLabels}
              handleLabelChange={handleLabelChange}
              handleAddRadioOption={handleAddRadioOption}
              handleRemoveInput={handleRemoveInput}
              checkboxes={checkboxes}
              handleCheckboxChange={handleCheckboxChange}
              checkboxLabels={checkboxLabels}
              handleAddCheckboxOption={handleAddCheckboxOption}
              handleSaveQuestion={handleSaveQuestion}
              successMessage={successMessage}
              errorMessage={errorMessage}
              handleGetPrompt={handleGetPrompt}
            />
          </div>

        </div>
        <div className="save-buttons-form-container">
          <div className="save-buttons-form">
            <button
              onClick={handleSaveForm} disabled={disableSaveButton}
              className="save-buttons-form-button"
            >
              <FontAwesomeIcon icon={faCloudArrowUp} className="save-icon" />
              Save Form
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};
