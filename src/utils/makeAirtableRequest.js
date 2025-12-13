import axios from "axios";
import { refreshAirtableToken } from "./refreshAirtableToken.js";
import { User } from "../models/User.js";

export const makeAirtableRequest = async (user, config) => {
  let accessToken = user.access_token;

  const tryRequest = async () => {
    try {
      return await axios({
        ...config,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(config.headers || {}),
        },
      });
    } catch (err) {
      const isExpired =
        err.response?.status === 401 ||
        err.response?.data?.error?.includes("invalid_grant");

      if (isExpired) {
        console.log("🔄 Access token expired → refreshing!");

        const refreshed = await refreshAirtableToken(user.refresh_token);

        // update tokens in DB
        user.access_token = refreshed.access_token;
        if (refreshed.refresh_token)
          user.refresh_token = refreshed.refresh_token;
        await user.save();

        // update active access token
        accessToken = refreshed.access_token;

        // retry request
        return await tryRequest();
      }

      throw err; // other errors
    }
  };

  return await tryRequest();
};
