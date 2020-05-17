import { TextMap } from '../types';
import { PASSWORD_MIN_LENGTH } from '../constants';


export const enUS: TextMap = {
  "app.description": "Webbased CA and certificicate manager",

  "signup.title": "webca.io",
  "signup.button": "Sign Up",
  "signup.accountName-placeholder": "Account name",
  "signup.accountName-required": "Please provide an account name",
  "signup.email-placeholder": "Email",
  "signup.email-required": "A valid email is required",
  "signup.password-placeholder": "Password",
  "signup.password-required": `At least ${PASSWORD_MIN_LENGTH} charactes are required in password`,
};
