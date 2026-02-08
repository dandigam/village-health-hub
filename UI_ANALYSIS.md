# Village Health Hub – UI Codebase Analysis

## 1. Screens / Pages

| Route | Page Component | Purpose |
|-------|----------------|---------|
| `/` | Index | Redirects to `/login` |
| `/login` | Login | Sign in (email/mobile, password) |
| `/dashboard` | Dashboard | Status cards, setup steps, quick actions, recent patients |
| `/camps` | Camps | List camps (tabs: All / Active / Draft / Closed), search |
| `/camps/new` | NewCamp | Multi-step: Camp details, Location, Assign doctors, Assign volunteers, Summary |
| `/camps/:id` | EditCamp | Edit camp (name, village, district, location, dates, description, status, doctors) |
| `/patients` | Patients | List patients, search by MR/name |
| `/patients/new` | NewPatient | Register patient (personal + address + photo) |
| `/patients/:id` | PatientHistory | Patient detail: SOAP, consultations, prescriptions, payments |
| `/doctors` | Doctors | List doctors, search |
| `/doctors/new` | NewDoctor | Add doctor (name, specialization, phone, email, photo, camps) |
| `/doctors/:id/edit` | EditDoctor | Edit doctor (same + active toggle, camps) |
| `/soap` | SOAPNotesList | List SOAP notes (tabs: All / Draft / Sent / Reviewed) |
| `/soap/new` | NewSOAPNote | New SOAP (patient select, S/O/A/P tabs) |
| `/soap/:id` | ViewSOAPNote | View single SOAP note |
| `/soap/:id/edit` | NewSOAPNote | Edit SOAP (same as new) |
| `/consultations` | ConsultationsList | Tabs: Awaiting, In Progress, Completed |
| `/consultations/new` | NewConsultation | Full consultation (SOAP, vitals, diagnosis, prescription, notes) |
| `/consultations/doctor` | DoctorConsultation | Doctor view: Subject / Objective / Assessment / Plan / Summary tabs |
| `/pharmacy` | PharmacyDashboard | Pending / Partial / Dispensed prescriptions |
| `/pharmacy/prescription/:id` | DispenseMedicine | Dispense by prescription, payment type, bill |
| `/pharmacy/dispense/:id` | DispenseMedicine | Same as above |
| `/stock` | StockManagement | Inventory, Purchase orders, Suppliers, Stock reports |
| `/reports` | ReportsHub | Overview stats, links to sub-reports |
| `/reports/camps` | CampReports | Camp-wise stats |
| `/reports/patients` | PatientReports | Patient-wise reports |
| `/reports/medicines` | MedicineReports | Medicine-wise usage |
| `/reports/discounts` | DiscountReports | Discount summary |
| `/reports/doctors` | DoctorReports | Doctor-wise consultations/prescriptions |
| `/settings` | Settings | Notifications, Appearance, Security, Data & Storage, ID Cards link |
| `/settings/id-cards` | IDCardPrintouts | Generate/print ID cards by camp |
| `/profile` | Profile | User profile (photo, role, employment, personal info edit) |
| `*` | NotFound | 404 page |

---

## 2. Forms and Input Fields

### Login
- **Email or Mobile** (text)
- **Password** (password, show/hide toggle)
- Buttons: Sign In, Forgot Password?, Google, Facebook

### New Patient
- **Patient info:** name*, surname, fatherName*, gender* (Male/Female/Other), maritalStatus (Single/Married/Widowed/Divorced), age*, phone
- **Address:** state (AP/TS/KA/TN), district (Guntur/Krishna/Prakasam), mandal (Bapatla/Mangalagiri), village (city), street
- **Photo:** PhotoUpload component

### New Camp (5 steps)
- **Step 1:** campName*, organizerName*, organizerPhone*, organizerEmail, planDate (date picker)
- **Step 2:** state, district*, mandal*, city*, address*, pinCode
- **Step 3:** Search & add doctors (Command)
- **Step 4:** Search & add volunteers (Command)
- **Step 5:** Summary (read-only), Create Camp

### Edit Camp
- name*, village*, district*, location (address), startDate*, endDate*, description, status (draft/active/closed), selectedDoctors (multi-select)

