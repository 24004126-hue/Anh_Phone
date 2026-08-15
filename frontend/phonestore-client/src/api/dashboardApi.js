import axiosClient from "./axiosClient";

const dashboardApi = {

    getDashboard() {
        return axiosClient.get("/Dashboard");
    }

};

export default dashboardApi;