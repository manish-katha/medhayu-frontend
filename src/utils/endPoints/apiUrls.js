
import config from "../config/config";

const path = (route) => `${config.BaseURL}${route}`;
  console.log("path",path)

export const Urls = {
  userLogin: path("/users/login"),
  userRegister:path("/users/add"),
  createPatient:path("/patient/create-patient"),
  getPatients:path("/patient/get-patient"),
  getPatient:path("/patient/get-patient-byid"),
  updatePatient:path("/patient/update-patient"),
  deletePatient:path("patient/delete-patient"),
  getClinics:path("/clinic/get-clinic"),
  createPrescription:path("/prescription/create-prescription"),
getPrescriptions:path("/prescription/get-prescription"),
getPrescription:path("/prescription/get-prescription"),
updatePrescription:path("/prescription/get-prescription"),
deletePrescription:path("/prescription/get-prescription")


}