### New Doctor
- name*, specialization* (select), phone*, email, selectedCamps (multi-select), photo (PhotoUpload)

### Edit Doctor
- Same as New Doctor + isActive (Switch), photo, selectedCamps

### New SOAP Note
- **Patient:** search/select (MR Number / Name)
- **S – Subjective:** Textarea (complaints)
- **O – Objective:** weight (kg), bp, pulse (bpm), temp (°F), spo2 (%), notes (textarea)
- **A – Assessment:** Textarea
- **P – Plan:** Textarea
- Actions: Save Draft, Send to Doctor

### New Consultation (from SOAP)
- **SOAP:** subjective (textarea), vitals (bp, pulse, temp, spo2, weight, height → BMI computed)
- **Assessment:** diagnosis (select + custom input, list of badges)
- **History (collapsible):** pastHistory, familyHistory, socialHistory (textareas)
- **Prescription:** search medicine, add rows: medicine, M/A/N doses (0–3), days, quantity (computed), notes
- **Additional notes:** Textarea
- Actions: Save Draft, Complete & Send to Pharmacy

### Doctor Consultation (tabs)
- **Subject:** conditions (checkboxes), general questions, diabetes/HTN data (type, onset, presenting complaints)
- **Objective:** vitals (weight, bp, pulse, temp, spo2), lab tests table (name, date, testWithMedicine, clinicalResults, resultDifference)
- **Assessment:** notes textarea
- **Plan:** prescription table (medicine search, M/A/N, days, qty, select checkbox)
- **Summary:** description textarea, patient summary
- Actions: Save Draft, Complete & Send to Pharmacy

### Dispense Medicine
- Per prescription item: **Dispense Qty** (number, max = min(prescribed, stock))
- **Payment:** Payment type (Full / Partial / Pending), **Amount Paid** (if partial)
- Actions: Dispense & Generate Bill, Print, Print Bill

### Stock Management
- **Add Supplier:** name, contact, address
- **Add Stock:** medicine (select), quantity, batchNumber, expiryDate (date), supplier (select)
- **Purchase Order:** supplier (select), order date (date), per-medicine quantity inputs

### Settings
- **Notifications:** emailAlerts, smsAlerts, pushNotifications, dailyDigest (switches)
- **Appearance:** theme (light/dark/system), compactMode (switch), language (en/hi/te)
- **Security:** twoFactor (switch), sessionTimeout (15/30/60/120 min)
- **Data:** Clear local storage, Export data (buttons)

### Profile
- **Edit mode:** name, email, phone, location (inputs)
- **Photo:** PhotoUpload
- Display: role, employeeId, department, joinDate, permissions

### ID Card Printouts
- **Camp** (select), **Doctor/Staff** filter, **Print** actions

---

## 3. Validation Rules (Extracted)

- **No Zod/schema** – validation is inline (useState + manual checks).

### Login
- None (form submit navigates to dashboard).

### New Patient
- Required: `name`, `fatherName`, `gender`, `age`.
- Toast: "Please fill in all required fields" if missing.

### Edit Camp
- **name:** required, "Camp name is required".
- **village:** required, "Village is required".
- **district:** required, "District is required".
- **startDate:** required, "Start date is required".
- **endDate:** required; must be ≥ startDate → "End date must be after start date".

### New Doctor / Edit Doctor
- **name:** required, "Doctor name is required".
- **specialization:** required, "Specialization is required".
- **phone:** required; 10 digits → "Enter a valid 10-digit phone number".
- **email:** if present, valid email → "Enter a valid email address".

### New Consultation
- **Send to Pharmacy:** at least one prescription item → "Add at least one medicine before sending."

### Doctor Consultation
- **Send to Pharmacy:** at least one medicine selected → "Please select at least one medicine before sending."

### New Camp
- No step-level validation; Submit creates camp (toast only).

### New SOAP Note
- No validation before Save Draft / Send to Doctor.

### Dispense Medicine
- No validation (dispense qty can exceed stock in UI logic; backend should enforce).

### Stock (Add Supplier / Add Stock / Purchase Order)
- No validation; dialogs close on button click.

