// import axios from "axios";
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });

        if (res.data.status === "success") {
            showAlert('success', "Logged in successfully!");
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch (error) {
        showAlert("error", error.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        console.log(res);

        if (res.data.status === 'success') {
            location.replace('/login');
        }
    } catch (err) {
        console.log(err);
        showAlert('error', 'Error logging out! Try again.');
    }
};
// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault();

//     // Values
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     login(email, password);
// });


