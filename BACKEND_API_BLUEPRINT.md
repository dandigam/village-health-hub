# Village Health Hub – Backend API Blueprint

**Purpose:** Exhaustive API specification derived from the UI codebase for scaffolding a Spring Boot + PostgreSQL + MongoDB backend.  
**Conventions:** Base path `/api`; all timestamps ISO 8601; IDs UUID or camp-prefixed where noted.

---

# Part 1: Feature List

| # | Screen (Route) | Feature Name | Purpose | Entities Involved |
|---|----------------|--------------|---------|--------------------|
| 1 | `/` | Index | Redirect to login | – |
| 2 | `/login` | Login | Authenticate user (email/mobile + password) | User |
| 3 | `/dashboard` | Dashboard | Show camp stats, setup checklist, quick actions, recent patients | Camp, CampStats, Patient |
| 4 | `/camps` | Camps List | List/filter camps by status, search by name/village/district | Camp, Doctor |
| 5 | `/camps/new` | New Camp | Create camp (wizard: details, location, doctors, volunteers) | Camp, Doctor, Volunteer (UI-only) |
| 6 | `/camps/:id` | Edit Camp | Update camp details, dates, status, assigned doctors | Camp, Doctor |
| 7 | `/patients` | Patients List | List patients, search by MR number / name | Patient |
| 8 | `/patients/new` | New Patient | Register patient (demographics, address, photo) | Patient |
| 9 | `/patients/:id` | Patient History | View patient SOAP notes, consultations, prescriptions, payments | Patient, SOAPNote, Consultation, Prescription, Payment |
| 10 | `/doctors` | Doctors List | List doctors, search, show assigned camps | Doctor, Camp |
| 11 | `/doctors/new` | New Doctor | Add doctor (info, photo, camp assignment) | Doctor, Camp |
| 12 | `/doctors/:id/edit` | Edit Doctor | Update doctor (info, active flag, camps) | Doctor, Camp |
| 13 | `/soap` | SOAP Notes List | List SOAP notes by status (All/Draft/Sent/Reviewed) | SOAPNote, Patient |
| 14 | `/soap/new` | New SOAP Note | Create SOAP (patient select, S/O/A/P) | SOAPNote, Patient |
| 15 | `/soap/:id` | View SOAP Note | View single SOAP note | SOAPNote, Patient |
| 16 | `/soap/:id/edit` | Edit SOAP Note | Edit SOAP (same as new) | SOAPNote, Patient |
| 17 | `/consultations` | Consultations List | List by status (Awaiting / In Progress / Completed) | Consultation, SOAPNote, Patient |
| 18 | `/consultations/new` | New Consultation | Full consultation (SOAP, vitals, diagnosis, prescription) | Consultation, Prescription, SOAPNote, Patient, Medicine |
| 19 | `/consultations/doctor` | Doctor Consultation | Doctor workflow (Subject/Objective/Assessment/Plan/Summary) | Consultation, Prescription, Patient, Medicine, StockItem |
| 20 | `/pharmacy` | Pharmacy Dashboard | Pending / Partial / Dispensed prescriptions | Prescription, Patient, Doctor |
| 21 | `/pharmacy/prescription/:id`, `/pharmacy/dispense/:id` | Dispense Medicine | Dispense by prescription, set payment, generate bill | Prescription, Payment, StockItem, Medicine |
| 22 | `/stock` | Stock Management | Inventory, add supplier/stock, purchase order | StockItem, Medicine, Supplier |
| 23 | `/reports` | Reports Hub | Overview stats, links to sub-reports | Camp, Patient, Consultation, Prescription, Payment, Discount, Doctor |
| 24 | `/reports/camps` | Camp Reports | Camp-wise stats (patients, consultations, payments, discounts) | Camp, Patient, Consultation, Prescription, Payment, Discount, Doctor |
| 25 | `/reports/patients` | Patient Reports | Patient-wise visits, payments, discounts | Patient, Consultation, Prescription, Payment, Discount, Camp, Doctor |
| 26 | `/reports/medicines` | Medicine Reports | Medicine-wise usage, prescriptions, discounts | Medicine, Prescription, Patient, Doctor, Camp, Discount |
| 27 | `/reports/discounts` | Discount Reports | Discount summary, totals | Discount, Patient, Doctor, Camp, Medicine, Prescription |
| 28 | `/reports/doctors` | Doctor Reports | Doctor-wise consultations, prescriptions | Doctor, Consultation, Prescription, Patient, Camp, Medicine |
| 29 | `/settings` | Settings | Notifications, appearance, security, data; link to ID cards | User (settings) |
| 30 | `/settings/id-cards` | ID Card Printouts | Select camp, list doctors/staff, print ID cards | Camp, Doctor |
| 31 | `/profile` | Profile | View/edit user profile, photo, role | User |
| 32 | `*` | NotFound | 404 | – |

---

# Part 2: Entity List

For each entity: **fields**, **types**, **validation rules**, and **relationships**.

---

## 2.1 User

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, min 1, max 255 | |
| email | string | required, email format, max 255 | |
| phone | string | required, max 20 | Indian 10-digit in UI |
| role | enum | required, one of: super_admin, camp_admin, doctor, pharmacy, staff | |
| avatar | string (URL) | optional, max 2048 | |

**Relationships:** None (user is actor; settings stored separately or on user).

---

