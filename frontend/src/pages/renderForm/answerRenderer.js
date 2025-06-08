export const renderUserAnswers = (field, userResponse) => {
  if (!userResponse) return null;

  if (field.fieldType === "textbox") {
    const fieldResponse = userResponse.fieldResponses.find(
      (fr) => fr.formFieldId === field.id
    );
    return fieldResponse?.responseValue || "";
  }

  if (field.fieldType === "radiobox") {
    const fieldResponse = userResponse.fieldResponses.find(
      (fr) => fr.formFieldId === field.id
    );
    return fieldResponse?.responseValue || "";
  }

  if (field.fieldType === "checkbox") {
    return userResponse.fieldResponses
      .filter((fr) => fr.formFieldId === field.id)
      .map((fr) => fr.responseValue);
  }
  return null;
};

export const renderCorrectAnswer = (field) => {
  if (!field.options) return null;

  if (field.fieldType === "textbox") {
    const correctOption = field.options.find((o) => o.isCorrect);
    return correctOption?.optionValue || "N/A";
  }

  if (field.fieldType === "radiobox") {
    const correctOption = field.options.find((o) => o.isCorrect);
    return correctOption?.optionValue || "N/A";
  }

  if (field.fieldType === "checkbox") {
    return field.options
      .filter((o) => o.isCorrect)
      .map((o) => o.optionValue)
      .join(", ");
  }
  return null;
};

export const calculateUserScore = (form, userResponse) => {
  let score = 0;

  for (const field of form.formFields) {
    const userAnswer = renderUserAnswers(field, userResponse);

    if (field.fieldType === "textbox") {
      const correctOption = field.options.find((o) => o.isCorrect);
      if (
        userAnswer &&
        correctOption &&
        userAnswer.trim().toLowerCase() === correctOption.optionValue.trim().toLowerCase()
      ) {
        score++;
      }
    } else if (field.fieldType === "radiobox") {
      const correctOption = field.options.find((o) => o.isCorrect);
      if (userAnswer && correctOption && userAnswer === correctOption.optionValue) {
        score++;
      }
    } else if (field.fieldType === "checkbox") {
      const correctOptions = field.options.filter((o) => o.isCorrect).map((o) => o.optionValue);
      if (
        Array.isArray(userAnswer) &&
        userAnswer.length === correctOptions.length &&
        userAnswer.every((ans) => correctOptions.includes(ans))
      ) {
        score++;
      }
    }
  }

  return score;
};
