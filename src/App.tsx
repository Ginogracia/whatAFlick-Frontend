import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from 'react-router-dom';

import Login from "./components/Login"
import Register from "./components/Register"
import User from "./components/User"
import Movies from "./components/Movies"
import Admin from "./components/Admin"

function App() {



    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user" element={<User />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    )
}

export default App