## 2.2 Camp

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, min 1, max 255 | |
| location | string | optional, max 500 | Full address |
| village | string | required, max 100 | |
| district | string | required, max 100 | |
| startDate | string (date) | required, ISO date | |
| endDate | string (date) | required, ISO date, >= startDate | |
| status | enum | required, draft \| active \| closed | |
| description | string | optional, max 2000 | |
| doctorIds | string[] | optional, array of Doctor.id | Many-to-many with Doctor |
| pharmacyIds | string[] | optional | For future |
| staffIds | string[] | optional | Staff/volunteers |

**Relationships:**
- One-to-many: Camp → Patient, SOAPNote, Consultation, Prescription, Payment, Discount, StockItem
- Many-to-many: Camp ↔ Doctor (via doctorIds)

**UI-only (New Camp wizard):** organizerName, organizerPhone, organizerEmail, planDate, state, district, mandal, city, address, pinCode, selectedVolunteers. Backend may store organizer on Camp or separate Organizer entity.

---

## 2.3 Doctor

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, min 1, max 255 | |
| specialization | string | required, max 100 | From fixed list in UI |
| phone | string | required, pattern: 10 digits (strip non-digits) | |
| email | string | optional, email format, max 255 | |
| avatar | string (URL) | optional | Legacy |
| photoUrl | string (URL) | optional, max 2048 | |
| isActive | boolean | optional, default true | Edit Doctor only |

**Relationships:**
- Many-to-many: Doctor ↔ Camp (assigned camps)
- One-to-many: Doctor → Consultation, Prescription (as doctorId)

**Specializations (UI):** General Physician, Cardiologist, Neurologist, Orthopedist, Pediatrician, Dermatologist, Ophthalmologist, ENT Specialist, Psychiatrist, Gynecologist.

---

## 2.4 Patient

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| patientId | string | required, unique per camp | MR number, e.g. BPTL-OCT0718-7225 |
| campId | string (UUID) | required, FK Camp | |
| name | string | required, min 1, max 100 | |
| surname | string | optional, max 100 | |
| fatherName | string | required in UI, max 100 | |
| age | number (integer) | required, min 0, max 150 | |
| gender | enum | required, Male \| Female \| Other | |
| phone | string | optional, max 20 | |
| address | string | optional, max 500 | Combined street + locality |
| village | string | required, max 100 | |
| district | string | optional, max 100 | |
| state | string | optional, max 100 | |
| photoUrl | string (URL) | optional, max 2048 | |
| createdAt | string (ISO 8601) | required | |

**Relationships:**
- Many-to-one: Patient → Camp
- One-to-many: Patient → SOAPNote, Consultation, Prescription, Payment, Discount

**UI form also has:** maritalStatus (Single/Married/Widowed/Divorced), state/district/mandal/village/street. Map street + village into address/village/district/state as needed.

---

## 2.5 SOAPNote

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| patientId | string (UUID) | required, FK Patient | |
| campId | string (UUID) | required, FK Camp | |
| createdBy | string (UUID) | required, FK User | Staff who created |
| subjective | string | optional, max 10000 | |
| objective | object | optional | See below |
| assessment | string | optional, max 5000 | |
| plan | string | optional, max 5000 | |
| status | enum | required, pending \| with_doctor \| completed | |
| createdAt | string (ISO 8601) | required | |

**objective:**
- weight: number, optional
- bp: string, optional (e.g. "120/80")
- pulse: number, optional
- temp: number, optional
- spo2: number, optional
- notes: string, optional

**Relationships:**
- Many-to-one: SOAPNote → Patient, Camp, User (createdBy)
- One-to-one or one-to-many: SOAPNote → Consultation (consultation references soapNoteId)

---

## 2.6 Consultation

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| patientId | string (UUID) | required, FK Patient | |
| doctorId | string (UUID) | required, FK Doctor | |
| campId | string (UUID) | required, FK Camp | |
| soapNoteId | string (UUID) | required, FK SOAPNote | |
| chiefComplaint | string | optional, max 2000 | |
| medicalHistory | string | optional, max 5000 | |
| diagnosis | string[] | optional, each max 500 | |
| labTests | string[] | optional | |
| suggestedOperations | string[] | optional | |
| notes | string | optional, max 5000 | |
| prescriptionId | string (UUID) | optional, FK Prescription | Set when prescription created |
| status | enum | required, in_progress \| completed | |
| createdAt | string (ISO 8601) | required | |

**Relationships:**
- Many-to-one: Consultation → Patient, Doctor, Camp, SOAPNote
- One-to-one: Consultation → Prescription (when completed)

---

## 2.7 Medicine

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, max 255 | |
| code | string | required, max 50 | |
| category | string | required, max 100 | e.g. Gastric, Analgesic |
| unitPrice | number | required, >= 0, 2 decimals | |

**Relationships:** One-to-many: Medicine → PrescriptionItem, StockItem. (Medicine is master data.)

---

## 2.8 PrescriptionItem (embedded in Prescription)

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| medicineId | string (UUID) | required, FK Medicine | |
| medicineName | string | required, max 255 | Denormalized |
| quantity | number (integer) | required, min 1 | (M+A+N)*days |
| morning | number (integer) | required, 0–3 | |
| afternoon | number (integer) | required, 0–3 | |
| night | number (integer) | required, 0–3 | |
| days | number (integer) | required, min 1 | |
| notes | string | optional, max 500 | Per-item instructions (UI) |

**Validation (backend):** quantity = (morning + afternoon + night) * days.

---

## 2.9 Prescription

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| consultationId | string (UUID) | required, FK Consultation | |
| patientId | string (UUID) | required, FK Patient | |
| doctorId | string (UUID) | required, FK Doctor | |
| campId | string (UUID) | required, FK Camp | |
| items | PrescriptionItem[] | required, min 1 when status completed | |
| status | enum | required, pending \| dispensed \| partial | |
| createdAt | string (ISO 8601) | required | |

