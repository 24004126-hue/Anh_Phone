import axiosClient from "./axiosClient";

const authApi = {
    login(data) {
        return axiosClient.post("/Auth/login", data);
    },

    register(data) {
        return axiosClient.post("/Auth/register", data);
    },

    refreshToken(refreshToken) {
        return axiosClient.post("/Auth/refresh-token", { refreshToken });
    },

    revokeToken(refreshToken) {
        return axiosClient.post("/Auth/revoke-token", { refreshToken });
    }
};

export default authApi;