import { httpclient } from "./httpclient";
import { User } from "../types";
import { HTTPResponse } from "@czarsimon/httpclient";

const USER_URL: string = "/api/v1/users"

export const getUser = (id: string): Promise<HTTPResponse<User>> => (
  httpclient.get<User>({ url: `${USER_URL}/${id}` })
);