**Relationships:**
- Many-to-one: Prescription → Consultation, Patient, Doctor, Camp
- One-to-many: Prescription → Payment (after dispense)

---

## 2.10 Discount

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, max 255 | |
| type | enum | required, percentage \| fixed | |
| value | number | required, >= 0; if percentage, 0–100 | |
| campId | string (UUID) | required, FK Camp | |
| patientId | string (UUID) | required, FK Patient | |
| prescriptionId | string (UUID) | optional, FK Prescription | |
| medicineIds | string[] | optional | Apply to specific items |
| appliedBy | string (UUID) | required, FK Doctor | |
| reason | string | optional, max 500 | |
| createdAt | string (ISO 8601) | required | |

**Relationships:** Many-to-one: Discount → Camp, Patient, Doctor, Prescription.

---

## 2.11 Payment

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| prescriptionId | string (UUID) | required, FK Prescription | |
| patientId | string (UUID) | required, FK Patient | |
| campId | string (UUID) | required, FK Camp | |
| totalAmount | number | required, >= 0, 2 decimals | |
| paidAmount | number | required, >= 0, <= totalAmount, 2 decimals | |
| pendingAmount | number | required, >= 0, totalAmount - paidAmount | |
| discountId | string (UUID) | optional, FK Discount | |
| discountAmount | number | optional, >= 0 | |
| status | enum | required, full \| partial \| pending | full: pendingAmount=0 |
| createdAt | string (ISO 8601) | required | |

**Relationships:** Many-to-one: Payment → Prescription, Patient, Camp, Discount.

---

## 2.12 Supplier

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| name | string | required, max 255 | |
| contact | string | required, max 50 | Phone or email |
| address | string | optional, max 500 | |

**Relationships:** One-to-many: Supplier → StockItem.

---

## 2.13 StockItem

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| id | string (UUID) | required | PK |
| medicineId | string (UUID) | required, FK Medicine | |
| campId | string (UUID) | required, FK Camp | |
| quantity | number (integer) | required, >= 0 | |
| batchNumber | string | required, max 100 | |
| expiryDate | string (date) | required, ISO date | |
| purchaseDate | string (date) | required, ISO date | |
| supplierId | string (UUID) | required, FK Supplier | |

**Relationships:** Many-to-one: StockItem → Medicine, Camp, Supplier.

**Unique constraint:** (medicineId, campId, batchNumber) or per-batch rows; backend defines policy.

---

## 2.14 CampStats (aggregate, not stored entity)

| Field | Type | Notes |
|-------|------|--------|
| totalPatients | number | Count of patients for camp |
| patientsAtDoctor | number | Count in “at doctor” status (if tracked) |
| patientsAtPharmacy | number | Count at pharmacy |
| patientsAtCashier | number | Count at cashier |
| exitedPatients | number | Completed |
| totalCollection | number | Sum of paidAmount for camp |

Computed from Patient + Payment (and optionally workflow status).

---

## 2.15 Volunteer (UI-only in New Camp)

Not in current types. Options: (A) Add Volunteer entity (id, name, phone, etc.) and camp.staffIds or camp_volunteers join; (B) Store as JSON or array of { name, phone } on Camp. Blueprint assumes optional **Volunteer** entity: id, name, phone, email (optional), campId (optional for assignment).

---

## 2.16 UserSettings (optional)

If settings are not on User: id, userId, theme, language, compactMode, emailAlerts, smsAlerts, pushNotifications, dailyDigest, twoFactor, sessionTimeoutMinutes. One-to-one with User.

---

# Part 3: Entity Relationships (Summary)

- **User** – standalone; optional UserSettings.
- **Camp** ↔ **Doctor** (many-to-many via doctorIds or join table).
- **Camp** → **Patient**, **SOAPNote**, **Consultation**, **Prescription**, **Payment**, **Discount**, **StockItem** (one-to-many).
- **Patient** → **SOAPNote**, **Consultation**, **Prescription**, **Payment**, **Discount** (one-to-many).
- **SOAPNote** → **Consultation** (one-to-one or one per SOAP when multiple consultations).
- **Consultation** → **Prescription** (one-to-one).
- **Prescription** → **Payment** (one-to-many if partial payments).
- **Medicine** → **PrescriptionItem** (embedded in Prescription), **StockItem** (one-to-many).
- **Supplier** → **StockItem** (one-to-many).
- **Doctor** → **Consultation**, **Prescription**, **Discount** (one-to-many).

---

# Part 4: API List

For each endpoint: **Method**, **Path**, **Request body (example JSON)**, **Response body (example JSON)**, **Validation**, **CRUD**, **Pagination/Filtering/Search**.

---

## 4.1 Auth

### POST /api/auth/login  
**Purpose:** Authenticate and return session/token and user.  
**CRUD:** N/A (auth).

**Request:**
```json
{
  "emailOrMobile": "venkatesh@srinifoundation.org",
  "password": "********"
}
```

