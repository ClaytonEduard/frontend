import { ReactNode, createContext, useEffect, useState } from "react";
import { api } from "../server";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface IAuthProvider {
  children: ReactNode;
}

interface IAuthContextData {
  signIn: ({ email, password }: ISignIn) => void;
  signOut: () => void;
  user: IUserData;
  availableSchedules: Array<string>;
  schedules: Array<ISchedule>;
  date: string;
  handleSetDate: (date:string) => void;
}

interface ISchedule {
  name: string;
  phone: string;
  date: Date;
  id: string;
}

interface IUserData {
  name: string;
  email: string;
  avatar_url: string;
}

interface ISignIn {
  email: string;
  password: string;
}

//buscar informações da api backend para compartilhar entre as paginas front end
export const AuthContext = createContext({} as IAuthContextData);

export function AuthProvider({ children }: IAuthProvider) {
  const [schedules, setSchedules] = useState<Array<ISchedule>>([]);
  const [date, setDate] = useState('');

  // constante para avisar o horario em que trabalha
  // array de horas disponiveis
  const availableSchedules = [
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
  ];

  const [user, setUser] = useState(() => {
    const user = localStorage.getItem("user:salaoagendamento");
    if (user) {
      return JSON.parse(user);
    }
    return {};
  });

  const navigate = useNavigate();
  const handleSetDate = (date: string) => {
    setDate(date);
  };

  useEffect(() => {
    api
      .get("/schedules", {
        params: {
          date,
        },
      })
      .then((response) => {
        setSchedules(response.data);
      })
      .catch((error) => console.log(error));
  }, [date]);

  async function signIn({ email, password }: ISignIn) {
    try {
      const { data } = await api.post("/users/auth", {
        email,
        password,
      });
      const { token, refresh_token, user } = data;
      const userData = {
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      };

      // salvando os dados no local storage do navegador para recupera-los
      localStorage.setItem("token:salaoagendamento", token);
      localStorage.setItem("refresh_token:salaoagendamento", refresh_token);
      localStorage.setItem("user:salaoagendamento", JSON.stringify(userData));
      navigate("/dashboard");
      toast.success(`Seja bem vindo(a), ${userData.name}`);
      setUser(userData);
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Não conseguimos realizar o login. Tente mais tarde!");
      }
    }
  }

  // metodo sair
  function signOut() {
    localStorage.removeItem("token:salaoagendamento");
    localStorage.removeItem("refresh_token:salaoagendamento");
    localStorage.removeItem("user:salaoagendamento");
    navigate("/");
  }
  return (
    <AuthContext.Provider
      value={{ signIn, signOut, user, availableSchedules, schedules, date, handleSetDate }}
    >
      {children}
    </AuthContext.Provider>
  );
}
