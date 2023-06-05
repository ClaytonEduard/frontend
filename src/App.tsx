import "./global.css";
import { RouteApp } from "./routes";
import { BrowserRouter } from "react-router-dom";
function App() {
  return(

    <BrowserRouter>
    <RouteApp></RouteApp>;
    </BrowserRouter>
    )
}

export default App;
