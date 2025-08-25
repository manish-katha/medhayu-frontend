
import config from "../config/config";
const path = (route) => `${config.BaseURL}${route}`;
  console.log("path",path)

export const Urls = {
  userLogin: path("/users/login"),
  userRegister:path("/users/add"),
  createPatient:path("/patient/create-patient"),
  getPatients:path("/patient/get-patient"),
  getPatient:path("/patient/get-patient-byid"),
  getClinics:path("/clinic/get-clinic"),
}
