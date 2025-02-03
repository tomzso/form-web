import React, { createContext, useState } from "react";

export const FormContext = createContext(null);

export const FormContextProvider = (props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const [userName, setUserNameContext] = useState(localStorage.getItem('userName') || '');
    const [token, setTokenContext] = useState(localStorage.getItem('token') || '');
    const [userId, setUserIdContext] = useState(localStorage.getItem('userId') || '');

    const logError = (error, setErrorMessage) => {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(''), 2500);
    };

    const logSuccess = (message, setSuccessMessage) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 2500);
    };

    const contextValue = {
        userName,
        token,
        userId,
        name,
        email,
        password,
        handleNameChange,
        handleEmailChange,
        handlePasswordChange,
        setUserNameContext,
        setTokenContext,
        setUserIdContext,
        logError,
        logSuccess,

    };

    return (
        <FormContext.Provider value={contextValue}>
            {props.children}
        </FormContext.Provider>
    );
};
