//トークンの取得
export const getToken = async () => {
    const response = await fetch("/api/getSkyWayToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const apiResponse = await response.json();
    if (response.ok) {
        if (apiResponse.isSuccess) {
            //token
            const apiResponseBody = apiResponse.body;
            return apiResponseBody.skywayToken;
        } else {
            const apiResponseBody = apiResponse.body;
            console.error(apiResponseBody.errorMessage);
        }
    } else {
        console.error("connectionError");
        console.log(response)
    }
};