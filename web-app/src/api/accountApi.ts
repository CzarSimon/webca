import { httpclient } from "./httpclient";
import { AuthenticationRequest, AuthenticationResponse } from "../types";
import { HTTPResponse } from "@czarsimon/httpclient";

const SIGNUP_URL: string = "/api/v1/signup"

export const signupUser = async (req: AuthenticationRequest): Promise<HTTPResponse<AuthenticationResponse>> => (
  httpclient.post<AuthenticationResponse>({ url: SIGNUP_URL, body: req })
);