### Settings / Profile
- No validation; toast on save.

---

## 4. Data Models Used in UI

All from `src/types/index.ts` and `src/data/mockData.ts`:

| Model | Key Fields (from types + forms) |
|-------|----------------------------------|
| **User** | id, name, email, phone, role, avatar |
| **Camp** | id, name, location, village, district, startDate, endDate, status, description, doctorIds, pharmacyIds, staffIds |
| **Doctor** | id, name, specialization, phone, email, avatar, photoUrl |
| **Patient** | id, patientId, campId, name, surname, fatherName, age, gender, phone, address, village, district, state, photoUrl, createdAt |
| **SOAPNote** | id, patientId, campId, createdBy, subjective, objective{weight,bp,pulse,temp,spo2,notes}, assessment, plan, status, createdAt |
| **Consultation** | id, patientId, doctorId, campId, soapNoteId, chiefComplaint, medicalHistory, diagnosis[], labTests[], suggestedOperations[], notes, prescriptionId, status, createdAt |
| **Medicine** | id, name, code, category, unitPrice |
| **PrescriptionItem** | medicineId, medicineName, quantity, morning, afternoon, night, days |
| **Prescription** | id, consultationId, patientId, doctorId, campId, items[], status, createdAt |
| **Discount** | id, name, type, value, campId, patientId, prescriptionId?, medicineIds?, appliedBy, reason?, createdAt |
| **Payment** | id, prescriptionId, patientId, campId, totalAmount, paidAmount, pendingAmount, discountId?, discountAmount?, status, createdAt |
| **Supplier** | id, name, contact, address |
| **StockItem** | id, medicineId, campId, quantity, batchNumber, expiryDate, purchaseDate, supplierId |
| **CampStats** | totalPatients, patientsAtDoctor, patientsAtPharmacy, patientsAtCashier, exitedPatients, totalCollection |

UI-only / local state (not in types):
- **New Camp form:** organizerName, organizerPhone, organizerEmail, planDate, state, district, mandal, city, address, pinCode, selectedDoctors, selectedVolunteers (volunteers from mock list).
- **New Consultation:** Vitals include height; BMI computed; prescription item has `notes`.
- **Doctor Consultation:** Lab test rows (name, date, testWithMedicine, clinicalResults, resultDifference); conditions (diabetes, HTN, etc.); allergies (drug/food/environment + lists).

---

## 5. Expected Backend API Calls (Not Implemented)

- **No `fetch` / `axios` / `useQuery` / `useMutation`** in app code. All data is from `mockData.ts` and in-memory state.
- Expected usage pattern: REST or RPC per resource; React Query for list/detail/mutations.

Assumed operations below are what the UI is **designed to support** (read/write flows), not what exists today.

---

## 6. CRUD Operations per Feature

| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| **Auth** | Login (session) | Current user | – | Logout |
| **Camps** | NewCamp → create camp | List, Get by id (EditCamp) | EditCamp → update camp | – (UI has no delete) |
| **Patients** | NewPatient → register | List, PatientHistory by id | – (no edit page) | – |
| **Doctors** | NewDoctor → add | List, Get by id (EditDoctor) | EditDoctor → update | – |
| **SOAP Notes** | NewSOAPNote → create/draft, send | List, View by id | NewSOAPNote edit | – |
| **Consultations** | NewConsultation, DoctorConsultation → create/draft, send to pharmacy | List (by status), get by id | Draft save (update) | – |
| **Prescriptions** | Created with consultation | List (PharmacyDashboard), get by id (Dispense) | Dispense → status + payment | – |
| **Pharmacy** | – | Pending/partial/dispensed lists | Dispense (update prescription + create payment) | – |
| **Stock** | Add supplier, Add stock, Purchase order | Inventory, suppliers, orders | – | – |
| **Discounts** | – | In reports / payment flow | – | – |
| **Payments** | On dispense | In reports, PatientHistory | – | – |
| **Reports** | – | Camp/Patient/Medicine/Discount/Doctor aggregates | – | – |
| **User/Profile** | – | Profile | Profile update, photo | – |
| **Settings** | – | App settings | Save settings | – |
| **ID Cards** | – | Camps, doctors by camp | – | – |

