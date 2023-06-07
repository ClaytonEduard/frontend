import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';


interface IRequestConfig extends AxiosRequestConfig {
    onFailure?: (error: AxiosError) => void;
    onSuccess?: (response: AxiosResponse) => void;
}

const api = axios.create({
    baseURL: 'http://localhost:3000/',
})


let failedRequest: Array<IRequestConfig> = [];

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token:salaoagendamento');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
const refreshSubscribes: Array<(token: string) => void> = [];

// interceptar os erro, ex: erro de login e senha e token

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | unknown) => {
        const originalRequest = (error as AxiosError).config as IRequestConfig
        if (error instanceof AxiosError && error.response?.status === 401) {
            if (
                error.response?.data &&
                error.response?.data.code === 'token.expired') {

                try {
                    const refresh = localStorage.getItem('refresh_token:salaoagendamento')
                    const response = await api.post('/resfresh', {
                        refresh_token: refresh,
                    });

                    const { token, refresh_token } = response.data;
                    localStorage.setItem('token:salaoagendamento', token);
                    localStorage.setItem('refresh_token:salaoagendamento', refresh_token);

                    onRefreshed(token);

                    if (originalRequest?.headers) {
                        // seta novamente o valor de um novo token
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return axios(originalRequest);
                } catch (error) {
                    failedRequest.forEach((request) => {
                        request.onFailure?.(error as AxiosError)
                    });
                    failedRequest = [];
                }

                return new Promise((resolve, reject) => {
                    failedRequest.push({
                        ...originalRequest,
                        onSuccess: (response) => resolve(response),
                        onFailure: (error) => reject(error),
                    });
                });
            }
        } else {
            localStorage.removeItem('token:salaoagendamento')
            localStorage.removeItem('refresh_token:salaoagendamento')
            localStorage.removeItem('user:salaoagendamento')
        }

        return Promise.reject(error)
    },
);


// criar funcao para atulizar o token expirado nas outras requisições
function onRefreshed(token: string) {
    refreshSubscribes.forEach((callback) => callback(token));
}



export { api }