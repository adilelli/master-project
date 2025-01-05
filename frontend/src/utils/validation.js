export const validatePassword = (password) => {
    const isLengthValid = password.length >= 8 && password.length <= 16;
    const hasAlphanumeric = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/.test(password);
    return isLengthValid && hasAlphanumeric;
  };
  
  