**Validation:**
- emailOrMobile: required, string (email or 10-digit phone).
- password: required, string (min length per policy, e.g. 8).

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-02-01T12:00:00Z",
  "user": {
    "id": "u-1",
    "name": "Venkatesh Dandigam",
    "email": "venkatesh@srinifoundation.org",
    "phone": "9234644748",
    "role": "camp_admin",
    "avatar": null
  }
}
```

**Optional:** POST /api/auth/logout, POST /api/auth/refresh, POST /api/auth/forgot-password.

---

### GET /api/auth/me  
**Purpose:** Current user (for profile/header).  
**CRUD:** Read.

**Response (200):** Same `user` object as login.

---

## 4.2 Camps

### GET /api/camps  
**Purpose:** List camps (Dashboard, Camps list).  
**CRUD:** Read.  
**Query:** `status` (draft|active|closed), `search` (name/village/district), `page`, `size`, `sort`.

**Response (200):**
```json
{
  "content": [
    {
      "id": "c-1",
      "name": "Bapatla Camp",
      "location": "Bapatla",
      "village": "Bapatla",
      "district": "Guntur",
      "startDate": "2025-01-15",
      "endDate": "2025-01-20",
      "status": "active",
      "description": "Medical camp for rural villagers",
      "doctorIds": ["d-1", "d-2"],
      "pharmacyIds": ["ph-1"],
      "staffIds": ["s-1", "s-2"]
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### GET /api/camps/:id  
**Purpose:** Single camp (Edit Camp, ID cards).  
**CRUD:** Read.

**Response (200):** Single Camp object (same shape as list item).

**Response (404):** `{ "code": "NOT_FOUND", "message": "Camp not found" }`

---

### POST /api/camps  
**Purpose:** Create camp (New Camp wizard).  
**CRUD:** Create.

**Request:**
```json
{
  "name": "New Health Camp",
  "location": "City Hall",
  "village": "Bapatla",
  "district": "Guntur",
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "status": "draft",
  "description": "Weekly checkup",
  "doctorIds": ["d-1", "d-2"],
  "staffIds": ["s-1"],
  "organizerName": "John Doe",
  "organizerPhone": "9876543210",
  "organizerEmail": "john@example.com",
  "planDate": "2025-01-20",
  "state": "Andhra Pradesh",
  "mandal": "Bapatla",
  "city": "Bapatla",
  "address": "Full address here",
  "pinCode": "522101"
}
```

**Validation:** name, village, district, startDate, endDate required; endDate >= startDate; doctorIds/staffIds valid IDs if present.

**Response (201):** Full Camp object with `id`, `createdAt` if stored.

---

### PATCH /api/camps/:id  
**Purpose:** Update camp (Edit Camp).  
**CRUD:** Update.

**Request:**
```json
{
  "name": "Bapatla Camp Updated",
  "village": "Bapatla",
  "district": "Guntur",
  "location": "New address",
  "startDate": "2025-01-15",
  "endDate": "2025-01-22",
  "description": "Updated description",
  "status": "active",
  "doctorIds": ["d-1", "d-2", "d-3"]
}
```

**Validation:** Same as create for sent fields; endDate >= startDate.

**Response (200):** Full updated Camp.

---

### GET /api/camps/:id/stats  
**Purpose:** Dashboard stats for a camp.  
**CRUD:** Read (aggregate).

**Response (200):**
```json
{
  "totalPatients": 1012,
  "patientsAtDoctor": 5,
  "patientsAtPharmacy": 6,
  "patientsAtCashier": 2,
  "exitedPatients": 56,
  "totalCollection": 45000
}
```

---

## 4.3 Patients

### GET /api/patients  
**Purpose:** List patients (Patients list, search).  
**CRUD:** Read.  
**Query:** `campId`, `search` (MR number / name), `page`, `size`, `sort`.

**Response (200):**
```json
{
  "content": [
    {
      "id": "p-1",
      "patientId": "BPTL-OCT0718-7225",
      "campId": "c-1",
      "name": "Rama",
      "surname": "Krishna",
      "fatherName": "Venkat",
      "age": 55,
      "gender": "Male",
      "phone": "9123456789",
      "address": "Main Street",
      "village": "Bapatla",
      "district": "Guntur",
      "state": "Andhra Pradesh",
      "photoUrl": "https://...",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "totalElements": 6,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### GET /api/patients/:id  
**Purpose:** Single patient.  
**CRUD:** Read.

**Response (200):** Single Patient object.

---

### GET /api/patients/:id/history  
**Purpose:** Patient history (SOAP, consultations, prescriptions, payments) for Patient History screen.  
**CRUD:** Read.

**Response (200):**
```json
{
  "patient": { /* Patient */ },
  "soapNotes": [ /* SOAPNote[] */ ],
  "consultations": [ /* Consultation[] */ ],
  "prescriptions": [ /* Prescription[] */ ],
  "payments": [ /* Payment[] */ ]
}
```
Alternatively: separate GETs for each resource filtered by patientId.

---

### POST /api/patients  
**Purpose:** Register patient (New Patient).  
**CRUD:** Create.

**Request:**
```json
{
  "campId": "c-1",
  "name": "Rama",
  "surname": "Krishna",
  "fatherName": "Venkat",
  "gender": "Male",
  "age": 55,
  "phone": "9123456789",
  "address": "Main Street",
  "village": "Bapatla",
  "district": "Guntur",
  "state": "AP",
  "maritalStatus": "Married",
  "photoUrl": "https://storage/..."
}
```

**Validation:** name, fatherName, gender, age, campId required; age 0–150; gender enum; campId exists. Backend generates `patientId` (e.g. camp prefix + sequence).

**Response (201):** Full Patient with `id`, `patientId`, `createdAt`.

---

## 4.4 Doctors

### GET /api/doctors  
**Purpose:** List doctors (Doctors list, camp assignment dropdowns).  
**CRUD:** Read.  
**Query:** `campId` (assigned to camp), `search` (name/specialization), `page`, `size`, `active` (boolean).

**Response (200):** Paginated list of Doctor objects.

---

### GET /api/doctors/:id  
**Purpose:** Single doctor (Edit Doctor).  
**CRUD:** Read.

**Response (200):** Doctor object; optionally assigned camp IDs or full Camp[].

---

### POST /api/doctors  
**Purpose:** Add doctor (New Doctor).  
**CRUD:** Create.

**Request:**
```json
{
  "name": "Dr. Ramesh Naidu",
  "specialization": "Neurologist",
  "phone": "9876543210",
  "email": "ramesh@example.org",
  "photoUrl": "https://...",
  "campIds": ["c-1", "c-2"]
}
```

**Validation:** name, specialization, phone required; phone 10 digits; email format if present; specialization from allowed list (or free text).

**Response (201):** Full Doctor with `id`.

---

### PATCH /api/doctors/:id  
**Purpose:** Update doctor (Edit Doctor).  
**CRUD:** Update.

**Request:**
```json
{
  "name": "Dr. Ramesh Naidu",
  "specialization": "Neurologist",
  "phone": "9876543210",
  "email": "ramesh@example.org",
  "photoUrl": "https://...",
  "isActive": true,
  "campIds": ["c-1", "c-2", "c-3"]
}
```

**Validation:** Same as create.

**Response (200):** Full updated Doctor.

---

## 4.5 SOAP Notes

### GET /api/soap-notes  
**Purpose:** List SOAP notes (SOAP list, Consultations “Awaiting”).  
**CRUD:** Read.  
**Query:** `campId`, `patientId`, `status` (pending|with_doctor|completed), `search` (patient name/MR), `page`, `size`.

**Response (200):** Paginated list of SOAPNote with optional patient summary (name, patientId).

---

### GET /api/soap-notes/:id  
**Purpose:** Single SOAP note (View SOAP).  
**CRUD:** Read.

**Response (200):** SOAPNote object; optionally include patient.

---

### POST /api/soap-notes  
**Purpose:** Create SOAP (draft or send to doctor).  
**CRUD:** Create.

**Request:**
```json
{
  "patientId": "p-1",
  "campId": "c-1",
  "subjective": "Patient complains of chest pain...",
  "objective": {
    "weight": 72,
    "bp": "140/90",
    "pulse": 88,
    "temp": 98.6,
    "spo2": 96,
    "notes": "Mild wheezing"
  },
  "assessment": "Possible hypertension",
  "plan": "Refer to doctor for ECG",
  "status": "pending"
}
```

**Validation:** patientId, campId required; patient belongs to camp; createdBy from token. status default "pending"; "with_doctor" when sent.

**Response (201):** Full SOAPNote with `id`, `createdBy`, `createdAt`.

---

### PATCH /api/soap-notes/:id  
**Purpose:** Update SOAP (draft, or send to doctor).  
**CRUD:** Update.

**Request:** Same shape as POST (partial allowed). Optional `status` transition to "with_doctor".

**Response (200):** Full updated SOAPNote.

---

## 4.6 Consultations

### GET /api/consultations  
**Purpose:** List consultations (Consultations list, reports).  
**CRUD:** Read.  
**Query:** `campId`, `patientId`, `doctorId`, `status` (in_progress|completed), `search` (patient name/MR), `page`, `size`.

**Response (200):** Paginated list of Consultation; optionally expand patient, doctor, soapNote summary.

---

### GET /api/consultations/:id  
**Purpose:** Single consultation.  
**CRUD:** Read.

**Response (200):** Consultation with prescription if present.

---

### POST /api/consultations  
**Purpose:** Create consultation (from SOAP) and optionally create prescription (New Consultation, Doctor Consultation).  
**CRUD:** Create.

**Request:**
```json
{
  "patientId": "p-1",
  "doctorId": "d-1",
  "campId": "c-1",
  "soapNoteId": "soap-1",
  "chiefComplaint": "Chest pain",
  "medicalHistory": "Hypertension for 5 years",
  "diagnosis": ["Hypertensive Heart Disease", "Mild COPD"],
  "labTests": ["ECG", "Chest X-Ray"],
  "notes": "Follow-up in 2 weeks",
  "status": "in_progress",
  "prescription": {
    "items": [
      {
        "medicineId": "m-1",
        "medicineName": "T.RABI 20 MG",
        "quantity": 10,
        "morning": 1,
        "afternoon": 0,
        "night": 0,
        "days": 10,
        "notes": "Before breakfast"
      }
    ]
  }
}
```

**Validation:** patientId, doctorId, campId, soapNoteId required; at least one prescription item when status "completed"; items: medicineId, quantity, morning/afternoon/night 0–3, days >= 1; quantity = (M+A+N)*days.

**Response (201):** Consultation with `id`, `prescriptionId` (if prescription created), `createdAt`. Include created Prescription in body or return in separate GET.

---

### PATCH /api/consultations/:id  
**Purpose:** Update consultation (draft save, complete & send to pharmacy).  
**CRUD:** Update.

**Request:**
```json
{
  "chiefComplaint": "...",
  "diagnosis": ["..."],
  "prescription": { "items": [ ... ] },
  "status": "completed"
}
```

**Validation:** On status=completed, prescription must have at least one item; backend creates/updates Prescription and sets consultation.prescriptionId.

**Response (200):** Full updated Consultation and Prescription if updated.

---

## 4.7 Prescriptions

### GET /api/prescriptions  
**Purpose:** List prescriptions (Pharmacy dashboard).  
**CRUD:** Read.  
**Query:** `campId`, `status` (pending|dispensed|partial), `patientId`, `page`, `size`.

**Response (200):** Paginated list of Prescription with patient, doctor summary.

---

### GET /api/prescriptions/:id  
**Purpose:** Single prescription (Dispense screen).  
**CRUD:** Read.

**Response (200):** Prescription with items, patient, doctor; for each item optionally current stock (from StockItem).

---

### PATCH /api/prescriptions/:id/dispense  
**Purpose:** Mark dispensed, record dispensed quantities, create Payment (Dispense Medicine).  
**CRUD:** Update + Create (Payment).

**Request:**
```json
{
  "dispensedItems": [
    { "medicineId": "m-1", "quantity": 10 },
    { "medicineId": "m-2", "quantity": 20 }
  ],
  "payment": {
    "paymentType": "full",
    "paidAmount": 250,
    "totalAmount": 250,
    "pendingAmount": 0,
    "status": "full"
  }
}
```

**Validation:** dispensedItems: quantity <= min(prescribed, available stock); payment: paidAmount + pendingAmount = totalAmount; totalAmount computed from dispensedItems × unitPrice (minus discount if applied). Backend: decrement StockItem quantities, create Payment, set prescription.status to dispensed (or partial if not all items dispensed).

**Response (200):**
```json
{
  "prescription": { /* updated Prescription */ },
  "payment": { /* created Payment */ }
}
```

---

## 4.8 Payments

### GET /api/payments  
**Purpose:** List payments (reports, patient history).  
**CRUD:** Read.  
**Query:** `campId`, `patientId`, `prescriptionId`, `page`, `size`.

**Response (200):** Paginated list of Payment.

---

## 4.9 Medicines

### GET /api/medicines  
**Purpose:** List medicines (consultation prescription, stock, reports).  
**CRUD:** Read.  
**Query:** `search` (name/category), `category`, `page`, `size`.

**Response (200):** Paginated list of Medicine (master data; no create from UI).

---

## 4.10 Stock

### GET /api/stock  
**Purpose:** Inventory (Stock Management).  
**CRUD:** Read.  
**Query:** `campId`, `medicineId`, `lowStockOnly` (boolean, e.g. quantity < 50), `page`, `size`.

**Response (200):** List of StockItem with medicine name/code/category, supplier name; or aggregate by medicineId per camp.

---

### POST /api/stock  
**Purpose:** Add stock (Add Stock dialog).  
**CRUD:** Create.

**Request:**
```json
{
  "medicineId": "m-1",
  "campId": "c-1",
  "quantity": 100,
  "batchNumber": "BT001",
  "expiryDate": "2026-06-30",
  "purchaseDate": "2025-01-10",
  "supplierId": "sup-1"
}
```

**Validation:** All required; quantity >= 0; expiryDate > today (or allow past for corrections).

**Response (201):** StockItem with `id`.

---

### GET /api/suppliers  
**Purpose:** List suppliers.  
**CRUD:** Read.

**Response (200):** List of Supplier.

---

### POST /api/suppliers  
**Purpose:** Add supplier.  
**CRUD:** Create.

**Request:**
```json
{
  "name": "MedPharma Distributors",
  "contact": "9876543200",
  "address": "Industrial Area, Guntur"
}
```

**Validation:** name, contact required.

**Response (201):** Supplier with `id`.

---

### POST /api/purchase-orders (optional)  
**Purpose:** Create purchase order (Stock UI).  
**CRUD:** Create.  
**Request:** supplierId, orderDate, items: [{ medicineId, quantity }].  
**Response (201):** PurchaseOrder entity if modeled; otherwise 201 with minimal body.

---

## 4.11 Discounts

### GET /api/discounts  
**Purpose:** List discounts (reports).  
**CRUD:** Read.  
**Query:** `campId`, `patientId`, `page`, `size`.

**Response (200):** Paginated list of Discount.

---

### POST /api/discounts (optional)  
**Purpose:** Apply discount (if UI adds discount at dispense).  
**CRUD:** Create.  
**Request:** name, type, value, campId, patientId, prescriptionId?, medicineIds?, appliedBy, reason.  
**Validation:** value 0–100 for percentage; appliedBy = doctorId.

---

## 4.12 Reports

### GET /api/reports/overview  
**Purpose:** Reports hub stats.  
**CRUD:** Read.  
**Query:** `campId` (optional, for single camp).

**Response (200):**
```json
{
  "totalCamps": 3,
  "activeCamps": 1,
  "totalPatients": 1012,
  "totalConsultations": 500,
  "totalPrescriptions": 480,
  "totalCollection": 45000,
  "pendingPayments": 5000,
  "totalDiscounts": 18,
  "doctorsCount": 3
}
```

---

### GET /api/reports/camps  
**Purpose:** Camp-wise report.  
**Query:** `campId` (optional).

**Response (200):** List of { campId, campName, patientCount, consultationCount, prescriptionsCount, totalCollection, discountsCount, doctors[] } or single object if campId given.

---

### GET /api/reports/patients  
**Purpose:** Patient-wise report.  
**Query:** `search`, `campId`, `page`, `size`.

**Response (200):** List of { patient, consultationsCount, prescriptionsCount, totalPaid, discountsCount, campsAttended[] }.

---

### GET /api/reports/medicines  
**Purpose:** Medicine-wise usage.  
**Query:** `medicineId`, `campId`, `page`, `size`.

**Response (200):** List of { medicine, prescriptionsCount, totalQuantity, patientsCount, doctorsCount, camps[], discountsApplied }.

---

### GET /api/reports/discounts  
**Purpose:** Discount summary.  
**Query:** `campId`, `from`, `to`, `page`, `size`.

**Response (200):** List of Discount with totals; uniquePatients, uniqueCamps counts.

---

### GET /api/reports/doctors  
**Purpose:** Doctor-wise consultations and prescriptions.  
**Query:** `doctorId`, `campId`, `page`, `size`.

**Response (200):** List of { doctor, consultationsCount, prescriptionsCount, patientsCount, camps[], medicinesPrescribed[] }.

---

## 4.13 User & Profile

### GET /api/users/me  
**Purpose:** Current user (profile, header).  
**CRUD:** Read.  
**Response (200):** User object (id, name, email, phone, role, avatar).

---

### PATCH /api/users/me  
**Purpose:** Update profile (Profile screen).  
**CRUD:** Update.

**Request:**
```json
{
  "name": "Venkatesh Dandigam",
  "email": "venkatesh@example.org",
  "phone": "+91 98765 43210",
  "location": "Bapatla, Andhra Pradesh",
  "photoUrl": "https://..."
}
```

**Validation:** name required; email format; phone optional.

**Response (200):** Full updated User.

---

### POST /api/users/me/photo (or multipart upload)  
**Purpose:** Upload profile photo.  
**Request:** multipart/form-data file.  
**Response (200):** { "photoUrl": "https://..." }. Then PATCH users/me with photoUrl.

---

## 4.14 Settings

### GET /api/users/me/settings  
**Purpose:** Get user app settings.  
**CRUD:** Read.

**Response (200):**
```json
{
  "notifications": {
    "emailAlerts": true,
    "smsAlerts": false,
    "pushNotifications": true,
    "dailyDigest": false
  },
  "appearance": {
    "theme": "light",
    "compactMode": false,
    "language": "en"
  },
  "security": {
    "twoFactor": false,
    "sessionTimeout": "30"
  }
}
```

---

### PATCH /api/users/me/settings  
**Purpose:** Save settings (Settings screen).  
**CRUD:** Update.

**Request:**
```json
{
  "notifications": { "emailAlerts": true, "smsAlerts": false, "pushNotifications": true, "dailyDigest": false },
  "appearance": { "theme": "light", "compactMode": false, "language": "en" },
  "security": { "twoFactor": false, "sessionTimeout": "30" }
}
```

**Response (200):** Full settings object.

---

## 4.15 ID Cards

### GET /api/camps/:id/doctors  
**Purpose:** Doctors (and optionally staff) for a camp for ID card print.  
**CRUD:** Read.  
**Response (200):** List of Doctor (and optionally staff) with name, phone, photoUrl, department. Can reuse GET /api/doctors?campId=:id.

---

## 4.16 File Upload (Photos)

### POST /api/upload  
**Purpose:** Upload patient/doctor/profile photo.  
**Request:** multipart/form-data; field name e.g. `file`; optional `type`: patient | doctor | profile.  
**Response (200):** `{ "url": "https://storage/..." }`.  
**Validation:** Max size (e.g. 5MB), allowed MIME types (image/jpeg, image/png).

---

# Part 5: Missing Backend Assumptions & Ambiguities

1. **Auth:** No token/session in UI. Backend must define: JWT or session cookie, expiry, refresh, logout, and protected routes (401/403).
2. **Camp context:** UI uses hardcoded "Bapatla". Backend should return user’s default camp or list of allowed camps; filter list APIs by user role/camp access.
3. **Patient ID (MR):** Backend must generate `patientId` per camp (e.g. PREFIX-SEQ or PREFIX-DDMMYY-SEQ). Uniqueness: (campId, patientId).
4. **Photo upload:** UI has PhotoUpload but no upload API. Backend: POST /api/upload or per-entity upload; store URL in Patient/Doctor/User; consider S3/MinIO + CDN.
5. **Volunteers:** New Camp has volunteers; types have staffIds. Backend: either Volunteer entity + assignment to camp, or store as JSON/list on Camp.
6. **Organizer:** New Camp has organizerName/Phone/Email. Store on Camp (optional columns) or separate Organizer table linked to Camp.
7. **Dispense vs stock:** Backend must enforce dispensedQty <= available stock; use transaction to decrement StockItem and create Payment atomically.
8. **Discount application:** UI shows discounts in reports but not in Dispense flow. Backend may apply discount at dispense (discountId, discountAmount) and set Payment.discountId, discountAmount; totalAmount may be post-discount.
9. **Pagination:** All list endpoints should support `page`, `size` (default e.g. 20); return `totalElements`, `totalPages` for UI pagination.
10. **Soft delete / status:** No delete in UI. Backend may soft-delete (deletedAt) or use status (e.g. inactive) for Camp, Doctor, Patient; list APIs filter out inactive.
11. **Permissions:** Enforce by role (super_admin, camp_admin, doctor, pharmacy, staff): e.g. camp_admin can CRUD camps/patients for their camps; doctor can read/update consultations; pharmacy can dispense. Document permission matrix.
12. **Lab tests:** Consultation has labTests as string[]. If structured results needed later, add LabResult entity (consultationId, testName, date, value, unit).
13. **Purchase orders:** Stock UI has “Purchase order” but no PO entity. Backend can add PurchaseOrder (supplierId, orderDate, status) and PurchaseOrderLine (medicineId, quantity) and link receipt to StockItem creation.
14. **Audit:** Who created/updated and when: add createdBy, createdAt, updatedBy, updatedAt on all mutable entities; optionally audit log table (Mongo or PostgreSQL) for sensitive actions (dispense, payment, patient create).
15. **Idempotency:** For POST payment/dispense, consider idempotency key header to avoid duplicate charges.
16. **Localization:** Settings has language (en/hi/te). Backend stores preference; i18n on frontend or API can return translated labels if needed.

---

# Part 6: Notes for Backend Design

## 6.1 Spring Boot

- **REST:** Use `@RestController`, `@RequestMapping("/api")`, DTOs for request/response; entity models separate from API.
- **Validation:** `@Valid` + Bean Validation (JSR 380): `@NotNull`, `@Size`, `@Email`, `@Pattern`, `@Min`/`@Max`, custom validators for business rules (e.g. endDate >= startDate).
- **Security:** Spring Security; JWT filter or session-based; role-based `@PreAuthorize` on endpoints.
- **Exception handling:** `@ControllerAdvice`; map validation/business errors to 400/404/409 with consistent JSON body `{ "code": "...", "message": "...", "errors": [...] }`.
- **Pagination:** Spring Data `Pageable`; return `Page<DTO>` with content, totalElements, totalPages, size, number.

## 6.2 PostgreSQL

- **Use for:** Users, Camps, Doctors, Patients, SOAPNotes, Consultations, Prescriptions, Payments, Discounts, Medicines, Suppliers, StockItems (relational data).
- **IDs:** UUID primary keys (`gen_random_uuid()` or app-generated).
- **patientId:** Unique with campId: `UNIQUE(camp_id, patient_id)`; consider sequence per camp for MR generation.
- **Indexes:** campId, patientId, doctorId, status, createdAt on major tables; composite for list filters (e.g. camp_id, status).
- **Transactions:** Use `@Transactional` for dispense (update StockItem, create Payment, update Prescription) and for consultation+prescription create.

## 6.3 MongoDB (optional)

- **Use for:** Audit logs (who did what, when, payload snapshot); optional document store for SOAP objective (nested object) or consultation history if you want flexible schema.
- **If relational only:** Keep SOAP objective as JSONB in PostgreSQL instead of MongoDB.
- **Reports:** Can aggregate in PostgreSQL with GROUP BY and optional materialized views; or sync to MongoDB for heavy report queries if needed.

## 6.4 File Storage

- **Photos:** Store in S3/MinIO/OSS; save only URL in DB. Presign URLs for upload; serve via CDN or public bucket with cache headers.

## 6.5 API Versioning

- Prefix paths with `/api/v1` if you expect breaking changes; UI can then target v1.

## 6.6 Rate Limiting & CORS

- Rate limit login and upload endpoints; CORS allow frontend origin only.

---

---

# Part 7: API Quick Reference (Method + Path + CRUD)

| Method | Path | CRUD | Purpose |
|--------|------|------|---------|
| POST | /api/auth/login | – | Login |
| GET | /api/auth/me | Read | Current user |
| GET | /api/camps | Read | List camps |
| GET | /api/camps/:id | Read | Get camp |
| POST | /api/camps | Create | Create camp |
| PATCH | /api/camps/:id | Update | Update camp |
| GET | /api/camps/:id/stats | Read | Camp stats |
| GET | /api/patients | Read | List patients |
| GET | /api/patients/:id | Read | Get patient |
| GET | /api/patients/:id/history | Read | Patient history |
| POST | /api/patients | Create | Register patient |
| GET | /api/doctors | Read | List doctors |
| GET | /api/doctors/:id | Read | Get doctor |
| POST | /api/doctors | Create | Add doctor |
| PATCH | /api/doctors/:id | Update | Update doctor |
| GET | /api/soap-notes | Read | List SOAP notes |
| GET | /api/soap-notes/:id | Read | Get SOAP note |
| POST | /api/soap-notes | Create | Create SOAP note |
| PATCH | /api/soap-notes/:id | Update | Update SOAP note |
| GET | /api/consultations | Read | List consultations |
| GET | /api/consultations/:id | Read | Get consultation |
| POST | /api/consultations | Create | Create consultation |
| PATCH | /api/consultations/:id | Update | Update consultation |
| GET | /api/prescriptions | Read | List prescriptions |
| GET | /api/prescriptions/:id | Read | Get prescription |
| PATCH | /api/prescriptions/:id/dispense | Update | Dispense + create payment |
| GET | /api/payments | Read | List payments |
| GET | /api/medicines | Read | List medicines |
| GET | /api/stock | Read | List stock |
| POST | /api/stock | Create | Add stock |
| GET | /api/suppliers | Read | List suppliers |
| POST | /api/suppliers | Create | Add supplier |
| GET | /api/discounts | Read | List discounts |
| GET | /api/reports/overview | Read | Reports overview |
| GET | /api/reports/camps | Read | Camp reports |
| GET | /api/reports/patients | Read | Patient reports |
| GET | /api/reports/medicines | Read | Medicine reports |
| GET | /api/reports/discounts | Read | Discount reports |
| GET | /api/reports/doctors | Read | Doctor reports |
| GET | /api/users/me | Read | Current user |
| PATCH | /api/users/me | Update | Update profile |
| GET | /api/users/me/settings | Read | Get settings |
| PATCH | /api/users/me/settings | Update | Save settings |
| GET | /api/camps/:id/doctors | Read | Doctors for camp (ID cards) |
| POST | /api/upload | – | Upload photo |

---

*This blueprint is derived from the Village Health Hub UI codebase. Adjust fields, validation, and endpoints as needed for your backend implementation.*