---

## 7. Feature List (Summary)

1. **Auth** – Login (email/mobile + password), no real API.
2. **Dashboard** – Stats, setup checklist, quick actions, recent patients.
3. **Camps** – List/filter, create (wizard), edit (name, location, dates, status, doctors).
4. **Patients** – List/search, register (demographics, address, photo), view history (SOAP, consultations, prescriptions, payments).
5. **Doctors** – List, add, edit (info, photo, camp assignment, active flag).
6. **SOAP Notes** – List by status, create/edit (S/O/A/P), view.
7. **Consultations** – List (awaiting / in progress / completed), new consultation (SOAP + vitals + diagnosis + prescription), doctor consultation (tabbed workflow).
8. **Pharmacy** – Dashboard (pending/partial/dispensed), dispense by prescription, payment type, bill/print.
9. **Stock** – Inventory, add supplier/stock, purchase order (dialogs); stock reports (placeholders).
10. **Reports** – Hub + Camp / Patient / Medicine / Discount / Doctor reports (all from mock).
11. **Settings** – Notifications, appearance, security, data; link to ID cards.
12. **ID Card Printouts** – Select camp, list doctors, print.
13. **Profile** – View/edit profile, photo.

---

## 8. Entity List with Fields

| Entity | Fields |
|--------|--------|
| **User** | id, name, email, phone, role, avatar |
| **Camp** | id, name, location, village, district, startDate, endDate, status, description?, doctorIds[], pharmacyIds[], staffIds[] |
| **Doctor** | id, name, specialization, phone, email?, avatar?, photoUrl? |
| **Patient** | id, patientId, campId, name, surname?, fatherName?, age, gender, phone, address, village, district?, state?, photoUrl?, createdAt |
| **SOAPNote** | id, patientId, campId, createdBy, subjective, objective{weight?, bp?, pulse?, temp?, spo2?, notes?}, assessment, plan, status, createdAt |
| **Consultation** | id, patientId, doctorId, campId, soapNoteId, chiefComplaint, medicalHistory?, diagnosis[], labTests?, suggestedOperations?, notes?, prescriptionId?, status, createdAt |
| **Medicine** | id, name, code, category, unitPrice |
| **PrescriptionItem** | medicineId, medicineName, quantity, morning, afternoon, night, days |
| **Prescription** | id, consultationId, patientId, doctorId, campId, items[], status, createdAt |
| **Discount** | id, name, type, value, campId, patientId, prescriptionId?, medicineIds?, appliedBy, reason?, createdAt |
| **Payment** | id, prescriptionId, patientId, campId, totalAmount, paidAmount, pendingAmount, discountId?, discountAmount?, status, createdAt |
| **Supplier** | id, name, contact, address |
| **StockItem** | id, medicineId, campId, quantity, batchNumber, expiryDate, purchaseDate, supplierId |
| **CampStats** | totalPatients, patientsAtDoctor, patientsAtPharmacy, patientsAtCashier, exitedPatients, totalCollection |

---

## 9. REST API Endpoint List (Expected)

Base assumption: `BASE_URL` (e.g. `/api` or env). All list endpoints should support `?campId=`, `?status=`, `?search=`, pagination where relevant.

### Auth
- `POST /auth/login` – body: `{ emailOrMobile, password }` → session/token + user.

### Camps
- `GET /camps` – list (filter: status, search).
- `GET /camps/:id` – one camp.
- `POST /camps` – create (body: Camp + organizerDetails + selectedDoctors + selectedVolunteers).
- `PATCH /camps/:id` – update (body: partial Camp + selectedDoctors).
- `GET /camps/:id/stats` – CampStats (dashboard).

### Patients
- `GET /patients` – list (filter: campId, status, search).
- `GET /patients/:id` – one patient.
- `GET /patients/:id/history` – SOAP + consultations + prescriptions + payments (or separate endpoints).
- `POST /patients` – register (body: Patient + photo upload).

### Doctors
- `GET /doctors` – list (filter: campId, search).
- `GET /doctors/:id` – one doctor.
- `POST /doctors` – add (body: Doctor + photo + campIds).
- `PATCH /doctors/:id` – update (body: partial Doctor + photo + campIds).

### SOAP Notes
- `GET /soap-notes` – list (filter: campId, patientId, status).
- `GET /soap-notes/:id` – one.
- `POST /soap-notes` – create/draft (body: SOAPNote).
- `PATCH /soap-notes/:id` – update, send to doctor (status).

### Consultations
- `GET /consultations` – list (filter: campId, status, patientId, doctorId).
- `GET /consultations/:id` – one.
- `POST /consultations` – create (body: Consultation + prescription).
- `PATCH /consultations/:id` – update draft, complete & send to pharmacy.

### Prescriptions
- `GET /prescriptions` – list (filter: status, campId, patientId).
- `GET /prescriptions/:id` – one.
- `PATCH /prescriptions/:id` – dispense (status, dispensedQtys), create payment.

### Payments
- `GET /payments` – list (filter: campId, patientId, prescriptionId).
- `POST /payments` – create (on dispense: prescriptionId, amounts, paymentType).

### Medicines
- `GET /medicines` – list (filter: category, search).

### Stock
- `GET /stock` – list StockItems (filter: campId, medicineId).
- `POST /stock` – add stock (medicineId, campId, quantity, batchNumber, expiryDate, purchaseDate, supplierId).
- `GET /suppliers` – list.
- `POST /suppliers` – add supplier.
- `GET /purchase-orders` – list (if modeled).
- `POST /purchase-orders` – create (if modeled).

### Discounts
- `GET /discounts` – list (filter: campId, patientId).

### Reports (aggregations)
- `GET /reports/camps` – camp-wise stats.
- `GET /reports/patients` – patient-wise.
- `GET /reports/medicines` – medicine-wise.
- `GET /reports/discounts` – discount summary.
- `GET /reports/doctors` – doctor-wise.

### User & Settings
- `GET /users/me` – current user (profile).
- `PATCH /users/me` – update profile + photo.
- `GET /users/me/settings` – app settings.
- `PATCH /users/me/settings` – save settings.

### ID Cards
- `GET /camps/:id/doctors` or reuse `GET /doctors?campId=:id` – for printouts.

---

## 10. Missing Backend Assumptions / Gaps

1. **Auth** – No token/session handling; login only navigates. Need: login API, token storage, auth context, protected routes, logout.
2. **Camp context** – `CampContext` uses hardcoded `"Bapatla"`. Should derive from user/camp API or URL.
3. **Patient ID** – `patientId` (e.g. MR number) is in type; backend must define generation rule (e.g. camp prefix + sequence).
4. **Photo uploads** – PhotoUpload used for patient, doctor, profile. Need: upload API (e.g. `POST /upload` or per-entity), storage URL in entities.
5. **Volunteers** – New Camp uses mock volunteers; no Volunteer type in `types`. Backend may need Volunteer entity and assign to camp.
6. **Organizer vs Camp** – New Camp has organizerName/Phone/Email; Camp type has no organizer. Either extend Camp or add Organizer entity.
7. **Dispense validation** – Dispense qty vs stock should be enforced server-side; UI does not block.
8. **Discount application** – Discounts appear in reports; UI does not show applying discount during dispense. Backend may apply discounts and compute paid/pending.
9. **Pagination** – All lists use full mock arrays. APIs should support limit/offset or cursor and total count.
10. **Soft delete / status** – No delete in UI; backend may use status (e.g. inactive) or soft delete for camps/doctors/patients.
11. **Permissions** – User has `role`; no role-based UI restrictions. Backend should enforce by resource and action.
12. **Lab tests** – DoctorConsultation has lab test rows; types have `Consultation.labTests` as string[]. Backend may need structured lab result model.
13. **Purchase orders** – Stock has “Purchase order” dialog but no PurchaseOrder type or list from API; backend may add PO entity and endpoints.
14. **Localization** – Settings has language (en/hi/te); no i18n in app. Backend may store preference only.
15. **Reports** – All report pages compute from in-memory mock. Backend should provide aggregated endpoints (or allow filtered list endpoints) for each report type.

---

*Document generated from UI codebase analysis. Backend implementation should align with these entities, endpoints, and validations.*
